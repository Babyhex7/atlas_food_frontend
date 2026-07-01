import type { RecallSession, RecallMealOption } from "../types/recall";

const storageKey = "atlas-food-recall-session";

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

export function saveRecallSession(session: RecallSession) {
  getStorage()?.setItem(storageKey, JSON.stringify(session));
}

export function getRecallSession() {
  const value = getStorage()?.getItem(storageKey);
  return value ? (JSON.parse(value) as RecallSession) : null;
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
