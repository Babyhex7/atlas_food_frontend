"use client";

import Link from "next/link";
import { Search, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/internal/domain/auth/hooks/useAuth";
import { useLogout } from "@/internal/domain/auth/hooks/useLogout";
import { CONTAINER_CLASS, loginWithRedirect } from "@/internal/lib/layout";

export function LandingNavbar() {
  const { isAuthenticated, user } = useAuth();
  const logout = useLogout();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className={`${CONTAINER_CLASS} h-16 flex items-center justify-between gap-4`}>
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <span className="text-2xl" aria-hidden>
            🍽️
          </span>
          <span className="font-display text-xl font-bold text-primary-900 group-hover:text-primary transition-colors">
            Atlas Makananku
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-muted">
          <Link href={loginWithRedirect("/find-food")} className="hover:text-primary transition-colors">
            Cari Makanan
          </Link>
          <Link href={loginWithRedirect("/surveys")} className="hover:text-primary transition-colors">
            Survey Recall
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link
                href="/find-food"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-primary border border-primary/20 hover:bg-primary/5 transition-colors"
              >
                <Search className="w-4 h-4" />
                Find Your Food
              </Link>
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary-600 transition-colors shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">{user?.name?.split(" ")[0] ?? "Profil"}</span>
                <span className="sm:hidden">Profil</span>
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="text-sm text-muted hover:text-red-600 px-2 transition-colors"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-primary border border-primary/20 hover:bg-primary/5 transition-colors"
              >
                Daftar
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary-600 transition-colors shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                Masuk
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
