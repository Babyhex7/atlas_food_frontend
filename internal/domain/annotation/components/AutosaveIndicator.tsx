"use client";

import { AlertCircle, Check, Loader2 } from "lucide-react";
import type { AutosaveState } from "../types/annotation";

type AutosaveIndicatorProps = {
  state: AutosaveState;
  lastSavedAt: Date | null;
  error: string | null;
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** Umpan balik autosave sesuai brief §8.1 — "Menyimpan…" / "Tersimpan HH:mm:ss" */
export function AutosaveIndicator({ state, lastSavedAt, error }: AutosaveIndicatorProps) {
  if (state === "error") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-danger" role="status">
        <AlertCircle size={14} />
        Gagal menyimpan{error ? `: ${error}` : ""} — perubahan masih tersimpan di browser
      </span>
    );
  }

  if (state === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-text-muted" role="status">
        <Loader2 size={14} className="animate-spin" />
        Menyimpan…
      </span>
    );
  }

  if (state === "pending") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-text-muted" role="status">
        Perubahan belum tersimpan
      </span>
    );
  }

  if (state === "saved" && lastSavedAt) {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-success" role="status">
        <Check size={14} />
        Tersimpan {formatTime(lastSavedAt)}
      </span>
    );
  }

  return <span className="text-xs text-text-muted">Belum ada perubahan</span>;
}
