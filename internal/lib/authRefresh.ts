import {
  clearAuthCookies,
  getRefreshToken,
  setAuthCookies,
} from "@/internal/lib/cookies";

export const API_BASE_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080/api/v1";

/**
 * Refresh token backend bersifat SEKALI PAKAI: begitu dipakai, barisnya dihapus
 * dari database. Kalau beberapa request 401 berbarengan lalu masing-masing
 * menembak /auth/refresh dengan token yang sama, hanya yang pertama berhasil —
 * sisanya ditolak dan melempar user ke halaman login di tengah pengisian recall.
 *
 * Promise ini membuat refresh berjalan satu kali; pemanggil lain ikut menunggu
 * hasil yang sama. Sengaja ditaruh di modul tersendiri supaya klien axios dan
 * klien fetch berbagi antrean yang sama — dua antrean terpisah akan saling
 * membatalkan refresh masing-masing.
 */
let refreshPromise: Promise<string> | null = null;

async function performRefresh(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    throw new Error(`Refresh gagal (status ${response.status})`);
  }

  const payload = await response.json().catch(() => null);
  const accessToken: string | undefined = payload?.data?.access_token;
  const newRefreshToken: string | undefined = payload?.data?.refresh_token;
  if (!accessToken || !newRefreshToken) {
    throw new Error("Respons refresh token tidak lengkap");
  }

  // expires_in mencerminkan TTL JWT sebenarnya dari backend; 86400 hanya
  // dipakai kalau backend lama tidak mengirimkannya.
  const expiresIn: number = payload?.data?.expires_in ?? 86400;
  setAuthCookies(accessToken, newRefreshToken, expiresIn);
  return accessToken;
}

/** Jalankan refresh, atau ikut menunggu refresh yang sedang berjalan. */
export function refreshOnce(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/** Buang sesi lalu arahkan ke login sambil menyimpan halaman asal. */
export function redirectToLogin(): void {
  clearAuthCookies();
  if (typeof window === "undefined") return;

  // Jangan looping kalau kita memang sudah berada di halaman login.
  if (window.location.pathname.startsWith("/login")) return;

  const redirect = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.href = `/login?redirect=${redirect}`;
}
