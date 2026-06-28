import Link from "next/link";
import { ArrowRight, Search, ClipboardList, Lock } from "lucide-react";
import { loginWithRedirect } from "@/internal/lib/layout";

export function LandingPaths() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 w-full">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-primary-900">
          Pilih Cara Menggunakan Atlas
        </h2>
        <p className="text-muted mt-2 max-w-xl mx-auto">
          Kedua fitur memerlukan akun — masuk atau daftar terlebih dahulu untuk mulai.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
        <div className="group relative bg-surface rounded-2xl p-8 shadow-sm border border-border hover:shadow-xl hover:border-primary/30 transition-all duration-300 overflow-hidden">
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              <Lock className="w-3 h-3" />
              Login Diperlukan
            </span>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <ClipboardList className="w-36 h-36 text-primary" />
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
              <ClipboardList className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-primary-900 mb-3 font-display">Survey Recall 24 Jam</h3>
            <p className="text-muted mb-8 leading-relaxed">
              Ikuti survei asupan makanan harian Anda. Sistem membantu memperkirakan porsi dan menghitung
              nilai gizi secara akurat untuk keperluan riset gizi.
            </p>
            <Link
              href={loginWithRedirect("/surveys")}
              className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-600 transition-colors shadow-sm"
            >
              Mulai Survey
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="group relative bg-surface rounded-2xl p-8 shadow-sm border border-border hover:shadow-xl hover:border-accent/40 transition-all duration-300 overflow-hidden">
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              <Lock className="w-3 h-3" />
              Login Diperlukan
            </span>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Search className="w-36 h-36 text-accent" />
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 text-accent-600">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-primary-900 mb-3 font-display">Find Your Food</h3>
            <p className="text-muted mb-8 leading-relaxed">
              Cari estimasi ukuran porsi dan kandungan gizi dari ratusan jenis makanan khas Indonesia —
              referensi visual Atlas Makananku BRIN × UPI.
            </p>
            <Link
              href={loginWithRedirect("/find-food")}
              className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 rounded-full bg-accent text-accent-900 text-sm font-semibold hover:bg-accent-400 transition-colors shadow-sm"
            >
              Cari Makanan
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
