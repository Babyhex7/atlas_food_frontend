"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  UtensilsCrossed,
} from "lucide-react";
import { useAuth } from "@/internal/domain/auth/hooks/useAuth";
import { useLogout } from "@/internal/domain/auth/hooks/useLogout";
import { cn } from "@/internal/lib/cn";

/**
 * Nav inti saja. Foto porsi, metode porsi, dan anotasi dikelola dari form
 * makanan — menu terpisah untuk itu hanya membuat dua jalan menuju data yang
 * sama (rutenya sendiri sudah diarahkan ulang ke /admin/foods).
 */
export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/surveys", label: "Survey", icon: ClipboardList },
  { href: "/admin/foods", label: "Makanan", icon: UtensilsCrossed },
  { href: "/admin/categories", label: "Kategori", icon: FolderOpen },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const logout = useLogout();
  const { user } = useAuth();

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <Link href="/" className="text-lg font-bold tracking-tight text-primary no-underline">
          Atlas Food
        </Link>
        <span className="rounded-sm border border-primary-border bg-primary-light px-1.5 py-px font-mono text-[10px] font-semibold text-primary">
          ADMIN
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
          // Dashboard hanya aktif pada path persis, kalau tidak ia akan ikut
          // menyala di seluruh /admin/*.
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 border-l-[3px] py-2.5 px-5 text-sm no-underline transition-fast",
                active
                  ? "border-primary bg-primary-light font-semibold text-primary"
                  : "border-transparent text-text-muted hover:bg-surface-alt hover:text-text-primary"
              )}
            >
              <Icon size={16} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 border-t border-border p-4">
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary"
        >
          {(user?.name ?? "A").charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-text-primary">
            {user?.name ?? "Admin"}
          </span>
          <span className="block text-xs text-text-muted">Administrator</span>
        </span>
        <button
          type="button"
          onClick={() => logout()}
          aria-label="Keluar dari akun"
          title="Keluar"
          className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-text-muted transition-fast hover:bg-danger-light hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <LogOut size={15} aria-hidden />
        </button>
      </div>
    </aside>
  );
}
