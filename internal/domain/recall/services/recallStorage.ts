import type { RecallSession } from "../types/recall";

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
