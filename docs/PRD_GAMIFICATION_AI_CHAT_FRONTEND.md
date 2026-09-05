# PRD — Gamifikasi & AI Chat NutriBot (Frontend)
> **Feature Branch**: `feature/gamification-ai-chat`
> **Repo**: `atlas_food_frontend`
> **Status**: Rancangan Awal (Draft)
> **Tanggal**: September 2026

---

## 1. Gambaran Umum

Dokumen ini mendefinisikan rencana implementasi **sisi Frontend (Next.js)** untuk dua fitur baru:
1. **Sistem Gamifikasi** — XP, Daily Streak, Leaderboard, dan Badges
2. **NutriBot AI Chat** — Floating Widget + Halaman Penuh `/ai-chat`

Untuk detail konsep, mekanisme backend, dan database schema, lihat:
- [`docs/PRD_GAMIFICATION.md`](../docs/PRD_GAMIFICATION.md) (Backend repo)
- [`docs/PRD_AI_CHAT.md`](../docs/PRD_AI_CHAT.md) (Backend repo)

---

## 2. Struktur File & Komponen Baru

### 2.1 Gamifikasi

```
app/
└── leaderboard/
    ├── page.tsx                          -- Halaman /leaderboard (SSR)
    └── LeaderboardContent.tsx            -- Client component leaderboard

internal/
├── components/
│   └── gamification/
│       ├── StreakBadge.tsx               -- Badge 🔥 N Hari di Header Topbar
│       ├── XPProgressBar.tsx             -- Progress bar XP menuju level berikutnya
│       ├── LevelBadge.tsx               -- Badge level & rank name pengguna
│       ├── BadgeGallery.tsx             -- Grid koleksi achievement badge
│       ├── LeaderboardPodium.tsx         -- Podium juara 1, 2, 3 dengan animasi
│       ├── LeaderboardRow.tsx            -- Baris peringkat list (4 ke bawah)
│       └── XPToast.tsx                  -- Toast notifikasi "+30 XP Diperoleh!" pop-up
└── domain/
    └── gamification/
        ├── types/
        │   └── gamification.ts          -- TypeScript types (UserGamification, Badge, Leaderboard)
        ├── hooks/
        │   ├── useGamificationProfile.ts -- React Query: GET /api/v1/gamification/profile
        │   └── useLeaderboard.ts         -- React Query: GET /api/v1/gamification/leaderboard
        └── api/
            └── gamificationApi.ts        -- Fetch wrapper untuk semua gamification endpoint
```

### 2.2 AI Chat NutriBot

```
app/
└── ai-chat/
    ├── page.tsx                          -- Halaman /ai-chat (SSR shell)
    └── AiChatContent.tsx                 -- Client component utama

internal/
├── components/
│   └── ai/
│       ├── NutriChatWidget.tsx           -- Floating FAB + pop-up window (global)
│       ├── NutriChatWindow.tsx           -- Jendela chat pop-up 360x520
│       ├── ChatBubble.tsx               -- Bubble pesan (user = kanan, AI = kiri)
│       ├── TypingIndicator.tsx           -- Animasi 3 dots saat AI sedang merespons
│       └── QuickPrompts.tsx             -- Panel 6 quick prompt suggestions
└── domain/
    └── ai/
        ├── types/
        │   └── chat.ts                  -- TypeScript types (ChatMessage, ChatSession)
        ├── hooks/
        │   └── useNutriChat.ts          -- React Query + mutation hook untuk chat
        └── store/
            └── chatStore.ts             -- Zustand store: isOpen, sessionId, messages
```

---

## 3. Wireframe & Deskripsi UI

### 3.1 Gamifikasi di AppHeader (Topbar)

**Posisi**: Di sebelah kiri `CollabHeaderControls` (sebelum tombol kolaborasi).

```
┌─────────────────────────────────────────────────────────────────┐
│ Atlas Food  🏠 Beranda  📊 Survei  🍽️ Find Food     🔥5  L2  👤 │
│                                                     ↑   ↑       │
│                                              Streak Badge Level  │
└─────────────────────────────────────────────────────────────────┘
```

- **🔥5** → `StreakBadge` — klik membuka modal info streak singkat
- **L2** → `LevelBadge` — menampilkan level & rank name

---

### 3.2 Halaman Leaderboard (`/leaderboard`)

```
┌──────────────────────────────────────────────────┐
│           🏆 Papan Peringkat Atlas Food           │
│  [ Mingguan ]  [ Bulanan ]  [ All-Time ]  ← Tabs │
├──────────────────────────────────────────────────┤
│     🥈 @andi         🥇 @bagas       🥉 @dina    │
│    780 XP           850 XP          710 XP       │
│  ← Podium animasi (Card dengan mahkota & avatar) →│
├──────────────────────────────────────────────────┤
│  #4  @eka         •  Nutri Champion  •  650 XP   │
│  #5  @fajar       •  Gizi Explorer   •  380 XP   │
│  ...                                             │
├──────────────────────────────────────────────────┤
│  👤 Kamu di Peringkat #5 dengan 380 XP           │
│     (sticky row highlight di bagian bawah)        │
└──────────────────────────────────────────────────┘
```

---

### 3.3 NutriChatWidget — Floating (Global)

**State Collapsed** (FAB):
```
                              ╭──────╮
                              │  🤖  │  ← tombol bulat 56x56, pojok kanan bawah
                              ╰──────╯
```

**State Expanded** (Pop-up):
```
                    ┌───────────────────────┐
                    │ 🤖 NutriBot AI   _ ↗ X│ ← minimize, expand, close
                    ├───────────────────────┤
                    │                       │
                    │  Halo! Saya NutriBot, │
                    │  asisten gizi Atlas.  │
                    │  Ada yang bisa saya   │
                    │  bantu? 😊            │
                    │                       │
                    │  [User]: Kalori nasi? │
                    │  [AI]: Nasi putih 1   │
                    │  centong (100g)...    │
                    │                       │
                    ├───────────────────────┤
                    │  💡 Quick Prompts:    │
                    │  ┌─────────────────┐  │
                    │  │ Makanan murah.. │  │
                    │  └─────────────────┘  │
                    ├───────────────────────┤
                    │ Tulis pertanyaan...🚀 │
                    └───────────────────────┘
```

---

### 3.4 Halaman Penuh `/ai-chat`

```
┌─────────────────┬─────────────────────────────────────┐
│ 📝 Sesi Saya    │  🤖 NutriBot AI                     │
│ ─────────────── │  ────────────────────────────────── │
│ > Sesi 1        │  [AI] Halo! Saya NutriBot...        │
│   Sep 5, 2026   │                                      │
│                 │  [User] Berapa kalori nasi padang?   │
│ > Sesi 2        │  [AI] Nasi Padang satu porsi...     │
│   Sep 3, 2026   │                                      │
│                 │  [AI] ●●● (typing indicator)         │
│ + Sesi Baru     │                                      │
│                 │  ─────────────────────────────────── │
│                 │  Tulis pertanyaan gizi...        🚀  │
└─────────────────┴─────────────────────────────────────┘
```

---

## 4. State Management (Zustand Store)

### `chatStore.ts`

```typescript
interface ChatStore {
  // Widget state
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;

  // Session
  sessionId: string | null;
  setSessionId: (id: string | null) => void;

  // Messages (in-memory, current session)
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;

  // Loading
  isTyping: boolean;
  setIsTyping: (v: boolean) => void;
}
```

---

## 5. Hooks & API Integration

### `useNutriChat.ts`

```typescript
const useNutriChat = () => {
  const sendMessage = useMutation({
    mutationFn: (req: ChatRequest) => chatApi.sendMessage(req),
    onSuccess: (data) => {
      addMessage({ role: 'assistant', content: data.reply });
      if (data.xp_earned > 0) showXPToast(data.xp_earned);
      setSessionId(data.session_id);
      setIsTyping(false);
    },
  });

  return { sendMessage, isTyping };
};
```

### `useGamificationProfile.ts`

```typescript
const useGamificationProfile = () => {
  return useQuery({
    queryKey: ['gamification', 'profile'],
    queryFn: () => gamificationApi.getProfile(),
    staleTime: 1000 * 60 * 5, // 5 menit
  });
};
```

---

## 6. Integrasi dengan Layout Root

`NutriChatWidget` dirender **sekali** di `app/layout.tsx` agar tersedia di semua halaman:

```tsx
// app/layout.tsx
import { NutriChatWidget } from '@/internal/components/ai/NutriChatWidget';

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {children}
        <NutriChatWidget />   {/* ← Floating AI chat, global */}
      </body>
    </html>
  );
}
```

`StreakBadge` & `LevelBadge` dirender di `AppHeader.tsx`.

---

## 7. Rencana Sprint Pengerjaan (Frontend)

| Sprint | Task Frontend |
| :--- | :--- |
| Sprint 1 | Setup types gamifikasi & AI chat (`gamification.ts`, `chat.ts`) |
| Sprint 2 | Setup store Zustand (`chatStore.ts`) |
| Sprint 3 | Build `gamificationApi.ts`, hooks `useGamificationProfile`, `useLeaderboard` |
| Sprint 4 | Build `chatApi.ts`, hook `useNutriChat` |
| Sprint 5 | Build `StreakBadge`, `LevelBadge`, `XPToast` — integrasi ke `AppHeader` |
| Sprint 6 | Build `LeaderboardPodium`, `LeaderboardRow`, halaman `/leaderboard` |
| Sprint 7 | Build `NutriChatWidget`, `NutriChatWindow`, `ChatBubble`, `TypingIndicator` |
| Sprint 8 | Build halaman `/ai-chat` (full page + `SessionSidebar`) |
| Sprint 9 | Build `QuickPrompts`, `BadgeGallery` |
| Sprint 10 | Polish animasi, responsive mobile, dark mode, accessibility |
