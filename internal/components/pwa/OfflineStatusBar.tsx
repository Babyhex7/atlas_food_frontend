"use client";

import { useOnlineStatus } from "@/internal/hooks/useOnlineStatus";
import { useSyncStatus } from "@/internal/hooks/useSyncStatus";
import { WifiOff, RefreshCw, CheckCircle2, CloudUpload } from "lucide-react";

export function OfflineStatusBar() {
  const isOnline = useOnlineStatus();
  const { isSyncing, pendingCount, triggerManualSync } = useSyncStatus();

  // If online and no pending offline submissions, stay hidden
  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <div
      className={`w-full py-2.5 px-4 text-xs sm:text-sm font-medium transition-all duration-300 shadow-md ${
        !isOnline
          ? "bg-amber-600 dark:bg-amber-700 text-white"
          : "bg-sky-600 dark:bg-sky-700 text-white"
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <>
              <WifiOff className="w-4 h-4 animate-pulse text-amber-200" />
              <span>
                <strong>Mode Offline:</strong> Anda sedang tidak terhubung ke internet. Data survei tetap tersimpan di perangkat ini.
              </span>
            </>
          ) : isSyncing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-sky-200" />
              <span>Sedang melakukan sinkronisasi data survei ke server...</span>
            </>
          ) : (
            <>
              <CloudUpload className="w-4 h-4 text-sky-200" />
              <span>
                Terdapat <strong>{pendingCount} data survei</strong> di antrean lokal yang belum ter-sinkronisasi.
              </span>
            </>
          )}
        </div>

        {isOnline && pendingCount > 0 && (
          <button
            onClick={() => triggerManualSync()}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 active:bg-white/40 rounded-md font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Menyingkronkan..." : "Sinkronkan Sekarang"}
          </button>
        )}
      </div>
    </div>
  );
}
