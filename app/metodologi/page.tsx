import type { Metadata } from "next";
import { MetodologiPage } from "@/internal/components/landing/MetodologiPage";

export const metadata: Metadata = {
  title: "Metodologi — Atlas Food",
  description:
    "Pedoman penggunaan Atlas Food untuk estimasi ukuran porsi makanan berbasis referensi visual.",
};

export default function MetodologiRoute() {
  return <MetodologiPage />;
}
