"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/internal/domain/auth/hooks/useAuth";
import { useLogout } from "@/internal/domain/auth/hooks/useLogout";
import { LANDING_ASSETS, LANDING_NAVIGATION } from "./landingData";
import { LandingImage } from "./LandingImage";
import styles from "./LandingPage.module.css";

export function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const logout = useLogout();

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/" onClick={closeMenu} className={styles.brand} aria-label="Atlas Food">
          <span className={styles.partnerLogos}>
            <LandingImage
              src={LANDING_ASSETS.logoBrin}
              alt="BRIN"
              sizes="82px"
              fit="contain"
              className={styles.logoBrin}
              priority
              fallback={<span className={styles.logoText}>BRIN</span>}
            />
            <LandingImage
              src={LANDING_ASSETS.logoUpi}
              alt="UPI"
              sizes="64px"
              fit="contain"
              className={styles.logoUpi}
              priority
              fallback={<span className={styles.logoText}>UPI</span>}
            />
          </span>
          <LandingImage
            src={LANDING_ASSETS.logoAtlas}
            alt="Atlas Food"
            sizes="120px"
            fit="contain"
            className={styles.logoAtlas}
            priority
            fallback={<span className={styles.wordmark}>Atlas Food</span>}
          />
        </Link>

        <nav className={styles.nav} aria-label="Navigasi utama">
          {LANDING_NAVIGATION.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.account}>
          {isAuthenticated ? (
            <>
              <Link href="/profile" className={styles.accountLink}>
                {user?.name?.split(" ")[0] ?? "Profil"}
              </Link>
              <button type="button" className={styles.accountButton} onClick={() => logout()}>
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link href="/register" className={styles.accountLink}>
                Daftar
              </Link>
              <Link href="/login" className={styles.accountButton}>
                Masuk
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setIsMenuOpen((value) => !value)}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Tutup navigasi" : "Buka navigasi"}
        >
          {isMenuOpen ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
        </button>
      </div>

      {isMenuOpen ? (
        <nav className={styles.mobileMenu} aria-label="Navigasi mobile">
          {LANDING_NAVIGATION.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className={styles.mobileLink}
            >
              {item.label}
            </Link>
          ))}

          {/* Aksi akun tetap tersedia di perangkat mobile. */}
          {isAuthenticated ? (
            <>
              <Link href="/profile" onClick={closeMenu} className={styles.mobileLink}>
                Buka Profil
              </Link>
              <button
                type="button"
                className={styles.mobileLink}
                onClick={() => {
                  closeMenu();
                  logout();
                }}
              >
                Keluar
              </button>
            </>
          ) : (
            <div className={styles.mobileAccount}>
              <Link href="/register" onClick={closeMenu} className={styles.accountLink}>
                Daftar
              </Link>
              <Link href="/login" onClick={closeMenu} className={styles.accountButton}>
                Masuk
              </Link>
            </div>
          )}
        </nav>
      ) : null}
    </header>
  );
}
