import Link from "next/link";
import { CONTAINER_CLASS, loginWithRedirect } from "@/internal/lib/layout";

export function LandingFooter() {
  return (
    <footer
      style={{
        backgroundColor: "var(--color-text-primary)",
        borderTop: "1px solid var(--color-border)",
        color: "#e5e7eb",
      }}
    >
      <div className={CONTAINER_CLASS} style={{ paddingTop: "var(--space-12)", paddingBottom: "var(--space-8)" }}>
        <div className="grid md:grid-cols-3 gap-8" style={{ marginBottom: "var(--space-8)" }}>

          {/* Brand */}
          <div>
            <p style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-bold)", color: "white", marginBottom: "var(--space-2)" }}>
              🍽️ Atlas Food
            </p>
            <p style={{ fontSize: "var(--text-sm)", color: "#9ca3af", lineHeight: "var(--leading-relaxed)", margin: 0 }}>
              Estimasi porsi makan orang dewasa Indonesia — dikembangkan oleh BRIN bersama UPI.
            </p>
          </div>

          {/* Nav */}
          <div>
            <p style={{ fontWeight: "var(--weight-semibold)", color: "white", marginBottom: "var(--space-3)", fontSize: "var(--text-sm)" }}>
              Navigasi
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {[
                { href: loginWithRedirect("/find-food"), label: "Find Your Food" },
                { href: loginWithRedirect("/surveys"),   label: "Survey Recall"  },
                { href: "/register",                     label: "Daftar Akun"    },
              ].map((item) => (
                <li key={item.href}>
                  {/* CSS-only hover via .footer-nav-link — no event handlers */}
                  <Link href={item.href} className="footer-nav-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <p style={{ fontWeight: "var(--weight-semibold)", color: "white", marginBottom: "var(--space-3)", fontSize: "var(--text-sm)" }}>
              Tentang
            </p>
            <p style={{ fontSize: "var(--text-sm)", color: "#9ca3af", lineHeight: "var(--leading-relaxed)", margin: 0 }}>
              262+ hidangan · 13 kategori · Referensi visual terstandar untuk penelitian gizi dan tenaga kesehatan.
            </p>
          </div>

        </div>

        {/* Bottom */}
        <div
          style={{
            paddingTop: "var(--space-6)",
            borderTop: "1px solid #374151",
            textAlign: "center",
            fontSize: "var(--text-xs)",
            color: "#6b7280",
          }}
        >
          © {new Date().getFullYear()} Atlas Food · BRIN × UPI
        </div>
      </div>
    </footer>
  );
}
