/** Lebar kontainer konsisten di seluruh aplikasi */
export const CONTAINER_CLASS = "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full";

/** Path login dengan redirect aman */
export function loginWithRedirect(targetPath: string): string {
  return `/login?redirect=${encodeURIComponent(targetPath)}`;
}
