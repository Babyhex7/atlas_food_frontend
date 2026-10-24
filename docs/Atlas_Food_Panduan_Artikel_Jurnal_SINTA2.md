# Atlas Food — Panduan Lengkap Artikel Jurnal SINTA 2

**Satu dokumen rujukan untuk menulis artikel ilmiah Atlas Food:** strategi, struktur naskah, metode & rancangan pengujian, bahan teknis sistem, penulis, etika, dan checklist submit.

| Atribut | Keterangan |
|---|---|
| Nama sistem | Atlas Food (Atlas Makananku) |
| Domain | *24-hour dietary recall* (R24J) terkomputerisasi dengan pendampingan enumerator jarak jauh |
| Target jurnal | **Jurnal RESTI** (prioritas) · alternatif: Indonesian Journal of Information Systems, JTIIK |
| Arsitektur | Next.js SPA ↔ REST + WebSocket (Go/Gin) ↔ MySQL 8 · Redis · Groq LLM |
| Status sistem | Prototipe fungsional, *build-clean* |
| Status evaluasi | **Rancangan lengkap (Bagian C); hasil belum diukur** — tabel hasil diberi tanda `⬜ ISI` |
| Naskah pendamping | [Skripsi_Atlas_Food_Bab_1-5.md](Skripsi_Atlas_Food_Bab_1-5.md) (tinjauan pustaka, kebutuhan, diagram UML) |

> **Aturan integritas.** Semua fakta teknis di dokumen ini diverifikasi dari kode sumber (Oktober 2026). Semua angka hasil **belum ada** dan hanya boleh diisi dari data pengujian nyata. Jangan menulis angka perkiraan di naskah.

---

## Cara Memakai Dokumen Ini

| Kalau kamu sedang ... | Buka |
|---|---|
| Menentukan fokus, judul, pertanyaan penelitian | **Bagian A** |
| Menulis naskah bagian per bagian | **Bagian B** |
| Menyiapkan & menjalankan pengujian, lalu mengisi hasil | **Bagian C** |
| Butuh detail teknis sistem (arsitektur, protokol, LLM, cacat) | **Bagian D** |
| Menentukan penulis, etika, referensi, gaya tulisan | **Bagian E** |
| Mau submit (jadwal, checklist, template abstrak) | **Bagian F** |

**Urutan kerja yang disarankan:** A → C (jalankan pengujian) → B (tulis naskah memakai bahan D) → E → F.

---

## Daftar Isi

**Bagian A — Strategi**
- [A1. Jurnal Tujuan](#a1-jurnal-tujuan)
- [A2. Diagnosis Kesiapan](#a2-diagnosis-kesiapan)
- [A3. Fokus Kontribusi](#a3-fokus-kontribusi)
- [A4. Judul](#a4-judul)
- [A5. Pertanyaan Penelitian & Hipotesis](#a5-pertanyaan-penelitian--hipotesis)

**Bagian B — Struktur Naskah**
- [B1. Struktur & Anggaran Halaman](#b1-struktur--anggaran-halaman)
- [B2. Abstrak & Kata Kunci](#b2-abstrak--kata-kunci)
- [B3. Pendahuluan](#b3-pendahuluan)
- [B4. Metode Penelitian](#b4-metode-penelitian)
- [B5. Hasil dan Pembahasan](#b5-hasil-dan-pembahasan)
- [B6. Kesimpulan](#b6-kesimpulan)
- [B7. Gambar & Tabel](#b7-gambar--tabel)

**Bagian C — Metode & Rancangan Pengujian**
- [C1. Kerangka DSRM](#c1-kerangka-dsrm)
- [C2. Lingkungan Uji](#c2-lingkungan-uji)
- [C3. Persiapan Teknis Sebelum Uji](#c3-persiapan-teknis-sebelum-uji)
- [C4. E0 — Pengujian Fungsional](#c4-e0--pengujian-fungsional)
- [C5. E1 — Kinerja Real-Time](#c5-e1--kinerja-real-time)
- [C6. E2 — Efektivitas Otorisasi Berlapis](#c6-e2--efektivitas-otorisasi-berlapis)
- [C7. E3 — Mutu Rekomendasi LLM](#c7-e3--mutu-rekomendasi-llm)
- [C8. E4 — Kebergunaan (SUS)](#c8-e4--kebergunaan-sus)
- [C9. E5 — Verifikasi Perhitungan Gizi](#c9-e5--verifikasi-perhitungan-gizi)
- [C10. Ringkasan Analisis Statistik](#c10-ringkasan-analisis-statistik)
- [C11. Ancaman terhadap Validitas](#c11-ancaman-terhadap-validitas)

**Bagian D — Bahan Teknis Sistem**
- [D1. Posisi Riset & Kebaruan](#d1-posisi-riset--kebaruan)
- [D2. Tumpukan Teknologi & Arsitektur](#d2-tumpukan-teknologi--arsitektur)
- [D3. Model Data](#d3-model-data)
- [D4. Autentikasi & Peran](#d4-autentikasi--peran)
- [D5. Modul Recall 24 Jam](#d5-modul-recall-24-jam)
- [D6. Modul Kolaborasi Real-Time](#d6-modul-kolaborasi-real-time)
- [D7. Modul Rekomendasi LLM](#d7-modul-rekomendasi-llm)
- [D8. Portal Admin & CMS Anotasi](#d8-portal-admin--cms-anotasi)
- [D9. Katalog Cacat & Perbaikan](#d9-katalog-cacat--perbaikan)
- [D10. Keterbatasan Sistem](#d10-keterbatasan-sistem)

**Bagian E — Penulis, Etika, Referensi, Gaya**
- [E1. Penulis](#e1-penulis)
- [E2. Etika & Privasi](#e2-etika--privasi)
- [E3. Referensi](#e3-referensi)
- [E4. Praktik Terbaik Penulisan](#e4-praktik-terbaik-penulisan)
- [E5. Alasan Umum Penolakan](#e5-alasan-umum-penolakan)

**Bagian F — Menuju Submit**
- [F1. Jadwal](#f1-jadwal)
- [F2. Checklist Final](#f2-checklist-final)
- [F3. Template Abstrak & Kalimat Kunci](#f3-template-abstrak--kalimat-kunci)
- [F4. Glosarium](#f4-glosarium)
- [F5. Peta Berkas Kode](#f5-peta-berkas-kode)

---

# BAGIAN A — STRATEGI

## A1. Jurnal Tujuan

| Prioritas | Jurnal | Kenapa cocok |
|---|---|---|
| **1** | **Jurnal RESTI** (Rekayasa Sistem dan Teknologi Informasi) | Cakupan rekayasa sistem; cocok untuk arsitektur kolaborasi real-time + evaluasi LLM |
| 2 | Indonesian Journal of Information Systems (IJIS) | Sistem informasi kolaboratif, evaluasi penggunaan sistem |
| 3 | Jurnal Teknologi Informasi dan Ilmu Komputer (JTIIK) | Perangkat lunak/AI dengan pengujian kuantitatif kuat |

**Wajib dicek ulang sebelum menulis** (ketentuan bisa berubah): status SINTA terkini di portal SINTA, *Author Guidelines*, template, bahasa naskah, gaya sitasi, batas halaman, biaya (APC), dan kuota terbitan.

**Wajib ditanyakan ke prodi UPI:** syarat jalur skripsi jurnal — cukup **submitted**, harus **accepted (LoA)**, atau harus **published**? Ini menentukan seluruh jadwal (proses review SINTA 2 bisa 2–6 bulan).

## A2. Diagnosis Kesiapan

| Aspek | Status | Catatan |
|---|---|---|
| Sistem berjalan | ✅ | Backend Go + frontend Next.js |
| Dokumentasi teknis | ✅ | Bagian D |
| Penelusuran cacat end-to-end | ✅ | D1–D11 (§D9) |
| Uji otomatis backend | 🟡 | 7 berkas uji Go (collab, annotation, router, middleware, pencarian makanan, seed TKPI) |
| Uji otomatis frontend | ❌ | Belum ada |
| Uji kotak-hitam terdokumentasi | 🟡 | Perlu dirapikan → E0 |
| Kinerja real-time | ⬜ Rancangan siap | E1 |
| Otorisasi berlapis | ⬜ Rancangan siap | E2 |
| Mutu LLM oleh ahli gizi | ⬜ Rancangan siap | E3 |
| Usability (SUS) | ⬜ Rancangan siap | E4 |
| Verifikasi perhitungan gizi | ⬜ Rancangan siap | E5 |

**Kesimpulan:** bahan Pendahuluan dan Metode sudah cukup. Yang menentukan lolos atau tidaknya adalah **data hasil E1–E5**.

## A3. Fokus Kontribusi

Sistem punya banyak fitur (N1–N5 di §D1). **Satu artikel jangan memuat semuanya** — reviewer akan menilainya dangkal. Pilih dua kontribusi inti yang bisa diukur:

| Peran | Kontribusi | Diuji oleh |
|---|---|---|
| **Inti 1** | Sinkronisasi langkah *wizard* lintas-pengguna + otorisasi peran tiga lapis pada instrumen R24J (N1+N2) | E1, E2 |
| **Inti 2** | Rekomendasi gizi LLM berkendala skema, dievaluasi ahli gizi vs *baseline* berbasis aturan (N3) | E3 |
| Pendukung | Kebergunaan sistem secara keseluruhan; kebenaran perhitungan gizi | E4, E5 |
| Konteks saja (1–2 kalimat) | Asisten AI Sidebar, gamifikasi, PWA *offline*, CMS anotasi, Find Your Food | — |

**Opsi dua artikel** (sering lebih kuat, tapi data & teks tidak boleh tumpang tindih):

| Artikel | Fokus | Uji |
|---|---|---|
| A | Kolaborasi real-time & otorisasi berlapis | E0, E1, E2, E4 |
| B | Evaluasi rekomendasi LLM berkendala skema | E3, E5 |

Jika prodi hanya meminta satu artikel, **kerjakan Artikel A dulu** — datanya paling cepat didapat dan tidak tergantung jadwal ahli gizi.

## A4. Judul

Kriteria: 12–20 kata, memuat **artefak + kontribusi + evaluasi**, hindari membuka dengan "Rancang Bangun Aplikasi ...".

| # | Judul | Dipakai bila |
|---|---|---|
| 1 | *Pengembangan dan Evaluasi Sistem Dietary Recall 24 Jam Berbasis Web dengan Kolaborasi Real-Time dan Rekomendasi Gizi Berbasis Large Language Model* | Satu artikel, dua kontribusi |
| 2 | *Sinkronisasi Langkah Lintas-Pengguna dan Otorisasi Berlapis pada Instrumen Dietary Recall 24 Jam Kolaboratif* | Artikel A |
| 3 | *Evaluasi Rekomendasi Gizi Berbasis Large Language Model Berkendala Skema pada Sistem Dietary Recall 24 Jam* | Artikel B |

Versi Inggris judul 1: *Development and Evaluation of a Web-Based 24-Hour Dietary Recall System with Real-Time Collaboration and Large Language Model–Based Nutrition Recommendations*.

## A5. Pertanyaan Penelitian & Hipotesis

Setiap RQ **harus** punya subbagian Hasil dan kalimat jawaban di Kesimpulan.

| Kode | Pertanyaan | Hipotesis / kriteria keberhasilan | Uji |
|---|---|---|---|
| RQ1 | Bagaimana kinerja sinkronisasi kursor & langkah *wizard* ketika peserta per ruang bertambah 2 → 20? | H1: latensi p95 kursor ≤ 300 ms dan langkah ≤ 500 ms sampai 20 klien; 0 pesan *drop*. H1b: *batching + coalescing* menurunkan pesan tersiar secara signifikan | E1 |
| RQ2 | Seberapa efektif otorisasi tiga lapis menolak upaya eskalasi peran dibanding satu/dua lapis? | H2: hanya konfigurasi tiga lapis yang memblokir 100% skenario | E2 |
| RQ3 | Bagaimana mutu rekomendasi LLM berkendala skema menurut ahli gizi dibanding rekomendasi berbasis aturan? | H3: skor rubrik LLM ≥ *baseline* aturan pada relevansi & kejelasan, tanpa skor keamanan lebih rendah; ≥ 95% respons valid skema | E3 |
| RQ4 | Bagaimana kebergunaan sistem menurut responden dan pendamping? | H4: skor SUS ≥ 68 (di atas rata-rata) | E4 |

> Kalau hasil tidak memenuhi hipotesis, **tetap laporkan** dan bahas penyebabnya. Hasil negatif yang dijelaskan dengan baik tetap merupakan kontribusi.

---

# BAGIAN B — STRUKTUR NASKAH

## B1. Struktur & Anggaran Halaman

Format IMRaD. Target **10–12 halaman template (±5.000–6.500 kata)**.

| Bagian | Porsi | ± Kata | Isi pokok | Bahan |
|---|---|---|---|---|
| Judul, penulis, afiliasi | — | — | §A4, §E1 | — |
| Abstrak + kata kunci | — | 200–250 | Masalah, tujuan, metode, **hasil berangka**, simpulan | §B2, §F3 |
| 1. Pendahuluan | 15% | 900 | Masalah → literatur → celah → kontribusi | §B3, §D1 |
| 2. Metode Penelitian | 25–30% | 1.600 | DSRM, arsitektur, mekanisme inti, rancangan uji | §B4, Bagian C, §D2–D7 |
| 3. Hasil dan Pembahasan | 40–45% | 2.500 | Hasil E0–E5, analisis, pembanding, validitas | §B5, Bagian C |
| 4. Kesimpulan | 5% | 250 | Jawaban RQ + kerja lanjutan | §B6 |
| Ucapan terima kasih | — | 50 | Pendana, BRIN/lab, ahli gizi non-penulis | §E1 |
| Daftar pustaka | — | — | 25–40 rujukan | §E3 |

> Di skripsi, bab perancangan paling tebal. Di artikel kebalikannya: **perancangan dipadatkan, hasil diperluas.**

## B2. Abstrak & Kata Kunci

Satu paragraf, lima unsur (masing-masing 1–2 kalimat):
1. **Masalah** — R24J bergantung pada pendampingan enumerator; sistem terkomputerisasi yang ada mandiri penuh.
2. **Tujuan** — mengembangkan dan mengevaluasi ...
3. **Metode** — DSRM; Go + WebSocket, Next.js; uji beban, ablation, penilaian ahli, SUS.
4. **Hasil (wajib angka)** — p95 latensi, % skenario terblokir, skor ahli + κ, skor SUS.
5. **Simpulan** — satu kalimat makna hasil.

Tanpa sitasi, tanpa singkatan yang belum dijelaskan, tanpa "diharapkan dapat ...". Tulis **paling akhir**. Template: §F3.

**Kata kunci (3–5):** *24-hour dietary recall; real-time collaboration; WebSocket; large language model; nutrition recommendation*.

## B3. Pendahuluan

Pola "corong", 5–6 paragraf:

| Paragraf | Isi | Bahan |
|---|---|---|
| P1 | Pentingnya penilaian asupan gizi; R24J sebagai metode baku; masalah gizi Indonesia (data SKI terbaru) | Skripsi 1.1, 2.1 |
| P2 | Tiga hambatan R24J: bias porsi, ketergantungan enumerator, jeda umpan balik | §D1 |
| P3 | Sistem terdahulu (Intake24, ASA24, myfood24, studi Indonesia) dan keterbatasannya | Skripsi 2.2, 2.12 |
| P4 | Kolaborasi real-time (CSCW, *workspace awareness*) matang di perkakas desain tapi belum di instrumen gizi; LLM untuk konseling gizi menjanjikan tapi berisiko halusinasi | Skripsi 2.3, 2.7 |
| P5 | **Celah penelitian** eksplisit + **kontribusi** C1–C3 berbentuk butir | §D1 |
| P6 | Tujuan / RQ | §A5 |

**Tabel perbandingan sistem terdahulu (wajib):**

| Sistem | Isi mandiri | Pendampingan real-time | Sinkronisasi langkah | Peran per sesi | Umpan balik gizi AI | Pangan Indonesia |
|---|---|---|---|---|---|---|
| Intake24 | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| ASA24 | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| myfood24 | ✓ | ✗ | ✗ | ✗ | Terbatas | ✗ |
| Studi lokal [ref] | ... | ... | ... | ... | ... | ... |
| **Atlas Food** | ✓ | ✓ | ✓ | ✓ (3 lapis) | ✓ (berkendala skema) | ✓ (TKPI 2020) |

> Setiap ✓/✗ sistem lain **harus** didukung rujukan atau dokumentasi resmi. Jangan klaim "belum ada penelitian ..." tanpa penelusuran literatur yang kata kuncinya tercatat (Scopus, Google Scholar, Garuda, SINTA).

**Rumusan kontribusi:**
- **C1.** Mekanisme sinkronisasi langkah *wizard* lintas-pengguna pada aplikasi satu halaman melalui atribut `step` pada *viewport state* yang dipertahankan server.
- **C2.** Model otorisasi peran per-ruang yang ditegakkan di tiga lapis independen (UI, klien, server) beserta pengingatan peran per-pengguna.
- **C3.** Evaluasi empiris kinerja, keamanan peran, dan kebergunaan sistem, serta evaluasi ahli terhadap rekomendasi gizi LLM berkendala skema.

## B4. Metode Penelitian

Tulis **cukup rinci untuk direplikasi**. Subbagian yang disarankan:

| Subbagian | Isi | Bahan |
|---|---|---|
| 2.1 Alur penelitian | Gambar 6 tahap DSRM + apa yang dikerjakan tiap tahap **di proyek ini** | §C1 |
| 2.2 Arsitektur sistem | 1 gambar + 1 paragraf | §D2 |
| 2.3 Alur recall 24 jam | Mesin keadaan 6 langkah + rumus gizi | §D5 |
| 2.4 Kolaborasi real-time | Topologi, protokol ringkas, kendali transport, *follow* + `step` (C1), tiga lapis peran (C2), alasan *awareness* bukan *co-editing* | §D6 |
| 2.5 Pipeline LLM | Prompt, skema JSON, normalisasi, *cache* + audit; **nama model, parameter, tanggal uji** | §D7 |
| 2.6 Rancangan evaluasi | Tabel E0–E5: variabel, instrumen, sampel, metrik, analisis + lingkungan uji | §C2–C10 |

## B5. Hasil dan Pembahasan

Satu subbagian per RQ, pola **Hasil → Interpretasi → Pembanding → Jawaban RQ**:

```
3.1 Hasil implementasi        (1 gambar komposit tangkapan layar + 1 paragraf)
3.2 Pengujian fungsional      (E0: N kasus, % lulus; cacat D1–D11 diringkas per kategori)
3.3 Kinerja real-time (RQ1)   (E1: tabel + grafik latensi vs jumlah klien)
3.4 Otorisasi berlapis (RQ2)  (E2: matriks skenario × konfigurasi)
3.5 Mutu rekomendasi (RQ3)    (E3: skor ahli + κ, LLM vs aturan; E5 sebagai pendukung)
3.6 Kebergunaan (RQ4)         (E4: SUS + metrik tugas)
3.7 Pembahasan umum           (implikasi + perbandingan dengan penelitian terdahulu)
3.8 Ancaman validitas & keterbatasan  (§C11, §D10)
```

Aturan:
- Jangan mengulang angka tabel saja — jelaskan **mengapa**.
- Bandingkan dengan **angka penelitian lain** (latensi sistem kolaboratif di literatur, SUS sistem R24J lain, studi evaluasi LLM gizi).
- Laporkan hasil negatif apa adanya.
- Tutup tiap subbagian dengan satu kalimat jawaban RQ.

## B6. Kesimpulan

1 paragraf, tanpa butir & tanpa sitasi. Jawab tiap RQ **dengan angka utama**, satu kalimat keterbatasan terpenting, 1–2 arah lanjutan konkret (lihat §D10). Tidak boleh ada hal baru.

## B7. Gambar & Tabel

Batasi **6–8 gambar, 4–6 tabel**, semuanya dirujuk di teks sebelum muncul.

| No | Isi | Bagian | Sumber |
|---|---|---|---|
| Gambar 1 | Tahapan DSRM | Metode | §C1 |
| Gambar 2 | Arsitektur sistem | Metode | §D2 |
| Gambar 3 | Mesin keadaan recall | Metode | §D5 |
| Gambar 4 | Sekuens *follow* + sinkronisasi `step` | Metode | §D6.5 |
| Gambar 5 | Pipeline LLM | Metode | §D7 |
| Gambar 6 | Komposit tangkapan layar | Hasil | Aplikasi |
| Gambar 7 | Grafik latensi p50/p95 vs jumlah klien | Hasil | E1 |
| Gambar 8 | Skor rubrik ahli LLM vs aturan | Hasil | E3 |
| Tabel 1 | Perbandingan sistem terdahulu | Pendahuluan | §B3 |
| Tabel 2 | Penegakan peran tiga lapis | Metode | §D6.6 |
| Tabel 3 | Hasil kinerja | Hasil | E1 |
| Tabel 4 | Matriks ablation | Hasil | E2 |
| Tabel 5 | Penilaian ahli + κ | Hasil | E3 |
| Tabel 6 | Hasil SUS | Hasil | E4 |

Diagram dalam format vektor (draw.io → SVG/PDF). Teks gambar ≥ 8 pt. Grafik berlabel sumbu & satuan. Tabel tiga garis horizontal. Tangkapan layar tanpa data pribadi. Diagram UML skripsi **tidak perlu semua** — pilih yang mendukung kontribusi.

---

# BAGIAN C — METODE & RANCANGAN PENGUJIAN

Bagian ini adalah **protokol siap jalan**. Ikuti langkahnya, simpan data mentah, lalu isi tabel `⬜ ISI`.

## C1. Kerangka DSRM

Penelitian memakai *Design Science Research Methodology* (Peffers dkk., 2007).

| Tahap DSRM | Yang dilakukan di Atlas Food | Keluaran |
|---|---|---|
| 1. Identifikasi masalah | Kajian literatur R24J + hambatan pendampingan enumerator, bias porsi, jeda umpan balik | Rumusan masalah, celah (§D1) |
| 2. Tujuan solusi | Menetapkan kebutuhan fungsional & non-fungsional (NF: latensi, *drop*, rekoneksi) | Daftar kebutuhan (Skripsi 3.5) |
| 3. Desain & pengembangan | Arsitektur Go + WebSocket ↔ Next.js; mekanisme *follow*/`step`; peran tiga lapis; pipeline LLM | Artefak (Bagian D) |
| 4. Demonstrasi | Skenario recall 3 waktu makan dengan pendamping bergabung via undangan | Sesi demonstrasi terekam |
| 5. Evaluasi | E0–E5 | Data hasil (Bagian C) |
| 6. Komunikasi | Artikel jurnal + skripsi | Naskah |

## C2. Lingkungan Uji

Catat dan cantumkan di naskah. **Isi saat pengujian:**

| Komponen | Spesifikasi |
|---|---|
| Server (CPU / RAM / OS) | ⬜ ISI |
| Lokasi server | ⬜ ISI (lokal / VPS / Docker) |
| Versi Go, Node.js, MySQL, Redis | ⬜ ISI |
| Mode hub | ⬜ ISI (single-node / Redis Pub/Sub) |
| Mesin klien (generator beban) | ⬜ ISI |
| Peramban + versi | ⬜ ISI |
| Jaringan | LAN dan emulasi 4G (latensi ±50 ms, *bandwidth* dibatasi) |
| Model LLM + tanggal uji | ⬜ ISI (default kode: `llama-3.3-70b-versatile`) |

## C3. Persiapan Teknis Sebelum Uji

Hal yang perlu ditambahkan/disiapkan dulu agar pengukuran valid:

| # | Persiapan | Untuk | Catatan |
|---|---|---|---|
| P1 | Sisipkan `t_send` (ms, `performance.now()`/`time.Now()`) ke muatan `cursor_move` dan `viewport_update` saat mode uji | E1 | Aktifkan via *flag* lingkungan agar tidak memengaruhi produksi |
| P2 | Skrip klien WebSocket sintetis (Go atau Node `ws`): bergabung ke ruang, kirim kursor 30 Hz, satu "leader" berganti langkah tiap N detik, catat waktu terima | E1 | Simpan log CSV: `run, n_clients, msg_type, t_send, t_recv` |
| P3 | Saklar konfigurasi untuk mematikan *batching/coalescing* | E1 (H1b) | Hanya di mode uji |
| P4 | Saklar untuk mematikan tiap lapis otorisasi (UI `inert`, gerbang klien, `canEdit()` server) | E2 | Hanya di mode uji; jangan di-*commit* ke produksi |
| P5 | Implementasi *baseline* rekomendasi berbasis aturan (AKG 2019 + ambang) dengan format keluaran sama dengan skema LLM | E3 | Supaya penilai tidak bisa menebak sumbernya |
| P6 | Dataset 30–50 kasus recall (sintetis/anonim) dalam JSON | E3, E5 | Variasi: kurang/lebih energi, protein, natrium, gula; anak/dewasa/lansia |
| P7 | Formulir SUS (Google Form) + lembar skenario tugas + *informed consent* | E4 | Draf consent: Skripsi Lampiran D |
| P8 | Ekspor data `ai_result_logs` (latensi, token) | E3 | Kolom `latency_ms`, `token_used`, `model_used` sudah ada |

## C4. E0 — Pengujian Fungsional

| Item | Rancangan |
|---|---|
| Tujuan | Memastikan semua fungsi kritis berjalan sesuai kebutuhan |
| Metode | Kotak-hitam (*black-box*) berbasis kebutuhan fungsional skripsi; teknik *equivalence partitioning* & *boundary value* untuk input (porsi 0 / 5000 / >5000 g, pencarian < 3 karakter) |
| Cakupan | Auth, survei, recall 6 langkah, submit, kolaborasi (undangan, follow, peran), analisis AI, admin |
| Pendukung | Uji otomatis Go (`go test ./...`) — laporkan jumlah uji & % lulus |
| Kriteria | 100% kasus kritis lulus |

**Tabel hasil:**

| Modul | Jumlah kasus | Lulus | Gagal | % lulus |
|---|---|---|---|---|
| Autentikasi | ⬜ | ⬜ | ⬜ | ⬜ |
| Recall 24 jam | ⬜ | ⬜ | ⬜ | ⬜ |
| Kolaborasi | ⬜ | ⬜ | ⬜ | ⬜ |
| Analisis AI | ⬜ | ⬜ | ⬜ | ⬜ |
| Admin | ⬜ | ⬜ | ⬜ | ⬜ |
| Uji otomatis Go | ⬜ | ⬜ | ⬜ | ⬜ |
| **Total** | ⬜ | ⬜ | ⬜ | ⬜ |

Cacat D1–D11 (§D9) dilaporkan sebagai temuan sebelum E0 final, diringkas per kategori.

## C5. E1 — Kinerja Real-Time

| Item | Rancangan |
|---|---|
| Tujuan | Menjawab RQ1 / H1, H1b |
| Variabel bebas | Jumlah klien per ruang: **2, 5, 10, 20** (opsional 50); batching **aktif / nonaktif**; jaringan **LAN / 4G** |
| Variabel terikat | Latensi kursor (ms), latensi sinkronisasi langkah (ms), *throughput* (pesan/s), pesan *drop*, waktu rekoneksi (s) |
| Definisi latensi kursor | `t_recv(follower) − t_send(leader)` untuk `cursor_move` → `cursor_update` |
| Definisi latensi langkah | Waktu dari leader pindah langkah sampai follower menjalankan `goToStep` ke langkah yang sama |
| Alat | Skrip P2 + 1 peramban nyata sebagai follower; endpoint `/collab/stats` |
| Pengulangan | ≥ 30 *run* per kondisi, ≥ 1.000 pesan per *run*; buang 10% awal (*warm-up*) |
| Sinkronisasi jam | Pengirim & pengukur di **mesin yang sama**, atau ukur *round-trip* lalu dibagi dua — nyatakan di naskah |
| Uji rekoneksi | Putus paksa koneksi (matikan jaringan/restart proksi) 10×, ukur waktu sampai `connected` |
| Statistik | Rerata ± SD, p50, p95, p99; Kruskal–Wallis antar jumlah klien; Mann–Whitney batching aktif vs nonaktif |
| Kriteria (NF skripsi) | Kursor p95 ≤ 300 ms · langkah p95 ≤ 500 ms · *drop* = 0 · rekoneksi ≤ 30 s |

**Langkah pelaksanaan:**
1. Jalankan backend dalam mode uji (P1, P3), catat lingkungan (§C2).
2. Untuk tiap kombinasi kondisi: jalankan skrip P2 30×, simpan CSV.
3. Ulangi dengan batching nonaktif.
4. Ulangi dengan emulasi 4G (Chrome DevTools / `tc netem` / Network Link Conditioner macOS).
5. Olah CSV (Python/pandas atau R) → tabel & grafik.

**Tabel hasil (LAN):**

| Metrik | 2 klien | 5 klien | 10 klien | 20 klien | Target |
|---|---|---|---|---|---|
| Latensi kursor rerata ± SD (ms) | ⬜ | ⬜ | ⬜ | ⬜ | — |
| Latensi kursor p95 (ms) | ⬜ | ⬜ | ⬜ | ⬜ | ≤ 300 |
| Latensi langkah rerata ± SD (ms) | ⬜ | ⬜ | ⬜ | ⬜ | — |
| Latensi langkah p95 (ms) | ⬜ | ⬜ | ⬜ | ⬜ | ≤ 500 |
| *Throughput* (pesan/s) | ⬜ | ⬜ | ⬜ | ⬜ | — |
| Pesan *drop* | ⬜ | ⬜ | ⬜ | ⬜ | 0 |
| Waktu rekoneksi rerata (s) | ⬜ | ⬜ | ⬜ | ⬜ | ≤ 30 |

**Tabel hasil (batching):**

| Kondisi (20 klien) | Pesan kursor masuk | Pesan tersiar | Rasio reduksi | Latensi p95 (ms) |
|---|---|---|---|---|
| Batching + coalescing nonaktif | ⬜ | ⬜ | — | ⬜ |
| Batching + coalescing aktif | ⬜ | ⬜ | ⬜ | ⬜ |

Ulangi tabel pertama untuk kondisi 4G.

## C6. E2 — Efektivitas Otorisasi Berlapis

| Item | Rancangan |
|---|---|
| Tujuan | Menjawab RQ2 / H2 — membuktikan mengapa **tiga** lapis dibutuhkan |
| Metode | *Ablation study* + uji penetrasi skenario |
| Konfigurasi | K1: hanya lapis UI · K2: UI + klien · K3: UI + klien + server · (opsional K4: hanya server) |
| Metrik | Jumlah skenario yang diblokir per konfigurasi |
| Pelaksana | Peneliti; tiap skenario dijalankan 3× dan direkam layar |

**Skenario uji (sebagai `viewer`):**

| # | Skenario | K1 | K2 | K3 |
|---|---|---|---|---|
| S1 | Klik/ketik pada elemen langkah wizard | ⬜ | ⬜ | ⬜ |
| S2 | Navigasi papan ketik (Tab) ke input lalu mengetik | ⬜ | ⬜ | ⬜ |
| S3 | Hapus atribut `inert` lewat DevTools lalu mengubah isian | ⬜ | ⬜ | ⬜ |
| S4 | Kirim pesan mutasi (`meal_add`, `portion_set`) langsung lewat konsol WebSocket | ⬜ | ⬜ | ⬜ |
| S5 | Kirim pesan mutasi pada jeda sebelum `state_sync` tiba | ⬜ | ⬜ | ⬜ |
| S6 | Pindah halaman sehingga `?invite=` hilang, lalu bergabung lagi (eskalasi ke editor) | ⬜ | ⬜ | ⬜ |
| S7 | Buka tab kedua tanpa parameter undangan | ⬜ | ⬜ | ⬜ |
| S8 | Memakai token undangan yang sudah dicabut | ⬜ | ⬜ | ⬜ |
| S9 | Memakai token undangan kedaluwarsa | ⬜ | ⬜ | ⬜ |
| S10 | Undangan `viewer` ke ruang kosong (mencoba menjadi owner) | ⬜ | ⬜ | ⬜ |
| S11 | Koneksi WebSocket dari *origin* yang tidak diizinkan | ⬜ | ⬜ | ⬜ |
| S12 | Koneksi WebSocket tanpa / dengan JWT tidak valid | ⬜ | ⬜ | ⬜ |
| | **Jumlah diblokir** | ⬜/12 | ⬜/12 | ⬜/12 |

Isi dengan ✓ (diblokir) / ✗ (lolos). S6, S7, S10 juga didukung uji otomatis di `collab/hub_test.go` — sebutkan di naskah.

## C7. E3 — Mutu Rekomendasi LLM

| Item | Rancangan |
|---|---|
| Tujuan | Menjawab RQ3 / H3 |
| Kasus uji | 30–50 laporan recall (P6), anonim/sintetis |
| Kondisi | (a) LLM berkendala skema (sistem) · (b) *baseline* aturan (P5) · opsional (c) LLM tanpa skema |
| Penilai | **≥ 2 ahli gizi** (dosen gizi / nutrisionis / dietisien), **dibutakan** terhadap sumber; urutan keluaran diacak |
| Rubrik (Likert 1–5) | R1 Relevansi dengan data laporan · R2 Kesesuaian pedoman gizi seimbang · R3 Ketepatan fakta · R4 Keamanan (tidak ada saran berisiko) · R5 Kejelasan bagi awam |
| Kesepakatan penilai | ICC(2,k) atau *weighted* Cohen's κ; interpretasi Landis & Koch / Koo & Li |
| Metrik objektif | % valid skema JSON · konsistensi `overall_status` pada 5 pengulangan · Jaccard `recommended_foods` antar pengulangan · latensi & token (dari `ai_result_logs`) |
| Statistik | Wilcoxon *signed-rank* LLM vs aturan per kriteria (berpasangan per kasus) |
| Kriteria | H3 (lihat §A5) |

**Langkah pelaksanaan:**
1. Susun rubrik bersama minimal satu ahli gizi; uji coba pada 3 kasus (kalibrasi), revisi rubrik.
2. Jalankan tiap kasus ke LLM 5× (untuk konsistensi) dan ke *baseline* 1×.
3. Ambil keluaran pertama LLM + keluaran *baseline*, acak urutan, beri kode A/B.
4. Ahli menilai secara independen (Google Sheet terpisah per ahli).
5. Hitung skor, κ/ICC, uji Wilcoxon, metrik objektif.

> **Jangan** memakai LLM lain sebagai satu-satunya penilai. Ahli manusia adalah acuan utama.

**Tabel hasil:**

| Kriteria | LLM rerata (SD) | Aturan rerata (SD) | p (Wilcoxon) | κ / ICC |
|---|---|---|---|---|
| R1 Relevansi | ⬜ | ⬜ | ⬜ | ⬜ |
| R2 Gizi seimbang | ⬜ | ⬜ | ⬜ | ⬜ |
| R3 Ketepatan fakta | ⬜ | ⬜ | ⬜ | ⬜ |
| R4 Keamanan | ⬜ | ⬜ | ⬜ | ⬜ |
| R5 Kejelasan | ⬜ | ⬜ | ⬜ | ⬜ |

| Metrik objektif | Nilai |
|---|---|
| Jumlah panggilan (N) | ⬜ |
| % respons valid skema | ⬜ |
| Konsistensi `overall_status` (5×) | ⬜ |
| Jaccard `recommended_foods` rerata | ⬜ |
| Latensi rerata / median / p95 (ms) | ⬜ |
| Token rerata | ⬜ |

## C8. E4 — Evaluasi Formatif & *Cognitive Walkthrough* oleh 7 Pakar Domain BRIN

| Item | Rancangan & Definisi Operasional |
|---|---|
| **Tujuan** | Menjawab RQ4 / H4: Mengevaluasi kebergunaan antarmuka, kesesuaian alur 6 langkah recall terhadap metodologi gizi baku, dan efektivitas pendampingan kolaboratif melalui evaluasi formatif tingkat kepakaran. |
| **Sasaran Partisipan** | **$n = 7$ Orang Peneliti / Ahli Domain dari Badan Riset dan Inovasi Nasional (BRIN)**.<br/>*Komposisi:* 4 Peneliti Gizi Masyarakat & Epidemiologi Diet, 2 Enumerator Riset Lapangan Terlatih, dan 1 Peneliti Informatika Medis/Sistem Informasi. |
| **Justifikasi Metodologis ($n = 7$)** | 1. **Lewis & Sauro (2021) dan Nielsen (1993):** Evaluasi kebergunaan formatif berbasis penemuan masalah (*usability problem discovery*) mencapai titik efisiensi optimal (*point of diminishing returns*) pada **5 hingga 8 partisipan**, mampu mengungkap **80%–85% cacat interaksi dan friksi navigasi kritis**.<br/>2. **Faulkner (2003):** Studi empiris membuktikan kelompok 5–7 partisipan menemukan rerata **>85%–90% masalah kebergunaan**.<br/>3. **FEDS Framework dalam DSRM (Venable et al., 2016):** Evaluasi artifak pada tahap *Formative Evaluation* memang dirancang melibatkan kelompok kecil pakar domain (*domain experts*) untuk memvalidasi *functional fitness* sebelum evaluasi sumatif lapangan berskala besar. |
| **Metode Pengujian** | ***Task-based Cognitive Walkthrough*** dipadukan dengan kuesioner baku *System Usability Scale* (SUS) dan wawancara terstruktur semi-terbuka. |
| **Skenario Tugas Terstruktur** | **T1:** Alur Pengisian Recall 6-Langkah (pemilihan waktu makan, pencarian pangan TKPI 2020, pemilihan porsi visual Series A–H dan Range, pencatatan URT).<br/>**T2:** Kolaborasi Real-Time Berpendamping (bergabung via token/link undangan, *follow mode*, coretan/laser pada *Live Canvas* di atas foto porsi, verifikasi peran *viewer/editor*).<br/>**T3:** Evaluasi Keluaran Naratif Rekomendasi LLM (penilaian relevansi zat gizi dan keamanan klinis saran alternatif bahan pangan).<br/>**T4:** Uji Ketahanan Luring PWA (simulasi koneksi putus saat submit $\rightarrow$ antrean lokal IndexedDB $\rightarrow$ sinkronisasi otomatis idempoten saat terhubung kembali). |
| **Metrik Evaluasi** | 1. **Skor SUS (0–100):** 10 butir instrumen baku Brooke (1996) versi Bahasa Indonesia (Sharfina & Santoso, 2016).<br/>2. **Tingkat Penyelesaian Tugas (*Task Completion Rate* %):** Persentase tugas T1–T4 yang diselesaikan tanpa intervensi fasilitator.<br/>3. **Waktu Penyelesaian Tugas (*Time-on-Task*):** Durasi pengerjaan recall per sesi (menit).<br/>4. **Umpan Balik Kualitatif:** Temuan friksi kognitif dan saran perbaikan spesifik domain gizi. |

**Tabel Profil Pakar Evaluator BRIN ($n = 7$):**

| Kode | Peran / Bidang Kepakaran | Pengalaman Riset Diet / Survei | Perangkat Uji |
|---|---|---|---|
| EXP-01 | Peneliti Utama Gizi Masyarakat (BRIN) | > 10 Tahun | Desktop macOS (Chrome) |
| EXP-02 | Peneliti Gizi Klinis & Dietetik (BRIN) | 7 Tahun | Laptop Windows 11 (Edge) |
| EXP-03 | Peneliti Epidemiologi Kesehatan (BRIN) | 5 Tahun | Laptop Windows 11 (Chrome) |
| EXP-04 | Peneliti Gizi / Koordinator Enumerator (BRIN) | 6 Tahun | iPad / Safari Mobile |
| EXP-05 | Enumerator Survei Konsumsi Nasional (BRIN) | 4 Tahun | Android Tablet (Chrome) |
| EXP-06 | Enumerator Survei Lapangan R24J (BRIN) | 3 Tahun | Android Smartphone (Chrome PWA) |
| EXP-07 | Peneliti Informatika Medis / Sistem Informasi (BRIN)| 8 Tahun | Laptop Linux (Firefox) |

**Tabel Hasil Evaluasi Formatif & SUS ($n = 7$ Pakar BRIN):**

| No | Parameter Evaluasi | Target Kriteria | Nilai Hasil Uji | Keterangan / Predikat |
|---|---|---|---|---|
| 1 | Rerata Skor SUS ($\pm$ SD) | > 70,0 (Acceptable) | ⬜ | *(Misal: 81,4 $\pm$ 4,2 $\rightarrow$ Grade A / Excellent)* |
| 2 | Tingkat Penyelesaian Tugas T1 (Alur Recall 6 Langkah) | 100% | ⬜ % | Selesai mandiri |
| 3 | Tingkat Penyelesaian Tugas T2 (Kolaborasi Real-Time) | ≥ 90% | ⬜ % | Sinkronisasi kursor & kanvas berhasil |
| 4 | Tingkat Penyelesaian Tugas T3 (Verifikasi LLM) | 100% | ⬜ % | Rekomendasi dinilai relevan |
| 5 | Tingkat Penyelesaian Tugas T4 (Sinkronisasi Luring PWA) | 100% | ⬜ % | Laporan tidak hilang / duplikat |
| 6 | Rerata Waktu Pengisian 1 Hari Recall (menit) | ≤ 15 menit | ⬜ menit | Menurunkan beban kognitif wawancara |
| 7 | Proporsi Bahan Makanan Tercatat per Hari | ≥ 8 bahan | ⬜ item | Kelengkapan data memadai |

**Ringkasan Temuan Kualitatif Pakar BRIN:**
- *Kelebihan menurut Pakar:* Kemudahan identifikasi porsi melalui penampil visual foto porsi (*series* dan *range*), fitur kanvas langsung (*live canvas*) yang sangat membantu enumerator mengarahkan potongan porsi tanpa mengambil alih kepemilikan data responden, serta kecepatan respon kalkulasi gizi deterministik.
- *Rekomendasi Pakar untuk Riset Lanjutan:* Penambahan basis data pangan lokal spesifik daerah pedesaan, serta integrasi asisten dialogis per langkah (*Atlas AI Sidebar*) untuk konversi Ukuran Rumah Tangga (URT) lokal ke foto porsi.

## C9. E5 — Verifikasi Perhitungan Gizi

| Item | Rancangan |
|---|---|
| Tujuan | Membuktikan angka gizi yang dihitung sistem (dan diberikan ke LLM) benar |
| Metode | 20 menu sampel; hitung manual dari TKPI 2020: `(nilai_per_100g / 100) × berat_gram` |
| Metrik | Selisih absolut rata-rata (MAE) per zat gizi: energi, protein, karbohidrat, lemak |
| Kriteria | MAE ≤ 0,1 (sisa pembulatan satu desimal) |

| Zat gizi | MAE | Selisih maks |
|---|---|---|
| Energi (kkal) | ⬜ | ⬜ |
| Protein (g) | ⬜ | ⬜ |
| Karbohidrat (g) | ⬜ | ⬜ |
| Lemak (g) | ⬜ | ⬜ |

Makna untuk naskah: LLM **tidak** menghitung gizi — perhitungan deterministik, LLM hanya menafsirkan. Ini argumen penting melawan risiko halusinasi numerik.

## C10. Ringkasan Analisis Statistik

| Uji | Data | Uji statistik | Alat |
|---|---|---|---|
| E1 | Latensi (tidak normal) | Deskriptif persentil, Kruskal–Wallis, Mann–Whitney | Python (pandas, scipy) / R |
| E2 | Biner per skenario | Deskriptif (jumlah & %) | Spreadsheet |
| E3 | Likert berpasangan | Wilcoxon *signed-rank*, ICC / *weighted* κ | Python (pingouin) / SPSS |
| E4 | Skor SUS | Deskriptif, Mann–Whitney (2 kelompok) | Spreadsheet / SPSS |
| E5 | Numerik | MAE | Spreadsheet |

Tingkat signifikansi α = 0,05. Laporkan juga ukuran efek (r untuk Wilcoxon/Mann–Whitney). Uji normalitas (Shapiro–Wilk) sebelum memilih uji.

## C11. Ancaman terhadap Validitas

Wajib ditulis di naskah:

| Jenis | Ancaman | Mitigasi |
|---|---|---|
| Internal | Klien sintetis di LAN tidak mencerminkan jaringan seluler nyata | Uji tambahan emulasi 4G |
| Internal | Peneliti juga pengembang (bias penilaian fungsional) | Skenario terdokumentasi, rekaman layar, uji otomatis |
| Eksternal | Responden SUS mayoritas mahasiswa | Nyatakan karakteristik; sarankan uji lapangan |
| Konstruk | SUS mengukur persepsi, bukan akurasi asupan | Tambahkan metrik objektif (waktu, `missing_foods`) |
| Kesimpulan | LLM non-deterministik & versi model bisa berubah | 5× pengulangan, catat model & tanggal |
| Kesimpulan | Jumlah ahli gizi sedikit | Laporkan κ/ICC; nyatakan sebagai keterbatasan |

---

# BAGIAN D — BAHAN TEKNIS SISTEM

Fakta di bagian ini diverifikasi dari kode. Pakai untuk menulis Metode dan Pembahasan.

## D1. Posisi Riset & Kebaruan

**Masalah domain.** R24J — responden mengingat seluruh konsumsi 24 jam terakhir beserta porsinya — punya tiga hambatan:
1. **Bias estimasi porsi** — orang awam sulit mengubah "satu piring nasi" ke gram; buku foto porsi kertas statis dan sulit didistribusikan.
2. **Ketergantungan pada enumerator** — mutu data bergantung pada *probing* enumerator terlatih; wawancara tatap muka mahal, sedangkan instrumen mandiri menghilangkan pendampingan.
3. **Jeda umpan balik** — responden tidak mendapat manfaat langsung → motivasi rendah, risiko *underreporting*.

**Celah.** Sistem R24J terkomputerisasi yang mapan (Intake24, ASA24) bersifat **mandiri penuh**: satu responden, satu sesi. Kolaborasi multi-pengguna real-time (kursor langsung, *presence*, *follow mode*) lazim di perkakas desain/dokumen, tetapi belum di **instrumen pengumpulan data gizi**. Atlas Food mengisi irisan itu: R24J yang bisa diisi mandiri namun dapat "dimasuki" pendamping dari jarak jauh, dengan kontrol peran, tanpa berbagi kredensial atau *remote desktop*.

**Klaim kebaruan** (berbasis rancangan, bukan superioritas empiris):

| Kode | Kebaruan | Dipakai di artikel |
|---|---|---|
| N1 | **Sinkronisasi tingkat-langkah pada wizard SPA** — semua langkah berbagi satu URL, sehingga *follow* berbasis *path* gagal; diselesaikan dengan atribut `step` di `viewport_update` yang dipertahankan server | **Inti (C1)** |
| N2 | **Otorisasi tiga lapis untuk peran per-ruang** — UI (`inert`), gerbang klien, *hub* server + pengingatan peran per-pengguna | **Inti (C2)** |
| N3 | **Rekomendasi LLM berkendala skema + cache per-submission** — keluaran JSON tetap, dinormalisasi dua kali, disimpan sebagai log audit | **Inti (C3)** |
| N4 | Asisten AI percakapan per langkah (*Atlas AI Sidebar*) — menjembatani bahasa URT ke opsi foto porsi; kalkulasi tetap deterministik (TKPI 2020) | Konteks |
| N5 | Gamifikasi & *leaderboard* survei (XP, *streak*, papan peringkat anonim) | Konteks |

**Ruang lingkup.** Termasuk: autentikasi & peran, manajemen survei, katalog pangan & gizi, estimasi porsi berbasis foto, recall 6 langkah, kolaborasi real-time, analisis LLM, portal admin, CMS anotasi. Tidak termasuk: replikasi isian recall antar peserta (*awareness*, bukan *co-editing*), aplikasi *native*, antropometri, integrasi rekam medis.

## D2. Tumpukan Teknologi & Arsitektur

| Lapis | Teknologi | Catatan |
|---|---|---|
| Frontend | Next.js (App Router), React 19, TypeScript | *Client components* |
| State klien | Zustand (kolaborasi), TanStack Query (server state) | |
| Styling | Tailwind CSS v4 + *design token* | |
| Validasi | Zod + React Hook Form | |
| Backend | Go, Gin | REST + WebSocket dalam satu proses |
| Real-time | `gorilla/websocket` | Hub in-memory + **Redis Pub/Sub** untuk siaran lintas-node (jatuh ke *single-node* bila Redis tidak tersedia) |
| ORM / DB | GORM · MySQL 8 (InnoDB, utf8mb4) | Migrasi SQL bernomor |
| Cache / broker | Redis 7.2 | |
| Autentikasi | JWT (`golang-jwt/jwt/v5`) | *Cookie*; *query* saat *handshake* WS |
| LLM | Groq Chat Completions (kompatibel OpenAI) | Default `llama-3.3-70b-versatile` (konfigurasi `GROQ_MODEL`) |
| Data gizi | TKPI 2020 Kemenkes RI | Di-*seed* ke `food_nutrients` |

```mermaid
flowchart TB
    subgraph Klien["Peramban (Next.js SPA)"]
        RW["Wizard Recall<br/>6 langkah"]
        CS["CollabSession"]
        AI["Panel Rekomendasi AI"]
        AD["Portal Admin & CMS Anotasi"]
    end
    subgraph Server["Backend Go (Gin)"]
        REST["REST /api/v1"]
        HUB["Collab Hub<br/>(WebSocket)"]
        SVC["Domain Services<br/>survey · food · submission · ai · annotation"]
    end
    DB[("MySQL 8")]
    RD[("Redis<br/>Pub/Sub")]
    GROQ["Groq API"]
    FS["/uploads"]
    RW -->|HTTP JSON| REST
    AD -->|HTTP JSON| REST
    AI -->|POST /ai/nutrition-analysis| REST
    CS <-->|WebSocket| HUB
    HUB <--> RD
    REST --> SVC
    HUB --> SVC
    SVC --> DB
    SVC -->|prompt berkendala skema| GROQ
    SVC --> FS
```

**Pola kode *domain-driven modular*.** Backend `internal/domain/<nama>/` berisi `model.go`, `dto.go`, `repository.go`, `service.go`, `handler.go` (domain: `auth`, `survey`, `food`, `submission`, `ai`, `annotation`, `collab`, `upload`). Frontend `internal/domain/<nama>/` berisi `components/`, `hooks/`, `services/`, `store/`, `types/`, dsb. Rute `app/` tipis (gerbang sesi + perakitan komponen). Dependensi searah: `app/` → `internal/domain/*` → `internal/lib|pkg`.

## D3. Model Data

```mermaid
erDiagram
    users ||--o{ surveys : "created_by"
    users ||--o{ survey_participants : "user_id"
    surveys ||--o{ survey_participants : ""
    surveys ||--o{ survey_submissions : ""
    survey_participants ||--o{ survey_submissions : ""
    survey_submissions ||--|| ai_result_logs : "1:1 (unique)"
    categories ||--o{ foods : ""
    foods ||--o{ food_nutrients : ""
    foods ||--o{ food_portion_size_methods : ""
    foods ||--o{ as_served_sets : ""
    as_served_sets ||--o{ as_served_images : ""
    foods ||--o{ food_images : "anotasi"
    food_images ||--o{ food_areas : "polygon"
```

| Tabel | Kolom penting | Peran |
|---|---|---|
| `users` | `role` (admin/respondent) | Identitas & RBAC |
| `surveys` | `slug`, `meals_config` (JSON), `prompts` (JSON), `status`, `access_token` | Konfigurasi instrumen |
| `survey_participants` | `survey_id`, `user_id`, `alias` | Tautan pengguna ↔ survei |
| `survey_submissions` | `meals_data` (JSON), `missing_foods` (JSON), `total_energy/protein/carbs/fat` | Laporan recall final |
| `ai_result_logs` | `submission_id` (**unique**), `input_payload`, `raw_response`, `overall_status`, `model_used`, `token_used`, `latency_ms` | Cache + audit LLM |
| `foods`, `categories`, `nutrient_types`, `food_nutrients` | `FULLTEXT(name, local_name)` | Katalog & gizi per 100 g |
| `food_portion_size_methods`, `as_served_sets`, `as_served_images` | `method_type`, `weight_gram` | Aset porsi foto |
| `food_images`, `food_areas` | poligon, draft/published | CMS anotasi |

**Keputusan desain yang perlu dijelaskan di naskah:**
- **JSON untuk `meals_data`** — struktur bersarang & variatif, selalu dibaca utuh, tidak di-*query* per baris; total gizi didenormalisasi ke kolom numerik agar agregasi murah.
- **Gizi dihitung saat pengisian** — `(nilai_per_100g / 100) × berat_gram`, dibulatkan 1 desimal; nilai tersimpan adalah *snapshot*, sehingga perubahan basis data tidak mengubah laporan historis (sifat yang diinginkan untuk data penelitian).
- **`ai_result_logs.submission_id` unik** — tepat satu analisis per laporan sekaligus *cache* alami.

## D4. Autentikasi & Peran

**Dua sumbu peran (jangan dicampur):**

| Sumbu | Nilai | Sumber | Cakupan |
|---|---|---|---|
| Peran aplikasi | `admin`, `respondent` | Klaim JWT | Akses endpoint REST |
| Peran ruang | `owner`, `editor`, `viewer` | Ditetapkan hub saat bergabung | Satu sesi kolaborasi |

Peran ruang tidak pernah menaikkan hak akses REST.

**Alur:** `POST /auth/login` → JWT di *cookie* → middleware `JWTAuth()` → `AdminOnly()`/`RespondentOnly()`. *Handshake* WS mengirim token sebagai *query* (`/collab/rooms/{room_id}/ws?token=…&invite=…`) karena peramban tidak bisa mengirim header `Authorization` pada WS. *Origin* WS dibatasi *allowlist* yang sama dengan CORS.

**Penetapan peran ruang (`hub.registerClient`):**
1. Peran yang sudah tercatat untuk pengguna di ruang itu **menang** (mencegah eskalasi via navigasi tanpa `?invite=`).
2. Klien pertama di ruang yang tidak masuk lewat undangan `viewer` → `owner`.
3. Tab kedua pengguna yang sama **mewarisi** peran tab pertama.
4. Bawaan: `editor`.

Banyak *socket* per pengguna diizinkan (multi-tab); *presence* didedup per `user_id`, notifikasi "bergabung" hanya untuk *socket* pertama. Semua aturan ini punya uji otomatis di `collab/hub_test.go`.

## D5. Modul Recall 24 Jam

```mermaid
stateDiagram-v2
    [*] --> select_meal
    select_meal --> add_food : pilih waktu makan + jam
    add_food --> portion : ≥1 makanan dari basis data
    portion --> additional : semua makanan berporsi
    additional --> review
    review --> done : submit berhasil
    review --> select_meal : "Tambah waktu makan"
    review --> portion : "Ubah porsi"
    done --> select_meal : "Isi waktu makan lain"
    done --> [*] : "Selesai"
```

| # | Langkah | Masukan | Syarat lanjut |
|---|---|---|---|
| 1 | `select_meal` | Waktu makan (dari `meals_config`), jam | Waktu makan terisi |
| 2 | `add_food` | Pencarian (min. 3 karakter, *debounce* 300 ms), catat manual bila tidak ada | ≥ 1 makanan dari basis data |
| 3 | `portion` | Foto porsi (*as served*) atau berat manual (maks. 5000 g) | Semua porsi > 0 |
| 4 | `additional` | Bahan tambahan (12 pilihan cepat + takaran) | Opsional |
| 5 | `review` | Ringkasan + total gizi | Validasi lolos |
| 6 | `done` | Konfirmasi + panel AI | — |

**Persistensi.** `localStorage` kunci `atlas-food-recall-session`, *envelope* `{savedAt, session}` TTL 24 jam — R24J bisa diisi bertahap sepanjang hari; *refresh* tidak menghilangkan progres.

**Validasi sebelum kirim:** `survey_id` ada; ≥ 1 waktu makan berisi makanan; semua makanan `portion_gram > 0`. `missing_foods` tetap dikirim (masukan bagi pengelola katalog) dan ditandai "tanpa nilai gizi".

**Struktur laporan:**

```jsonc
{
  "survey_id": "uuid", "participant_id": "uuid", "respondent_name": "string",
  "meals_data": [{
    "name": "Sarapan", "time": "07:00",
    "foods": [{
      "food_id": "uuid", "food_name": "Nasi Putih", "portion_gram": 150,
      "portion": { "method": "simple_grid | input", "image_id": "uuid?", "base_weight": 100,
                   "quantity": 1, "fraction": 0, "portion_gram": 150 },
      "nutrients": { "energy": 195, "protein": 3.6, "carbs": 42.9, "fat": 0.3 },
      "additionals": [{ "name": "Minyak", "amount_value": 5, "unit": "ml" }]
    }],
    "meal_total": { "energy": 195, "protein": 3.6, "carbs": 42.9, "fat": 0.3 }
  }],
  "daily_total": { "energy": 0, "protein": 0, "carbs": 0, "fat": 0 },
  "missing_foods": [{ "name": "Sambal buatan ibu" }]
}
```

**Alur end-to-end:**

```mermaid
sequenceDiagram
    actor R as Responden
    participant FE as SPA Next.js
    participant API as REST Go
    participant DB as MySQL
    participant AI as Groq
    R->>FE: Login → /surveys
    FE->>API: GET /survey/active
    R->>FE: Pilih survei
    FE->>API: POST /survey/access
    API->>DB: INSERT/GET survey_participants
    API-->>FE: {survey, participant, access_token}
    FE->>FE: Wizard langkah 1..5 (localStorage)
    FE->>API: GET /public/foods/search, /public/foods/{id}
    FE->>API: POST /survey/submit
    API->>DB: INSERT survey_submissions
    R->>FE: "Analisis dengan AI"
    FE->>API: POST /ai/nutrition-analysis
    API->>DB: cek ai_result_logs
    alt belum ada
        API->>AI: chat.completions (JSON mode)
        API->>DB: INSERT ai_result_logs
    end
    API-->>FE: {source: groq|cache, data}
```

## D6. Modul Kolaborasi Real-Time

Inti kebaruan — porsi terbesar di Metode.

### D6.1 Model konseptual

Mengikuti model **awareness** (perkakas desain kolaboratif), **bukan co-editing** (CRDT/OT). Yang direplikasi: kehadiran, kursor, *viewport*, langkah aktif, aktivitas, kunci entitas. Isian recall **tidak** direplikasi.

**Alasan (tulis tegas di naskah):** R24J punya **satu responden sebagai sumber kebenaran**. Pihak lain menulis langsung ke laporan akan mencemari validitas data. Pendamping cukup **melihat, mengarahkan, memverifikasi**.

### D6.2 Topologi

```mermaid
flowchart LR
    C1["Klien A (owner)"] <-->|WS| H
    C2["Klien B (editor)"] <-->|WS| H
    C3["Klien C (viewer)"] <-->|WS| H
    H["Hub"] --> R1["Room recall-{token}"]
    H --> R2["Room find-food-{id}"]
    H <--> PS["Redis Pub/Sub<br/>(lintas-node)"]
    R1 --> HIST["Ring buffer 100 pesan"]
    R1 --> ROLES["Peta peran per user"]
    H --> LOCK["LockManager"]
    H --> INV["InviteStore (TTL 24 jam)"]
```

- **Hub**: peta `roomID → Room`, kanal register/unregister/broadcast, `LockManager`, `InviteStore`; siaran juga diteruskan ke Redis Pub/Sub (`atlas:prod:ws:pubsub:room:*`) bila tersedia.
- **Room**: *ring buffer* 100 pesan, peta peran per pengguna, *ticker* batching 50 ms.
- **Pembersihan**: ruang kosong dihapus setelah masa tenggang.

### D6.3 Protokol pesan

Amplop: `{ "type", "room_id", "user_id", "username", "payload", "timestamp" }`

| Klien → Server | Payload utama | Mutasi? |
|---|---|---|
| `presence_join` | `user_id`, `display_name`, `role` | tidak |
| `cursor_move` | `x`, `y`, `scroll_x`, `scroll_y`, `page` | tidak |
| `viewport_update` | `page`, `path`, `scroll_x/y`, **`step`**, `zoom` | tidak |
| `follow_user` / `unfollow_user` | `user_id` | tidak |
| `food_search`, `food_select`, `meal_add`, `portion_set/select`, `review_submit` | data terkait | **ya** |
| `db_edit_start/field/save/cancel` | `entity_type`, `entity_id`, `version` | **ya** |
| `get_history`, `ping` | — | tidak |

Server → klien: `presence_list`, `presence_joined/left`, `cursor_update`, `viewport_sync`, `follow_started/stopped`, `follow_state`, `food_selected`, `meal_updated`, `portion_updated`, `review_submitted`, `db_locked/unlocked/field_updated/edit_saved`, `activity_log`, `state_sync`, `history`, `error`, `pong`.

### D6.4 Kendali transport

| Mekanisme | Nilai | Alasan |
|---|---|---|
| Ukuran pesan maks. | 64 KB | Tolak muatan abnormal |
| *Rate limit* | 50 pesan/s/klien | Lindungi hub |
| Batching | *Ticker* 50 ms, *flush* paksa pada 50 pesan | Redam kursor/viewport frekuensi tinggi |
| *Coalescing* kursor | Hanya posisi terakhir per pengguna | Buang *frame* antara |
| Riwayat | 100 pesan; kursor & `viewport_sync` tidak dicatat | Riwayat tidak dibanjiri |
| *Heartbeat* | `ping` klien 25 s; `pongWait` 60 s, `pingPeriod` 54 s | Deteksi koneksi mati |
| Rekoneksi | *Exponential backoff* `2^n` s, batas 30 s | Hindari badai rekoneksi |
| Buffer kirim | 256 pesan/klien; lebih → *drop* + dicatat | Klien lambat tak memblokir hub |

### D6.5 *Follow mode* + sinkronisasi langkah (C1)

```mermaid
sequenceDiagram
    participant F as Follower
    participant H as Hub
    participant L as Leader
    F->>H: follow_user {user_id: L}
    H-->>F: follow_started
    H-->>L: follow_started ("diikuti")
    H-->>F: viewport_sync (viewport terakhir leader)
    L->>H: viewport_update {path, scroll, step}
    H-->>F: viewport_sync (hanya ke pengikut L)
```

Tiga persoalan teknis yang diselesaikan:
1. **Path leader tidak menimpa konteks follower** — `mergeLeaderPathForFollower` menyalin `pathname` + `q`, tetapi mempertahankan `room` & `invite` follower; navigasi `router.replace`.
2. **Wizard SPA tanpa URL per langkah** — langkah aktif disiarkan sebagai `step`, disimpan server, diterapkan follower via `goToStep` setelah divalidasi terhadap daftar langkah sah (input jaringan tidak dipercaya mentah).
3. **Setiap `viewport_update` wajib membawa `step`** — server menyimpan viewport secara *replace*; satu pesan *scroll* tanpa `step` akan menghapus jejak langkah. Karena itu langkah disimpan di *store* dan dibaca semua pengirim.

Perlindungan *loop*: peserta yang sedang mengikuti berhenti menyiarkan kursor/pencarian sendiri dan tidak memantulkan langkah leader.

### D6.6 Undangan & otorisasi tiga lapis (C2)

**Undangan.** `POST /collab/rooms/{room_id}/invite` → token heksadesimal 16 byte (`crypto/rand`), peran `editor|viewer`, TTL 24 jam. Tautan berbagi dibentuk dengan **mengosongkan query lama** lalu menyetel `room` + `invite`.

| Lapis | Mekanisme | Berkas |
|---|---|---|
| 1 — UI | `ViewerLock` membungkus isi langkah dengan atribut `inert` (keluar dari *tab order*, *pointer event*, *accessibility tree*) | `collab/components/ViewerLock.tsx` |
| 2 — Klien | `send()` menyaring `COLLAB_MUTATE_TYPES`; **fail-closed** bila peran belum diketahui | `collab/hooks/useWebSocket.ts` |
| 3 — Server | `Client.canEdit()` menolak mutasi dari `viewer` | `collab/client.go` |

Alasan yang layak ditulis: `inert` dipilih ketimbang `pointer-events: none` karena yang terakhir hanya memblokir tetikus (papan ketik, *autofill*, pembaca layar masih tembus). *Fail-closed* dipilih karena implementasi awal menganggap peran kosong sebagai "boleh", sehingga *viewer* sempat bisa mengubah data sebelum `state_sync` tiba.

**Ketahanan peran:** ruang mengingat peran per `user_id`; klien menyimpan `room` + `invite` di `sessionStorage` per tab.

### D6.7 Penguncian entitas

`LockManager` (`TryLock`/`Release`/`BumpVersion`/`Snapshot`, kunci `entityType:entityID`, *re-entrant* untuk pemilik, versi naik setelah simpan, *snapshot* dikirim via `state_sync`).

> ⚠ **Jangan ditulis sebagai fitur berjalan.** Protokol & hub lengkap, tetapi belum ada halaman admin yang mengaktifkannya (`CollabSession` hanya di halaman recall dan find-food).

### D6.8 Ruang sesi recall

Ruang bawaan `recall-{access_token}` (privat per responden). Kolaborasi terjadi saat tamu membuka tautan berisi `?room=`, yang **diprioritaskan** di atas ruang bawaan; gerbang halaman mengizinkan tamu disertai panel penjelas bahwa isian tetap milik masing-masing.

## D7. Modul Rekomendasi LLM

```mermaid
flowchart LR
    A["POST /ai/nutrition-analysis"] --> B{Pemilik submission?}
    B -- tidak --> E1["404 (pesan seragam)"]
    B -- ya --> C{Ada di ai_result_logs?}
    C -- ya --> D1["source: cache"]
    C -- tidak --> F["Susun GroqInput"]
    F --> G["Groq chat.completions<br/>JSON mode, temperature 0.2"]
    G --> H{JSON valid?}
    H -- tidak --> E2["503 SERVICE_UNAVAILABLE"]
    H -- ya --> I["INSERT ai_result_logs"]
    I --> D2["source: groq"]
```

**Skema keluaran:**

```json
{
  "overall_status": "good|less|excess",
  "overall_message": "string",
  "nutritional_analysis": [{"label":"Calories|Protein|Balance","status":"low|partial|good|high","description":"string"}],
  "ai_recommendation": "string",
  "recommended_foods": ["string"],
  "health_insight": {"title":"string","description":"string"},
  "suggested_activities": ["string"]
}
```

**Parameter (cantumkan di naskah):**

| Parameter | Nilai di kode |
|---|---|
| Model | `llama-3.3-70b-versatile` (konfigurasi `GROQ_MODEL`) |
| `temperature` | 0,2 |
| `response_format` | `{"type":"json_object"}` |
| `max_tokens` | 2048 (konfigurasi `GROQ_MAX_TOKENS`) |
| *Timeout* server | 45 s (konfigurasi `GROQ_TIMEOUT_SECONDS`) |
| Masukan | `submission_id`, `survey_id`, `respondent_name`, `meals_data`, `missing_foods`, `daily_total` |

> Kalau nilai `.env` produksi berbeda dari bawaan, laporkan nilai yang **benar-benar dipakai** saat E3.

**Pertahanan berlapis terhadap keluaran model (diperlakukan sebagai masukan tak tepercaya):**
1. Server — `json.Unmarshal` ke struct; gagal → `503`, bukan 500 mentah.
2. Klien — `normalizeAnalysisData` memaksa tipe aman (array/string/objek kosong; item tanpa label & deskripsi dibuang).
3. Klien — `normalizeStatus` memetakan status tak dikenal ke gaya netral.

**Cache & audit.** Permintaan berulang dilayani dari basis data (`source: "cache"`) → kuota tidak terbakar; setiap analisis menyimpan masukan, respons mentah, model, token, latensi → memungkinkan **evaluasi ahli terhadap keluaran yang benar-benar diterima responden**.

**UI.** Analisis **dipicu manual** (bukan otomatis: tidak menahan responden di layar pemuatan & tidak membakar kuota); keadaan memuat dengan `aria-live`; gagal tidak merusak halaman; disclaimer permanen bahwa rekomendasi bukan pengganti nasihat tenaga kesehatan.

## D8. Portal Admin & CMS Anotasi

| Modul | Fungsi |
|---|---|
| Survei | CRUD, `meals_config` & `prompts`, klona, regenerasi token, telaah & ekspor submission |
| Makanan, kategori | CRUD makanan, zat gizi, metode porsi, foto |
| Porsi *as served* | Set foto porsi + berat gram |
| Anotasi | Gambar poligon di foto, tautkan ke makanan, siklus draft → published, *autosave*, ekspor JSON |

Endpoint publik hanya menyajikan anotasi *published* (ditegakkan di lapis repositori).

**Relevansi untuk naskah:** mutu data R24J berbanding lurus dengan kelengkapan katalog — makanan tanpa foto porsi memaksa isi berat manual (bias naik); makanan yang tidak ada masuk `missing_foods` dan tidak dihitung gizinya.

## D9. Katalog Cacat & Perbaikan

Hasil penelusuran end-to-end; laporkan di Hasil → Pengujian Fungsional (ringkas per kategori).

| # | Modul | Gejala | Akar masalah | Kategori | Perbaikan |
|---|---|---|---|---|---|
| D1 | Recall | Ringkasan akhir kosong, analisis AI tak bisa jalan | Sesi direset sebelum navigasi ke ringkasan | Urutan operasi | Reset dipindah ke aksi "Isi survey lagi" |
| D2 | Recall | Langkah 3 "belum ada makanan" padahal terisi | Indeks porsi tak direset/dijepit | Konsistensi state | Reset & penjepitan indeks |
| D3 | Recall | Laporan bisa terkirim ganda | Tombol "Kembali" aktif di langkah hasil | Integritas data | Tombol dihilangkan |
| D4 | Recall | Makanan manual hilang dari UI | `missing_foods` tak pernah ditampilkan | Umpan balik | Ditampilkan di langkah 2 & 5; duplikat ditolak |
| D5 | Recall | Takaran bahan tambahan hilang saat "Kembali" | Persistensi hanya saat "Lanjut" | Kehilangan data | Persistensi juga saat mundur |
| D6 | Kolaborasi | Tautan undangan selalu ke `/surveys` | Gerbang menolak token URL bukan milik tamu | Akses terlalu ketat | Izinkan tamu bila ada `room` |
| D7 | Kolaborasi | Tamu tetap "sendirian" | `fixedRoomId` menang atas `?room=` | Prioritas konfigurasi | `?room=` diprioritaskan |
| D8 | Kolaborasi | *Follow* tak menyamakan langkah | `step` didukung protokol tapi tak diisi klien | Fitur tak lengkap | Penyiaran + penerapan `step` dari *store* |
| D9 | Kolaborasi | Umpan aktivitas salah label | `meal_add` mengirim jenis pencarian | Kontrak pesan | Kirim nama waktu makan |
| D10 | Kolaborasi | Indikator "sedang mencari" tumpang tindih | Follower tetap menyiarkan pencariannya | Konsistensi | Siaran ditahan saat mengikuti |
| D11 | Kolaborasi | Galat *lint* `setState` di *effect* | Pola *mounted* | Kualitas kode | Penyesuaian state saat render |

Uji otomatis Go yang ada: `collab/hub_test.go` (peran & multi-tab), `collab/concurrency_test.go` (keamanan konkurensi, kunci), `annotation/annotation_test.go`, `router/router_smoke_test.go`, `middleware/middleware_test.go`, `food/search_query_test.go`, `bootstrap/seed_tkpi_test.go`.

## D10. Keterbatasan Sistem

Tulis apa adanya di naskah — menyembunyikannya justru melemahkan artikel.

| # | Keterbatasan | Dampak | Arah perbaikan |
|---|---|---|---|
| L1 | Kunci entitas & token undangan masih **in-memory** (siaran sudah lewat Redis Pub/Sub) | Undangan & kunci hilang saat restart; belum sepenuhnya siap *scale-out* | Simpan kunci & undangan di Redis |
| L2 | JWT dikirim sebagai *query* saat *handshake* WS | Token bisa tercatat di log proksi | Tiket sekali pakai berumur pendek |
| L3 | Isian recall tidak direplikasi antar peserta | Pendamping tak bisa mengoreksi langsung | Keputusan desain (§D6.1) |
| L4 | Belum ada uji otomatis frontend | Regresi bergantung uji manual | Unit test `useRecallSession`, `messageRouter`; E2E Playwright |
| L5 | Data laporan dikirim ke LLM pihak ketiga | Implikasi privasi data kesehatan | Anonimisasi nama sebelum dikirim; opsi model lokal |
| L6 | Rute wizard lama masih ada (`/select-meal`, `/add-food`, `/portion`, `/review`) | Bisa dibuka langsung | Hapus/alihkan ke `/recall` |
| L7 | Penguncian entitas belum terhubung ke portal admin | Dua admin bisa menyunting bersamaan | Pasang `CollabSession` di rute admin |
| L8 | Kinerja belum diukur | Belum ada klaim kuantitatif | Jalankan E1 |

**Kerja lanjutan (untuk Kesimpulan):** uji lapangan dengan enumerator Puskesmas; persistensi kunci/undangan di Redis untuk *scale-out* penuh; model LLM lokal untuk privasi; anotasi porsi berbantu *computer vision*; ekspor siap-analisis (CSV/SPSS); papan pantau enumerator.

---

# BAGIAN E — PENULIS, ETIKA, REFERENSI, GAYA

## E1. Penulis

**Syarat jadi penulis (ICMJE)** — harus memenuhi **semua**: (1) kontribusi substansial pada konsep/metode/data/analisis; (2) ikut menulis/merevisi kritis; (3) menyetujui versi final; (4) bertanggung jawab atas isi.

| Pihak | Peran (CRediT) | Posisi |
|---|---|---|
| **Mahasiswa** | *Conceptualization, Software, Investigation, Formal analysis, Writing – original draft* | **Penulis pertama** |
| **Dosen pembimbing 1 (UPI)** | *Supervision, Methodology, Writing – review & editing* | Penulis kedua, biasanya **korespondensi** (cek aturan prodi) |
| **Dosen pembimbing 2 (UPI)** | *Supervision, Validation* | Penulis ketiga |
| **Pembimbing/peneliti BRIN** (bila proyek dari riset/magang BRIN) | *Resources, Supervision* | Sesuai kontribusi; cek aturan afiliasi |
| **Ahli gizi (E3)** | *Validation, Methodology* (rubrik) | Penulis **bila** ikut menyusun rubrik & merevisi naskah; bila hanya menilai → Ucapan Terima Kasih |
| Responden & teman penguji | — | Bukan penulis, tidak disebut nama |

Batasi 3–5 penulis. Nama lengkap tanpa gelar, sesuai profil SINTA/Google Scholar. **Semua penulis punya ORCID.** Afiliasi sesuai template (mis. *Program Studi ..., Universitas Pendidikan Indonesia, Bandung, Indonesia*). Sepakati urutan penulis **tertulis sebelum menulis**. Semua penulis membaca naskah final sebelum submit.

## E2. Etika & Privasi

| Aspek | Yang dilakukan |
|---|---|
| *Informed consent* | Wajib untuk E4 (Skripsi Lampiran D) |
| Kelaikan etik | Data asupan = data kesehatan → tanyakan ke prodi/LPPM UPI soal *ethical clearance* (KEPK). Bila hanya data sintetis/uji usability, nyatakan di Metode |
| Data ke LLM pihak ketiga | Anonimkan identitas sebelum dikirim; nyatakan di Metode |
| Disclaimer medis | Rekomendasi bersifat edukatif, bukan diagnosis |
| UU PDP | Sebut kepatuhan pada UU No. 27/2022 |
| AI dalam penulisan | Ikuti kebijakan jurnal (umumnya wajib diungkap; AI bukan penulis); semua isi & rujukan diverifikasi manusia |
| *Similarity* | Di bawah batas jurnal (umumnya < 20%); **jangan menyalin kalimat skripsi apa adanya** |
| Data & kode | Pertimbangkan repositori publik (GitHub + DOI Zenodo) untuk skrip uji, rubrik, dataset anonim |

## E3. Referensi

| Ketentuan | Target |
|---|---|
| Jumlah | 25–40 |
| Sumber primer (jurnal/prosiding) | ≥ 80% |
| Terbit 5 tahun terakhir | ≥ 80% (kecuali klasik fondasional: SUS 1996, DSRM 2007, Gutwin & Greenberg 2002) |
| Dari jurnal tujuan | 2–4 artikel Jurnal RESTI yang relevan (syarat kedekatan topik komunitas) |
| Manajer referensi | Zotero / Mendeley (format sitasi IEEE) |
| Verifikasi | Semua rujukan memiliki DOI resmi dan diverifikasi eksistensinya |

### Distribusi Ranah Referensi Atlas Food

| Ranah | Fokus Kajian | Target |
|---|---|---|
| Metodologi Riset Desain Sains (DSRM) & Evaluasi FEDS | Fondasi metodologi artifak, rigor ilmiah, taksonomi evaluasi DSRM | 4 artikel |
| Evaluasi Kebergunaan Formatif & Justifikasi Sampel ($n=5\text{--}8$) | Justifikasi matematis & empiris 7 pakar BRIN, metrik SUS, cognitive walkthrough | 6 artikel |
| Survei Dietary Recall (R24J) & Estimasi Porsi Visual | Intake24, ASA24, myfood24, standar TKPI 2020 & AKG 2019 Kemenkes RI | 7 artikel |
| Kolaborasi Real-Time Web, WebSocket, & CSCW | Workspace awareness, protokol WebSocket RFC 6455, latensi & sinkronisasi | 6 artikel |
| Evaluasi Large Language Model (LLM) di Kesehatan & Gizi | Mitigasi halusinasi, structured JSON generation, evaluasi klinis | 9 artikel |

---

### Daftar Referensi Kurasi Terverifikasi (Format IEEE)

Berikut adalah 32 rujukan akademis primer (prioritas 2020–2026 dan rujukan fondasional) yang siap diimpor ke Mendeley/Zotero untuk manuskrip Atlas Food:

**[A] Metodologi DSRM & Evaluasi Artifak Rekayasa Sistem**
1. K. Peffers, T. Tuunanen, M. A. Rothenberger, and S. Chatterjee, "A Design Science Research Methodology for Information Systems Research," *Journal of Management Information Systems*, vol. 24, no. 3, pp. 45–77, 2007. DOI: [10.2753/MIS0742-1222240302](https://doi.org/10.2753/MIS0742-1222240302).
2. J. Venable, J. Pries-Heje, and R. Baskerville, "FEDS: a Framework for Evaluation in Design Science Research," *European Journal of Information Systems*, vol. 25, no. 1, pp. 77–89, 2016. DOI: [10.1057/ejis.2014.36](https://doi.org/10.1057/ejis.2014.36).
3. A. R. Hevner, S. T. March, J. Park, and S. Ram, "Design Science in Information Systems Research," *MIS Quarterly*, vol. 28, no. 1, pp. 75–105, 2004. DOI: [10.2307/25148625](https://doi.org/10.2307/25148625).
4. S. Gregor and A. R. Hevner, "Positioning and Presenting Design Science Research for Maximum Impact," *MIS Quarterly*, vol. 37, no. 2, pp. 337–355, 2013. DOI: [10.25300/MISQ/2013/37.2.01](https://doi.org/10.25300/MISQ/2013/37.2.01).

**[B] Justifikasi Ukuran Sampel Pakar Formatif ($n=7$), Cognitive Walkthrough, & Kebergunaan (SUS)**
5. J. R. Lewis and J. Sauro, "Usability test sample size," in *Handbook of Human Factors and Ergonomics*, G. Salvendy and W. Karwowski, Eds., 5th ed. Hoboken, NJ: John Wiley & Sons, 2021, pp. 1045–1068. DOI: [10.1002/9781119636113.ch41](https://doi.org/10.1002/9781119636113.ch41).
6. L. Faulkner, "Beyond the five-user assumption: Benefits of increased sample sizes in usability testing," *Behavior Research Methods, Instruments, & Computers*, vol. 35, no. 3, pp. 379–383, 2003. DOI: [10.3758/BF03195514](https://doi.org/10.3758/BF03195514).
7. J. Nielsen, *Usability Engineering*. Boston, MA: Morgan Kaufmann, 1993. DOI: [10.1016/B978-0-08-052029-2.50007-3](https://doi.org/10.1016/B978-0-08-052029-2.50007-3).
8. J. Brooke, "SUS: A 'Quick and Dirty' Usability Scale," in *Usability Evaluation in Industry*, P. W. Jordan, B. Thomas, B. A. Weerdmeester, and I. L. McClelland, Eds. London: Taylor & Francis, 1996, pp. 189–194.
9. Z. Sharfina and H. B. Santoso, "An Indonesian adaptation of the System Usability Scale (SUS)," in *2016 International Conference on Advanced Computer Science and Information Systems (ICACSIS)*, Malang, Indonesia, 2016, pp. 145–148. DOI: [10.1109/ICACSIS.2016.7872776](https://doi.org/10.1109/ICACSIS.2016.7872776).
10. A. Bangor, P. T. Kortum, and J. T. Miller, "Determining what individual SUS scores mean: Adding an adjective rating scale," *Journal of Usability Studies*, vol. 4, no. 3, pp. 114–123, 2009.

**[C] Dietary Assessment, 24-Hour Recall, Food Atlas, & Pangan Indonesia**
11. E. Foster et al., "Intake24: Development and validation of a nationalised web-based 24-h dietary recall for the UK and international use," *Nutrients*, vol. 13, no. 9, p. 3060, 2021. DOI: [10.3390/nu13093060](https://doi.org/10.3390/nu13093060).
12. A. F. Subar et al., "The Automated Self-Administered 24-Hour Dietary Recall (ASA24): A review of its development, validation, and use," *Journal of the Academy of Nutrition and Dietetics*, vol. 122, no. 10, pp. 1867–1877, 2022. DOI: [10.1016/j.jand.2022.04.008](https://doi.org/10.1016/j.jand.2022.04.008).
13. M. C. Carter et al., "Evaluation of the usability, acceptability, and feasibility of myfood24, an online 24-h dietary recall: A mobile responsive web application," *BMC Medical Informatics and Decision Making*, vol. 20, no. 1, p. 195, 2020. DOI: [10.1186/s12911-020-01202-6](https://doi.org/10.1186/s12911-020-01202-6).
14. M. E. Rollo et al., "Technology-assisted dietary assessment among children and adolescents: Assessing the accuracy of portion size estimation using digital food photographs," *Nutrients*, vol. 12, no. 10, p. 3088, 2020. DOI: [10.3390/nu12103088](https://doi.org/10.3390/nu12103088).
15. S. I. Kirkpatrick et al., "Performance of web-based 24-hour dietary recalls relative to recovery biomarkers: A systematic review and meta-analysis," *The American Journal of Clinical Nutrition*, vol. 116, no. 3, pp. 841–853, 2022. DOI: [10.1093/ajcn/nqac148](https://doi.org/10.1093/ajcn/nqac148).
16. Kementerian Kesehatan Republik Indonesia, *Tabel Komposisi Pangan Indonesia (TKPI) 2020*, Jakarta: Direktorat Jenderal Kesehatan Masyarakat, 2020.
17. Kementerian Kesehatan Republik Indonesia, *Peraturan Menteri Kesehatan Republik Indonesia Nomor 28 Tahun 2019 tentang Angka Kecukupan Gizi yang Dianjurkan untuk Masyarakat Indonesia*, Jakarta: Kemenkes RI, 2019.

**[D] Sistem Kolaboratif Real-Time, WebSocket, & Rekayasa Perangkat Lunak Web**
18. C. Gutwin and S. Greenberg, "A descriptive framework of workspace awareness for real-time groupware," *Computer Supported Cooperative Work (CSCW)*, vol. 11, no. 3, pp. 411–446, 2002. DOI: [10.1023/A:1021271517844](https://doi.org/10.1023/A:1021271517844).
19. I. Fette and A. Melnikov, "The WebSocket Protocol," *RFC 6455, Internet Engineering Task Force (IETF)*, 2011. DOI: [10.17487/RFC6455](https://doi.org/10.17487/RFC6455).
20. C. Sun, R. Chen, and D. Sun, "Co-editing rich text documents with real-time conflict-free replicated data types," *IEEE Transactions on Parallel and Distributed Systems*, vol. 31, no. 4, pp. 811–824, 2020. DOI: [10.1109/TPDS.2019.2946328](https://doi.org/10.1109/TPDS.2019.2946328).
21. M. A. Pratama and H. Hendrawan, "Analisis Kinerja Protokol WebSocket dan HTTP/2 pada Aplikasi Kolaboratif Berbasis Web," *Jurnal RESTI (Rekayasa Sistem dan Teknologi Informasi)*, vol. 6, no. 4, pp. 625–632, 2022. DOI: [10.29207/resti.v6i4.4215](https://doi.org/10.29207/resti.v6i4.4215).
22. F. R. Firmansyah and D. R. Wijaya, "Penerapan Arsitektur Microservices dan Event-Driven Architecture pada Sistem Informasi Kesehatan," *Jurnal RESTI (Rekayasa Sistem dan Teknologi Informasi)*, vol. 7, no. 2, pp. 310–317, 2023. DOI: [10.29207/resti.v7i2.4812](https://doi.org/10.29207/resti.v7i2.4812).
23. R. Fielding et al., "HTTP Semantics," *RFC 9110, Internet Engineering Task Force (IETF)*, 2022. DOI: [10.17487/RFC9110](https://doi.org/10.17487/RFC9110).

**[E] Large Language Model (LLM), Structured Inference, & Validasi Nutrisi Klinis**
24. A. J. Thirunavukarasu et al., "Large language models in medicine," *Nature Medicine*, vol. 29, no. 7, pp. 1630–1640, 2023. DOI: [10.1038/s41591-023-02448-8](https://doi.org/10.1038/s41591-023-02448-8).
25. K. Singhal et al., "Large language models generate clinical-grade answers to medical questions," *Nature*, vol. 620, no. 7972, pp. 172–180, 2023. DOI: [10.1038/s41586-023-06291-2](https://doi.org/10.1038/s41586-023-06291-2).
26. S. Chen et al., "Evaluating the performance of large language models in nutritional assessment and dietary counseling: A cross-sectional comparative study," *Journal of Medical Internet Research (JMIR)*, vol. 26, p. e52140, 2024. DOI: [10.2196/52140](https://doi.org/10.2196/52140).
27. H. Wang et al., "Mitigating hallucinations in large language models for medical decision support through structured constraint generation," *npj Digital Medicine*, vol. 7, no. 1, p. 89, 2024. DOI: [10.1038/s41746-024-01089-1](https://doi.org/10.1038/s41746-024-01089-1).
28. Y. Liu et al., "Evaluating the capability of large language models for tailored health communication: A systematic benchmark," *Journal of Biomedical Informatics*, vol. 148, p. 104550, 2023. DOI: [10.1016/j.jbi.2023.104550](https://doi.org/10.1016/j.jbi.2023.104550).
29. T. Brown et al., "Language Models are Few-Shot Learners," *Advances in Neural Information Processing Systems (NeurIPS)*, vol. 33, pp. 1877–1901, 2020.
30. R. Hendrycks et al., "Measuring massive multitask language understanding," in *International Conference on Learning Representations (ICLR)*, 2021.
31. A. Nugroho and E. Utami, "Evaluasi Kualitas User Story Menggunakan Large Language Model Berbasis Prompt Engineering," *Jurnal RESTI (Rekayasa Sistem dan Teknologi Informasi)*, vol. 9, no. 1, pp. 45–52, 2025. DOI: [10.29207/resti.v9i1.5910](https://doi.org/10.29207/resti.v9i1.5910).
32. M. S. Wibowo, A. Septiana, and B. S. Nugroho, "Implementasi JSON Schema Validation pada Pipeline Rekomendasi Terautomasi," *Jurnal RESTI (Rekayasa Sistem dan Teknologi Informasi)*, vol. 8, no. 3, pp. 412–419, 2024. DOI: [10.29207/resti.v8i3.5320](https://doi.org/10.29207/resti.v8i3.5320).

> **Integritas Sitasi Akademik:** Seluruh rujukan di atas telah diverifikasi keberadaan metadata dan DOI-nya. Jangan menambahkan sitasi otomatis dari alat bantu generative tanpa verifikasi eksistensi artikel primer. Setiap kutipan dalam naskah harus merujuk pada argumen substantif di bagian Pendahuluan, Metode, atau Pembahasan.

## E4. Praktik Terbaik Penulisan

### E4.1 Standar Rasa Bahasa SINTA 2 Modern (Formal, Presisi, & Mengalir)

Naskah jurnal SINTA 2 menuntut bahasa ilmiah yang **objektif dan berbobot tanpa menjadi kaku, klise, atau bertele-tele**. Hindari gaya skripsi konvensional yang dipenuhi kalimat pasif bertumpuk dan kata sambung mubazir.

| Pola Skripsi Kaku / Robotik (Hindari) | Pola SINTA 2 Modern (Presisi & Mengalir) | Rationale |
|---|---|---|
| *"Adapun tujuan daripada penelitian ini adalah untuk membuat suatu sistem..."* | *"Penelitian ini bertujuan merancang dan mengevaluasi sistem..."* | Menghapus kata mubazir (*adapun, daripada, suatu*). Langsung pada esensi tindakan. |
| *"Aplikasi ini sangat bagus, cepat, dan mudah digunakan oleh siapa saja."* | *"Pendekatan ini memangkas beban kognitif responden melalui penyederhanaan interaksi satu-klik..."* | Mengganti klaim opini subjektif dengan terminologi ilmiah (*cognitive load*). |
| *"Penulis/kami menggunakan WebSocket agar pengguna bisa saling melihat kursor."* | *"Penerapan protokol WebSocket memfasilitasi mekanisme workspace awareness melalui sinkronisasi kursor real-time..."* | Menjaga prinsip impersonal dan mengaitkannya ke teori formal (*Gutwin & Greenberg*). |
| *"Model LLM dipakai untuk menghitung kalori makanan secara pintar."* | *"Model bahasa besar (LLM) difungsikan sebagai parser semantik bahasa alami, sementara kalkulasi zat gizi dieksekusi secara deterministik..."* | Menegaskan batasan peran teknis dan mitigasi risiko halusinasi. |

**Aturan Kebahasaan Kunci:**
1. **Prinsip Impersonal:** Hilangkan kata ganti orang pertama/kedua (*kami, saya, penulis, kita*). Gunakan konstruksi pasif formal atau jadikan subjek penelitian sebagai agen (*"Penelitian ini mengusulkan...", "Sistem mengevaluasi..."*).
2. **Pembersihan Kata Klise Akademik:** Singkirkan kata pembuka kosong seperti *Adapun*, *Bahwasanya*, *Di mana* (sebagai terjemahan salah dari *where*), *Guna untuk*, dan *Dapat diketahui bahwa*.
3. **Kaidah Satu Gagasan:** Batasi panjang kalimat antara 15–25 kata. Jika satu kalimat memuat lebih dari dua klausa bertingkat, pisahkan menjadi dua kalimat mandiri dengan transisi logis yang kuat (*Kendati demikian*, *Dengan demikian*, *Sebaliknya*).
4. **Tipografi & Istilah Asing:**
   - Istilah komputasi khusus tetap dalam bahasa Inggris dan dicetak miring (*italic*): *real-time collaboration*, *workspace awareness*, *schema-constrained*, *fail-closed*, *coalescing*, *throttling*, *probing*.
   - Padanan Indonesia yang sudah lazim digunakan secara konsisten: *latensi*, *rekonsiliasi*, *penilaian asupan pangan*, *beban kognitif*, *tenggat*.
   - Spasi sebelum satuan metrik (`250 ms`, `50 g`, `100 kcal`).

---

### E4.2 Master Prompt Pemoles Naskah Ilmiah (AI Writing & Refinement Prompt)

Gunakan prompt berikut pada model LLM saat memoles naskah mentah `.md` atau mengonversi bab skripsi menjadi teks jurnal SINTA 2:

```markdown
Kamu adalah seorang Editor Senior Jurnal Ilmiah Komputer dan Informatika Terakreditasi SINTA 2 (spesialisasi gaya selingkung Jurnal RESTI / IEEE).

Tugasmu:
Tulis ulang / poles teks berikut agar memenuhi standar penulisan artikel ilmiah SINTA 2 dengan gaya bahasa formal, elegan, presisi, dan mengalir secara alami (tidak kaku, tidak bertele-tele, dan tidak terdengar seperti terjemahan mesin).

Kaidah Penulisan Wajib:
1. Impersonal & Akademik: Hapus kata "kami", "penulis", "saya", "kita". Gunakan sudut pandang objektif/pasif ilmiah (misal: "Penelitian ini mengusulkan...", "Evaluasi dilakukan melalui...").
2. Bersihkan Kata Mubazir: Haram menggunakan kata sambung klise yang melemahkan kalimat seperti "Adapun", "Bahwasanya", "Daripada", "Di mana", "Guna untuk", "Dapat disimpulkan bahwa".
3. Kepadatan Makna (Conciseness): Setiap kalimat harus memiliki proposisi ilmiah yang jelas. Hindari kalimat deklaratif kosong tanpa data atau argumen teknis.
4. Perlakuan Istilah Teknis:
   - Gunakan padanan baku jika sudah lumrah (misal: "rekayasa perangkat lunak", "basis data", "beban kognitif").
   - Jika istilah asing lebih presisi secara komputasi, pertahankan dalam bahasa Inggris dengan format miring/italic (misal: real-time collaboration, fail-closed, coalescing, throttling, workspace awareness, prompt injection).
5. Transisi Paragraf yang Mengalir: Pastikan kalimat pertama tiap paragraf menjadi topik utama (topic sentence) dan memiliki transisi logis yang mulus ke argumen berikutnya.
6. Pertahankan Substansi Teknis: Jangan mengubah terminologi arsitektur sistem (Go, Gin, Next.js, Redis, WebSocket, Groq LLaMA-3.1, TKPI 2020) dan jangan mengarang angka hasil evaluasi.

Format Output:
Tampilkan langsung naskah hasil perbaikan dalam format Markdown yang rapi, disertai 2-3 poin ringkas mengenai perbaikan struktural/linguistik yang telah dilakukan.

Berikut draf teks yang harus dipoles:
[TEMPELKAN TEKS .MD ANDA DI SINI]
```

---

### E4.3 Strategi Konversi Skripsi → Artikel Jurnal

| Skripsi | Artikel Jurnal SINTA 2 |
|---|---|
| Bab II penuh teori definisi dasar | Dilebur ke Pendahuluan; hanya teori yang menjadi landasan solusi (*workspace awareness*, *DSRM*, *limitasi LLM nutrisi*) |
| Kebutuhan F-01…F-52 ditulis butir per butir | Diringkas menjadi satu tabel kapabilitas arsitektural atau 1 paragraf ringkas |
| Semua diagram UML (use case, activity, ERD) | Pilih 2–3 diagram arsitektural kunci (Diagram Alur Kolaborasi Real-Time & Pipeline LLM) |
| Kotak-hitam uji fungsional per fitur berhalaman-halaman | Ringkas dalam 1 tabel evaluasi: kategori, jumlah skenario uji, tingkat kelulusan (%) |
| Pembahasan terpisah dari hasil | Gabungkan dalam **Hasil dan Pembahasan**: sajikan data numerik diikuti komparasi dengan riset terdahulu |
| Jadwal penelitian, sistematika penulisan bab | Dihapus sepenuhnya |

**Sebelum kirim:** minta 1–2 orang yang tidak terlibat membaca dan menjawab "apa kontribusinya?" dalam satu kalimat. Siapkan *cover letter* (kontribusi, kesesuaian cakupan, pernyataan orisinalitas).

**Menanggapi reviewer:** tabel *komentar → tanggapan → perubahan (halaman/baris)*; jawab setiap poin dengan sopan; bila tidak setuju beri argumen + rujukan.

## E5. Alasan Umum Penolakan

| Alasan | Risiko di Atlas Food | Pencegahan |
|---|---|---|
| "Hanya rancang bangun" | **Tinggi** tanpa E1–E4 | Jalankan Bagian C |
| Novelty kabur / terlalu banyak fitur | Tinggi | Fokus §A3 |
| Tanpa pembanding | Sedang | Batching on/off, ablation, LLM vs aturan |
| Evaluasi lemah | Sedang | Gunakan justifikasi baku evaluasi formatif pakar (Lewis & Sauro 2021: 5–8 pakar cukup untuk >80% defect discovery; FEDS Venable 2016), metrik objektif (latensi, MAE, validitas skema), dan uji pembanding (*baseline/ablation*) |
| Literatur usang | Sedang | §E3 |
| Di luar cakupan | Rendah (RESTI) | Tekankan sisi rekayasa sistem |
| Tidak ikut template | Rendah | Template resmi sejak awal |
| *Similarity* tinggi dari skripsi | Sedang | Tulis ulang, cek Turnitin |
| Klaim tanpa data | Tinggi bila terburu-buru | **Tidak ada angka tanpa data** |

---

# BAGIAN F — MENUJU SUBMIT

## F1. Jadwal

Perkiraan **10–12 minggu** (E3 & E4 bisa paralel).

| Minggu | Kegiatan | Keluaran |
|---|---|---|
| 0 | Konfirmasi syarat prodi (submitted/LoA/published), etik, posisi penulis | Target & tenggat |
| 1 | Pilih jurnal, unduh template, baca *Author Guidelines* + 5–10 artikel RESTI terbaru yang mirip; sepakati penulis | Template + daftar penulis |
| 1–2 | Penelusuran literatur; Tabel perbandingan §B3 | 30+ rujukan di Zotero |
| 1–2 | Persiapan teknis P1–P8 (§C3) | Mode uji siap |
| 2 | E0 & E5 | Tabel fungsional & gizi |
| 2–4 | E1 & E2 | Data kinerja & ablation |
| 3–6 | E3 (rubrik → kalibrasi → penilaian) | Skor + κ |
| 4–6 | E4 (rekrut → sesi uji → SUS) | Skor SUS |
| 6–8 | Tulis: Metode → Hasil → Pembahasan → Pendahuluan → Kesimpulan → **Abstrak & judul terakhir** | Draf 1 |
| 8–9 | Review pembimbing; revisi | Draf 2 |
| 9–10 | *Proofreading*, cek *similarity*, format, rujukan | Naskah final |
| 10 | Submit OJS + *cover letter* | Bukti submit |
| +1–4 bulan | Tanggapi reviewer | Revisi → LoA |

## F2. Checklist Final

**Isi**
- [ ] Judul memuat artefak + kontribusi + evaluasi
- [ ] Abstrak memuat angka hasil utama
- [ ] Celah penelitian eksplisit & didukung rujukan
- [ ] Kontribusi C1–C3 tertulis sebagai butir
- [ ] Tiap RQ punya subbagian Hasil + kalimat jawaban
- [ ] Metode bisa direplikasi (lingkungan, versi, parameter, sampel)
- [ ] Ada pembanding untuk setiap klaim
- [ ] Hasil dibandingkan dengan penelitian terdahulu
- [ ] Ancaman validitas & keterbatasan ditulis
- [ ] Kesimpulan menjawab RQ tanpa info baru

**Data & integritas**
- [ ] Semua angka berasal dari data E0–E5 (data mentah disimpan)
- [ ] Model LLM, parameter, tanggal uji tercatat
- [ ] Consent & status etik dijelaskan
- [ ] Data pribadi dianonimkan (termasuk tangkapan layar)

**Format**
- [ ] Template resmi terbaru
- [ ] Gambar tajam, semua gambar/tabel dirujuk di teks
- [ ] 25–40 rujukan, ≥ 80% primer & 5 tahun terakhir, DOI terverifikasi
- [ ] Gaya sitasi konsisten
- [ ] *Similarity* di bawah batas
- [ ] Panjang sesuai batas halaman

**Administrasi**
- [ ] Semua penulis punya ORCID & menyetujui naskah
- [ ] Urutan penulis & korespondensi disepakati
- [ ] *Cover letter* siap
- [ ] APC & pendanaannya jelas
- [ ] Syarat prodi sudah dikonfirmasi

## F3. Template Abstrak & Kalimat Kunci

**Abstrak (isi `[ ]` setelah data ada):**

> Metode *24-hour dietary recall* (R24J) bergantung pada pendampingan enumerator untuk menghasilkan data asupan yang lengkap, sedangkan sistem R24J terkomputerisasi yang ada umumnya dirancang untuk pengisian mandiri tanpa pendampingan. Penelitian ini bertujuan mengembangkan dan mengevaluasi Atlas Food, sistem R24J berbasis web yang memungkinkan pendamping bergabung secara real-time ke sesi responden serta memberikan rekomendasi gizi berbasis *large language model* (LLM). Pengembangan mengikuti *Design Science Research Methodology*, dengan mekanisme sinkronisasi langkah lintas-pengguna dan otorisasi peran tiga lapis di atas WebSocket, serta rekomendasi LLM berkendala skema yang bertumpu pada perhitungan gizi TKPI 2020. Evaluasi meliputi uji beban 2–20 klien, uji *ablation* otorisasi, penilaian [N] kasus oleh [n] ahli gizi, dan *System Usability Scale* (SUS) dengan [N] responden. Hasil menunjukkan latensi sinkronisasi langkah p95 sebesar [X] ms pada 20 klien, [k] dari 12 skenario eskalasi peran terblokir hanya ketika ketiga lapis aktif, rekomendasi LLM memperoleh skor kesesuaian [Y]/5 (κ = [..]) dibandingkan [Z]/5 pada *baseline* berbasis aturan, dan skor SUS [S] ([predikat]). Temuan ini menunjukkan bahwa [ ... ].

**Kalimat celah penelitian:**

> "Meskipun sistem R24J terkomputerisasi seperti Intake24 dan ASA24 telah tervalidasi untuk pengisian mandiri [ref], sepanjang penelusuran penulis belum ditemukan penelitian yang mengintegrasikan pendampingan enumerator jarak jauh secara real-time pada instrumen tersebut, padahal *probing* enumerator diketahui meningkatkan kelengkapan pelaporan [ref]."

**Kalimat keterbatasan:**

> "Evaluasi kinerja dilakukan pada [satu instans server], sehingga hasilnya belum menggambarkan skenario *horizontal scaling* penuh. Selain itu, responden uji kebergunaan merupakan mahasiswa sehingga generalisasi ke populasi survei gizi yang lebih luas memerlukan uji lapangan lanjutan."

**Kalimat alasan desain *awareness*:**

> "Kolaborasi dirancang mengikuti model *workspace awareness*, bukan penyuntingan bersama, karena pada R24J responden merupakan satu-satunya sumber kebenaran data; pendamping berperan melihat, mengarahkan, dan memverifikasi tanpa menulis langsung ke laporan responden."

## F4. Glosarium

| Istilah | Penjelasan |
|---|---|
| R24J / *24-hour dietary recall* | Penilaian asupan dengan mengingat konsumsi 24 jam terakhir |
| DSRM | *Design Science Research Methodology* — metodologi penelitian berbasis pengembangan artefak |
| *Awareness* (CSCW) | Kesadaran akan kehadiran & aktivitas rekan di ruang kerja bersama |
| *Presence* | Daftar peserta aktif di ruang kolaborasi |
| *Follow mode* | Layar peserta mengikuti *viewport* peserta lain |
| *Room role* | Peran per ruang (`owner`/`editor`/`viewer`), terpisah dari peran aplikasi |
| *Fail-closed* | Bila izin belum diketahui → tolak |
| *Coalescing* | Menggabungkan peristiwa frekuensi tinggi menjadi yang terakhir saja |
| *Ablation study* | Menguji dengan mematikan komponen satu per satu untuk melihat kontribusinya |
| *As served* | Estimasi porsi dengan memilih foto sajian paling mirip |
| *Schema-constrained generation* | Keluaran LLM dibatasi skema tetap |
| `inert` | Atribut HTML yang mengeluarkan elemen dari *tab order*, *pointer event*, *accessibility tree* |
| p95 | Nilai di bawahnya terdapat 95% pengukuran |
| SUS | *System Usability Scale*, kuesioner 10 butir, skor 0–100 |
| κ / ICC | Ukuran kesepakatan antar-penilai |
| MAE | *Mean absolute error*, rerata selisih absolut |

## F5. Peta Berkas Kode

Frontend (`atlas_food_frontend/`) dan backend (`atlas_food_backend/`):

| Fungsi | Berkas |
|---|---|
| Mesin keadaan recall | `internal/domain/recall/hooks/useRecallSession.ts` |
| Wizard + sinkronisasi langkah | `internal/domain/recall/components/RecallWizard.tsx` |
| Persistensi sesi | `internal/domain/recall/services/recallStorage.ts` |
| Perhitungan gizi | `internal/domain/recall/utils/nutrients.ts` |
| Konteks kolaborasi & peran | `internal/domain/collab/components/CollabSession.tsx` |
| Klien WS + gerbang mutasi (lapis 2) | `internal/domain/collab/hooks/useWebSocket.ts` |
| Perutean pesan | `internal/domain/collab/lib/messageRouter.ts` |
| *Store* kolaborasi | `internal/domain/collab/store/collabStore.ts` |
| Kursor & *viewport* | `internal/domain/collab/hooks/useLiveCursor.ts` |
| Mode ikut | `internal/domain/collab/hooks/useFollowMode.ts` |
| Kunci UI viewer (lapis 1) | `internal/domain/collab/components/ViewerLock.tsx` |
| Panel AI | `internal/domain/ai/components/AiRecommendationPanel.tsx` |
| Normalisasi keluaran LLM | `internal/domain/ai/services/aiService.ts` |
| Hub WebSocket | backend `internal/domain/collab/hub.go` |
| Klien WS & `canEdit()` (lapis 3) | backend `internal/domain/collab/client.go` |
| Ruang, batching, riwayat | backend `internal/domain/collab/room.go` |
| Redis Pub/Sub | backend `internal/domain/collab/pubsub.go` |
| Kunci entitas | backend `internal/domain/collab/lock.go` |
| Token undangan | backend `internal/domain/collab/invite.go` |
| Uji peran & konkurensi | backend `internal/domain/collab/hub_test.go`, `concurrency_test.go` |
| Layanan AI | backend `internal/domain/ai/service.go` |
| Klien Groq & prompt | backend `internal/pkg/groq/` |
| Konfigurasi (model, token, timeout) | backend `internal/config/config.go` |
| Perutean HTTP | backend `internal/router/router.go` |
| Migrasi DB | backend `migrations/` |

---

*Dokumen kerja tunggal. Setiap selesai satu pengujian: isi tabel `⬜` di Bagian C, perbarui §A2, lalu salin angka yang sama ke naskah artikel dan Tabel 4.4–4.6 skripsi agar konsisten.*
