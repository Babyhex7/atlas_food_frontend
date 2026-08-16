import { Suspense, type ReactNode } from "react";
import { AdminSidebar } from "@/internal/components/admin/AdminSidebar";
import { AdminTopBar } from "@/internal/components/admin/AdminTopBar";
import { AdminGuard } from "@/internal/domain/auth/components/AdminGuard";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopBar />
          {/* Halaman daftar membaca ?q= dari URL, jadi butuh batas Suspense di
              atasnya agar rute admin tetap bisa diprerender. */}
          <main className="min-w-0 flex-1">
            <Suspense fallback={<div className="p-8 text-sm text-text-muted">Memuat…</div>}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
