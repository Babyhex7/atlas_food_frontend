"use client";

/* eslint-disable @next/next/no-img-element */

// [BARU] Implementasi Landing Page dari frame Figma 65:2871.
// Semua gambar di bawah adalah aset ekspor Figma yang nanti disimpan di public/images/landing.

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  Check,
  ChevronRight,
  CircleGauge,
  Database,
  FlaskConical,
  GlassWater,
  Globe2,
  HeartPulse,
  Landmark,
  Mail,
  Menu,
  Microscope,
  ScanSearch,
  ShieldCheck,
  Smartphone,
  Soup,
  Stethoscope,
  Utensils,
  UsersRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/internal/domain/auth/hooks/useAuth";
import { useLogout } from "@/internal/domain/auth/hooks/useLogout";
import { useCategories } from "@/internal/domain/category/hooks/useCategoryQueries";
import styles from "./LandingPage.module.css";

const LANDING_ASSETS = {
  logo: "/images/landing/atlas-food-logo.png",
  heroPlatform: "/images/landing/hero-platform.png",
  whyDeveloped: "/images/landing/why-developed.png",
  visualReference: "/images/landing/visual-reference.png",
  seriesReference: "/images/landing/reference-series.png",
  rangeReference: "/images/landing/reference-range.png",
  guideReference: "/images/landing/reference-guide.png",
  utensilsCatalog: "/images/landing/utensils-catalog.png",
  foodCategoriesGrid: "/images/landing/food-categories-grid.png",
  ctaCollage: "/images/landing/cta-collage.png",
} as const;

const NAVIGATION = [
  { href: "#beranda", label: "Beranda" },
  { href: "#kategori", label: "Kategori" },
  { href: "#metodologi", label: "Metodologi" },
  { href: "#tim-peneliti", label: "Tim Peneliti" },
];

type Audience = {
  title: string;
  description: string;
  icon: LucideIcon;
};

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

export function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const logout = useLogout();

  // [DIUBAH] Tetap menggunakan sinkronisasi kategori dari backend.
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();

  const featuredCategories = [...categories]
    .sort((first, second) => first.display_order - second.display_order)
    .slice(0, 6);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link
            href="#beranda"
            onClick={closeMenu}
            className={styles.logoLink}
            aria-label="Atlas Food"
          >
            <LandingLogo className={styles.logoImage} />
          </Link>

          <nav className={styles.desktopNavigation} aria-label="Navigasi utama">
            {NAVIGATION.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navigationLink} ${
                  index === 0 ? styles.navigationLinkActive : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={styles.accountActions}>
            {isAuthenticated ? (
              <>
                <Link href="/profile" className={styles.registerButton}>
                  {user?.name?.split(" ")[0] ?? "Profil"}
                </Link>
                <button
                  type="button"
                  className={styles.signInButton}
                  onClick={() => logout()}
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link href="/register" className={styles.registerButton}>
                  Daftar
                </Link>
                <Link href="/login" className={styles.signInButton}>
                  Masuk
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setIsMenuOpen((value) => !value)}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Tutup navigasi" : "Buka navigasi"}
          >
            {isMenuOpen ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>
        </div>

        {isMenuOpen ? (
          <nav className={styles.mobileNavigation} aria-label="Navigasi mobile">
            {NAVIGATION.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={styles.mobileNavigationLink}
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/find-food"
              onClick={closeMenu}
              className={styles.mobileFindFoodLink}
            >
              Jelajahi Atlas
            </Link>
          </nav>
        ) : null}
      </header>

      <main>
        <section id="beranda" className={styles.heroSection}>
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <h1 className={styles.heroTitle}>
                <span>Atlas Food</span>
                <span>Digitalisasi Estimasi</span>
                <span>
                  Porsi Makanan <em>Nusantara</em>
                </span>
              </h1>

              <p className={styles.heroDescription}>
                Inovasi digital dari Atlas Makananku untuk mendukung akurasi survei
                konsumsi pangan nasional dengan visualisasi porsi presisi.
              </p>

              <div className={styles.heroActions}>
                <Link href="/find-food" className={styles.primaryButton}>
                  Jelajahi Atlas
                  <ArrowRight size={16} aria-hidden />
                </Link>

                <Link href="#metodologi" className={styles.secondaryButton}>
                  Pelajari Metodologi
                </Link>
              </div>
            </div>

            <div className={styles.heroVisualWrap}>
              <div className={styles.heroVisualGlow} />
              <FigmaAssetImage
                src={LANDING_ASSETS.heroPlatform}
                alt="Tampilan platform Atlas Food"
                className={styles.heroVisual}
                aspectRatio="681.59 / 380.72"
              />
            </div>
          </div>
        </section>

        <section className={styles.statsSection} aria-label="Statistik Atlas Food">
          <div className={styles.statsInner}>
            <Stat value="250+" label="Hidangan Terdata" detail="Terverifikasi Ahli Gizi" />
            <Stat value="13" label="Kategori Utama" detail="Berbasis Bahan Pangan" />
            <Stat value="3 Jenis" label="Referensi Visual" detail="Series, Guide, Range" />
            <Stat value="22+" label="Kolaborasi" detail="Kontributor Terlibat" />
          </div>
        </section>

        <section className={styles.whySection}>
          <div className={styles.twoColumnInner}>
            <FigmaAssetImage
              src={LANDING_ASSETS.whyDeveloped}
              alt="Ilustrasi pencatatan konsumsi makanan Atlas Food"
              className={styles.whyImage}
              aspectRatio="500 / 472"
            />

            <div className={styles.whyContent}>
              <h2>Mengapa Atlas Food Dikembangkan?</h2>
              <p>
                Tantangan utama dalam survei asupan makanan adalah bias memori responden.
                Atlas Food hadir sebagai solusi digital untuk menyediakan referensi visual
                yang konsisten dan akurat.
              </p>

              <div className={styles.benefitList}>
                <Benefit
                  icon={ScanSearch}
                  title="Akurasi Data"
                  description="Mengurangi kesalahan estimasi berat makanan dalam survei recall 24 jam."
                />
                <Benefit
                  icon={Smartphone}
                  title="Aksesibilitas"
                  description="Dapat diakses kapan saja melalui perangkat mobile oleh tenaga kesehatan di lapangan."
                />
                <Benefit
                  icon={ShieldCheck}
                  title="Standardisasi Institusional"
                  description="Metodologi telah divalidasi pakar gizi universitas dan lembaga riset nasional."
                />
              </div>
            </div>
          </div>
        </section>

        <section id="tim-peneliti" className={styles.audienceSection}>
          <div className={styles.sectionInner}>
            <SectionHeading
              eyebrow="Pengguna Atlas Food"
              title="Dirancang untuk Profesional"
              description="Ekosistem pendukung keputusan gizi yang melayani berbagai peran kunci dalam kesehatan masyarakat."
            />

            <div className={styles.audienceGrid}>
              {AUDIENCES.map((audience) => {
                const Icon = audience.icon;

                return (
                  <article key={audience.title} className={styles.audienceCard}>
                    <span className={styles.audienceIcon}>
                      <Icon size={22} aria-hidden />
                    </span>
                    <h3>{audience.title}</h3>
                    <p>{audience.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="metodologi" className={styles.featuresSection}>
          <div className={styles.featuresInner}>
            <article className={styles.featureRow}>
              <FigmaAssetImage
                src={LANDING_ASSETS.visualReference}
                alt="Contoh referensi visual porsi makanan Atlas Food"
                className={styles.featureImage}
                aspectRatio="1.32 / 1"
              />

              <div className={styles.featureCopy}>
                <p className={styles.eyebrow}>Standar dokumentasi</p>
                <h2>Referensi Visual Terstandarisasi</h2>
                <p>
                  Seluruh koleksi foto Atlas Food merupakan hasil dokumentasi studio yang
                  dikontrol ketat, sehingga setiap porsi mewakili kenyataan asupan di lapangan.
                </p>

                <ul className={styles.checkList}>
                  <li>
                    <Check size={18} aria-hidden />
                    Validasi Pakar UPI &amp; BRIN
                  </li>
                  <li>
                    <Check size={18} aria-hidden />
                    Pencahayaan Studio Konsisten
                  </li>
                  <li>
                    <Check size={18} aria-hidden />
                    Perspektif Sudut Pandang Manusia
                  </li>
                </ul>
              </div>
            </article>

            <article className={`${styles.featureRow} ${styles.featureRowReverse}`}>
              <div className={styles.featureCopy}>
                <p className={styles.eyebrow}>Cakupan nusantara</p>
                <h2>Database Hidangan Terluas</h2>
                <p>
                  Cakupan masakan nusantara yang ekstensif, mencakup berbagai provinsi dengan
                  detail nutrisi yang terintegrasi langsung dalam sistem digital.
                </p>

                <div className={styles.featureTags}>
                  <span>Lauk Pauk Nusantara</span>
                  <span>Kudapan Tradisional</span>
                  <span>Update Data Berkala</span>
                </div>
              </div>

              <FigmaAssetImage
                src={LANDING_ASSETS.foodCategoriesGrid}
                alt="Koleksi hidangan pada database Atlas Food"
                className={styles.featureImage}
                aspectRatio="1.32 / 1"
              />
            </article>
          </div>
        </section>

        <section className={styles.referenceSection}>
          <div className={styles.sectionInner}>
            <SectionHeading
              eyebrow="Metode estimasi"
              title="Tiga Jenis Referensi Visual"
              description="Pilih metode visual yang paling sesuai dengan karakter makanan dan kebutuhan estimasi porsi."
              dark
            />

            <div className={styles.referenceGrid}>
              <ReferenceCard
                image={LANDING_ASSETS.seriesReference}
                title="Series"
                description="Urutan porsi dari terkecil ke terbesar untuk estimasi berat yang presisi."
              />
              <ReferenceCard
                image={LANDING_ASSETS.rangeReference}
                title="Range"
                description="Variasi porsi umum yang ditemukan di berbagai wilayah Indonesia."
              />
              <ReferenceCard
                image={LANDING_ASSETS.guideReference}
                title="Guide"
                description="Perbandingan visual dengan alat makan standar rumah tangga."
              />
            </div>
          </div>
        </section>

        <section className={styles.utensilsSection}>
          <div className={styles.twoColumnInner}>
            <div className={styles.utensilsCopy}>
              <p className={styles.eyebrow}>Referensi alat makan</p>
              <h2>Katalog Alat Makan Indonesia</h2>
              <p>
                Saat foto makanan tidak tersedia, database alat makan menyediakan estimasi
                volume berdasarkan dimensi standar piring, mangkuk, dan alat makan populer Indonesia.
              </p>

              <div className={styles.utensilList}>
                <UtensilItem
                  icon={Utensils}
                  title="Diameter Piring Standar"
                  detail="Piring makan dan piring kecil"
                />
                <UtensilItem
                  icon={GlassWater}
                  title="Volume Gelas & Cangkir"
                  detail="Gelas, mug, dan cangkir"
                />
                <UtensilItem
                  icon={Soup}
                  title="Kapasitas Sendok & Centong"
                  detail="Sendok makan hingga centong nasi"
                />
              </div>
            </div>

            <FigmaAssetImage
              src={LANDING_ASSETS.utensilsCatalog}
              alt="Katalog alat makan Indonesia untuk referensi estimasi porsi"
              className={styles.utensilsImage}
              aspectRatio="500 / 472"
            />
          </div>
        </section>

        <section id="kategori" className={styles.categorySection}>
          <div className={styles.categoryInner}>
            <div className={styles.categoryVisualPane}>
              <FigmaAssetImage
                src={LANDING_ASSETS.foodCategoriesGrid}
                alt="Contoh kelompok kategori makanan Atlas Food"
                className={styles.categoryVisualImage}
                aspectRatio="1.35 / 1"
              />
            </div>

            <div className={styles.categoryCopyPane}>
              <p className={styles.eyebrow}>Database makanan</p>
              <h2>Telusuri Kategori</h2>
              <p>
                Eksplorasi database berdasarkan kelompok bahan pangan utama untuk menemukan
                referensi porsi yang relevan.
              </p>

              <div className={styles.categoryList}>
                {isCategoriesLoading ? (
                  Array.from({ length: 3 }, (_, index) => (
                    <span key={index} className={styles.categorySkeleton} />
                  ))
                ) : featuredCategories.length > 0 ? (
                  featuredCategories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/find-food/category/${category.code}`}
                      className={styles.categoryLink}
                    >
                      <span className={styles.categoryLinkIcon}>
                        {/* [DIUBAH] Jangan tampilkan emoji dari seed backend pada Landing. */}
                        <Database size={16} aria-hidden />
                      </span>

                      <span>
                        <strong>{category.name}</strong>
                        <small>{category.code}</small>
                      </span>

                      <ChevronRight size={16} aria-hidden />
                    </Link>
                  ))
                ) : (
                  <p className={styles.categoryFallback}>
                    Kategori belum dapat dimuat. Anda tetap dapat membuka katalog Find Food.
                  </p>
                )}
              </div>

              <Link href="/find-food" className={styles.categoryCta}>
                Lihat Semua Kategori
                <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.roadmapSection}>
          <div className={styles.sectionInner}>
            <SectionHeading
              eyebrow="Peta jalan pengembangan"
              title="Dibangun Melalui Riset Berkelanjutan"
              description="Peta jalan pengembangan Atlas Food menuju standar nasional estimasi porsi pangan digital."
            />

            <div className={styles.roadmapGrid}>
              {ROADMAP.map((step, index) => (
                <article
                  key={step.number}
                  className={`${styles.roadmapCard} ${
                    index === 3 ? styles.roadmapCardActive : ""
                  }`}
                >
                  {index === 3 ? <span className={styles.activePill}>FASE AKTIF</span> : null}
                  <span className={styles.roadmapNumber}>{step.number}</span>
                  <span className={styles.roadmapPeriod}>{step.period}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.trustStrip} aria-label="Metodologi dan standar Atlas Food">
          <div className={styles.trustInner}>
            <TrustItem icon={Building2} label="Standar Nasional" />
            <TrustItem icon={FlaskConical} label="Protokol BRIN" />
            <TrustItem icon={UsersRound} label="Metodologi UPI" />
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className={styles.ctaBackdrop}>
            <FigmaAssetImage
              src={LANDING_ASSETS.ctaCollage}
              alt="Koleksi makanan Atlas Food"
              className={styles.ctaBackdropImage}
              aspectRatio="2 / 1"
            />
          </div>

          <div className={styles.ctaInner}>
            <p className={styles.eyebrow}>Mulai bersama Atlas Food</p>
            <h2>Mulai Tingkatkan Akurasi Data Gizi Anda</h2>
            <p>
              Bergabunglah dalam transformasi digital sistem gizi Indonesia. Dapatkan akses
              ke referensi visual porsi makanan terlengkap.
            </p>

            <div className={styles.ctaActions}>
              <Link href="/register" className={styles.primaryButton}>
                Daftar Akun Gratis
                <ArrowRight size={16} aria-hidden />
              </Link>
              <Link href="#footer" className={styles.secondaryButton}>
                Hubungi Tim Peneliti
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer id="footer" className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <LandingLogo className={styles.footerLogo} inverted />
              <p>
                Sistem referensi digital untuk estimasi porsi makanan Indonesia yang
                dikembangkan melalui kolaborasi strategis BRIN dan Universitas Pendidikan Indonesia.
              </p>

              <div className={styles.socialLinks}>
                <a href="#footer" aria-label="Website Atlas Food">
                  <Building2 size={17} aria-hidden />
                </a>
                <a href="#footer" aria-label="Kanal informasi Atlas Food">
                  <Globe2 size={17} aria-hidden />
                </a>
                <a href="mailto:info@atlasfood.id" aria-label="Email Atlas Food">
                  <Mail size={17} aria-hidden />
                </a>
              </div>
            </div>

            <FooterColumn title="Navigasi" items={NAVIGATION} />

            <FooterColumn
              title="Informasi"
              items={[
                { href: "#footer", label: "Kebijakan Privasi" },
                { href: "#footer", label: "Syarat Penggunaan" },
                { href: "#footer", label: "Kontak Peneliti" },
                { href: "#footer", label: "Pusat Bantuan" },
              ]}
            />

            <div className={styles.partnerColumn}>
              <h3>Instansi Partner</h3>
              <div>
                <strong>BRIN</strong>
                <span>Badan Riset dan Inovasi Nasional</span>
              </div>
              <div>
                <strong>UPI</strong>
                <span>Universitas Pendidikan Indonesia</span>
              </div>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p>© 2026 Atlas Food. Hak cipta dilindungi. Kolaborasi Riset BRIN &amp; UPI.</p>
            <div>
              <Link href="#footer">Privasi</Link>
              <Link href="#footer">Ketentuan</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// [BARU] Slot gambar agar layout tidak rusak ketika aset belum ditambahkan.
function FigmaAssetImage({
  src,
  alt,
  className,
  aspectRatio,
}: {
  src: string;
  alt: string;
  className: string;
  aspectRatio: string;
}) {
  const [isMissing, setIsMissing] = useState(false);

  if (isMissing) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`${className} ${styles.assetPlaceholder}`}
        style={{ aspectRatio }}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ aspectRatio }}
      onError={() => setIsMissing(true)}
    />
  );
}

function LandingLogo({
  className,
  inverted = false,
}: {
  className: string;
  inverted?: boolean;
}) {
  const [isMissing, setIsMissing] = useState(false);

  if (isMissing) {
    return (
      <span
        className={`${className} ${styles.logoFallback} ${
          inverted ? styles.logoFallbackInverted : ""
        }`}
      >
        <span>Atlas Food</span>
        <small>Atlas Makananku</small>
      </span>
    );
  }

  return (
    <img
      src={LANDING_ASSETS.logo}
      alt="Atlas Food"
      className={className}
      onError={() => setIsMissing(true)}
    />
  );
}

function Stat({
  value,
  label,
  detail,
}: {
  value: string;
  label: string;
  detail: string;
}) {
  return (
    <article className={styles.statItem}>
      <strong>{value}</strong>
      <span>{label}</span>
      <small>{detail}</small>
    </article>
  );
}

function Benefit({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <article className={styles.benefitItem}>
      <span>
        <Icon size={18} aria-hidden />
      </span>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  dark?: boolean;
}) {
  return (
    <div className={`${styles.sectionHeading} ${dark ? styles.sectionHeadingDark : ""}`}>
      <p>{eyebrow}</p>
      <h2>{title}</h2>
      <span>{description}</span>
    </div>
  );
}

function ReferenceCard({
  image,
  title,
  description,
}: {
  image: string;
  title: string;
  description: string;
}) {
  return (
    <article className={styles.referenceCard}>
      <FigmaAssetImage
        src={image}
        alt={`Referensi visual ${title}`}
        className={styles.referenceImage}
        aspectRatio="1.36 / 1"
      />
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}

function UtensilItem({
  icon: Icon,
  title,
  detail,
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
}) {
  return (
    <article className={styles.utensilItem}>
      <span>
        <Icon size={18} aria-hidden />
      </span>
      <div>
        <h3>{title}</h3>
        <p>{detail}</p>
      </div>
    </article>
  );
}

function TrustItem({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <div className={styles.trustItem}>
      <Icon size={19} aria-hidden />
      <span>{label}</span>
    </div>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: Array<{ href: string; label: string }>;
}) {
  return (
    <div className={styles.footerColumn}>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={`${title}-${item.label}`}>
            <Link href={item.href}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}