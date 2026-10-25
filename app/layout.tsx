import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "../styles/globals.css";
import { ReactQueryProvider } from "@/internal/providers/query-provider";
import { AuthProvider } from "@/internal/providers/auth-provider";

import { PWARegister } from "@/internal/components/pwa/PWARegister";
import { OfflineStatusBar } from "@/internal/components/pwa/OfflineStatusBar";
import { PWAInstallPrompt } from "@/internal/components/pwa/PWAInstallPrompt";
import { ToastProvider } from "@/internal/components/ui/Toast";

export const metadata: Metadata = {
  title: "Atlas Food — Survey Gizi & Find Your Food",
  description:
    "Platform survey recall makanan dan katalog visual estimasi porsi makanan Indonesia.",
};

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-jakarta",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={jakartaSans.variable}>
      <body>
        <ReactQueryProvider>
          <AuthProvider>
            <ToastProvider>
              <PWARegister />
              <OfflineStatusBar />
              {children}
              <PWAInstallPrompt />
            </ToastProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}

