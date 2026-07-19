# Profile Backend Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect `ProfileCard.tsx`'s change-password, photo-upload, and profile-edit UI (currently mocked) to real backend endpoints in `atlas_food_backend`, adding the missing DB columns and API routes.

**Architecture:** Three new endpoints under the existing `auth` domain (Go/Gin/GORM) — `PATCH /auth/me`, `PUT /auth/me/password`, `POST /auth/me/photo` — all protected by the existing `middleware.JWTAuth()`, operating only on the authenticated user's own row. Frontend adds matching calls to `internal/domain/auth/services/authService.ts` (the fetch-based client already used for login/register/getProfile) and wires them into `ProfileCard.tsx`, replacing the mock behavior.

**Tech Stack:** Go 1.21, Gin, GORM (MySQL), bcrypt (`golang.org/x/crypto`) on the backend; Next.js/TypeScript, Zustand, fetch-based `apiClient` on the frontend.

## Global Constraints

- Backend response envelope stays `{status, data, error:{code,message}}` via `utils.SuccessResponse`/`utils.ErrorResponse`/`utils.ValidationErrorResponse` — do not invent a new shape.
- All three new routes require `middleware.JWTAuth()`; user identity comes only from the JWT context (`c.Get("userID")`), never from a request body/param — a user can only ever modify their own row.
- New password: `min=8` (matches register). Photo: jpg/jpeg/png/webp, max 5MB (matches the frontend modal copy, intentionally different from the existing generic `/upload` endpoint's 10MB).
- No new env vars — derive any needed origin from `NEXT_PUBLIC_API_URL`, which already exists.
- No Go test suite exists anywhere in `internal/domain/auth` today — this plan does not introduce one; verification is `go build`/`go vet` plus manual `curl` smoke tests, matching the codebase's current convention. Frontend verification is `npx tsc --noEmit` + `npm run build`.
- Removing a profile photo and changing email are explicitly out of scope (see spec `docs/superpowers/specs/2026-07-19-profile-backend-integration-design.md`).

---

## Task 1: Backend — migration + model + DTOs

**Files:**
- Create: `atlas_food_backend/migrations/009_add_profile_fields_to_users.sql`
- Modify: `atlas_food_backend/internal/domain/auth/model.go`
- Modify: `atlas_food_backend/internal/domain/auth/dto.go`

**Interfaces:**
- Produces: `User.Phone *string`, `User.Gender *string`, `User.BirthDate *time.Time`, `User.PhotoURL *string`; `ProfileResponse` fields `Phone`, `Gender`, `BirthDate`, `PhotoURL` (all `*string`, `omitempty`); new DTOs `UpdateProfileRequest{Name, Phone, Gender, BirthDate}` and `ChangePasswordRequest{CurrentPassword, NewPassword}` — these exact names/types are consumed by Task 2 and Task 3.

- [ ] **Step 1: Write the migration**

```sql
-- Migration: Add profile fields to users
-- Created at: 2026-07-19

ALTER TABLE users
  ADD COLUMN phone VARCHAR(20) NULL AFTER name,
  ADD COLUMN gender ENUM('male', 'female') NULL AFTER phone,
  ADD COLUMN birth_date DATE NULL AFTER gender,
  ADD COLUMN photo_url VARCHAR(500) NULL AFTER birth_date;
```

Save as `atlas_food_backend/migrations/009_add_profile_fields_to_users.sql`.

- [ ] **Step 2: Apply the migration to the local dev database**

Run (adjust connection flags to match how earlier migrations in this repo are
normally applied — check `atlas_food_backend/README.md` or `Makefile` for the
exact mysql invocation used for `001`–`008` first; if none is documented, use):

```bash
mysql -u root -p atlas_food < atlas_food_backend/migrations/009_add_profile_fields_to_users.sql
```

Expected: no error output; `DESCRIBE users;` in a `mysql` shell shows the four
new columns.

- [ ] **Step 3: Update the `User` model**

In `atlas_food_backend/internal/domain/auth/model.go`, replace the `User`
struct with:

```go
// User - model untuk tabel users
type User struct {
	ID           string     `gorm:"type:char(36);primaryKey;default:(UUID())" json:"id"`
	Email        string     `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	PasswordHash string     `gorm:"type:varchar(255);not null" json:"-"` // json:"-" agar tidak ikut di serialize
	Name         string     `gorm:"type:varchar(255);not null" json:"name"`
	Phone        *string    `gorm:"type:varchar(20)" json:"phone,omitempty"`
	Gender       *string    `gorm:"type:enum('male','female')" json:"gender,omitempty"`
	BirthDate    *time.Time `gorm:"type:date" json:"birth_date,omitempty"`
	PhotoURL     *string    `gorm:"type:varchar(500)" json:"photo_url,omitempty"`
	Role         string     `gorm:"type:enum('admin','respondent');default:'respondent'" json:"role"`
	IsActive     bool       `gorm:"default:true" json:"is_active"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}
```

(Everything else in the file — `TableName`, `RefreshToken` struct — is
unchanged.)

- [ ] **Step 4: Add the new DTOs**

In `atlas_food_backend/internal/domain/auth/dto.go`, add after
`RefreshTokenRequest`:

```go
// UpdateProfileRequest - DTO untuk request update profile
type UpdateProfileRequest struct {
	Name      string  `json:"name" binding:"required,min=2,max=100"`
	Phone     *string `json:"phone"`
	Gender    *string `json:"gender"`
	BirthDate *string `json:"birth_date"` // format "2006-01-02"
}

// ChangePasswordRequest - DTO untuk request ganti password
type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=8"`
}
```

And replace `ProfileResponse` with:

```go
// ProfileResponse - DTO untuk response profile
type ProfileResponse struct {
	ID        string  `json:"id"`
	Email     string  `json:"email"`
	Name      string  `json:"name"`
	Phone     *string `json:"phone,omitempty"`
	Gender    *string `json:"gender,omitempty"`
	BirthDate *string `json:"birth_date,omitempty"`
	PhotoURL  *string `json:"photo_url,omitempty"`
	Role      string  `json:"role"`
	IsActive  bool    `json:"is_active"`
	CreatedAt string  `json:"created_at"`
}
```

- [ ] **Step 5: Verify it compiles**

Run: `cd atlas_food_backend && go build ./...`
Expected: exits 0, no output (the `service.go` construction of
`ProfileResponse` in `GetProfile` still compiles because all new fields are
optional and it doesn't set them — Go zero-values them to `nil`, which is
valid).

- [ ] **Step 6: Commit**

```bash
cd atlas_food_backend
git add migrations/009_add_profile_fields_to_users.sql internal/domain/auth/model.go internal/domain/auth/dto.go
git commit -m "feat(auth): add profile fields (phone, gender, birth_date, photo_url) to users table"
```

---

## Task 2: Backend — repository `UpdateUser`

**Files:**
- Modify: `atlas_food_backend/internal/domain/auth/repository.go`

**Interfaces:**
- Consumes: `User` struct from Task 1.
- Produces: `Repository.UpdateUser(user *User) error` — consumed by Task 3's service methods.

- [ ] **Step 1: Add `UpdateUser` to the interface and implementation**

In `atlas_food_backend/internal/domain/auth/repository.go`, add
`UpdateUser(user *User) error` to the `Repository` interface (after
`GetUserByID`):

```go
type Repository interface {
	CreateUser(user *User) error
	GetUserByEmail(email string) (*User, error)
	GetUserByID(id string) (*User, error)
	UpdateUser(user *User) error
	CreateRefreshToken(token *RefreshToken) error
	GetRefreshToken(tokenHash string) (*RefreshToken, error)
	DeleteRefreshToken(tokenHash string) error
	DeleteUserRefreshTokens(userID string) error
}
```

Add the implementation after `GetUserByID`:

```go
// UpdateUser - simpan perubahan pada user yang sudah ada
func (r *authRepository) UpdateUser(user *User) error {
	return r.db.Save(user).Error
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd atlas_food_backend && go build ./...`
Expected: exits 0. (It will still compile even though nothing calls
`UpdateUser` yet — Go doesn't error on unused interface methods.)

- [ ] **Step 3: Commit**

```bash
cd atlas_food_backend
git add internal/domain/auth/repository.go
git commit -m "feat(auth): add UpdateUser to auth repository"
```

---

## Task 3: Backend — service methods (UpdateProfile, ChangePassword, UpdatePhoto)

**Files:**
- Modify: `atlas_food_backend/internal/domain/auth/service.go`

**Interfaces:**
- Consumes: `Repository.UpdateUser` (Task 2), `UpdateProfileRequest`/`ChangePasswordRequest`/`ProfileResponse` (Task 1), `utils.HashPassword`, `utils.CheckPassword` (existing, `internal/pkg/utils/hash.go`).
- Produces: `Service.UpdateProfile(userID string, req UpdateProfileRequest) (*ProfileResponse, error)`, `Service.ChangePassword(userID string, req ChangePasswordRequest) error`, `Service.UpdatePhoto(userID string, file *multipart.FileHeader) (*ProfileResponse, error)` — consumed by Task 4's handlers.

- [ ] **Step 1: Add the three methods to the `Service` interface**

In `atlas_food_backend/internal/domain/auth/service.go`, update the
interface:

```go
type Service interface {
	Register(req RegisterRequest) (*AuthResponse, error)
	Login(req LoginRequest) (*AuthResponse, error)
	RefreshToken(refreshToken string) (*AuthResponse, error)
	GetProfile(userID string) (*ProfileResponse, error)
	UpdateProfile(userID string, req UpdateProfileRequest) (*ProfileResponse, error)
	ChangePassword(userID string, req ChangePasswordRequest) error
	UpdatePhoto(userID string, file *multipart.FileHeader) (*ProfileResponse, error)
}
```

Add imports at the top of the file (alongside existing `errors`, `time`,
`uuid`):

```go
import (
	"atlas_food/internal/pkg/utils"
	"errors"
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)
```

(`gin` is needed for `gin.H` is NOT needed here — remove that import if
added by mistake; the service layer returns typed structs, not `gin.H`. Only
add `gin` if you actually use it — you won't in this file. So the real
import block is:)

```go
import (
	"atlas_food/internal/pkg/utils"
	"errors"
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"

	"github.com/google/uuid"
)
```

- [ ] **Step 2: Add a `toProfileResponse` helper**

Add this helper near the bottom of the file, above `generateTokens`, since
`UpdateProfile`/`ChangePassword`(indirectly)/`UpdatePhoto` all need to build
the same response shape:

```go
// toProfileResponse - konversi User model ke ProfileResponse DTO
func toProfileResponse(user *User) *ProfileResponse {
	resp := &ProfileResponse{
		ID:       user.ID,
		Email:    user.Email,
		Name:     user.Name,
		Phone:    user.Phone,
		Gender:   user.Gender,
		PhotoURL: user.PhotoURL,
		Role:     user.Role,
		IsActive: user.IsActive,
		CreatedAt: user.CreatedAt.Format("2006-01-02"),
	}
	if user.BirthDate != nil {
		formatted := user.BirthDate.Format("2006-01-02")
		resp.BirthDate = &formatted
	}
	return resp
}
```

- [ ] **Step 3: Replace `GetProfile` to use the helper**

Replace the existing `GetProfile` method body with:

```go
// GetProfile - ambil profil user
func (s *authService) GetProfile(userID string) (*ProfileResponse, error) {
	user, err := s.repo.GetUserByID(userID)
	if err != nil {
		return nil, errors.New("user tidak ditemukan")
	}

	return toProfileResponse(user), nil
}
```

- [ ] **Step 4: Add `UpdateProfile`**

Add after `GetProfile`:

```go
// UpdateProfile - update data profil user (name, phone, gender, birth_date)
func (s *authService) UpdateProfile(userID string, req UpdateProfileRequest) (*ProfileResponse, error) {
	user, err := s.repo.GetUserByID(userID)
	if err != nil {
		return nil, errors.New("user tidak ditemukan")
	}

	if req.Gender != nil && *req.Gender != "" && *req.Gender != "male" && *req.Gender != "female" {
		return nil, errors.New("gender tidak valid")
	}

	var birthDate *time.Time
	if req.BirthDate != nil && *req.BirthDate != "" {
		parsed, err := time.Parse("2006-01-02", *req.BirthDate)
		if err != nil {
			return nil, errors.New("format tanggal lahir tidak valid")
		}
		if parsed.After(time.Now()) {
			return nil, errors.New("tanggal lahir tidak boleh di masa depan")
		}
		birthDate = &parsed
	}

	user.Name = req.Name
	user.Phone = req.Phone
	if req.Gender != nil && *req.Gender == "" {
		user.Gender = nil
	} else {
		user.Gender = req.Gender
	}
	user.BirthDate = birthDate

	if err := s.repo.UpdateUser(user); err != nil {
		return nil, errors.New("gagal menyimpan profil")
	}

	return toProfileResponse(user), nil
}
```

- [ ] **Step 5: Add `ChangePassword`**

Add after `UpdateProfile`:

```go
// ChangePassword - ganti password user, memaksa re-login di device lain
func (s *authService) ChangePassword(userID string, req ChangePasswordRequest) error {
	user, err := s.repo.GetUserByID(userID)
	if err != nil {
		return errors.New("user tidak ditemukan")
	}

	if err := utils.CheckPassword(req.CurrentPassword, user.PasswordHash); err != nil {
		return errors.New("password saat ini salah")
	}

	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		return errors.New("gagal hash password")
	}
	user.PasswordHash = hashedPassword

	if err := s.repo.UpdateUser(user); err != nil {
		return errors.New("gagal menyimpan password baru")
	}

	// Paksa re-login di semua device lain
	_ = s.repo.DeleteUserRefreshTokens(userID)

	return nil
}
```

- [ ] **Step 6: Add `UpdatePhoto`**

Add after `ChangePassword`:

```go
// UpdatePhoto - upload/ganti foto profil user
func (s *authService) UpdatePhoto(userID string, file *multipart.FileHeader) (*ProfileResponse, error) {
	user, err := s.repo.GetUserByID(userID)
	if err != nil {
		return nil, errors.New("user tidak ditemukan")
	}

	ext := filepath.Ext(file.Filename)
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" {
		return nil, errors.New("format file tidak didukung (gunakan jpg, png, webp)")
	}
	if file.Size > 5*1024*1024 {
		return nil, errors.New("ukuran file terlalu besar (max 5MB)")
	}

	uploadDir := filepath.Join("uploads", "profile")
	if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
		os.MkdirAll(uploadDir, 0755)
	}

	filename := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	fullPath := filepath.Join(uploadDir, filename)

	src, err := file.Open()
	if err != nil {
		return nil, errors.New("gagal membaca file")
	}
	defer src.Close()

	dst, err := os.Create(fullPath)
	if err != nil {
		return nil, errors.New("gagal menyimpan file")
	}
	defer dst.Close()

	if _, err := dst.ReadFrom(src); err != nil {
		return nil, errors.New("gagal menyimpan file")
	}

	// Hapus foto lama kalau ada
	if user.PhotoURL != nil && *user.PhotoURL != "" {
		oldPath := filepath.Join(".", *user.PhotoURL)
		if _, statErr := os.Stat(oldPath); statErr == nil {
			os.Remove(oldPath)
		}
	}

	photoURL := fmt.Sprintf("/uploads/profile/%s", filename)
	user.PhotoURL = &photoURL

	if err := s.repo.UpdateUser(user); err != nil {
		return nil, errors.New("gagal menyimpan foto profil")
	}

	return toProfileResponse(user), nil
}
```

- [ ] **Step 7: Verify it compiles**

Run: `cd atlas_food_backend && go build ./... && go vet ./...`
Expected: both exit 0 with no output. If `go vet` complains about an unused
import, remove it (the import block in Step 1 above is the exact final set —
don't add `gin`).

- [ ] **Step 8: Commit**

```bash
cd atlas_food_backend
git add internal/domain/auth/service.go
git commit -m "feat(auth): add UpdateProfile, ChangePassword, UpdatePhoto service methods"
```

---

## Task 4: Backend — handlers + routing

**Files:**
- Modify: `atlas_food_backend/internal/domain/auth/handler.go`
- Modify: `atlas_food_backend/internal/router/router.go`

**Interfaces:**
- Consumes: `Service.UpdateProfile`, `Service.ChangePassword`, `Service.UpdatePhoto` (Task 3).
- Produces: HTTP routes `PATCH /api/v1/auth/me`, `PUT /api/v1/auth/me/password`, `POST /api/v1/auth/me/photo` — consumed by Task 6 (frontend `endpoints.ts`).

- [ ] **Step 1: Add the three handlers**

In `atlas_food_backend/internal/domain/auth/handler.go`, add after
`GetProfile`:

```go
// UpdateProfile - handler untuk endpoint PATCH /auth/me (protected)
func (h *Handler) UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "UNAUTHORIZED", "User tidak terautentikasi")
		return
	}

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, "Data tidak valid: "+err.Error())
		return
	}

	profile, err := h.service.UpdateProfile(userID.(string), req)
	if err != nil {
		utils.ValidationErrorResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, profile)
}

// ChangePassword - handler untuk endpoint PUT /auth/me/password (protected)
func (h *Handler) ChangePassword(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "UNAUTHORIZED", "User tidak terautentikasi")
		return
	}

	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, "Data tidak valid: "+err.Error())
		return
	}

	if err := h.service.ChangePassword(userID.(string), req); err != nil {
		utils.ValidationErrorResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, gin.H{"message": "Password berhasil diubah"})
}

// UpdatePhoto - handler untuk endpoint POST /auth/me/photo (protected)
func (h *Handler) UpdatePhoto(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "UNAUTHORIZED", "User tidak terautentikasi")
		return
	}

	file, err := c.FormFile("image")
	if err != nil {
		utils.ValidationErrorResponse(c, "File tidak ditemukan")
		return
	}

	profile, err := h.service.UpdatePhoto(userID.(string), file)
	if err != nil {
		utils.ValidationErrorResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, profile)
}
```

- [ ] **Step 2: Wire the routes**

In `atlas_food_backend/internal/router/router.go`, replace the `authGroup`
block:

```go
authGroup := v1.Group("/auth")
{
	authGroup.POST("/register", authHandler.Register)
	authGroup.POST("/login", authHandler.Login)
	authGroup.POST("/refresh", authHandler.RefreshToken)
	authGroup.GET("/me", middleware.JWTAuth(), authHandler.GetProfile)
	authGroup.PATCH("/me", middleware.JWTAuth(), authHandler.UpdateProfile)
	authGroup.PUT("/me/password", middleware.JWTAuth(), authHandler.ChangePassword)
	authGroup.POST("/me/photo", middleware.JWTAuth(), authHandler.UpdatePhoto)
}
```

- [ ] **Step 3: Verify it compiles**

Run: `cd atlas_food_backend && go build ./... && go vet ./...`
Expected: both exit 0.

- [ ] **Step 4: Manual smoke test against a running server**

Start the backend (check `atlas_food_backend/cmd/api/main.go` invocation —
typically `go run ./cmd/api` from the backend root), then with a valid
respondent JWT in `$TOKEN` (obtained via `POST /api/v1/auth/login`):

```bash
# Update profile
curl -s -X PATCH http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Test User","phone":"08123456789","gender":"male","birth_date":"1995-05-20"}'
```
Expected: `{"status":"success","data":{"id":"...","phone":"08123456789","gender":"male","birth_date":"1995-05-20",...}}`

```bash
# Wrong current password
curl -s -X PUT http://localhost:8080/api/v1/auth/me/password \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"current_password":"wrong","new_password":"newpassword123"}'
```
Expected: `{"status":"error","error":{"code":"VALIDATION_ERROR","message":"password saat ini salah"}}`

```bash
# Photo upload
curl -s -X POST http://localhost:8080/api/v1/auth/me/photo \
  -H "Authorization: Bearer $TOKEN" -F "image=@/path/to/test.jpg"
```
Expected: `{"status":"success","data":{"photo_url":"/uploads/profile/<uuid>.jpg",...}}`; the
file exists on disk at `atlas_food_backend/uploads/profile/`.

- [ ] **Step 5: Commit**

```bash
cd atlas_food_backend
git add internal/domain/auth/handler.go internal/router/router.go
git commit -m "feat(auth): wire PATCH /auth/me, PUT /auth/me/password, POST /auth/me/photo routes"
```

---

## Task 5: Backend — push branch

**Files:** none (git operation only)

- [ ] **Step 1: Check current branch and push**

```bash
cd atlas_food_backend
git status --short
git branch --show-current
```

If on a feature branch intended for this work, push it:

```bash
git push origin HEAD
```

If working directly on the backend's main integration branch, confirm with
the user before pushing (do not push to a shared branch without checking
first — see repo's git safety conventions).

---

## Task 6: Frontend — types, endpoints, API client upload support

**Files:**
- Modify: `internal/domain/auth/types/auth.ts`
- Modify: `internal/pkg/api/endpoints.ts`
- Modify: `internal/pkg/api/apiClient.ts`

**Interfaces:**
- Produces: `UserInfo` and `ProfileResponse` extended with `phone?: string | null`, `gender?: "male" | "female" | null`, `birth_date?: string | null`, `photo_url?: string | null`; types `UpdateProfileRequest`, `ChangePasswordRequest`; `apiEndpoints.auth.updateProfile`, `.changePassword`, `.uploadPhoto`; `apiUpload<T>(path, formData, token?)` and `API_ASSET_ORIGIN` export from `apiClient.ts` — all consumed by Task 7.

- [ ] **Step 1: Extend the auth types**

In `internal/domain/auth/types/auth.ts`, replace `export type User = {...}`
through `export type ProfileResponse = ...` with:

```ts
export type User = {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  gender?: "male" | "female" | null;
  birth_date?: string | null;
  photo_url?: string | null;
  role: AuthRole;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
};

export type RefreshToken = {
  id: number;
  user_id: string;
  expires_at: string;
  created_at: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  name: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RefreshTokenRequest = {
  refresh_token: string;
};

export type UserInfo = {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  gender?: "male" | "female" | null;
  birth_date?: string | null;
  photo_url?: string | null;
  role: AuthRole;
  is_active: boolean;
};

export type AuthResponse = {
  user: UserInfo;
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

export type ProfileResponse = UserInfo & {
  created_at: string;
};

export type UpdateProfileRequest = {
  name: string;
  phone?: string | null;
  gender?: "male" | "female" | "" | null;
  birth_date?: string | null;
};

export type ChangePasswordRequest = {
  current_password: string;
  new_password: string;
};
```

- [ ] **Step 2: Add the new endpoints**

In `internal/pkg/api/endpoints.ts`, update the `auth` block:

```ts
export const apiEndpoints = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    refresh: "/auth/refresh",
    me: "/auth/me",
    updateProfile: "/auth/me",
    changePassword: "/auth/me/password",
    uploadPhoto: "/auth/me/photo",
  },
  admin: {
    surveys: "/admin/surveys",
    surveyDetail: (id: string) => `/admin/surveys/${id}`,
    cloneSurvey: (id: string) => `/admin/surveys/${id}/clone`,
  },
  publicSurvey: {
    detail: (accessToken: string) => `/surveys/${accessToken}`,
    join: (accessToken: string) => `/surveys/${accessToken}/join`,
  },
  public: {
    foodSearch: "/public/foods/search",
    foodDetail: (id: string) => `/public/foods/${id}`,
    categories: "/public/categories",
    surveySubmit: "/survey/submit",
  },
} as const;
```

- [ ] **Step 3: Add `apiUpload` and `API_ASSET_ORIGIN` to `apiClient.ts`**

Replace the full contents of `internal/pkg/api/apiClient.ts` with:

```ts
import type { ApiResponse } from "../utils/response";
import { getAccessToken } from "@/internal/lib/cookies";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080/api/v1";

export const API_ASSET_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

type RequestOptions = RequestInit & {
  token?: string;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || payload?.status === "error") {
    throw new Error(payload?.error?.message ?? `Request failed with status ${response.status}`);
  }

  return payload?.data as T;
}

export async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...requestOptions } = options;
  const authToken = token ?? getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
  });

  return parseResponse<T>(response);
}

export async function apiUpload<T>(path: string, formData: FormData, token?: string): Promise<T> {
  const authToken = token ?? getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    body: formData,
    headers: {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
  });

  return parseResponse<T>(response);
}
```

(Deliberately no `Content-Type` header in `apiUpload` — the browser sets the
multipart boundary automatically when `fetch` receives a `FormData` body; a
manual `Content-Type: multipart/form-data` header would omit the boundary and
break parsing on the Gin side.)

- [ ] **Step 4: Confirm the barrel file re-exports it automatically**

`internal/pkg/api/index.ts` is:

```ts
export * from "./apiClient";
export * from "./endpoints";
```

This already re-exports everything from `apiClient.ts` via wildcard, so
`apiUpload` and `API_ASSET_ORIGIN` are automatically available from
`@/internal/pkg/api` — no edit needed here.

- [ ] **Step 5: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no new errors introduced by these three files (any pre-existing
unrelated errors from other files are not this task's concern).

- [ ] **Step 6: Commit**

```bash
git add internal/domain/auth/types/auth.ts internal/pkg/api/endpoints.ts internal/pkg/api/apiClient.ts
git commit -m "feat(auth): add profile/password/photo types, endpoints, and upload-capable api client"
```

---

## Task 7: Frontend — authService functions + authStore.updateUser + auth-provider hydration

**Files:**
- Modify: `internal/domain/auth/services/authService.ts`
- Modify: `internal/domain/auth/store/authStore.ts`
- Modify: `internal/providers/auth-provider.tsx`

**Interfaces:**
- Consumes: `apiClient`, `apiUpload`, `apiEndpoints` (Task 6).
- Produces: `updateProfile(payload, token)`, `changePassword(payload, token)`, `uploadProfilePhoto(file, token)` from `authService.ts`; `useAuthStore.updateUser(patch)` action — all consumed by Task 8.

- [ ] **Step 1: Add the three service functions**

In `internal/domain/auth/services/authService.ts`, replace the full file
with:

```ts
import { apiClient, apiEndpoints, apiUpload } from "@/internal/pkg/api";
import type {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  ProfileResponse,
  RefreshTokenRequest,
  RegisterRequest,
  UpdateProfileRequest,
} from "../types/auth";

export function login(payload: LoginRequest) {
  return apiClient<AuthResponse>(apiEndpoints.auth.login, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function register(payload: RegisterRequest) {
  return apiClient<AuthResponse>(apiEndpoints.auth.register, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function refreshToken(payload: RefreshTokenRequest) {
  return apiClient<AuthResponse>(apiEndpoints.auth.refresh, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getProfile(token: string) {
  return apiClient<ProfileResponse>(apiEndpoints.auth.me, { token });
}

export function updateProfile(payload: UpdateProfileRequest, token: string) {
  return apiClient<ProfileResponse>(apiEndpoints.auth.updateProfile, {
    method: "PATCH",
    body: JSON.stringify(payload),
    token,
  });
}

export function changePassword(payload: ChangePasswordRequest, token: string) {
  return apiClient<{ message: string }>(apiEndpoints.auth.changePassword, {
    method: "PUT",
    body: JSON.stringify(payload),
    token,
  });
}

export function uploadProfilePhoto(file: File, token: string) {
  const formData = new FormData();
  formData.append("image", file);
  return apiUpload<ProfileResponse>(apiEndpoints.auth.uploadPhoto, formData, token);
}
```

- [ ] **Step 2: Add `updateUser` to the auth store**

Replace `internal/domain/auth/store/authStore.ts` with:

```ts
import { create } from "zustand";
import type { AuthResponse, UserInfo } from "../types/auth";
import { clearAuthCookies, setAuthCookies } from "@/internal/lib/cookies";

export type AuthState = {
  session: AuthResponse | null;
  setSession: (session: AuthResponse | null) => void;
  clearSession: () => void;
  updateUser: (patch: Partial<UserInfo>) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  setSession: (session) => {
    if (session?.access_token) {
      setAuthCookies(session.access_token, session.refresh_token, session.expires_in);
    } else {
      clearAuthCookies();
    }
    set({ session });
  },
  clearSession: () => {
    clearAuthCookies();
    set({ session: null });
  },
  updateUser: (patch) => {
    const current = get().session;
    if (!current) return;
    set({ session: { ...current, user: { ...current.user, ...patch } } });
  },
}));
```

- [ ] **Step 3: Carry the new fields through session hydration**

In `internal/providers/auth-provider.tsx`, update the `setSession` call
inside the `getProfile(token).then(...)` block to include the new fields:

```ts
    getProfile(token)
      .then((profile) => {
        setSession({
          user: {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            phone: profile.phone,
            gender: profile.gender,
            birth_date: profile.birth_date,
            photo_url: profile.photo_url,
            role: profile.role,
            is_active: profile.is_active,
          },
          access_token: token,
          refresh_token: getRefreshToken() ?? "",
          expires_in: 86400,
        });
      })
```

- [ ] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no new errors from these three files.

- [ ] **Step 5: Commit**

```bash
git add internal/domain/auth/services/authService.ts internal/domain/auth/store/authStore.ts internal/providers/auth-provider.tsx
git commit -m "feat(auth): add updateProfile/changePassword/uploadProfilePhoto services and store updateUser action"
```

---

## Task 8: Frontend — wire `ProfileCard.tsx` to the real API

**Files:**
- Modify: `internal/domain/auth/components/ProfileCard.tsx`

**Interfaces:**
- Consumes: `updateProfile`, `changePassword`, `uploadProfilePhoto` (Task 7), `useAuthStore.updateUser` (Task 7), `API_ASSET_ORIGIN` (Task 6).

- [ ] **Step 1: Replace the full file**

`ProfileCard.tsx` needs: a real personal-info form (controlled, submits via
`updateProfile`), a real password modal (submits via `changePassword`, shows
errors inline instead of always succeeding), a real photo modal (submits via
`uploadProfilePhoto`, shows real errors, renders the uploaded photo), and the
avatar rendering the real photo when present. Replace the entire file with:

```tsx
"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import {
  Loader2, User, Shield, Camera, LogOut, Settings, Search,
  X, Upload, Image as ImageIcon, Eye, EyeOff, Lock, CheckCircle2,
  Info, ArrowRight, AlertCircle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useLogout } from "../hooks/useLogout";
import { authRoles } from "../constants/authRoles";
import { AppHeader } from "@/internal/components/layout/AppHeader";
import { CONTAINER_CLASS } from "@/internal/lib/layout";
import { getAccessToken } from "@/internal/lib/cookies";
import { cn } from "@/internal/lib/cn";
import { API_ASSET_ORIGIN } from "@/internal/pkg/api";
import { changePassword, updateProfile, uploadProfilePhoto } from "../services/authService";
import { useAuthStore } from "../store/authStore";

type ActiveSection = "personal" | "security";
type PhotoModal = "change" | "uploading" | null;
type PasswordModal = "form" | "success" | null;

const FOOTER_LINKS = ["Privacy Policy", "Terms of Service", "Clinical Standards", "Contact"];

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map: Record<number, { label: string; color: string }> = {
    1: { label: "WEAK", color: "text-danger" },
    2: { label: "FAIR", color: "text-warning" },
    3: { label: "GOOD", color: "text-info" },
    4: { label: "STRONG", color: "text-success" },
  };
  return { score, ...(map[score] ?? { label: "", color: "" }) };
}

function ModalOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-modal bg-black/45 flex items-center justify-center p-4"
    >
      {children}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 py-2 px-3 bg-danger-light border border-danger-border rounded-md text-danger text-xs">
      <AlertCircle size={14} className="shrink-0 mt-px" />
      <span>{message}</span>
    </div>
  );
}

function ChangePhotoModal({
  onClose,
  onFileSelected,
  error,
}: {
  onClose: () => void;
  onFileSelected: (file: File) => void;
  error: string | null;
}) {
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) return;
    if (file.size > 5 * 1024 * 1024) return;
    onFileSelected(file);
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-surface rounded-xl w-full max-w-[480px] shadow-xl">
        <div className="flex items-start justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center">
              <ImageIcon size={18} />
            </div>
            <div>
              <p className="m-0 font-semibold text-base text-text-primary">Change Profile Photo</p>
              <p className="m-0 text-sm text-text-muted">Update how you appear to others on Atlas Food</p>
            </div>
          </div>
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-text-muted p-1">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-3">
          {error && <ErrorBanner message={error} />}
          <label
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            className={cn(
              "border-2 border-dashed rounded-lg py-8 px-4 text-center cursor-pointer transition-fast block",
              dragging ? "border-primary bg-primary-light" : "border-border bg-transparent"
            )}
          >
            <div className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center mx-auto mb-3">
              <Upload size={20} />
            </div>
            <p className="m-0 mb-1 font-semibold text-base text-text-primary">Upload From Device</p>
            <p className="m-0 text-sm text-text-muted">Drag and drop your file here, or click to browse</p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </label>

          <div className="flex items-start gap-2 py-3 px-4 bg-background rounded-md">
            <Info size={14} className="text-text-muted shrink-0 mt-px" />
            <p className="m-0 text-xs text-text-muted leading-relaxed">
              Supported formats: JPG, PNG, WEBP.
              <br />
              Maximum file size: 5 MB. For best results, use a square image of at least 400×400px.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="btn btn-secondary btn-sm">Cancel</button>
        </div>
      </div>
    </ModalOverlay>
  );
}

function UploadProgressModal({
  file,
  uploading,
  error,
  onClose,
}: {
  file: File;
  uploading: boolean;
  error: string | null;
  onClose: () => void;
}) {
  const total = (file.size / (1024 * 1024)).toFixed(1);

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-surface rounded-xl w-full max-w-[480px] shadow-xl">
        <div className="flex items-center justify-between px-6 py-5">
          <p className="m-0 font-semibold text-lg text-text-primary">Change Profile Photo</p>
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-text-muted">
            <X size={18} />
          </button>
        </div>

        <div className="mx-6 mb-5 border-2 border-dashed border-primary-border rounded-lg p-5 bg-primary-light">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-md bg-surface border-[1.5px] border-primary-border flex items-center justify-center shrink-0">
              <ImageIcon size={20} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="m-0 text-sm font-semibold text-text-primary overflow-hidden text-ellipsis whitespace-nowrap">{file.name}</p>
              <p className="m-0 text-xs text-text-muted">
                {total} MB · {error ? "Failed" : uploading ? "Uploading..." : "Done"}
              </p>
            </div>
          </div>

          {error ? (
            <ErrorBanner message={error} />
          ) : (
            <div className="h-1.5 rounded-full bg-border overflow-hidden">
              <div
                className={cn("h-full bg-primary transition-all", uploading ? "w-1/2 animate-pulse" : "w-full")}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            {uploading ? "Close" : "Done"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

function ChangePasswordModal({
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  onClose: () => void;
  onSubmit: (current: string, next: string) => void;
  submitting: boolean;
  error: string | null;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = passwordStrength(next);
  const match = next.length > 0 && confirm.length > 0 && next === confirm;
  const mismatch = confirm.length > 0 && next !== confirm;
  const canSave = current.length > 0 && strength.score >= 2 && match && !submitting;

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-surface rounded-xl w-full max-w-[480px] shadow-xl">
        <div className="flex items-start justify-between p-6">
          <div>
            <p className="m-0 mb-1 font-bold text-xl text-text-primary">Change Password</p>
            <p className="m-0 text-sm text-text-muted">Ensure your account stays secure with a strong password.</p>
          </div>
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-text-muted">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-5">
          {error && <ErrorBanner message={error} />}

          <div>
            <p className="m-0 mb-2 text-xs font-semibold text-text-muted tracking-wider">CURRENT PASSWORD</p>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                type={showCurrent ? "text" : "password"}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="••••••••••"
                className="pl-9 pr-10 w-full box-border"
              />
              <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-text-muted">
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <p className="m-0 mb-2 text-xs font-semibold text-text-muted tracking-wider">NEW PASSWORD</p>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                type={showNext ? "text" : "password"}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                placeholder="Min. 8 characters"
                className="pl-9 pr-10 w-full box-border"
              />
              <button type="button" onClick={() => setShowNext((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-text-muted">
                {showNext ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {next.length > 0 && (
              <div className="mt-2">
                <div className="flex justify-between mb-1">
                  <span className={cn("text-xs font-semibold", strength.color)}>{strength.label}</span>
                  <span className="text-xs text-text-muted">{strength.score * 25}% secure</span>
                </div>
                <div className="h-1 rounded-full bg-border">
                  <div className={cn("h-full rounded-full transition-all duration-200 bg-current", strength.color)} style={{ width: `${strength.score * 25}%` }} />
                </div>
              </div>
            )}
          </div>

          <div>
            <p className="m-0 mb-2 text-xs font-semibold text-text-muted tracking-wider">CONFIRM NEW PASSWORD</p>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password"
                className={cn("pl-9 pr-10 w-full box-border", mismatch && "border-danger")}
              />
              <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-text-muted">
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {match && (
              <p className="mt-1 mb-0 text-xs text-success flex items-center gap-1">
                <CheckCircle2 size={12} /> Passwords match
              </p>
            )}
            {mismatch && <p className="mt-1 mb-0 text-xs text-danger">Passwords do not match</p>}
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="btn btn-secondary btn-sm">Cancel</button>
          <button onClick={() => onSubmit(current, next)} className="btn btn-primary btn-sm" disabled={!canSave}>
            {submitting ? "Saving..." : "Save New Password"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

function PasswordSuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-surface rounded-xl w-full max-w-[360px] shadow-xl py-10 px-8 text-center">
        <div className="relative w-[72px] h-[72px] mx-auto mb-5">
          <div className="absolute -inset-4 rounded-full bg-success/10" />
          <div className="w-full h-full rounded-full bg-success flex items-center justify-center relative">
            <CheckCircle2 size={32} className="text-white" />
          </div>
        </div>
        <p className="m-0 mb-3 text-xl font-bold text-text-primary">Password Updated Successfully</p>
        <p className="m-0 mb-7 text-sm text-text-muted leading-relaxed">
          Your account is now more secure. Please use your new password next time you log in.
        </p>
        <button onClick={onClose} className="btn btn-primary w-full rounded-full flex items-center justify-center gap-2">
          Back to Profile <ArrowRight size={15} />
        </button>
      </div>
    </ModalOverlay>
  );
}

export function ProfileCard() {
  const { user, isAuthenticated } = useAuth();
  const logout = useLogout();
  const updateUser = useAuthStore((state) => state.updateUser);
  const isLoading = !user && Boolean(getAccessToken());
  const [activeSection, setActiveSection] = useState<ActiveSection>("personal");

  const [photoModal, setPhotoModal] = useState<PhotoModal>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [passwordModal, setPasswordModal] = useState<PasswordModal>(null);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState({ name: user?.name ?? "", phone: user?.phone ?? "", gender: user?.gender ?? "", birth_date: user?.birth_date ?? "" });
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);

  const handleFileSelected = useCallback(async (file: File) => {
    setUploadFile(file);
    setUploading(true);
    setPhotoError(null);
    setPhotoModal("uploading");
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Sesi habis, silakan masuk ulang.");
      const profile = await uploadProfilePhoto(file, token);
      updateUser({ photo_url: profile.photo_url });
      setUploading(false);
    } catch (err) {
      setUploading(false);
      setPhotoError(err instanceof Error ? err.message : "Gagal mengunggah foto");
    }
  }, [updateUser]);

  const handlePasswordSubmit = useCallback(async (current: string, next: string) => {
    setPasswordSubmitting(true);
    setPasswordError(null);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Sesi habis, silakan masuk ulang.");
      await changePassword({ current_password: current, new_password: next }, token);
      setPasswordSubmitting(false);
      setPasswordModal("success");
    } catch (err) {
      setPasswordSubmitting(false);
      setPasswordError(err instanceof Error ? err.message : "Gagal mengubah password");
    }
  }, []);

  const handleProfileSubmit = useCallback(async () => {
    setProfileSubmitting(true);
    setProfileError(null);
    setProfileSaved(false);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Sesi habis, silakan masuk ulang.");
      const profile = await updateProfile(
        {
          name: profileForm.name,
          phone: profileForm.phone || null,
          gender: (profileForm.gender || null) as "male" | "female" | null,
          birth_date: profileForm.birth_date || null,
        },
        token
      );
      updateUser({ name: profile.name, phone: profile.phone, gender: profile.gender, birth_date: profile.birth_date });
      setProfileSubmitting(false);
      setProfileSaved(true);
    } catch (err) {
      setProfileSubmitting(false);
      setProfileError(err instanceof Error ? err.message : "Gagal menyimpan profil");
    }
  }, [profileForm, updateUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={36} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--color-bg)" }}>
        <AppHeader />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
          <p className="text-text-muted text-sm">Anda belum masuk.</p>
          <Link href="/login" className="link-primary-hover font-medium">
            Masuk ke akun →
          </Link>
        </div>
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const photoSrc = user.photo_url ? `${API_ASSET_ORIGIN}${user.photo_url}` : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      {/* Modals */}
      {photoModal === "change" && (
        <ChangePhotoModal
          onClose={() => { setPhotoModal(null); setPhotoError(null); }}
          onFileSelected={handleFileSelected}
          error={photoError}
        />
      )}
      {photoModal === "uploading" && uploadFile && (
        <UploadProgressModal
          file={uploadFile}
          uploading={uploading}
          error={photoError}
          onClose={() => { setPhotoModal(null); setUploadFile(null); setPhotoError(null); }}
        />
      )}
      {passwordModal === "form" && (
        <ChangePasswordModal
          onClose={() => { setPasswordModal(null); setPasswordError(null); }}
          onSubmit={handlePasswordSubmit}
          submitting={passwordSubmitting}
          error={passwordError}
        />
      )}
      {passwordModal === "success" && (
        <PasswordSuccessModal onClose={() => setPasswordModal(null)} />
      )}

      {/* Page header */}
      <div className={`${CONTAINER_CLASS} pt-8 pb-2`}>
        <h1 className="text-2xl font-bold text-text-primary mb-1">My Profile</h1>
        <p className="text-sm text-text-muted m-0">
          Manage your account information and security preferences.
        </p>
      </div>

      {/* Two-column layout */}
      <div className={`${CONTAINER_CLASS} flex-1 pt-6 pb-10 grid grid-cols-[280px_1fr] gap-6 items-start`}>
        {/* ── Left sidebar ── */}
        <div className="flex flex-col gap-4">

          {/* Avatar card */}
          <div className="card p-6 flex flex-col items-center gap-3">
            {/* Avatar with camera overlay */}
            <div className="relative inline-flex">
              {photoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoSrc}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border-[3px] border-white shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary-light text-primary text-2xl font-bold flex items-center justify-center border-[3px] border-white shadow-md overflow-hidden">
                  {initials}
                </div>
              )}
              {/* Camera badge */}
              <button
                onClick={() => setPhotoModal("change")}
                className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center border-2 border-white cursor-pointer"
              >
                <Camera size={12} />
              </button>
            </div>

            {/* Name + role */}
            <div className="text-center">
              <p className="text-lg font-bold text-text-primary mb-1">{user.name}</p>
              <p className="text-sm text-text-muted m-0 capitalize">
                {user.role === authRoles.admin ? "Admin Member" : "Pro Plan Member"}
              </p>
            </div>

            {/* Change Photo button */}
            <button onClick={() => setPhotoModal("change")} className="btn btn-outline btn-sm btn-full mt-1">
              Change Photo
            </button>
          </div>

          {/* Navigation card */}
          <div className="card p-2 overflow-visible">
            <button
              onClick={() => setActiveSection("personal")}
              className={`profile-nav-item${activeSection === "personal" ? " profile-nav-item--active" : ""}`}
            >
              <User size={16} />
              Personal Info
            </button>

            <button
              onClick={() => setActiveSection("security")}
              className={`profile-nav-item${activeSection === "security" ? " profile-nav-item--active" : ""}`}
            >
              <Shield size={16} />
              Security
            </button>

            {user.role === authRoles.admin && (
              <>
                <div className="h-px bg-border my-2 mx-3" />
                <Link href="/admin/surveys" className="profile-nav-item">
                  <Settings size={16} />
                  Panel Admin
                </Link>
              </>
            )}

            <div className="h-px bg-border my-2 mx-3" />

            <Link href="/find-food" className="profile-nav-item">
              <Search size={16} />
              Find Food
            </Link>

            <button
              onClick={() => logout()}
              className="profile-nav-item profile-nav-item--danger"
            >
              <LogOut size={16} />
              Keluar
            </button>
          </div>
        </div>

        {/* ── Right content ── */}
        <div className="flex flex-col gap-5">

          {/* Personal Information */}
          {activeSection === "personal" && (
            <div className="card">
              {/* Card header */}
              <div className="flex items-center justify-between py-5 px-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-primary-light text-primary flex items-center justify-center">
                    <User size={18} />
                  </div>
                  <h2 className="text-lg font-semibold text-text-primary m-0">Personal Information</h2>
                </div>
              </div>

              {/* Form body */}
              <div className="p-6">
                {profileError && <div className="mb-4"><ErrorBanner message={profileError} /></div>}
                {profileSaved && (
                  <p className="mb-4 text-sm text-success flex items-center gap-1">
                    <CheckCircle2 size={14} /> Profil berhasil disimpan
                  </p>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" defaultValue={user.email} readOnly />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+62 000-0000-0000"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select
                      value={profileForm.gender}
                      onChange={(e) => setProfileForm((f) => ({ ...f, gender: e.target.value }))}
                    >
                      <option value="">Pilih jenis kelamin</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Birth Date</label>
                    <input
                      type="date"
                      value={profileForm.birth_date ?? ""}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setProfileForm((f) => ({ ...f, birth_date: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-border mt-6 mb-5" />

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setProfileForm({ name: user.name, phone: user.phone ?? "", gender: user.gender ?? "", birth_date: user.birth_date ?? "" });
                      setProfileError(null);
                      setProfileSaved(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleProfileSubmit} disabled={profileSubmitting || !profileForm.name.trim()}>
                    {profileSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          {activeSection === "security" && (
            <div className="card">
              {/* Card header */}
              <div className="flex items-center gap-3 py-5 px-6 border-b border-border">
                <div className="w-9 h-9 rounded-md bg-primary-light text-primary flex items-center justify-center">
                  <Shield size={18} />
                </div>
                <h2 className="text-lg font-semibold text-text-primary m-0">Security</h2>
              </div>

              {/* Security body */}
              <div className="p-6 flex flex-col gap-4">

                {/* Password row */}
                <div className="flex items-center justify-between py-4 px-5 border border-border rounded-lg bg-surface">
                  <div>
                    <p className="text-sm font-semibold text-text-primary mb-1">Password</p>
                    <p className="text-sm text-text-muted m-0 tracking-[0.15em]">••••••••••••</p>
                  </div>
                  <button onClick={() => setPasswordModal("form")} className="btn btn-outline btn-sm">Change Password</button>
                </div>

                {/* Security tip */}
                <div className="flex items-start gap-3 py-4 px-5 border border-primary-border rounded-lg bg-primary-light">
                  <div className="text-primary shrink-0 mt-px">
                    <Shield size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary mb-1">Security Tip</p>
                    <p className="text-sm text-primary m-0 opacity-85">
                      Enable Two-Factor Authentication (2FA) for an extra layer of security on your account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-6">
        <div className={`${CONTAINER_CLASS} flex items-center justify-between`}>
          <div>
            <p className="text-base font-bold text-text-primary mb-1">Atlas Food</p>
            <p className="text-xs text-text-muted m-0">
              © {new Date().getFullYear()} Atlas Food Nutrition. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6">
            {FOOTER_LINKS.map((label) => (
              <Link key={label} href="#" className="text-sm text-text-muted underline underline-offset-[3px]">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
```

Note what was deliberately dropped from the old mock version:
`RemovePhotoModal`, the fake `setInterval` progress simulation, and the
"Edit Profile" button that did nothing (the form is inline-editable now, so
that button is redundant).

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors from `ProfileCard.tsx`.

- [ ] **Step 3: Run the full build**

Run: `npm run build`
Expected: build succeeds, all routes generated including `/profile`.

- [ ] **Step 4: Commit**

```bash
git add internal/domain/auth/components/ProfileCard.tsx
git commit -m "feat(profile): wire ProfileCard to real update-profile, change-password, and photo-upload APIs"
```

---

## Task 9: End-to-end manual verification

**Files:** none (verification only)

- [ ] **Step 1: Start both servers**

Backend: `cd atlas_food_backend && go run ./cmd/api` (or whatever the repo's
documented run command is — check `README.md` first).
Frontend: `npm run dev` in the frontend repo root.

- [ ] **Step 2: Manual browser walkthrough**

1. Log in as a respondent, go to `/profile`.
2. Personal Info tab: change phone/gender/birth date, click Save Changes —
   confirm the success message appears and the values persist after a page
   refresh (confirms `auth-provider.tsx` hydration carries the new fields).
3. Security tab → Change Password: try the current (real) password wrong —
   confirm the inline error appears and the modal does NOT advance to the
   success screen. Then enter the correct current password and a valid new
   one — confirm the success screen appears.
4. Log out, log back in with the NEW password — confirms the backend
   actually persisted the hash change.
5. Avatar → Change Photo: upload a real jpg/png — confirm the modal shows
   "Done", closing it shows the real photo (not initials) in the avatar
   circle, and it's still there after a page refresh.
6. Try uploading a >5MB file or a non-image file — confirm the inline error
   message appears in the modal (via the browser's file picker, this needs a
   file that passes the `accept` filter but fails the size check, or test the
   backend directly via curl with an oversized file for the size case).

- [ ] **Step 3: Confirm no regressions**

Run `npx tsc --noEmit` and `npm run build` one more time at the very end of
the branch to confirm the full accumulated diff is still clean.

---

## Self-review notes (already applied above)

- Spec coverage: migration ✓ (Task 1), model/DTO ✓ (Task 1), repository ✓
  (Task 2), service ✓ (Task 3), handler/routing ✓ (Task 4), frontend
  types/endpoints/client ✓ (Task 6), service/store/hydration ✓ (Task 7),
  `ProfileCard` wiring ✓ (Task 8), manual verification ✓ (Task 9). Remove
  Photo and email change are explicitly out of scope per the spec and are
  called out inline in Task 8 rather than silently omitted.
- Type/name consistency checked: `UpdateProfileRequest`, `ChangePasswordRequest`,
  `ProfileResponse` field names match exactly between the Go DTOs (Task 1),
  the Go service signatures (Task 3), the TS types (Task 6), and the
  `authService.ts` functions (Task 7) that `ProfileCard.tsx` (Task 8) calls.
