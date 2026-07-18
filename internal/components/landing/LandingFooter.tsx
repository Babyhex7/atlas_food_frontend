import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { CONTAINER_CLASS, loginWithRedirect } from "@/internal/lib/layout";

const NAV_ITEMS = [
  { href: loginWithRedirect("/find-food"), label: "Find Your Food" },
  { href: loginWithRedirect("/surveys"),   label: "Survey Recall"  },
  { href: "/register",                     label: "Daftar Akun"    },
];

export function LandingFooter() {
  return (
    <footer className="bg-text-primary border-t border-border text-[#e5e7eb]">
      <div className={`${CONTAINER_CLASS} pt-12 pb-8`}>
        <div className="grid md:grid-cols-3 gap-8 mb-8">

          {/* Brand */}
          <div>
            <p className="flex items-center gap-2 text-lg font-bold text-white mb-2">
              <UtensilsCrossed size={18} aria-hidden /> Atlas Food
            </p>
            <p className="text-sm text-[#9ca3af] leading-relaxed m-0">
              Estimasi porsi makan orang dewasa Indonesia — dikembangkan oleh BRIN bersama UPI.
            </p>
          </div>

          {/* Nav */}
          <div>
            <p className="font-semibold text-white mb-3 text-sm">Navigasi</p>
            <ul className="list-none p-0 m-0 flex flex-col gap-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="footer-nav-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <p className="font-semibold text-white mb-3 text-sm">Tentang</p>
            <p className="text-sm text-[#9ca3af] leading-relaxed m-0">
              262+ hidangan · 13 kategori · Referensi visual terstandar untuk penelitian gizi dan tenaga kesehatan.
            </p>
          </div>

        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-[#374151] text-center text-xs text-[#6b7280]">
          © {new Date().getFullYear()} Atlas Food · BRIN × UPI
        </div>
      </div>
    </footer>
  );
}
