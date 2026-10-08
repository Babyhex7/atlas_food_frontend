"use client";

import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { useCategories } from "@/internal/domain/category/hooks/useCategoryQueries";
import type { Category } from "@/internal/domain/category/types/category";
import { getFoodsByCategoryPublic } from "@/internal/services/food.service";
import type { FoodSearchResult } from "@/internal/types/food.types";
import {
  CATEGORY_DESCRIPTION_FALLBACK,
  CATEGORY_DESCRIPTIONS,
  categoryCoverImage,
} from "./landingData";
import { LandingImage } from "./LandingImage";
import styles from "./KategoriPage.module.css";

// Batas atas endpoint /public/categories/:code/foods.
const FOOD_LIMIT = 200;
const SAMPLE_COUNT = 4;

type Sort = "default" | "name" | "count";
type CardVariant = "feature" | "tall" | "medium" | "wide" | "compact";

type Filters = {
  query: string;
  category: string;
  photoType: string;
  sort: Sort;
};

type Entry = {
  category: Category;
  foods: FoodSearchResult[];
  /** false selama daftar makanan kategori ini belum (atau gagal) dimuat. */
  hasFoods: boolean;
};

const NO_FILTERS: Filters = { query: "", category: "", photoType: "", sort: "default" };

const VARIANT_CLASS: Record<CardVariant, string> = {
  feature: `${styles.cardFeature} ${styles.cardSpan}`,
  tall: styles.cardTall,
  medium: "",
  wide: `${styles.cardWide} ${styles.cardSpan}`,
  compact: styles.cardCompact,
};

// Susunan bento mengikuti desain: kartu besar, kartu tinggi, empat kartu
// sedang, satu kartu melebar, lalu sisanya kartu ringkas.
function variantAt(index: number): CardVariant {
  if (index === 0) return "feature";
  if (index === 1) return "tall";
  if (index === 6) return "wide";
  return index < 6 ? "medium" : "compact";
}

function matches(entry: Entry, filters: Filters): boolean {
  const { category, foods } = entry;

  if (filters.category && category.code !== filters.category) return false;
  if (filters.photoType && !foods.some((food) => food.photo_type === filters.photoType)) {
    return false;
  }

  const query = filters.query.trim().toLowerCase();
  if (!query) return true;

  return [category.name, category.code, ...foods.flatMap((food) => [food.name, food.local_name])]
    .some((text) => text?.toLowerCase().includes(query));
}

export function KategoriBrowser() {
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [draftQuery, setDraftQuery] = useState("");

  const { data: categories = [], isLoading } = useCategories();

  // Jumlah hidangan, contoh nama, dan tipe foto diambil dari daftar makanan
  // tiap kategori karena endpoint kategori hanya mengirim kode dan nama.
  const foodQueries = useQueries({
    queries: categories.map((category) => ({
      queryKey: ["public-category-foods", category.code, FOOD_LIMIT],
      queryFn: (): Promise<FoodSearchResult[]> =>
        getFoodsByCategoryPublic(category.code, 1, FOOD_LIMIT),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const entries: Entry[] = categories.map((category, index) => ({
    category,
    foods: foodQueries[index]?.data ?? [],
    hasFoods: Boolean(foodQueries[index]?.isSuccess),
  }));

  const visible = entries.filter((entry) => matches(entry, filters));
  if (filters.sort === "name") {
    visible.sort((first, second) => first.category.name.localeCompare(second.category.name, "id"));
  } else if (filters.sort === "count") {
    visible.sort((first, second) => second.foods.length - first.foods.length);
  }

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    setFilters((current) => ({ ...current, query: draftQuery }));
  };

  const resetFilters = () => {
    setDraftQuery("");
    setFilters(NO_FILTERS);
  };

  return (
    <section className={styles.browser} aria-label="Daftar kategori hidangan">
      <div className={styles.container}>
        <form className={styles.toolbar} role="search" onSubmit={submitSearch}>
          <label className={styles.searchField}>
            <Search size={20} aria-hidden />
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Cari kategori atau nama makanan..."
              aria-label="Cari kategori atau nama makanan"
              value={draftQuery}
              onChange={(event) => setDraftQuery(event.target.value)}
            />
          </label>

          <select
            className={styles.select}
            aria-label="Kategori"
            value={filters.category}
            onChange={(event) => setFilters({ ...filters, category: event.target.value })}
          >
            <option value="">Kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.code}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            className={styles.select}
            aria-label="Tipe foto"
            value={filters.photoType}
            onChange={(event) => setFilters({ ...filters, photoType: event.target.value })}
          >
            <option value="">Tipe Foto</option>
            <option value="series">Series</option>
            <option value="range">Range</option>
          </select>

          <select
            className={styles.select}
            aria-label="Urutkan"
            value={filters.sort}
            onChange={(event) => setFilters({ ...filters, sort: event.target.value as Sort })}
          >
            <option value="default">Urutkan</option>
            <option value="name">Nama A–Z</option>
            <option value="count">Hidangan terbanyak</option>
          </select>

          <button type="submit" className={styles.searchButton}>
            Cari
          </button>
        </form>

        <div className={styles.chips}>
          <button
            type="button"
            className={`${styles.chip} ${filters.sort === "count" ? "" : styles.chipActive}`}
            aria-pressed={filters.sort !== "count"}
            onClick={resetFilters}
          >
            Semua
          </button>
          <button
            type="button"
            className={`${styles.chip} ${filters.sort === "count" ? styles.chipActive : ""}`}
            aria-pressed={filters.sort === "count"}
            onClick={() => setFilters({ ...filters, sort: "count" })}
          >
            Populer
          </button>
          {/* Backend belum mengirim tanggal dibuat, jadi "Terbaru" belum bisa diurutkan. */}
          <button type="button" className={styles.chip} disabled title="Belum tersedia">
            Terbaru
          </button>
        </div>

        <div className={styles.grid}>
          {isLoading ? (
            Array.from({ length: 6 }, (_, index) => (
              <span
                key={index}
                className={`${styles.skeleton} ${index === 0 ? styles.cardSpan : ""}`}
              />
            ))
          ) : visible.length > 0 ? (
            visible.map((entry, index) => (
              <CategoryCard key={entry.category.id} entry={entry} variant={variantAt(index)} />
            ))
          ) : categories.length > 0 ? (
            <p className={styles.empty}>
              Tidak ada kategori yang cocok dengan pencarian Anda.{" "}
              <Link
                href={
                  filters.query.trim()
                    ? `/find-food?q=${encodeURIComponent(filters.query.trim())}`
                    : "/find-food"
                }
              >
                Cari di Find Food
              </Link>
            </p>
          ) : (
            <p className={styles.empty}>
              Kategori belum dapat dimuat. Anda tetap dapat membuka{" "}
              <Link href="/find-food">katalog Find Food</Link>.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ entry, variant }: { entry: Entry; variant: CardVariant }) {
  const { category, foods, hasFoods } = entry;
  const showSamples = variant === "feature" || variant === "tall";
  const samples = showSamples ? foods.slice(0, SAMPLE_COUNT) : [];
  const count = foods.length >= FOOD_LIMIT ? `${FOOD_LIMIT}+` : foods.length;

  return (
    <Link
      href={`/find-food/category/${category.code}`}
      className={`${styles.card} ${VARIANT_CLASS[variant]}`}
    >
      <div className={styles.cardMedia}>
        <LandingImage
          src={categoryCoverImage(category.code)}
          alt=""
          sizes={
            variant === "feature"
              ? "(max-width: 640px) 100vw, 760px"
              : "(max-width: 640px) 100vw, (max-width: 960px) 50vw, 380px"
          }
          className={styles.cardImage}
        />
        {hasFoods ? <span className={styles.cardCount}>{count} Hidangan</span> : null}
      </div>

      <div className={styles.cardBody}>
        <h2 className={styles.cardTitle}>{category.name}</h2>

        {samples.length > 0 ? (
          <ul className={styles.cardSamples}>
            {samples.map((food) => (
              <li key={food.id}>{food.name}</li>
            ))}
          </ul>
        ) : variant !== "compact" ? (
          <p className={styles.cardText}>
            {CATEGORY_DESCRIPTIONS[category.code] ?? CATEGORY_DESCRIPTION_FALLBACK}
          </p>
        ) : null}

        <span className={styles.cardLink}>
          Lihat Kategori
          <ArrowRight size={variant === "compact" ? 14 : 20} aria-hidden />
        </span>
      </div>
    </Link>
  );
}
