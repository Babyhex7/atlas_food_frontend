import type { ReactNode } from "react";
import { QueryProvider } from "@/internal/pkg/providers/QueryProvider";
import "@/styles/globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
