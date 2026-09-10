"use client";

import { useSyncExternalStore } from "react";

/** Store yang tidak pernah berubah — kita hanya butuh beda server vs klien. */
function subscribe(): () => void {
  return () => {};
}

/**
 * true setelah komponen ter-hydrate di browser, false saat render server.
 *
 * Dipakai untuk konten yang hanya boleh muncul di klien (mis. kontrol yang
 * bergantung pada cookie atau state kolaborasi). Pola lama `useState(false)` +
 * `useEffect(() => setMounted(true))` melakukan hal yang sama, tapi lewat
 * render kedua yang tidak perlu — useSyncExternalStore memberi jawaban yang
 * benar sejak render pertama di klien.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
