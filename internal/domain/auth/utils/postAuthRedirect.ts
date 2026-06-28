import type { AuthRole } from "../constants/authRoles";

export function getPostAuthPath(role: AuthRole): string {
  return role === "admin" ? "/admin/surveys" : "/profile";
}

/** Validasi redirect URL internal — cegah open redirect */
export function getSafeRedirect(redirect: string | null, fallback: string): string {
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    return redirect;
  }
  return fallback;
}
