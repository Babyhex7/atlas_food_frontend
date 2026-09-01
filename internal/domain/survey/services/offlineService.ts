import { v4 as uuidv4 } from "uuid";
import { offlineDb, type OfflineQueueItem } from "@/internal/lib/offlineDb";
import type { CreateSubmissionRequest } from "@/internal/domain/submission/types/submission";

export class OfflineSubmissionService {
  /**
   * Simpan submission ke antrean IndexedDB lokal saat offline (atau sebelum sync).
   * Mengembalikan localId (UUID v4) yang dipakai sebagai Idempotency-Key.
   */
  static async enqueueSubmission(
    surveyAccessToken: string,
    payload: CreateSubmissionRequest,
    existingLocalId?: string
  ): Promise<string> {
    const localId = existingLocalId || payload.local_id || uuidv4();
    const payloadWithLocalId = { ...payload, local_id: localId };

    await offlineDb.offlineQueue.put({
      localId,
      surveyAccessToken,
      payload: payloadWithLocalId,
      createdAt: new Date().toISOString(),
      syncStatus: "PENDING",
      retryCount: 0,
    });

    return localId;
  }

  /**
   * Ambil semua item yang belum ter-sync (PENDING atau FAILED dengan retryCount < 5).
   */
  static async getPendingSubmissions(): Promise<OfflineQueueItem[]> {
    return offlineDb.offlineQueue
      .where("syncStatus")
      .anyOf(["PENDING", "FAILED"])
      .filter((item) => item.retryCount < 5)
      .toArray();
  }

  /**
   * Dapatkan total jumlah submission yang mengantre belum ter-sync.
   */
  static async getPendingCount(): Promise<number> {
    const items = await this.getPendingSubmissions();
    return items.length;
  }

  /**
   * Tandai status item sedang dikirim ke backend.
   */
  static async markSyncing(localId: string): Promise<void> {
    await offlineDb.offlineQueue
      .where("localId")
      .equals(localId)
      .modify({ syncStatus: "SYNCING", lastAttemptAt: new Date().toISOString() });
  }

  /**
   * Tandai status item berhasil dikirim (SYNCED).
   */
  static async markSynced(localId: string): Promise<void> {
    await offlineDb.offlineQueue
      .where("localId")
      .equals(localId)
      .modify({ syncStatus: "SYNCED", lastAttemptAt: new Date().toISOString() });
  }

  /**
   * Tandai status item gagal dikirim & tambah retry count.
   */
  static async markFailed(localId: string, errorMessage: string): Promise<void> {
    const item = await offlineDb.offlineQueue.where("localId").equals(localId).first();
    if (!item) return;

    const newRetryCount = item.retryCount + 1;
    await offlineDb.offlineQueue
      .where("localId")
      .equals(localId)
      .modify({
        syncStatus: newRetryCount >= 5 ? "FAILED" : "PENDING",
        retryCount: newRetryCount,
        errorMessage,
        lastAttemptAt: new Date().toISOString(),
      });
  }

  /**
   * Bersihkan data yang sudah sukses SYNCED.
   */
  static async clearSyncedSubmissions(): Promise<void> {
    await offlineDb.offlineQueue.where("syncStatus").equals("SYNCED").delete();
  }
}
