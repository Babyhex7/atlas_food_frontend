"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Eye, EyeOff, UtensilsCrossed } from "lucide-react";
import { Button } from "@/internal/pkg/components/Button";
import { Input } from "@/internal/pkg/components/Input";
import { cn } from "@/internal/lib/cn";
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
    <div className="w-full max-w-[440px] mx-auto p-8 bg-surface border border-border rounded-2xl shadow-xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center mx-auto mb-4">
          <UtensilsCrossed size={26} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2 tracking-tight">Selamat Datang</h1>
        <p className="text-sm text-text-muted m-0">Masuk untuk melanjutkan ke Atlas Food</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="email@contoh.com"
          error={errors.email?.message}
          {...register("email")}
        />

        {/* Password with toggle */}
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-medium text-text-secondary">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={cn(
                "w-full py-2.5 pr-10 pl-3 text-sm text-text-primary bg-surface border-[1.5px] rounded-md outline-none font-sans transition-base box-border",
                errors.password
                  ? "border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(220,38,38,0.15)]"
                  : "border-border focus:border-primary focus:shadow-focus"
              )}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none text-text-muted cursor-pointer flex items-center p-0"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password?.message && (
            <span className="text-xs text-danger">{errors.password.message}</span>
          )}
        </div>

        {errorMsg && (
          <div className="alert alert-danger text-sm">
            {errorMsg}
          </div>
        )}

        <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
          Masuk
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        Belum punya akun?{" "}
        <Link
          href={
            searchParams.get("redirect")
              ? `/register?redirect=${encodeURIComponent(searchParams.get("redirect")!)}`
              : "/register"
          }
          className="font-semibold text-primary no-underline hover:underline"
        >
          Daftar Sekarang
        </Link>
      </p>
    </div>
  );
}
