"use client";

import Link from "next/link";
import { Eye, EyeOff, Search, X } from "lucide-react";
import { useCollab } from "./CollabSession";
import { useCollabStore } from "../store/collabStore";
import { statusLabel } from "./CollabHeaderControls";
import { useLoginHref } from "../hooks/useLoginHref";

/**
 * Strip kontekstual di bawah baris top bar: hanya muncul saat ada sesuatu yang
 * perlu dikatakan — mode viewer, sedang mengikuti rekan, pencarian rekan, atau
 * kesalahan koneksi. Diletakkan di dalam <header> agar ikut sticky bersama top
 * bar, bukan menjadi bar kedua yang berdiri sendiri.
 */
export function CollabStatusStrip() {
  const loginHref = useLoginHref();
  const { roomId, status, isViewer, unfollow, requireAuth } = useCollab();

  const followingUserName = useCollabStore((s) => s.followingUserName);
  const followingUserId = useCollabStore((s) => s.followingUserId);
  const followingUserColor = useCollabStore((s) => s.followingUserColor);
  const remoteSearch = useCollabStore((s) => s.remoteSearch);
  const lastError = useCollabStore((s) => s.lastError);
  const setLastError = useCollabStore((s) => s.setLastError);

  const connectionNote = roomId ? statusLabel(status) : null;
  const message = lastError || connectionNote;

  const showViewer = isViewer && status === "connected";
  const showFollowing = Boolean(followingUserId);
  const showSearch = Boolean(remoteSearch?.query) && !showFollowing;

  if (!requireAuth && !showViewer && !showFollowing && !showSearch && !message) return null;

  return (
    <div className="border-t border-border">
      {requireAuth ? (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-primary-light px-4 py-2 sm:px-6">
          <p className="m-0 text-xs text-primary">
            Masuk dulu untuk bergabung ke sesi kolaborasi ini.
          </p>
          <Link
            href={loginHref}
            className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white no-underline transition-fast hover:opacity-95 font-sans"
          >
            Masuk
          </Link>
        </div>
      ) : null}

      {showViewer ? (
        <div className="flex items-center gap-2 bg-warning-light px-4 py-2 text-xs text-warning sm:px-6">
          <Eye size={13} aria-hidden className="shrink-0" />
          <span>
            Mode <strong>hanya lihat</strong> — kontrol terkunci. Klik avatar rekan untuk mengikuti
            layarnya.
          </span>
        </div>
      ) : null}

      {showFollowing ? (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-primary-light px-4 py-2 sm:px-6">
          <p className="m-0 flex items-center gap-2 text-xs text-primary">
            <span
              aria-hidden
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: followingUserColor ?? "currentColor" }}
            />
            Mengikuti <strong>{followingUserName || "rekan"}</strong>
            <span className="text-primary/70">· layar diselaraskan</span>
          </p>
          <button
            type="button"
            onClick={unfollow}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-primary-border bg-surface px-3 py-1.5 text-xs font-semibold text-primary transition-fast font-sans hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <EyeOff size={12} aria-hidden />
            Berhenti mengikuti
          </button>
        </div>
      ) : null}

      {showSearch ? (
        <div className="flex items-center gap-2 bg-surface-alt px-4 py-2 text-xs text-text-secondary sm:px-6">
          <Search size={13} aria-hidden className="shrink-0 text-text-muted" />
          <span className="truncate">
            <strong className="font-semibold text-text-primary">{remoteSearch?.username}</strong>{" "}
            mencari “{remoteSearch?.query}”
          </span>
        </div>
      ) : null}

      {message ? (
        <div className="flex items-start justify-between gap-3 bg-danger-light px-4 py-2 sm:px-6">
          <p className="m-0 text-xs leading-relaxed text-danger">{message}</p>
          {lastError ? (
            <button
              type="button"
              onClick={() => setLastError(null)}
              aria-label="Tutup pesan kesalahan"
              className="shrink-0 cursor-pointer border-none bg-transparent p-0 text-danger font-sans"
            >
              <X size={13} aria-hidden />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
