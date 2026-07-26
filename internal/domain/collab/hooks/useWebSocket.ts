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
  const inviteToken = searchParams.get("invite")?.trim() || null;

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

  /** Gate mutate events untuk viewer (SoC: satu titik, semua caller otomatis aman). */
  const send: CollabSend = useCallback(
    (type, payload = {}) => {
      const role = useCollabStore.getState().selfRoomRole;
      if (COLLAB_MUTATE_TYPES.has(type) && !canEditRoom(role)) {
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
      wsRef.current?.close(1000, "no room");
      wsRef.current = null;
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
    store.setSelfUserId(session?.user?.id ?? null);

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

      ws.onopen = () => {
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
        try {
          const msg = JSON.parse(String(event.data)) as CollabIncomingMessage;
          routeCollabMessage(msg);
        } catch {
          // ignore malformed
        }
      };

      ws.onerror = () => {
        store.setLastError("Koneksi kolaborasi bermasalah");
      };

      ws.onclose = (event) => {
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
      wsRef.current?.close(1000, "unmount");
      wsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reconnect on room/token/invite
  }, [roomId, session?.access_token, session?.user?.id, inviteToken]);

  return {
    send,
    status,
    isConnected: status === "connected",
  };
}
