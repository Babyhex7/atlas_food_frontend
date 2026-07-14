"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLogout } from "@/internal/domain/auth/hooks/useLogout";
import { ClipboardList, UtensilsCrossed, FolderOpen, Camera, Scale, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/surveys",        label: "Survey",        icon: ClipboardList  },
  { href: "/admin/foods",          label: "Makanan",       icon: UtensilsCrossed },
  { href: "/admin/categories",     label: "Kategori",      icon: FolderOpen     },
  { href: "/admin/as-served-sets", label: "Foto Porsi",    icon: Camera         },
  { href: "/admin/portion-methods",label: "Metode Porsi",  icon: Scale          },
];

function AdminSidebar() {
  const pathname = usePathname();
  const logout   = useLogout();

  return (
    <aside
      style={{
        width: 240,
        backgroundColor: "var(--color-surface)",
        borderRight: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          padding: "0 var(--space-5)",
          borderBottom: "1px solid var(--color-border)",
          gap: "var(--space-2)",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: "var(--weight-bold)",
            color: "var(--color-primary)",
            textDecoration: "none",
            letterSpacing: "-0.02em",
          }}
        >
          Atlas Food
        </Link>
        <span
          style={{
            fontSize: "var(--text-xs)",
            fontFamily: "var(--font-mono)",
            fontWeight: "var(--weight-semibold)",
            backgroundColor: "var(--color-primary-light)",
            color: "var(--color-primary)",
            padding: "1px 6px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-primary-border)",
          }}
        >
          ADMIN
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "var(--space-3) 0" }}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
                padding: "var(--space-3) var(--space-5)",
                fontSize: "var(--text-sm)",
                fontWeight: active ? "var(--weight-semibold)" : "var(--weight-regular)",
                color: active ? "var(--color-primary)" : "var(--color-text-muted)",
                backgroundColor: active ? "var(--color-primary-light)" : "transparent",
                borderRight: active ? "2px solid var(--color-primary)" : "2px solid transparent",
                textDecoration: "none",
                transition: "var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  const el = e.currentTarget as HTMLElement;
                  el.style.backgroundColor = "var(--color-surface-alt)";
                  el.style.color = "var(--color-text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  const el = e.currentTarget as HTMLElement;
                  el.style.backgroundColor = "transparent";
                  el.style.color = "var(--color-text-muted)";
                }
              }}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "var(--space-4)", borderTop: "1px solid var(--color-border)" }}>
        <button
          type="button"
          onClick={() => logout()}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "var(--space-2) var(--space-3)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-sm)",
            fontWeight: "var(--weight-medium)",
            color: "var(--color-text-muted)",
            background: "none",
            border: "none",
            cursor: "pointer",
            transition: "var(--transition-fast)",
            fontFamily: "var(--font-sans)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--color-danger)";
            e.currentTarget.style.backgroundColor = "var(--color-danger-light)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--color-text-muted)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", backgroundColor: "var(--color-bg)" }}>
      <AdminSidebar />
      <main style={{ flex: 1, overflowY: "auto", minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}
