"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User, LogOut } from "lucide-react";
import { useAuth } from "@/internal/domain/auth/hooks/useAuth";
import { useLogout } from "@/internal/domain/auth/hooks/useLogout";
import { CONTAINER_CLASS } from "@/internal/lib/layout";
import { cn } from "@/internal/lib/cn";

const NAV_ITEMS = [
  { href: "/find-food", icon: Search, label: "Find Your Food" },
  { href: "/profile", icon: User, label: "Profil" },
];

export function AppHeader() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const logout = useLogout();

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border shadow-xs">
      <div className={`${CONTAINER_CLASS} h-16 flex items-center justify-between gap-4`}>
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 no-underline shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-primary shrink-0">
            <path d="M18 2h-1a3 3 0 0 0-3 3v7h4V5a3 3 0 0 0 0-3Z" fill="currentColor" opacity=".25" />
            <path d="M18 2h-1a3 3 0 0 0-3 3v4h4V2Z" fill="currentColor" />
            <rect x="14" y="12" width="4" height="10" rx="1" fill="currentColor" opacity=".5" />
            <path d="M3 3a1 1 0 0 0-1 1v4a5 5 0 0 0 4 4.9V21a1 1 0 0 0 2 0v-8.1A5 5 0 0 0 12 8V4a1 1 0 0 0-1-1H3Z" fill="currentColor" />
          </svg>
          <span className="hidden sm:inline text-lg font-bold text-primary tracking-tight">Atlas Food</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-flex items-center gap-1 text-sm py-2 px-3 rounded-full no-underline transition-fast border-[1.5px] border-transparent",
                  active
                    ? "font-semibold text-primary bg-primary-light border-primary-border"
                    : "font-medium text-text-muted"
                )}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-2 shrink-0">
          {isAuthenticated && user ? (
            <>
              <span className="hidden md:inline text-sm text-text-muted max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap">
                {user.name}
              </span>
              <button
                type="button"
                onClick={logout}
                aria-label="Keluar dari akun"
                className="inline-flex items-center gap-1 py-2 px-3 rounded-md border-[1.5px] border-danger-border bg-transparent text-danger text-sm font-medium cursor-pointer transition-fast hover:bg-danger-light"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1 py-2 px-4 rounded-md border-[1.5px] border-primary bg-transparent text-primary text-sm font-medium no-underline transition-fast"
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
