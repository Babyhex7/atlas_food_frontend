import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Atlas Food — 24-Hour Food Recall & Nutrition Survey",
    short_name: "Atlas Food",
    description:
      "Aplikasi survei konsumsi pangan dan estimasi porsi gizi 24 jam interaktif dengan dukungan offline-mode.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0284c7",
    orientation: "portrait-primary",
    scope: "/",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["health", "nutrition", "medical", "productivity"],
  };
}
