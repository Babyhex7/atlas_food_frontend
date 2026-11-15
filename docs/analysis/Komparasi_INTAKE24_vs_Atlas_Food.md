# Komparasi Sistem: INTAKE24 (Simpson et al., 2017) vs. Atlas Food

Dokumen ini membedah artikel jurnal acuan utama:
**"Iterative Development of an Online Dietary Recall Tool: INTAKE24"**  
*Penulis:* Emma Simpson, Jennifer Bradley, Ivan Poliakov, Dan Jackson, Patrick Olivier, Ashley J. Adamson, Emma Foster (Newcastle University).  
*Publikasi:* **Nutrients (MDPI), 2017, Vol. 9, No. 2, 118.** DOI: [10.3390/nu9020118](https://doi.org/10.3390/nu9020118).

Dokumen ini berfungsi sebagai:
1. **Analisis perbedaan (*research gap*)** untuk memperkuat Pendahuluan naskah SINTA 2 (Jurnal RESTI/sejenis).
2. **Cetak biru (*blueprint*) metodologi yang dapat ditiru** (khususnya teknik evaluasi UX, SUS, dan penyajian tahapan recall).

---

## 1. Ringkasan Esensi Paper INTAKE24

* **Tujuan Utama:** Mengembangkan perkakas *24-hour dietary recall* (R24J) daring berbasis web untuk survei nutrisi dan pangan skala nasional di Inggris, menyederhanakan proses dari prototipe desktop sebelumnya (SCRAN24).
* **Target Pengguna:** Usia 11–24 tahun (remaja dan dewasa muda).
* **Metode Pengembangan:** Desain iteratif 4 siklus (*four-stage iterative process*) dengan total $N = 80$ partisipan ($20$ orang per tahap).
* **Teknik Pengujian UX:**
  * *Think-Aloud Protocol* (peserta bernalar keras saat mengisi).
  * *Eye Tracking* (Tobii ×50) dan perekaman layar (*mouse tracking* via SnagIt) untuk mendeteksi keraguan navigasi.
  * *Semi-structured interview* setelah selesai recall.
  * *System Usability Scale* (SUS) standar 10 item.
* **Fitur Kunci yang Dihasilkan:**
  1. *Flat Interface:* Menyatukan panel navigasi daftar waktu makan di sebelah kiri dan panel *prompt* interaksi di sebelah kanan (memangkas waktu pengisian dari 22 menit menjadi 13 menit).
  2. *Associated Food Prompts:* Pengingat otomatis berbasis aturan (mis. makan roti ditanya mentega, makan tanpa minuman ditanya konfirmasi minum, peringatan defisit kalori $< 500\text{ kcal}$).
  3. *Food Wizards:* Wizard terstruktur khusus untuk makanan komposit (*Sandwich Wizard* dan *Salad Wizard*).
  4. *Portion Size Estimation:* Estimasi porsi berbasis foto (*as-served images* dan *guide images*) dari *Young Person’s Food Atlas* (YPFA).
* **Hasil Pengujian:**
  * Skor SUS naik signifikan dari tahap 1 ke tahap 4 hingga mencapai **83/100** (*Excellent*).
  * Validitas asupan dibandingkan wawancara ahli (*interviewer-led recall*) menunjukkan rasio mendekati $1{,}0$ di hampir semua zat gizi.

---

## 2. Matriks Komparasi: INTAKE24 vs. Atlas Food

Tabel ini dapat langsung diadaptasi menjadi tabel pembanding pustaka (*state-of-the-art*) di **Bab 1 (Pendahuluan)** naskah jurnal:

| Dimensi Rekayasa | INTAKE24 (Simpson et al., 2017) | Atlas Food (Sistem Kamu) | Signifikansi & Celah Riset (*Novelty*) |
|---|---|---|---|
| **Paradigma Penggunaan** | **Mandiri Penuh (*Self-Administered Only*)**<br>Pengguna mengisi sendiri dari tautan email; sistem bertindak sebagai pengganti pewawancara. | **Hibrida: Mandiri + Pendampingan Real-Time (*Collaborative*)**<br>Enumerator/ahli gizi dapat bergabung langsung ke ruang sesi responden secara jarak jauh. | **Celah Utama:** INTAKE24 tidak memungkinkan koreksi/asistensi langsung saat responden mengalami kebingungan kognitif di lapangan. |
| **Arsitektur Jaringan & Sesi** | **Request-Response HTTP Konvensional**<br>Satu arah klien-ke-server, sesi terisolasi per individu. | **Full-Duplex WebSocket + Redis Pub/Sub Hub**<br>Sinkronisasi state instrumen secara bilateral antar-klien dengan latensi rendah. | Kebaruan komputasi pada rekayasa komunikasi data terdistribusi dan *workspace awareness*. |
| **Sinkronisasi Wizard** | ❌ **Tidak ada**<br>Hanya perpindahan halaman lokal di browser responden. | ✅ **Sinkronisasi Langkah Lintas-Pengguna (`step`)**<br>State langkah wizard 6-tahap dipantau dan diselaraskan server secara real-time. | Mencegah desinkronisasi konteks antara enumerator jarak jauh dan responden. |
| **Model Keamanan & Otorisasi** | **Berbasis Peran Sederhana (*Role-Based*)**<br>Pemisahan kaku antara Portal Peneliti vs Akun Partisipan. | **Otorisasi 3 Lapis (*3-Layer Role Guard*)**<br>Ditegakkan di UI, Client Guard, dan Server Hub secara independen (*fail-closed*). | Mengatasi risiko *privilege escalation* saat enumerator mengamati sesi responden. |
| **Pemberian Prompt & Asistensi** | **Aturan Statis (*Hardcoded Rules*)**<br>Daftar aturan if-else (mis. "jika roti, tanyakan selai"). | **Hybrid: Aturan Deterministik + AI Generatif (LLM Groq)**<br>Pemrosesan bahasa alami untuk bahan manual (`missing_foods`) dan konsultasi pola gizi. | Fleksibilitas pemahaman bahasa alami yang tidak kaku terhadap sinonim makanan daerah. |
| **Umpan Balik Gizi Pengguna** | ❌ **Tidak ada untuk pengguna**<br>Hanya mengumpulkan data untuk diunduh peneliti (.csv). | ✅ **Rekomendasi Gizi Instan Berkendala Skema (*Schema-Constrained*)**<br>Pengguna langsung mendapat visualisasi makronutrien dan rekomendasi berbasis TKPI 2020. | Memberikan nilai edukatif langsung kepada responden pasca-pengisian. |
| **Basis Data Pangan & Porsi** | **UK Nutrients Databank & NDNS**<br>Katalog makanan Barat/Inggris (cider, scone, baked beans, dll). | **Tabel Komposisi Pangan Indonesia (TKPI 2020)**<br>Katalog pangan khas Indonesia dengan estimasi foto porsi beranotasi poligon. | Relevansi kontekstual lokal Indonesia untuk mengatasi bias survei gizi nasional. |

---

## 3. Aspek yang Harus DITIRU dari INTAKE24 untuk Naskah SINTA 2

Struktur metodologi Simpson et al. (2017) sangat kokoh dan diakui di jurnal Q1 MDPI. Hal-hal berikut **sangat layak ditiru polanya**:

### A. Pola Pelaporan Evaluasi Usability (SUS)
* **Cara INTAKE24:** Memetakan skor SUS menggunakan konversi baku Bangor et al. (2009) dan menyajikan uji signifikansi (Kruskal-Wallis) antar-iterasi pengembangan.
* **Tiruan untuk Atlas Food:**
  * Laporkan skor SUS responden vs enumerator secara terpisah.
  * Sertakan kategori adjektiva (mis. Skor $\ge 68$ = *Good*, $\ge 80$ = *Excellent*).
  * Sajikan dalam bentuk tabel distribusi per pernyataan SUS (1–10).

### B. Konsep "Associated Food Prompts" & "Missing Foods"
* **Cara INTAKE24:** Menjelaskan bahwa kelemahan R24J adalah makanan pelengkap yang sering terlupakan (saus, mentega, gula minuman). INTAKE24 membuat mekanisme *recipe builder* dan *missing food entry*.
* **Tiruan untuk Atlas Food:**
  * Di bab Metode (Subbab Alur Recall), jelaskan bagaimana Atlas Food menangani makanan terlewat via `missing_foods` dan perbaikan bug D4 (di mana item manual tetap dipertahankan dan diverifikasi gizi).

### C. Alasan Pemilihan "Flat Interface"
* **Cara INTAKE24:** Menjelaskan secara teoritis mengapa mereka berpindah dari antarmuka multi-halaman ke antarmuka 2-kolom (*Navigation Panel* di kiri dan *Prompt Panel* di kanan), yaitu memangkas beban kognitif dan durasi recall.
* **Tiruan untuk Atlas Food:**
  * Gunakan argumen serupa saat mendeskripsikan *Wizard 6-Langkah* dan *Live Collaboration Bar* di Atlas Food untuk membuktikan bahwa UI dirancang secara ergonomis.

---

## 4. Kalimat Penegasan Celah Riset (*Research Gap Statement*) Siap Pakai

Gunakan paragraf berikut di **Pendahuluan** artikel jurnal kamu untuk menyitir paper INTAKE24:

> *"Sistem dietary recall terkomputerisasi yang telah mapan secara global, seperti INTAKE24 yang dikembangkan oleh Simpson et al. [ref], berhasil menekan durasi survei dan meningkatkan kebergunaan melalui pendekatan antarmuka terintegrasi dan petunjuk otomatis (associated food prompts). Kendati demikian, sistem tersebut didesain murni untuk pengisian mandiri (self-administered) asinkron tanpa dukungan kolaborasi langsung. Ketika responden menghadapi ambiguitas penaksiran porsi atau lupa mengingat konsumsi rincinya, ketiadaan interaksi dua arah dengan enumerator berpotensi memicu bias pelaporan. Hingga saat ini, integrasi pendampingan enumerator jarak jauh secara real-time yang didukung sinkronisasi state instrumen lintas-pengguna dan otorisasi berlapis belum pernah dieksplorasi secara mendalam pada instrumen R24J berbasis web."*

---

## 5. Ringkasan Sitasi Akademik (BibTeX / IEEE)

**Format IEEE (untuk Jurnal RESTI):**
```text
[X] E. Simpson, J. Bradley, I. Poliakov, D. Jackson, P. Olivier, A. J. Adamson, and E. Foster, "Iterative Development of an Online Dietary Recall Tool: INTAKE24," Nutrients, vol. 9, no. 2, p. 118, Feb. 2017, doi: 10.3390/nu9020118.
```

**Format BibTeX:**
```bibtex
@article{simpson2017iterative,
  title={Iterative Development of an Online Dietary Recall Tool: INTAKE24},
  author={Simpson, Emma and Bradley, Jennifer and Poliakov, Ivan and Jackson, Dan and Olivier, Patrick and Adamson, Ashley J and Foster, Emma},
  journal={Nutrients},
  volume={9},
  number={2},
  pages={118},
  year={2017},
  publisher={Multidisciplinary Digital Publishing Institute},
  doi={10.3390/nu9020118}
}
```

