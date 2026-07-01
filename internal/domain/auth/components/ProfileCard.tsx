"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useLogout } from "../hooks/useLogout";
import { authRoles } from "../constants/authRoles";
import { Settings, Search } from "lucide-react";
import { Button } from "@/internal/pkg/components/Button";
import { AppHeader } from "@/internal/components/layout/AppHeader";
import { CONTAINER_CLASS } from "@/internal/lib/layout";
import { getAccessToken } from "@/internal/lib/cookies";

export function ProfileCard() {
  const { user, isAuthenticated } = useAuth();
  const logout = useLogout();

  const isLoading = !user && Boolean(getAccessToken());

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
          <p className="text-muted">Anda belum masuk.</p>
          <Link href="/login" className="text-primary font-medium hover:underline">
            Masuk ke akun
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <div className={`${CONTAINER_CLASS} py-10 flex-1`}>
        <div className="max-w-lg mx-auto">
          <div className="bg-surface rounded-2xl border border-border shadow-sm p-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-display font-bold text-primary mb-4">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">{user.name}</h1>
            <p className="text-muted text-sm mt-1">{user.email}</p>
            <span className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
              {user.role}
            </span>

            <div className="mt-8 space-y-2">
              {user.role === authRoles.admin && (
                <Link
                  href="/admin/surveys"
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors"
                >
                  <Settings className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Panel Admin</span>
                </Link>
              )}
              <Link
                href="/find-food"
                className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-accent/30 hover:bg-accent/5 transition-colors"
              >
                <Search className="w-5 h-5 text-accent-600" />
                <span className="text-sm font-medium">Find Your Food</span>
              </Link>
            </div>

            <Button variant="outline" className="w-full mt-8" onClick={() => logout()}>
              Keluar dari Akun
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
