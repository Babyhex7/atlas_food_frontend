import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Izinkan HMR dari origin dev (Hyper-V/WSL bridge + localhost).
  // Tanpa ini Next 16 memblokir /_next/webpack-hmr → error di console.
  allowedDevOrigins: ["172.18.16.1", "localhost", "127.0.0.1"],
};

export default nextConfig;
