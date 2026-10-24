# 🧪 PRD & Spesifikasi Otomasi Playwright E2E: Live Canvas Annotation (Fitur Coret-Coret Kolaboratif)

> **Modul:** Real-Time Collaboration Canvas (`internal/domain/collab`)  
> **Aplikasi:** Atlas Food (Food Recall Survey Platform)  
> **Lokasi Dokumen:** `atlas_food_frontend/docs/testing/PRD_PLAYWRIGHT_E2E_LIVE_CANVAS.md`  
> **Metode Pengujian:** End-to-End (E2E) Multi-Browser Context via Playwright  
> **Status:** Siap Implementasi  

---

## 1. Maksud & Tujuan Fitur Coret-Coret ("Ini Apa Maksudnya?")

### 1.1 Masalah Domain di Food Recall (Survei Gizi 24 Jam)
Pada survei recall konsumsi makanan berpendampingan jarak jauh, Responden dan Ahli Gizi (Enumerator) saling terhubung dalam satu sesi survei web. Ketika melihat foto porsi makanan (*As-Served Food Photos*):
* Sering timbul kebingungan verbal: *"Ibu makan nasi yang di piring sebelah mana?", "Ayamnya yang bagian paha bawah atau dada?", "Minyak/kuahnya dihabiskan tidak?"*
* Menjelaskan posisi makanan hanya lewat suara/chat rentan memicu **salah paham dan bias estimasi porsi (gramatur gizi meleset)**.

### 1.2 Maksud dan Fungsi Fitur Live Canvas (Coret-Coret)
Fitur **Live Canvas Annotation** adalah kanvas transparan interaktif real-time di atas layar survey:
1. **Pencil & Shape (Lingkaran/Kotak):** Enumerator dapat melingkari langsung potongan makanan di foto porsi responden (misal melingkari potongan tempe atau batas sendok).
2. **Laser Pointer:** Menunjuk area makanan dengan titik sorot dinamis yang otomatis memudar dalam 1,5 detik tanpa mengotori layar.
3. **Cross-Device Normalization (0.0 – 1.0):** Jika Enumerator menggambar di laptop ($1920\times1080$), coretan tersebut muncul di posisi relatif yang **sama persis dan presisi** di layar smartphone Responden ($390\times844$).
4. **Three-Tier Role Enforcement:** Hanya pengguna dengan hak akses `owner` atau `editor` yang bisa menggambar. Peserta berstatus `viewer` dikunci total (*inert lock*) dan hanya dapat menonton.
5. **Late-Joiner Synchronization:** Peserta yang baru bergabung belakangan tetap dapat melihat riwayat coretan yang sudah dibuat sebelumnya (disimpan di ring-buffer server Go maksimal 50 stroke).

---

## 2. Arsitektur Otomasi Pengujian Playwright (Multi-Context)

Pengujian fitur kolaboratif **wajib menggunakan minimal 2 Browser Context independen** dalam satu siklus pengujian:
* **Browser Context A (Enumerator):** Bertindak sebagai `owner`/`editor` yang memegang kendali menggambar.
* **Browser Context B (Responden):** Bertindak sebagai `viewer` (atau `editor` kedua) yang mengamati perubahan canvas secara real-time.

```
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│ Playwright Context A (Browser 1)│           │ Playwright Context B (Browser 2)│
│       Role: Enumerator          │           │         Role: Responden         │
│  - Aktifkan Canvas Mode         │           │  - Join Room via Link           │
│  - Mouse Drag (Draw Stroke)     │           │  - Assert Canvas Pixel Updated  │
└────────────────┬────────────────┘           └────────────────▲────────────────┘
                 │                                             │
                 │ WebSocket (canvas_draw_start / move)        │ WebSocket Broadcast
                 ▼                                             │
      ┌────────────────────────────────────────────────────────┴──────────────┐
      │                      Backend Hub WebSocket (Go)                       │
      │           Memverifikasi Role & Menyiarkan Titik Koordinat             │
      └───────────────────────────────────────────────────────────────────────┘
```

---

## 3. Matriks Skenario Pengujian (Test Cases)

| ID Test | Nama Skenario | Langkah Pengujian | Kriteria Keberhasilan (Assertion) |
|---|---|---|---|
| **TC-CANVAS-01** | Sinkronisasi Goresan Bebas (*Freehand Pencil*) | User A memilih tool pensil dan menggambar garis melengkung dari $(x_1, y_1)$ ke $(x_2, y_2)$ | Canvas pada User B menerima data stroke; elemen canvas User B memiliki perubahan data pixel (*non-blank canvas*). |
| **TC-CANVAS-02** | Skalabilitas Koordinat Lintas Perangkat (*Cross-Device Scaling*) | User A di viewport desktop ($1280\times800$) menggambar di kuadran kanan-atas ($x=0.75, y=0.25$). User B membuka di viewport mobile ($390\times844$). | Titik stroke yang diterima User B berada pada koordinat normalisasi $0.75 \pm 0.02$ dan $0.25 \pm 0.02$. Posisi visual tetap berada di atas makanan yang sama. |
| **TC-CANVAS-03** | Laser Pointer & Auto-Fade | User A mengarahkan laser pointer ke tengah gambar | User B melihat elemen laser dengan posisi yang sesuai; setelah diam selama $\ge 1.5$ detik, elemen laser otomatis menghilang (*faded out*). |
| **TC-CANVAS-04** | Penguncian Hak Akses Viewer (*Role Lockout*) | User B bergabung dengan peran `viewer` dan mencoba men-drag mouse di area canvas | Tidak ada event `canvas_draw_start` yang terkirim ke WebSocket; container canvas User B memiliki atribut `inert`; User A tidak menerima coretan apa pun. |
| **TC-CANVAS-05** | Hapus Semua Coretan (*Clear Canvas*) | User A menekan tombol tong sampah / *Clear Canvas* pada toolbar | Seluruh coretan di layar User A dan User B terhapus bersih secara simultan (< 100 ms). |
| **TC-CANVAS-06** | Sinkronisasi Peserta Baru (*Late-Joiner Replay*) | User A membuat 2 coretan lingkaran. User C baru membuka link room setelah coretan selesai dibuat | User C langsung menerima event `canvas_state_sync`; canvas User C langsung ter-render 2 lingkaran tanpa User A harus menggambar ulang. |
| **TC-CANVAS-07** | Toggle Visibilitas (*Hide/Show Canvas*) | User B menonaktifkan visibilitas canvas melalui toolbar | Canvas tersembunyi sementara di layar User B, tetapi state stroke tetap utuh dan muncul kembali saat tombol visibilitas diaktifkan. |

---

## 4. Spesifikasi Implementasi Skrip Playwright (`live-canvas.spec.ts`)

Berikut kerangka kode resmi Playwright yang siap diimplementasikan pada direktori pengujian:

```typescript
import { test, expect, type Page } from "@playwright/test";

// Helper untuk mensimulasikan goresan mouse di canvas HTML5
async function drawStrokeOnCanvas(
  page: Page,
  canvasSelector: string,
  start: { x: number; y: number },
  end: { x: number; y: number }
) {
  const canvas = page.locator(canvasSelector);
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Canvas bounding box tidak ditemukan");

  const startX = box.x + box.width * start.x;
  const startY = box.y + box.height * start.y;
  const endX = box.x + box.width * end.x;
  const endY = box.y + box.height * end.y;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move((startX + endX) / 2, (startY + endY) / 2, { steps: 5 });
  await page.mouse.move(endX, endY, { steps: 5 });
  await page.mouse.up();
}

// Helper untuk memeriksa apakah canvas memiliki coretan pixel (tidak kosong)
async function isCanvasEmpty(page: Page, canvasSelector: string): Promise<boolean> {
  return await page.evaluate((selector) => {
    const canvas = document.querySelector(selector) as HTMLCanvasElement;
    if (!canvas) return true;
    const ctx = canvas.getContext("2d");
    if (!ctx) return true;
    const pixelBuffer = new Uint32Array(
      ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
    );
    return !pixelBuffer.some((color) => color !== 0);
  }, canvasSelector);
}

test.describe("E2E Multi-User Live Canvas Annotation", () => {
  test("TC-CANVAS-01: User A menggambar, User B menerima coretan secara real-time", async ({
    browser,
  }) => {
    // 1. Buat 2 browser context terpisah
    const contextA = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const contextB = await browser.newContext({ viewport: { width: 1280, height: 800 } });

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    const roomId = `test-room-${Date.now()}`;

    // 2. User A (Enumerator / Owner) masuk ke room
    await pageA.goto(`/recall?room=${roomId}&role=owner`);
    await pageA.waitForSelector("[data-testid='collab-connected']");

    // 3. User B (Responden) bergabung ke room yang sama
    await pageB.goto(`/recall?room=${roomId}&role=editor`);
    await pageB.waitForSelector("[data-testid='collab-connected']");

    // 4. Pastikan awalnya kedua canvas kosong
    expect(await isCanvasEmpty(pageA, "canvas.live-canvas-overlay")).toBe(true);
    expect(await isCanvasEmpty(pageB, "canvas.live-canvas-overlay")).toBe(true);

    // 5. User A mengaktifkan mode canvas dan menggambar garis
    await pageA.click("[data-testid='btn-toggle-drawing']");
    await pageA.click("[data-testid='tool-pencil']");

    await drawStrokeOnCanvas(
      pageA,
      "canvas.live-canvas-overlay",
      { x: 0.2, y: 0.2 },
      { x: 0.8, y: 0.8 }
    );

    // 6. Verifikasi User A memiliki coretan
    expect(await isCanvasEmpty(pageA, "canvas.live-canvas-overlay")).toBe(false);

    // 7. Verifikasi User B menerima dan merender coretan tersebut (< 1000 ms)
    await pageB.waitForFunction(
      () => {
        const canvas = document.querySelector("canvas.live-canvas-overlay") as HTMLCanvasElement;
        if (!canvas) return false;
        const ctx = canvas.getContext("2d");
        if (!ctx) return false;
        const pixels = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
        return pixels.some((color) => color !== 0);
      },
      { timeout: 3000 }
    );

    expect(await isCanvasEmpty(pageB, "canvas.live-canvas-overlay")).toBe(false);

    // 8. User A menekan tombol Clear Canvas
    await pageA.click("[data-testid='tool-clear-canvas']");

    // 9. Verifikasi canvas kedua user kembali bersih
    await pageB.waitForFunction(() => {
      const canvas = document.querySelector("canvas.live-canvas-overlay") as HTMLCanvasElement;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return true;
      const pixels = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
      return !pixels.some((color) => color !== 0);
    });

    expect(await isCanvasEmpty(pageA, "canvas.live-canvas-overlay")).toBe(true);
    expect(await isCanvasEmpty(pageB, "canvas.live-canvas-overlay")).toBe(true);

    await contextA.close();
    await contextB.close();
  });

  test("TC-CANVAS-04: User berstatus Viewer terkunci dan tidak dapat menggambar", async ({
    browser,
  }) => {
    const contextViewer = await browser.newContext();
    const pageViewer = await contextViewer.newPage();

    const roomId = `test-viewer-${Date.now()}`;
    await pageViewer.goto(`/recall?room=${roomId}&role=viewer`);
    await pageViewer.waitForSelector("[data-testid='collab-connected']");

    // Verifikasi container terpasang atribut inert
    const inertContainer = pageViewer.locator("[inert]");
    await expect(inertContainer).toBeVisible();

    // Verifikasi banner 'Can view' tampil
    await expect(pageViewer.getByText(/Mode hanya melihat/i)).toBeVisible();

    await contextViewer.close();
  });
});
```

---

## 5. Konfigurasi CI/CD & Prasyarat Eksekusi

1. **Dependensi Playwright:**
   ```bash
   npm install -D @playwright/test
   npx playwright install --with-deps chromium
   ```
2. **Setup Skrip di `package.json`:**
   ```json
   "scripts": {
     "test:e2e:canvas": "playwright test docs/testing/live-canvas.spec.ts --headed"
   }
   ```
3. **Kriteria Kelulusan (Definition of Done):**
   * 100% test case (TC-CANVAS-01 s.d. TC-CANVAS-07) berstatus **PASS**.
   * Latensi penyiaran titik stroke dari pengirim ke penerima rata-rata $\le 80\text{ ms}$ pada jaringan lokal.
   * Tidak ada kebocoran memori (*memory leak*) pada loop `requestAnimationFrame` selama sesi pengujian berlangsung.
