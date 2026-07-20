"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { getAccessToken } from "@/internal/lib/cookies";

/**
 * Cookie bukan sumber data reaktif, jadi tidak ada yang perlu di-subscribe.
 * useSyncExternalStore dipakai murni karena ia membedakan snapshot server
 * dan klien: server selalu `null`, dan render hidrasi pertama juga `null`,
 * sehingga HTML server dan klien tidak pernah berbeda.
 */
const subscribeNoop = () => () => {};
const readTokenOnClient = () => Boolean(getAccessToken());
const readTokenOnServer = () => null;

/**
 * Gerbang role untuk seluruh route /admin/** (brief §3.1).
 *
 * Menunggu hidrasi sesi lebih dulu. AuthProvider memulihkan sesi lewat
 * /auth/me setelah refresh halaman, jadi pada render pertama `user` selalu
 * null meski admin sudah login — mengarahkan langsung akan menendang keluar
 * admin yang sah pada setiap reload.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();

  // Token ada tapi sesi belum termuat = masih hidrasi, bukan "tidak login".
  // `null` berarti belum diketahui (server / render hidrasi pertama).
  const hasToken = useSyncExternalStore(subscribeNoop, readTokenOnClient, readTokenOnServer);

  useEffect(() => {
    if (hasToken === null) return;

    if (!hasToken) {
      router.replace("/login");
      return;
    }

    // Sesi sudah termuat tapi bukan admin → keluar dari area admin
    if (user && user.role !== "admin") {
      router.replace("/profile");
    }
  }, [hasToken, user, router]);

  if (hasToken === null || (hasToken && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-text-muted">Memeriksa akses…</p>
      </div>
    );
  }

  if (!hasToken || (user && user.role !== "admin")) {
    return null;
  }

  return <>{children}</>;
}
