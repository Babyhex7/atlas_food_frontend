"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Activity, DoorOpen, Loader2, Share2, Users } from "lucide-react";
import { PresenceAvatars } from "./PresenceAvatars";
import { ShareModal } from "./ShareModal";
import { useCollab } from "./CollabSession";
import { useCollabStore } from "../store/collabStore";
import { useLoginHref } from "../hooks/useLoginHref";
import type { CollabConnectionStatus } from "../types/collab";
import { cn } from "@/internal/lib/cn";

/**
 * Kontrol kolaborasi untuk top bar aplikasi.
 *
 * Semuanya tinggal di satu bar teratas bersama menu utama — dulu ini bar kedua
 * di bawah header, yang membuat dua baris kontrol saling bersaing dan tombol
 * keluar sesi mudah tertukar dengan keluar akun.
 *
 * Komponen ini membaca CollabContext, jadi di halaman tanpa CollabSession ia
 * merender null dan header biasa tidak berubah.
 */
export function CollabHeaderControls({ className }: { className?: string }) {
  const loginHref = useLoginHref();
  const { roomId, status, enableCollab, leaveRoom, canStart, followUser, unfollow, isViewer } =
    useCollab();

  const feedOpen = useCollabStore((s) => s.feedOpen);
  const setFeedOpen = useCollabStore((s) => s.setFeedOpen);
  const activities = useCollabStore((s) => s.activities);
  const lastSeenActivityAt = useCollabStore((s) => s.lastSeenActivityAt);
  const [shareOpen, setShareOpen] = useState(false);

  const unread = useMemo(
    () => activities.filter((a) => a.timestamp > lastSeenActivityAt).length,
    [activities, lastSeenActivityAt]
  );

  const connecting = status === "connecting" || status === "reconnecting";
  const canShare = !isViewer;

  // Di luar sesi: satu ajakan saja, tidak ada kontrol yang belum ada gunanya.
  if (!roomId) {
    if (canStart && enableCollab) {
      return (
        <button
          type="button"
          onClick={enableCollab}
          className={cn(
            "inline-flex cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] border-border bg-surface px-3 py-2 text-sm font-medium text-text-secondary transition-fast font-sans hover:border-primary-border hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            className
          )}
        >
          <Users size={15} aria-hidden />
          <span className="hidden lg:inline">Mulai kolaborasi</span>
        </button>
      );
    }

    if (canStart === false) {
      return (
        <Link
          href={loginHref}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-border bg-surface px-3 py-2 text-sm font-medium text-text-secondary no-underline transition-fast font-sans hover:border-primary-border hover:text-primary",
            className
          )}
        >
          <Users size={15} aria-hidden />
          <span className="hidden lg:inline">Kolaborasi</span>
        </Link>
      );
    }

    return null;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Viewer tidak bisa mengundang — sama seperti Figma, hak berbagi
          mengikuti hak ubah. Backend menolaknya juga; ini hanya agar tombol
          yang pasti gagal tidak ditawarkan. */}
      {canShare ? (
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-none bg-primary px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-fast font-sans hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Share2 size={15} aria-hidden />
          <span className="hidden sm:inline">Bagikan</span>
        </button>
      ) : null}

      <PresenceAvatars onFollow={followUser} onUnfollow={unfollow} />

      {connecting ? (
        <span className="hidden items-center gap-1.5 text-[11px] text-text-muted sm:inline-flex">
          <Loader2 size={12} className="animate-spin" aria-hidden />
          {status === "connecting" ? "Menghubungkan…" : "Menyambung ulang…"}
        </span>
      ) : null}

      <span aria-hidden className="hidden h-6 w-px bg-border sm:block" />

      <button
        type="button"
        onClick={() => setFeedOpen(!feedOpen)}
        aria-pressed={feedOpen}
        aria-label={
          unread > 0 ? `Aktivitas ruang, ${unread} baru` : "Aktivitas ruang"
        }
        title="Aktivitas ruang"
        className={cn(
          "relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-[1.5px] transition-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          feedOpen
            ? "border-primary-border bg-primary-light text-primary"
            : "border-transparent bg-surface-alt text-text-secondary hover:text-text-primary"
        )}
      >
        <Activity size={16} aria-hidden />
        {unread > 0 && !feedOpen ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {leaveRoom ? (
        <button
          type="button"
          onClick={leaveRoom}
          aria-label="Keluar dari sesi kolaborasi"
          title="Keluar sesi"
          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-transparent bg-surface-alt text-text-secondary transition-fast hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <DoorOpen size={16} aria-hidden />
        </button>
      ) : null}

      {canShare ? (
        <ShareModal open={shareOpen} roomId={roomId} onClose={() => setShareOpen(false)} />
      ) : null}
    </div>
  );
}

/** Label status koneksi — dipakai strip kontekstual di bawah top bar. */
export function statusLabel(status: CollabConnectionStatus): string | null {
  switch (status) {
    case "error":
      return "Koneksi kolaborasi gagal";
    case "closed":
      return "Sesi kolaborasi terputus";
    default:
      return null;
  }
}
