# PRD — Cursor Chat (floating chat-on-cursor, ala Figma)

Status: Draft for review · Owner: TBD · Target repos: `atlas_food_frontend`, `atlas_food_backend`

## 1. Latar belakang

Fitur real-time collaboration sudah berjalan di domain `collab` (FE:
`internal/domain/collab/`, BE: `internal/domain/collab/`) — presence, live
cursor, viewport-follow, field locking, dan chat panel biasa (`chat_message`)
semua sudah ada di atas satu WebSocket hub per-room, in-memory, tanpa
persist ke DB.

**Cursor Chat** yang diminta adalah varian Figma: bukan panel chat terpisah,
tapi bubble teks kecil yang nempel langsung di ujung kursor pengguna,
dipicu tombol `/`, dan hilang otomatis. Ini value-nya beda dari chat panel
yang sudah ada — cursor chat itu *in-context* ("gua lagi ngomongin baris
ini") sedangkan chat panel itu *general-purpose*.

Dokumen ini adalah PRD sebelum implementasi. Semua desain di bawah disusun
supaya **numpang di infrastruktur yang sudah ada**, bukan bikin jalur
WebSocket baru.

### Koreksi penting dari brief awal

Brief awal (gaya Figma) mengasumsikan kanvas infinite dengan zoom/pan, jadi
posisi kursor dihitung dalam *world coordinates*. App ini **bukan kanvas** —
ini admin web app biasa (form survey/food/kategori) yang di-scroll normal.
`useLiveCursor.ts` sudah mengirim posisi sebagai **document coordinates**
(`clientX + window.scrollX`, `clientY + window.scrollY`), dan payload
`viewport_update` punya field `zoom` yang sampai sekarang **tidak dipakai**
FE (vestigial). PRD ini memakai model koordinat yang sudah ada — dokumen
coordinates relatif scroll — bukan world-space dengan transform zoom.

## 2. Tujuan (Goals)

- Pengguna bisa menekan `/` di halaman admin (bukan saat fokus ada di form
  field) untuk memunculkan input kecil menempel di kursornya.
- Teks yang diketik muncul real-time sebagai bubble di kursor pengguna lain
  yang ada di room/halaman yang sama.
- Bubble hilang otomatis (fade out) saat `Esc`, `Enter`, atau idle beberapa
  detik — tidak meninggalkan jejak permanen di mana pun.
- Reuse penuh: room, presence, warna user, throttle pattern, dan koneksi
  WebSocket yang sudah ada di domain `collab`.

## 3. Non-goals (scope eksplisit di luar)

- **Bukan pengganti chat panel** (`ActivityFeed` / `chat_message`). Cursor
  chat tidak masuk history, tidak muncul di `ActivityFeed.tsx`, tidak
  disimpan di ring-buffer 100-pesan yang dipakai `get_history`.
- Tidak ada notifikasi push/email/nudge saat bubble muncul.
- Tidak ada dukungan mobile/touch pada fase pertama (`/` adalah keyboard
  shortcut; app ini dipakai admin di desktop).
- Tidak ada rich text, emoji picker, atau mention (`@user`) di fase pertama.
- Tidak mengubah model `zoom`/canvas — tetap document-coordinate.

## 4. User stories

1. Sebagai admin yang lagi review submission bareng rekan, saya mau bisa
   ngetik komentar cepat yang nempel di posisi kursor saya, biar rekan saya
   tahu persis saya lagi nunjuk ke mana — tanpa buka panel chat terpisah.
2. Sebagai admin yang lihat rekan lain lagi nunjuk sesuatu, saya mau lihat
   bubble teksnya muncul dekat kursor mereka secara real-time, lalu hilang
   sendiri setelah beberapa detik supaya layar nggak penuh sisa chat lama.
3. Sebagai admin yang sedang mengetik di field form (nama survey, deskripsi,
   dll), saya TIDAK mau tombol `/` malah membuka cursor chat dan mengganggu
   input saya.

## 5. Alur kerja end-to-end (disesuaikan dengan arsitektur nyata)

1. **Aktivasi (FE).** `keydown` listener di level dokumen (didaftarkan di
   `CollabSession.tsx`, sejalan dengan `useLiveCursor`/`useFollowMode` yang
   sudah hidup di situ) menangkap `/`. Guard wajib: **abaikan kalau
   `document.activeElement` adalah `input`, `textarea`, `select`, atau
   `[contenteditable]`** — ini beda dari Figma yang kanvasnya tidak punya
   form field bersaing untuk tombol yang sama. Tanpa guard ini fitur akan
   merusak semua form di app (survey, food, category).
2. **Input muncul.** Bubble input kecil dirender menempel di posisi kursor
   lokal saat ini (posisi terakhir dari `useLiveCursor`), fokus keyboard
   pindah ke input tsb. Posisi input **tidak ikut bergerak mengikuti mouse**
   selagi mengetik (biar teks nggak "kabur", sama seperti Figma) — dia
   nempel di titik saat `/` ditekan, dan baru re-anchor ke kursor pas bubble
   berikutnya dibuka.
3. **Kalkulasi posisi.** Sama persis dengan `useLiveCursor.ts` sekarang:
   document coordinates (`clientX/clientY + scrollX/scrollY`). Saat
   render di peer, dikonversi balik ke viewport coordinates dan difilter
   dengan margin visibility yang sama dengan `LiveCursorOverlay.tsx`
   (±40px) supaya bubble di luar layar tidak dirender.
4. **Kirim ke server.** Numpang koneksi WebSocket yang sama
   (`useWebSocket.ts`), room yang sama (room = per halaman/survey, via
   `generateRoomId`). Tidak ada koneksi baru.
5. **Broadcast di server.** Numpang `Room`/`Hub` yang sama. Payload cursor
   chat dititipkan di message envelope yang sama dengan `cursor_move` (lihat
   §6), lalu diteruskan lewat jalur batching 50ms yang sudah ada
   (`room.go` `AddMessage`, coalesce-ke-terbaru per user) — cukup tepat
   karena yang penting cuma state *terakhir* tiap user, sama seperti posisi
   kursor.
6. **Render di peer.** `LiveCursorOverlay.tsx` (atau komponen turunannya)
   menggambar bubble teks di atas cursor pointer SVG yang sudah ada,
   memakai warna user yang sama (`colorForUserId`).
7. **Lifecycle / dismiss.**
   - `Enter` → kirim state final, lalu fade-out setelah ~2 detik (biar
     rekan sempat baca sebelum hilang) — bukan langsung hilang seperti
     salah tafsir umum dari Figma.
   - `Esc` → batal, fade-out langsung, tidak broadcast apa pun (atau
     broadcast "closed" kalau bubble sudah sempat terkirim).
   - Idle mengetik (tidak ada keystroke) selama **6–8 detik** → auto
     fade-out + broadcast "closed", sama seperti Figma.
   - Disconnect mendadak (koneksi putus) → ditangani oleh mekanisme yang
     **sudah ada**: `Hub` sudah broadcast `presence_left` saat client register
     hilang; cursor chat tinggal didaftarkan ke handler yang sama supaya
     bubble "hantu" ikut dibersihkan di sisi peer saat presence_left masuk —
     tidak perlu heartbeat baru, cukup reuse ping/pong yang sudah jalan
     (`client.go` `pongWait=60s`).

## 6. Protokol pesan (extension, bukan sistem baru)

Dua pilihan desain — direkomendasikan **Opsi A**.

**Opsi A (direkomendasikan): tipe pesan baru, payload ringkas, numpang
jalur batching cursor yang sudah ada.**

Tambah 3 tipe di `message.go` sejalar dengan tipe yang sudah ada
(`cursor_move`, `follow_user`, dst):

- `cursor_chat_open` — payload: `{x, y, text}` (text awal biasanya kosong)
- `cursor_chat_update` — payload: `{x, y, text}` (dikirim tiap perubahan
  teks, di-debounce di FE ~120ms — teks pendek, tidak perlu setipis
  throttle mousemove 66ms)
- `cursor_chat_close` — payload: `{}` (menandakan bubble ditutup: enter
  timeout, atau esc)

Server broadcast balik sebagai `cursor_chat_updated` /
`cursor_chat_closed` ke semua client lain di room (exclude sender — pola
yang sama dengan broadcast cursor lain), dilewatkan lewat batching 50ms
yang sama supaya tidak menambah beban WebSocket baru.

**Opsi B (alternatif, ditolak untuk fase 1):** menumpangkan field `chat`
opsional langsung di payload `cursor_move`/`cursor_update` yang sudah ada.
Lebih hemat 1 roundtrip tapi mencampur semantik "posisi mouse mentah" (event
frequency tinggi, tidak perlu tahan lama) dengan "pesan chat" (event jarang,
harus reliable sampai close). Opsi A dipilih karena lifecycle-nya beda dan
supaya `cursor_move` tetap ringan tanpa payload teks nempel di setiap
gerakan mouse.

**Nol persistence** — konsisten dengan seluruh domain `collab` sekarang
(komentar di `hub.go:9`: "in-memory; Redis deferred"): cursor chat tidak
pernah masuk `Room` history ring-buffer, tidak ada endpoint REST, tidak ada
tabel DB.

## 7. Desain teknis — Backend (`atlas_food_backend`)

- `message.go`: tambah 3 konstanta tipe pesan + payload struct (§6).
- `client.go`: handler baru sejajar `handleCursorMove`
  (`client.go:268-279`) dan `handleViewportUpdate` (`client.go:282-303`) —
  pola yang sama: baca payload, validasi ringan (`text` di-trim & dibatasi
  panjang maks, misal 200 karakter, untuk cegah payload nakal), lempar ke
  `Room.AddMessage` buat batching.
- `room.go` `AddMessage`: extend logic coalesce (baris 64-113) supaya
  `cursor_chat_*` per-user juga coalesce-ke-terbaru seperti `cursor_move`,
  bukan diakumulasi.
- Broadcast exclude-sender: ikuti pola broadcast cursor yang sudah ada
  (perlu diverifikasi saat implementasi — kalau broadcast umum saat ini
  ternyata include-sender, cursor chat harus tetap exclude-sender secara
  eksplisit, karena user sendiri sudah lihat bubble-nya secara lokal/optimistic).
- Cleanup saat disconnect: hook ke jalur `presence_left` yang sudah ada di
  `Hub` (tidak perlu logic baru — cukup pastikan FE menganggap
  `presence_left` sebagai sinyal "hapus bubble user ini juga").

## 8. Desain teknis — Frontend (`atlas_food_frontend`)

- **Hook baru `useCursorChat.ts`** (sejajar `useLiveCursor.ts`,
  `useFollowMode.ts`) — tanggung jawab:
  - `keydown` listener global untuk `/` dengan guard elemen-fokus (§5.1).
  - State: `{ open: boolean, anchor: {x,y}, text: string }` lokal, plus map
    peer bubbles dari `collabStore` (state management yang sudah dipakai
    presence/cursor sekarang).
  - Debounce pengiriman `cursor_chat_update` (~120ms) — pola serupa
    `throttle()` yang sudah ada di `useLiveCursor.ts:8-37`, tinggal reuse
    helper-nya, cukup ganti interval.
  - Timer idle (6–8 detik) dan timer post-Enter (~2 detik) untuk trigger
    `cursor_chat_close`.
- **Routing pesan masuk**: daftarkan 3 tipe baru di `lib/messageRouter.ts`
  (pola yang sama dipakai `useFollowMode` untuk `follow_started` dst.).
- **Rendering**: extend `LiveCursorOverlay.tsx` — bubble teks digambar
  menempel di atas SVG pointer yang sudah ada per peer, pakai warna yang
  sama (`colorForUserId`, `types/collab.ts:80-87`). Local user's own bubble
  dirender optimistic (langsung dari state lokal, tidak nunggu round-trip
  server) supaya terasa instan.
- **Posisi**: GPU-friendly — gerakkan bubble dengan `transform:
  translate3d(...)`, bukan `top`/`left`, konsisten dengan requirement
  performa asli (`LiveCursorOverlay.tsx` perlu dicek apakah sudah begini;
  kalau belum, sekalian dibenerin karena reused di sini).
- **Smoothing**: transisi CSS pendek (50–80ms) di posisi bubble peer, sama
  seperti requirement asli — karena posisi dikirim per-batch 50ms, bukan
  kontinu.

## 9. Best-practice performa (mapping ke infra yang sudah ada)

| Prinsip dari brief | Sudah ada? | Tindakan |
|---|---|---|
| Throttle mousemove ~30–50/s | Ya — 66ms di `useLiveCursor.ts` | Reuse, tidak perlu diubah |
| Payload ringkas | Ya — envelope minimal | Tambah `text` dengan cap panjang 200 char |
| Exclude sender di broadcast | Perlu diverifikasi | Pastikan eksplisit untuk cursor chat |
| Heartbeat & ghost cleanup | Ya — ping/pong 25s/60s + `presence_left` | Reuse, cursor chat numpang sinyal `presence_left` |
| Zero DB storage | Ya — seluruh hub in-memory | Tidak perlu kerjaan tambahan |
| GPU transform (translate3d) | Perlu dicek di `LiveCursorOverlay.tsx` | Audit & benerin kalau masih pakai top/left |
| Interpolation/smoothing | Perlu dicek | Tambah transisi CSS pendek kalau belum ada |
| Decoupled cursor-position vs text update | N/A (baru) | `cursor_move` tetap ringan; teks lewat tipe pesan terpisah (Opsi A) |

## 10. Edge cases

- **Tombol `/` di dalam form field** → harus di-ignore (guard §5.1). Ini
  edge case paling kritis karena app ini penuh form (survey, food,
  category), beda total dari kanvas Figma yang minim text input bersaing.
- Dua bubble dibuka cepat berurutan oleh user yang sama → close bubble lama
  dulu (broadcast `cursor_chat_close`) sebelum open yang baru, supaya peer
  tidak lihat 2 bubble dari user yang sama.
- User pindah room/halaman selagi bubble terbuka → treat seperti
  disconnect: `cursor_chat_close` otomatis (memakai pola yang sama dengan
  cleanup saat ganti room di `useWebSocket.ts`).
- Peer join di tengah bubble sedang terbuka → karena tidak ada history
  untuk cursor chat (by design, §3), peer yang baru join tidak akan lihat
  bubble yang sudah terbuka sebelum dia connect. Ini disengaja (konsisten
  dengan "ephemeral", bukan bug).
- Teks kosong lalu `Enter` → treat sama seperti `Esc` (batal, tidak
  broadcast), bukan kirim bubble kosong.
- Room dengan role `viewer` (lihat `RoomRole` di `message.go:39-43`) → perlu
  keputusan produk: apakah viewer boleh cursor-chat, atau read-only murni
  seperti field-locking? Lihat open question §12.

## 11. Success metrics (kualitatif untuk fase 1, app internal)

- Bubble muncul di peer dalam <150ms dari keystroke pengirim (mengikuti
  batas batching 50ms server + jaringan).
- Tidak ada bubble "hantu" tertinggal setelah user disconnect abrupt
  (browser close/refresh) dalam pengujian manual.
- Tidak ada regresi: tombol `/` tidak pernah men-trigger cursor chat saat
  fokus ada di form field manapun di seluruh admin (survey/food/category
  forms) — ini regression check wajib sebelum merge.

## 12. Open questions (butuh keputusan sebelum implementasi)

1. **Viewer role** boleh pakai cursor chat, atau dibatasi editor/owner
   saja (sejalan dengan pembatasan invite yang baru saja ditambahkan di
   `handler.go` — viewer sudah dibatasi dari aksi mengubah state lain)?
2. Batas panjang teks bubble — 200 karakter cukup, atau mau lebih pendek
   (mis. 140) supaya benar-benar sekilas seperti Figma?
3. Apakah cursor chat perlu terlihat di `PresenceAvatars`/`CollabStatusStrip`
   sebagai indikator "sedang mengetik", atau murni bubble di kanvas saja?
4. Fase pertama cukup desktop-only (asumsi PRD ini) — dikonfirmasi?

## 13. Rencana rilis (milestone, bukan estimasi waktu)

1. **M1 — Backend plumbing**: 3 tipe pesan baru, handler, batching reuse,
   broadcast exclude-sender, cleanup lewat `presence_left`. Bisa diuji lewat
   WS client manual sebelum FE ada.
2. **M2 — Frontend MVP**: `useCursorChat`, guard elemen-fokus, bubble lokal
   + kirim/terima, render di `LiveCursorOverlay`, lifecycle close (Enter/Esc/idle).
3. **M3 — Polish performa**: audit `translate3d`, smoothing transition,
   tuning debounce, regression test tombol `/` di semua form.
4. **M4 — Keputusan produk** (§12) diimplementasikan kalau ada yang
   mengubah scope (mis. viewer restriction).

Belum ada kode yang ditulis untuk fitur ini — dokumen ini adalah dasar
sebelum masuk fase implementasi.
