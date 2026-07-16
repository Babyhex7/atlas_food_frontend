import Link from "next/link";
import { ArrowRight, Search, ClipboardList, Lock } from "lucide-react";
import { loginWithRedirect } from "@/internal/lib/layout";

export function LandingPaths() {
  return (
    <section className="max-w-[1200px] mx-auto py-16 px-6 w-full">
      {/* Heading */}
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Pilih Cara Menggunakan Atlas</h2>
        <p className="text-base text-text-muted m-0">
          Kedua fitur memerlukan akun — masuk atau daftar terlebih dahulu untuk mulai.
        </p>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Survey card */}
        <div className="card card-hover p-8 relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <span className="badge badge-primary inline-flex items-center gap-1">
              <Lock size={10} />
              Login Diperlukan
            </span>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-[0.04] pointer-events-none">
            <ClipboardList size={144} className="text-primary" />
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-primary-light rounded-xl flex items-center justify-center mb-5 text-primary">
              <ClipboardList size={28} />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-3">Survey Recall 24 Jam</h3>
            <p className="text-sm text-text-muted leading-relaxed mb-8">
              Ikuti survei asupan makanan harian Anda. Sistem membantu memperkirakan porsi dan menghitung nilai gizi secara akurat untuk keperluan riset gizi.
            </p>
            <Link href={loginWithRedirect("/surveys")} className="btn-cta-primary">
              Mulai Survey
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Find Food card */}
        <div className="card card-hover p-8 relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <span className="badge badge-primary inline-flex items-center gap-1">
              <Lock size={10} />
              Login Diperlukan
            </span>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-[0.04] pointer-events-none">
            <Search size={144} className="text-primary" />
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-primary-light rounded-xl flex items-center justify-center mb-5 text-primary">
              <Search size={28} />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-3">Find Your Food</h3>
            <p className="text-sm text-text-muted leading-relaxed mb-8">
              Cari estimasi ukuran porsi dan kandungan gizi dari ratusan jenis makanan khas Indonesia — referensi visual Atlas Food BRIN × UPI.
            </p>
            <Link href={loginWithRedirect("/find-food")} className="btn-cta-primary">
              Cari Makanan
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
