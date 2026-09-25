"use client";

// [DIUBAH] Slicing ulang Find Food dan hasil pencarian.
// Data tetap berasal dari endpoint publik backend yang sudah digunakan proyek.

import { Suspense, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Loader2,
  Search,
  SlidersHorizontal,
  UtensilsCrossed,
  X,
} from "lucide-react";
import {
  searchFoodsPublic,
  getCategoriesPublic,
} from "@/internal/services/food.service";
import { useDebounce } from "@/internal/hooks/use-debounce";
import type { FoodSearchResult } from "@/internal/types/food.types";
import { AppHeader } from "@/internal/components/layout/AppHeader";
import {
  useCollab,
  viewerLockLinkProps,
  viewerLockProps,
  VIEWER_LOCK_HINT,
  useCollabStore,
  withCollabParams,
} from "@/internal/domain/collab";
import styles from "./FindFoodContent.module.css";

const MIN_SEARCH_LENGTH = 2;

type PublicCategory = {
  id: string;
  code: string;
  name: string;
  icon?: string | null;
};

type PhotoFilter = "all" | "series" | "range";
type FoodTypeFilter = "" | "food" | "drink";

function FindFoodBody() {
  const searchParams = useSearchParams();
  const { send, isConnected, isViewer } = useCollab();
  const followingUserId = useCollabStore((state) => state.followingUserId);
  const remoteSearch = useCollabStore((state) => state.remoteSearch);

  const queryFromUrl = searchParams.get("q") ?? "";
  const roomParam = searchParams.get("room");
  const inviteParam = searchParams.get("invite");
  const isFollowing = Boolean(followingUserId);

  const remoteQuery =
    isFollowing &&
    remoteSearch?.query &&
    remoteSearch.userId === followingUserId
      ? remoteSearch.query
      : null;

  const sourceQuery = remoteQuery ?? queryFromUrl;
  const [searchTerm, setSearchTerm] = useState(sourceQuery);
  const [previousSourceQuery, setPreviousSourceQuery] =
    useState(sourceQuery);

  // [DIUBAH] URL browser dan leader kolaborasi boleh menjadi sumber query.
  if (sourceQuery !== previousSourceQuery) {
    setPreviousSourceQuery(sourceQuery);
    setSearchTerm(sourceQuery);
  }

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPhotoType, setSelectedPhotoType] =
    useState<PhotoFilter>("all");
  const [selectedFoodType, setSelectedFoodType] =
    useState<FoodTypeFilter>("");

  const controlsLocked = isViewer || isFollowing;
  const debouncedSearch = useDebounce(searchTerm, 300);
  const normalizedQuery = debouncedSearch.trim();
  const canSearch = normalizedQuery.length >= MIN_SEARCH_LENGTH;

  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useQuery<PublicCategory[]>({
    queryKey: ["public-categories"],
    queryFn: getCategoriesPublic,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: searchResults = [],
    isFetching: isSearching,
    isError: isSearchError,
  } = useQuery<FoodSearchResult[]>({
    queryKey: ["public-search", normalizedQuery, selectedFoodType],
    queryFn: () =>
      searchFoodsPublic(normalizedQuery, selectedFoodType, 100),
    enabled: canSearch,
    staleTime: 30 * 1000,
  });

  const filteredResults = useMemo(() => {
    return searchResults.filter((food) => {
      const categoryMatches =
        selectedCategory === "all" ||
        food.category?.code === selectedCategory;

      const photoTypeMatches =
        selectedPhotoType === "all" ||
        food.photo_type === selectedPhotoType;

      return categoryMatches && photoTypeMatches;
    });
  }, [searchResults, selectedCategory, selectedPhotoType]);

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedPhotoType !== "all" ||
    selectedFoodType !== "";

  const resetFilters = () => {
    setSelectedCategory("all");
    setSelectedPhotoType("all");
    setSelectedFoodType("");
  };

  const clearSearch = () => {
    setSearchTerm("");
    resetFilters();
  };

  // q tetap dapat dibagikan dan dipertahankan saat refresh/navigasi.
  useEffect(() => {
    if (typeof window === "undefined" || isViewer || isFollowing) return;

    const url = new URL(window.location.href);
    const currentQuery = url.searchParams.get("q") ?? "";
    let changed = false;

    if (
      normalizedQuery.length >= MIN_SEARCH_LENGTH &&
      currentQuery !== normalizedQuery
    ) {
      url.searchParams.set("q", normalizedQuery);
      changed = true;
    }

    if (
      normalizedQuery.length < MIN_SEARCH_LENGTH &&
      url.searchParams.has("q")
    ) {
      url.searchParams.delete("q");
      changed = true;
    }

    if (!changed) return;

    const queryString = url.searchParams.toString();
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${queryString ? `?${queryString}` : ""}`
    );

    if (isConnected) {
      send("viewport_update", {
        page: window.location.pathname,
        path: window.location.pathname + window.location.search,
        scroll_x: window.scrollX,
        scroll_y: window.scrollY,
      });
    }
  }, [normalizedQuery, isViewer, isFollowing, isConnected, send]);

  useEffect(() => {
    if (!isConnected || !canSearch || isViewer || isFollowing) return;

    send("food_search", {
      query: normalizedQuery,
      filters: {},
    });
  }, [
    normalizedQuery,
    canSearch,
    isConnected,
    isViewer,
    isFollowing,
    send,
  ]);

  return (
    <main className={styles.catalogPage}>
      <section className={styles.heroSection} aria-labelledby="find-food-title">
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Atlas Makananku</p>

          <h1 id="find-food-title">
            Temukan Referensi Porsi Makanan
          </h1>

          <p className={styles.heroDescription}>
            Cari makanan berdasarkan nama atau kode untuk melihat referensi
            visual porsi dan informasi gizinya.
          </p>

          <div className={styles.searchPanel}>
            <Search
              size={22}
              aria-hidden
              className={styles.searchIcon}
            />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={
                controlsLocked
                  ? isFollowing
                    ? "Mengikuti pencarian rekan…"
                    : "Pencarian dikunci — mode Can view"
                  : "Cari nama atau kode makanan, misal: nasi, MP-01"
              }
              {...viewerLockProps(controlsLocked)}
              className={styles.searchInput}
              aria-label="Cari makanan"
            />

            {isSearching ? (
              <Loader2
                size={20}
                className={styles.searchLoader}
                aria-label="Memuat hasil"
              />
            ) : normalizedQuery.length > 0 ? (
              <button
                type="button"
                className={styles.clearSearchButton}
                onClick={clearSearch}
                disabled={controlsLocked}
                aria-label="Hapus pencarian"
              >
                <X size={18} aria-hidden />
              </button>
            ) : null}
          </div>

          <p className={styles.searchHint}>
            Ketik minimal {MIN_SEARCH_LENGTH} karakter untuk menampilkan hasil
            pencarian.
          </p>
        </div>
      </section>

      <section className={styles.contentSection} aria-live="polite">
        <div className={styles.contentInner}>
          {isViewer ? (
            <p className={styles.viewerNotice}>{VIEWER_LOCK_HINT}</p>
          ) : null}

          {normalizedQuery.length > 0 && !canSearch ? (
            <section className={styles.noticeCard}>
              <Search size={22} aria-hidden />
              <div>
                <h2>Masukkan kata kunci yang lebih lengkap</h2>
                <p>
                  Ketik minimal {MIN_SEARCH_LENGTH} karakter untuk mencari
                  makanan.
                </p>
              </div>
            </section>
          ) : null}

          {normalizedQuery.length === 0 ? (
            <section
              className={styles.categoriesSection}
              aria-labelledby="food-categories-title"
            >
              <div className={styles.sectionHeading}>
                <div>
                  <p className={styles.sectionEyebrow}>Jelajahi katalog</p>
                  <h2 id="food-categories-title">Kategori Makanan</h2>
                </div>

                <p>
                  Pilih kategori untuk melihat daftar makanan dan referensi
                  porsinya.
                </p>
              </div>

              {isCategoriesLoading ? (
                <div
                  className={styles.categoryGrid}
                  aria-label="Memuat kategori"
                >
                  {Array.from({ length: 12 }, (_, index) => (
                    <span key={index} className={styles.categorySkeleton} />
                  ))}
                </div>
              ) : isCategoriesError ? (
                <section className={styles.noticeCard}>
                  <UtensilsCrossed size={22} aria-hidden />
                  <div>
                    <h2>Kategori belum dapat dimuat</h2>
                    <p>
                      Periksa koneksi backend lalu coba muat ulang halaman ini.
                    </p>
                  </div>
                </section>
              ) : (
                <div className={styles.categoryGrid}>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={withCollabParams(
                        `/find-food/category/${category.code}`,
                        {
                          room: roomParam,
                          invite: inviteParam,
                        }
                      )}
                      {...viewerLockLinkProps(isViewer)}
                      className={`${styles.categoryCard} ${
                        isViewer ? styles.lockedLink : ""
                      }`}
                    >
                      <span className={styles.categoryCode}>
                        {category.code}
                      </span>

                      <span className={styles.categoryName}>
                        {category.name}
                      </span>

                      <ArrowRight
                        size={17}
                        aria-hidden
                        className={styles.categoryArrow}
                      />
                    </Link>
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {canSearch ? (
            <section
              className={styles.resultsSection}
              aria-labelledby="search-results-title"
            >
              <div className={styles.resultsTopbar}>
                <div>
                  <p className={styles.sectionEyebrow}>Hasil pencarian</p>

                  <h2 id="search-results-title">
                    {isSearching
                      ? "Mencari makanan…"
                      : `Hasil untuk “${normalizedQuery}”`}
                  </h2>
                </div>

                {!isSearching ? (
                  <span className={styles.resultsCount}>
                    {filteredResults.length} hasil
                  </span>
                ) : null}
              </div>

              <div className={styles.filterPanel}>
                <div className={styles.filterTitle}>
                  <SlidersHorizontal size={17} aria-hidden />
                  <span>Filter hasil</span>
                </div>

                <label className={styles.selectField}>
                  <span>Jenis data</span>

                  <span className={styles.selectWrap}>
                    <select
                      value={selectedFoodType}
                      onChange={(event) =>
                        setSelectedFoodType(
                          event.target.value as FoodTypeFilter
                        )
                      }
                      disabled={controlsLocked}
                    >
                      <option value="">Semua data</option>
                      <option value="food">Makanan</option>
                      <option value="drink">Minuman</option>
                    </select>

                    <ChevronDown size={15} aria-hidden />
                  </span>
                </label>

                <label className={styles.selectField}>
                  <span>Kategori</span>

                  <span className={styles.selectWrap}>
                    <select
                      value={selectedCategory}
                      onChange={(event) =>
                        setSelectedCategory(event.target.value)
                      }
                      disabled={controlsLocked}
                    >
                      <option value="all">Semua kategori</option>

                      {categories.map((category) => (
                        <option key={category.id} value={category.code}>
                          {category.name}
                        </option>
                      ))}
                    </select>

                    <ChevronDown size={15} aria-hidden />
                  </span>
                </label>

                <label className={styles.selectField}>
                  <span>Referensi visual</span>

                  <span className={styles.selectWrap}>
                    <select
                      value={selectedPhotoType}
                      onChange={(event) =>
                        setSelectedPhotoType(
                          event.target.value as PhotoFilter
                        )
                      }
                      disabled={controlsLocked}
                    >
                      <option value="all">Semua tipe</option>
                      <option value="series">Series</option>
                      <option value="range">Range / Guide</option>
                    </select>

                    <ChevronDown size={15} aria-hidden />
                  </span>
                </label>

                {hasActiveFilters ? (
                  <button
                    type="button"
                    className={styles.resetFiltersButton}
                    onClick={resetFilters}
                    disabled={controlsLocked}
                  >
                    Reset filter
                  </button>
                ) : null}
              </div>

              {isSearchError ? (
                <section className={styles.noticeCard}>
                  <Search size={22} aria-hidden />
                  <div>
                    <h2>Hasil pencarian belum dapat dimuat</h2>
                    <p>
                      Pastikan backend Atlas Food aktif, lalu coba ulangi
                      pencarian.
                    </p>
                  </div>
                </section>
              ) : null}

              {!isSearchError &&
              !isSearching &&
              filteredResults.length === 0 ? (
                <section className={styles.emptyState}>
                  <span className={styles.emptyIcon}>
                    <Search size={28} aria-hidden />
                  </span>

                  <h3>
                    {searchResults.length === 0
                      ? "Makanan tidak ditemukan"
                      : "Tidak ada hasil yang sesuai dengan filter"}
                  </h3>

                  <p>
                    {searchResults.length === 0
                      ? "Coba gunakan nama lain, nama lokal, atau kode makanan."
                      : "Ubah atau reset filter untuk melihat hasil lainnya."}
                  </p>

                  {hasActiveFilters ? (
                    <button
                      type="button"
                      className={styles.emptyAction}
                      onClick={resetFilters}
                      disabled={controlsLocked}
                    >
                      Tampilkan semua hasil
                    </button>
                  ) : null}
                </section>
              ) : null}

              {!isSearchError &&
              (isSearching || filteredResults.length > 0) ? (
                <div className={styles.foodGrid}>
                  {isSearching && searchResults.length === 0
                    ? Array.from({ length: 8 }, (_, index) => (
                        <span key={index} className={styles.foodSkeleton} />
                      ))
                    : filteredResults.map((food) => {
                        const foodHref = withCollabParams(
                          `/find-food/${food.id}`,
                          {
                            room: roomParam,
                            invite: inviteParam,
                          },
                          {
                            q: normalizedQuery,
                          }
                        );

                        return (
                          <Link
                            key={food.id}
                            href={foodHref}
                            {...viewerLockLinkProps(isViewer)}
                            onClick={(event) => {
                              if (isViewer) {
                                event.preventDefault();
                                return;
                              }

                              if (isConnected && !isFollowing) {
                                send("food_select", {
                                  food_id: food.id,
                                  food_name: food.name,
                                });
                              }
                            }}
                            className={`${styles.foodCard} ${
                              isViewer ? styles.lockedLink : ""
                            }`}
                          >
                            <div className={styles.foodVisual} aria-hidden>
                              <UtensilsCrossed size={27} />
                              <span>{food.code}</span>
                            </div>

                            <div className={styles.foodInfo}>
                              <div className={styles.foodMeta}>
                                <span className={styles.foodCode}>
                                  {food.code}
                                </span>

                                <span
                                  className={`${styles.photoBadge} ${
                                    food.photo_type === "series"
                                      ? styles.seriesBadge
                                      : styles.rangeBadge
                                  }`}
                                >
                                  {food.photo_type === "series"
                                    ? "Series"
                                    : "Range / Guide"}
                                </span>
                              </div>

                              <h3>{food.name}</h3>

                              {food.local_name ? (
                                <p>{food.local_name}</p>
                              ) : null}

                              <span className={styles.foodCategory}>
                                {food.category?.name ?? "Tanpa kategori"}
                                <ArrowRight size={15} aria-hidden />
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
      </section>
    </main>
  );
}

export function FindFoodContent() {
  return (
    <div className={styles.pageShell}>
      <AppHeader />

      <Suspense fallback={null}>
        <FindFoodBody />
      </Suspense>
    </div>
  );
}