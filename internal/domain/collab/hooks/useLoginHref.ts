"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { loginWithRedirect } from "@/internal/lib/layout";

/**
 * Link login yang membawa kembali ke halaman sekarang lengkap dengan query
 * (?room=&invite=) — tanpa itu, pengguna yang login dari undangan mendarat di
 * halaman kosong tanpa sesi.
 *
 * URL dibaca dari window, bukan useSearchParams, karena hook ini dipakai top
 * bar global: useSearchParams memaksa setiap halaman pemakainya punya batas
 * Suspense sendiri saat prerender. Render pertama tetap memakai pathname saja
 * supaya hasil server dan klien sama persis saat hidrasi.
 */
export function useLoginHref(): string {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  if (typeof window !== "undefined" && !mounted) {
    setMounted(true);
  }

  // pathname ikut dibaca agar hook ini dievaluasi ulang setiap pindah halaman.
  const target = mounted ? `${window.location.pathname}${window.location.search}` : pathname;

  return loginWithRedirect(target);
}
