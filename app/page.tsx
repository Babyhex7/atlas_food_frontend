import Link from "next/link";
import { LandingNavbar } from "@/internal/components/landing/LandingNavbar";
import { LandingHeroSearch } from "@/internal/components/landing/LandingHeroSearch";
import { LandingPaths } from "@/internal/components/landing/LandingPaths";
import { LandingFooter } from "@/internal/components/landing/LandingFooter";
import { CONTAINER_CLASS, loginWithRedirect } from "@/internal/lib/layout";
import { cn } from "@/internal/lib/cn";

const ATLAS_CATEGORIES = [
  { code: "MP",  name: "Makanan Pokok",   icon: "🍚" },
  { code: "LH",  name: "Lauk Hewani",     icon: "🍗" },
  { code: "LN",  name: "Lauk Nabati",     icon: "🫘" },
  { code: "AS",  name: "Aneka Sayur",     icon: "🥬" },
  { code: "AB",  name: "Aneka Buah",      icon: "🍌" },
  { code: "AP",  name: "Roti & Kue",      icon: "🥐" },
  { code: "AMK", name: "Makanan Kemasan", icon: "🥤" },
  { code: "KK",  name: "Keripik",         icon: "🥔" },
  { code: "ABK", name: "Bumbu",           icon: "🧂" },
  { code: "AK",  name: "Siap Saji",       icon: "🍱" },
  { code: "MDL", name: "Minyak & Lemak",  icon: "🫒" },
  { code: "GK",  name: "Gula",            icon: "🍬" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingNavbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-surface border-b border-border">
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none bg-[radial-gradient(var(--color-primary)_1.5px,transparent_1.5px)] bg-[length:28px_28px]" />
        {/* Glow blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-primary-light blur-[80px] opacity-60 pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[320px] h-[320px] rounded-full bg-primary-muted blur-[80px] opacity-40 pointer-events-none" />

        <div className={cn(CONTAINER_CLASS, "relative z-[1] text-center pt-16 pb-20")}>
          <span className="inline-flex items-center gap-2 py-1 px-4 rounded-full bg-primary-light border border-primary-border text-primary text-xs font-semibold mb-6 tracking-[0.05em]">
            BRIN × UPI · Referensi Estimasi Porsi
          </span>

          <h1 className="text-[clamp(2.25rem,6vw,4rem)] font-bold text-text-primary tracking-[-0.03em] leading-tight max-w-[760px] mx-auto mb-6">
            Atlas <span className="text-primary">Food</span>
          </h1>

          <p className="text-lg text-text-muted max-w-[540px] mx-auto mb-10 leading-relaxed">
            Platform komprehensif untuk survei recall gizi 24 jam dan ensiklopedia estimasi porsi makanan Indonesia.
          </p>

          <LandingHeroSearch />

          <p className="mt-5 text-xs text-text-muted font-mono">
            262+ hidangan · 13 kategori · Foto series &amp; range
          </p>
        </div>
      </section>

      {/* ── Category quick-browse ── */}
      <section className={cn(CONTAINER_CLASS, "pt-8 pb-4")}>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-text-primary m-0">
              Jelajah Kategori
            </h2>
            {/* CSS-only hover — no event handlers needed */}
            <Link href={loginWithRedirect("/find-food")} className="link-primary-hover">
              Lihat semua →
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {ATLAS_CATEGORIES.map((cat) => (
              <Link
                key={cat.code}
                href={loginWithRedirect(`/find-food/category/${cat.code}`)}
                className="landing-cat-link"
              >
                <span className="text-xl leading-none">{cat.icon}</span>
                <span className="text-xs font-mono font-semibold text-primary">
                  {cat.code}
                </span>
                <span className="text-xs text-text-muted leading-tight line-clamp-2 [display:-webkit-box] [-webkit-box-orient:vertical] overflow-hidden">
                  {cat.name}
                </span>
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
