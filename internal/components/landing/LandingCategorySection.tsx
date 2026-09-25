"use client";

// [BARU] Section kategori Landing yang tersambung ke data kategori backend.

import Link from "next/link";
import { ArrowRight, ChevronRight, FolderSearch } from "lucide-react";
import { useCategories } from "@/internal/domain/category/hooks/useCategoryQueries";
import { CONTAINER_CLASS } from "@/internal/lib/layout";

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  MP: "Nasi, umbi, dan sumber karbohidrat utama",
  LH: "Daging, ikan, unggas, dan telur",
  LN: "Tahu, tempe, dan kacang-kacangan",
  SR: "Sayuran segar, tumis, dan berkuah",
  AS: "Sayuran segar, tumis, dan berkuah",
  BH: "Buah segar dan potong terstandar",
  AB: "Buah segar dan potong terstandar",
  AP: "Roti, kue, dan kudapan",
  AMK: "Makanan dan minuman kemasan",
  KK: "Keripik dan camilan",
  ABK: "Bumbu dan pelengkap masakan",
  AK: "Makanan siap saji",
  MDL: "Minyak dan lemak",
  GK: "Gula dan pemanis",
};

export function LandingCategorySection() {
  // [BARU] Memakai endpoint GET /public/categories melalui hook kategori yang sudah ada.
  const { data: categories = [], isLoading, isError } = useCategories();
  const sortedCategories = [...categories]
    .sort((first, second) => first.display_order - second.display_order)
    .slice(0, 6);
  const categoryCount = categories.length || 13;

  return (
    <section id="kategori" className="bg-[#f8f9ff] py-20 sm:py-28">
      <div className={CONTAINER_CLASS}>
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-[#980012]">
              Database makanan
            </p>
            <h2 className="m-0 text-3xl font-extrabold tracking-[-0.03em] text-[#0b1c30] sm:text-4xl">
              Telusuri Kategori
            </h2>
            <p className="mb-0 mt-4 max-w-xl text-base leading-7 text-[#5c3f3d]">
              Eksplorasi database berdasarkan kelompok bahan pangan utama.
            </p>
          </div>

          <Link
            href="/find-food"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-[#e6bdb9] bg-white px-5 py-3 text-sm font-bold text-[#980012] no-underline transition-base hover:border-[#980012] hover:bg-[#fff5f5]"
          >
            Lihat Semua {categoryCount} Kategori
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-2xl border border-[#e6bdb9] bg-white"
              />
            ))}
          </div>
        ) : null}

        {!isLoading && !isError && sortedCategories.length > 0 ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedCategories.map((category) => (
              <Link
                key={category.id}
                href={`/find-food/category/${category.code}`}
                className="group rounded-2xl border border-[#e6bdb9] bg-white p-5 no-underline shadow-[0_8px_24px_rgba(11,28,48,0.04)] transition-base hover:-translate-y-1 hover:border-[#980012] hover:shadow-[0_16px_32px_rgba(11,28,48,0.1)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1f2] text-2xl">
                    {category.icon || "🍽️"}
                  </span>
                  <ChevronRight
                    size={18}
                    className="text-[#980012] transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </div>

                <p className="mb-1 mt-5 text-xs font-bold tracking-[0.12em] text-[#980012]">
                  {category.code}
                </p>
                <h3 className="m-0 text-lg font-bold text-[#0b1c30]">
                  {category.name}
                </h3>
                <p className="mb-0 mt-2 text-sm leading-6 text-[#5c3f3d]">
                  {CATEGORY_DESCRIPTIONS[category.code] || "Koleksi bahan pangan Indonesia."}
                </p>
              </Link>
            ))}
          </div>
        ) : null}

        {!isLoading && (isError || sortedCategories.length === 0) ? (
          <div className="mt-10 rounded-2xl border border-dashed border-[#e6bdb9] bg-white p-8 text-center">
            <FolderSearch size={28} className="mx-auto text-[#980012]" aria-hidden />
            <p className="mb-0 mt-3 text-sm leading-6 text-[#5c3f3d]">
              Kategori belum dapat dimuat. Kamu tetap dapat membuka katalog Find Food.
            </p>
            <Link
              href="/find-food"
              className="mt-4 inline-flex text-sm font-bold text-[#980012]"
            >
              Buka Find Food
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}