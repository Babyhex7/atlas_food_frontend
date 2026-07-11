import type { RecallSession, RecallMealOption } from "../types/recall";

const storageKey = "atlas-food-recall-session";
// Progress recall bisa diisi bertahap sepanjang hari (mis. di HP, antar tab/app
// switch) — pakai localStorage (bukan sessionStorage) supaya tidak hilang saat
// tab ditutup, tapi tetap dibatasi TTL agar sesi basi otomatis dianggap kadaluarsa.
const TTL_MS = 24 * 60 * 60 * 1000; // 24 jam

type StoredEnvelope = {
  savedAt: number;
  session: RecallSession;
};

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function saveRecallSession(session: RecallSession) {
  const envelope: StoredEnvelope = { savedAt: Date.now(), session };
  getStorage()?.setItem(storageKey, JSON.stringify(envelope));
}

export function getRecallSession() {
  const value = getStorage()?.getItem(storageKey);
  if (!value) return null;

  try {
    const envelope = JSON.parse(value) as StoredEnvelope;
    if (!envelope?.session || typeof envelope.savedAt !== "number") return null;
    if (Date.now() - envelope.savedAt > TTL_MS) {
      clearRecallSession();
      return null;
    }
    return envelope.session;
  } catch {
    clearRecallSession();
    return null;
  }
}

export function clearRecallSession() {
  getStorage()?.removeItem(storageKey);
}

export function initRecallSession(data: {
  survey_id: string;
  access_token: string;
  participant_id: string;
  respondent_name: string;
  available_meals?: RecallMealOption[];
}): RecallSession {
  const session: RecallSession = {
    survey_id: data.survey_id,
    access_token: data.access_token,
    participant_id: data.participant_id,
    respondent_name: data.respondent_name,
    available_meals: data.available_meals,
    current_step: "select_meal",
    current_meal: {
      type: data.available_meals?.[0]?.name ?? "",
      time: data.available_meals?.[0]?.time ?? "07:00",
    },
    portion_food_index: 0,
    meals: [],
    missing_foods: [],
  };
  saveRecallSession(session);
  return session;
}
