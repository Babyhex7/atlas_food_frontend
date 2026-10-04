"use client";

import { useEffect } from "react";
import { SyncEngine } from "@/internal/lib/syncEngine";

export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Di development / localhost, jangan pasang service worker karena Cache-First SW
    // akan merusak Fast Refresh Turbopack dan menyajikan chunk JS basi.
    if (process.env.NODE_ENV !== "production" || window.location.hostname === "localhost") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister();
        }
      });
      if ("caches" in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key);
          }
        });
      }
      const cleanupSync = SyncEngine.initAutoSync();
      return () => cleanupSync();
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
