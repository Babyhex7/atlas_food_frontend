import type { NextConfig } from "next";

// Ambil hostname dari NEXT_PUBLIC_API_URL untuk remotePatterns
function getApiHostname(): string {
  const url =
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
  const url = process.env.NEXT_PUBLIC_STORAGE_BASE_URL;
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
  // Izinkan HMR dari origin dev (Hyper-V/WSL bridge + localhost).
  allowedDevOrigins: ["172.18.16.1", "localhost", "127.0.0.1"],

  images: {
    remotePatterns: [
      // Backend lokal (dev) — sajikan foto dari /uploads/atlas/
      {
        protocol: "http",
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
