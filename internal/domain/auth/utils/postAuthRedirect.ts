import type { AuthRole } from "../constants/authRoles";

export function getPostAuthPath(role: AuthRole): string {
  // Admin masuk ke panel survey; responden default ke Find Your Food.
  // Hub Survey Recall tetap dapat diakses lewat menu "Survey Recall" di header.
  return role === "admin" ? "/admin/surveys" : "/find-food";
}

const BLOCKED_REDIRECT_PREFIXES = ["/login", "/register"];

/** Validasi redirect URL internal — cegah open redirect & loop auth */
export function getSafeRedirect(redirect: string | null, fallback: string): string {
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return fallback;
  }
  if (BLOCKED_REDIRECT_PREFIXES.some((p) => redirect === p || redirect.startsWith(`${p}?`))) {
    return fallback;
  }
  return redirect;
}
