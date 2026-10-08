// Halaman Tim Peneliti ("Tim di Balik Atlas Food").
// Navbar dan footer dipakai bersama dengan Landing; hanya carousel peneliti yang berjalan di client.

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Aperture,
  BadgeCheck,
  Check,
  Circle,
  Compass,
  FlaskConical,
  Globe,
  GraduationCap,
  Hourglass,
  Layers,
  Lightbulb,
  Network,
  Palette,
  Quote,
  SquareTerminal,
  Sun,
  Users,
  UtensilsCrossed,
  Waypoints,
} from "lucide-react";
import { LANDING_ASSETS, teamPhoto } from "./landingData";
import { LandingFooter } from "./LandingFooter";
import { LandingImage } from "./LandingImage";
import { LandingNavbar } from "./LandingNavbar";
import { TimCarousel } from "./TimCarousel";
import landing from "./LandingPage.module.css";
import styles from "./TimPage.module.css";

type IconItem = { title: string; description: string; icon: LucideIcon };

const FEATURED = {
  name: "Slamet Riyanto, S.Gz., MPH",
  photo: "slamet-riyanto",
  role: "Senior Researcher",
  organization: "Badan Riset dan Inovasi Nasional (BRIN)",
  quote:
    "Berfokus pada penelitian gizi masyarakat, estimasi konsumsi pangan, dan pengembangan referensi visual untuk mendukung survei konsumsi makanan di Indonesia.",
  tags: ["Public Health", "Nutrition Research"],
};

const BRIN_RESEARCHERS = [
  { name: "Slamet Riyanto, S.Gz., MPH", photo: "slamet-riyanto", rank: "Madya", field: "Public Health" },
  { name: "Irlina Raswanti Irawan", photo: "irlina-raswanti-irawan", rank: "Madya", field: "Food Science" },
  { name: "Rika Rachmawati, SP., MPH", photo: "rika-rachmawati", rank: "Muda", field: "Nutrition" },
  { name: "Yunita Diana Sari, SKM.", photo: "yunita-diana-sari", rank: "Peneliti", field: "Epidemiology" },
];

const UPI_LECTURERS = [
  {
    name: "Prof. Dr. Cica Yulia, S.Pd., M.Si.",
    photo: "cica-yulia",
    role: "Dosen Program Studi Pendidikan Tata Boga",
    description:
      "Memimpin riset standarisasi porsi dan nilai gizi masakan tradisional Indonesia untuk dokumentasi digital.",
  },
  {
    name: "Agus Juhana, S.Pd., M.T.",
    photo: "agus-juhana",
    role: "Dosen Program Studi Pendidikan Multimedia",
    description:
      "Memimpin riset standarisasi porsi dan nilai gizi masakan tradisional Indonesia untuk dokumentasi digital.",
  },
  {
    name: "Maya Purnama Sari, S.Pd., M.Ds.",
    photo: "maya-purnama-sari",
    role: "Dosen Program Studi Pendidikan Multimedia",
    description:
      "Memimpin riset standarisasi porsi dan nilai gizi masakan tradisional Indonesia untuk dokumentasi digital.",
  },
];

const DEVELOPERS = [
  {
    name: "Muhammad Rafi Zamzami",
    photo: "muhammad-rafi-zamzami",
    focus: "Data Entry & Frontend",
    description:
      "Bertanggung jawab atas entry data hidangan serta pengembangan antarmuka pengguna Atlas Food.",
  },
  {
    name: "Bagas Adhi Nugraha",
    photo: "bagas-adhi-nugraha",
    focus: "Backend",
    description:
      "Membangun arsitektur server, API, dan memastikan keamanan serta efisiensi pengolahan data.",
  },
  {
    name: "Maryam Silva Rahayu",
    photo: "maryam-silva-rahayu",
    focus: "UI/UX Design, QA & Frontend",
    description:
      "Merancang pengalaman pengguna, antarmuka visual, pengujian sistem, dan pengembangan frontend.",
  },
  {
    name: "Raden Arya Mucharom Dwi Mahesa",
    photo: "raden-arya-mucharom-dwi-mahesa",
    focus: "UI/UX & Backend",
    description:
      "Berkontribusi dalam desain antarmuka serta pengembangan sistem backend dan integrasi database.",
  },
];

type MilestoneStatus = "done" | "active" | "upcoming";

const MILESTONES: Array<{ title: string; detail: string; status: MilestoneStatus }> = [
  { title: "Research Planning", detail: "Finalisasi metodologi gizi dan data porsi.", status: "done" },
  { title: "UI & UX Design", detail: "Desain antarmuka akademik minimalis.", status: "done" },
  {
    title: "Frontend & Backend Development",
    detail: "Proses pengkodean sistem dan database.",
    status: "active",
  },
  { title: "Digital Launch", detail: "Peluncuran publik platform Atlas Food.", status: "upcoming" },
];

const MILESTONE_VIEW: Record<MilestoneStatus, { className: string; icon: LucideIcon }> = {
  done: { className: "", icon: Check },
  active: { className: styles.milestoneActive, icon: Hourglass },
  upcoming: { className: styles.milestoneUpcoming, icon: Circle },
};

const CONTRIBUTIONS: IconItem[] = [
  {
    title: "Multidisiplin",
    description: "Gabungan keahlian gizi, teknologi, dan seni visual.",
    icon: Users,
  },
  {
    title: "Standar Riset",
    description: "Mengikuti protokol validasi ilmiah BRIN & UPI.",
    icon: BadgeCheck,
  },
  {
    title: "Akses Terbuka",
    description: "Mendukung edukasi dan layanan kesehatan nasional.",
    icon: Globe,
  },
];

const VALUES: IconItem[] = [
  {
    title: "Research Based",
    description: "Setiap data dan fitur didasarkan pada metodologi ilmiah yang tervalidasi oleh pakar gizi.",
    icon: FlaskConical,
  },
  {
    title: "Collaboration",
    description:
      "Menyatukan berbagai bidang ilmu untuk menciptakan solusi yang holistik dan komprehensif.",
    icon: Waypoints,
  },
  {
    title: "Innovation",
    description:
      "Terus mengembangkan teknologi terkini untuk memudahkan akses informasi nutrisi masyarakat.",
    icon: Lightbulb,
  },
  {
    title: "Public Impact",
    description:
      "Fokus pada kebermanfaatan nyata bagi peningkatan kualitas kesehatan masyarakat Indonesia.",
    icon: Globe,
  },
];

const FOOD_PREP_TEAM = [
  { name: "Azmi Aqilah", photo: "azmi-aqilah" },
  { name: "Arrifa Naura Gumelar", photo: "arrifa-naura-gumelar" },
  { name: "Sherina Widyawati R.", photo: "sherina-widyawati" },
  { name: "Sheren Sugihto", photo: "sheren-sugihto" },
];

const CREATIVE_TEAM = [
  { name: "Jova Dirgantara Putra", photo: "jova-dirgantara-putra", role: "Lead Photographer", icon: Aperture },
  { name: "Adji Nurdiman", photo: "adji-nurdiman", role: "Lighting Expert", icon: Sun },
  { name: "Laura Anggelika", photo: "laura-anggelika", role: "Visual Designer", icon: Palette },
  { name: "Muhamad Fikry Haikal", photo: "muhamad-fikry-haikal", role: "Retoucher & Editor", icon: Layers },
];

const PARTNERS = ["BRIN", "UPI", "UMBR"];

// Inisial untuk avatar pengganti; gelar di depan nama ("Prof.", "Dr.") dilewati.
function initials(name: string): string {
  return name
    .split(/[\s,]+/)
    .filter((word) => word && !word.endsWith("."))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

function Avatar({ name, photo, size }: { name: string; photo: string; size: string }) {
  return (
    <LandingImage
      src={teamPhoto(photo)}
      alt={`Foto ${name}`}
      sizes="160px"
      className={`${styles.avatar} ${size}`}
      fallback={
        <span className={`${styles.avatarFallback} ${size}`} aria-hidden>
          {initials(name)}
        </span>
      }
    />
  );
}

export function TimPage() {
  return (
    <div className={landing.page}>
      <LandingNavbar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroInner}`}>
            <div>
              <h1 className={styles.heroTitle}>
                Tim di Balik <em>Atlas Food</em>
              </h1>
              <p className={styles.heroDescription}>
                Sebuah kolaborasi multidisiplin yang menggabungkan keahlian gizi, teknologi pangan,
                multimedia, dan pengembangan perangkat lunak untuk mewujudkan referensi nutrisi
                digital terlengkap di Indonesia.
              </p>
            </div>

            <LandingImage
              src={LANDING_ASSETS.teamHero}
              alt="Ilustrasi tim di balik Atlas Food"
              sizes="(max-width: 960px) 100vw, 552px"
              ratio="552 / 412"
              className={styles.heroImage}
              priority
            />
          </div>
        </section>

        <section className={styles.band}>
          <h2>Kolaborasi Multidisiplin</h2>
          <p>
            Mengintegrasikan standar ilmiah gizi kesehatan, keahlian tata boga, estetika
            multimedia, dan arsitektur sistem digital modern untuk satu tujuan: literasi nutrisi
            bangsa.
          </p>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.researchHead}>
              <h2 className={styles.title}>Tim Peneliti</h2>
              <p className={styles.lead}>Daftar ahli yang mewujudkan integritas data Atlas Food.</p>
            </div>

            <article className={styles.featured}>
              <div className={styles.featuredPhoto}>
                <Avatar name={FEATURED.name} photo={FEATURED.photo} size="" />
                <span className={styles.featuredMark}>
                  <Quote size={24} fill="currentColor" aria-hidden />
                </span>
              </div>

              <div>
                <p className={styles.featuredRole}>{FEATURED.role}</p>
                <h3 className={styles.featuredName}>{FEATURED.name}</h3>
                <p className={styles.featuredOrg}>{FEATURED.organization}</p>
                <blockquote className={styles.featuredQuote}>
                  &quot;{FEATURED.quote}&quot;
                </blockquote>
                <ul className={styles.tags}>
                  {FEATURED.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </div>
            </article>

            <TimCarousel title="BRIN Researchers">
              {BRIN_RESEARCHERS.map((researcher) => (
                <li key={researcher.name} className={styles.researcherCard}>
                  <div className={styles.researcherTop}>
                    <Avatar name={researcher.name} photo={researcher.photo} size={styles.avatarSm} />
                    <span className={styles.rank}>{researcher.rank}</span>
                  </div>
                  <h4 title={researcher.name}>{researcher.name}</h4>
                  <p>{researcher.field}</p>
                </li>
              ))}
            </TimCarousel>

            <div className={styles.partners}>
              <div>
                <h3 className={styles.subheading}>Universitas Pendidikan Indonesia</h3>
                <div className={styles.lecturers}>
                  {UPI_LECTURERS.map((lecturer) => (
                    <article key={lecturer.name} className={styles.lecturer}>
                      <Avatar name={lecturer.name} photo={lecturer.photo} size={styles.avatarXl} />
                      <div>
                        <h4>{lecturer.name}</h4>
                        <p className={styles.role}>{lecturer.role}</p>
                        <p>{lecturer.description}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div>
                <h3 className={styles.subheading}>Universitas Muhammadiyah Bogor Raya</h3>
                <article className={styles.partnerCard}>
                  <GraduationCap size={96} strokeWidth={1.5} aria-hidden />
                  <Avatar
                    name="Primasti Nuryandari Putri, MKM"
                    photo="primasti-nuryandari-putri"
                    size={styles.avatarLg}
                  />
                  <h4>Primasti Nuryandari Putri, MKM</h4>
                  <p className={styles.role}>Dosen Program Studi Gizi</p>
                  <p>
                    Kontribusi krusial dalam validasi metodologi penelitian gizi dan koordinasi data
                    antar institusi akademis.
                  </p>
                  <strong>UMBR</strong>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionTint}`}>
          <div className={styles.container}>
            <div className={styles.intro}>
              <h2 className={styles.title}>Tim Pengembangan Digital</h2>
              <p className={styles.lead}>Membangun arsitektur teknologi di balik Atlas Food.</p>
            </div>

            <article className={styles.mentor}>
              <div className={styles.mentorProfile}>
                <Avatar
                  name="Raditya Muhammad, S.T., M.T."
                  photo="raditya-muhammad"
                  size={styles.avatarLg}
                />
                <span className={styles.mentorBadge}>Pembimbing Pengembangan Digital</span>
                <h3>Raditya Muhammad, S.T., M.T.</h3>
                <p>Dosen Program Studi Rekayasa Perangkat Lunak</p>
              </div>

              <blockquote className={styles.mentorQuote}>
                <Quote size={32} fill="currentColor" aria-hidden />
                <p>
                  &quot;Membimbing proses pengembangan Atlas Food versi digital serta memastikan
                  implementasi sistem sesuai dengan kebutuhan penelitian.&quot;
                </p>
                <div className={styles.mentorSkills}>
                  <span>
                    <SquareTerminal size={22} aria-hidden />
                  </span>
                  <span>
                    <Network size={22} aria-hidden />
                  </span>
                </div>
              </blockquote>
            </article>

            <div className={styles.devGrid}>
              {DEVELOPERS.map((developer) => (
                <article key={developer.name} className={styles.devCard}>
                  <Avatar name={developer.name} photo={developer.photo} size={styles.avatarMd} />
                  <h3>{developer.name}</h3>
                  <p className={styles.role}>Software Developer</p>
                  <span className={styles.devTag}>{developer.focus}</span>
                  <p>{developer.description}</p>
                  <small>Rekayasa Perangkat Lunak - UPI</small>
                </article>
              ))}
            </div>

            <div className={styles.progress}>
              <div>
                <h3 className={styles.barHeading}>Milestone Pengembangan</h3>
                <ol className={styles.milestones}>
                  {MILESTONES.map((milestone) => {
                    const { className, icon: Icon } = MILESTONE_VIEW[milestone.status];

                    return (
                      <li key={milestone.title} className={className}>
                        <span className={styles.milestoneMark}>
                          <Icon size={12} strokeWidth={3} aria-hidden />
                        </span>
                        <div>
                          <strong>{milestone.title}</strong>
                          <span>{milestone.detail}</span>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div>
                <h3 className={styles.barHeading}>Cakupan Kontribusi Nasional</h3>
                <p>
                  Atlas Food menghubungkan berbagai disiplin ilmu dari institusi riset dan
                  pendidikan terkemuka di Indonesia untuk menciptakan standar baru dalam referensi
                  gizi digital.
                </p>

                <div className={styles.contributions}>
                  {CONTRIBUTIONS.map(({ title, description, icon: Icon }) => (
                    <article key={title} className={styles.contribution}>
                      <span className={styles.iconTile}>
                        <Icon size={22} aria-hidden />
                      </span>
                      <div>
                        <h4>{title}</h4>
                        <p>{description}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.intro}>
              <h2 className={styles.title}>Nilai-Nilai Tim</h2>
              <p className={styles.lead}>
                Prinsip dasar yang menyatukan kolaborasi multidisiplin kami.
              </p>
            </div>

            <div className={styles.valueGrid}>
              {VALUES.map(({ title, description, icon: Icon }) => (
                <article key={title} className={styles.valueCard}>
                  <span className={styles.iconTile}>
                    <Icon size={22} aria-hidden />
                  </span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionWhite}`}>
          <div className={styles.container}>
            <div className={styles.prepHead}>
              <div>
                <h2 className={styles.title}>Tim Persiapan Hidangan</h2>
                <p className={styles.lead}>
                  Menyusun dan menyajikan representasi makanan autentik Indonesia.
                </p>
              </div>
              <UtensilsCrossed size={40} aria-hidden />
            </div>

            <div className={styles.prepGrid}>
              {FOOD_PREP_TEAM.map((member) => (
                <article key={member.name}>
                  <Avatar name={member.name} photo={member.photo} size={styles.avatarLg} />
                  <h3>{member.name}</h3>
                  <p className={styles.role}>Pendidikan Tata Boga - UPI</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionDark}`}>
          <Aperture className={styles.darkMark} strokeWidth={2.5} aria-hidden />
          <div className={styles.container}>
            <h2 className={styles.title}>Tim Fotografi &amp; Desain</h2>
            <p className={styles.lead}>Menangkap esensi nutrisi melalui lensa dan visual presisi.</p>

            <div className={styles.creativeGrid}>
              {CREATIVE_TEAM.map(({ name, photo, role, icon: Icon }) => (
                <article key={name} className={styles.creativeCard}>
                  <div className={styles.creativePhoto}>
                    <LandingImage
                      src={teamPhoto(photo)}
                      alt={`Foto ${name}`}
                      sizes="(max-width: 640px) 100vw, 240px"
                      ratio="1 / 1"
                      className={styles.creativeImage}
                      fallback={
                        <div className={styles.creativeFallback} aria-hidden>
                          {initials(name)}
                        </div>
                      }
                    />
                    <span>
                      <Icon size={20} aria-hidden />
                    </span>
                  </div>
                  <h3>{name}</h3>
                  <p>{role}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.closing}>
          <div className={`${styles.container} ${styles.closingInner}`}>
            <div>
              <h2 className={styles.closingTitle}>Bersama Membangun Atlas Food</h2>
              <p className={styles.closingText}>
                Apresiasi setinggi-tingginya kepada seluruh pihak yang telah berkontribusi dalam
                meriset, menyusun, dan mengembangkan Atlas Food. Karya ini dipersembahkan untuk
                kemajuan sains pangan dan kesehatan masyarakat Indonesia.
              </p>
              <Link href="/find-food" className={styles.closingButton}>
                Mulai Menjelajahi Atlas
                <Compass size={20} aria-hidden />
              </Link>

              <div className={styles.thanks}>
                <h3>Special Thanks to Our Partners</h3>
                <ul>
                  {PARTNERS.map((partner) => (
                    <li key={partner}>{partner}</li>
                  ))}
                </ul>
                <p>
                  Atlas Food merupakan hasil kolaborasi multidisiplin yang menggabungkan keahlian
                  di bidang kesehatan masyarakat, gizi, teknologi, fotografi, desain, dan rekayasa
                  perangkat lunak untuk menghadirkan platform estimasi porsi makanan Indonesia yang
                  lebih akurat dan mudah diakses.
                </p>
              </div>
            </div>

            <div className={styles.collage}>
              <div>
                <CollageImage index={1} ratio="268 / 196" />
                <CollageImage index={2} ratio="268 / 146" />
              </div>
              <div>
                <CollageImage index={3} ratio="268 / 146" />
                <CollageImage index={4} ratio="268 / 196" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

function CollageImage({ index, ratio }: { index: number; ratio: string }) {
  return (
    <LandingImage
      src={`/images/landing/tim-kolase-${index}.png`}
      alt=""
      sizes="(max-width: 960px) 50vw, 268px"
      ratio={ratio}
      className={styles.collageImage}
    />
  );
}
