import { apiClient } from "@/internal/lib/axios";
import { OfflineSubmissionService } from "@/internal/domain/survey/services/offlineService";

export class SyncEngine {
  private static isSyncing = false;
  private static listeners: Set<(status: { isSyncing: boolean; pendingCount: number }) => void> = new Set();

  /**
   * Daftarkan listener untuk update UI real-time saat sync berjalan.
   */
  static subscribe(listener: (status: { isSyncing: boolean; pendingCount: number }) => void): () => void {
    this.listeners.add(listener);
    this.notifyListeners();
    return () => this.listeners.delete(listener);
  }

  private static async notifyListeners(): Promise<void> {
    try {
      const pendingCount = await OfflineSubmissionService.getPendingCount();
      this.listeners.forEach((listener) =>
        listener({ isSyncing: this.isSyncing, pendingCount })
      );
    } catch (err) {
      console.warn("[SyncEngine] Failed to calculate pending count:", err);
    }
  }

  /**
   * Pemicu sync utama: Mengirim semua antrean submission offline ke backend.
   */
  static async syncAllPending(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing || typeof navigator === "undefined" || !navigator.onLine) {
      return { synced: 0, failed: 0 };
    }

    this.isSyncing = true;
    await this.notifyListeners();

    let synced = 0;
    let failed = 0;

    try {
      const pendingItems = await OfflineSubmissionService.getPendingSubmissions();

      for (const item of pendingItems) {
        try {
          await OfflineSubmissionService.markSyncing(item.localId);

          // Kirim ke Backend dengan Idempotency-Key header
          await apiClient.post("/survey/submit", item.payload, {
            headers: {
              "Idempotency-Key": item.localId,
            },
          });

          await OfflineSubmissionService.markSynced(item.localId);
          synced++;
        } catch (err: any) {
          const errMsg = err?.response?.data?.message || err?.message || "Sync error";
          await OfflineSubmissionService.markFailed(item.localId, errMsg);
          failed++;
        }
      }

      if (synced > 0) {
        await OfflineSubmissionService.clearSyncedSubmissions();
      }
    } catch (globalErr) {
      console.error("[SyncEngine] Unexpected sync failure:", globalErr);
    } finally {
      this.isSyncing = false;
      await this.notifyListeners();
    }

    return { synced, failed };
  }

  /**
   * Inisialisasi listener global 'online' di browser.
   */
  static initAutoSync(): () => void {
    if (typeof window === "undefined") return () => {};

    const handleOnline = () => {
      console.log("[SyncEngine] Connection restored. Triggering auto-sync...");
      this.syncAllPending();
    };

    window.addEventListener("online", handleOnline);

    // Sync awal jika online & ada antrean
    if (navigator.onLine) {
      this.syncAllPending();
    }

    return () => window.removeEventListener("online", handleOnline);
  }
}
