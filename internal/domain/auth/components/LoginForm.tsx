"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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
    <div className="w-full max-w-md mx-auto p-8 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-display text-slate-900 mb-2">Selamat Datang</h1>
        <p className="text-slate-500">Masuk untuk melanjutkan ke Atlas Food</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="email@contoh.com"
          error={errors.email?.message}
          {...register("email")}
        />
        
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            {errorMsg}
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          Masuk
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Belum punya akun?{" "}
        <Link href="/register" className="font-semibold text-primary hover:text-primary-600">
          Daftar Sekarang
        </Link>
      </p>
    </div>
  );
}
