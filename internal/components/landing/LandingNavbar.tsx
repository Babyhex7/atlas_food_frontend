"use client";

import Link from "next/link";
import { LogIn, UserPlus, Search } from "lucide-react";
import { useAuth } from "@/internal/domain/auth/hooks/useAuth";
import { useLogout } from "@/internal/domain/auth/hooks/useLogout";
import { CONTAINER_CLASS, loginWithRedirect } from "@/internal/lib/layout";

export function LandingNavbar() {
  const { isAuthenticated, user } = useAuth();
  const logout = useLogout();

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-xs)",
      }}
    >
      <div
        className={CONTAINER_CLASS}
        style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-4)" }}
      >
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
          <span style={{ fontSize: "1.5rem" }} aria-hidden>🍽️</span>
          <span
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

        {/* Nav links */}
        <nav className="hidden sm:flex" style={{ alignItems: "center", gap: "var(--space-6)" }}>
          <Link
            href={loginWithRedirect("/find-food")}
            style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-muted)", textDecoration: "none", transition: "var(--transition-fast)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-primary)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)"; }}
          >
            Cari Makanan
          </Link>
          <Link
            href={loginWithRedirect("/surveys")}
            style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-muted)", textDecoration: "none", transition: "var(--transition-fast)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-primary)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)"; }}
          >
            Survey Recall
          </Link>
        </nav>

        {/* Auth actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          {isAuthenticated ? (
            <>
              <Link
                href="/find-food"
                className="hidden sm:inline-flex"
                style={{
                  alignItems: "center",
                  gap: "var(--space-2)",
                  padding: "var(--space-2) var(--space-4)",
                  borderRadius: "var(--radius-full)",
                  border: "1.5px solid var(--color-primary)",
                  color: "var(--color-primary)",
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--weight-medium)",
                  textDecoration: "none",
                  transition: "var(--transition-fast)",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-primary-light)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
              >
                <Search size={15} />
                Find Food
              </Link>
              <Link
                href="/profile"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  padding: "var(--space-2) var(--space-4)",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: "var(--color-primary)",
                  border: "1.5px solid var(--color-primary)",
                  color: "white",
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--weight-semibold)",
                  textDecoration: "none",
                  transition: "var(--transition-base)",
                  boxShadow: "var(--shadow-sm)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-primary-hover)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-primary)"; }}
              >
                <UserPlus size={15} />
                <span className="hidden sm:inline">{user?.name?.split(" ")[0] ?? "Profil"}</span>
                <span className="sm:hidden">Profil</span>
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--weight-medium)",
                  color: "var(--color-text-muted)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "var(--space-2)",
                  transition: "var(--transition-fast)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-danger)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-muted)"; }}
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="hidden sm:inline-flex"
                style={{
                  alignItems: "center",
                  gap: "var(--space-2)",
                  padding: "var(--space-2) var(--space-4)",
                  borderRadius: "var(--radius-full)",
                  border: "1.5px solid var(--color-border)",
                  color: "var(--color-text-secondary)",
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--weight-medium)",
                  textDecoration: "none",
                  transition: "var(--transition-fast)",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--color-primary)"; (e.currentTarget as HTMLElement).style.color = "var(--color-primary)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)"; (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)"; }}
              >
                Daftar
              </Link>
              <Link
                href="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  padding: "var(--space-2) var(--space-5)",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: "var(--color-primary)",
                  border: "1.5px solid var(--color-primary)",
                  color: "white",
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--weight-semibold)",
                  textDecoration: "none",
                  transition: "var(--transition-base)",
                  boxShadow: "var(--shadow-sm)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-primary-hover)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-primary)"; }}
              >
                <LogIn size={15} />
                Masuk
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
