"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/internal/pkg/components/Button";
import { cn } from "@/internal/lib/cn";
import { loginSchema, type LoginFormValues } from "@/internal/lib/validations";
import { login } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import { getPostAuthPath, getSafeRedirect } from "../utils/postAuthRedirect";
import { useToast } from "@/internal/components/ui/Toast";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await login(data);
      setSession(response);
      toast.success("Login berhasil", `Selamat datang kembali, ${response.user.name || response.user.email}`);
      const redirect = searchParams.get("redirect");
      const target = getSafeRedirect(
        redirect,
        getPostAuthPath(response.user.role),
        response.user.role
      );
      router.push(target);
    } catch (err: any) {
      toast.error(
        "Login gagal",
        err.message || "Periksa email & password Anda, lalu coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-display">
          Masuk ke Akun
        </h1>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Silakan masukkan email dan kata sandi Anda untuk melanjutkan ke portal survei dan katalog porsi.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Input */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-semibold text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="nama@instansi.id"
            className={cn(
              "w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors shadow-2xs font-sans",
              errors.email
                ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                : "border-slate-300 hover:border-slate-400 focus:border-[#C0001B] focus:ring-1 focus:ring-[#C0001B]"
            )}
            {...register("email")}
          />
          {errors.email?.message && (
            <p className="text-xs text-red-600 mt-1 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
              Kata Sandi
            </label>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className={cn(
                "w-full px-3.5 pr-10 py-2.5 bg-white border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors shadow-2xs font-sans",
                errors.password
                  ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  : "border-slate-300 hover:border-slate-400 focus:border-[#C0001B] focus:ring-1 focus:ring-[#C0001B]"
              )}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 transition-colors"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password?.message && (
            <p className="text-xs text-red-600 mt-1 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          isLoading={isLoading}
          className="w-full h-10 rounded-lg bg-[#C0001B] hover:bg-[#A80017] text-white font-medium text-sm transition-colors shadow-2xs mt-3 cursor-pointer"
        >
          Masuk
        </Button>
      </form>

      {/* Footer Register Link */}
      <p className="mt-8 text-center text-xs text-slate-500">
        Belum memiliki akun survei?{" "}
        <Link
          href={
            searchParams.get("redirect")
              ? `/register?redirect=${encodeURIComponent(searchParams.get("redirect")!)}`
              : "/register"
          }
          className="font-semibold text-[#C0001B] hover:underline"
        >
          Daftar Sekarang
        </Link>
      </p>
    </div>
  );
}
