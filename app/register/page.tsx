import { Suspense } from "react";
import { RegisterForm } from "@/internal/domain/auth/components/RegisterForm";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary-light blur-[100px] opacity-70 pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] rounded-full bg-primary-muted blur-[100px] opacity-50 pointer-events-none" />

      {/* Back link */}
      <div className="absolute top-5 left-5 z-10">
        <Link
          href="/"
          className="link-muted-hover inline-flex items-center gap-2 bg-surface py-2 px-4 rounded-full border border-border shadow-xs"
        >
          <ArrowLeft size={15} />
          Kembali ke Beranda
        </Link>
      </div>

      <div className="relative z-1">
        <Suspense
          fallback={
            <div className="flex justify-center py-16">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          }
        >
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
