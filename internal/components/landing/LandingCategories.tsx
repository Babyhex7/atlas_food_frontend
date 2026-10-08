"use client";

import Link from "next/link";
import { useCategories } from "@/internal/domain/category/hooks/useCategoryQueries";
import {
  CATEGORY_DESCRIPTION_FALLBACK,
  CATEGORY_DESCRIPTIONS,
  LANDING_ASSETS,
} from "./landingData";
import { LandingImage } from "./LandingImage";
import styles from "./LandingPage.module.css";

const CARD_COUNT = 4;

export function LandingCategories() {
  // Tetap menggunakan sinkronisasi kategori dari backend.
  const { data: categories = [], isLoading } = useCategories();

  // Endpoint publik tidak selalu mengirim display_order; tanpa itu urutan API dipertahankan.
  const [featured, ...rest] = [...categories].sort(
    (first, second) => (first.display_order ?? 0) - (second.display_order ?? 0)
  );
  const cards = rest.slice(0, CARD_COUNT);

  const featuredImage = (
    <LandingImage
      src={LANDING_ASSETS.categoryFeatured}
      alt="Contoh hidangan dari berbagai kategori Atlas Food"
      sizes="(max-width: 960px) 100vw, 584px"
      ratio="584 / 420"
    />
  );

  return (
    <section id="kategori" className={styles.categories}>
      <div className={styles.container}>
        <div className={styles.categoriesHead}>
          <div>
            <h2 className={styles.heading}>Telusuri Kategori</h2>
            <p className={styles.lead}>
              Eksplorasi database berdasarkan kelompok bahan pangan utama.
            </p>
          </div>

          <Link href="/kategori" className={styles.categoriesAll}>
            {categories.length > 0
              ? `Lihat Semua ${categories.length} Kategori`
              : "Lihat Semua Kategori"}
          </Link>
        </div>

        <div className={styles.categoriesGrid}>
          {featured ? (
            <Link
              href={`/find-food/category/${featured.code}`}
              className={styles.categoryFeatured}
            >
              {featuredImage}
              <span className={styles.categoryChips}>
                <span>{featured.code}</span>
                <span>{featured.name}</span>
              </span>
            </Link>
          ) : (
            <div className={styles.categoryFeatured}>{featuredImage}</div>
          )}

          <div className={styles.categoryCards}>
            {isLoading ? (
              Array.from({ length: CARD_COUNT }, (_, index) => (
                <span key={index} className={styles.categorySkeleton} />
              ))
            ) : cards.length > 0 ? (
              cards.map((category) => (
                <Link
                  key={category.id}
                  href={`/find-food/category/${category.code}`}
                  className={styles.categoryCard}
                >
                  {/* Kode kategori, bukan emoji dari seed backend. */}
                  <span className={styles.categoryCode}>{category.code}</span>
                  <h3>{category.name}</h3>
                  <p>{CATEGORY_DESCRIPTIONS[category.code] ?? CATEGORY_DESCRIPTION_FALLBACK}</p>
                </Link>
              ))
            ) : (
              <p className={styles.categoryEmpty}>
                Kategori belum dapat dimuat. Anda tetap dapat membuka katalog Find Food.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
