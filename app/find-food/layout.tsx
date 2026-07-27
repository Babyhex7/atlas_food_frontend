import { Suspense, type ReactNode } from "react";
import { CollabSession } from "@/internal/domain/collab";

/**
 * Sesi kolaborasi dipasang di LAYOUT, bukan di masing-masing halaman.
 *
 * Layout App Router tetap ter-mount saat berpindah antar route anak
 * (/find-food → /find-food/[id] → /find-food/category/[code]), sehingga koneksi
 * WebSocket, presence, dan follow state ikut bertahan. Waktu CollabSession masih
 * dipasang per halaman, tiap navigasi meng-unmount-nya: socket putus, store
 * di-reset, dan "online" terlihat hilang-hilang.
 */
export default function FindFoodLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <CollabSession roomPrefix="find-food" autoConnect={false}>
        {children}
      </CollabSession>
    </Suspense>
  );
}
