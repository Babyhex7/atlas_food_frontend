"use client";

import { X } from "lucide-react";
import { useCollabStore } from "../store/collabStore";

export function ActivityFeed() {
  const open = useCollabStore((s) => s.feedOpen);
  const setFeedOpen = useCollabStore((s) => s.setFeedOpen);
  const activities = useCollabStore((s) => s.activities);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Tutup panel aktivitas"
        className="fixed inset-0 z-[54] bg-black/20 border-none cursor-pointer"
        onClick={() => setFeedOpen(false)}
      />
      <aside className="fixed right-0 top-0 bottom-0 z-[55] w-[min(100%,340px)] bg-surface border-l border-border shadow-xl flex flex-col font-sans animate-slide-up">
        <div className="h-14 px-4 flex items-center justify-between border-b border-border shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-text-primary m-0">Aktivitas</h2>
            <p className="text-[11px] text-text-muted m-0">Perubahan real-time di room ini</p>
          </div>
          <button
            type="button"
            onClick={() => setFeedOpen(false)}
            className="bg-surface-alt border border-border rounded-md cursor-pointer text-text-muted p-1.5 hover:text-text-primary transition-fast"
            aria-label="Tutup activity feed"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {activities.length === 0 && (
            <div className="rounded-lg border border-dashed border-border px-3 py-8 text-center">
              <p className="text-xs text-text-muted m-0">
                Belum ada aktivitas. Cari atau pilih makanan untuk mulai.
              </p>
            </div>
          )}
          {activities.map((a) => (
            <div
              key={a.id}
              className="rounded-lg border border-border bg-surface-alt px-3 py-2.5 text-xs text-text-secondary"
            >
              <div className="font-medium text-text-primary mb-1 leading-snug">
                {a.details || a.action}
              </div>
              <div className="text-text-muted tabular-nums">
                {a.username} · {new Date(a.timestamp).toLocaleTimeString("id-ID")}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
