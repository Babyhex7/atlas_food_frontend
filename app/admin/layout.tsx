"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLogout } from "@/internal/domain/auth/hooks/useLogout";

const NAV_ITEMS = [
  { href: "/admin/surveys", label: "Survey", icon: "📋" },
  { href: "/admin/foods", label: "Makanan", icon: "🍽️" },
  { href: "/admin/categories", label: "Kategori", icon: "📂" },
  { href: "/admin/as-served-sets", label: "Foto Porsi", icon: "📸" },
  { href: "/admin/portion-methods", label: "Metode Porsi", icon: "⚖️" },
];

function AdminSidebar() {
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <aside className="w-60 bg-white border-r border-border flex flex-col h-screen sticky top-0 flex-shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/" className="text-primary font-bold text-lg tracking-tight">
          Atlas Food
        </Link>
        <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">ADMIN</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                isActive
                  ? "bg-primary/8 text-primary font-medium border-r-2 border-primary"
                  : "text-muted hover:text-foreground hover:bg-gray-50"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <button
          type="button"
          onClick={() => logout()}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
