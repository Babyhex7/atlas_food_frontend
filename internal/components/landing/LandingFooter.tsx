import Link from "next/link";
import { CONTAINER_CLASS, loginWithRedirect } from "@/internal/lib/layout";
export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-primary-900 text-primary-100">
      <div className={`${CONTAINER_CLASS} py-12`}>
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <p className="font-display text-xl font-bold text-white mb-2">Atlas Makananku</p>
            <p className="text-sm text-primary-200 leading-relaxed">
              Estimasi porsi makan orang dewasa Indonesia — dikembangkan oleh BRIN bersama UPI.
            </p>
          </div>
          <div>
            <p className="font-semibold text-white mb-3 text-sm">Navigasi</p>
            <ul className="space-y-2 text-sm text-primary-200">
              <li>
                <Link href={loginWithRedirect("/find-food")} className="hover:text-white transition-colors">
                  Find Your Food
                </Link>
              </li>
              <li>
                <Link href={loginWithRedirect("/surveys")} className="hover:text-white transition-colors">
                  Survey Recall
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Daftar Akun
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-3 text-sm">Tentang</p>
            <p className="text-sm text-primary-200 leading-relaxed">
              262+ hidangan · 13 kategori · Referensi visual terstandar untuk penelitian gizi dan tenaga kesehatan.
            </p>
          </div>
        </div>
        <div className="pt-8 border-t border-primary-700 text-center text-xs text-primary-300">
          © {new Date().getFullYear()} Atlas Makananku · BRIN × UPI
        </div>
      </div>
    </footer>
  );
}
