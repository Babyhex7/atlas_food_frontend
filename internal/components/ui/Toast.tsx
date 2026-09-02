"use client";

import { Toaster, toast as sonnerToast } from "sonner";
import { WifiOff, Wifi } from "lucide-react";

/**
 * ToastProvider — Memasang Sonner Toaster di seluruh aplikasi.
 * Sonner adalah library Toast standar industri paling populer & performant untuk Next.js / React (by Emil Kowalski).
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        theme="dark"
        toastOptions={{
          className: "font-sans border border-border/40 shadow-2xl rounded-xl text-sm",
          duration: 4500,
        }}
      />
    </>
  );
}

/**
 * useToast — Hook serbaguna dengan API yang bersih untuk memicu Sonner toast.
 */
export function useToast() {
  return {
    success: (title: string, message?: string, duration?: number) => {
      sonnerToast.success(title, { description: message, duration });
    },
    error: (title: string, message?: string, duration?: number) => {
      sonnerToast.error(title, { description: message, duration: duration ?? 6000 });
    },
    warning: (title: string, message?: string, duration?: number) => {
      sonnerToast.warning(title, { description: message, duration });
    },
    info: (title: string, message?: string, duration?: number) => {
      sonnerToast.info(title, { description: message, duration });
    },
    offline: (title: string, message?: string) => {
      sonnerToast(title, {
        description: message,
        icon: <WifiOff size={18} className="text-amber-500" />,
        duration: Infinity,
      });
    },
    online: (title: string, message?: string) => {
      sonnerToast(title, {
        description: message,
        icon: <Wifi size={18} className="text-emerald-400" />,
        duration: 3500,
      });
    },
    dismiss: (id?: string) => {
      sonnerToast.dismiss(id);
    },
    dismissAll: () => {
      sonnerToast.dismiss();
    },
  };
}

// Export langsung sonner toast untuk penggunaan langsung tanpa hook jika diperlukan
export { sonnerToast as toast };
