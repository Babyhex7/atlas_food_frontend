"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "@/internal/domain/auth/hooks/useLogout";
import { ClipboardList, UtensilsCrossed, FolderOpen, Camera, Scale, LogOut } from "lucide-react";
import { cn } from "@/internal/lib/cn";

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
    <aside className="w-60 bg-surface border-r border-border flex flex-col h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-border gap-2">
        <Link href="/" className="text-lg font-bold text-primary no-underline tracking-tight">
          Atlas Food
        </Link>
        <span className="text-xs font-semibold font-mono bg-primary-light text-primary py-[1px] px-1.5 rounded-sm border border-primary-border">
          ADMIN
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 py-3 px-5 text-sm no-underline transition-fast border-r-2",
                active
                  ? "font-semibold text-primary bg-primary-light border-primary"
                  : "font-regular text-text-muted border-transparent hover:bg-surface-alt hover:text-text-primary"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <button
          type="button"
          onClick={() => logout()}
          className="w-full flex items-center gap-2 py-2 px-3 rounded-md text-sm font-medium text-text-muted bg-none border-none cursor-pointer transition-fast font-sans hover:text-danger hover:bg-danger-light"
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
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
