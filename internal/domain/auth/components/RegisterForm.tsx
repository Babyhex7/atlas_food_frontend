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
import { registerSchema, type RegisterFormValues } from "@/internal/lib/validations";
import { register as registerApi } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import { getPostAuthPath, getSafeRedirect } from "../utils/postAuthRedirect";
import { useToast } from "@/internal/components/ui/Toast";

function PasswordInput({
  id,
  label,
  placeholder,
  error,
  registration,
}: {
  id: string;
  label: string;
  placeholder: string;
  error?: string;
  registration: object;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-text-secondary">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className={cn(
            "w-full py-2.5 pr-10 pl-3 text-sm text-text-primary bg-surface border-[1.5px] rounded-md outline-none font-sans transition-base box-border",
            error
              ? "border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(220,38,38,0.15)]"
              : "border-border focus:border-primary focus:shadow-focus"
          )}
          {...registration}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none text-text-muted cursor-pointer flex items-center p-0"
          aria-label={show ? "Sembunyikan" : "Tampilkan"}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const toast = useToast();
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
    try {
      const { confirmPassword, ...payload } = data;
      const response = await registerApi(payload);
      setSession(response);
      toast.success("Akun berhasil dibuat! 🎉", `Selamat bergabung di Atlas Food, ${response.user.name || response.user.email}!`);
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
        err.message || "Gagal membuat akun. Silakan coba lagi."
      );
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
        <h1 className="text-2xl font-bold text-text-primary mb-2 tracking-tight">Buat Akun</h1>
        <p className="text-sm text-text-muted m-0">Daftar untuk mulai menjelajahi Atlas Food</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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
        <PasswordInput
          id="password"
          label="Password"
          placeholder="Minimal 8 karakter"
          error={errors.password?.message}
          registration={formRegister("password")}
        />
        <PasswordInput
          id="confirmPassword"
          label="Konfirmasi Password"
          placeholder="Ulangi password Anda"
          error={errors.confirmPassword?.message}
          registration={formRegister("confirmPassword")}
        />

        <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
          Daftar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        Sudah punya akun?{" "}
        <Link
          href={
            searchParams.get("redirect")
              ? `/login?redirect=${encodeURIComponent(searchParams.get("redirect")!)}`
              : "/login"
          }
          className="font-semibold text-primary no-underline hover:underline"
        >
          Masuk Sekarang
        </Link>
      </p>
    </div>
  );
}
