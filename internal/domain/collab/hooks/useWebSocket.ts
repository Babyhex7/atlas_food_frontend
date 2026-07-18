"use client";

import { useCallback, useEffect, useRef } from "react";
import { getAccessToken } from "@/internal/lib/cookies";
import { useAuthStore } from "@/internal/domain/auth/store/authStore";
import { buildCollabWsUrl } from "../lib/wsUrl";
import { useCollabStore } from "../store/collabStore";
import type { CollabIncomingMessage, CollabUser, EntityLock } from "../types/collab";
import { colorForUserId } from "../types/collab";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function mapUser(raw: Record<string, unknown>): CollabUser {
  const userId = String(raw.user_id ?? raw.userId ?? "");
  return {
    userId,
    displayName: String(raw.display_name ?? raw.username ?? "User"),
    role: String(raw.role ?? "respondent"),
    color: String(raw.color ?? colorForUserId(userId)),
    lastActive: Date.now(),
  };
}

function mapLock(raw: Record<string, unknown>): EntityLock {
  return {
    entityType: String(raw.entity_type ?? ""),
    entityId: String(raw.entity_id ?? ""),
    lockedBy: String(raw.locked_by ?? ""),
    username: String(raw.username ?? ""),
    version: Number(raw.version ?? 1),
  };
}

function routeMessage(msg: CollabIncomingMessage) {
  const store = useCollabStore.getState();
  const payload = asRecord(msg.payload);
  const userId = msg.user_id ?? String(payload.user_id ?? "");
  const username = msg.username ?? String(payload.username ?? "User");

  switch (msg.type) {
    case "presence_list": {
      const usersRaw = Array.isArray(payload.users) ? payload.users : [];
      store.setUsers(usersRaw.map((u) => mapUser(asRecord(u))));
      break;
    }
    case "presence_joined":
    case "user_joined": {
      store.upsertUser(mapUser({ ...payload, user_id: userId, username }));
      break;
    }
    case "presence_left":
    case "user_left": {
      store.removeUser(userId || String(payload.user_id ?? ""));
      break;
    }
    case "cursor_update": {
      if (!userId) break;
      store.upsertUser(
        mapUser({
          user_id: userId,
          username,
          color: payload.color,
          role: payload.role,
        })
      );
      store.updateCursor(userId, {
        x: Number(payload.x ?? 0),
        y: Number(payload.y ?? 0),
        page: String(payload.page ?? ""),
        element_id: payload.element_id ? String(payload.element_id) : undefined,
      });
      break;
    }
    case "user_searching":
    case "food_search_shared": {
      store.setRemoteSearch({
        userId,
        username,
        query: String(payload.query ?? ""),
      });
      break;
    }
    case "food_selected": {
      store.setLastSelectedFood({
        userId,
        username,
        foodId: String(payload.food_id ?? ""),
        foodName: String(payload.food_name ?? ""),
      });
      break;
    }
    case "meal_updated": {
      store.setLastMealUpdate({
        userId,
        username,
        mealType: String(payload.meal_type ?? ""),
        foodId: String(payload.food_id ?? ""),
        foodName: String(payload.food_name ?? ""),
      });
      break;
    }
    case "portion_updated":
    case "portion_selected": {
      store.setLastPortionUpdate({
        userId,
        username,
        foodId: String(payload.food_id ?? ""),
        portionGram: Number(payload.portion_gram ?? 0),
      });
      break;
    }
    case "activity_log": {
      store.addActivity({
        userId,
        username,
        action: String(payload.action ?? msg.type),
        details: String(payload.details ?? ""),
        timestamp: Date.now(),
      });
      break;
    }
    case "db_locked": {
      store.setLock(mapLock({ ...payload, locked_by: payload.locked_by ?? userId }));
      break;
    }
    case "db_unlocked": {
      store.releaseLock(String(payload.entity_type ?? ""), String(payload.entity_id ?? ""));
      break;
    }
    case "db_edit_saved": {
      store.releaseLock(String(payload.entity_type ?? ""), String(payload.entity_id ?? ""));
      break;
    }
    case "state_sync": {
      const locksRaw = Array.isArray(payload.locks) ? payload.locks : [];
      store.setLocksFromSnapshot(locksRaw.map((l) => mapLock(asRecord(l))));
      break;
    }
    case "error": {
      store.setLastError(String(payload.message ?? "Terjadi kesalahan kolaborasi"));
      break;
    }
    default:
      break;
  }
}

export type CollabSend = (type: string, payload?: Record<string, unknown>) => void;

/**
 * Connects to a collaboration room. Pass null roomId to stay disconnected.
 * Requires login (access token cookie).
 */
export function useWebSocket(roomId: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempt = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const intentionalClose = useRef(false);

  const status = useCollabStore((s) => s.status);
  const session = useAuthStore((s) => s.session);

  const clearTimers = () => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
    reconnectTimer.current = null;
    heartbeatTimer.current = null;
  };

  const send: CollabSend = useCallback((type, payload = {}) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    try {
      ws.send(JSON.stringify({ type, payload }));
    } catch {
      useCollabStore.getState().setLastError("Gagal mengirim pesan kolaborasi");
    }
  }, []);

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

      const url = buildCollabWsUrl(roomId, token);
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
        send("presence_join", {
          user_id: session?.user?.id,
          display_name: session?.user?.name || session?.user?.email,
          role: session?.user?.role,
        });
        send("get_history", {});
        heartbeatTimer.current = setInterval(() => send("ping", {}), 25000);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(String(event.data)) as CollabIncomingMessage;
          routeMessage(msg);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reconnect on room/token identity
  }, [roomId, session?.access_token, session?.user?.id]);

  return {
    send,
    status,
    isConnected: status === "connected",
  };
}
