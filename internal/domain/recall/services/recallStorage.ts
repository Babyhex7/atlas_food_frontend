import type { RecallSession } from "../types/recall";

const storageKey = "atlas-food-recall-session";

export function saveRecallSession(session: RecallSession) {
  window.localStorage.setItem(storageKey, JSON.stringify(session));
}

export function getRecallSession() {
  const value = window.localStorage.getItem(storageKey);
  return value ? (JSON.parse(value) as RecallSession) : null;
}

export function clearRecallSession() {
  window.localStorage.removeItem(storageKey);
}
