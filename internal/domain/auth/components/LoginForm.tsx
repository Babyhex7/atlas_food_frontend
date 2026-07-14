"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/internal/pkg/components/Button";
import { Input } from "@/internal/pkg/components/Input";
import { loginSchema, type LoginFormValues } from "@/internal/lib/validations";
import { login } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import { getPostAuthPath, getSafeRedirect } from "../utils/postAuthRedirect";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await login(data);
      setSession(response);
      const redirect = searchParams.get("redirect");
      router.push(getSafeRedirect(redirect, getPostAuthPath(response.user.role)));
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal melakukan login. Periksa email & password Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 440,
        margin: "0 auto",
        padding: "var(--space-8)",
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-2xl)",
        boxShadow: "var(--shadow-xl)",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "var(--radius-xl)",
            backgroundColor: "var(--color-primary-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto var(--space-4)",
            fontSize: "1.5rem",
          }}
        >
          🍽️
        </div>
        <h1
          style={{
            fontSize: "var(--text-2xl)",
            fontWeight: "var(--weight-bold)",
            color: "var(--color-text-primary)",
            margin: "0 0 var(--space-2)",
            letterSpacing: "-0.02em",
          }}
        >
          Selamat Datang
        </h1>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", margin: 0 }}>
          Masuk untuk melanjutkan ke Atlas Food
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="email@contoh.com"
          error={errors.email?.message}
          {...register("email")}
        />

        {/* Password with toggle */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <label
            htmlFor="password"
            style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-secondary)" }}
          >
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "0.625rem var(--space-10) 0.625rem var(--space-3)",
                fontSize: "var(--text-sm)",
                color: "var(--color-text-primary)",
                backgroundColor: "var(--color-surface)",
                border: `1.5px solid ${errors.password ? "var(--color-danger)" : "var(--color-border)"}`,
                borderRadius: "var(--radius-md)",
                outline: "none",
                transition: "var(--transition-base)",
                fontFamily: "var(--font-sans)",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = errors.password ? "var(--color-danger)" : "var(--color-primary)";
                e.currentTarget.style.boxShadow = errors.password ? "0 0 0 3px rgba(220,38,38,0.15)" : "var(--focus-ring)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.password ? "var(--color-danger)" : "var(--color-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{
                position: "absolute",
                right: "var(--space-3)",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--color-text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                padding: 0,
              }}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password?.message && (
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-danger)" }}>{errors.password.message}</span>
          )}
        </div>

        {errorMsg && (
          <div className="alert alert-danger" style={{ fontSize: "var(--text-sm)" }}>
            {errorMsg}
          </div>
        )}

        <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
          Masuk
        </Button>
      </form>

      <p style={{ marginTop: "var(--space-6)", textAlign: "center", fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
        Belum punya akun?{" "}
        <Link
          href="/register"
          style={{ fontWeight: "var(--weight-semibold)", color: "var(--color-primary)", textDecoration: "none" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "underline"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "none"; }}
        >
          Daftar Sekarang
        </Link>
      </p>
    </div>
  );
}
