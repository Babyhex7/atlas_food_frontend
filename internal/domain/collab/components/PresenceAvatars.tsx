"use client";

import { useCollabStore } from "../store/collabStore";

export function PresenceAvatars() {
  const users = useCollabStore((s) => s.users);
  const selfUserId = useCollabStore((s) => s.selfUserId);
  const status = useCollabStore((s) => s.status);

  if (status !== "connected" && users.length === 0) {
    return null;
  }

  if (users.length === 0) {
    return (
      <span className="text-[11px] text-text-muted font-sans">Menunggu rekan…</span>
    );
  }

  return (
    <div className="flex items-center gap-2" title={`${users.length} online`}>
      <div className="flex items-center -space-x-2">
        {users.slice(0, 5).map((u) => {
          const initial = (u.displayName || "?").charAt(0).toUpperCase();
          const isSelf = u.userId === selfUserId;
          return (
            <div
              key={u.userId}
              className="w-8 h-8 rounded-full border-2 border-surface flex items-center justify-center text-xs font-semibold text-white font-sans ring-0"
              style={{ backgroundColor: u.color, zIndex: isSelf ? 2 : 1 }}
              title={`${u.displayName}${isSelf ? " (anda)" : ""} · ${u.role}`}
            >
              {initial}
            </div>
          );
        })}
        {users.length > 5 && (
          <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-alt text-text-muted text-[10px] flex items-center justify-center font-sans z-[1]">
            +{users.length - 5}
          </div>
        )}
      </div>
    </div>
  );
}
