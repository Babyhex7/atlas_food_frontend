"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Bell, Eye, EyeOff, Link2, Loader2, LogOut, Users } from "lucide-react";
import { PresenceAvatars } from "./PresenceAvatars";
import { ShareModal } from "./ShareModal";
import { useCollabStore } from "../store/collabStore";
import type { CollabConnectionStatus } from "../types/collab";
import { loginWithRedirect } from "@/internal/lib/layout";
import { cn } from "@/internal/lib/cn";

type Props = {
  roomId: string | null;
  status: CollabConnectionStatus;
  onEnableCollab?: () => void;
  requireAuthHint?: boolean;
  showLoginCta?: boolean;
  onFollowUser?: (userId: string) => void;
  onUnfollow?: () => void;
  onLeaveRoom?: () => void;
};

function statusMeta(status: CollabConnectionStatus) {
  switch (status) {
    case "connected":
      return { label: "Live", dot: "bg-emerald-500", pulse: true };
    case "connecting":
    case "reconnecting":
      return {
        label: status === "connecting" ? "Menghubungkan…" : "Menyambung ulang…",
        dot: "bg-amber-500",
        pulse: false,
      };
    case "error":
      return { label: "Gagal terhubung", dot: "bg-danger", pulse: false };
    case "closed":
      return { label: "Terputus", dot: "bg-text-muted", pulse: false };
    default:
      return { label: "Siap dimulai", dot: "bg-text-muted", pulse: false };
  }
}

function roleLabel(role: string | null | undefined) {
  switch (role) {
    case "owner":
      return "Owner";
    case "editor":
      return "Can edit";
    case "viewer":
      return "Can view";
    default:
      return role ?? null;
  }
}

export function CollaborationBar({
  roomId,
  status,
  onEnableCollab,
  requireAuthHint,
  showLoginCta,
  onFollowUser,
  onUnfollow,
  onLeaveRoom,
}: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const setFeedOpen = useCollabStore((s) => s.setFeedOpen);
  const feedOpen = useCollabStore((s) => s.feedOpen);
  const lastError = useCollabStore((s) => s.lastError);
  const remoteSearch = useCollabStore((s) => s.remoteSearch);
  const users = useCollabStore((s) => s.users);
  const selfUserId = useCollabStore((s) => s.selfUserId);
  const selfRoomRole = useCollabStore((s) => s.selfRoomRole);
  const followingUserId = useCollabStore((s) => s.followingUserId);
  const followingUserName = useCollabStore((s) => s.followingUserName);
  const followingUserColor = useCollabStore((s) => s.followingUserColor);
  const followPairs = useCollabStore((s) => s.followPairs);
  const setLastError = useCollabStore((s) => s.setLastError);
  const [shareOpen, setShareOpen] = useState(false);

  const qs = searchParams.toString();
  const currentPath = `${pathname}${qs ? `?${qs}` : ""}`;
  const loginHref = loginWithRedirect(currentPath);

  const followersOfMe = useMemo(() => {
    if (!selfUserId) return [];
    const ids = followPairs.filter((p) => p.leaderId === selfUserId).map((p) => p.followerId);
    return users.filter((u) => ids.includes(u.userId));
  }, [followPairs, selfUserId, users]);

  const meta = statusMeta(status);
  const busy = status === "connecting" || status === "reconnecting";
  const roleText = roleLabel(selfRoomRole);
  const isViewer = selfRoomRole === "viewer";

  return (
    <div className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-md font-sans shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary-border bg-primary-light">
            <Users size={15} className="text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold leading-tight text-text-primary">Multiplayer</div>
            <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
              <span
                className={cn(
                  "inline-block h-1.5 w-1.5 rounded-full",
                  meta.dot,
                  meta.pulse && "animate-pulse"
                )}
              />
              {busy ? (
                <span className="inline-flex items-center gap-1">
                  <Loader2 size={10} className="animate-spin" />
                  {meta.label}
                </span>
              ) : (
                meta.label
              )}
              {users.length > 0 ? <span>· {users.length} online</span> : null}
              {roleText ? <span>· {roleText}</span> : null}
            </div>
          </div>
        </div>

        <div className="hidden h-6 w-px shrink-0 bg-border sm:block" />

        <PresenceAvatars onFollow={onFollowUser} onUnfollow={onUnfollow} />

        {followersOfMe.length > 0 ? (
          <div className="hidden items-center gap-1.5 rounded-full border border-info-border bg-info-light px-2.5 py-1 text-[11px] text-info md:flex">
            <Eye size={12} />
            {followersOfMe.length === 1
              ? `${followersOfMe[0].displayName} mengikuti Anda`
              : `${followersOfMe.length} orang mengikuti Anda`}
          </div>
        ) : null}

        {remoteSearch?.query ? (
          <div className="hidden max-w-[240px] items-center truncate rounded-md border border-border bg-surface-alt px-2.5 py-1 text-[11px] text-text-secondary md:flex">
            <span className="mr-1 truncate font-medium text-text-primary">{remoteSearch.username}</span>
            mencari “{remoteSearch.query}”
          </div>
        ) : null}

        <div className="ml-auto flex items-center gap-2">
          {!roomId && onEnableCollab ? (
            <button
              type="button"
              onClick={onEnableCollab}
              className="cursor-pointer rounded-lg border-none bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-fast hover:opacity-95 font-sans"
            >
              Mulai kolaborasi
            </button>
          ) : null}

          {!roomId && showLoginCta ? (
            <Link
              href={loginHref}
              className="rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white no-underline shadow-sm transition-fast hover:opacity-95 font-sans"
            >
              Login untuk kolaborasi
            </Link>
          ) : null}

          {requireAuthHint ? (
            <Link
              href={loginHref}
              className="rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white no-underline shadow-sm font-sans"
            >
              Login untuk bergabung
            </Link>
          ) : null}

          {roomId ? (
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-text-primary transition-fast hover:bg-surface-alt font-sans"
            >
              <Link2 size={13} />
              Share
            </button>
          ) : null}

          {onLeaveRoom ? (
            <button
              type="button"
              onClick={onLeaveRoom}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-text-secondary transition-fast hover:border-danger/40 hover:text-danger font-sans"
            >
              <LogOut size={13} />
              Keluar sesi
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setFeedOpen(!feedOpen)}
            aria-pressed={feedOpen}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-fast font-sans",
              feedOpen
                ? "border-primary-border bg-primary-light text-primary"
                : "border-border bg-surface text-text-primary hover:bg-surface-alt"
            )}
          >
            <Bell size={13} />
            Aktivitas
          </button>
        </div>
      </div>

      {/* Viewer mode strip */}
      {isViewer && status === "connected" ? (
        <div className="border-t border-warning-border bg-warning-light">
          <div className="mx-auto max-w-6xl px-4 py-2 text-xs text-warning">
            Mode <strong>Can view</strong> — kontrol dikunci. Ikuti rekan lewat avatar di atas untuk
            menyelaraskan layar.
          </div>
        </div>
      ) : null}

      {/* Follow banner */}
      {followingUserId ? (
        <div className="border-t border-primary-border bg-primary-light">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2">
            <p className="m-0 flex items-center gap-2 text-xs text-primary">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: followingUserColor ?? "currentColor" }}
              />
              Following <strong>{followingUserName || "rekan"}</strong>
              <span className="text-primary/70">· viewport diselaraskan</span>
            </p>
            <button
              type="button"
              onClick={onUnfollow}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-primary-border bg-surface px-3 py-1.5 text-xs font-semibold text-primary transition-fast hover:bg-primary hover:text-white font-sans"
            >
              <EyeOff size={12} />
              Stop following
            </button>
          </div>
        </div>
      ) : null}

      {(lastError || requireAuthHint) && (
        <div className="mx-auto max-w-6xl px-4 pb-2.5 pt-2">
          <div className="flex items-start justify-between gap-3 rounded-lg border border-danger/25 bg-danger-light px-3 py-2">
            <p className="m-0 text-xs leading-relaxed text-danger">
              {lastError || "Login diperlukan untuk bergabung ke sesi kolaborasi."}
            </p>
            {lastError ? (
              <button
                type="button"
                onClick={() => setLastError(null)}
                className="shrink-0 cursor-pointer border-none bg-transparent text-[11px] text-danger underline font-sans"
              >
                Tutup
              </button>
            ) : null}
          </div>
        </div>
      )}

      {roomId ? (
        <ShareModal open={shareOpen} roomId={roomId} onClose={() => setShareOpen(false)} />
      ) : null}
    </div>
  );
}
