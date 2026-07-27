"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCollabStore } from "../store/collabStore";
import type { CollabSend } from "./useWebSocket";

/**
 * Figma-like follow: mirror scroll (+ path bila beda) dari leader viewport_sync.
 */
export function useFollowMode(send: CollabSend, enabled: boolean) {
  const followingUserId = useCollabStore((s) => s.followingUserId);
  const leaderViewport = useCollabStore((s) => s.leaderViewport);
  const pathname = usePathname();
  const router = useRouter();
  const applyingRef = useRef(false);
  const lastNavRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !followingUserId || !leaderViewport) return;
    if (typeof window === "undefined") return;

    const raw = leaderViewport.path || leaderViewport.page || "";
    if (raw.startsWith("/")) {
      try {
        const current = new URL(window.location.href);
        const next = new URL(raw, window.location.origin);

        // Hanya navigasi jika PATHNAME beda — jangan bandingkan full URL
        // (query room/invite milik follower harus dipertahankan → cegah loop).
        if (next.pathname !== current.pathname && next.pathname !== lastNavRef.current) {
          const room = current.searchParams.get("room");
          const invite = current.searchParams.get("invite");
          if (room) next.searchParams.set("room", room);
          if (invite) next.searchParams.set("invite", invite);
          // Buang query lain dari leader agar tidak bentrok
          const dest = `${next.pathname}?${next.searchParams.toString()}`.replace(/\?$/, "");
          lastNavRef.current = next.pathname;
          router.push(dest);
          return;
        }
      } catch {
        // ignore bad path
      }
    }

    applyingRef.current = true;
    window.scrollTo({
      left: leaderViewport.scrollX,
      top: leaderViewport.scrollY,
      behavior: "auto",
    });
    window.setTimeout(() => {
      applyingRef.current = false;
    }, 50);
  }, [enabled, followingUserId, leaderViewport, pathname, router]);

  useEffect(() => {
    if (!followingUserId) lastNavRef.current = null;
  }, [followingUserId]);

  const followUser = useCallback(
    (userId: string) => {
      if (!enabled || !userId) return;
      // Follow diri sendiri tidak ada artinya dan ditolak BE — tahan di sini
      // supaya tidak muncul toast error yang membingungkan.
      if (userId === useCollabStore.getState().selfUserId) return;
      send("follow_user", { user_id: userId });
    },
    [enabled, send]
  );

  const unfollow = useCallback(() => {
    send("unfollow_user", {});
    useCollabStore.getState().setFollowing({ userId: null });
  }, [send]);

  return {
    followingUserId,
    isFollowing: Boolean(followingUserId),
    followUser,
    unfollow,
    isApplyingFollow: () => applyingRef.current,
  };
}
