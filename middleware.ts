import { NextResponse, type NextRequest } from "next/server";

const AUTH_ROUTES = ["/login", "/register"];
const PROTECTED_ROUTES = ["/surveys", "/profile", "/admin", "/find-food"];
const BLOCKED_REDIRECT_PREFIXES = ["/login", "/register"];

function isProtected(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/** Mirror getSafeRedirect — middleware tidak boleh import client util. */
function safeRedirectTarget(redirect: string | null, fallback: string): string {
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return fallback;
  }
  if (BLOCKED_REDIRECT_PREFIXES.some((p) => redirect === p || redirect.startsWith(`${p}?`))) {
    return fallback;
  }
  return redirect;
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("atlas_token")?.value;
  const { pathname, search } = request.nextUrl;

  if (isProtected(pathname) && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  // Sudah login tapi buka /login|/register: hormati ?redirect= (invite join),
  // jangan selalu buang ke /profile — itu yang bikin link undangan "hilang".
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route)) && token) {
    const redirect = request.nextUrl.searchParams.get("redirect");
    const target = safeRedirectTarget(redirect, "/profile");
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/find-food",
    "/find-food/:path*",
    "/surveys",
    "/surveys/:path*",
    "/profile",
    "/profile/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
