"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { CollabSend } from "./useWebSocket";
import { useCollabStore } from "../store/collabStore";

/** Idle tanpa keystroke → bubble ditutup otomatis (Figma-like). */
const IDLE_CLOSE_MS = 7000;
/** Setelah Enter, bubble final sempat terlihat sebelum fade-out. */
const SENT_LINGER_MS = 2000;
/** Debounce pengiriman teks — jauh lebih longgar dari throttle mousemove karena ini event ketikan, bukan posisi. */
const UPDATE_DEBOUNCE_MS = 120;
const MAX_TEXT_LEN = 200;

export type LocalCursorChat = {
  x: number;
  y: number;
  text: string;
  phase: "editing" | "sent";
};

/** Tombol "/" tidak boleh membajak input form — hanya aktif saat fokus bukan elemen yang bisa diketik. */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

/**
 * Cursor chat ala Figma: tekan "/" untuk memunculkan bubble teks kecil yang
 * nempel di posisi kursor, broadcast real-time ke peer di room yang sama,
 * lalu hilang otomatis (Enter/Esc/idle). Lihat
 * docs/superpowers/specs/2026-08-16-cursor-chat-prd.md untuk desain lengkap.
 */
export function useCursorChat(send: CollabSend, enabled: boolean) {
  const pathname = usePathname();
  const selfUserId = useCollabStore((s) => s.selfUserId);
  const cursorChats = useCollabStore((s) => s.cursorChats);

  const [local, setLocal] = useState<LocalCursorChat | null>(null);
  const lastMouse = useRef({ x: 0, y: 0 });
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Menandai apakah cursor_chat_open sudah terkirim untuk sesi bubble saat ini —
  // dipakai closeLocal supaya tidak kirim cursor_chat_close tanpa open sebelumnya.
  const openedRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (sentTimer.current) clearTimeout(sentTimer.current);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    idleTimer.current = null;
    sentTimer.current = null;
    debounceTimer.current = null;
  }, []);

  const closeLocal = useCallback(() => {
    clearTimers();
    if (openedRef.current) {
      send("cursor_chat_close", {});
      openedRef.current = false;
    }
    setLocal(null);
  }, [clearTimers, send]);

  const scheduleIdleClose = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(closeLocal, IDLE_CLOSE_MS);
  }, [closeLocal]);

  // Lacak posisi mouse terakhir tanpa re-render — cukup jadi anchor saat "/" ditekan.
  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: MouseEvent) => {
      lastMouse.current = { x: e.clientX + window.scrollX, y: e.clientY + window.scrollY };
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [enabled]);

  // Trigger "/" — diabaikan total kalau fokus sedang di form field manapun.
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (local) return;
      if (e.key !== "/") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isEditableTarget(e.target)) return;
      e.preventDefault();
      const { x, y } = lastMouse.current;
      setLocal({ x, y, text: "", phase: "editing" });
      openedRef.current = true;
      send("cursor_chat_open", { x, y, text: "" });
      scheduleIdleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, local, send, scheduleIdleClose]);

  // Ganti halaman atau koneksi putus selagi bubble terbuka → tutup, jangan menggantung.
  // closeLocal juga mengirim cursor_chat_close (side effect jaringan) — tidak bisa
  // dipindah ke pola "adjust state during render" karena render harus tetap murni.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- closeLocal mengirim WS message, bukan sekadar setState
    closeLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sengaja hanya reset saat path berubah
  }, [pathname]);

  useEffect(() => {
    if (!enabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- closeLocal mengirim WS message, bukan sekadar setState
      closeLocal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sengaja hanya reset saat enabled berubah
  }, [enabled]);

  useEffect(() => clearTimers, [clearTimers]);

  const updateText = useCallback(
    (text: string) => {
      const trimmed = text.slice(0, MAX_TEXT_LEN);
      setLocal((prev) => (prev && prev.phase === "editing" ? { ...prev, text: trimmed } : prev));
      scheduleIdleClose();
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        send("cursor_chat_update", { text: trimmed });
      }, UPDATE_DEBOUNCE_MS);
    },
    [scheduleIdleClose, send]
  );

  const commit = useCallback(() => {
    if (!local || local.phase !== "editing") return;
    if (!local.text.trim()) {
      closeLocal();
      return;
    }
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    if (idleTimer.current) {
      clearTimeout(idleTimer.current);
      idleTimer.current = null;
    }
    send("cursor_chat_update", { text: local.text });
    setLocal({ ...local, phase: "sent" });
    sentTimer.current = setTimeout(closeLocal, SENT_LINGER_MS);
  }, [local, send, closeLocal]);

  const cancel = useCallback(() => {
    closeLocal();
  }, [closeLocal]);

  const remoteBubbles = useMemo(() => {
    const scrollX = typeof window !== "undefined" ? window.scrollX : 0;
    const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
    return Object.values(cursorChats)
      .filter((b) => b.userId !== selfUserId && b.text)
      .map((b) => ({ ...b, x: b.x - scrollX, y: b.y - scrollY }));
  }, [cursorChats, selfUserId]);

  return { local, updateText, commit, cancel, remoteBubbles };
}
