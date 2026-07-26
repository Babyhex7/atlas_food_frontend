export type CollabRole = "admin" | "respondent" | string;

/** Per-room role (bukan JWT app role). */
export type RoomRole = "owner" | "editor" | "viewer" | string;

export type CollabCursor = {
  x: number;
  y: number;
  page: string;
  scrollX?: number;
  scrollY?: number;
  element_id?: string;
};

export type CollabViewport = {
  page: string;
  path?: string;
  scrollX: number;
  scrollY: number;
  step?: string;
  zoom?: number;
};

export type CollabUser = {
  userId: string;
  displayName: string;
  role: CollabRole;
  roomRole?: RoomRole;
  following?: string;
  color: string;
  cursor?: CollabCursor;
  lastActive: number;
};

export type ActivityEntry = {
  id: string;
  userId: string;
  username: string;
  action: string;
  details: string;
  timestamp: number;
};

export type EntityLock = {
  entityType: string;
  entityId: string;
  lockedBy: string;
  username: string;
  version: number;
};

export type CollabIncomingMessage = {
  type: string;
  room_id?: string;
  user_id?: string;
  username?: string;
  payload?: Record<string, unknown>;
  timestamp?: string;
};

export type CollabConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error"
  | "closed";

export const COLLAB_COLORS = [
  "#E11D48",
  "#EA580C",
  "#CA8A04",
  "#16A34A",
  "#0891B2",
  "#2563EB",
  "#7C3AED",
  "#DB2777",
] as const;

export function colorForUserId(userId: string): string {
  if (!userId) return COLLAB_COLORS[0];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) % COLLAB_COLORS.length;
  }
  return COLLAB_COLORS[Math.abs(hash) % COLLAB_COLORS.length];
}
