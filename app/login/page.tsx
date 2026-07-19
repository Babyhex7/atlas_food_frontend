import { Suspense } from "react";
import { LoginForm } from "@/internal/domain/auth/components/LoginForm";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-bg)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "var(--space-12) var(--space-4)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background blobs */}
      <div
        style={{
          position: "absolute",
          top: "-15%",
          left: "-10%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "var(--color-primary-light)",
          filter: "blur(100px)",
          opacity: 0.7,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-15%",
          right: "-10%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "var(--color-primary-muted)",
          filter: "blur(100px)",
          opacity: 0.5,
          pointerEvents: "none",
        }}
      />

      {/* Back link */}
      <div style={{ position: "absolute", top: "var(--space-5)", left: "var(--space-5)", zIndex: 10 }}>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-text-muted no-underline bg-surface py-2 px-4 rounded-full border border-border shadow-xs transition-fast hover:text-text-primary hover:border-border-strong"
        >
          <ArrowLeft size={15} />
          Kembali ke Beranda
        </Link>
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <Suspense
          fallback={
            <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-16)" }}>
              <Loader2 size={32} className="animate-spin" style={{ color: "var(--color-primary)" }} />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
