"use client";

import { useEffect, useRef, useState } from "react";
import type { LocalCursorChat } from "../hooks/useCursorChat";
import type { CursorChatBubble } from "../types/collab";

function inViewport(x: number, y: number) {
  if (typeof window === "undefined") return true;
  return x >= -40 && y >= -40 && x <= window.innerWidth + 40 && y <= window.innerHeight + 40;
}

type Props = {
  local: LocalCursorChat | null;
  onLocalChange: (text: string) => void;
  onLocalCommit: () => void;
  onLocalCancel: () => void;
  remoteBubbles: CursorChatBubble[];
};

/**
 * Bubble teks ephemeral ala Figma "/" — nempel di kursor, bukan panel chat.
 * `local` adalah input milik user sendiri (optimistic, tidak nunggu round-trip
 * server); `remoteBubbles` sudah dikonversi ke koordinat viewport oleh
 * useCursorChat.
 */
export function CursorChatOverlay({
  local,
  onLocalChange,
  onLocalCommit,
  onLocalCancel,
  remoteBubbles,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [, setScrollTick] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollTick((t) => (t + 1) % 10000);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    const mainEl = document.querySelector<HTMLElement>("main.overflow-y-auto, main[class*='overflow-y-auto']");
    if (mainEl) {
      mainEl.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (mainEl) mainEl.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (local?.phase === "editing") inputRef.current?.focus();
  }, [local?.phase]);

  if (!local && remoteBubbles.length === 0) return null;

  // Baca scroll offset aktif (baik window maupun scrollable main)
  const mainEl = typeof document !== "undefined"
    ? document.querySelector<HTMLElement>("main.overflow-y-auto, main[class*='overflow-y-auto']")
    : null;
  const currentScrollX = mainEl ? mainEl.scrollLeft : (typeof window !== "undefined" ? window.scrollX : 0);
  const currentScrollY = mainEl ? mainEl.scrollTop : (typeof window !== "undefined" ? window.scrollY : 0);

  const localClientX = local ? local.x - currentScrollX : 0;
  const localClientY = local ? local.y - currentScrollY : 0;

  return (
    // Tidak aria-hidden di container: saat "editing" ada <input> fokusable di
    // dalamnya, dan aria-hidden pada ancestor elemen yang fokusable adalah
    // pelanggaran a11y (screen reader + sebagian browser akan bingung).
    // Bagian dekoratif (bubble terkirim, bubble peer) diberi aria-hidden sendiri-sendiri.
    <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      {local ? (
        <div
          className="absolute"
          style={{ left: localClientX + 6, top: localClientY + 16 }}
        >
          {local.phase === "editing" ? (
            <input
              ref={inputRef}
              value={local.text}
              onChange={(e) => onLocalChange(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") {
                  e.preventDefault();
                  onLocalCommit();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  onLocalCancel();
                }
              }}
              onBlur={onLocalCommit}
              placeholder="Ketik pesan…"
              aria-label="Cursor chat"
              maxLength={200}
              className="pointer-events-auto h-7 w-52 rounded-full border-[1.5px] border-primary bg-surface px-3 font-sans text-xs text-text-primary shadow-lg outline-none"
            />
          ) : (
            <span
              aria-hidden
              className="pointer-events-none inline-flex max-w-[220px] items-center truncate rounded-full bg-primary px-3 py-1 text-xs font-medium text-white shadow-lg font-sans"
            >
              {local.text}
            </span>
          )}
        </div>
      ) : null}

      {remoteBubbles.map((b) => {
        if (!inViewport(b.x, b.y)) return null;
        return (
          <div
            key={b.userId}
            aria-hidden
            className="absolute transition-[left,top] duration-75 ease-linear will-change-[left,top]"
            style={{ left: b.x + 6, top: b.y + 16 }}
          >
            <span
              className="inline-flex max-w-[220px] items-center truncate rounded-full px-3 py-1 text-xs font-medium text-white shadow-lg font-sans"
              style={{ backgroundColor: b.color }}
              title={b.displayName}
            >
              {b.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}
