"use client";

import { Layers } from "lucide-react";
import { useState } from "react";
import { LANDING_ASSETS } from "./landingData";
import { LandingImage } from "./LandingImage";
import styles from "./MetodologiPage.module.css";

type Guide = {
  id: string;
  tab: string;
  heading: string;
  steps: Array<{ title: string; detail: string }>;
  example: string;
  tip: string;
  image: string;
  caption: string;
};

const GUIDES: Guide[] = [
  {
    id: "series",
    tab: "Foto Series",
    heading: "Langkah Penggunaan Foto Series",
    steps: [
      { 
        title: "Identifikasi Makanan", 
        detail: "Tentukan jenis makanan yang dikonsumsi responden." 
      },
      { 
        title: "Buka Katalog", 
        detail: "Cari item tersebut dalam kategori 'Foto Series'." 
      },
      {
        title: "Tampilkan Referensi",
        detail: "Tunjukkan rangkaian foto (biasanya 7-8 porsi) kepada responden.",
      },
      {
        title: "Bandingkan Porsi",
        detail: "Minta responden memilih foto yang paling mendekati porsi aslinya.",
      },
      { 
        title: "Gunakan Interpolasi", 
        detail: "Jika porsi di antara dua foto, catat nilai tengahnya." 
      },
      {
        title: "Konfirmasi Kelipatan",
        detail: "Jika porsi jauh lebih besar, gunakan pengali (misal: 2x porsi G).",
      },
    ],
    example: "Responden makan Nasi Putih seukuran porsi C (130g).",
    tip: "Fokus pada gundukan makanan, bukan diameter piring.",
    image: LANDING_ASSETS.referenceSeries,
    caption: "Visualisasi: Rangkaian porsi Nasi Putih (50g - 300g)",
  },
  {
    id: "guide",
    tab: "Foto Guide",
    heading: "Langkah Penggunaan Foto Guide",
    steps: [
      { 
        title: "Identifikasi Produk", 
        detail: "Cek apakah makanan memiliki kemasan standar industri." 
      },
      { 
        title: "Cari di Katalog Guide", 
        detail: "Gunakan fitur pencarian untuk menemukan merk atau jenis produk." 
      },
      { 
        title: "Verifikasi Ukuran", 
        detail: "Bandingkan ukuran fisik kemasan dengan referensi di layar." 
      },
      { 
        title: "Hitung Jumlah Makanan", 
        detail: "Tanyakan berapa banyak unit (bungkus/keping) yang dikonsumsi." 
      },
      { 
        title: "Input Data", 
        detail: "Masukan jumlah unit untuk konversi otomatis ke gramasi." 
      },
    ],
    example: "Biskuit kemasan 50g, Air mineral 330ml, atau Snack 150g.",
    tip: "Selalu periksa berat bersih (netto) pada kemasan jika tersedia.",
    image: LANDING_ASSETS.referenceGuide,
    caption: "Visualisasi: Rangkaian bentuk biskuit (50g - 300g)",
  },
  {
    id: "range",
    tab: "Foto Range",
    heading: "Langkah Penggunaan Foto Range",
    steps: [
      { 
        title: "Pilih Makanan Tunggal", 
        detail: "Gunakan untuk bahan alami seperti buah, daging, atau ikan." 
      },
      { 
        title: "Tentukan Kategori Ukuran", 
        detail: "Pilih antara Kecil, Sedang, atau Besar sesuai dengan range yang diberikan." 
      },
      { 
        title: "Bandingkan Dimensi", 
        detail: "Gunakan objek pembanding (seperti piring atau makanan lain yang sejenis) untuk skala" 
      },
      { 
        title: "Identifikasi Bagian", 
        detail: "Tentukan apakah yang dimakan adalah bagian utuh atau potongan." 
      },
      { 
        title: "Estimasi Berat", 
        detail: "Pilih foto yang paling mirip dengan bentuk fisik makanan." 
      },
    ],
    example: "Responden makan biskuit berbentuk bulat ukuran sedang.",
    tip: "Pastikan ketebalan, bentuk ukuran, dan potongan makanan, bukan hanya luas permukaannya.",
    image: LANDING_ASSETS.referenceGuide,
    caption: "Visualisasi: Rangkaian ukuran jeruk (50g - 300g)",
  },
];

export function MetodologiGuide() {
  const [activeId, setActiveId] = useState(GUIDES[0].id);
  const guide = GUIDES.find((item) => item.id === activeId) ?? GUIDES[0];

  return (
    <div className={styles.guide}>
      <div className={styles.tabs} role="tablist" aria-label="Jenis referensi foto">
        {GUIDES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`panduan-tab-${item.id}`}
            aria-selected={item.id === guide.id}
            aria-controls="panduan-panel"
            className={`${styles.tab} ${item.id === guide.id ? styles.tabActive : ""}`}
            onClick={() => setActiveId(item.id)}
          >
            {item.tab}
          </button>
        ))}
      </div>

      <div
        id="panduan-panel"
        role="tabpanel"
        aria-labelledby={`panduan-tab-${guide.id}`}
        className={styles.guidePanel}
      >
        <div>
          <p className={styles.guideHeading}>
            <Layers size={22} aria-hidden />
            {guide.heading}
          </p>

          <ol className={styles.steps}>
            {guide.steps.map((step) => (
              <li key={step.title}>
                <div>
                  <strong>{step.title}</strong>
                  <span>{step.detail}</span>
                </div>
              </li>
            ))}
          </ol>

          <p className={`${styles.callout} ${styles.calloutExample}`}>
            <strong>Contoh:</strong>
            {guide.example}
          </p>
          <p className={styles.callout}>
            <strong>Tips:</strong>
            {guide.tip}
          </p>
        </div>

        <div>
          {/* key memaksa slot gambar dibuat ulang saat tab berganti. */}
          <LandingImage
            key={guide.id}
            src={guide.image}
            alt={guide.caption}
            sizes="(max-width: 960px) 100vw, 500px"
            ratio="500 / 520"
            fit="contain"
            className={styles.guideImage}
          />
          <p className={styles.guideCaption}>{guide.caption}</p>
        </div>
      </div>
    </div>
  );
}
