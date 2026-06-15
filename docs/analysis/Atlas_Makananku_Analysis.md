# Atlas Makananku — Analisis UX & Perancangan Website
**Dokumen Discovery & Design Planning**
Versi 1.0 · Juni 2026

---

## 1. ANALISIS BUKU

### Tujuan Utama Buku

**Atlas Makananku** adalah alat bantu estimasi porsi makan yang dikembangkan oleh BRIN (Badan Riset dan Inovasi Nasional) bersama UPI. Tujuan primernya adalah menyediakan **referensi visual terstandar** bagi peneliti gizi, tenaga kesehatan, dan ahli gizi untuk menilai asupan makanan individu — khususnya saat penimbangan langsung tidak memungkinkan (misalnya pada metode dietary recall 24 jam atau FFQ semi-kuantitatif).

Ini bukan buku resep dan bukan ensiklopedia gizi. Ini adalah **instrumen riset bergambar** yang keakuratannya bergantung pada:
1. Konsistensi foto (standar pencahayaan, sudut, alat saji)
2. Ketepatan bobot yang tercantum (gram/mL)
3. Kemampuan responden memilih foto yang paling mendekati porsinya

---

### Tipe Konten yang Ada

| Tipe Konten | Deskripsi | Jumlah/Skala |
|---|---|---|
| **Foto hidangan berseri** | Series (4–8 foto per hidangan, bertahap dari kecil ke besar) | Mayoritas konten |
| **Foto guide** | Satu foto memuat beberapa ukuran/variasi sekaligus | Makanan kemasan, kue |
| **Foto range** | Variasi bentuk/ukuran alami, tidak bertahap ketat | Buah, daging utuh |
| **Label bobot** | Kode hidangan (MP-01, LH-07, dst.) + berat dalam gram/mL | Per foto |
| **Foto alat makan/ukur** | Piring, mangkuk, gelas, sendok dengan dimensi/volume baku | 11 kode AH |
| **Teks pedoman penggunaan** | Cara pakai atlas, prosedur wawancara | ~4 halaman |
| **Teks pendahuluan & metodologi** | Latar belakang, tahapan pengembangan, validasi | ~6 halaman |
| **Daftar isi kategori** | Per kategori makanan + indeks kode | 13 kategori |
| **Lampiran tabel alat makan** | Tabel nama, dimensi, dan volume AH-01 s/d AH-11 | Tabelar |
| **Tim penyusun** | Peneliti, fotografer, desainer | 1 halaman |
| **Kata pengantar** | 4 pengantar dari pejabat BRIN dan UPI | 4 halaman |

---

### Inventaris Konten per Kategori

| Kode | Kategori | Bahasa Inggris | Jumlah Hidangan (est.) |
|---|---|---|---|
| **MP** | Makanan Pokok | Staple Food | 23 item |
| **LH** | Lauk Hewani | Animal Protein | ~54 item |
| **LN** | Lauk Nabati | Plant-Based Protein | ~12 item |
| **AS** | Aneka Sayur | Vegetables | 36 item |
| **AB** | Aneka Buah | Fruits | 38 item |
| **AP** | Roti, Kue & Jajanan Pasar | Bread, Cakes & Traditional Snacks | ~36 item |
| **AMK** | Makanan & Minuman Kemasan | Factory-Packaged Foods & Beverages | 14 item |
| **KK** | Keripik & Kerupuk | Chips & Crackers | 7 item |
| **ABK** | Bumbu & Kondimen | Spices & Condiments | ~7 item |
| **AK** | Makanan Siap Saji | Ready-To-Eat Foods | 7 item |
| **MDL** | Sumber Minyak & Lemak | Oil & Fat | ~5 item |
| **GK** | Gula & Konfeksioneri | Sugar & Confectionery | 13 item |
| **AH** | Alat Makan/Alat Ukur RT | Household Measuring Utensils | 11 item |
| | **TOTAL** | | **~262 hidangan** |

---

### Pengelompokan Konten Berdasarkan Prioritas

**PRIMARY — Inti fungsi atlas**
- Foto hidangan dengan label bobot (seluruh 262+ item)
- Kode identifikasi hidangan (MP-01, LH-07, dst.)
- Foto alat makan/ukur + data dimensi/volume
- Kategori makanan (13 kategori)

**SECONDARY — Pendukung fungsi**
- Pedoman penggunaan (cara pakai foto series, guide, range)
- Prosedur wawancara estimasi porsi
- Panduan untuk hidangan yang tidak ada di atlas (alternatif estimasi)
- Daftar hidangan per kategori (indeks cepat)

**SUPPORTING — Konteks dan legitimasi**
- Kata pengantar (BRIN, UPI)
- Pendahuluan & metodologi pengembangan
- Tim penyusun
- Ucapan terima kasih
- Referensi/daftar pustaka

---

## 2. KONVERSI BUKU → WEBSITE

### Mapping Elemen Buku ke Bentuk Digital

| Elemen di Buku | Bentuk di Website | Alasan UX |
|---|---|---|
| **Daftar Isi kategori** | Top navigation bar + sidebar filter | Akses langsung tanpa scroll; filter bisa dikombinasikan (misal: sayur + rebus) |
| **Halaman pemisah kategori** (splash page per kategori) | Category landing card dengan ikon dan deskripsi singkat | Di buku ini hanya visual dekoratif; di web jadi entry point yang informatif |
| **Daftar hidangan per kategori** | Grid card dengan foto thumbnail, kode, dan nama | Scanning visual jauh lebih cepat di grid daripada daftar teks linear |
| **Foto series (4–8 foto bertahap)** | Porsi Slider / foto carousel horizontal dengan label berat | User bisa geser foto dan langsung lihat perubahan porsi — lebih intuitif dari halaman buku |
| **Foto guide (multi-item dalam 1 foto)** | Foto zoomable dengan overlay label per item | Foto tetap utuh tapi user bisa tap/hover tiap item untuk lihat beratnya |
| **Foto range (variasi alami)** | Gallery grid kecil dengan label A/B/C/D per foto | Variasi tetap terbaca, tapi lebih compact dan bisa diperbesar |
| **Label berat (A. 50g, B. 90g, dst.)** | Badge label langsung di atas foto + tooltip saat hover | Lebih terbaca dari teks kecil di bawah foto buku |
| **Kode hidangan (MP-01, LH-07)** | Tag + URL slug + search index | Bisa dicari langsung; peneliti bisa reference "MP-01" dan link langsung |
| **Foto alat makan (AH-01–AH-11)** | Halaman "Alat Ukur" terpisah + tooltip referensi di food detail | Jadi referensi silang — saat lihat hidangan, bisa langsung lihat "setara berapa sendok?" |
| **Pedoman penggunaan** | Halaman "Cara Pakai" dengan step-by-step interaktif + video opsional | Teks instruksional lebih efektif dengan visual step; buku hanya teks murni |
| **Prosedur wawancara** | Halaman panduan petugas — bisa di-print atau tampil mobile | Petugas di lapangan butuh akses cepat di HP |
| **Kata pengantar** | Halaman "Tentang Atlas" yang bisa di-collapse | Konten penting untuk legitimasi, tapi bukan navigasi utama |
| **Pendahuluan & metodologi** | Halaman "Tentang" dengan tab: Latar Belakang / Metodologi / Tim | Pemisahan topik memudahkan pembaca yang hanya butuh salah satu |
| **Indeks/pencarian** | Search bar global dengan autocomplete (nama + kode) | Keunggulan utama digital: pencarian instan yang tidak mungkin di buku |
| **Tidak ada di buku** | Fitur Bookmark / Daftar Favorit | Peneliti sering pakai subset hidangan yang sama — butuh akses cepat |
| **Tidak ada di buku** | Filter multi-kriteria (kategori + metode masak + kata kunci) | Buku hanya bisa diurutkan berurutan; digital bisa multidimensi |
| **Tidak ada di buku** | Mode Petugas (tampilan besar untuk tablet/layar wawancara) | Kebutuhan nyata petugas di lapangan yang belum bisa dipenuhi buku |

---

## 3. INFORMATION ARCHITECTURE (IA)

### Sitemap Website Lengkap

```
ATLAS MAKANANKU (Website)
│
├── 🏠 Beranda (/)
│   ├── Hero: pencarian cepat
│   ├── Akses cepat 13 kategori
│   └── Pengantar singkat & cara pakai
│
├── 🔍 Cari (/cari)
│   ├── Hasil pencarian (by nama / kode)
│   ├── Filter: Kategori, Tipe Foto, Kata Kunci
│   └── Empty state + saran
│
├── 📂 Kategori (/kategori)
│   ├── /makanan-pokok        (MP) — 23 item
│   ├── /lauk-hewani          (LH) — ~54 item
│   ├── /lauk-nabati          (LN) — ~12 item
│   ├── /sayur                (AS) — 36 item
│   ├── /buah                 (AB) — 38 item
│   ├── /roti-kue-jajanan     (AP) — ~36 item
│   ├── /makanan-kemasan      (AMK) — 14 item
│   ├── /keripik-kerupuk      (KK) — 7 item
│   ├── /bumbu-kondimen       (ABK) — ~7 item
│   ├── /makanan-siap-saji    (AK) — 7 item
│   ├── /minyak-lemak         (MDL) — ~5 item
│   └── /gula-konfeksioneri   (GK) — 13 item
│
├── 🍽️ Detail Hidangan (/hidangan/[kode])
│   ├── /hidangan/MP-01       (Nasi)
│   ├── /hidangan/LH-07       (Ayam Rebus Dada)
│   └── ... (262+ halaman)
│
├── 📏 Alat Ukur (/alat-ukur)
│   ├── /alat-ukur/AH-01      (Aneka Piring)
│   ├── /alat-ukur/AH-02      (Aneka Mangkuk)
│   └── ... (11 item)
│
├── 📖 Panduan (/panduan)
│   ├── /panduan/cara-pakai
│   │   ├── Cara Pakai Foto Series
│   │   ├── Cara Pakai Foto Guide
│   │   └── Cara Pakai Foto Range
│   ├── /panduan/prosedur-wawancara
│   └── /panduan/hidangan-tidak-tersedia
│
├── ℹ️ Tentang (/tentang)
│   ├── /tentang/atlas        (Latar Belakang)
│   ├── /tentang/metodologi   (Cara Pengembangan)
│   └── /tentang/tim          (Tim Peneliti & Fotografer)
│
└── 🔖 Tersimpan (/tersimpan)     [fitur opsional]
    └── Daftar hidangan yang di-bookmark user
```

---

### Hierarki Navigasi

**Menu Utama (Top Nav / Header)**
```
[Logo Atlas Makananku]   [Kategori ▾]   [Panduan]   [Tentang]   [🔍 Cari]
```

**Dropdown Kategori**
```
Makanan Pokok    |   Lauk Hewani    |   Lauk Nabati
Sayur            |   Buah           |   Roti & Kue
Makanan Kemasan  |   Keripik        |   Bumbu
Siap Saji        |   Minyak & Lemak |   Gula
                 [ Lihat Semua Kategori ]
```

**Breadcrumb di halaman dalam**
```
Beranda › Lauk Hewani › Ayam Goreng Dada (LH-12)
```

**Sidebar (di halaman kategori & detail)**
```
Kategori Lainnya
> Makanan Pokok     [23]
> Lauk Hewani       [54] ← aktif
> Lauk Nabati       [12]
...

Filter Tampilan
○ Semua
○ Foto Series
○ Foto Guide
○ Foto Range
```

---

## 4. USER FLOW

### Flow 1: Pengguna Pertama Kali Membuka Website

```
START
  │
  ▼
Buka atlas-makananku.id
  │
  ▼
Lihat Hero Section
(Judul + search bar besar + 13 grid kategori)
  │
  ├─── Langsung ketik di search? ──► [Flow 2: Cari Makanan]
  │
  ├─── Klik tombol "Cara Pakai"? 
  │         │
  │         ▼
  │     Halaman Panduan
  │     (Step-by-step visual)
  │         │
  │         ▼
  │     Kembali ke Beranda
  │
  └─── Scroll ke bawah / klik kategori?
            │
            ▼
        [Flow 3: Jelajah Kategori]

END
```

---

### Flow 2: User Mencari Informasi Makanan Tertentu

```
START
  │
  ▼
Klik Search Bar (global)
  │
  ▼
Ketik nama / kode hidangan
(misal: "nasi goreng" atau "MP-02")
  │
  ▼
Autocomplete muncul real-time
  │
  ├─── Pilih dari autocomplete? ──► [Flow 4: Detail Hidangan]
  │
  └─── Tekan Enter / Cari
            │
            ▼
        Halaman Hasil Pencarian
        (Grid card hasil)
            │
            ├─── Hasil ditemukan?
            │         │
            │         ▼
            │     Klik card yang relevan
            │         │
            │         ▼
            │     [Flow 4: Detail Hidangan]
            │
            └─── Hasil tidak ditemukan?
                      │
                      ▼
                  Empty state:
                  "Hidangan tidak tersedia"
                  + Saran: gunakan hidangan sejenis
                  + Link ke Panduan "Hidangan Tidak Tersedia"
                      │
                      ▼
                  END
```

---

### Flow 3: User Menjelajah Kategori Makanan

```
START
  │
  ▼
Klik kategori dari Beranda / Nav
(misal: "Lauk Hewani")
  │
  ▼
Halaman Kategori Lauk Hewani
(Grid card ~54 item)
  │
  ▼
Opsi Filter (sidebar/chip):
○ Semua    ○ Series    ○ Guide    ○ Range
  │
  ├─── Terapkan filter? → Grid diperbarui secara instan
  │
  └─── Klik card hidangan
            │
            ▼
        [Flow 4: Detail Hidangan]

END
```

---

### Flow 4: User Membaca Detail Hidangan

```
START
  │
  ▼
Buka halaman /hidangan/[kode]
(misal: /hidangan/LH-12)
  │
  ▼
Lihat header:
- Nama: "Ayam Goreng Dada / Fried Chicken Breast"
- Kode: LH-12
- Kategori: Lauk Hewani
- Tipe foto: Foto Range
  │
  ▼
Lihat foto utama (besar, zoomable)
  │
  ▼
Jika foto Series:
  ┌─────────────────────────────────────────┐
  │  [← A. 50g]  [B. 90g]  [C. 130g] [→]  │
  │  Foto berubah saat pilih/geser          │
  └─────────────────────────────────────────┘
  │
  ▼
Jika foto Guide / Range:
  ┌─────────────────────────────────────────┐
  │  Foto besar dengan label overlay        │
  │  Klik/hover item → tooltip berat        │
  └─────────────────────────────────────────┘
  │
  ▼
Lihat tabel ringkasan ukuran
(Kode A–H + berat dalam gram)
  │
  ▼
Lihat "Cara Estimasi" kontekstual
(panduan mini sesuai tipe foto)
  │
  ├─── Klik "Bookmark"? ──► Simpan ke /tersimpan
  │
  ├─── Klik "Lihat Alat Ukur Terkait"? ──► /alat-ukur/AH-01
  │
  └─── Navigasi: Hidangan Lain di Kategori ini
            (prev / next / kembali ke listing)

END
```

---

### Flow 5: User Menyimpan / Membandingkan Informasi

```
START
  │
  ▼
Di halaman detail hidangan manapun
  │
  ▼
Klik ikon Bookmark 🔖
  │
  ▼
Hidangan tersimpan di /tersimpan
(tanpa login — pakai localStorage)
  │
  ▼
Buka /tersimpan
  │
  ▼
Lihat grid hidangan yang disimpan
  │
  ├─── Klik "Hapus" → item terhapus
  │
  └─── Klik "Cetak Daftar" → print-friendly PDF
            │
            ▼
        Daftar tersimpan
        (nama, kode, berat per ukuran)

END
```

---

## 5. FITUR WEBSITE

### Must Have (Wajib Ada)

| Fitur | Tujuan | Value untuk User | Kompleksitas |
|---|---|---|---|
| **Database seluruh hidangan** (262+ item) | Memindahkan konten buku ke digital | Semua data tersedia online, bisa diakses kapanpun | Medium |
| **Foto zoomable / lightbox** | Foto detail adalah inti fungsi atlas | Estimasi porsi butuh foto yang bisa dilihat jelas | Low |
| **Navigasi 13 kategori** | Akses konten terstruktur | Tidak perlu scroll 298 halaman; langsung ke kategori | Low |
| **Search global (nama + kode)** | Cari cepat spesifik | Peneliti tahu kodenya; petugas tahu namanya | Medium |
| **Halaman detail per hidangan** | Tampilkan foto + label berat | Satu hidangan, satu URL, bisa dikunjungi langsung | Medium |
| **Tampilan foto series interaktif** | Menggantikan halaman berseri di buku | Geser/pilih ukuran porsi tanpa balik-balik halaman | Medium |
| **Halaman Panduan Cara Pakai** | Mempertahankan instruksi buku | Petugas baru perlu tahu cara menggunakan atlas | Low |
| **Responsive / mobile-friendly** | Petugas pakai HP di lapangan | Atlas harus bisa dipakai saat wawancara | Medium |
| **Halaman Alat Ukur** | Data AH-01–AH-11 tetap tersedia | Referensi silang dimensi piring, gelas, sendok | Low |

---

### Nice to Have (Disarankan)

| Fitur | Tujuan | Value untuk User | Kompleksitas |
|---|---|---|---|
| **Bookmark / Simpan Hidangan** | Akses cepat ke hidangan favorit petugas | Peneliti sering pakai subset yang sama | Low |
| **Filter tipe foto** (Series/Guide/Range) | Navigasi lebih presisi | Memudahkan orientasi saat listing panjang | Low |
| **Autocomplete search** | UX pencarian lebih cepat | Mengurangi typo dan frustasi | Medium |
| **Breadcrumb navigasi** | Orientasi lokasi user | Penting untuk konten deep (3 level) | Low |
| **Print-friendly view** | Cetak halaman detail untuk lapangan | Beberapa petugas masih butuh printout | Low |
| **Bilingual label** (Indonesia + Inggris) | Sudah ada di buku | Mendukung pengguna internasional & riset | Low |
| **Mode Petugas / Presentation Mode** | Layar besar untuk wawancara | Petugas tampilkan foto di tablet kepada responden | Medium |
| **Empty state dengan saran hidangan sejenis** | Untuk hidangan yang tidak tersedia | Membantu petugas saat hidangan tidak ada di atlas | Medium |

---

### Future Enhancement (Pengembangan Lanjutan)

| Fitur | Tujuan | Value untuk User | Kompleksitas |
|---|---|---|---|
| **Database dinamis (CMS)** | Tambah hidangan baru tanpa dev | Atlas akan dikembangkan terus; butuh update mudah | High |
| **Versi offline / PWA** | Akses tanpa internet | Wawancara sering di daerah sinyal lemah | High |
| **Kalkulator porsi interaktif** | Hitung total asupan | Peneliti bisa hitung gram total dari beberapa foto | High |
| **API untuk integrasi** | Data atlas dipakai sistem lain | Survei digital bisa pull data langsung dari atlas | High |
| **Log aktivitas petugas** (dengan login) | Rekam hidangan yang digunakan per survei | Untuk audit dan konsistensi riset | High |
| **Ekspansi hidangan daerah** | Hidangan khas daerah yang belum ada | Memperluas cakupan nasional | High |
| **Validasi komunitas** | Petugas bisa laporkan foto yang tidak akurat | Quality control berbasis pengguna | High |

---

## 6. WIREFRAME KONSEPTUAL (LOW-FIDELITY)

### Halaman Beranda (Homepage)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo: Atlas Makananku]      [Kategori ▾] [Panduan] [🔍]   │  ← Navbar
├─────────────────────────────────────────────────────────────┤
│                                                             │
│         ATLAS MAKANANKU                                     │
│    Estimasi Porsi Makan Orang Dewasa Indonesia              │  ← Hero
│                                                             │
│    ┌─────────────────────────────────────────────┐          │
│    │  🔍  Cari hidangan (nama / kode)...          │          │  ← Search
│    └─────────────────────────────────────────────┘          │
│                                                             │
│    262 hidangan · 13 kategori · Dikembangkan oleh BRIN      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Jelajah Kategori                                           │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│  │ MP   │ │ LH   │ │ LN   │ │ AS   │ │ AB   │ │ AP   │    │  ← Category Grid
│  │Makan │ │Lauk  │ │Lauk  │ │Sayur │ │Buah  │ │Roti  │    │
│  │Pokok │ │Hewani│ │Nabati│ │      │ │      │ │& Kue │    │
│  │ 23   │ │ 54   │ │ 12   │ │ 36   │ │ 38   │ │ 36   │    │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘    │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│  │ AMK  │ │ KK   │ │ ABK  │ │ AK   │ │ MDL  │ │ GK   │    │
│  │Kemasan│ │Keripik│ │Bumbu │ │Siap  │ │Minyak│ │Gula  │   │
│  │      │ │      │ │      │ │Saji  │ │Lemak │ │      │    │
│  │ 14   │ │  7   │ │  7   │ │  7   │ │  5   │ │ 13   │    │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘    │
├─────────────────────────────────────────────────────────────┤
│  📏 Alat Ukur Rumah Tangga   |   📖 Cara Pakai Atlas        │  ← Quick Links
│  Piring, mangkuk, gelas...   |   Panduan estimasi porsi     │
├─────────────────────────────────────────────────────────────┤
│  Tentang Atlas · Tim Penyusun · BRIN × UPI · 2025           │  ← Footer
└─────────────────────────────────────────────────────────────┘
```

---

### Halaman Kategori (Listing)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]         [Kategori ▾] [Panduan] [Tentang] [🔍]       │
├────────────┬────────────────────────────────────────────────┤
│            │  Beranda › Lauk Hewani                         │  ← Breadcrumb
│  Kategori  ├────────────────────────────────────────────────┤
│  ─────     │  🥩 Lauk Hewani (Animal Protein)               │
│  Makan     │  54 hidangan   [Filter: Semua ▾] [Series] [Range] [Guide] │
│  Pokok     │                                                │
│  Lauk      │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│  Hewani ●  │  │[img] │ │[img] │ │[img] │ │[img] │          │
│  Lauk      │  │LH-01 │ │LH-02 │ │LH-07 │ │LH-08 │          │  ← Food Grid
│  Nabati    │  │Ayam  │ │Ayam  │ │Ayam  │ │Ayam  │          │
│  Sayur     │  │Suir  │ │Cincang│ │Rebus │ │Rebus │          │
│  Buah      │  │Rebus │ │Tumis │ │Dada  │ │Paha  │          │
│  Roti &    │  │Series│ │Series│ │Range │ │Range │          │
│  Kue       │  └──────┘ └──────┘ └──────┘ └──────┘          │
│  ...       │                                                │
│  ─────     │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│  📏 Alat   │  │[img] │ │...   │ │...   │ │...   │          │
│  Ukur      │  │LH-12 │                                      │
│            │  └──────┘                                      │
└────────────┴────────────────────────────────────────────────┘
```

---

### Halaman Detail Hidangan — Tipe Series

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]         [Kategori ▾] [Panduan] [Tentang] [🔍]       │
├─────────────────────────────────────────────────────────────┤
│  Beranda › Makanan Pokok › Nasi (MP-01)                     │  ← Breadcrumb
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MP-01 · Makanan Pokok · Foto Series            [🔖 Simpan] │
│  NASI / RICE                                               │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │              [ FOTO UTAMA BESAR ]                    │   │  ← Main Photo
│  │            A. 50 gram (terkecil)                     │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ◄   [A]  [B]  [C]  [D]  [E]  [F]  [G]  [H]   ►           │  ← Selector
│       50g  90g 130g 150g 210g 250g 270g 350g               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Tabel Ukuran Porsi                                         │
│  ┌──────┬───────┬────────────────────────────────┐          │
│  │ Kode │ Berat │ Keterangan                     │          │
│  ├──────┼───────┼────────────────────────────────┤          │
│  │  A   │  50 g │ Porsi sangat kecil             │          │
│  │  B   │  90 g │ Porsi kecil                    │          │
│  │  C   │ 130 g │ ...                            │          │
│  │  H   │ 350 g │ Porsi sangat besar             │          │
│  └──────┴───────┴────────────────────────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  💡 Cara Menggunakan Foto Series                             │
│  Tunjukkan foto ke responden. Minta pilih yang paling       │
│  mendekati porsi yang dikonsumsi. [Baca panduan lengkap →]  │
├─────────────────────────────────────────────────────────────┤
│  ◄ MP-23 Roti Tawar          MP-02 Nasi Goreng ►            │  ← Prev / Next
└─────────────────────────────────────────────────────────────┘
```

---

### Halaman Hasil Pencarian

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]         [Kategori ▾] [Panduan] [Tentang] [🔍]       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔍  [ ayam goreng                              ×  ]        │
│                                                             │
│  Menampilkan 8 hasil untuk "ayam goreng"                    │
│  Filter: [Semua ▾] [Kategori: Semua ▾] [Tipe Foto: Semua ▾] │
│                                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                       │
│  │[img] │ │[img] │ │[img] │ │[img] │                       │
│  │LH-12 │ │LH-13 │ │LH-14 │ │LH-15 │                       │
│  │Ayam  │ │Ayam  │ │Ayam  │ │Ayam  │                       │
│  │Goreng│ │Goreng│ │Goreng│ │Goreng│                       │
│  │Dada  │ │Paha  │ │Sayap │ │Kepala│                       │
│  │Range │ │Range │ │Range │ │Guide │                       │
│  └──────┘ └──────┘ └──────┘ └──────┘                       │
│                                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                       │
│  │...   │ │...   │ │...   │ │...   │                       │
│  └──────┘ └──────┘ └──────┘ └──────┘                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Mobile Responsive Layout

```
┌───────────────────────┐
│ [☰]  Atlas Makananku  │  ← Hamburger nav
├───────────────────────┤
│                       │
│  🔍 Cari hidangan...  │  ← Search prominent
│                       │
│  ┌──────┐  ┌──────┐   │
│  │ MP   │  │ LH   │   │  ← 2-col category grid
│  │Makan │  │Lauk  │   │
│  │Pokok │  │Hewani│   │
│  └──────┘  └──────┘   │
│  ┌──────┐  ┌──────┐   │
│  │ AS   │  │ AB   │   │
│  │Sayur │  │Buah  │   │
│  └──────┘  └──────┘   │
│     [ Lihat Semua ]   │
└───────────────────────┘

Detail (Mobile):
┌───────────────────────┐
│ ← Nasi / MP-01       │
├───────────────────────┤
│                       │
│  ┌─────────────────┐  │
│  │   [FOTO BESAR]  │  │  ← Full-width photo
│  │   A · 50 gram   │  │
│  └─────────────────┘  │
│                       │
│  ← [A][B][C][D][E] → │  ← Scrollable chips
│    50g 90g ...       │
│                       │
│  ┌─────────────────┐  │
│  │ Kode │ Berat    │  │
│  │  A   │  50 g    │  │
│  │  B   │  90 g    │  │
│  └─────────────────┘  │
└───────────────────────┘
```

---

## 7. DESIGN DIRECTION — 3 OPSI KONSEP VISUAL

---

### Opsi A: "Sains yang Hangat" (Direkomendasikan)
*Scientific warmth — precision meets approachability*

**Tema:** Atlas ini adalah instrumen riset, tapi harus bisa dipakai ibu rumah tangga dan petugas di lapangan. Desain yang terasa ilmiah tapi bersahabat — seperti buku teks bergambar yang dirancang dengan baik.

**Warna:**
- Primary: `#1A5C38` (hijau tua botanikal — pangan, alam, kesehatan)
- Secondary: `#F5A623` (oranye kuning — aksentuasi, badge berat, call to action)
- Background: `#FAFAF7` (putih krem — lebih hangat dari putih murni)
- Surface: `#FFFFFF` (card)
- Text: `#1C1C1E` (hampir hitam)
- Muted: `#6B7280` (abu untuk label secondary)
- Border: `#E5E7EB`

**Tipografi:**
- Display/Heading: **DM Serif Display** — berkarakter, sedikit editorial, cocok untuk nama kategori besar
- Body: **Inter** — clean, mudah dibaca, tersedia di semua device
- Data/Label: **JetBrains Mono** — untuk kode (MP-01), angka gram, label A/B/C — terasa presisi

**Style Komponen:**
- Card: border-radius 12px, shadow ringan (tidak flat, tidak terlalu dalam)
- Button: pill-shaped untuk aksi utama, square-ish untuk filter
- Badge kode: mono font, background accent, inline dengan judul
- Foto: rasio tetap 4:3, background putih, border ringan

**Inspirasi UX:**
- Foto-foto besar seperti **Noma Guide** atau **Ottolenghi cookbook digital**
- Navigasi kategori seperti **iHerb** (dense tapi terstruktur)
- Detail view foto seperti **Getty Images** (zoom, navigasi antar foto)

---

### Opsi B: "Digital Archive Resmi"
*Government precision — institutional but clean*

**Tema:** Menonjolkan kesan resmi, akademik, dan terpercaya. Cocok jika target utama adalah peneliti dan pemangku kebijakan. Terasa seperti publikasi BRIN yang terdigitalisasi dengan baik.

**Warna:**
- Primary: `#003366` (biru BRIN — institutional)
- Secondary: `#E8F0FE` (biru muda untuk highlight)
- Accent: `#D32F2F` (merah untuk badge/CTA)
- Background: `#F8F9FA`
- Text: `#212529`

**Tipografi:**
- Display: **Source Serif 4** — akademik, buku teks
- Body: **Source Sans 3** — berpasangan natural dengan Source Serif
- Data: **Roboto Mono** — label angka, kode

**Style Komponen:**
- Card: border-radius 4px (lebih kotak, kesan formal)
- Table besar dan dense untuk data
- Navigation: horizontal tab bar yang jelas

**Inspirasi UX:**
- **PubMed** (navigasi riset terstruktur)
- **Perpustakaan Digital Nasional**
- **WHO Nutrition Database**

---

### Opsi C: "Food Explorer Modern"
*Consumer-grade experience — feels like an app*

**Tema:** Kalau target pengguna diperluas ke masyarakat umum (bukan hanya peneliti), desain ini terasa paling inviting. Foto jadi hero, navigasi sangat visual.

**Warna:**
- Primary: `#FF6B35` (oranye food — energik, menggugah selera)
- Secondary: `#2D3748` (biru gelap untuk text)
- Background: `#FFFBF7` (krem sangat terang)
- Surface: `#FFFFFF`
- Tag: palet warna per kategori (hijau untuk sayur, kuning untuk buah, dsb.)

**Tipografi:**
- Display: **Playfair Display** — food magazine feel
- Body: **Nunito Sans** — ramah, round, readable
- Data: **Space Mono** — label gram

**Style Komponen:**
- Card besar dengan foto dominan (gambar 60% card)
- Color-coded category tags
- Bottom navigation untuk mobile

**Inspirasi UX:**
- **Yummly** / **AllRecipes** (food-first visual)
- **MyFitnessPal** (data gizi, filter, search)
- **Tokopedia Category Page** (dense grid yang tidak overwhelming)

---

## 8. KOMPONEN DESIGN SYSTEM

### Komponen Core

| Komponen | Varian | Catatan |
|---|---|---|
| **Button** | Primary, Secondary, Ghost, Icon-only, Destructive | Primary = `#1A5C38`; gunakan ukuran konsisten 40px (default), 32px (small) |
| **Food Card** | Default, Compact, Featured | Selalu tampilkan: foto, kode, nama (Indonesia), tipe foto |
| **Category Card** | Grid (homepage), List (sidebar) | Tampilkan ikon kategori + jumlah item |
| **Search Bar** | Default, With Autocomplete, With Filter | Autocomplete dropdown dengan highlight match |
| **Photo Viewer** | Series Slider, Guide Lightbox, Range Gallery | Komponen terbesar dan paling kritis |
| **Weight Badge** | Kode label (A/B/C), Gram label | Pakai monospace font; posisi overlay di foto atau di bawah |
| **Filter Chip** | Active, Inactive, Disabled | Horizontal scroll di mobile; multiselect |
| **Data Table** | Compact, Bordered | Untuk tabel ukuran porsi per hidangan |
| **Tag / Pill** | Kategori, Tipe Foto, Kode | Color-coded per kategori |
| **Navigation** | Top Nav, Sidebar, Bottom Nav (mobile), Breadcrumb | Breadcrumb wajib di semua halaman dalam |
| **Empty State** | Hasil pencarian kosong, Kategori kosong | Selalu sertakan aksi yang bisa dilakukan user |
| **Loading State** | Skeleton screen (card), Spinner (search) | Skeleton lebih baik dari spinner untuk layout berbasis card |
| **Toast / Notification** | Success (bookmark), Error, Info | Auto-dismiss 3 detik |
| **Modal / Lightbox** | Foto full-screen, Konfirmasi hapus | Foto harus bisa zoom dan geser |
| **Tooltip** | Label berat (hover foto), Info kode | Maksimal 2 baris |
| **Stepper / Progress** | Panduan cara pakai | Horizontal untuk desktop, vertical untuk mobile |
| **Accordion** | Panduan langkah, Info metodologi | Untuk konten panjang yang bisa dilipat |
| **Print View** | Detail hidangan, Daftar tersimpan | Hilangkan nav, perbesar foto, tampilkan semua ukuran |

---

## 9. RISIKO JIKA HANYA MEMINDAHKAN BUKU LANGSUNG KE WEB

### Risiko Teknis

**Foto sebagai scan halaman buku (bukan foto individual)**
Buku meletakkan 2–8 foto dalam satu halaman. Jika dipindahkan apa adanya, user tidak bisa zoom foto spesifik — harus zoom keseluruhan halaman. Foto A menjadi terlalu kecil untuk bisa digunakan sebagai referensi estimasi porsi.

**Label berat terbaca teks PDF, bukan data terstruktur**
Jika label "A. 50g" hanya disimpan sebagai teks flat, fitur pencarian berdasarkan rentang berat, filter, dan kalkulasi tidak akan bisa dibangun di masa depan.

### Risiko UX

**Navigasi linear buku tidak sesuai paradigma web**
Buku dibaca dari halaman pertama ke terakhir. Web tidak. User yang datang langsung lewat Google search ke MP-01 tidak akan tahu konteksnya. Tanpa sitemap yang dirancang dengan baik, mereka tersesat.

**Tipe foto yang berbeda (Series/Guide/Range) tidak dibedakan secara visual**
Di buku, user tahu karena sudah membaca pedoman. Di web, jika card tidak memberi tanda tipe foto, cara interaksinya berbeda-beda per item akan membingungkan.

**Tidak ada dukungan mode petugas lapangan**
Buku bisa dipegang di depan responden. Website standar tidak dirancang untuk itu — teks kecil, UI keruh, navigasi banyak elemen. Tanpa mode presentasi yang bersih, petugas tidak akan meninggalkan buku fisiknya.

### Risiko Konten

**Kata pengantar 4 halaman sebagai konten "above the fold"**
Buku dimulai dengan kata pengantar. Web yang meniru urutan ini akan membuat user langsung bounce. Konten paling penting (foto hidangan) harus ada di atas.

**Tidak ada search — konten tidak bisa ditemukan**
298 halaman buku dinavigasi dengan daftar isi + jari. Di web tanpa search, user harus scroll ratusan item. Ini menurunkan efektifitas secara drastis.

**Konten pelengkap (tim, kata pengantar, referensi) mencemari navigasi utama**
Jika semua konten buku dianggap setara, navigasi akan penuh dengan konten yang tidak relevan bagi user yang hanya ingin mencari foto nasi goreng.

---

## 10. REKOMENDASI FINAL

### Pendekatan yang Dipilih: **Hybrid — Catalog Explorer + Practical Tool**

Atlas Makananku digital tidak cocok menjadi Digital Archive murni (terlalu pasif) maupun Interactive Knowledge Base penuh (konten terlalu visual untuk jadi teks-heavy). Yang paling cocok adalah **Catalog Explorer** dengan elemen **Practical Tool**.

**Artinya:**
- Fungsi utama = **browse dan cari foto hidangan** (catalog)
- Nilai tambah utama = **interaksi langsung dengan foto series + referensi cepat saat di lapangan** (tool)
- Konten editorial (metodologi, panduan) = pendukung, bukan halaman utama

---

### Struktur Halaman yang Direkomendasikan

**Beranda:** Hero dengan search besar + grid 13 kategori. Tidak ada kata pengantar di halaman utama. Kata pengantar masuk ke `/tentang`.

**Halaman Kategori:** Grid foto dengan filter tipe (series/guide/range). Sidebar kategori tetap terlihat untuk cross-navigation. Tidak ada teks panjang — langsung ke konten.

**Halaman Detail Hidangan:** Foto sebagai elemen terbesar. Selector ukuran porsi interaktif untuk tipe Series. Tabel berat di bawah foto. Panduan cara pakai kontekstual (mini, bukan halaman terpisah). Navigasi prev/next dalam kategori.

**Halaman Panduan:** Terpisah dari konten atlas — user bisa bookmark langsung kalau perlu. Dibuat seperti onboarding guide: visual, step-by-step, singkat.

**Halaman Alat Ukur:** Terpisah dan bisa direferensikan dari halaman detail hidangan. Tabel dimensi harus tersedia dalam format yang bisa dicopy/dicetak.

---

### Contoh Perbandingan Pendekatan

| Kriteria | Digital Archive | Interactive KB | **Catalog Explorer (Pilihan)** |
|---|---|---|---|
| Navigasi | Linear, bab per bab | Tree browsing | **Grid + Search** |
| Foto | Embedded per halaman | Ilustrasi artikel | **Card + Full Viewer** |
| Data berat | Teks statis | Infografis | **Badge + Tabel Interaktif** |
| Search | Ctrl+F browser | Full-text search | **Semantic search + kode** |
| Mobile | PDF viewer | Responsive article | **Mobile-first layout** |
| Update konten | Re-upload PDF | Edit artikel CMS | **CMS berbasis entry per item** |
| Target user | Pembaca pasif | Pelajar | **Peneliti & petugas aktif** |

---

### Prinsip Desain yang Harus Dipegang

1. **Foto adalah raja.** Jangan pernah tampilkan foto lebih kecil dari 200px. Lightbox wajib ada.
2. **Kode hidangan adalah identitas.** MP-01 harus selalu terlihat dan bisa dicari.
3. **Petugas lapangan pakai HP.** Mobile experience bukan afterthought — ini primary use case.
4. **Data harus terstruktur.** Setiap berat tersimpan sebagai angka, bukan teks image.
5. **Panduan pendek, mudah dismiss.** User yang sudah mahir tidak ingin melihat instruksi setiap kali.

---

*Dokumen ini adalah output tahap Discovery & UX Planning. Langkah berikutnya: Prototype lo-fi (Figma/whiteboard) → User testing dengan petugas lapangan → Iterasi → High-fidelity mockup → Development.*

---
**Dikembangkan sebagai analisis UX/UI untuk digitalisasi Atlas Makananku BRIN–UPI 2025**
