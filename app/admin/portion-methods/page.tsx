import { redirect } from "next/navigation";

/** Metode porsi dibuat otomatis saat menambah foto porsi di form makanan */
export default function AdminPortionMethodsPage() {
  redirect("/admin/foods");
}
