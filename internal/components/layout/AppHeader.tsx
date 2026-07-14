"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User, LogOut } from "lucide-react";
import { useAuth } from "@/internal/domain/auth/hooks/useAuth";
import { useLogout } from "@/internal/domain/auth/hooks/useLogout";
import { CONTAINER_CLASS } from "@/internal/lib/layout";

export function AppHeader() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const logout = useLogout();

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-xs)",
      }}
    >
      <div className={`${CONTAINER_CLASS}`} style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-4)" }}>
        {/* Brand */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          {/* SVG icon — avoids emoji rendering differences across OS */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color: "var(--color-primary)", flexShrink: 0 }}>
            <path d="M18 2h-1a3 3 0 0 0-3 3v7h4V5a3 3 0 0 0 0-3Z" fill="currentColor" opacity=".25"/>
            <path d="M18 2h-1a3 3 0 0 0-3 3v4h4V2Z" fill="currentColor"/>
            <rect x="14" y="12" width="4" height="10" rx="1" fill="currentColor" opacity=".5"/>
            <path d="M3 3a1 1 0 0 0-1 1v4a5 5 0 0 0 4 4.9V21a1 1 0 0 0 2 0v-8.1A5 5 0 0 0 12 8V4a1 1 0 0 0-1-1H3Z" fill="currentColor"/>
          </svg>
          <span
            className="hidden sm:inline"
            style={{
              fontSize: "var(--text-lg)",
              fontWeight: "var(--weight-bold)",
              color: "var(--color-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Atlas Food
          </span>
        </Link>

        {/* Nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
          {[
            { href: "/find-food", icon: <Search size={15} />, label: "Find Your Food" },
            { href: "/profile",   icon: <User  size={15} />, label: "Profil"         },
          ].map(({ href, icon, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "var(--space-1)",
                  fontSize: "var(--text-sm)",
                  fontWeight: active ? "var(--weight-semibold)" : "var(--weight-medium)",
                  color: active ? "var(--color-primary)" : "var(--color-text-muted)",
                  textDecoration: "none",
                  padding: "var(--space-2) var(--space-3)",
                  borderRadius: "var(--radius-full)",
                  transition: "var(--transition-fast)",
                  backgroundColor: active ? "var(--color-primary-light)" : "transparent",
                  border: active ? "1.5px solid var(--color-primary-border)" : "1.5px solid transparent",
                }}
              >
                {icon}
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Auth */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexShrink: 0 }}>
          {isAuthenticated && user ? (
            <>
              <span
                className="hidden md:inline"
                style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {user.name}
              </span>
              <button
                type="button"
                onClick={logout}
                aria-label="Keluar dari akun"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "var(--space-1)",
                  padding: "var(--space-2) var(--space-3)",
                  borderRadius: "var(--radius-md)",
                  border: "1.5px solid var(--color-danger-border)",
                  background: "transparent",
                  color: "var(--color-danger)",
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--weight-medium)",
                  cursor: "pointer",
                  transition: "var(--transition-fast)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-danger-light)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-1)",
                padding: "var(--space-2) var(--space-4)",
                borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--color-primary)",
                background: "transparent",
                color: "var(--color-primary)",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--weight-medium)",
                textDecoration: "none",
                transition: "var(--transition-fast)",
              }}
            >
              <User size={15} />
              <span className="hidden sm:inline">Masuk</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
