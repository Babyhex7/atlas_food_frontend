// Halaman Kategori Hidangan. Navbar dan footer dipakai bersama dengan Landing.

import Link from "next/link";
import { ChartColumn } from "lucide-react";
import { KategoriBrowser } from "./KategoriBrowser";
import { LANDING_ASSETS } from "./landingData";
import { LandingFooter } from "./LandingFooter";
import { LandingImage } from "./LandingImage";
import { LandingNavbar } from "./LandingNavbar";
import landing from "./LandingPage.module.css";
import styles from "./KategoriPage.module.css";

export function KategoriPage() {
  return (
    <div className={landing.page}>
      <LandingNavbar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroInner}`}>
            <div>
              <h1 className={styles.heroTitle}>Kategori Hidangan</h1>
              <p className={styles.heroDescription}>
                Jelajahi berbagai kategori hidangan dalam Atlas Food. Basis data referensi
                visual porsi makan terlengkap untuk kebutuhan riset nutrisi dan kesehatan di
                Indonesia.
              </p>
            </div>

            <div className={styles.heroVisual}>
              <LandingImage
                src={LANDING_ASSETS.categoriesHero}
                alt="Tampilan kategori hidangan pada database Atlas Food"
                sizes="(max-width: 960px) 100vw, 550px"
                ratio="550 / 412"
                className={styles.heroImage}
                priority
              />
              <div className={styles.heroBadge}>
                <span className={styles.heroBadgeIcon}>
                  <ChartColumn size={22} aria-hidden />
                </span>
                <div>
                  <strong>Terstandarisasi</strong>
                  <small>Metode BRIN &amp; UPI</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <KategoriBrowser />

        <section className={styles.cta}>
          <div className={`${styles.container} ${styles.ctaInner}`}>
            <LandingImage
              src={LANDING_ASSETS.categoriesCta}
              alt=""
              sizes="(max-width: 1280px) 100vw, 1152px"
              className={styles.ctaBackdrop}
              missingClassName={styles.ctaBackdropMissing}
            />

            <h2 className={styles.ctaTitle}>Siap Menjelajahi Koleksi Atlas Food?</h2>
            <p className={styles.ctaText}>
              Temukan referensi visual terlengkap untuk membantu estimasi asupan gizi yang lebih
              akurat.
            </p>

            <div className={styles.ctaActions}>
              <Link
                href="/find-food"
                className={`${landing.button} ${landing.buttonPrimary} ${styles.ctaButton}`}
              >
                Jelajahi Semua Hidangan
              </Link>
              <Link
                href="/"
                className={`${landing.button} ${landing.buttonSecondary} ${styles.ctaButton}`}
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
