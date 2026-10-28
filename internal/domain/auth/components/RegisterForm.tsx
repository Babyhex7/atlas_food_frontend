"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/internal/pkg/components/Button";
import { cn } from "@/internal/lib/cn";
import { registerSchema, type RegisterFormValues } from "@/internal/lib/validations";
import { register as registerApi } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import { getPostAuthPath, getSafeRedirect } from "../utils/postAuthRedirect";
import { useToast } from "@/internal/components/ui/Toast";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...payload } = data;
      const response = await registerApi(payload);
      setSession(response);
      toast.success("Akun berhasil dibuat", `Selamat bergabung di Atlas Food, ${response.user.name || response.user.email}!`);
      const redirect = searchParams.get("redirect");
      const target = getSafeRedirect(
        redirect,
        getPostAuthPath(response.user.role),
        response.user.role
      );
      router.push(target);
    } catch (err: any) {
      toast.error(
        "Registrasi gagal",
        err.message || "Gagal membuat akun. Silakan periksa data Anda dan coba lagi."
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
          Buat Akun Baru
        </h1>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Daftarkan akun Anda untuk mengakses katalog porsi dan berpartisipasi dalam survei recall pangan.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Input */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-xs font-semibold text-slate-700">
            Nama Lengkap
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Nama lengkap Anda"
            className={cn(
              "w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors shadow-2xs font-sans",
              errors.name
                ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                : "border-slate-300 hover:border-slate-400 focus:border-[#C0001B] focus:ring-1 focus:ring-[#C0001B]"
            )}
            {...formRegister("name")}
          />
          {errors.name?.message && (
            <p className="text-xs text-red-600 mt-1 font-medium">{errors.name.message}</p>
          )}
        </div>

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
            {...formRegister("email")}
          />
          {errors.email?.message && (
            <p className="text-xs text-red-600 mt-1 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
            Kata Sandi
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Minimal 8 karakter"
              className={cn(
                "w-full px-3.5 pr-10 py-2.5 bg-white border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors shadow-2xs font-sans",
                errors.password
                  ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  : "border-slate-300 hover:border-slate-400 focus:border-[#C0001B] focus:ring-1 focus:ring-[#C0001B]"
              )}
              {...formRegister("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 transition-colors"
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password?.message && (
            <p className="text-xs text-red-600 mt-1 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password Input */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700">
            Konfirmasi Kata Sandi
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Ulangi kata sandi Anda"
              className={cn(
                "w-full px-3.5 pr-10 py-2.5 bg-white border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors shadow-2xs font-sans",
                errors.confirmPassword
                  ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  : "border-slate-300 hover:border-slate-400 focus:border-[#C0001B] focus:ring-1 focus:ring-[#C0001B]"
              )}
              {...formRegister("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 transition-colors"
              aria-label={showConfirmPassword ? "Sembunyikan konfirmasi kata sandi" : "Tampilkan konfirmasi kata sandi"}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword?.message && (
            <p className="text-xs text-red-600 mt-1 font-medium">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          isLoading={isLoading}
          className="w-full h-10 rounded-lg bg-[#C0001B] hover:bg-[#A80017] text-white font-medium text-sm transition-colors shadow-2xs mt-3 cursor-pointer"
        >
          Daftar Akun
        </Button>
      </form>

      {/* Footer Login Link */}
      <p className="mt-8 text-center text-xs text-slate-500">
        Sudah memiliki akun survei?{" "}
        <Link
          href={
            searchParams.get("redirect")
              ? `/login?redirect=${encodeURIComponent(searchParams.get("redirect")!)}`
              : "/login"
          }
          className="font-semibold text-[#C0001B] hover:underline"
        >
          Masuk Sekarang
        </Link>
      </p>
    </div>
  );
}
