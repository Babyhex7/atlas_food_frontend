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

  const navLinkClass = (href: string) =>
    `text-sm font-medium transition-colors ${
      pathname.startsWith(href) ? "text-primary" : "text-muted hover:text-primary"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-surface/95 backdrop-blur-md">
      <div className={`${CONTAINER_CLASS} h-16 flex items-center justify-between gap-4`}>
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <span className="text-xl" aria-hidden>
            🍽️
          </span>
          <span className="font-display text-lg font-bold text-primary-900 group-hover:text-primary transition-colors hidden sm:inline">
            Atlas Makananku
          </span>
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6">
          <Link href="/find-food" className={navLinkClass("/find-food")}>
            <span className="inline-flex items-center gap-1.5">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Find Your Food</span>
            </span>
          </Link>
          <Link href="/profile" className={navLinkClass("/profile")}>
            <span className="inline-flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profil</span>
            </span>
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isAuthenticated && user && (
            <span className="hidden md:inline text-sm text-muted truncate max-w-[140px]">
              {user.name}
            </span>
          )}
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
            aria-label="Keluar dari akun"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
