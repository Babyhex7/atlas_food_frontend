# Profile: Connect Change Password, Profile Edit & Photo Upload to Backend

## Context

`ProfileCard.tsx` (frontend) currently has UI-only mock features: a change-password
modal with fake success, a photo-upload modal with a simulated progress bar (no
real upload), and a Personal Info form (name/email read-only, phone/gender/birth
date/age not persisted anywhere). None of this reaches the backend.

The backend (`atlas_food_backend`, Go/Gin/GORM/MySQL, domain-driven under
`internal/domain/<name>/`) has no endpoints for updating a profile, changing a
password, or uploading a profile photo. The `users` table only has
`id, email, password_hash, name, role, is_active, created_at, updated_at`.

Goal: wire all three features (profile field edit, password change, photo
upload) end-to-end, backend and frontend, following existing conventions.

## Scope decisions (confirmed with user)

- Add phone, gender, birth_date, photo_url to the `users` table and a real
  update-profile endpoint (not deferred).
- Profile photo upload gets its own dedicated endpoint (not the existing
  `/upload` admin-only one), since respondents must be able to upload their own
  photo.
- New frontend API calls live in `internal/domain/auth/services/authService.ts`
  (fetch-based `apiClient`), matching the pattern already used for
  login/register/refresh/getProfile in that same domain module — confirmed by
  `internal/providers/auth-provider.tsx`, which is the actual live session-hydration
  path and already depends on this file. The parallel axios-based
  `internal/services/*.service.ts` layer is not used for auth/profile.

## Backend design

### Migration — `migrations/009_add_profile_fields_to_users.sql`

```sql
ALTER TABLE users
  ADD COLUMN phone VARCHAR(20) NULL AFTER name,
  ADD COLUMN gender ENUM('male','female') NULL AFTER phone,
  ADD COLUMN birth_date DATE NULL AFTER gender,
  ADD COLUMN photo_url VARCHAR(500) NULL AFTER birth_date;
```

### Model (`internal/domain/auth/model.go`)

Add to `User`: `Phone *string`, `Gender *string`, `BirthDate *time.Time`,
`PhotoURL *string` (pointers so `NULL` round-trips cleanly through GORM and
JSON `omitempty`).

### DTOs (`internal/domain/auth/dto.go`)

- `UpdateProfileRequest{ Name string, Phone *string, Gender *string, BirthDate *string }`
  — `Name` required (`binding:"required,min=2,max=100"`), others optional.
  `Gender` validated against `male|female` in the service layer (empty allowed).
  `BirthDate` parsed as `"2006-01-02"`; reject dates in the future.
- `ChangePasswordRequest{ CurrentPassword string \`binding:"required"\`, NewPassword string \`binding:"required,min=8"\` }`
- `ProfileResponse` extended with `phone`, `gender`, `birth_date`, `photo_url`
  (all `omitempty`).
- `UserInfo` (used in `AuthResponse` for login/register) is left as-is —
  those responses don't need the extra fields immediately after login/register.

### Service (`internal/domain/auth/service.go`)

- `UpdateProfile(userID string, req UpdateProfileRequest) (*ProfileResponse, error)`
  — load user, apply fields, `repo.UpdateUser`, return fresh `ProfileResponse`.
- `ChangePassword(userID string, req ChangePasswordRequest) error` — load user,
  `utils.CheckPassword(req.CurrentPassword, user.PasswordHash)` (wrong password →
  `errors.New("password saat ini salah")`), hash new password, `repo.UpdateUser`,
  then `repo.DeleteUserRefreshTokens(userID)` to force re-login elsewhere.
- `UpdatePhoto(userID string, file *multipart.FileHeader) (*ProfileResponse, error)`
  — validate extension (jpg/jpeg/png/webp) and size (max 5MB, matching the
  frontend modal's stated limit), save under `./uploads/profile/<uuid>.<ext>`,
  delete the previous photo file from disk if `user.PhotoURL` was set and the
  file exists, update `user.PhotoURL`, `repo.UpdateUser`, return
  `ProfileResponse`.

### Repository (`internal/domain/auth/repository.go`)

Add `UpdateUser(user *User) error` → `r.db.Save(user).Error`.

### Handler (`internal/domain/auth/handler.go`)

- `UpdateProfile(c *gin.Context)` — bind `UpdateProfileRequest`, call service,
  `utils.SuccessResponse`.
- `ChangePassword(c *gin.Context)` — bind `ChangePasswordRequest`, call
  service; map "password saat ini salah" → 400 `VALIDATION_ERROR` (not 401 —
  the user IS authenticated, they just typed the wrong current password).
- `UpdatePhoto(c *gin.Context)` — `c.FormFile("image")`, call service.

### Routing (`internal/router/router.go`)

```go
authGroup.PATCH("/me", middleware.JWTAuth(), authHandler.UpdateProfile)
authGroup.PUT("/me/password", middleware.JWTAuth(), authHandler.ChangePassword)
authGroup.POST("/me/photo", middleware.JWTAuth(), authHandler.UpdatePhoto)
```

No `AdminOnly()` — any authenticated user manages their own profile only
(`userID` always comes from the JWT context, never from a request param, so a
user can never edit/photo-upload for anyone else).

## Frontend design

### Types (`internal/domain/auth/types/auth.ts`)

Extend `ProfileResponse` (and only that — not `UserInfo`, to avoid touching
login/register response shape) with:
```ts
phone?: string | null;
gender?: "male" | "female" | null;
birth_date?: string | null;
photo_url?: string | null;
```
Add `UpdateProfileRequest`, `ChangePasswordRequest` request types mirroring the
backend DTOs.

Because `AuthProvider` builds `session.user` (typed `UserInfo`) from the
`/auth/me` response, extend `UserInfo` too (it's the type actually held in the
store) with the same four optional fields, and update `auth-provider.tsx`'s
mapping to carry them through on session hydration — otherwise phone/gender/
birth_date/photo would vanish on every page refresh.

### API endpoints (`internal/pkg/api/endpoints.ts`)

```ts
auth: {
  ...
  updateProfile: "/auth/me",       // PATCH
  changePassword: "/auth/me/password", // PUT
  uploadPhoto: "/auth/me/photo",   // POST multipart
}
```

### API client (`internal/pkg/api/apiClient.ts`)

Add `apiUpload<T>(path: string, formData: FormData, token?: string): Promise<T>`
— same auth-header/response-envelope handling as `apiClient`, but does **not**
set `Content-Type` (must stay unset so the browser attaches the multipart
boundary itself), and takes `FormData` instead of a JSON string body.

### Service (`internal/domain/auth/services/authService.ts`)

```ts
export function updateProfile(payload: UpdateProfileRequest, token: string) {
  return apiClient<ProfileResponse>(apiEndpoints.auth.updateProfile, {
    method: "PATCH", body: JSON.stringify(payload), token,
  });
}
export function changePassword(payload: ChangePasswordRequest, token: string) {
  return apiClient<void>(apiEndpoints.auth.changePassword, {
    method: "PUT", body: JSON.stringify(payload), token,
  });
}
export function uploadProfilePhoto(file: File, token: string) {
  const formData = new FormData();
  formData.append("image", file);
  return apiUpload<ProfileResponse>(apiEndpoints.auth.uploadPhoto, formData, token);
}
```

### Store (`internal/domain/auth/store/authStore.ts`)

Add `updateUser: (patch: Partial<UserInfo>) => void` that merges into
`session.user` without re-writing auth cookies (those only need the tokens,
which don't change here).

### `ProfileCard.tsx` wiring

- **Personal Info form**: controlled inputs for phone/gender/birth_date (name
  stays editable too since backend now supports it; email stays read-only).
  "Save Changes" calls `updateProfile`, on success calls `updateUser()` +
  shows a saved confirmation; on failure shows the error message inline
  (reuse the existing error-message-under-field convention from
  `LoginForm`/`RegisterForm`).
- **ChangePasswordModal**: `onSuccess` currently just flips to the success
  screen with no request. Wire it to call `changePassword`; only transition to
  `PasswordSuccessModal` after the API call resolves. On failure (wrong
  current password, validation), show the error inside the modal instead of
  advancing — do not close the modal.
- **Photo modals**: `handleFileSelected`'s fake `setInterval` progress
  simulation is replaced with a real `uploadProfilePhoto` call. Since
  `fetch`'s body upload progress isn't observable without `XMLHttpRequest`,
  the progress bar becomes an indeterminate state (0 → holds → 100 on
  response) rather than a fabricated smooth animation — still shows the same
  modal, just honest about progress. On success, `updateUser({ photo_url })`
  and render the real photo (served from the backend's `/uploads` static
  route, so the `<img>` src needs the backend's origin, not the frontend's)
  instead of the initials avatar. No new env var: derive the asset origin
  from the existing `NEXT_PUBLIC_API_URL` by stripping the trailing
  `/api/v1`, via a small shared export (`API_ASSET_ORIGIN` alongside
  `API_BASE_URL` in `internal/pkg/api/apiClient.ts`) so there's a single
  source of truth for both.
- **RemovePhotoModal**: out of scope for this pass — its confirm button stays
  a no-op beyond closing the modal (noted explicitly so it isn't silently
  dropped; only "change photo" and "display photo" need to work end-to-end
  here).

### Avatar display

Wherever the initials circle currently renders (`ProfileCard`, possibly
`AppHeader`/`LandingNavbar` later), if `user.photo_url` is present, render an
`<img>` pointing at `${NEXT_PUBLIC_API_ORIGIN}${photo_url}` instead of the
initials. Scope for this pass: `ProfileCard` only (header avatar is out of
scope — not part of what was asked, and can be revisited separately).

## Error handling

- All backend errors keep the existing `{status:"error", error:{code,message}}`
  envelope; `apiClient`/`apiUpload` throw `Error(message)` from that envelope
  as they already do.
- Wrong current password → shown inline in `ChangePasswordModal`, does not
  close the modal.
- Upload validation failures (bad type/too big) → shown inline in
  `ChangePhotoModal`, modal stays open on the "change" step.
- Network/unexpected errors → generic fallback message via the existing
  `getApiErrorMessage`-style fallback text, non-blocking (user can retry).

## Testing / verification plan

- Backend: `go build ./...` and `go vet ./...` to catch compile issues; no
  existing test suite to extend (none found in `internal/domain/auth`) — this
  matches the codebase's current lack of Go tests elsewhere, so not
  introducing a new pattern here.
- Frontend: `npx tsc --noEmit` and `npm run build`.
- Manual smoke test against a running backend: login, edit profile fields,
  change password (verify old password rejected, new one required to
  re-login), upload a photo (verify it renders, verify old file is deleted
  from `./uploads/profile/`).

## Out of scope for this pass

- Removing a profile photo (revert to initials) — modal UI stays, action is a
  no-op beyond closing, clearly commented as not wired.
- Showing the uploaded photo anywhere other than `ProfileCard` (e.g. header
  avatar).
- Email change.
- Real upload progress percentage (browser `fetch` can't report it without
  switching to `XMLHttpRequest`; not worth the added complexity for this
  feature).
- Rate limiting / lockout on repeated wrong current-password attempts.
