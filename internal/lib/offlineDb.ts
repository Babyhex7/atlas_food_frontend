import Dexie, { type Table } from "dexie";
import type { CreateSubmissionRequest } from "@/internal/domain/submission/types/submission";

export interface OfflineQueueItem {
  id?: number;
  localId: string;
  /**
   * ID survei pemilik submission ini. Dulu bernama `surveyAccessToken`,
   * padahal yang diisi pemanggil selalu `payload.survey_id` — namanya
   * menyesatkan siapa pun yang membaca antrean ini.
   */
  surveyId: string;
  payload: CreateSubmissionRequest;
  createdAt: string;
  syncStatus: "PENDING" | "SYNCING" | "SYNCED" | "FAILED";
  retryCount: number;
  lastAttemptAt?: string;
  errorMessage?: string;
}

export interface CachedFood {
  id: string;
  name: string;
  categoryCode?: string;
  photoUrl?: string;
  portionGram?: number;
  cachedAt: string;
}

export interface SurveyDraft {
  accessToken: string;
  lastStep: string;
  draftData: Partial<CreateSubmissionRequest>;
  updatedAt: string;
}

class AtlasFoodOfflineDatabase extends Dexie {
  offlineQueue!: Table<OfflineQueueItem, number>;
  cachedFoods!: Table<CachedFood, string>;
  surveyDrafts!: Table<SurveyDraft, string>;

  constructor() {
    super("AtlasFoodOfflineDB");
    // v1 memakai index bernama `surveyAccessToken`. v2 menggantinya dengan
    // `surveyId`; Dexie memigrasikan data lama secara otomatis, isi baris
    // tidak berubah — hanya nama field/indeksnya.
    this.version(1).stores({
      offlineQueue: "++id, &localId, surveyAccessToken, syncStatus, createdAt",
      cachedFoods: "&id, name, categoryCode",
      surveyDrafts: "&accessToken, updatedAt",
    });
    this.version(2)
      .stores({
        offlineQueue: "++id, &localId, surveyId, syncStatus, createdAt",
        cachedFoods: "&id, name, categoryCode",
        surveyDrafts: "&accessToken, updatedAt",
      })
      .upgrade((tx) =>
        tx
          .table("offlineQueue")
          .toCollection()
          .modify((item: Record<string, unknown>) => {
            if (item.surveyId === undefined && item.surveyAccessToken !== undefined) {
              item.surveyId = item.surveyAccessToken;
              delete item.surveyAccessToken;
            }
          })
      );
  }
}

export const offlineDb = new AtlasFoodOfflineDatabase();
