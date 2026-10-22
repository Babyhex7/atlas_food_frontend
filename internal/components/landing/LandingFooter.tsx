import Link from "next/link";
import { AtSign, BookOpenText, Globe, GraduationCap } from "lucide-react";
import { LANDING_NAVIGATION } from "./landingData";
import styles from "./LandingPage.module.css";

// Halaman informasi belum tersedia; tautan sementara tetap di footer.
const INFORMATION_LINKS = [
  "Kebijakan Privasi",
  "Syarat Penggunaan",
  "Kontak Peneliti",
  "Pusat Bantuan",
];

export function LandingFooter() {
  return (
    <footer id="kontak" className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerGrid}>
          <div>
            <p className={styles.footerBrand}>
              <BookOpenText size={36} aria-hidden />
              Atlas Food
            </p>
            <p className={styles.footerAbout}>
              Sistem referensi digital untuk estimasi porsi makanan Indonesia yang dikembangkan
              melalui kolaborasi strategis BRIN dan Universitas Pendidikan Indonesia.
            </p>
            <div className={styles.footerSocial}>
              <a href="#kontak" aria-label="Website Atlas Food">
                <Globe size={18} aria-hidden />
              </a>
              <a href="#kontak" aria-label="Institusi akademik Atlas Food">
                <GraduationCap size={18} aria-hidden />
              </a>
              <a href="mailto:info@atlasfood.id" aria-label="Email Atlas Food">
                <AtSign size={18} aria-hidden />
              </a>
            </div>
          </div>

          <div>
            <h3 className={styles.footerTitle}>Navigasi</h3>
            <ul className={styles.footerLinks}>
              {LANDING_NAVIGATION.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={styles.footerTitle}>Informasi</h3>
            <ul className={styles.footerLinks}>
              {INFORMATION_LINKS.map((label) => (
                <li key={label}>
                  <Link href="#kontak">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={styles.footerTitle}>Instansi Partner</h3>
            <div className={styles.footerPartner}>
              <strong>BRIN</strong>
              <span>Badan Riset dan Inovasi Nasional</span>
            </div>
            <div className={styles.footerPartner}>
              <strong>UPI</strong>
              <span>Universitas Pendidikan Indonesia</span>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>
            {`© ${new Date().getFullYear()} Atlas Food. Hak cipta dilindungi. Kolaborasi Riset BRIN & UPI.`}
          </p>
          <div>
            <Link href="#kontak">Privasi</Link>
            <Link href="#kontak">Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
