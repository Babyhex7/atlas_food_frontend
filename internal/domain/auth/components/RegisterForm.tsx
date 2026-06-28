"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/internal/pkg/components/Button";
import { Input } from "@/internal/pkg/components/Input";
import { registerSchema, type RegisterFormValues } from "@/internal/lib/validations";
import { register as registerApi } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import { getPostAuthPath, getSafeRedirect } from "../utils/postAuthRedirect";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      // Destructure confirmPassword out of the payload sent to the backend API
      const { confirmPassword, ...payload } = data;
      const response = await registerApi(payload);
      setSession(response);
      const redirect = searchParams.get("redirect");
      router.push(getSafeRedirect(redirect, getPostAuthPath(response.user.role)));
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal melakukan registrasi. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-display text-slate-900 mb-2">Buat Akun</h1>
        <p className="text-slate-500">Daftar untuk mulai menjelajahi Atlas Food</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          id="name"
          label="Nama Lengkap"
          type="text"
          placeholder="Nama Anda"
          error={errors.name?.message}
          {...formRegister("name")}
        />

        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="email@contoh.com"
          error={errors.email?.message}
          {...formRegister("email")}
        />
        
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="Minimal 8 karakter"
          error={errors.password?.message}
          {...formRegister("password")}
        />

        <Input
          id="confirmPassword"
          label="Konfirmasi Password"
          type="password"
          placeholder="Ulangi password Anda"
          error={errors.confirmPassword?.message}
          {...formRegister("confirmPassword")}
        />

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            {errorMsg}
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          Daftar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-primary hover:text-primary-600">
          Masuk Sekarang
        </Link>
      </p>
    </div>
  );
}
