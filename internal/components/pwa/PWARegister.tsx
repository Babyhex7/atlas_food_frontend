"use client";

import { useEffect } from "react";
import { SyncEngine } from "@/internal/lib/syncEngine";

export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });
        console.log("[PWA] Service Worker registered successfully with scope:", registration.scope);
      } catch (error) {
        console.warn("[PWA] Service Worker registration failed:", error);
      }
    };

    registerSW();
    const cleanupSync = SyncEngine.initAutoSync();

    return () => cleanupSync();
  }, []);

  return null;
}
