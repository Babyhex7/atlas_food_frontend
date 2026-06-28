/** Konstanta nama cookie — satu sumber kebenaran */
export const COOKIE_KEYS = {
  ACCESS_TOKEN: "atlas_token",
  REFRESH_TOKEN: "atlas_refresh",
  BOOKMARKS: "atlas_bookmarks",
} as const;

const DEFAULT_ACCESS_MAX_AGE = 60 * 60 * 24; // 24 jam
const DEFAULT_REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 hari
const BOOKMARK_MAX_AGE = 60 * 60 * 24 * 365; // 1 tahun

function isBrowser(): boolean {
  return typeof document !== "undefined";
}

/** Bersihkan token lama dari localStorage (migrasi ke cookie) */
function clearLegacyAuthStorage(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("access_token");
  window.localStorage.removeItem("refresh_token");
}

function isSecureContext(): boolean {
  return isBrowser() && window.location.protocol === "https:";
}

function buildAttributes(maxAgeSeconds: number): string {
  const attrs = [`path=/`, `max-age=${maxAgeSeconds}`, `SameSite=Lax`];
  if (isSecureContext()) {
    attrs.push("Secure");
  }
  return attrs.join("; ");
}

export function getCookie(name: string): string | null {
  if (!isBrowser()) return null;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (!isBrowser()) return;
  document.cookie = `${name}=${encodeURIComponent(value)}; ${buildAttributes(maxAgeSeconds)}`;
}

export function deleteCookie(name: string): void {
  if (!isBrowser()) return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

// ─── Auth tokens ─────────────────────────────────────────────

export function getAccessToken(): string | null {
  return getCookie(COOKIE_KEYS.ACCESS_TOKEN);
}

export function getRefreshToken(): string | null {
  return getCookie(COOKIE_KEYS.REFRESH_TOKEN);
}

export function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  expiresInSeconds = DEFAULT_ACCESS_MAX_AGE
): void {
  clearLegacyAuthStorage();
  setCookie(COOKIE_KEYS.ACCESS_TOKEN, accessToken, expiresInSeconds);
  setCookie(COOKIE_KEYS.REFRESH_TOKEN, refreshToken, DEFAULT_REFRESH_MAX_AGE);
}

export function clearAuthCookies(): void {
  clearLegacyAuthStorage();
  deleteCookie(COOKIE_KEYS.ACCESS_TOKEN);
  deleteCookie(COOKIE_KEYS.REFRESH_TOKEN);
}

// ─── Bookmark makanan (Find Your Food) ───────────────────────

export function getBookmarkedFoodIds(): string[] {
  const raw = getCookie(COOKIE_KEYS.BOOKMARKS);
  if (!raw && isBrowser()) {
    // Migrasi bookmark dari localStorage lama
    const legacy = window.localStorage.getItem("atlas_bookmarked_foods");
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed)) {
          window.localStorage.removeItem("atlas_bookmarked_foods");
          setBookmarkedFoodIds(parsed.filter((id): id is string => typeof id === "string"));
          return parsed;
        }
      } catch {
        window.localStorage.removeItem("atlas_bookmarked_foods");
      }
    }
    return [];
  }
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function setBookmarkedFoodIds(ids: string[]): void {
  setCookie(COOKIE_KEYS.BOOKMARKS, JSON.stringify(ids), BOOKMARK_MAX_AGE);
}

export function toggleBookmarkedFood(foodId: string): boolean {
  const current = getBookmarkedFoodIds();
  const isBookmarked = current.includes(foodId);
  const next = isBookmarked ? current.filter((id) => id !== foodId) : [...current, foodId];
  setBookmarkedFoodIds(next);
  return !isBookmarked;
}

export function isFoodBookmarked(foodId: string): boolean {
  return getBookmarkedFoodIds().includes(foodId);
}
