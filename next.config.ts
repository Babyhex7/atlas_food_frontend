import type { NextConfig } from "next";

// Ambil hostname dari API_URL / NEXT_PUBLIC_API_URL untuk remotePatterns
function getApiHostname(): string {
  const url =
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:8080/api/v1";
  try {
    return new URL(url).hostname;
  } catch {
    return "localhost";
  }
}

function getStorageHostname(): string | null {
  const url = process.env.STORAGE_BASE_URL ?? process.env.NEXT_PUBLIC_STORAGE_BASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const apiHostname = getApiHostname();
const storageHostname = getStorageHostname();

const nextConfig: NextConfig = {
  env: {
    API_URL: process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "",
    WS_URL: process.env.WS_URL || process.env.NEXT_PUBLIC_WS_URL || "",
    NEXT_PUBLIC_API_URL: process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "",
    NEXT_PUBLIC_WS_URL: process.env.WS_URL || process.env.NEXT_PUBLIC_WS_URL || "",
  },
  // Izinkan HMR dari origin dev (Hyper-V/WSL bridge + localhost).
  allowedDevOrigins: ["172.18.16.1", "localhost", "127.0.0.1"],

  images: {
    remotePatterns: [
      // Backend (dev/prod) — sajikan foto dari /uploads/**
      {
        protocol: "http",
        hostname: apiHostname,
        port: "",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: apiHostname,
        port: "",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: apiHostname,
        port: "8080",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: apiHostname,
        port: "8081",
        pathname: "/uploads/**",
      },
      // MinIO / object storage (prod) — semua path di bawah bucket
      ...(storageHostname
        ? [
            {
              protocol: "https" as const,
              hostname: storageHostname,
              pathname: "/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
