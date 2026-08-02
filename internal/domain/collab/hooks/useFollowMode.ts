"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCollabStore } from "../store/collabStore";
import { mergeLeaderPathForFollower } from "../lib/collabParams";
import type { CollabSend } from "./useWebSocket";

/**
 * Figma-like follow: mirror scroll + path (+ query q) dari leader viewport_sync.
 * room/invite milik follower selalu dipertahankan.
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
      const dest = mergeLeaderPathForFollower(raw, window.location.href);
      if (dest && dest !== `${window.location.pathname}${window.location.search}`) {
        if (dest !== lastNavRef.current) {
          lastNavRef.current = dest;
          // replace: follow tidak boleh menumpuk history browser follower
          router.replace(dest);
          return;
        }
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
