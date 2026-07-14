import Link from "next/link";
import { LandingNavbar } from "@/internal/components/landing/LandingNavbar";
import { LandingHeroSearch } from "@/internal/components/landing/LandingHeroSearch";
import { LandingPaths } from "@/internal/components/landing/LandingPaths";
import { LandingFooter } from "@/internal/components/landing/LandingFooter";
import { CONTAINER_CLASS, loginWithRedirect } from "@/internal/lib/layout";

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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--color-bg)" }}>
      <LandingNavbar />

      {/* ── Hero ── */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        {/* Dot pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.035,
            backgroundImage: "radial-gradient(var(--color-primary) 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
            pointerEvents: "none",
          }}
        />
        {/* Glow blobs */}
        <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: "var(--color-primary-light)", filter: "blur(80px)", opacity: 0.6, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: 320, height: 320, borderRadius: "50%", background: "var(--color-primary-muted)", filter: "blur(80px)", opacity: 0.4, pointerEvents: "none" }} />

        <div
          className={CONTAINER_CLASS}
          style={{ position: "relative", zIndex: 1, textAlign: "center", paddingTop: "var(--space-16)", paddingBottom: "5rem" }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
              padding: "var(--space-1) var(--space-4)",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--color-primary-light)",
              border: "1px solid var(--color-primary-border)",
              color: "var(--color-primary)",
              fontSize: "var(--text-xs)",
              fontWeight: "var(--weight-semibold)",
              marginBottom: "var(--space-6)",
              letterSpacing: "0.05em",
            }}
          >
            BRIN × UPI · Referensi Estimasi Porsi
          </span>

          <h1
            style={{
              fontSize: "clamp(2.25rem, 6vw, 4rem)",
              fontWeight: "var(--weight-bold)",
              color: "var(--color-text-primary)",
              letterSpacing: "-0.03em",
              lineHeight: "var(--leading-tight)",
              maxWidth: 760,
              margin: "0 auto var(--space-6)",
            }}
          >
            Atlas <span style={{ color: "var(--color-primary)" }}>Food</span>
          </h1>

          <p
            style={{
              fontSize: "var(--text-lg)",
              color: "var(--color-text-muted)",
              maxWidth: 540,
              margin: "0 auto var(--space-10)",
              lineHeight: "var(--leading-relaxed)",
            }}
          >
            Platform komprehensif untuk survei recall gizi 24 jam dan ensiklopedia estimasi porsi makanan Indonesia.
          </p>

          <LandingHeroSearch />

          <p style={{ marginTop: "var(--space-5)", fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
            262+ hidangan · 13 kategori · Foto series &amp; range
          </p>
        </div>
      </section>

      {/* ── Category quick-browse ── */}
      <section className={CONTAINER_CLASS} style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-4)" }}>
        <div className="card" style={{ padding: "var(--space-6)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-5)" }}>
            <h2 style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)", margin: 0 }}>
              Jelajah Kategori
            </h2>
            {/* CSS-only hover — no event handlers needed */}
            <Link href={loginWithRedirect("/find-food")} className="link-primary-hover">
              Lihat semua →
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6" style={{ gap: "var(--space-3)" }}>
            {ATLAS_CATEGORIES.map((cat) => (
              <Link
                key={cat.code}
                href={loginWithRedirect(`/find-food/category/${cat.code}`)}
                className="landing-cat-link"
              >
                <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>{cat.icon}</span>
                <span
                  style={{
                    fontSize: "var(--text-xs)",
                    fontFamily: "var(--font-mono)",
                    fontWeight: "var(--weight-semibold)",
                    color: "var(--color-primary)",
                  }}
                >
                  {cat.code}
                </span>
                <span
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--color-text-muted)",
                    lineHeight: "var(--leading-tight)",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
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
