"use client";

import { useState, useEffect, useCallback } from "react";
import { SyncEngine } from "@/internal/lib/syncEngine";
import { useToast } from "@/internal/components/ui/Toast";
import { useOnlineStatus } from "@/internal/hooks/useOnlineStatus";

export function useSyncStatus() {
  const [status, setStatus] = useState<{ isSyncing: boolean; pendingCount: number }>({
    isSyncing: false,
    pendingCount: 0,
  });
  const toast = useToast();
  const isOnline = useOnlineStatus();

  // Toast saat online/offline berubah
  useEffect(() => {
    if (!isOnline) {
      toast.offline(
        "Anda sedang offline",
        "Data survei yang diisi akan disimpan lokal & dikirim otomatis saat koneksi kembali."
      );
    } else {
      toast.online("Koneksi pulih!", "Menyinkronkan data offline ke server...");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

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
    const result = await SyncEngine.syncAllPending();
    if (result.synced > 0 && result.failed === 0) {
      toast.success(
        "Sinkronisasi berhasil ✅",
        `${result.synced} data survei berhasil dikirim ke server.`
      );
    } else if (result.synced > 0 && result.failed > 0) {
      toast.warning(
        "Sinkronisasi sebagian",
        `${result.synced} berhasil, ${result.failed} gagal dikirim dan akan dicoba ulang.`
      );
    } else if (result.failed > 0) {
      toast.error(
        "Sinkronisasi gagal",
        `${result.failed} data gagal dikirim. Akan dicoba ulang otomatis.`
      );
    }
    return result;
  }, [toast]);

  return {
    isSyncing: status.isSyncing,
    pendingCount: status.pendingCount,
    triggerManualSync,
  };
}
