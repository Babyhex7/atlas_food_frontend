import type { Metadata } from "next";
import { TimPage } from "@/internal/components/landing/TimPage";

export const metadata: Metadata = {
  title: "Tim Peneliti — Atlas Food",
  description:
    "Tim multidisiplin BRIN, UPI, dan UMBR yang meriset, menyusun, dan mengembangkan Atlas Food.",
};

export default function TimPenelitiRoute() {
  return <TimPage />;
}
