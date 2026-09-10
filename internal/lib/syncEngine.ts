import { apiClient } from "@/internal/lib/axios";
import { OfflineSubmissionService } from "@/internal/domain/survey/services/offlineService";
import { submitBatchSurveys } from "@/internal/domain/submission/services/submissionService";

export type SyncStatus = { isSyncing: boolean; pendingCount: number };

export class SyncEngine {
  private static isSyncing = false;
  private static listeners: Set<(status: SyncStatus) => void> = new Set();

  /**
   * Daftarkan listener untuk update UI real-time saat sync berjalan.
   */
  static subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.add(listener);
    this.notifyListeners();
    return () => {
      this.listeners.delete(listener);
    };
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
   * Kirim satu item lewat endpoint tunggal dengan Idempotency-Key.
   * Backend mengenali local_id yang sama sebagai duplikat, jadi mengulang
   * pengiriman item yang sebenarnya sudah masuk tetap aman.
   */
  private static async syncSingle(localId: string, payload: unknown): Promise<void> {
    await apiClient.post("/survey/submit", payload, {
      headers: { "Idempotency-Key": localId },
    });
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
      // Pulihkan dulu item yang ditinggal menggantung oleh sesi sebelumnya —
      // tanpa ini item tersebut tidak pernah masuk daftar pending lagi.
      await OfflineSubmissionService.recoverStaleSyncing();

      const pendingItems = await OfflineSubmissionService.getPendingSubmissions();
      if (pendingItems.length === 0) {
        return { synced: 0, failed: 0 };
      }

      // Tandai semua item sebagai sedang SYNCING
      for (const item of pendingItems) {
        await OfflineSubmissionService.markSyncing(item.localId);
      }

      // Lacak item mana yang sudah punya keputusan akhir. Item yang tidak
      // disebut backend dalam respons batch TIDAK boleh dibiarkan berstatus
      // SYNCING — kalau dibiarkan, ia hilang dari antrean selamanya.
      const settled = new Set<string>();

      try {
        const batchPayload = pendingItems.map((item) => ({
          ...item.payload,
          local_id: item.localId,
        }));

        const batchRes = await submitBatchSurveys(batchPayload);
        const results = Array.isArray(batchRes?.results) ? batchRes.results : [];

        for (const resItem of results) {
          if (!resItem?.local_id) continue;
          settled.add(resItem.local_id);

          if (resItem.status === "SYNCED" || resItem.status === "SKIPPED") {
            await OfflineSubmissionService.markSynced(resItem.local_id);
            synced++;
          } else {
            await OfflineSubmissionService.markFailed(
              resItem.local_id,
              resItem.message || "Sync failed"
            );
            failed++;
          }
        }
      } catch (batchErr) {
        // Fallback: jika batch sync gagal/error, coba kirim per item dengan Idempotency-Key
        console.warn("[SyncEngine] Batch sync failed, falling back to per-item sync:", batchErr);
      }

      // Sisa item: yang tidak dijawab batch, atau seluruh antrean kalau batch error.
      const leftovers = pendingItems.filter((item) => !settled.has(item.localId));
      for (const item of leftovers) {
        try {
          await this.syncSingle(item.localId, item.payload);
          await OfflineSubmissionService.markSynced(item.localId);
          synced++;
        } catch (err: unknown) {
          const errMsg = this.describeError(err);
          await OfflineSubmissionService.markFailed(item.localId, errMsg);
          failed++;
        }
      }

      if (synced > 0) {
        await OfflineSubmissionService.clearSyncedSubmissions();
      }
    } catch (globalErr) {
      console.error("[SyncEngine] Unexpected sync failure:", globalErr);
      // Apa pun yang terjadi, jangan tinggalkan item berstatus SYNCING.
      await OfflineSubmissionService.recoverStaleSyncing().catch(() => {});
    } finally {
      this.isSyncing = false;
      await this.notifyListeners();
    }

    return { synced, failed };
  }

  /** Ambil pesan error yang bisa dibaca user dari error axios / Error biasa. */
  private static describeError(err: unknown): string {
    if (typeof err === "object" && err !== null) {
      const maybeAxios = err as { response?: { data?: { message?: string } }; message?: string };
      return maybeAxios.response?.data?.message || maybeAxios.message || "Sync error";
    }
    return "Sync error";
  }

  /**
   * Inisialisasi listener global 'online' di browser.
   */
  static initAutoSync(): () => void {
    if (typeof window === "undefined") return () => {};

    const handleOnline = () => {
      console.log("[SyncEngine] Connection restored. Triggering auto-sync...");
      void this.syncAllPending();
    };

    window.addEventListener("online", handleOnline);

    // Saat aplikasi dibuka, pulihkan antrean yang ditinggal sesi sebelumnya
    // lalu sync kalau memang online.
    void OfflineSubmissionService.recoverStaleSyncing()
      .then(() => this.notifyListeners())
      .then(() => {
        if (navigator.onLine) {
          return this.syncAllPending();
        }
      })
      .catch((err) => console.warn("[SyncEngine] Init recovery failed:", err));

    return () => window.removeEventListener("online", handleOnline);
  }
}
