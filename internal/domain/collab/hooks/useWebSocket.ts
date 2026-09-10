"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { getAccessToken } from "@/internal/lib/cookies";
import { useAuthStore } from "@/internal/domain/auth/store/authStore";
import { buildCollabWsUrl } from "../lib/wsUrl";
import { COLLAB_MUTATE_TYPES, canEditRoom, routeCollabMessage } from "../lib/messageRouter";
import { useCollabStore } from "../store/collabStore";
import type { CollabIncomingMessage } from "../types/collab";

export type CollabSend = (type: string, payload?: Record<string, unknown>) => void;

/**
 * Connects to a collaboration room. Pass null roomId to stay disconnected.
 * Requires login (access token cookie). Invite token dari ?invite= untuk role.
 */
export function useWebSocket(roomId: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempt = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const intentionalClose = useRef(false);
  const searchParams = useSearchParams();
  const inviteFromQuery = searchParams.get("invite")?.trim() || null;

  // Persist invite token ke sessionStorage agar tetap ada setelah navigasi halaman
  // (URL-nya bersih tapi token masih dibutuhkan saat reconnect/multi-tab).
  useEffect(() => {
    if (roomId && inviteFromQuery && typeof window !== "undefined") {
      window.sessionStorage.setItem(`collab:invite:${roomId}`, inviteFromQuery);
    }
  }, [roomId, inviteFromQuery]);

  // Invite per-room di sessionStorage — navigasi tanpa ?invite= tetap bawa role.
  const inviteFromStorage =
    typeof window !== "undefined" && roomId
      ? window.sessionStorage.getItem(`collab:invite:${roomId}`)?.trim() || null
      : null;
  const inviteToken = inviteFromQuery || inviteFromStorage;

  const status = useCollabStore((s) => s.status);
  const session = useAuthStore((s) => s.session);

  const clearTimers = () => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
    reconnectTimer.current = null;
    heartbeatTimer.current = null;
  };

  const sendRaw: CollabSend = useCallback((type, payload = {}) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    try {
      ws.send(JSON.stringify({ type, payload }));
    } catch {
      useCollabStore.getState().setLastError("Gagal mengirim pesan kolaborasi");
    }
  }, []);

  /**
   * Gate event mutasi (SoC: satu titik, semua pemanggil otomatis aman).
   *
   * Di luar room = mode solo, bebas. Di dalam room, role WAJIB sudah diketahui
   * dan bernilai owner/editor — kalau belum diketahui, tahan dulu. Ini menutup
   * jeda antara socket terbuka dan state_sync tiba, yang dulu bocor karena
   * role kosong dianggap boleh.
   */
  const send: CollabSend = useCallback(
    (type, payload = {}) => {
      if (!COLLAB_MUTATE_TYPES.has(type)) {
        sendRaw(type, payload);
        return;
      }
      const { roomId: activeRoomId, selfRoomRole } = useCollabStore.getState();
      const allowed = !activeRoomId || canEditRoom(selfRoomRole);
      if (!allowed) {
        useCollabStore
          .getState()
          .setLastError("Mode Can view — Anda hanya bisa mengikuti, tidak mengubah data.");
        return;
      }
      sendRaw(type, payload);
    },
    [sendRaw]
  );

  useEffect(() => {
    intentionalClose.current = false;
    const store = useCollabStore.getState();

    if (!roomId) {
      intentionalClose.current = true;
      const previous = wsRef.current;
      wsRef.current = null;
      previous?.close(1000, "no room");
      store.setStatus("idle");
      store.setRoomId(null);
      return;
    }

    const token = getAccessToken() || session?.access_token;
    if (!token) {
      store.setStatus("error");
      store.setLastError("Login diperlukan untuk kolaborasi real-time");
      store.setRoomId(roomId);
      return;
    }

    store.setRoomId(roomId);
    // Nilai awal saja; sumber kebenarannya adalah blok "self" pada state_sync dari
    // server. Jangan timpa dengan null saat auth store belum terisi (mis. setelah
    // refresh, di mana token hanya ada di cookie).
    if (session?.user?.id) store.setSelfUserId(session.user.id);

    const connect = () => {
      clearTimers();
      store.setStatus(reconnectAttempt.current > 0 ? "reconnecting" : "connecting");

      const url = buildCollabWsUrl(roomId, token, inviteToken);
      let ws: WebSocket;
      try {
        ws = new WebSocket(url);
      } catch {
        store.setStatus("error");
        store.setLastError("Tidak dapat membuka koneksi WebSocket");
        return;
      }

      wsRef.current = ws;

      /**
       * Handler di bawah dipasang pada SATU socket tertentu. Saat effect
       * dijalankan ulang (login selesai, token di-refresh, invite berubah),
       * socket lama ditutup TAPI onclose-nya baru menyala beberapa saat
       * kemudian — saat socket baru sudah terpasang. Tanpa penjaga ini,
       * onclose milik socket lama menghapus wsRef.current milik socket baru
       * (semua send() jadi no-op diam-diam) dan menimpa status jadi "closed"
       * padahal koneksi barunya sehat.
       */
      const isCurrent = () => wsRef.current === ws;

      ws.onopen = () => {
        if (!isCurrent()) return;
        reconnectAttempt.current = 0;
        store.setStatus("connected");
        store.setLastError(null);
        sendRaw("presence_join", {
          user_id: session?.user?.id,
          display_name: session?.user?.name || session?.user?.email,
          role: session?.user?.role,
        });
        sendRaw("get_history", {});
        heartbeatTimer.current = setInterval(() => sendRaw("ping", {}), 25000);
      };

      ws.onmessage = (event) => {
        if (!isCurrent()) return;
        try {
          const msg = JSON.parse(String(event.data)) as CollabIncomingMessage;
          routeCollabMessage(msg);
        } catch {
          // ignore malformed
        }
      };

      ws.onerror = () => {
        if (!isCurrent()) return;
        store.setLastError("Koneksi kolaborasi bermasalah");
      };

      ws.onclose = (event) => {
        // Socket ini sudah digantikan — jangan sentuh state milik socket aktif.
        if (!isCurrent()) return;

        clearTimers();
        wsRef.current = null;
        if (intentionalClose.current || event.code === 1000) {
          store.setStatus("closed");
          return;
        }
        store.setStatus("reconnecting");
        const delay = Math.min(1000 * 2 ** reconnectAttempt.current, 30000);
        reconnectAttempt.current += 1;
        reconnectTimer.current = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      intentionalClose.current = true;
      clearTimers();
      const ws = wsRef.current;
      // Lepas ref DULU: begitu wsRef.current bukan ws lagi, handler socket ini
      // otomatis jadi no-op lewat isCurrent().
      wsRef.current = null;
      ws?.close(1000, "unmount");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reconnect on room/token/invite
  }, [roomId, session?.access_token, session?.user?.id, inviteToken]);

  return {
    send,
    status,
    isConnected: status === "connected",
  };
}
