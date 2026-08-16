"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, X } from "lucide-react";
import { useCollabStore } from "../store/collabStore";
import {
  ACTIVITY_FILTERS,
  activityBadge,
  activityGroup,
  activityPhrase,
  relativeTime,
  type ActivityGroup,
} from "../lib/activityMeta";
import { colorForUserId } from "../types/collab";
import { cn } from "@/internal/lib/cn";

/**
 * Panel aktivitas ruang kolaborasi.
 *
 * Warna rail dan avatar tiap baris mengikuti warna identitas user yang sama
 * dengan presence stack dan kursor live, jadi satu orang selalu punya satu
 * warna di seluruh aplikasi.
 */
export function ActivityFeed() {
  const open = useCollabStore((s) => s.feedOpen);
  const setFeedOpen = useCollabStore((s) => s.setFeedOpen);
  const markSeen = useCollabStore((s) => s.markActivitiesSeen);
  const activities = useCollabStore((s) => s.activities);
  const users = useCollabStore((s) => s.users);

  const [filter, setFilter] = useState<ActivityGroup | "all">("all");
  // Waktu relatif harus ikut berjalan selama panel terbuka; tanpa tick ini
  // "baru saja" akan bertahan sampai ada aktivitas baru yang memicu render.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!open) return;
    markSeen();
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, [open, markSeen, activities.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFeedOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setFeedOpen]);

  const colorByUser = useMemo(() => {
    const map = new Map<string, string>();
    for (const user of users) map.set(user.userId, user.color);
    return map;
  }, [users]);

  const roleByUser = useMemo(() => {
    const map = new Map<string, string>();
    for (const user of users) if (user.roomRole) map.set(user.userId, user.roomRole);
    return map;
  }, [users]);

  const visible = useMemo(
    () => (filter === "all" ? activities : activities.filter((a) => activityGroup(a.action) === filter)),
    [activities, filter]
  );

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Tutup panel aktivitas"
        className="fixed inset-0 z-[54] cursor-default border-none bg-black/25"
        onClick={() => setFeedOpen(false)}
      />
      <aside
        aria-label="Aktivitas ruang"
        className="fixed right-0 top-0 bottom-0 z-[55] flex w-[min(100%,360px)] flex-col border-l border-border bg-surface font-sans shadow-xl animate-slide-up"
      >
        <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
            <Activity size={17} aria-hidden />
          </span>
          <h2 className="m-0 flex-1 text-base font-bold tracking-tight text-text-primary">
            Aktivitas Ruang
          </h2>
          <button
            type="button"
            onClick={() => setFeedOpen(false)}
            aria-label="Tutup panel aktivitas"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-surface-alt text-text-muted transition-fast hover:border-text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <X size={15} aria-hidden />
          </button>
        </header>

        <div
          role="tablist"
          aria-label="Saring aktivitas"
          className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-border px-4 py-3"
        >
          {ACTIVITY_FILTERS.map((item) => {
            const active = filter === item.value;
            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(item.value)}
                className={cn(
                  "cursor-pointer whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-fast font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-transparent bg-surface-alt text-text-secondary hover:text-text-primary"
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {visible.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
              <p className="m-0 text-xs leading-relaxed text-text-muted">
                {activities.length === 0
                  ? "Belum ada aktivitas. Cari atau pilih makanan untuk mulai."
                  : "Tidak ada aktivitas pada saringan ini."}
              </p>
            </div>
          ) : (
            <ol className="m-0 flex list-none flex-col gap-0.5 p-0">
              {visible.map((entry) => {
                const color = colorByUser.get(entry.userId) ?? colorForUserId(entry.userId);
                const initial = (entry.username || "?").charAt(0).toUpperCase();
                const badge = activityBadge(entry.action);
                const isOwner = roleByUser.get(entry.userId) === "owner";

                return (
                  <li key={entry.id} className="flex gap-3 rounded-lg py-2.5 pl-3 pr-1 hover:bg-surface-alt">
                    <span
                      aria-hidden
                      className="w-[3px] shrink-0 self-stretch rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span
                      aria-hidden
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: color, boxShadow: `0 0 0 3px ${color}29` }}
                    >
                      {initial}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] leading-snug text-text-secondary">
                        <strong className="font-semibold text-text-primary">{entry.username}</strong>{" "}
                        {activityPhrase(entry)}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] tabular-nums text-text-muted">
                          {relativeTime(entry.timestamp, now)}
                        </span>
                        {badge ? (
                          <span
                            className={cn(
                              "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                              badge.tone === "join"
                                ? "bg-success-light text-success"
                                : "bg-surface-alt text-text-muted"
                            )}
                          >
                            {badge.label}
                          </span>
                        ) : null}
                        {isOwner ? (
                          <span className="rounded bg-warning-light px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-warning">
                            Owner
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </aside>
    </>
  );
}
