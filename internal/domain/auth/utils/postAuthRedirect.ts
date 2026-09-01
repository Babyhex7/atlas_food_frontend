import type { AuthRole } from "../constants/authRoles";

export function getPostAuthPath(role: AuthRole): string {
  // Admin masuk ke panel survey; responden default ke Find Your Food.
  // Hub Survey Recall tetap dapat diakses lewat menu "Survey Recall" di header.
  return role === "admin" ? "/admin/surveys" : "/find-food";
}

const BLOCKED_REDIRECT_PREFIXES = ["/login", "/register"];

/** Validasi redirect URL internal — cegah open redirect, loop auth, & pelecehan RBAC */
export function getSafeRedirect(
  redirect: string | null,
  fallback: string,
  role?: AuthRole
): string {
  // Admin SELALU diarahkan ke Panel Admin (/admin/surveys) kecuali mengakses sub-halaman admin tertentu
  if (role === "admin") {
    if (redirect && redirect.startsWith("/admin")) {
      return redirect;
    }
    return "/admin/surveys";
  }

  // Respondent / Customer DILARANG masuk ke route /admin/
  if (role === "respondent" && redirect && redirect.startsWith("/admin")) {
    return "/profile";
  }

  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return fallback;
  }
  if (BLOCKED_REDIRECT_PREFIXES.some((p) => redirect === p || redirect.startsWith(`${p}?`))) {
    return fallback;
  }
  return redirect;
}
