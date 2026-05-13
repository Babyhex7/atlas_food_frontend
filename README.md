# Atlas Food Frontend

Atlas Food Frontend adalah aplikasi web untuk platform survey food recall Atlas Food. Project ini mengikuti konsep MVP dari backend Atlas Food: admin membuat survey, membagikan link/token, lalu responden mengisi recall makanan dengan alur singkat dan pemilihan porsi berbasis gambar.

Backend utama berada di `atlas_food_backend/`. Frontend ini disusun mengikuti pola modular backend: setiap fitur/domain punya folder sendiri di `internal/domain`, sedangkan kebutuhan reusable diletakkan di `internal/pkg`.

---

## Project Overview

Atlas Food adalah platform survey recall makanan yang terinspirasi dari Intake24, tetapi dibuat lebih sederhana untuk kebutuhan MVP. Fokus utamanya adalah membuat sistem yang bisa berjalan cepat dengan fitur inti yang jelas.

### Tujuan MVP

- Admin dapat login dan mengelola survey.
- Admin dapat membuat survey dengan konfigurasi waktu makan dan prompt.
- Survey dapat dibagikan ke responden melalui link/token.
- Responden dapat mengisi makanan/minuman tanpa harus registrasi terlebih dahulu.
- Responden memilih porsi makanan menggunakan gambar porsi.
- Data submission disimpan dalam struktur JSON untuk kebutuhan export dan analisis.

### Fitur Utama

1. **Authentication** — login, register, refresh token, profile.
2. **Survey Management** — CRUD survey untuk admin.
3. **Anonymous Survey Access** — akses survey melalui token/link.
4. **Food Database** — makanan, kategori, dan data nutrisi.
5. **Food Recall Flow** — pilih waktu makan, tambah makanan/minuman, pilih porsi, review, submit.
6. **Portion Selection with Images** — porsi dipilih lewat visual portion guide.
7. **Nutrition Calculation Ready** — struktur siap untuk kalkulasi nutrisi per porsi.
8. **Submission & Export Ready** — struktur data mengikuti format submission backend.

---

## Tech Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Framework | Next.js App Router | Routing dan rendering frontend |
| Language | TypeScript | Type safety |
| UI Library | React | Component model |
| Data Fetching | TanStack Query | Query/mutation API state |
| Styling | Global CSS | Styling dasar MVP |
| API Client | Fetch wrapper | Komunikasi dengan backend Atlas Food |
| Auth | JWT + Refresh Token | Mengikuti backend auth flow |

---

## Backend API

Default backend base URL:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

API response backend menggunakan format umum:

```json
{
  "status": "success",
  "data": {}
}
```

Error response:

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data"
  }
}
```

`apiClient` di frontend sudah melakukan unwrap `data`, jadi service seperti `login()` atau `getSurveys()` langsung mengembalikan data utama.

### Endpoint aktif di backend saat ini

#### Auth

```http
POST /auth/register
POST /auth/login
POST /auth/refresh
GET  /auth/me
```

#### Admin Survey

```http
GET    /admin/surveys
POST   /admin/surveys
GET    /admin/surveys/:id
PUT    /admin/surveys/:id
DELETE /admin/surveys/:id
POST   /admin/surveys/:id/clone
```

#### Public Survey

```http
GET  /surveys/:accessToken
POST /surveys/:accessToken/join
```

### Endpoint scaffold dari backend docs/migrations

Endpoint berikut sudah disiapkan struktur frontend-nya, tetapi backend router/domain belum semuanya aktif:

```http
GET    /categories
GET    /foods/search?q=nasi
GET    /foods/:id
GET    /foods/:id/portion-methods
GET    /portion-methods/:id/options
GET    /as-served-sets/:code/images
POST   /survey/submit
GET    /admin/foods
POST   /admin/foods
PUT    /admin/foods/:id
DELETE /admin/foods/:id
GET    /admin/categories
POST   /admin/categories
PUT    /admin/categories/:id
GET    /admin/as-served-sets
POST   /admin/as-served-sets
GET    /admin/surveys/:id/submissions
GET    /admin/surveys/:id/export?format=csv
```

---

## User Flow

### Admin Flow

```text
Login ──▶ Create Survey ──▶ Configure Meals & Prompts ──▶ Manage Food DB ──▶ Set Portion Images ──▶ Share Link/Token
```

### Respondent Flow

```text
Link ──▶ Join Survey ──▶ Pilih Waktu Makan ──▶ Add Foods/Drinks ──▶ Portion Selection ──▶ Review ──▶ Submit ──▶ Done
```

### Respondent Step Detail

1. **Join Survey**
   - Responden membuka link/token survey.
   - Survey public diambil menggunakan `accessToken`.

2. **Pilih/Edit Waktu Makan**
   - Contoh: Sarapan, Snack Pagi, Makan Siang, Snack Sore, Makan Malam.

3. **Add Makanan & Minuman**
   - Responden mencari makanan/minuman.
   - Item ditambahkan dulu ke list, porsi dipilih setelahnya.

4. **Portion Selection**
   - Tipe simple grid: 1/2 porsi, 1 porsi, 1.5 porsi, dan seterusnya.
   - Tipe as served quantity: pilih gambar porsi, lalu atur whole/fraction quantity.
   - Fallback manual input gram.

5. **Review & Submit**
   - Responden melihat ringkasan makanan per meal.
   - Bisa edit porsi atau tambah makanan sebelum submit.

---

## Folder Structure

Struktur frontend dibuat mengikuti pola backend `internal/domain` dan `internal/pkg`.

```text
atlas_food_frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── profile/
│   │   └── page.tsx
│   ├── admin/
│   │   ├── surveys/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── submissions/page.tsx
│   │   ├── foods/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── categories/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── portion-methods/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── as-served-sets/
│   │       ├── page.tsx
│   │       ├── new/page.tsx
│   │       └── [id]/
│   │           ├── page.tsx
│   │           └── images/page.tsx
│   └── surveys/
│       └── [accessToken]/
│           ├── page.tsx
│           ├── join/page.tsx
│           ├── recall/page.tsx
│           ├── review/page.tsx
│           └── done/page.tsx
│
├── internal/
│   ├── domain/
│   │   ├── auth/
│   │   ├── survey/
│   │   ├── category/
│   │   ├── food/
│   │   ├── nutrition/
│   │   ├── portion/
│   │   ├── recall/
│   │   └── submission/
│   │
│   └── pkg/
│       ├── api/
│       ├── components/
│       ├── constants/
│       ├── hooks/
│       ├── lib/
│       ├── providers/
│       └── utils/
│
├── public/
├── styles/
│   └── globals.css
├── middleware.ts
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── package.json
└── README.md
```

---

## Module Pattern

### Domain Folder

Semua domain menggunakan struktur yang sama:

```text
internal/domain/<domain>/
├── components/   # UI khusus domain
├── constants/    # status, enum, static values
├── hooks/        # custom hooks dan query hooks
├── schemas/      # aturan validasi frontend
├── services/     # fungsi API/domain service
├── store/        # initial state / state shape
├── types/        # DTO dan model TypeScript
└── index.ts      # public exports domain
```

Pola ini meniru backend:

```text
internal/domain/<domain>/
├── handler.go
├── service.go
├── repository.go
├── dto.go
└── model.go
```

Di frontend, padanannya:

| Backend | Frontend |
| --- | --- |
| `handler.go` | `app/**/page.tsx` |
| `service.go` | `services/*.ts` |
| `dto.go` / `model.go` | `types/*.ts` |
| shared middleware/utils | `internal/pkg/*` |
| route setup | `app/` + `middleware.ts` |

### Shared Package Folder

`internal/pkg` berisi kode reusable lintas domain:

- `api/` — `apiClient`, endpoint constants.
- `components/` — Button, Input, Modal, EmptyState, PageHeader.
- `hooks/` — hooks reusable seperti `useDebounce`.
- `lib/` — library config seperti React Query client.
- `providers/` — provider global seperti QueryProvider.
- `utils/` — helper response/date.
- `constants/` — route constants.

---

## Domains

### Auth

Auth mengikuti backend domain `auth`.

```text
internal/domain/auth/
├── components/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── ProfileCard.tsx
├── constants/authRoles.ts
├── hooks/useAuth.ts
├── schemas/authSchema.ts
├── services/authService.ts
├── store/authStore.ts
├── types/auth.ts
└── index.ts
```

DTO/service utama:

- `RegisterRequest`, `LoginRequest`, `RefreshTokenRequest`
- `AuthResponse`, `UserInfo`, `ProfileResponse`
- `login`, `register`, `refreshToken`, `getProfile`

### Survey

Survey mengikuti backend domain `survey`.

```text
internal/domain/survey/
├── components/
│   ├── JoinSurvey.tsx
│   ├── MealConfigFields.tsx
│   ├── PublicSurvey.tsx
│   ├── SurveyForm.tsx
│   └── SurveyList.tsx
├── constants/surveyStatus.ts
├── hooks/
│   ├── useSurveyQueries.ts
│   └── useSurveySearch.ts
├── schemas/surveySchema.ts
├── services/surveyService.ts
├── store/surveyStore.ts
├── types/survey.ts
└── index.ts
```

DTO/service utama:

- `MealConfig`, `SurveyPrompts`, `Survey`, `SurveyParticipant`, `Locale`
- `CreateSurveyRequest`, `UpdateSurveyRequest`, `JoinSurveyResponse`
- `getSurveys`, `createSurvey`, `getSurveyById`, `updateSurvey`, `deleteSurvey`, `cloneSurvey`, `getPublicSurvey`, `joinSurvey`

### Category

Category disiapkan untuk tabel `categories`.

```text
internal/domain/category/
├── components/
│   ├── CategoryForm.tsx
│   └── CategoryList.tsx
├── constants/categoryDefaults.ts
├── hooks/useCategoryQueries.ts
├── schemas/categorySchema.ts
├── services/categoryService.ts
├── store/categoryStore.ts
├── types/category.ts
└── index.ts
```

DTO/service utama:

- `Category`, `CreateCategoryRequest`, `UpdateCategoryRequest`
- `getCategories`, `createCategory`, `updateCategory`

### Food

Food disiapkan untuk tabel `foods`, `food_categories`, dan `associated_foods`.

```text
internal/domain/food/
├── components/
│   ├── FoodForm.tsx
│   ├── FoodList.tsx
│   └── FoodSearch.tsx
├── constants/foodDefaults.ts
├── hooks/useFoodQueries.ts
├── schemas/foodSchema.ts
├── services/foodService.ts
├── store/foodStore.ts
├── types/food.ts
└── index.ts
```

DTO/service utama:

- `Food`, `CreateFoodRequest`, `UpdateFoodRequest`, `AssociatedFood`
- `searchFoods`, `getFoodById`, `getAdminFoods`, `createFood`, `updateFood`, `deleteFood`

### Nutrition

Nutrition disiapkan untuk tabel `nutrient_units`, `nutrient_types`, dan `food_nutrients`.

```text
internal/domain/nutrition/
├── components/NutritionSummary.tsx
├── constants/nutrientCodes.ts
├── hooks/useNutritionCalculation.ts
├── schemas/nutritionSchema.ts
├── services/nutritionService.ts
├── store/nutritionStore.ts
├── types/nutrition.ts
└── index.ts
```

DTO/service utama:

- `NutrientUnit`, `NutrientType`, `FoodNutrient`, `CalculatedNutrient`, `NutritionMap`
- `getNutrientUnits`, `getNutrientTypes`

### Portion

Portion disiapkan untuk tabel `food_portion_size_methods`, `as_served_sets`, dan `as_served_images`.

```text
internal/domain/portion/
├── components/
│   ├── AsServedSetForm.tsx
│   ├── PortionMethodList.tsx
│   └── PortionSelector.tsx
├── constants/portionMethodTypes.ts
├── hooks/usePortionQueries.ts
├── schemas/portionSchema.ts
├── services/portionService.ts
├── store/portionStore.ts
├── types/portion.ts
└── index.ts
```

DTO/service utama:

- `FoodPortionSizeMethod`, `AsServedSet`, `AsServedImage`, `SelectedPortion`
- `getFoodPortionMethods`, `getAdminFoodPortionMethods`, `getPortionMethodOptions`, `getAsServedSets`, `getAsServedSetImages`

### Recall

Recall adalah domain frontend untuk flow responden. Ini belum punya domain backend sendiri karena backend menyimpan hasil akhirnya sebagai submission JSON.

```text
internal/domain/recall/
├── components/
│   ├── FoodStep.tsx
│   ├── MealStep.tsx
│   ├── PortionStep.tsx
│   └── RecallWizard.tsx
├── constants/recallSteps.ts
├── hooks/useRecallSession.ts
├── schemas/recallSchema.ts
├── services/recallStorage.ts
├── store/recallStore.ts
├── types/recall.ts
└── index.ts
```

DTO/service utama:

- `RecallStep`, `RecallMeal`, `RecallFood`, `RecallSession`
- `saveRecallSession`, `getRecallSession`, `clearRecallSession`

### Submission

Submission disiapkan untuk tabel `survey_submissions` dan export data.

```text
internal/domain/submission/
├── components/
│   ├── SubmissionList.tsx
│   └── SubmissionReview.tsx
├── constants/exportFormats.ts
├── hooks/useSubmissionQueries.ts
├── schemas/submissionSchema.ts
├── services/submissionService.ts
├── store/submissionStore.ts
├── types/submission.ts
└── index.ts
```

DTO/service utama:

- `SubmissionFood`, `SubmissionMeal`, `MissingFood`, `SurveySubmission`, `CreateSubmissionRequest`
- `submitSurvey`, `getSurveySubmissions`, `getSurveyExportUrl`

---

## Environment Setup

Copy env example:

```bash
cp .env.example .env.local
```

Isi default:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

Pastikan backend berjalan di port `8080`.

---

## Installation

```bash
npm install
```

---

## Development

```bash
npm run dev
```

Aplikasi akan berjalan di default Next.js dev server.

---

## Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build production app
npm run start      # Start production server
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript check
```

---

## Validation

Project sudah disiapkan agar bisa dicek dengan:

```bash
npm run typecheck
npm run lint
```

---

## Development Notes

- Gunakan alias import `@/` untuk import dari root project.
- Simpan kode fitur di `internal/domain/<feature>`.
- Simpan kode reusable di `internal/pkg`.
- Jangan duplikasi DTO backend secara manual tanpa cek file backend terkait.
- Backend saat ini membungkus response dalam `{ status, data, error }`; gunakan `apiClient` agar unwrap konsisten.
- Untuk MVP, session progress recall bisa disimpan di `localStorage` terlebih dahulu, mengikuti catatan backend.
- Multi-language bisa menggunakan JSON/frontend i18n dulu; tabel translation DB belum menjadi prioritas MVP.
- Beberapa module seperti food, portion, nutrition, dan submission masih scaffold/ready-for-backend karena route backend aktif saat ini baru mencakup auth dan survey.

---

## MVP Scope

### Masuk MVP

- Login/auth sederhana dengan JWT.
- CRUD survey admin.
- Public survey via access token.
- Meal config berbasis JSON.
- Prompt survey berbasis JSON.
- Food database dan kategori.
- Nutrisi per makanan per 100g.
- Portion selection berbasis gambar.
- Recall flow responden.
- Submission JSON.
- Export data dari backend.

### Ditunda Setelah MVP

- RBAC kompleks.
- Social login.
- Password reset email.
- Session auto-save ke database.
- Food synonyms/fuzzy search lanjutan.
- Multi-language berbasis database.
- Image processing otomatis.
- Multiple nutrient sources.

---

## Reference Backend Docs

Dokumentasi sumber project berada di backend:

- `atlas_food_backend/docs/01-overview.md`
- `atlas_food_backend/docs/02-tech-stack.md`
- `atlas_food_backend/docs/04-api-documentation.md`
- `atlas_food_backend/docs/05-workflow-alur.md`
- `atlas_food_backend/BRIFING.MD`
