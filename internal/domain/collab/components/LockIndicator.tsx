"use client";

import { useCollabStore } from "../store/collabStore";

type Props = {
  entityType: string;
  entityId: string;
};

export function LockIndicator({ entityType, entityId }: Props) {
  const selfUserId = useCollabStore((s) => s.selfUserId);
  const lock = useCollabStore((s) => s.locks[`${entityType}:${entityId}`]);

  if (!lock) return null;

  const isSelf = lock.lockedBy === selfUserId;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-medium font-sans border ${
        isSelf
          ? "bg-primary-light text-primary border-primary-border"
          : "bg-danger-light text-danger border-danger/30"
      }`}
    >
      {isSelf
        ? `Anda sedang mengedit (v${lock.version})`
        : `Dikunci oleh ${lock.username}`}
    </div>
  );
}
