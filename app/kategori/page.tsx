import type { Metadata } from "next";
import { KategoriPage } from "@/internal/components/landing/KategoriPage";

export const metadata: Metadata = {
  title: "Kategori Hidangan — Atlas Food",
  description:
    "Jelajahi kategori hidangan Atlas Food dan temukan referensi visual porsi makanan Indonesia.",
};

export default function KategoriRoute() {
  return <KategoriPage />;
}
