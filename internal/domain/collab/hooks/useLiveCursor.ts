"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { CollabSend } from "./useWebSocket";
import { useCollabStore } from "../store/collabStore";

function throttle<T extends (...args: never[]) => void>(fn: T, wait: number): T {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: Parameters<T> | null = null;

  const invoke = () => {
    last = Date.now();
    timer = null;
    if (pending) {
      const args = pending;
      pending = null;
      fn(...args);
    }
  };

  return ((...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = wait - (now - last);
    pending = args;
    if (remaining <= 0 || remaining > wait) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      invoke();
    } else if (!timer) {
      timer = setTimeout(invoke, remaining);
    }
  }) as T;
}

/**
 * Broadcast cursor + viewport (throttled).
 * Cursor pakai document coords (client + scroll) agar follower di viewport
 * berbeda tetap bisa mirror relatif ke dokumen.
 *
 * Path penuh (pathname + search) ikut di-broadcast saat berubah — penting agar
 * follower ikut ke detail makanan / query search leader.
 */
export function useLiveCursor(send: CollabSend, enabled = true) {
  const users = useCollabStore((s) => s.users);
  const selfUserId = useCollabStore((s) => s.selfUserId);
  const followingUserId = useCollabStore((s) => s.followingUserId);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: MouseEvent) => {
      // Saat mengikuti orang lain, jangan spam cursor sendiri (Figma-like).
      if (followingUserId) return;
      send("cursor_move", {
        x: e.clientX + window.scrollX,
        y: e.clientY + window.scrollY,
        scroll_x: window.scrollX,
        scroll_y: window.scrollY,
        page: window.location.pathname,
      });
    };

    const onScrollOrResize = () => {
      if (followingUserId) return;
      // Step dibaca dari store saat kirim, bukan lewat dependency efek: pesan ini
      // menimpa viewport tersimpan di server, jadi tidak boleh ada satu pun yang
      // berangkat tanpa langkah aktif.
      const step = useCollabStore.getState().localStep;
      send("viewport_update", {
        page: window.location.pathname,
        path: window.location.pathname + window.location.search,
        scroll_x: window.scrollX,
        scroll_y: window.scrollY,
        ...(step ? { step } : {}),
      });
    };

    const throttledMove = throttle(onMove, 66);
    const throttledViewport = throttle(onScrollOrResize, 100);

    window.addEventListener("mousemove", throttledMove);
    window.addEventListener("scroll", throttledViewport, { passive: true });
    window.addEventListener("resize", throttledViewport);
    // Snapshot awal + setiap ganti path/query (search, detail, kategori)
    onScrollOrResize();

    return () => {
      window.removeEventListener("mousemove", throttledMove);
      window.removeEventListener("scroll", throttledViewport);
      window.removeEventListener("resize", throttledViewport);
    };
  }, [send, enabled, followingUserId, pathname, searchKey]);

  const remoteCursors = useMemo(() => {
    return users
      .filter(
        (u) =>
          u.userId !== selfUserId &&
          u.cursor &&
          (!u.cursor.page || u.cursor.page === pathname)
      )
      .map((u) => {
        // Sender menyimpan document coords; konversi ke client viewport lokal.
        const clientX = u.cursor!.x - (typeof window !== "undefined" ? window.scrollX : 0);
        const clientY = u.cursor!.y - (typeof window !== "undefined" ? window.scrollY : 0);
        return {
          userId: u.userId,
          name: u.displayName,
          x: clientX,
          y: clientY,
          color: u.color,
          isLeader: u.userId === followingUserId,
        };
      });
  }, [users, selfUserId, pathname, followingUserId]);

  return { remoteCursors };
}
