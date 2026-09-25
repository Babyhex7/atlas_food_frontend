// [BARU] Seluruh section konten Landing Page berdasarkan frame Figma 65:2871.
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  Camera,
  CheckCircle2,
  ChefHat,
  CircleGauge,
  ClipboardCheck,
  Database,
  FlaskConical,
  GlassWater,
  HeartPulse,
  Landmark,
  Microscope,
  Ruler,
  ScanSearch,
  ShieldCheck,
  Smartphone,
  Soup,
  Sparkles,
  Stethoscope,
  Utensils,
  UsersRound,
} from "lucide-react";
import { CONTAINER_CLASS } from "@/internal/lib/layout";
import { LandingCategorySection } from "./LandingCategorySection";

type Audience = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const STATS = [
  { value: "250+", label: "Hidangan Terdata", detail: "Terverifikasi Ahli Gizi" },
  { value: "13", label: "Kategori Utama", detail: "Berbasis Bahan Pangan" },
  { value: "3 Jenis", label: "Referensi Visual", detail: "Series, Guide, Range" },
  { value: "22+", label: "Kolaborasi", detail: "Kontributor Terlibat" },
];

const AUDIENCES: Audience[] = [
  {
    title: "Peneliti Gizi",
    description: "Data porsi primer untuk studi epidemiologi dan survei konsumsi nasional.",
    icon: Microscope,
  },
  {
    title: "Ahli Gizi (Dietisien)",
    description: "Visualisasi untuk konseling pasien dan pengaturan menu diet terukur.",
    icon: Stethoscope,
  },
  {
    title: "Tenaga Kesehatan",
    description: "Alat bantu praktis untuk asesmen gizi di puskesmas dan masyarakat.",
    icon: HeartPulse,
  },
  {
    title: "Mahasiswa & Dosen",
    description: "Referensi pembelajaran metodologi survei konsumsi pangan yang aplikatif.",
    icon: BookOpenCheck,
  },
  {
    title: "Pengelola Program",
    description: "Monitoring kualitas data survei kesehatan dari kabupaten hingga nasional.",
    icon: CircleGauge,
  },
  {
    title: "Pemerintah",
    description: "Pengambilan kebijakan berbasis bukti data konsumsi pangan yang valid.",
    icon: Landmark,
  },
];

const ROADMAP = [
  {
    number: "01",
    period: "Q1 2025",
    title: "Identifikasi Hidangan",
    description: "Pemilihan menu nasional terpopuler berdasarkan data survei konsumsi terkini.",
  },
  {
    number: "02",
    period: "Q2 2025",
    title: "Survei Porsi Dasar",
    description: "Pengumpulan data porsi rata-rata dari rumah tangga di berbagai provinsi.",
  },
  {
    number: "03",
    period: "Q3 2025",
    title: "Produksi Visual",
    description: "Dokumentasi porsi di laboratorium gizi UPI dengan standar pencahayaan.",
  },
  {
    number: "04",
    period: "Q1 2026",
    title: "Digitalisasi Platform",
    description: "Pengembangan Atlas Food berbasis web dan mobile agar mudah diakses.",
  },
  {
    number: "05",
    period: "Q2 2026",
    title: "Integrasi Nasional",
    description: "Pemanfaatan Atlas Food sebagai referensi visual survei konsumsi gizi.",
  },
];

export function LandingContent() {
  return (
    <>
      <LandingStats />
      <LandingWhySection />
      <LandingAudienceSection />
      <LandingFeatureSection />
      <LandingReferenceTypes />
      <LandingUtensilSection />
      <LandingCategorySection />
      <LandingRoadmapSection />
      <LandingTrustAndCta />
    </>
  );
}

function LandingStats() {
  return (
    // [BARU] Premium Stats Strip dari frame Figma 65:3281.
    <section className="border-y border-[#e6bdb9]/30 bg-[#98000c] py-10 text-white sm:py-12">
      <div className={`${CONTAINER_CLASS} grid gap-7 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0`}>
        {STATS.map((item, index) => (
          <div
            key={item.label}
            className={`min-w-0 ${index > 0 ? "lg:border-l lg:border-[#e6bdb9]/30 lg:pl-10" : ""}`}
          >
            <p className="m-0 text-5xl font-extrabold leading-none tracking-[-0.05em] sm:text-6xl">
              {item.value}
            </p>
            <p className="mb-0 mt-4 text-sm font-bold uppercase tracking-[0.12em]">
              {item.label}
            </p>
            <p className="mb-0 mt-1 text-xs text-white/80">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function LandingWhySection() {
  const benefits = [
    {
      title: "Akurasi Data",
      description: "Mengurangi kesalahan estimasi berat makanan dalam survei recall 24 jam.",
      icon: ScanSearch,
    },
    {
      title: "Aksesibilitas",
      description: "Dapat diakses kapan saja melalui perangkat mobile oleh tenaga kesehatan di lapangan.",
      icon: Smartphone,
    },
    {
      title: "Standardisasi Institusional",
      description: "Metodologi telah divalidasi pakar gizi universitas dan lembaga riset nasional.",
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="bg-[#f8f9ff] py-20 sm:py-28">
      <div className={`${CONTAINER_CLASS} grid items-center gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20`}>
        {/* [BARU] Ilustrasi aplikasi dibuat responsif tanpa aset eksternal. */}
        <div className="relative mx-auto w-full max-w-[500px]">
          <div className="absolute -inset-6 rounded-full bg-[#980012]/5 blur-3xl" />
          <div className="relative rounded-[28px] border border-[#e6bdb9] bg-white p-5 shadow-[0_24px_50px_rgba(11,28,48,0.08)]">
            <div className="rounded-2xl bg-[#0b1c30] p-5 text-white">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[#f6c6ca]">
                Atlas Food
              </p>
              <p className="mb-0 mt-2 text-xl font-bold">Pencatatan asupan lebih presisi</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {["Sarapan", "Makan Siang", "Makan Malam", "Camilan"].map((meal, index) => (
                <div key={meal} className="rounded-2xl bg-[#fff5f5] p-4">
                  <p className="m-0 text-xs font-semibold text-[#980012]">0{index + 1}</p>
                  <p className="mb-0 mt-2 text-sm font-bold text-[#0b1c30]">{meal}</p>
                  <div className="mt-3 h-1.5 rounded-full bg-[#f1d8d8]">
                    <div
                      className="h-full rounded-full bg-[#980012]"
                      style={{ width: `${48 + index * 12}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-[#980012]">
            Dasar pengembangan
          </p>
          <h2 className="m-0 text-3xl font-extrabold tracking-[-0.03em] text-[#0b1c30] sm:text-4xl">
            Mengapa Atlas Food Dikembangkan?
          </h2>
          <p className="mb-0 mt-6 max-w-2xl text-base leading-7 text-[#5c3f3d] sm:text-lg">
            Tantangan utama dalam survei asupan makanan adalah bias memori responden.
            Atlas Food hadir sebagai solusi digital untuk menyediakan referensi visual
            yang konsisten dan akurat.
          </p>

          <div className="mt-8 grid gap-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className="flex gap-4 rounded-xl border border-[#e6bdb9] bg-white p-4 sm:p-5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1f2] text-[#980012]">
                    <Icon size={20} aria-hidden />
                  </span>
                  <div>
                    <h3 className="m-0 text-base font-bold text-[#0b1c30]">
                      {benefit.title}
                    </h3>
                    <p className="mb-0 mt-1 text-sm leading-6 text-[#5c3f3d]">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingAudienceSection() {
  return (
    <section id="tim-peneliti" className="bg-white py-20 sm:py-28">
      <div className={CONTAINER_CLASS}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-[#980012]">
            Pengguna Atlas Food
          </p>
          <h2 className="m-0 text-3xl font-extrabold tracking-[-0.03em] text-[#0b1c30] sm:text-4xl">
            Dirancang untuk Profesional
          </h2>
          <p className="mb-0 mt-4 text-base leading-7 text-[#5c3f3d]">
            Ekosistem pendukung keputusan gizi yang melayani berbagai peran kunci
            dalam kesehatan masyarakat.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AUDIENCES.map((audience, index) => {
            const Icon = audience.icon;

            return (
              <article
                key={audience.title}
                className="rounded-2xl border border-[#e6bdb9] bg-[#fffafa] p-6 transition-base hover:-translate-y-1 hover:bg-white hover:shadow-[0_16px_32px_rgba(11,28,48,0.08)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#980012] shadow-sm">
                  <Icon size={22} aria-hidden />
                </span>
                <p className="mb-0 mt-6 text-xs font-bold tracking-[0.14em] text-[#980012]">
                  0{index + 1}
                </p>
                <h3 className="mb-0 mt-2 text-lg font-bold text-[#0b1c30]">
                  {audience.title}
                </h3>
                <p className="mb-0 mt-3 text-sm leading-6 text-[#5c3f3d]">
                  {audience.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LandingFeatureSection() {
  return (
    <section id="metodologi" className="bg-[#f8f9ff] py-20 sm:py-28">
      <div className={`${CONTAINER_CLASS} space-y-20 sm:space-y-28`}>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-[#980012]">
              Standar dokumentasi
            </p>
            <h2 className="m-0 text-3xl font-extrabold tracking-[-0.03em] text-[#0b1c30] sm:text-4xl">
              Referensi Visual Terstandarisasi
            </h2>
            <p className="mb-0 mt-5 text-base leading-7 text-[#5c3f3d] sm:text-lg">
              Seluruh koleksi foto Atlas Food merupakan hasil dokumentasi studio
              yang dikontrol ketat, sehingga setiap porsi mewakili kenyataan
              asupan di lapangan.
            </p>

            <ul className="mt-7 grid gap-3 p-0">
              {[
                "Validasi Pakar UPI & BRIN",
                "Pencahayaan Studio Konsisten",
                "Perspektif Sudut Pandang Manusia",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-semibold text-[#0b1c30]">
                  <CheckCircle2 size={18} className="shrink-0 text-[#980012]" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <VisualReferenceMock />
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <FoodDatabaseMock />

          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-[#980012]">
              Cakupan nusantara
            </p>
            <h2 className="m-0 text-3xl font-extrabold tracking-[-0.03em] text-[#0b1c30] sm:text-4xl">
              Database Hidangan Terluas
            </h2>
            <p className="mb-0 mt-5 text-base leading-7 text-[#5c3f3d] sm:text-lg">
              Cakupan masakan nusantara yang ekstensif, mencakup berbagai provinsi
              dengan detail nutrisi yang terintegrasi langsung dalam sistem digital.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {["Lauk Pauk Nusantara", "Kudapan Tradisional", "Update Data Berkala"].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[#e6bdb9] bg-white px-4 py-2 text-sm font-semibold text-[#0b1c30]"
                  >
                    {item}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function VisualReferenceMock() {
  return (
    <div className="rounded-[28px] border border-[#e6bdb9] bg-white p-5 shadow-[0_24px_48px_rgba(11,28,48,0.08)] sm:p-7">
      <div className="flex items-center justify-between">
        <div>
          <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-[#980012]">
            Studio reference
          </p>
          <p className="mb-0 mt-1 text-lg font-bold text-[#0b1c30]">Porsi Nasi Putih</p>
        </div>
        <Camera size={22} className="text-[#980012]" aria-hidden />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {["50 g", "100 g", "150 g"].map((weight, index) => (
          <div key={weight} className="rounded-2xl bg-[#fff5f5] p-3 text-center">
            <div
              className="mx-auto rounded-full border-[6px] border-white bg-[#f2d6ad] shadow-sm"
              style={{ height: `${48 + index * 14}px`, width: `${48 + index * 14}px` }}
            />
            <p className="mb-0 mt-3 text-xs font-bold text-[#0b1c30]">{weight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FoodDatabaseMock() {
  return (
    <div className="grid grid-cols-3 gap-3 rounded-[28px] border border-[#e6bdb9] bg-white p-5 shadow-[0_24px_48px_rgba(11,28,48,0.08)] sm:p-7">
      {["🍛", "🍲", "🍢", "🥗", "🍜", "🍚", "🍗", "🍌", "🥘"].map((food, index) => (
        <div
          key={`${food}-${index}`}
          className="flex aspect-square items-center justify-center rounded-2xl bg-[#fff5f5] text-3xl shadow-sm"
        >
          {food}
        </div>
      ))}
    </div>
  );
}

function LandingReferenceTypes() {
  const types = [
    {
      title: "Series",
      description: "Urutan porsi dari terkecil ke terbesar untuk estimasi berat yang presisi.",
      icon: ClipboardCheck,
      accent: "bg-[#f6c6ca] text-[#980012]",
    },
    {
      title: "Range",
      description: "Variasi porsi umum yang ditemukan di berbagai wilayah Indonesia.",
      icon: Sparkles,
      accent: "bg-[#f9e4c4] text-[#a25112]",
    },
    {
      title: "Guide",
      description: "Perbandingan visual dengan alat makan standar rumah tangga.",
      icon: Ruler,
      accent: "bg-[#dbeafe] text-[#1d4ed8]",
    },
  ];

  return (
    <section className="bg-[#0b1c30] py-20 text-white sm:py-28">
      <div className={CONTAINER_CLASS}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f6c6ca]">
            Metode estimasi
          </p>
          <h2 className="m-0 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
            Tiga Jenis Referensi Visual
          </h2>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {types.map((type, index) => {
            const Icon = type.icon;

            return (
              <article
                key={type.title}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-6 transition-base hover:-translate-y-1 hover:bg-white/[0.1]"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${type.accent}`}>
                  <Icon size={25} aria-hidden />
                </div>
                <p className="mb-0 mt-7 text-xs font-bold uppercase tracking-[0.14em] text-white/50">
                  0{index + 1}
                </p>
                <h3 className="mb-0 mt-2 text-2xl font-bold">{type.title}</h3>
                <p className="mb-0 mt-4 text-sm leading-6 text-[#eaf1ff]/75">{type.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LandingUtensilSection() {
  const utensils = [
    { icon: Utensils, label: "Diameter Piring Standar", detail: "Piring makan dan piring kecil" },
    { icon: GlassWater, label: "Volume Gelas & Cangkir", detail: "Gelas, mug, dan cangkir" },
    { icon: Soup, label: "Kapasitas Sendok & Centong", detail: "Sendok makan hingga centong nasi" },
  ];

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className={`${CONTAINER_CLASS} grid items-center gap-12 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-20`}>
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-[#980012]">
            Referensi alat makan
          </p>
          <h2 className="m-0 text-3xl font-extrabold tracking-[-0.03em] text-[#0b1c30] sm:text-4xl">
            Katalog Alat Makan Indonesia
          </h2>
          <p className="mb-0 mt-5 text-base leading-7 text-[#5c3f3d] sm:text-lg">
            Saat foto makanan tidak tersedia, database alat makan menyediakan
            estimasi volume berdasarkan dimensi standar piring, mangkuk, dan alat
            makan populer Indonesia.
          </p>

          <div className="mt-8 grid gap-4">
            {utensils.map((utensil) => {
              const Icon = utensil.icon;

              return (
                <div key={utensil.label} className="flex gap-4 rounded-xl border border-[#e6bdb9] p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1f2] text-[#980012]">
                    <Icon size={20} aria-hidden />
                  </span>
                  <div>
                    <p className="m-0 text-sm font-bold text-[#0b1c30]">{utensil.label}</p>
                    <p className="mb-0 mt-1 text-sm text-[#5c3f3d]">{utensil.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative grid min-h-[380px] place-items-center overflow-hidden rounded-[28px] border border-[#e6bdb9] bg-[#f8f9ff] p-8">
          <div className="absolute h-64 w-64 rounded-full border-[24px] border-[#fff1f2]" />
          <div className="relative grid w-full max-w-[380px] grid-cols-3 gap-4">
            {[
              ["Piring", ChefHat],
              ["Mangkuk", Soup],
              ["Gelas", GlassWater],
              ["Sendok", Utensils],
              ["Centong", Ruler],
              ["Data", Database],
            ].map(([label, Icon]) => {
              const ItemIcon = Icon as LucideIcon;

              return (
                <div key={label as string} className="rounded-2xl bg-white p-4 text-center shadow-[0_8px_18px_rgba(11,28,48,0.08)]">
                  <ItemIcon size={24} className="mx-auto text-[#980012]" aria-hidden />
                  <p className="mb-0 mt-2 text-xs font-bold text-[#0b1c30]">{label as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingRoadmapSection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className={CONTAINER_CLASS}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-[#980012]">
            Peta jalan pengembangan
          </p>
          <h2 className="m-0 text-3xl font-extrabold tracking-[-0.03em] text-[#0b1c30] sm:text-4xl">
            Dibangun Melalui Riset Berkelanjutan
          </h2>
          <p className="mb-0 mt-4 text-base leading-7 text-[#5c3f3d]">
            Peta jalan pengembangan Atlas Food menuju standar nasional estimasi porsi
            pangan digital.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {ROADMAP.map((step, index) => (
            <article
              key={step.number}
              className={`relative rounded-2xl border p-5 ${index === 3 ? "border-[#980012] bg-[#fff5f5]" : "border-[#e6bdb9] bg-[#f8f9ff]"}`}
            >
              {index === 3 ? (
                <span className="absolute -top-3 left-5 rounded-full bg-[#980012] px-3 py-1 text-[10px] font-bold tracking-[0.12em] text-white">
                  FASE AKTIF
                </span>
              ) : null}
              <p className="m-0 text-2xl font-extrabold text-[#980012]">{step.number}</p>
              <p className="mb-0 mt-4 text-xs font-bold uppercase tracking-[0.12em] text-[#980012]">
                {step.period}
              </p>
              <h3 className="mb-0 mt-2 text-base font-bold text-[#0b1c30]">{step.title}</h3>
              <p className="mb-0 mt-3 text-sm leading-6 text-[#5c3f3d]">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function LandingTrustAndCta() {
  return (
    <>
      <section className="bg-[#0b1c30] py-14 text-white">
        <div className={`${CONTAINER_CLASS} grid gap-5 text-center sm:grid-cols-3`}>
          <div className="flex items-center justify-center gap-3">
            <Building2 size={20} className="text-[#f6c6ca]" aria-hidden />
            <span className="text-sm font-bold tracking-[0.08em]">Standar Nasional</span>
          </div>
          <div className="flex items-center justify-center gap-3 border-y border-white/10 py-5 sm:border-x sm:border-y-0 sm:py-0">
            <FlaskConical size={20} className="text-[#f6c6ca]" aria-hidden />
            <span className="text-sm font-bold tracking-[0.08em]">Protokol BRIN</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <UsersRound size={20} className="text-[#f6c6ca]" aria-hidden />
            <span className="text-sm font-bold tracking-[0.08em]">Metodologi UPI</span>
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-[radial-gradient(circle_at_90%_10%,rgba(152,0,18,0.13),transparent_30%),#f8f9ff] py-20 sm:py-28">
        <div className={`${CONTAINER_CLASS} grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.62fr)]`}>
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-[#980012]">
              Mulai bersama Atlas Food
            </p>
            <h2 className="m-0 max-w-2xl text-3xl font-extrabold tracking-[-0.03em] text-[#0b1c30] sm:text-4xl">
              Mulai Tingkatkan Akurasi Data Gizi Anda
            </h2>
            <p className="mb-0 mt-5 max-w-xl text-base leading-7 text-[#5c3f3d] sm:text-lg">
              Bergabunglah dalam transformasi digital sistem gizi Indonesia. Dapatkan
              akses ke referensi visual porsi makanan terlengkap.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-full bg-[#980012] px-7 text-sm font-bold text-white no-underline shadow-[0_20px_35px_-15px_rgba(152,0,18,0.45)] transition-base hover:bg-primary-hover"
              >
                Daftar Akun Gratis
                <ArrowRight size={17} aria-hidden />
              </Link>
              <Link
                href="#footer"
                className="inline-flex min-h-[54px] items-center justify-center rounded-full border border-[#916f6c] px-7 text-sm font-bold text-[#0b1c30] no-underline transition-base hover:border-primary hover:bg-primary-light"
              >
                Hubungi Tim Peneliti
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-[28px] border border-[#e6bdb9] bg-white/80 p-5 shadow-[0_20px_42px_rgba(11,28,48,0.08)]">
            {["🍛", "🥗", "🍲", "🍜"].map((food, index) => (
              <div
                key={`${food}-${index}`}
                className="flex aspect-square items-center justify-center rounded-2xl bg-[#fff5f5] text-4xl"
              >
                {food}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}