"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Bell, Check, Link2, Loader2, Users } from "lucide-react";
import { PresenceAvatars } from "./PresenceAvatars";
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

export function CollaborationBar({
  roomId,
  status,
  onEnableCollab,
  requireAuthHint,
  showLoginCta,
}: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const setFeedOpen = useCollabStore((s) => s.setFeedOpen);
  const feedOpen = useCollabStore((s) => s.feedOpen);
  const lastError = useCollabStore((s) => s.lastError);
  const remoteSearch = useCollabStore((s) => s.remoteSearch);
  const users = useCollabStore((s) => s.users);
  const setLastError = useCollabStore((s) => s.setLastError);
  const [copied, setCopied] = useState(false);

  const qs = searchParams.toString();
  const currentPath = `${pathname}${qs ? `?${qs}` : ""}`;
  const loginHref = loginWithRedirect(currentPath);

  const share = useCallback(async () => {
    if (!roomId || typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("room", roomId);
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Salin link kolaborasi:", url.toString());
    }
  }, [roomId]);

  const meta = statusMeta(status);
  const busy = status === "connecting" || status === "reconnecting";

  return (
    <div className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-md font-sans shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary-light border border-primary-border flex items-center justify-center shrink-0">
            <Users size={15} className="text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-text-primary leading-tight">
              Kolaborasi real-time
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
              <span
                className={cn(
                  "inline-block w-1.5 h-1.5 rounded-full",
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
            </div>
          </div>
        </div>

        <div className="hidden sm:block h-6 w-px bg-border shrink-0" />

        <PresenceAvatars />

        {remoteSearch?.query ? (
          <div className="hidden md:flex items-center max-w-[240px] truncate rounded-md bg-surface-alt border border-border px-2.5 py-1 text-[11px] text-text-secondary">
            <span className="font-medium text-text-primary mr-1 truncate">
              {remoteSearch.username}
            </span>
            mencari “{remoteSearch.query}”
          </div>
        ) : null}

        <div className="ml-auto flex items-center gap-2">
          {!roomId && onEnableCollab ? (
            <button
              type="button"
              onClick={onEnableCollab}
              className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-primary text-white border-none cursor-pointer font-sans shadow-sm hover:opacity-95 transition-fast"
            >
              Mulai kolaborasi
            </button>
          ) : null}

          {!roomId && showLoginCta ? (
            <Link
              href={loginHref}
              className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-primary text-white no-underline font-sans shadow-sm hover:opacity-95 transition-fast"
            >
              Login untuk kolaborasi
            </Link>
          ) : null}

          {requireAuthHint ? (
            <Link
              href={loginHref}
              className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-primary text-white no-underline font-sans shadow-sm"
            >
              Login untuk bergabung
            </Link>
          ) : null}

          {roomId ? (
            <button
              type="button"
              onClick={share}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-border bg-surface text-text-primary cursor-pointer font-sans hover:bg-surface-alt transition-fast"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Link2 size={13} />}
              {copied ? "Link tersalin" : "Bagikan link"}
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setFeedOpen(!feedOpen)}
            aria-pressed={feedOpen}
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border cursor-pointer font-sans transition-fast",
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

      {(lastError || requireAuthHint) && (
        <div className="max-w-6xl mx-auto px-4 pb-2.5">
          <div className="flex items-start justify-between gap-3 rounded-lg border border-danger/25 bg-danger-light px-3 py-2">
            <p className="text-xs text-danger m-0 leading-relaxed">
              {lastError || "Login diperlukan untuk bergabung ke sesi kolaborasi."}
            </p>
            {lastError ? (
              <button
                type="button"
                onClick={() => setLastError(null)}
                className="text-[11px] text-danger bg-transparent border-none cursor-pointer shrink-0 font-sans underline"
              >
                Tutup
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
