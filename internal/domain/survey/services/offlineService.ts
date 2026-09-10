import { v4 as uuidv4 } from "uuid";
import { offlineDb, type OfflineQueueItem } from "@/internal/lib/offlineDb";
import type { CreateSubmissionRequest } from "@/internal/domain/submission/types/submission";

/** Batas percobaan otomatis sebelum item dianggap butuh perhatian manual. */
export const MAX_AUTO_RETRY = 5;

/**
 * Setelah sekian lama berstatus SYNCING, item dianggap yatim: proses yang
 * mengirimnya sudah mati (tab ditutup, browser crash) tanpa sempat menulis
 * hasil akhir.
 */
const SYNCING_STALE_MS = 2 * 60 * 1000;

export class OfflineSubmissionService {
  /**
   * Simpan submission ke antrean IndexedDB lokal saat offline (atau sebelum sync).
   * Mengembalikan localId (UUID v4) yang dipakai sebagai Idempotency-Key.
   */
  static async enqueueSubmission(
    surveyId: string,
    payload: CreateSubmissionRequest,
    existingLocalId?: string
  ): Promise<string> {
    const localId = existingLocalId || payload.local_id || uuidv4();
    const payloadWithLocalId = { ...payload, local_id: localId };

    await offlineDb.offlineQueue.put({
      localId,
      surveyId,
      payload: payloadWithLocalId,
      createdAt: new Date().toISOString(),
      syncStatus: "PENDING",
      retryCount: 0,
    });

    return localId;
  }

  /**
   * Kembalikan item yang nyangkut di SYNCING ke PENDING.
   *
   * Ini jaring pengaman terpenting antrean offline. `getPendingSubmissions`
   * hanya melihat PENDING/FAILED, jadi item yang ditandai SYNCING lalu
   * prosesnya mati di tengah jalan (tab ditutup, browser crash, jaringan
   * putus sebelum respons tiba) TIDAK akan pernah dicoba lagi — dan karena
   * tidak terhitung di pendingCount, UI-nya malah bilang "semua tersinkron"
   * sementara recall responden hilang diam-diam.
   *
   * Mengembalikan jumlah item yang dipulihkan.
   */
  static async recoverStaleSyncing(): Promise<number> {
    const threshold = Date.now() - SYNCING_STALE_MS;

    const stale = await offlineDb.offlineQueue
      .where("syncStatus")
      .equals("SYNCING")
      .filter((item) => {
        if (!item.lastAttemptAt) return true;
        const attemptedAt = new Date(item.lastAttemptAt).getTime();
        return Number.isNaN(attemptedAt) || attemptedAt < threshold;
      })
      .toArray();

    for (const item of stale) {
      await offlineDb.offlineQueue
        .where("localId")
        .equals(item.localId)
        .modify({
          syncStatus: "PENDING",
          errorMessage: "Pengiriman sebelumnya terputus — dicoba ulang otomatis",
        });
    }

    return stale.length;
  }

  /**
   * Ambil semua item yang belum ter-sync (PENDING atau FAILED dengan retryCount < MAX_AUTO_RETRY).
   */
  static async getPendingSubmissions(): Promise<OfflineQueueItem[]> {
    return offlineDb.offlineQueue
      .where("syncStatus")
      .anyOf(["PENDING", "FAILED"])
      .filter((item) => item.retryCount < MAX_AUTO_RETRY)
      .toArray();
  }

  /**
   * Item yang sudah melewati batas retry otomatis.
   *
   * Sengaja dipisah dari getPendingSubmissions supaya tidak ikut dicoba terus,
   * tapi tetap bisa ditampilkan ke user — sebelumnya item seperti ini hilang
   * total dari UI tanpa pernah memberi tahu bahwa datanya belum terkirim.
   */
  static async getStuckSubmissions(): Promise<OfflineQueueItem[]> {
    return offlineDb.offlineQueue
      .where("syncStatus")
      .equals("FAILED")
      .filter((item) => item.retryCount >= MAX_AUTO_RETRY)
      .toArray();
  }

  /**
   * Reset hitungan retry sebuah item supaya bisa dicoba lagi (aksi manual user).
   */
  static async retryStuckSubmission(localId: string): Promise<void> {
    await offlineDb.offlineQueue
      .where("localId")
      .equals(localId)
      .modify({ syncStatus: "PENDING", retryCount: 0, errorMessage: undefined });
  }

  /**
   * Dapatkan total jumlah submission yang mengantre belum ter-sync.
   * Termasuk item yang sedang dikirim dan yang macet, supaya angka di UI
   * tidak pernah menunjukkan "0" selagi masih ada data yang belum sampai server.
   */
  static async getPendingCount(): Promise<number> {
    const notDone = await offlineDb.offlineQueue
      .where("syncStatus")
      .anyOf(["PENDING", "FAILED", "SYNCING"])
      .count();
    return notDone;
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
        syncStatus: newRetryCount >= MAX_AUTO_RETRY ? "FAILED" : "PENDING",
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
