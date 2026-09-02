import { apiClient } from "@/internal/lib/axios";
import { OfflineSubmissionService } from "@/internal/domain/survey/services/offlineService";
import { submitBatchSurveys } from "@/internal/domain/submission/services/submissionService";

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
      if (pendingItems.length === 0) {
        this.isSyncing = false;
        await this.notifyListeners();
        return { synced: 0, failed: 0 };
      }

      // Tandai semua item sebagai sedang SYNCING
      for (const item of pendingItems) {
        await OfflineSubmissionService.markSyncing(item.localId);
      }

      // Coba kirim sekaligus secara Batch Sync
      try {
        const batchPayload = pendingItems.map((item) => ({
          ...item.payload,
          local_id: item.localId,
        }));

        const batchRes = await submitBatchSurveys(batchPayload);

        for (const resItem of batchRes.results) {
          if (resItem.status === "SYNCED" || resItem.status === "SKIPPED") {
            await OfflineSubmissionService.markSynced(resItem.local_id);
            synced++;
          } else {
            await OfflineSubmissionService.markFailed(resItem.local_id, resItem.message || "Sync failed");
            failed++;
          }
        }
      } catch (batchErr) {
        // Fallback: jika batch sync gagal/error, coba kirim per item dengan Idempotency-Key
        console.warn("[SyncEngine] Batch sync failed, falling back to per-item sync:", batchErr);
        for (const item of pendingItems) {
          try {
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
