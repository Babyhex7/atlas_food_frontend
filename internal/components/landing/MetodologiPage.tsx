"use client";

// Halaman Metodologi (Pedoman Penggunaan Atlas Food).
// Navbar dan footer dipakai bersama dengan Landing; hanya tab panduan yang berjalan di client.

import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Ban,
  BookOpenText,
  Check,
  CircleAlert,
  CircleCheck,
  CircleHelp,
  ExternalLink,
  GraduationCap,
  History,
  Images,
  Layers,
  Scale,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  Utensils,
  UtensilsCrossed,
} from "lucide-react";
import { LANDING_ASSETS } from "./landingData";
import { LandingFooter } from "./LandingFooter";
import { LandingImage } from "./LandingImage";
import { LandingNavbar } from "./LandingNavbar";
import { MetodologiGuide } from "./MetodologiGuide";
import { FadeInView, FloatingMockup, StaggerContainer, StaggerItem } from "./motion";
import landing from "./LandingPage.module.css";
import styles from "./MetodologiPage.module.css";

type IconItem = { title: string; description: string; icon: LucideIcon };

const ABOUT_POINTS = [
  "Estimasi Porsi Akurat",
  "Referensi Visual Nyata",
  "Berbasis Penelitian Ilmiah",
  "Mudah Digunakan",
];

const USE_CASES: IconItem[] = [
  {
    title: "Recall 24 Jam",
    description:
      "Membantu responden mengingat dan memperkirakan jumlah makanan yang dikonsumsi dalam sehari terakhir.",
    icon: History,
  },
  {
    title: "Semi Quantitative FFQ",
    description:
      "Sebagai standar visual dalam mengkuantifikasi frekuensi konsumsi makanan tertentu secara terperinci.",
    icon: UtensilsCrossed,
  },
  {
    title: "Penelitian & Edukasi",
    description:
      "Media edukasi bagi pasien atau masyarakat dalam mengatur porsi makan sesuai kebutuhan gizi.",
    icon: GraduationCap,
  },
];

const PHOTO_TYPES = [
  {
    title: "Foto Seri (Series)",
    description:
      "Menampilkan 3-8 foto porsi makanan yang bertahap dari kecil ke besar untuk hidangan campuran.",
    image: LANDING_ASSETS.referenceSeries,
  },
  {
    title: "Foto Panduan (Guide)",
    description:
      "Foto spesifik untuk makanan bermerek atau kemasan yang memiliki ukuran standar industri.",
    image: LANDING_ASSETS.referenceGuide,
  },
  {
    title: "Foto Rentang (Range)",
    description:
      "Variasi ukuran untuk bahan tunggal alami seperti potongan daging, buah, atau sayuran utuh.",
    image: LANDING_ASSETS.referenceRange,
  },
];

const UTENSILS = [
  { name: "Piring", detail: "22cm x 3cm" },
  { name: "Mangkok", detail: "14cm x 6cm" },
  { name: "Gelas", detail: "220ml Std" },
  { name: "Sendok Makan", detail: "15ml Cap" },
  { name: "Sendok Sayur", detail: "Plastic/Wood" },
  { name: "Centong Nasi", detail: "Traditional" },
];

const SIDE_TIPS: IconItem[] = [
  {
    title: "Fokus pada Isi",
    description:
      "Abaikan perbedaan piring atau wadah, fokuslah sepenuhnya pada volume makanan di dalamnya.",
    icon: Utensils,
  },
  {
    title: "Cek Gramasi",
    description:
      "Pastikan melihat keterangan porsi yang tertulis pada aplikasi untuk konversi data yang tepat.",
    icon: Scale,
  },
];

const MORE_TIPS: IconItem[] = [
  {
    title: "Referensi Alat Makan",
    description:
      "Gunakan foto referensi alat makan untuk membantu responden membayangkan skala porsi yang sebenarnya.",
    icon: Utensils,
  },
  {
    title: "Konfirmasi Tekstur",
    description:
      "Tanyakan kepadatan makanan (misal: nasi pulen vs pera) karena mempengaruhi berat meskipun volume tampak sama.",
    icon: Layers,
  },
];

const PROCESS = [
  "Food Selection",
  "Field Survey",
  "Market Survey",
  "Photography",
  "Expert Validation",
  "Digital Atlas",
];

const REFERENCES = [
  {
    title: "Nelson et al. (1997)",
    description: "Photographic methods for estimating food portion sizes in nutrition surveys.",
  },
  {
    title: "Shinozaki et al. (2022)",
    description: "Validity of a digital food atlas for portion size estimation in diverse populations.",
  },
  {
    title: "Wong & Wong (2020)",
    description:
      "Modern applications of visual aids in semi-quantitative food frequency questionnaires.",
  },
];

export function MetodologiPage() {
  return (
    <div className={landing.page}>
      <LandingNavbar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroInner}`}>
            <FadeInView direction="left" distance={30} duration={0.6}>
              <p className={styles.heroBadge}>
                <BadgeCheck size={16} aria-hidden />
                BRIN × Universitas Pendidikan Indonesia
              </p>
              <h1 className={styles.heroTitle}>
                Pedoman Penggunaan <em>Atlas Food</em>
              </h1>
              <p className={styles.heroDescription}>
                Panduan penggunaan Atlas Food untuk membantu estimasi ukuran porsi makanan secara
                lebih praktis, konsisten, dan berbasis referensi visual yang tervalidasi secara
                ilmiah.
              </p>
            </FadeInView>

            <FadeInView direction="right" distance={30} duration={0.6}>
              <FloatingMockup amplitude={6} duration={5}>
                <LandingImage
                  src={LANDING_ASSETS.methodologyHero}
                  alt="Ilustrasi pencatatan konsumsi makanan dengan Atlas Food"
                  sizes="(max-width: 960px) 100vw, 552px"
                  ratio="552 / 312"
                  fit="contain"
                  className={styles.heroImage}
                  priority
                />
              </FloatingMockup>
            </FadeInView>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionTint}`}>
          <div className={`${styles.container} ${styles.about}`}>
            <FadeInView direction="left" distance={25} duration={0.6}>
              <FloatingMockup amplitude={10} duration={5.5}>
                <LandingImage
                  src={LANDING_ASSETS.atlasCover}
                  alt="Sampul buku Atlas Makananku"
                  sizes="360px"
                  ratio="360 / 500"
                  className={styles.aboutCover}
                />
              </FloatingMockup>
            </FadeInView>

            <FadeInView direction="right" distance={25} duration={0.6}>
              <h2 className={styles.title}>Apa itu Atlas Food?</h2>
              <p className={styles.aboutText}>
                Atlas Food adalah alat bantu estimasi porsi makanan berbasis foto digital yang
                dikembangkan untuk mengatasi kendala saat penimbangan makanan tidak memungkinkan.
                Platform ini dirancang khusus untuk mendukung peneliti, praktisi kesehatan, dan
                edukator gizi dalam mendapatkan data asupan yang akurat.
              </p>
              <ul className={styles.aboutPoints}>
                {ABOUT_POINTS.map((point) => (
                  <motion.li key={point} whileHover={{ x: 3, transition: { duration: 0.15 } }}>
                    <span className={styles.check}>
                      <Check size={13} strokeWidth={3} aria-hidden />
                    </span>
                    {point}
                  </motion.li>
                ))}
              </ul>
            </FadeInView>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <FadeInView direction="up" distance={20} className={styles.intro}>
              <h2 className={styles.title}>Kapan Atlas Food Digunakan?</h2>
              <p className={styles.lead}>
                Instrumen ini sangat fleksibel dan dapat diintegrasikan dalam berbagai metode
                penilaian konsumsi pangan.
              </p>
            </FadeInView>

            <StaggerContainer className={styles.useGrid} staggerDelay={0.12}>
              {USE_CASES.map(({ title, description, icon: Icon }) => (
                <StaggerItem key={title} yOffset={25}>
                  <motion.article
                    className={styles.useCard}
                    whileHover={{ y: -6, transition: { duration: 0.22, ease: "easeOut" } }}
                  >
                    <span className={styles.useIcon}>
                      <Icon size={26} aria-hidden />
                    </span>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </motion.article>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionDark}`}>
          <div className={styles.container}>
            <FadeInView direction="up" distance={20}>
              <h2 className={styles.title}>Tiga Jenis Referensi Foto</h2>
              <p className={styles.lead}>
                Atlas Food menyediakan tiga kategori visual untuk mencakup semua jenis makanan.
              </p>
            </FadeInView>

            <StaggerContainer className={styles.photoGrid} staggerDelay={0.15}>
              {PHOTO_TYPES.map((type) => (
                <StaggerItem key={type.title} yOffset={25}>
                  <motion.article
                    className={styles.photoCard}
                    whileHover={{ y: -6, transition: { duration: 0.22, ease: "easeOut" } }}
                  >
                    <LandingImage
                      src={type.image}
                      alt=""
                      sizes="(max-width: 960px) 100vw, 362px"
                      className={styles.photoImage}
                    />
                    <div className={styles.photoBody}>
                      <h3>{type.title}</h3>
                      <p>{type.description}</p>
                    </div>
                  </motion.article>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <FadeInView direction="up" distance={20} className={styles.intro}>
              <h2 className={styles.title}>Cara Menggunakan Atlas Food</h2>
              <p className={styles.lead}>
                Panduan langkah demi langkah untuk setiap kategori referensi visual.
              </p>
            </FadeInView>

            <MetodologiGuide />
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <FadeInView direction="up" distance={20} className={styles.intro}>
              <h2 className={styles.flowTitle}>Bagaimana Atlas Food Digunakan?</h2>
              <p className={styles.lead}>
                Alur kerja estimasi porsi makanan dari perspektif wawancara gizi.
              </p>
            </FadeInView>

            <StaggerContainer className={styles.flowGrid} staggerDelay={0.1}>
              <StaggerItem yOffset={20}>
                <FlowStep number="01" title="Responden Mengingat Konsumsi Makanan">
                  <div className={`${styles.mock} ${styles.chat}`}>
                    <p className={styles.chatBubble}>
                      <small>PETUGAS</small>
                      &quot;Apa saja makanan yang Anda konsumsi dalam 24 jam terakhir?&quot;
                    </p>
                    <p className={`${styles.chatBubble} ${styles.chatBubbleReply}`}>
                      <small>RESPONDEN</small>
                      &quot;Saya makan nasi putih, ayam goreng, tumis kangkung, dan teh manis.&quot;
                    </p>
                  </div>
                </FlowStep>
              </StaggerItem>

              <StaggerItem yOffset={20}>
                <FlowStep number="02" title="Petugas Membuka Atlas Food">
                  <LandingImage
                    src={LANDING_ASSETS.flowOpenAtlas}
                    alt="Atlas Food dibuka pada perangkat petugas"
                    sizes="(max-width: 640px) 100vw, 352px"
                    ratio="340 / 234"
                    className={`${styles.flowImage} ${styles.flowImageDevice}`}
                  />
                </FlowStep>
              </StaggerItem>

              <StaggerItem yOffset={20}>
                <FlowStep number="03" title="Responden Membandingkan Foto">
                  <LandingImage
                    src={LANDING_ASSETS.flowComparePhoto}
                    alt="Rangkaian foto porsi pisang yang dibandingkan responden"
                    sizes="(max-width: 640px) 100vw, 352px"
                    ratio="352 / 196"
                    className={styles.flowImage}
                  />
                  <p className={styles.flowQuote}>
                    &quot;Porsi saya paling mirip dengan gambar ini.&quot;
                  </p>
                </FlowStep>
              </StaggerItem>

              <StaggerItem yOffset={20}>
                <FlowStep number="04" title="Atlas Food Mengonversi Estimasi">
                  <div className={styles.mock}>
                    <div className={styles.mockHead}>
                      <div>
                        <p className={styles.mockLabel}>Estimated Weight</p>
                        <p className={styles.mockValue}>210 gram</p>
                      </div>
                      <Scale size={32} aria-hidden />
                    </div>
                    <p className={styles.mockRow}>
                      Edible Portion <strong>100%</strong>
                    </p>
                    <p className={styles.mockStatus}>
                      <BadgeCheck size={16} aria-hidden />
                      Estimasi Berhasil
                    </p>
                  </div>
                </FlowStep>
              </StaggerItem>

              <StaggerItem yOffset={20}>
                <FlowStep number="05" title="Data Dicatat">
                  <div className={`${styles.mock} ${styles.form}`}>
                    <p className={styles.formHead}>Digital Recall Form</p>
                    <ul className={styles.formRows}>
                      <li>
                        <span>Nasi Putih</span>
                        <span>210 g</span>
                      </li>
                      <li>
                        <span>Ayam Goreng</span>
                        <span>---</span>
                      </li>
                      <li>
                        <span>Tumis Kangkung</span>
                        <span>---</span>
                      </li>
                    </ul>
                  </div>
                </FlowStep>
              </StaggerItem>

              <StaggerItem yOffset={20}>
                <FlowStep number="06" title="Analisis Asupan Gizi">
                  <div className={styles.nutrients}>
                    <div className={`${styles.mock} ${styles.nutrient}`}>
                      <p className={styles.mockLabel}>Energi</p>
                      <p>
                        350<small>kcal</small>
                      </p>
                      <div className={styles.meter}>
                        <span style={{ width: "70%" }} />
                      </div>
                    </div>
                    <div className={`${styles.mock} ${styles.nutrient}`}>
                      <p className={styles.mockLabel}>Protein</p>
                      <p>
                        12<small>g</small>
                      </p>
                      <div className={`${styles.meter} ${styles.meterMuted}`}>
                        <span style={{ width: "45%" }} />
                      </div>
                    </div>
                    <p className={styles.nutrientTotal}>
                      Total Gizi Harian
                      <TrendingUp size={16} aria-hidden />
                    </p>
                  </div>
                </FlowStep>
              </StaggerItem>
            </StaggerContainer>

            <div className={styles.compare}>
              <FadeInView direction="left" distance={25} duration={0.55}>
                <article className={styles.compareCard}>
                  <span className={styles.comparePill}>KONDISI SAAT INI</span>
                  <span className={styles.compareIcon}>
                    <Ban size={32} aria-hidden />
                  </span>
                  <h3>Tanpa Atlas Food</h3>
                  <ul className={styles.compareList}>
                    <li>
                      <span>
                        <CircleAlert size={20} aria-hidden />
                      </span>
                      Interpretasi porsi berbeda antar responden
                    </li>
                    <li>
                      <span>
                        <TriangleAlert size={20} aria-hidden />
                      </span>
                      Risiko bias sangat tinggi
                    </li>
                  </ul>
                </article>
              </FadeInView>

              <FadeInView direction="right" distance={25} duration={0.55}>
                <article className={`${styles.compareCard} ${styles.compareCardGood}`}>
                  <span className={styles.comparePill}>REKOMENDASI</span>
                  <span className={styles.compareIcon}>
                    <BadgeCheck size={36} aria-hidden />
                  </span>
                  <h3>Dengan Atlas Food</h3>
                  <ul className={styles.compareList}>
                    <li>
                      <CircleCheck size={22} aria-hidden />
                      Referensi visual terstandarisasi
                    </li>
                    <li>
                      <Sparkles size={22} aria-hidden />
                      Konversi gramasi otomatis
                    </li>
                  </ul>
                </article>
              </FadeInView>
            </div>

            <FadeInView direction="up" distance={20} duration={0.6}>
              <blockquote className={styles.quote}>
                <LandingImage
                  src={LANDING_ASSETS.methodologyQuote}
                  alt=""
                  sizes="(max-width: 1280px) 100vw, 1152px"
                  className={styles.quoteBackdrop}
                  missingClassName={styles.quoteBackdropMissing}
                />
                <p>
                  Atlas Food membantu menjembatani persepsi visual responden dengan kebutuhan
                  kuantifikasi objektif peneliti.
                </p>
              </blockquote>
            </FadeInView>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <FadeInView direction="up" distance={20} className={styles.intro}>
              <h2 className={styles.title}>Referensi Alat Makan</h2>
              <p className={styles.lead}>
                Standarisasi ukuran alat makan yang digunakan dalam pemotretan referensi Atlas
                Food.
              </p>
            </FadeInView>

            <FadeInView direction="up" distance={25} duration={0.6}>
              <LandingImage
                src={LANDING_ASSETS.utensilsCatalog}
                alt="Alat makan referensi Atlas Food beserta dimensinya"
                sizes="(max-width: 1280px) 100vw, 1152px"
                ratio="1152 / 642"
                fit="contain"
                className={styles.utensilImage}
              />
            </FadeInView>

            <StaggerContainer className={styles.utensilList} staggerDelay={0.06}>
              {UTENSILS.map((utensil) => (
                <StaggerItem key={utensil.name} yOffset={15}>
                  <motion.li whileHover={{ scale: 1.03, y: -2 }}>
                    <strong>{utensil.name}</strong>
                    <span>{utensil.detail}</span>
                  </motion.li>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <FadeInView direction="up" distance={20} className={styles.intro}>
              <h2 className={styles.title}>Tips Penggunaan Profesional</h2>
            </FadeInView>

            <StaggerContainer className={styles.tips} staggerDelay={0.08}>
              <StaggerItem yOffset={20}>
                <motion.article
                  className={`${styles.tip} ${styles.tipMain}`}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <span className={styles.tipIcon}>
                    <Images size={40} aria-hidden />
                  </span>
                  <div>
                    <span className={styles.tipTag}>TIPS UTAMA</span>
                    <h3>Foto Terdekat</h3>
                    <p>
                      Pilih foto yang porsinya paling mendekati konsumsi responden untuk akurasi
                      maksimal. Jika porsi berada di antara dua foto, gunakan nilai tengah
                      (interpolasi).
                    </p>
                  </div>
                </motion.article>
              </StaggerItem>

              {SIDE_TIPS.map(({ title, description, icon: Icon }) => (
                <StaggerItem key={title} yOffset={20}>
                  <motion.article
                    className={`${styles.tip} ${styles.tipSide}`}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    <span className={styles.tipIcon}>
                      <Icon size={22} aria-hidden />
                    </span>
                    <div>
                      <h3>{title}</h3>
                      <p>{description}</p>
                    </div>
                  </motion.article>
                </StaggerItem>
              ))}

              {MORE_TIPS.map(({ title, description, icon: Icon }) => (
                <StaggerItem key={title} yOffset={20}>
                  <motion.article
                    className={styles.tip}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    <span className={styles.tipIcon}>
                      <Icon size={20} aria-hidden />
                    </span>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </motion.article>
                </StaggerItem>
              ))}

              <StaggerItem yOffset={20}>
                <motion.article
                  className={`${styles.tip} ${styles.tipAlert}`}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <span className={styles.tipIcon}>
                    <CircleHelp size={20} aria-hidden />
                  </span>
                  <h3>Jangan Ragu</h3>
                  <p>
                    Jangan ragu untuk bertanya kembali jika pilihan responden terasa tidak konsisten
                    dengan deskripsi verbalnya.
                  </p>
                </motion.article>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionDark}`}>
          <div className={styles.container}>
            <FadeInView direction="up" distance={20} className={styles.intro}>
              <h2 className={styles.title}>Dasar Pengembangan Atlas</h2>
              <p className={styles.lead}>
                Proses panjang di balik akurasi data Atlas Food Indonesia.
              </p>
            </FadeInView>

            <StaggerContainer className={styles.process} staggerDelay={0.08}>
              {PROCESS.map((step, index) => (
                <StaggerItem key={step} yOffset={15}>
                  <motion.li whileHover={{ y: -3, scale: 1.02 }}>
                    <span aria-hidden>{index + 1}</span>
                    {step}
                  </motion.li>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.referenceHead}>
              <FadeInView direction="left" distance={20}>
                <h2 className={styles.title}>Referensi Ilmiah</h2>
                <p className={styles.lead}>
                  Metodologi kami didasarkan pada standar penelitian global terkemuka.
                </p>
              </FadeInView>
              {/* Halaman publikasi belum tersedia; tautan sementara ke kontak di footer. */}
              <motion.a
                href="#kontak"
                className={styles.referenceLink}
                whileHover={{ scale: 1.03, x: 2 }}
                whileTap={{ scale: 0.97 }}
              >
                Lihat Publikasi Lengkap
                <ExternalLink size={18} aria-hidden />
              </motion.a>
            </div>

            <StaggerContainer className={styles.referenceGrid} staggerDelay={0.12}>
              {REFERENCES.map((reference) => (
                <StaggerItem key={reference.title} yOffset={25}>
                  <motion.article
                    className={styles.referenceCard}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  >
                    <BookOpenText size={24} aria-hidden />
                    <h3>{reference.title}</h3>
                    <p>{reference.description}</p>
                  </motion.article>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        <section className={styles.cta}>
          <FadeInView direction="up" distance={25} duration={0.6}>
            <BookOpenText className={styles.ctaMark} strokeWidth={1.5} aria-hidden />
            <h2 className={styles.ctaTitle}>Siap Menggunakan Atlas Food?</h2>
            <p className={styles.ctaText}>
              Mulai survey nutrisi Anda hari ini dengan alat bantu visual tercanggih untuk kuliner
              Indonesia.
            </p>
            <div className={styles.ctaActions}>
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
                <Link href="/find-food" className={`${styles.ctaButton} ${styles.ctaButtonLight}`}>
                  Jelajahi Atlas
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
                <Link href="/surveys" className={styles.ctaButton}>
                  Mulai Survey Recall
                </Link>
              </motion.div>
            </div>
          </FadeInView>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

function FlowStep({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <motion.li
      className={styles.flowStep}
      whileHover={{ y: -5, transition: { duration: 0.2, ease: "easeOut" } }}
    >
      <span className={styles.flowNumber} aria-hidden>
        {number}
      </span>
      <h3>{title}</h3>
      {children}
    </motion.li>
  );
}
