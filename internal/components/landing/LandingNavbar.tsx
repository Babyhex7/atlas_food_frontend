"use client";

import Link from "next/link";
import { LogIn, UserPlus, Search } from "lucide-react";
import { useAuth } from "@/internal/domain/auth/hooks/useAuth";
import { useLogout } from "@/internal/domain/auth/hooks/useLogout";
import { CONTAINER_CLASS, loginWithRedirect } from "@/internal/lib/layout";

const NAV_LINK_CLASS = "text-sm font-medium text-text-muted no-underline transition-fast hover:text-primary";

export function LandingNavbar() {
  const { isAuthenticated, user } = useAuth();
  const logout = useLogout();

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border shadow-xs">
      <div className={`${CONTAINER_CLASS} h-16 flex items-center justify-between gap-4`}>
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 no-underline shrink-0">
          <span className="text-2xl" aria-hidden>🍽️</span>
          <span className="text-lg font-bold text-primary tracking-tight">Atlas Food</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-6">
          <Link href={loginWithRedirect("/find-food")} className={NAV_LINK_CLASS}>
            Cari Makanan
          </Link>
          <Link href={loginWithRedirect("/surveys")} className={NAV_LINK_CLASS}>
            Survey Recall
          </Link>
        </nav>

        {/* Auth actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link
                href="/find-food"
                className="hidden sm:inline-flex items-center gap-2 py-2 px-4 rounded-full border-[1.5px] border-primary text-primary text-sm font-medium no-underline transition-fast bg-transparent hover:bg-primary-light"
              >
                <Search size={15} />
                Find Food
              </Link>
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-primary border-[1.5px] border-primary text-white text-sm font-semibold no-underline transition-base shadow-sm hover:bg-primary-hover"
              >
                <UserPlus size={15} />
                <span className="hidden sm:inline">{user?.name?.split(" ")[0] ?? "Profil"}</span>
                <span className="sm:hidden">Profil</span>
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="text-sm font-medium text-text-muted bg-none border-none cursor-pointer p-2 transition-fast hover:text-danger"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="hidden sm:inline-flex items-center gap-2 py-2 px-4 rounded-full border-[1.5px] border-border text-text-secondary text-sm font-medium no-underline transition-fast bg-transparent hover:border-primary hover:text-primary"
              >
                Daftar
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-primary border-[1.5px] border-primary text-white text-sm font-semibold no-underline transition-base shadow-sm hover:bg-primary-hover"
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
