"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Copy, Eye, Link2, Pencil, X } from "lucide-react";
import { createCollabInvite, type InviteRole } from "../services/inviteService";
import { cn } from "@/internal/lib/cn";

type Props = {
  open: boolean;
  roomId: string;
  onClose: () => void;
};

/**
 * Share modal ala Figma: pilih can edit / can view, salin link undangan.
 */
export function ShareModal({ open, roomId, onClose }: Props) {
  const [role, setRole] = useState<InviteRole>("editor");
  const [copied, setCopied] = useState(false);

  // Undangan diambil lewat React Query, bukan useEffect + setState manual.
  // Selain menghilangkan cascading render, ganti role otomatis memicu
  // pengambilan ulang karena role ikut jadi bagian queryKey.
  const { data: invite, isFetching } = useQuery({
    queryKey: ["collab-invite", roomId, role],
    enabled: open && Boolean(roomId),
    refetchOnWindowFocus: false,
    gcTime: 0,
    queryFn: async () => {
      try {
        const inv = await createCollabInvite(roomId, role, window.location.href);
        return { shareUrl: inv.shareUrl, expiresAt: inv.expiresAt, error: null as string | null };
      } catch {
        // Tetap beri link yang bisa dipakai walau API invite gagal — link ini
        // hanya kehilangan token role, jadi penerima masuk dengan role default.
        const url = new URL(window.location.href);
        url.searchParams.set("room", roomId);
        url.searchParams.delete("invite");
        return {
          shareUrl: url.toString(),
          expiresAt: null,
          error: "Invite API gagal — link fallback tanpa token role.",
        };
      }
    },
  });

  const link = invite?.shareUrl ?? "";
  const expiresAt = invite?.expiresAt ?? null;
  const error = invite?.error ?? null;
  const loading = isFetching;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Salin link:", link);
    }
  };

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Tutup bagikan"
        className="fixed inset-0 z-[70] border-none bg-black/35 cursor-pointer"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="collab-share-title"
        className="fixed left-1/2 top-[12%] z-[71] w-[min(100%-1.5rem,420px)] -translate-x-1/2 rounded-xl border border-border bg-surface shadow-xl font-sans"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light text-primary">
              <Link2 className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <h2 id="collab-share-title" className="m-0 text-sm font-semibold text-text-primary">
                Bagikan room
              </h2>
              <p className="m-0 text-[11px] text-text-muted">Seperti Figma — pilih izin, lalu salin link</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border bg-surface-alt p-1.5 text-text-muted hover:text-text-primary cursor-pointer"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-4">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.07em] text-text-muted">
              Izin undangan
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("editor")}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-lg border px-3 py-2.5 text-left cursor-pointer transition-fast font-sans",
                  role === "editor"
                    ? "border-primary bg-primary-light text-primary"
                    : "border-border bg-surface text-text-secondary hover:border-primary-border"
                )}
              >
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                  <Pencil className="h-3.5 w-3.5" />
                  Can edit
                </span>
                <span className="text-[10px] opacity-80">Cari, pilih, isi recall bersama</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("viewer")}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-lg border px-3 py-2.5 text-left cursor-pointer transition-fast font-sans",
                  role === "viewer"
                    ? "border-primary bg-primary-light text-primary"
                    : "border-border bg-surface text-text-secondary hover:border-primary-border"
                )}
              >
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                  <Eye className="h-3.5 w-3.5" />
                  Can view
                </span>
                <span className="text-[10px] opacity-80">Hanya lihat + follow viewport</span>
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.07em] text-text-muted">
              Link undangan
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={loading ? "Membuat undangan…" : link}
                className="min-w-0 flex-1 rounded-lg border border-border bg-surface-alt px-3 py-2 text-[11px] text-text-secondary font-mono"
              />
              <button
                type="button"
                onClick={copy}
                disabled={loading || !link}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white cursor-pointer hover:bg-primary-hover disabled:opacity-50 font-sans"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Tersalin" : "Salin"}
              </button>
            </div>
            {expiresAt ? (
              <p className="mt-2 m-0 text-[10px] text-text-muted">
                Berlaku sampai {new Date(expiresAt).toLocaleString("id-ID")} · penerima harus login
              </p>
            ) : (
              <p className="mt-2 m-0 text-[10px] text-text-muted">
                Penerima harus login sebelum masuk room
              </p>
            )}
            {error ? <p className="mt-1 m-0 text-[10px] text-warning">{error}</p> : null}
          </div>
        </div>
      </div>
    </>
  );
}
