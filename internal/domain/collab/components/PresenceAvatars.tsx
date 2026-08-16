"use client";

import { useMemo, useState } from "react";
import { Eye, MoreHorizontal } from "lucide-react";
import { useCollabStore } from "../store/collabStore";
import { cn } from "@/internal/lib/cn";

type Props = {
  onFollow?: (userId: string) => void;
  onUnfollow?: () => void;
};

/**
 * Presence stack ala Figma: klik avatar → menu Follow / Stop following.
 */
export function PresenceAvatars({ onFollow, onUnfollow }: Props) {
  const users = useCollabStore((s) => s.users);
  const selfUserId = useCollabStore((s) => s.selfUserId);
  const followingUserId = useCollabStore((s) => s.followingUserId);
  const followPairs = useCollabStore((s) => s.followPairs);
  const status = useCollabStore((s) => s.status);
  const [menuUserId, setMenuUserId] = useState<string | null>(null);

  const followerCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of followPairs) {
      map.set(p.leaderId, (map.get(p.leaderId) ?? 0) + 1);
    }
    return map;
  }, [followPairs]);

  if (status !== "connected" && users.length === 0) return null;

  if (users.length === 0) {
    return <span className="text-[11px] text-text-muted font-sans">Menunggu rekan…</span>;
  }

  return (
    <div className="relative flex items-center gap-2">
      <div className="flex items-center -space-x-2">
        {users.slice(0, 6).map((u) => {
          const initial = (u.displayName || "?").charAt(0).toUpperCase();
          const isSelf = u.userId === selfUserId;
          const isFollowing = u.userId === followingUserId;
          const watched = followerCount.get(u.userId) ?? 0;
          const menuOpen = menuUserId === u.userId;

          return (
            <div key={u.userId} className="relative">
              <button
                type="button"
                onClick={() => {
                  if (isSelf) return;
                  setMenuUserId(menuOpen ? null : u.userId);
                }}
                className={cn(
                  "relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface text-xs font-semibold text-white font-sans transition-transform",
                  !isSelf && "cursor-pointer hover:scale-110 hover:z-10",
                  isSelf && "cursor-default",
                  (isFollowing || menuOpen) && "ring-2 ring-offset-1 ring-primary scale-110 z-10"
                )}
                style={{ backgroundColor: u.color, zIndex: isFollowing || isSelf || menuOpen ? 4 : 1 }}
                title={`${u.displayName}${isSelf ? " (anda)" : ""}${watched ? ` · ${watched} mengikuti` : ""}`}
              >
                {initial}
                {isFollowing ? (
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-white">
                    <Eye className="h-2.5 w-2.5" aria-hidden />
                  </span>
                ) : watched > 0 ? (
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-surface text-[8px] font-bold text-text-primary border border-border px-0.5">
                    {watched}
                  </span>
                ) : (
                  <span
                    aria-hidden
                    className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-success"
                  />
                )}
              </button>

              {menuOpen && !isSelf ? (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-[65] cursor-default border-none bg-transparent"
                    aria-label="Tutup menu"
                    onClick={() => setMenuUserId(null)}
                  />
                  <div className="absolute left-1/2 top-[calc(100%+8px)] z-[66] w-44 -translate-x-1/2 rounded-lg border border-border bg-surface p-1 shadow-lg font-sans">
                    <div className="px-2 py-1.5 border-b border-border mb-1">
                      <p className="m-0 text-xs font-semibold text-text-primary truncate">{u.displayName}</p>
                      <p className="m-0 text-[10px] text-text-muted capitalize">{u.roomRole ?? u.role}</p>
                    </div>
                    {isFollowing ? (
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-text-primary hover:bg-surface-alt cursor-pointer border-none bg-transparent font-sans"
                        onClick={() => {
                          onUnfollow?.();
                          setMenuUserId(null);
                        }}
                      >
                        <Eye className="h-3.5 w-3.5 text-primary" />
                        Stop following
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-text-primary hover:bg-surface-alt cursor-pointer border-none bg-transparent font-sans"
                        onClick={() => {
                          onFollow?.(u.userId);
                          setMenuUserId(null);
                        }}
                      >
                        <Eye className="h-3.5 w-3.5 text-primary" />
                        Follow
                      </button>
                    )}
                    <p className="m-0 px-2 py-1.5 text-[10px] text-text-muted flex items-center gap-1">
                      <MoreHorizontal className="h-3 w-3" />
                      Mirror viewport seperti Figma
                    </p>
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
        {users.length > 6 ? (
          <div className="z-[1] flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-surface-alt text-[10px] text-text-muted font-sans">
            +{users.length - 6}
          </div>
        ) : null}
      </div>
    </div>
  );
}
