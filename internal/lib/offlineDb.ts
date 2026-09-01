import Dexie, { type Table } from "dexie";
import type { CreateSubmissionRequest } from "@/internal/domain/submission/types/submission";

export interface OfflineQueueItem {
  id?: number;
  localId: string;
  surveyAccessToken: string;
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
    this.version(1).stores({
      offlineQueue: "++id, &localId, surveyAccessToken, syncStatus, createdAt",
      cachedFoods: "&id, name, categoryCode",
      surveyDrafts: "&accessToken, updatedAt",
    });
  }
}

export const offlineDb = new AtlasFoodOfflineDatabase();
