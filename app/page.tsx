import Link from "next/link";
import { LandingNavbar } from "@/internal/components/landing/LandingNavbar";
import { LandingHeroSearch } from "@/internal/components/landing/LandingHeroSearch";
import { LandingPaths } from "@/internal/components/landing/LandingPaths";
import { LandingFooter } from "@/internal/components/landing/LandingFooter";
import { CONTAINER_CLASS, loginWithRedirect } from "@/internal/lib/layout";

const ATLAS_CATEGORIES = [
  { code: "MP", name: "Makanan Pokok", icon: "🍚" },
  { code: "LH", name: "Lauk Hewani", icon: "🍗" },
  { code: "LN", name: "Lauk Nabati", icon: "🫘" },
  { code: "AS", name: "Aneka Sayur", icon: "🥬" },
  { code: "AB", name: "Aneka Buah", icon: "🍌" },
  { code: "AP", name: "Roti & Kue", icon: "🥐" },
  { code: "AMK", name: "Makanan Kemasan", icon: "🥤" },
  { code: "KK", name: "Keripik", icon: "🥔" },
  { code: "ABK", name: "Bumbu", icon: "🧂" },
  { code: "AK", name: "Siap Saji", icon: "🍱" },
  { code: "MDL", name: "Minyak & Lemak", icon: "🫒" },
  { code: "GK", name: "Gula", icon: "🍬" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(#1A5C38 2px, transparent 2px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

        <div className={`relative ${CONTAINER_CLASS} pt-16 pb-20 md:pt-24 md:pb-28 text-center`}>
          <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/15">
            BRIN × UPI · Referensi Estimasi Porsi
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-primary-900 tracking-tight text-balance max-w-4xl mx-auto">
            Atlas <span className="text-primary">Makananku</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted max-w-2xl mx-auto text-balance leading-relaxed">
            Platform komprehensif untuk survei recall gizi 24 jam dan ensiklopedia
            estimasi porsi makanan Indonesia.
          </p>

          <div className="mt-10">
            <LandingHeroSearch />
          </div>

          <p className="mt-6 text-sm text-muted font-mono">
            262+ hidangan · 13 kategori · Foto series & range
          </p>
        </div>
      </section>

      {/* Kategori cepat */}
      <section className={`${CONTAINER_CLASS} pb-8`}>
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Jelajah Kategori</h2>
            <Link
              href={loginWithRedirect("/find-food")}
              className="text-sm font-medium text-primary hover:text-primary-600 transition-colors"
            >
              Lihat semua →
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {ATLAS_CATEGORIES.map((cat) => (
              <Link
                key={cat.code}
                href={loginWithRedirect(`/find-food/category/${cat.code}`)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-center group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-[10px] sm:text-xs font-mono font-medium text-primary">{cat.code}</span>
                <span className="text-[10px] sm:text-xs text-muted leading-tight line-clamp-2">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <LandingPaths />
      <LandingFooter />
    </div>
  );
}
