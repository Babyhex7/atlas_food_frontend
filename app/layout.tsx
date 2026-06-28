import type { Metadata } from "next";
import "../styles/globals.css";
import { ReactQueryProvider } from "@/internal/providers/query-provider";
import { AuthProvider } from "@/internal/providers/auth-provider";

export const metadata: Metadata = {
  title: "Atlas Food — Survey Gizi & Find Your Food",
  description:
    "Platform survey recall makanan dan katalog visual estimasi porsi makanan Indonesia.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <ReactQueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}

