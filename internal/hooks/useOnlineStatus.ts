"use client";

import { useSyncExternalStore } from "react";

/**
 * Berlangganan status koneksi browser.
 *
 * Memakai useSyncExternalStore, bukan useState + useEffect: navigator.onLine
 * adalah external store, dan pola ini membacanya saat render pertama alih-alih
 * merender "online" dulu lalu mengoreksinya di effect (satu render terbuang,
 * dan sekejap menampilkan status yang salah). Snapshot server selalu `true`
 * supaya markup SSR cocok dengan render pertama klien.
 */
function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);
  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

function getSnapshot(): boolean {
  return navigator.onLine;
}

function getServerSnapshot(): boolean {
  return true;
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
