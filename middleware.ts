import { NextResponse, type NextRequest } from "next/server";

const AUTH_ROUTES = ["/login", "/register"];
const PROTECTED_ROUTES = ["/surveys", "/profile", "/admin", "/find-food"];
const ADMIN_ROUTES = ["/admin"];
const BLOCKED_REDIRECT_PREFIXES = ["/login", "/register"];

function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isProtected(pathname: string): boolean {
  return matchesRoute(pathname, PROTECTED_ROUTES);
}

function isAdminRoute(pathname: string): boolean {
  return matchesRoute(pathname, ADMIN_ROUTES);
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

/**
 * Baca klaim JWT tanpa memverifikasi tanda tangannya.
 *
 * Ini SENGAJA tidak memverifikasi: middleware tidak memegang JWT secret, dan
 * verifikasi sesungguhnya memang tugas backend (setiap route /admin di API
 * dilindungi AdminOnly). Fungsinya murni untuk pengarahan halaman — supaya
 * responden tidak melihat kerangka CMS admin yang lalu memuntahkan 403 di
 * setiap panggilan datanya. Klaim di sini tidak boleh dipakai sebagai dasar
 * keputusan keamanan apa pun.
 */
function readTokenClaims(token: string): { role?: string; exp?: number } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

/** true kalau klaim exp sudah lewat (toleransi 0 — backend yang menentukan final). */
function isExpired(claims: { exp?: number } | null): boolean {
  if (!claims?.exp) return false;
  return claims.exp * 1000 <= Date.now();
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("atlas_token")?.value;
  const { pathname, search } = request.nextUrl;

  const claims = token ? readTokenClaims(token) : null;
  // Token yang sudah kedaluwarsa diperlakukan sebagai tidak ada. Tanpa ini,
  // user "lolos" middleware lalu setiap request datanya balas 401.
  const hasValidSession = Boolean(token) && !isExpired(claims);

  if (isProtected(pathname) && !hasValidSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  // Responden tidak punya urusan di CMS admin. Backend sudah menolak datanya,
  // tapi tanpa pengalihan ini mereka melihat halaman admin kosong penuh error.
  if (isAdminRoute(pathname) && hasValidSession && claims?.role !== "admin") {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  // Sudah login tapi buka /login|/register: hormati ?redirect= (invite join),
  // jangan selalu buang ke /profile — itu yang bikin link undangan "hilang".
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route)) && hasValidSession) {
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
    // "/admin" ikut didaftarkan: matcher ":path*" saja tidak mencakup path
    // persis "/admin", sehingga halaman index CMS lolos tanpa pemeriksaan.
    "/admin",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
