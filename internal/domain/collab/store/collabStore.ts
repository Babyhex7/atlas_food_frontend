import { create } from "zustand";
import type {
  ActivityEntry,
  CollabConnectionStatus,
  CollabCursor,
  CollabUser,
  EntityLock,
} from "../types/collab";
import { colorForUserId } from "../types/collab";

type CollabState = {
  status: CollabConnectionStatus;
  roomId: string | null;
  selfUserId: string | null;
  users: CollabUser[];
  activities: ActivityEntry[];
  locks: Record<string, EntityLock>;
  remoteSearch: { userId: string; username: string; query: string } | null;
  lastSelectedFood: {
    userId: string;
    username: string;
    foodId: string;
    foodName: string;
  } | null;
  lastMealUpdate: {
    userId: string;
    username: string;
    mealType: string;
    foodId: string;
    foodName: string;
  } | null;
  lastPortionUpdate: {
    userId: string;
    username: string;
    foodId: string;
    portionGram: number;
  } | null;
  lastError: string | null;
  feedOpen: boolean;

  setStatus: (status: CollabConnectionStatus) => void;
  setRoomId: (roomId: string | null) => void;
  setSelfUserId: (userId: string | null) => void;
  setUsers: (users: CollabUser[]) => void;
  upsertUser: (user: CollabUser) => void;
  removeUser: (userId: string) => void;
  updateCursor: (userId: string, cursor: CollabCursor) => void;
  addActivity: (activity: Omit<ActivityEntry, "id"> & { id?: string }) => void;
  setLock: (lock: EntityLock) => void;
  releaseLock: (entityType: string, entityId: string) => void;
  setLocksFromSnapshot: (locks: EntityLock[]) => void;
  setRemoteSearch: (value: CollabState["remoteSearch"]) => void;
  setLastSelectedFood: (value: CollabState["lastSelectedFood"]) => void;
  setLastMealUpdate: (value: CollabState["lastMealUpdate"]) => void;
  setLastPortionUpdate: (value: CollabState["lastPortionUpdate"]) => void;
  setLastError: (message: string | null) => void;
  setFeedOpen: (open: boolean) => void;
  reset: () => void;
};

const initial = {
  status: "idle" as CollabConnectionStatus,
  roomId: null as string | null,
  selfUserId: null as string | null,
  users: [] as CollabUser[],
  activities: [] as ActivityEntry[],
  locks: {} as Record<string, EntityLock>,
  remoteSearch: null as CollabState["remoteSearch"],
  lastSelectedFood: null as CollabState["lastSelectedFood"],
  lastMealUpdate: null as CollabState["lastMealUpdate"],
  lastPortionUpdate: null as CollabState["lastPortionUpdate"],
  lastError: null as string | null,
  feedOpen: false,
};

function lockKey(entityType: string, entityId: string) {
  return `${entityType}:${entityId}`;
}

export const useCollabStore = create<CollabState>((set) => ({
  ...initial,

  setStatus: (status) => set({ status }),
  setRoomId: (roomId) => set({ roomId }),
  setSelfUserId: (selfUserId) => set({ selfUserId }),

  setUsers: (users) => set({ users }),

  upsertUser: (user) =>
    set((s) => {
      const idx = s.users.findIndex((u) => u.userId === user.userId);
      if (idx === -1) return { users: [...s.users, user] };
      const next = [...s.users];
      next[idx] = { ...next[idx], ...user };
      return { users: next };
    }),

  removeUser: (userId) =>
    set((s) => ({ users: s.users.filter((u) => u.userId !== userId) })),

  updateCursor: (userId, cursor) =>
    set((s) => ({
      users: s.users.map((u) =>
        u.userId === userId
          ? {
              ...u,
              cursor,
              lastActive: Date.now(),
              color: u.color || colorForUserId(userId),
            }
          : u
      ),
    })),

  addActivity: (activity) =>
    set((s) => {
      const timestamp = activity.timestamp ?? Date.now();
      // Dedup join spam dari reconnect / double socket
      if (activity.action === "joined" && activity.userId) {
        const recentJoin = s.activities.find(
          (a) =>
            a.action === "joined" &&
            a.userId === activity.userId &&
            timestamp - a.timestamp < 8000
        );
        if (recentJoin) return s;
      }

      return {
        activities: [
          {
            id:
              activity.id ??
              `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            userId: activity.userId,
            username: activity.username,
            action: activity.action,
            details: activity.details,
            timestamp,
          },
          ...s.activities,
        ].slice(0, 100),
      };
    }),

  setLock: (lock) =>
    set((s) => ({
      locks: { ...s.locks, [lockKey(lock.entityType, lock.entityId)]: lock },
    })),

  releaseLock: (entityType, entityId) =>
    set((s) => {
      const next = { ...s.locks };
      delete next[lockKey(entityType, entityId)];
      return { locks: next };
    }),

  setLocksFromSnapshot: (locks) =>
    set({
      locks: Object.fromEntries(
        locks.map((l) => [lockKey(l.entityType, l.entityId), l])
      ),
    }),

  setRemoteSearch: (remoteSearch) => set({ remoteSearch }),
  setLastSelectedFood: (lastSelectedFood) => set({ lastSelectedFood }),
  setLastMealUpdate: (lastMealUpdate) => set({ lastMealUpdate }),
  setLastPortionUpdate: (lastPortionUpdate) => set({ lastPortionUpdate }),
  setLastError: (lastError) => set({ lastError }),
  setFeedOpen: (feedOpen) => set({ feedOpen }),
  reset: () => set({ ...initial }),
}));
