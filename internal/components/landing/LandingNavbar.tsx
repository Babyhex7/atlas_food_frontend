"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
                sizes="132px"
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
        </motion.div>

        <nav className={styles.nav} aria-label="Navigasi utama">
          {LANDING_NAVIGATION.map((item) => {
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.href}
                style={{ position: "relative" }}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
              >
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                >
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      style={{
                        position: "absolute",
                        bottom: -4,
                        left: 0,
                        right: 0,
                        height: 2,
                        backgroundColor: "var(--landing-red)",
                        borderRadius: 9999,
                      }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className={styles.account}>
          {isAuthenticated ? (
            <>
              <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}>
                <Link href="/profile" className={styles.accountLink}>
                  {user?.name?.split(" ")[0] ?? "Profil"}
                </Link>
              </motion.div>
              <motion.button
                type="button"
                className={styles.accountButton}
                onClick={() => logout()}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Keluar
              </motion.button>
            </>
          ) : (
            <>
              <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}>
                <Link href="/register" className={styles.accountLink}>
                  Daftar
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/login" className={styles.accountButton}>
                  Masuk
                </Link>
              </motion.div>
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

      <AnimatePresence>
        {isMenuOpen ? (
          <motion.nav
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={styles.mobileMenu}
            aria-label="Navigasi mobile"
          >
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
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
