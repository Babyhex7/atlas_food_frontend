"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import type { CollabSend } from "./useWebSocket";
import { useCollabStore } from "../store/collabStore";

function throttle<T extends (...args: never[]) => void>(fn: T, wait: number): T {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: Parameters<T> | null = null;

  const invoke = () => {
    last = Date.now();
    timer = null;
    if (pending) {
      const args = pending;
      pending = null;
      fn(...args);
    }
  };

  return ((...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = wait - (now - last);
    pending = args;
    if (remaining <= 0 || remaining > wait) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      invoke();
    } else if (!timer) {
      timer = setTimeout(invoke, remaining);
    }
  }) as T;
}

/** Broadcast local cursor (throttled ~15fps) and expose remote cursors for current page. */
export function useLiveCursor(send: CollabSend, enabled = true) {
  const users = useCollabStore((s) => s.users);
  const selfUserId = useCollabStore((s) => s.selfUserId);
  const pathname = usePathname();

  useEffect(() => {
    if (!enabled) return;

    const handler = (e: MouseEvent) => {
      send("cursor_move", {
        x: e.clientX,
        y: e.clientY,
        page: window.location.pathname,
      });
    };

    const throttled = throttle(handler, 66);
    window.addEventListener("mousemove", throttled);
    return () => window.removeEventListener("mousemove", throttled);
  }, [send, enabled]);

  const remoteCursors = useMemo(() => {
    return users
      .filter(
        (u) =>
          u.userId !== selfUserId &&
          u.cursor &&
          (!u.cursor.page || u.cursor.page === pathname)
      )
      .map((u) => ({
        userId: u.userId,
        name: u.displayName,
        x: u.cursor!.x,
        y: u.cursor!.y,
        color: u.color,
      }));
  }, [users, selfUserId, pathname]);

  return { remoteCursors };
}
