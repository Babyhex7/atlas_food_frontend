import Link from "next/link";
import { ArrowRight, Search, ClipboardList, Lock } from "lucide-react";
import { loginWithRedirect } from "@/internal/lib/layout";

export function LandingPaths() {
  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "var(--space-16) var(--space-6)", width: "100%" }}>
      {/* Heading */}
      <div style={{ textAlign: "center", marginBottom: "var(--space-10)" }}>
        <h2
          style={{
            fontSize: "var(--text-2xl)",
            fontWeight: "var(--weight-bold)",
            color: "var(--color-text-primary)",
            margin: "0 0 var(--space-2)",
          }}
        >
          Pilih Cara Menggunakan Atlas
        </h2>
        <p style={{ fontSize: "var(--text-base)", color: "var(--color-text-muted)", margin: 0 }}>
          Kedua fitur memerlukan akun — masuk atau daftar terlebih dahulu untuk mulai.
        </p>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-2" style={{ gap: "var(--space-6)" }}>

        {/* Survey card */}
        <div className="card card-hover" style={{ padding: "var(--space-8)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "var(--space-4)", right: "var(--space-4)" }}>
            <span className="badge badge-primary" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Lock size={10} />
              Login Diperlukan
            </span>
          </div>
          <div style={{ position: "absolute", top: 0, right: 0, padding: "var(--space-8)", opacity: 0.04, pointerEvents: "none" }}>
            <ClipboardList size={144} style={{ color: "var(--color-primary)" }} />
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                width: 56, height: 56,
                backgroundColor: "var(--color-primary-light)",
                borderRadius: "var(--radius-xl)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "var(--space-5)",
                color: "var(--color-primary)",
              }}
            >
              <ClipboardList size={28} />
            </div>
            <h3 style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-bold)", color: "var(--color-text-primary)", margin: "0 0 var(--space-3)" }}>
              Survey Recall 24 Jam
            </h3>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", lineHeight: "var(--leading-relaxed)", margin: "0 0 var(--space-8)" }}>
              Ikuti survei asupan makanan harian Anda. Sistem membantu memperkirakan porsi dan menghitung nilai gizi secara akurat untuk keperluan riset gizi.
            </p>
            {/* CSS-only hover via .btn-cta-primary — no event handlers */}
            <Link href={loginWithRedirect("/surveys")} className="btn-cta-primary">
              Mulai Survey
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Find Food card */}
        <div className="card card-hover" style={{ padding: "var(--space-8)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "var(--space-4)", right: "var(--space-4)" }}>
            <span className="badge badge-primary" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Lock size={10} />
              Login Diperlukan
            </span>
          </div>
          <div style={{ position: "absolute", top: 0, right: 0, padding: "var(--space-8)", opacity: 0.04, pointerEvents: "none" }}>
            <Search size={144} style={{ color: "var(--color-primary)" }} />
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                width: 56, height: 56,
                backgroundColor: "var(--color-primary-light)",
                borderRadius: "var(--radius-xl)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "var(--space-5)",
                color: "var(--color-primary)",
              }}
            >
              <Search size={28} />
            </div>
            <h3 style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-bold)", color: "var(--color-text-primary)", margin: "0 0 var(--space-3)" }}>
              Find Your Food
            </h3>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", lineHeight: "var(--leading-relaxed)", margin: "0 0 var(--space-8)" }}>
              Cari estimasi ukuran porsi dan kandungan gizi dari ratusan jenis makanan khas Indonesia — referensi visual Atlas Food BRIN × UPI.
            </p>
            {/* CSS-only hover via .btn-cta-primary — no event handlers */}
            <Link href={loginWithRedirect("/find-food")} className="btn-cta-primary">
              Cari Makanan
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
