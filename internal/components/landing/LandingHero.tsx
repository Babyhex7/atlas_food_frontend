// [BARU] Hero Landing Page berdasarkan frame Figma 65:2871.
import Link from "next/link";
import { ArrowRight, ChevronRight, Search } from "lucide-react";
import { CONTAINER_CLASS } from "@/internal/lib/layout";

const FOOD_TILES = [
  { emoji: "🍚", label: "Nasi" },
  { emoji: "🍲", label: "Soto" },
  { emoji: "🍢", label: "Sate" },
  { emoji: "🥬", label: "Sayur" },
  { emoji: "🍜", label: "Mie" },
  { emoji: "🍌", label: "Buah" },
];

export function LandingHero() {
  return (
    <main
      id="beranda"
      className="overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(211,228,254,0.68),transparent_16%),#f8f9ff]"
    >
      {/* [DIUBAH] Hero mengikuti komposisi dua kolom pada frame Landing Page terbaru. */}
      <section
        className={`${CONTAINER_CLASS} grid min-h-[640px] items-center gap-12 py-32 lg:grid-cols-2 lg:gap-16 lg:py-28`}
      >
        <div className="max-w-[576px]">
          <h1 className="m-0 text-[clamp(2.8rem,5vw,4rem)] font-extrabold leading-[1.1] tracking-[-0.04em] text-[#0b1c30]">
            <span className="block text-[#98000c]">Atlas Food</span>
            <span className="block text-[clamp(2.25rem,3.75vw,3rem)]">
              Digitalisasi Estimasi
            </span>
            <span className="block text-[clamp(2.25rem,3.75vw,3rem)]">
              Porsi Makanan <span className="text-[#980012]">Nusantara</span>
            </span>
          </h1>

          <p className="mb-0 mt-8 max-w-[576px] text-base leading-7 text-[#5c3f3d] sm:text-lg sm:leading-[1.7]">
            Inovasi digital dari Atlas Makananku untuk mendukung akurasi survei
            konsumsi pangan nasional dengan visualisasi porsi presisi.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            {/* [DIUBAH] Find Food dapat diakses publik melalui route frontend yang sudah ada. */}
            <Link
              href="/find-food"
              className="inline-flex min-h-[58px] items-center justify-center gap-3 rounded-full bg-[#980012] px-8 text-base font-bold text-white no-underline shadow-[0_25px_50px_-12px_rgba(152,0,18,0.3)] transition-base hover:bg-primary-hover"
            >
              Jelajahi Atlas
              <ArrowRight size={18} aria-hidden />
            </Link>

            <Link
              href="#metodologi"
              className="inline-flex min-h-[58px] items-center justify-center rounded-full border border-[#916f6c] px-8 text-base font-bold text-[#0b1c30] no-underline transition-base hover:border-primary hover:bg-primary-light"
            >
              Pelajari Metodologi
            </Link>
          </div>
        </div>

        {/* [BARU] Showcase CSS mandiri agar halaman tidak bergantung pada URL aset Figma sementara. */}
        <div className="relative mx-auto w-full max-w-[620px]">
          <div className="absolute -inset-10 rounded-full bg-[#980012]/5 blur-3xl" />
          <div className="relative overflow-hidden rounded-[32px] border border-white/80 bg-white p-4 shadow-[0_10px_40px_-10px_rgba(11,28,48,0.16)] sm:p-5">
            <div className="flex items-center justify-between rounded-2xl bg-[#0b1c30] px-5 py-4 text-white">
              <div>
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[#f6c6ca]">
                  Atlas Makananku
                </p>
                <p className="m-1 text-lg font-bold">Pilih makanan Anda</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <Search size={18} aria-hidden />
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {FOOD_TILES.map((food) => (
                <div
                  key={food.label}
                  className="rounded-2xl border border-[#f0d8d6] bg-[#fffafa] p-3 text-center transition-base hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="block text-3xl" aria-hidden>
                    {food.emoji}
                  </span>
                  <span className="mt-2 block text-xs font-semibold text-[#0b1c30]">
                    {food.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-[#e6bdb9] bg-[#f8f9ff] p-4">
              <div className="flex items-center justify-between">
                <p className="m-0 text-sm font-bold text-[#0b1c30]">Estimasi porsi</p>
                <span className="rounded-full bg-[#980012] px-2.5 py-1 text-xs font-bold text-white">
                  150 g
                </span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-[#f6c6ca]" />
                <div className="flex-1">
                  <div className="h-2 w-[78%] rounded-full bg-[#980012]" />
                  <div className="mt-2 h-2 w-full rounded-full bg-[#e8edf5]" />
                </div>
                <ChevronRight size={18} className="text-[#980012]" aria-hidden />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}