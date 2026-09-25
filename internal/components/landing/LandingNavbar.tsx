"use client";

import Link from "next/link";
import { Menu, UtensilsCrossed, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/internal/domain/auth/hooks/useAuth";
import { useLogout } from "@/internal/domain/auth/hooks/useLogout";
import { CONTAINER_CLASS } from "@/internal/lib/layout";

const NAV_ITEMS = [
  { href: "#beranda", label: "Beranda" },
  { href: "#kategori", label: "Kategori" },
  { href: "#metodologi", label: "Metodologi" },
  { href: "#tim-peneliti", label: "Tim Peneliti" },
];

export function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const logout = useLogout();

  const closeMenu = () => setIsMenuOpen(false);

  return (
    // [DIUBAH] TopNavBar mengikuti struktur frame 65:3307 dan tetap responsif.
    <header className="sticky top-0 z-50 border-b border-[#e6bdb9]/20 bg-white/85 backdrop-blur-md">
      <div className={`${CONTAINER_CLASS} flex h-20 items-center justify-between gap-4 lg:h-24`}>
        <Link
          href="#beranda"
          onClick={closeMenu}
          className="flex shrink-0 items-center gap-3 no-underline"
          aria-label="Atlas Food"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#980012] text-white shadow-[0_10px_20px_rgba(152,0,18,0.2)]">
            <UtensilsCrossed size={20} aria-hidden />
          </span>
          <span>
            <span className="block text-lg font-extrabold leading-none tracking-[-0.04em] text-[#980012]">
              Atlas Food
            </span>
            <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-[#5c3f3d]">
              Atlas Makananku
            </span>
          </span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-7 xl:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-[#5c3f3d] no-underline transition-fast hover:text-[#980012]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          {isAuthenticated ? (
            <>
              <Link
                href="/profile"
                className="rounded-full px-4 py-2 text-sm font-bold text-[#0b1c30] no-underline transition-fast hover:bg-[#fff1f2]"
              >
                {user?.name?.split(" ")[0] ?? "Profil"}
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-full bg-[#980012] px-5 py-2.5 text-sm font-bold text-white transition-base hover:bg-primary-hover"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="rounded-full px-5 py-2.5 text-sm font-bold text-[#0b1c30] no-underline transition-fast hover:bg-[#fff1f2]"
              >
                Daftar
              </Link>
              <Link
                href="/login"
                className="rounded-full bg-[#980012] px-6 py-2.5 text-sm font-bold text-white no-underline shadow-[0_10px_15px_-3px_rgba(152,0,18,0.2)] transition-base hover:bg-primary-hover"
              >
                Masuk
              </Link>
            </>
          )}
        </div>

        {/* [BARU] Menu mobile agar semua tautan Landing tetap bisa dijangkau. */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((current) => !current)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#e6bdb9] bg-white text-[#980012] xl:hidden"
          aria-label={isMenuOpen ? "Tutup navigasi" : "Buka navigasi"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
        </button>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-[#e6bdb9] bg-white px-4 py-4 xl:hidden">
          <div className={`${CONTAINER_CLASS} flex flex-col gap-1 px-0`}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-[#0b1c30] no-underline hover:bg-[#fff1f2]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/find-food"
              onClick={closeMenu}
              className="rounded-xl px-4 py-3 text-sm font-bold text-[#980012] no-underline hover:bg-[#fff1f2]"
            >
              Jelajahi Find Food
            </Link>

            {/* [BARU] Aksi akun tetap tersedia di perangkat mobile. */}
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  onClick={closeMenu}
                  className="rounded-xl px-4 py-3 text-sm font-bold text-[#0b1c30] no-underline hover:bg-[#fff1f2]"
                >
                  Buka Profil
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    logout();
                  }}
                  className="rounded-xl px-4 py-3 text-left text-sm font-bold text-[#980012] hover:bg-[#fff1f2]"
                >
                  Keluar
                </button>
              </>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-3 border-t border-[#e6bdb9] pt-4">
                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="rounded-xl border border-[#e6bdb9] px-4 py-3 text-center text-sm font-bold text-[#0b1c30] no-underline"
                >
                  Daftar
                </Link>
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="rounded-xl bg-[#980012] px-4 py-3 text-center text-sm font-bold text-white no-underline"
                >
                  Masuk
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}