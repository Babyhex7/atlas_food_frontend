"use client";

import { useState, useEffect, useCallback } from "react";
import { SyncEngine } from "@/internal/lib/syncEngine";

export function useSyncStatus() {
  const [status, setStatus] = useState<{ isSyncing: boolean; pendingCount: number }>({
    isSyncing: false,
    pendingCount: 0,
  });

  useEffect(() => {
    const unsubscribe = SyncEngine.subscribe((newStatus) => {
      setStatus(newStatus);
    });
    const cleanupAutoSync = SyncEngine.initAutoSync();

    return () => {
      unsubscribe();
      cleanupAutoSync();
    };
  }, []);

  const triggerManualSync = useCallback(async () => {
    return await SyncEngine.syncAllPending();
  }, []);

  return {
    isSyncing: status.isSyncing,
    pendingCount: status.pendingCount,
    triggerManualSync,
  };
}
