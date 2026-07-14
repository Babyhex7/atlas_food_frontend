import { Suspense } from "react";
import { RegisterForm } from "@/internal/domain/auth/components/RegisterForm";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function RegisterPage() {
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
          right: "-10%",
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
          left: "-10%",
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
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            fontSize: "var(--text-sm)",
            fontWeight: "var(--weight-medium)",
            color: "var(--color-text-muted)",
            textDecoration: "none",
            backgroundColor: "var(--color-surface)",
            padding: "var(--space-2) var(--space-4)",
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-xs)",
            transition: "var(--transition-fast)",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-strong)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)"; }}
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
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
