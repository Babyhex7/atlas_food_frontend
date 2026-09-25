import Link from "next/link";
import { Globe2, Mail, UtensilsCrossed } from "lucide-react";
import { CONTAINER_CLASS } from "@/internal/lib/layout";

const FOOTER_NAVIGATION = [
  { href: "#beranda", label: "Beranda" },
  { href: "#kategori", label: "Kategori" },
  { href: "#metodologi", label: "Metodologi" },
  { href: "#tim-peneliti", label: "Tim Peneliti" },
];

export function LandingFooter() {
  return (
    // [DIUBAH] Footer lengkap mengikuti komposisi Footer pada frame Figma 65:2871.
    <footer id="footer" className="bg-[#0b1c30] text-[#eaf1ff]">
      <div className={`${CONTAINER_CLASS} py-16 sm:py-20`}>
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.45fr_0.7fr_0.9fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#980012] text-white">
                <UtensilsCrossed size={22} aria-hidden />
              </span>
              <p className="m-0 text-2xl font-extrabold tracking-[-0.04em]">Atlas Food</p>
            </div>
            <p className="mb-0 mt-5 max-w-sm text-sm leading-6 text-[#eaf1ff]/70">
              Sistem referensi digital untuk estimasi porsi makanan Indonesia yang
              dikembangkan melalui kolaborasi strategis BRIN dan Universitas
              Pendidikan Indonesia.
            </p>
            <div className="mt-6 flex gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[#eaf1ff]/70">
                <Globe2 size={17} aria-hidden />
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[#eaf1ff]/70">
                <Mail size={17} aria-hidden />
              </span>
            </div>
          </div>

          <FooterList title="Navigasi" items={FOOTER_NAVIGATION} />
          <FooterList
            title="Informasi"
            items={[
              { href: "#footer", label: "Kebijakan Privasi" },
              { href: "#footer", label: "Syarat Penggunaan" },
              { href: "#footer", label: "Kontak Peneliti" },
              { href: "#footer", label: "Pusat Bantuan" },
            ]}
          />

          <div>
            <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-[#eaf1ff]/60">
              Instansi Partner
            </p>
            <div className="mt-7 space-y-6">
              <div>
                <p className="m-0 text-lg font-bold text-white">BRIN</p>
                <p className="mb-0 mt-1 text-xs leading-5 text-[#eaf1ff]/55">
                  Badan Riset dan Inovasi Nasional
                </p>
              </div>
              <div>
                <p className="m-0 text-lg font-bold text-white">UPI</p>
                <p className="mb-0 mt-1 text-xs leading-5 text-[#eaf1ff]/55">
                  Universitas Pendidikan Indonesia
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/[0.07] pt-7 text-xs font-semibold tracking-[0.02em] text-[#eaf1ff]/40 sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0">
            © {new Date().getFullYear()} Atlas Food. Hak cipta dilindungi. Kolaborasi Riset BRIN &amp; UPI.
          </p>
          <div className="flex gap-7">
            <Link href="#footer" className="text-inherit no-underline hover:text-white">
              Privasi
            </Link>
            <Link href="#footer" className="text-inherit no-underline hover:text-white">
              Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterList({
  title,
  items,
}: {
  title: string;
  items: Array<{ href: string; label: string }>;
}) {
  return (
    <div>
      <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-[#eaf1ff]/60">
        {title}
      </p>
      <ul className="mt-7 flex list-none flex-col gap-4 p-0">
        {items.map((item) => (
          <li key={`${title}-${item.label}`}>
            <Link
              href={item.href}
              className="text-sm text-[#eaf1ff]/80 no-underline transition-fast hover:text-white"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}