// Landing Page dari frame Figma "Atlas Food Update" 7:470.
// Hanya navbar, kategori, dan slot gambar yang berjalan di client.

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Apple,
  ArrowRight,
  BadgeCheck,
  BookOpenText,
  BriefcaseMedical,
  ChartColumn,
  CircleCheck,
  FlaskConical,
  GraduationCap,
  Microscope,
  MonitorSmartphone,
  UserRoundCheck,
  UserRoundCog,
} from "lucide-react";
import { LandingCategories } from "./LandingCategories";
import { LANDING_ASSETS } from "./landingData";
import { LandingFooter } from "./LandingFooter";
import { LandingImage } from "./LandingImage";
import { LandingNavbar } from "./LandingNavbar";
import styles from "./LandingPage.module.css";

const STATS = [
  { value: "250+", label: "Hidangan Terdata", detail: "Terverifikasi Ahli Gizi" },
  { value: "13", label: "Kategori Utama", detail: "Berbasis Bahan Pangan" },
  { value: "3 Jenis", label: "Referensi Visual", detail: "Series, Guide, Range" },
  { value: "22+", label: "Kolaborasi", detail: "Kontributor Terlibat" },
];

type IconItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const BENEFITS: IconItem[] = [
  {
    title: "Akurasi Data",
    description: "Mengurangi kesalahan estimasi berat makanan dalam survei recall 24 jam.",
    icon: ChartColumn,
  },
  {
    title: "Aksesibilitas",
    description:
      "Dapat diakses kapan saja melalui perangkat mobile oleh tenaga kesehatan di lapangan.",
    icon: MonitorSmartphone,
  },
  {
    title: "Standardisasi Institusional",
    description:
      "Metodologi yang telah divalidasi oleh pakar gizi dari universitas dan lembaga riset nasional.",
    icon: CircleCheck,
  },
];

const AUDIENCES: IconItem[] = [
  {
    title: "Peneliti Gizi",
    description: "Data porsi primer untuk studi epidemiologi dan survei konsumsi nasional.",
    icon: Microscope,
  },
  {
    title: "Ahli Gizi (Dietisien)",
    description: "Visualisasi untuk konseling pasien dan pengaturan menu diet terukur.",
    icon: Apple,
  },
  {
    title: "Tenaga Kesehatan",
    description: "Alat bantu praktis untuk asesmen gizi di tingkat puskesmas dan masyarakat.",
    icon: BriefcaseMedical,
  },
  {
    title: "Mahasiswa & Dosen",
    description: "Referensi pembelajaran metodologi survei konsumsi pangan yang aplikatif.",
    icon: GraduationCap,
  },
  {
    title: "Pengelola Program",
    description: "Monitoring kualitas data survei kesehatan skala kabupaten hingga nasional.",
    icon: UserRoundCog,
  },
  {
    title: "Pemerintah",
    description: "Pengambilan kebijakan berbasis bukti data konsumsi pangan yang valid.",
    icon: UserRoundCheck,
  },
];

const REFERENCE_TYPES = [
  {
    title: "Series",
    description: "Urutan porsi dari terkecil ke terbesar untuk estimasi berat yang presisi.",
    image: LANDING_ASSETS.referenceSeries,
  },
  {
    title: "Guide",
    description: "Perbandingan visual dengan alat makan standard rumah tangga.",
    image: LANDING_ASSETS.referenceGuide,
  },
  {
    title: "Range",
    description: "Variasi porsi umum yang ditemukan di berbagai wilayah Indonesia.",
    image: LANDING_ASSETS.referenceRange,
  },
];

type RoadmapStatus = "done" | "active" | "upcoming";

const ROADMAP: Array<{
  number: string;
  period: string;
  title: string;
  description: string;
  status: RoadmapStatus;
}> = [
  {
    number: "01",
    period: "Q1 2025",
    title: "Identifikasi Hidangan",
    description: "Pemilihan menu nasional terpopuler berdasarkan data survei konsumsi nasional terkini.",
    status: "done",
  },
  {
    number: "02",
    period: "Q2 2025",
    title: "Survei Porsi Dasar",
    description: "Pengumpulan data porsi rata-rata langsung dari rumah tangga di berbagai provinsi.",
    status: "done",
  },
  {
    number: "03",
    period: "Q3 2025",
    title: "Produksi Visual",
    description: "Dokumentasi porsi di laboratorium gizi UPI dengan standar pencahayaan internasional.",
    status: "done",
  },
  {
    number: "04",
    period: "Q1 2026",
    title: "Digitalisasi Platform",
    description: "Pengembangan sistem Atlas Food berbasis web dan mobile untuk aksesibilitas tinggi.",
    status: "active",
  },
  {
    number: "05",
    period: "Q2 2026",
    title: "Integrasi Nasional",
    description: "Penggunaan Atlas Food sebagai standar referensi visual dalam survei konsumsi gizi nasional.",
    status: "upcoming",
  },
];

const STATUS_CLASS: Record<RoadmapStatus, string> = {
  done: "",
  active: styles.roadmapStepActive,
  upcoming: styles.roadmapStepUpcoming,
};

const STANDARDS = [
  { label: "Standar Nasional", icon: BadgeCheck },
  { label: "Protokol BRIN", icon: FlaskConical },
  { label: "Metodologi UPI", icon: BookOpenText },
];

export function LandingPage() {
  return (
    <div className={styles.page}>
      <LandingNavbar />

      <main>
        <section id="beranda" className={styles.hero}>
          <div className={`${styles.container} ${styles.heroInner}`}>
            <div>
              <h1 className={styles.heroTitle}>
                <span>Atlas Food</span>
                <span>Digitalisasi Estimasi</span>
                <span>
                  Porsi Makanan <em>Nusantara</em>
                </span>
              </h1>

              <p className={styles.heroDescription}>
                Inovasi digital dari Atlas Makananku untuk mendukung akurasi survei konsumsi
                pangan nasional dengan visualisasi porsi presisi.
              </p>

              <div className={styles.actions}>
                <Link href="/find-food" className={`${styles.button} ${styles.buttonPrimary}`}>
                  Jelajahi Atlas
                  <ArrowRight size={20} aria-hidden />
                </Link>
                <Link href="/metodologi" className={`${styles.button} ${styles.buttonSecondary}`}>
                  Pelajari Metodologi
                </Link>
              </div>
            </div>

            <LandingImage
              src={LANDING_ASSETS.foodGrid}
              alt="Contoh foto porsi makanan pada Atlas Food"
              sizes="(max-width: 960px) 100vw, 600px"
              ratio="600 / 334"
              className={styles.heroVisual}
              priority
            />
          </div>
        </section>

        <section className={styles.stats} aria-label="Statistik Atlas Food">
          <div className={styles.statsInner}>
            {STATS.map((stat) => (
              <div key={stat.label} className={styles.stat}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
                <small>{stat.detail}</small>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.why}>
          <div className={`${styles.container} ${styles.whyInner}`}>
            <LandingImage
              src={LANDING_ASSETS.whyDeveloped}
              alt="Ilustrasi pencatatan konsumsi makanan dengan Atlas Food"
              sizes="(max-width: 960px) 100vw, 500px"
              ratio="500 / 472"
              fit="contain"
              className={styles.whyImage}
            />

            <div className={styles.whyCopy}>
              <h2 className={styles.heading}>Mengapa Atlas Food Dikembangkan?</h2>
              <p className={styles.lead}>
                Tantangan utama dalam survei asupan makanan adalah bias memori responden. Atlas
                Food hadir sebagai solusi digital untuk menyediakan referensi visual yang
                konsisten dan akurat.
              </p>

              <div className={styles.benefits}>
                {BENEFITS.map(({ title, description, icon: Icon }) => (
                  <article key={title} className={styles.benefit}>
                    <Icon size={20} aria-hidden />
                    <div>
                      <h3>{title}</h3>
                      <p>{description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.audience}>
          <div className={styles.container}>
            <div className={styles.sectionIntro}>
              <h2 className={styles.heading}>Dirancang untuk Profesional</h2>
              <p className={styles.lead}>
                Ekosistem pendukung keputusan gizi yang melayani berbagai peran kunci dalam
                kesehatan masyarakat.
              </p>
            </div>

            <div className={styles.audienceGrid}>
              {AUDIENCES.map(({ title, description, icon: Icon }) => (
                <article key={title} className={styles.audienceItem}>
                  <span className={styles.audienceIcon}>
                    <Icon size={26} aria-hidden />
                  </span>
                  <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="metodologi" className={styles.features}>
          <div className={styles.featuresInner}>
            <article className={styles.featureRow}>
              <LandingImage
                src={LANDING_ASSETS.visualReference}
                alt="Contoh referensi visual porsi makanan Atlas Food"
                sizes="(max-width: 960px) 100vw, 528px"
                ratio="528 / 295"
                className={styles.featureImage}
              />

              <div className={styles.featureCopy}>
                <h2 className={styles.heading}>Referensi Visual Terstandarisasi</h2>
                <p className={styles.lead}>
                  Seluruh koleksi foto dalam Atlas Food merupakan hasil dokumentasi studio yang
                  dikontrol ketat, memastikan setiap porsi mewakili kenyataan asupan di lapangan.
                </p>
                <ul className={styles.bullets}>
                  <li>Validasi Pakar UPI &amp; BRIN</li>
                  <li>Pencahayaan Studio Konsisten</li>
                  <li>Perspektif Sudut Pandang Manusia</li>
                </ul>
              </div>
            </article>

            <article className={`${styles.featureRow} ${styles.featureRowReverse}`}>
              <div className={`${styles.featureCopy} ${styles.featureCopyEnd}`}>
                <h2 className={styles.heading}>Database Hidangan Terluas</h2>
                <p className={styles.lead}>
                  Cakupan masakan nusantara yang ekstensif, mencakup 34 provinsi dengan detail
                  nutrisi yang terintegrasi langsung dalam sistem digital kami.
                </p>
                <ul className={styles.bullets}>
                  <li>Lauk Pauk Nusantara</li>
                  <li>Kudapan Tradisional</li>
                  <li>Update Data Berkala</li>
                </ul>
              </div>

              <LandingImage
                src={LANDING_ASSETS.foodGrid}
                alt="Koleksi hidangan pada database Atlas Food"
                sizes="(max-width: 960px) 100vw, 528px"
                ratio="528 / 295"
                className={styles.featureImage}
              />
            </article>
          </div>
        </section>

        <section className={styles.reference}>
          <div className={styles.container}>
            <div className={styles.sectionIntro}>
              <h2 className={styles.heading}>Tiga Jenis Referensi Visual</h2>
            </div>

            <div className={styles.referenceGrid}>
              {REFERENCE_TYPES.map((type) => (
                <article key={type.title} className={styles.referenceCard}>
                  <LandingImage
                    src={type.image}
                    alt={`Contoh referensi visual ${type.title}`}
                    sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 368px"
                    ratio="368 / 455"
                    fit="contain"
                    className={styles.referenceImage}
                  />
                  <h3>{type.title}</h3>
                  <p>{type.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.utensils}>
          <div className={`${styles.container} ${styles.utensilsInner}`}>
            <div className={styles.utensilsCopy}>
              <h2 className={styles.heading}>Katalog Alat Makan Indonesia</h2>
              <p className={styles.lead}>
                Saat foto makanan tidak tersedia, database alat makan kami menyediakan estimasi
                volume berdasarkan dimensi standar piring, mangkuk, dan alat makan populer
                Indonesia.
              </p>
              <ul className={styles.bullets}>
                <li>Diameter Piring Standar</li>
                <li>Volume Gelas &amp; Cangkir</li>
                <li>Kapasitas Sendok &amp; Centong</li>
              </ul>
            </div>

            <LandingImage
              src={LANDING_ASSETS.utensilsCatalog}
              alt="Katalog alat makan Indonesia beserta dimensinya"
              sizes="(max-width: 960px) 100vw, 778px"
              ratio="778 / 434"
              fit="contain"
              className={styles.utensilsImage}
            />
          </div>
        </section>

        <LandingCategories />

        <section className={styles.roadmap}>
          <div className={styles.container}>
            <div className={styles.sectionIntro}>
              <h2 className={styles.heading}>Dibangun Melalui Riset Berkelanjutan</h2>
              <p className={styles.lead}>
                Peta jalan pengembangan Atlas Food menuju standar nasional estimasi porsi pangan
                digital.
              </p>
            </div>

            <ol className={styles.roadmapList}>
              {ROADMAP.map((step) => (
                <li
                  key={step.number}
                  className={`${styles.roadmapStep} ${STATUS_CLASS[step.status]}`}
                  aria-current={step.status === "active" ? "step" : undefined}
                >
                  <span className={styles.roadmapNumber}>{step.number}</span>
                  <article className={styles.roadmapCard}>
                    {step.status === "active" ? (
                      <span className={styles.roadmapPill}>FASE AKTIF</span>
                    ) : null}
                    <p className={styles.roadmapPeriod}>{step.period}</p>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </article>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={styles.trust} aria-label="Standar dan metodologi Atlas Food">
          <div className={`${styles.container} ${styles.trustInner}`}>
            {STANDARDS.map(({ label, icon: Icon }) => (
              <div key={label} className={styles.trustItem}>
                <Icon size={32} aria-hidden />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.cta}>
          <LandingImage
            src={LANDING_ASSETS.ctaCollage}
            alt=""
            sizes="100vw"
            className={styles.ctaBackdrop}
          />

          <h2 className={styles.ctaTitle}>Mulai Tingkatkan Akurasi Data Gizi Anda</h2>
          <p className={styles.lead}>
            Bergabunglah dalam transformasi digital sistem gizi Indonesia. Dapatkan akses ke
            referensi visual porsi makanan terlengkap.
          </p>

          <div className={styles.actions}>
            <Link
              href="/register"
              className={`${styles.button} ${styles.buttonLarge} ${styles.buttonPrimary}`}
            >
              Daftar Akun Gratis
            </Link>
            <Link
              href="/tim-peneliti"
              className={`${styles.button} ${styles.buttonLarge} ${styles.buttonSecondary}`}
            >
              Hubungi Tim Peneliti
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
