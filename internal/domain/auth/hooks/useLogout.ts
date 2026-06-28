"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";

/** Logout terpusat: hapus cookie + state, redirect ke beranda */
export function useLogout() {
  const clearSession = useAuthStore((state) => state.clearSession);
  const router = useRouter();

  return useCallback(() => {
    clearSession();
    router.replace("/");
    router.refresh();
  }, [clearSession, router]);
}
