# 🎨 Product Requirement Document (PRD): Landing Page Overhaul with Framer Motion

> **Aplikasi:** Atlas Food (Food Recall Survey Platform — BRIN & UPI)  
> **Modul:** Landing Page (`app/page.tsx`, `internal/components/landing/*`)  
> **Teknologi:** Next.js (App Router), Tailwind CSS / Vanilla CSS Modules, Framer Motion  
> **Status:** Ready for Implementation  
> **File Path:** `atlas_food_frontend/docs/PRD_LANDING_PAGE_FRAMER_MOTION.md`  

---

## 1. Latar Belakang & Tujuan

### 1.1 Masalah Saat Ini
Landing page saat ini sudah memiliki konten dan hierarki informasi yang lengkap dari Figma, namun masih bersifat **statis**. Tampilan statis kurang memancarkan keunggulan inovasi digital Atlas Food (fitur canggih seperti kolaborasi kursor real-time, estimasi visual foto porsi, dan integrasi AI kurang terlihat hidup).

### 1.2 Tujuan Overhaul
1. **First Impression "WOW":** Pengunjung langsung terpukau dalam 3 detik pertama dengan tampilan visual yang dinamis dan berkelas tinggi.
2. **Storytelling Interaktif:** Memandu mata pengunjung dari masalah bias gizi $\rightarrow$ solusi digital porsi $\rightarrow$ metodologi riset BRIN/UPI secara mengalir.
3. **Meningkatkan Konversi CTA:** Meningkatkan klik pada tombol *"Jelajahi Atlas"* dan *"Pelajari Metodologi"*.
4. **Performa Tetap Ringan:** Menjaga skor Google Lighthouse Performance $\ge 90$ tanpa ada *layout shift* (CLS 0).

---

## 2. Prinsip Gerak & Design Tokens (Motion Guidelines)

Untuk menjaga kesan **elegan, kredibel, dan tidak norak**:
* **Durasi Standar:** $0.3\text{ s}$ sampai $0.5\text{ s}$ (hindari animasi lambat di atas 1 detik yang membuat web terasa lemot).
* **Easing Spring:** `type: "spring", damping: 25, stiffness: 200` (memberikan efek elastis alami yang mewah).
* **Viewport Triggering:** Animasi hanya berjalan saat elemen masuk ke layar (*scroll in view* dengan `viewport: { once: true, margin: "-80px" }`).
* **Aksesibilitas (A11y):** Wajib menghormati `prefers-reduced-motion` untuk pengguna yang sensitif terhadap gerakan.

---

## 3. Koreografi Animasi per Bagian (Section-by-Section)

### 3.1 Hero Section (First Fold)
* **Staggered Text Entrance:**
  * Tagline / Badge BRIN & UPI muncul pertama (fade-in + slide down).
  * Judul utama *"Digitalisasi Estimasi Porsi Makanan Nusantara"* terbagi dalam animasi teks bertingkat (*staggerChildren: 0.1s*).
  * Deskripsi dan tombol CTA meluncur halus dari bawah (fade up).
* **Interactive Hero Mockup Parallax:**
  * Mockup gambar grid makanan memiliki efek *floating subtle* (gerakan melayang vertikal $\pm 8\text{px}$ dengan siklus lambat 4 detik).
  * Efek interaktif: sedikit bergeser mengikuti pergerakan mouse (*tilt / mouse parallax effect*).

### 3.2 Stats Counter (Angka Bergerak)
* Angka **`250+`**, **`13`**, **`3 Jenis`**, **`22+`** tidak langsung diam, melainkan memiliki animasi *count-up ticker* saat pengunjung pertama kali men-scroll ke bagian statistik.
* Card statistik memiliki efek hover lembut (mengangkat $3\text{px}$ + bayangan halus).

### 3.3 "Mengapa Atlas Food Dikembangkan" & Benefit Cards
* **Left Image:** Smooth reveal dari kiri dengan *mask wipe*.
* **Right Benefit Cards (Staggered Bento):**
  * Tiga kartu benefit (*Akurasi Data, Aksesibilitas, Standardisasi*) muncul berurutan (0.15s jeda antar kartu).
  * **Micro-interaction:** Saat kursor hover di atas ikon, ikon melakukan animasi mikro (rotasi halus atau denyut lembut).

### 3.4 Visual Reference Showcase (Series, Guide, Range)
* **Tabs / Card Hover Focus:**
  * Tiga kartu referensi foto porsi memiliki efek hover visual zoom ($1.03\times$).
  * Menampilkan badge indikator visual yang menyala saat aktif.

### 3.5 Categories Carousel / Grid
* Carousel kategori makanan Nusantara memiliki interaksi drag/swipe yang mulus (*inertia-based drag* bawaan Framer Motion).
* Efek *glow hover* pada kartu kategori saat disorot mouse.

### 3.6 Interactive Timeline / Roadmap Section
* Garis vertikal timeline memiliki animasi *line progress fill* yang menyala mengikuti posisi scroll pengunjung.
* Node tahapan kuartal (Q1 2025 s.d. Q2 2026) menyala berurutan saat terlewati.

### 3.7 Audience Grid (Target Pengguna)
* Grid 6 kartu (*Peneliti, Ahli Gizi, Tenaga Kesehatan, Mahasiswa, Pemerintah*) muncul dengan efek *staggered wave fade-up*.
* Efek *gradient border highlight* tipis saat kartu di-hover.

---

## 4. Rencana Implementasi Teknis

### 4.1 Dependensi
```bash
npm install framer-motion
```

### 4.2 Arsitektur Komponen
Agar tidak merusak Server-Side Rendering (SSR) dan SEO Next.js:
1. `app/page.tsx` tetap menjadi Server Component.
2. Buat direktori wrapper animasi: `internal/components/landing/motion/`:
   * `FadeInView.tsx`: Wrapper animasi entrance umum.
   * `CounterTicker.tsx`: Komponen animasi angka counter.
   * `TiltCard.tsx`: Komponen card 3D tilt interaktif.
   * `FloatingElement.tsx`: Komponen parallax melayang.
3. Import wrapper tersebut ke dalam `LandingPage.tsx`.

---

## 5. Checklist Kriteria Keberhasilan (Definition of Done)

- [ ] `framer-motion` terpasang tanpa konflik dependensi.
- [ ] Hero section memiliki animasi entrance bertingkat yang elegan.
- [ ] Angka statistik melakukan counting ticker saat di-scroll.
- [ ] Hover effect pada semua tombol, benefit cards, dan category items terasa responsif.
- [ ] Tidak ada lag/jank pada perangkat smartphone (stabil 60 FPS).
- [ ] `npm run build` dan `npm run typecheck` lulus 100% tanpa error.
