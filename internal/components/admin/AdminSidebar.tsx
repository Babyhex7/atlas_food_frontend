"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  FolderOpen,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  UtensilsCrossed,
} from "lucide-react";
import { useAuth } from "@/internal/domain/auth/hooks/useAuth";
import { useLogout } from "@/internal/domain/auth/hooks/useLogout";
import { cn } from "@/internal/lib/cn";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export type AdminNavGroup = {
  label: string;
  items: AdminNavItem[];
};

const NAV_GROUPS: AdminNavGroup[] = [
  {
    label: "Main",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/surveys", label: "Survey", icon: ClipboardList },
    ],
  },
  {
    label: "Data",
    items: [
      { href: "/admin/foods", label: "Makanan", icon: UtensilsCrossed },
      { href: "/admin/categories", label: "Kategori", icon: FolderOpen },
      { href: "/admin/annotations", label: "Anotasi", icon: ImageIcon },
    ],
  },
];

// Still export ADMIN_NAV for any consumers that flatten nav items
export const ADMIN_NAV: AdminNavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export function AdminSidebar() {
  const pathname = usePathname();
  const logout = useLogout();
  const { user } = useAuth();

  return (
    <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-border bg-surface">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
        <Link
          href="/"
          className="text-[15px] font-bold tracking-tight text-text-primary no-underline"
        >
          Atlas Food
        </Link>
        <span className="rounded border border-border bg-surface-alt px-1.5 py-px font-mono text-[9px] font-semibold uppercase tracking-wider text-text-muted">
          Admin
        </span>
      </div>

      {/* Nav groups */}
      <nav aria-label="Admin navigation" className="flex-1 overflow-y-auto py-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-4">
            <span className="mb-1 block px-4 text-[10px] font-semibold uppercase tracking-widest text-text-muted/70">
              {group.label}
            </span>
            {group.items.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-2.5 mx-2 my-px rounded-md px-3 py-2 text-sm no-underline transition-fast",
                    active
                      ? "bg-primary-light font-semibold text-primary"
                      : "font-medium text-text-muted hover:bg-surface-alt hover:text-text-primary"
                  )}
                >
                  <Icon
                    size={14}
                    aria-hidden
                    className={cn(
                      "shrink-0",
                      active ? "text-primary" : "text-text-muted group-hover:text-text-primary"
                    )}
                  />
                  <span className="leading-none">{label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="flex items-center gap-2.5 border-t border-border p-3">
        <span
          aria-hidden
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-[11px] font-bold text-primary"
        >
          {(user?.name ?? "A").charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold leading-tight text-text-primary">
            {user?.name ?? "Admin"}
          </span>
          <span className="block text-[11px] leading-tight text-text-muted">Administrator</span>
        </span>
        <button
          type="button"
          onClick={() => logout()}
          aria-label="Keluar dari akun"
          title="Keluar"
          className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-text-muted transition-fast hover:bg-danger-light hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
        >
          <LogOut size={13} aria-hidden />
        </button>
      </div>
    </aside>
  );
}
