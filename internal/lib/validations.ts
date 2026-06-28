import { z } from "zod";

// ── Auth ─────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;

// ── Recall: Step 1 — Pilih Meal ──────────────────────────────
export const mealTimeSchema = z.object({
  name: z.string().min(1, "Pilih waktu makan"),
  time: z.string().min(1, "Pilih jam makan"),
});

export type MealTimeFormValues = z.infer<typeof mealTimeSchema>;

// ── Recall: Portion Custom Weight ────────────────────────────
export const customWeightSchema = z.object({
  weight: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z
      .number({ message: "Masukkan angka" })
      .positive("Berat harus lebih dari 0")
      .max(5000, "Berat maksimal 5000g")
  ),
});

export type CustomWeightFormValues = z.infer<typeof customWeightSchema>;
