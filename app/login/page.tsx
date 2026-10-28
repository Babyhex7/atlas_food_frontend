import { Suspense } from "react";
import { LoginForm } from "@/internal/domain/auth/components/LoginForm";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2 } from "lucide-react";

export const metadata = {
  title: "Masuk — Atlas Food",
  description:
    "Portal masuk akun survei recall konsumsi pangan dan estimasi porsi gizi 24 jam berbasis riset BRIN & UPI.",
};

export default function LoginPage() {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col lg:flex-row bg-white overflow-x-hidden">
      {/* ── SISI KIRI: Showcase Resmi Atlas Makananku (Desktop Only) ────────── */}
      <section
        aria-label="Informasi Platform Atlas Food"
        className="hidden lg:flex lg:w-[48%] xl:w-[45%] flex-col justify-between p-8 xl:p-12 bg-slate-50 border-r border-slate-200 select-none"
      >
        {/* 1. Header Logo Instansi */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-slate-900 group no-underline">
            <div className="w-8 h-8 rounded-lg bg-[#C0001B] flex items-center justify-center text-white font-bold text-sm shadow-2xs">
              A
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900">
              Atlas Food
            </span>
          </Link>

          {/* Logo BRIN & UPI */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
            <Image
              src="/images/landing/logo-brin.png"
              alt="Logo BRIN"
              width={42}
              height={20}
              className="object-contain max-h-4 w-auto"
              priority
            />
            <div className="h-3 w-px bg-slate-200" />
            <Image
              src="/images/landing/logo-upi.png"
              alt="Logo UPI"
              width={34}
              height={20}
              className="object-contain max-h-4 w-auto"
              priority
            />
          </div>
        </div>

        {/* 2. Visual Buku Atlas Makananku */}
        <div className="my-auto py-8 flex flex-col items-center text-center">
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm max-w-[270px] xl:max-w-[300px] transition-transform duration-300">
            <Image
              src="/images/landing/atlas-makananku-cover.png"
              alt="Sampul Buku Atlas Makananku"
              width={300}
              height={420}
              className="rounded-xl object-contain w-full h-auto"
              priority
            />
          </div>

          <div className="mt-6 max-w-xs xl:max-w-sm">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Atlas Makananku
            </h2>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Buku panduan visual estimasi porsi pangan orang dewasa untuk standardisasi survei dietary recall 24 jam di Indonesia.
            </p>
          </div>
        </div>

        {/* 3. Footer Riset */}
        <div className="pt-4 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Inisiatif Riset Kolaboratif BRIN & UPI</span>
          <span>Edisi 2025/2026</span>
        </div>
      </section>

      {/* ── SISI KANAN: Form Autentikasi (Mobile & Desktop) ─────────────────── */}
      <main className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 bg-white min-h-[100dvh] lg:min-h-0">
        {/* Top Bar: Navigasi Kembali & Logo Mobile */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors py-1 px-2 rounded-md hover:bg-slate-100 -ml-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>

          {/* Logo di Mobile View */}
          <div className="flex lg:hidden items-center gap-2 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200">
            <Image
              src="/images/landing/logo-brin.png"
              alt="BRIN"
              width={36}
              height={18}
              className="object-contain max-h-3.5 w-auto"
            />
            <div className="h-3 w-px bg-slate-200" />
            <Image
              src="/images/landing/logo-upi.png"
              alt="UPI"
              width={30}
              height={18}
              className="object-contain max-h-3.5 w-auto"
            />
          </div>
        </div>

        {/* Center Container: Login Form */}
        <div className="my-auto w-full max-w-sm sm:max-w-md mx-auto py-8">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                <span className="text-xs">Memuat formulir masuk...</span>
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>

        {/* Bottom Bar: Copyright & Info */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>&copy; {new Date().getFullYear()} Atlas Makananku. Hak cipta dilindungi.</span>
          <div className="flex items-center gap-3">
            <Link href="/metodologi" className="hover:text-slate-600 transition-colors">
              Metodologi
            </Link>
            <span className="text-slate-300">&bull;</span>
            <Link href="/tim" className="hover:text-slate-600 transition-colors">
              Tim Riset
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
