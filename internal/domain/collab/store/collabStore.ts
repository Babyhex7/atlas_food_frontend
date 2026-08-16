import { create } from "zustand";
import type {
  ActivityEntry,
  CollabConnectionStatus,
  CollabCursor,
  CollabUser,
  CollabViewport,
  EntityLock,
  RoomRole,
} from "../types/collab";
import { colorForUserId } from "../types/collab";

type FollowPair = { followerId: string; leaderId: string };

type CollabState = {
  status: CollabConnectionStatus;
  roomId: string | null;
  selfUserId: string | null;
  selfRoomRole: RoomRole | null;
  users: CollabUser[];
  activities: ActivityEntry[];
  locks: Record<string, EntityLock>;
  /** User yang sedang kita ikuti (Figma follow). */
  followingUserId: string | null;
  followingUserName: string | null;
  followingUserColor: string | null;
  /** Snapshot follow graph di room. */
  followPairs: FollowPair[];
  /** Viewport terakhir dari leader (untuk mirror). */
  leaderViewport: CollabViewport | null;
  /**
   * Langkah wizard yang sedang kita buka. Disimpan di store — bukan lokal di
   * komponen — karena setiap viewport_update (termasuk yang dipicu scroll di
   * useLiveCursor) wajib menyertakannya. Backend menyimpan viewport terakhir apa
   * adanya, jadi satu pesan tanpa `step` akan menghapus jejak langkah leader dan
   * follower yang baru bergabung mendarat di langkah yang salah.
   */
  localStep: string | null;
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
  /**
   * Waktu terakhir panel aktivitas dibuka. Dipakai menghitung lencana "belum
   * dibaca" di tombol aktivitas — tanpa ini tombolnya tidak pernah bisa
   * memberitahu ada apa-apa tanpa dibuka lebih dulu.
   */
  lastSeenActivityAt: number;

  setStatus: (status: CollabConnectionStatus) => void;
  setRoomId: (roomId: string | null) => void;
  setSelfUserId: (userId: string | null) => void;
  setSelfRoomRole: (role: RoomRole | null) => void;
  setUsers: (users: CollabUser[]) => void;
  upsertUser: (user: CollabUser) => void;
  removeUser: (userId: string) => void;
  updateCursor: (userId: string, cursor: CollabCursor) => void;
  addActivity: (activity: Omit<ActivityEntry, "id"> & { id?: string }) => void;
  setLock: (lock: EntityLock) => void;
  releaseLock: (entityType: string, entityId: string) => void;
  setLocksFromSnapshot: (locks: EntityLock[]) => void;
  setFollowing: (opts: {
    userId: string | null;
    name?: string | null;
    color?: string | null;
  }) => void;
  setFollowPairs: (pairs: FollowPair[]) => void;
  setLeaderViewport: (vp: CollabViewport | null) => void;
  setLocalStep: (step: string | null) => void;
  setRemoteSearch: (value: CollabState["remoteSearch"]) => void;
  setLastSelectedFood: (value: CollabState["lastSelectedFood"]) => void;
  setLastMealUpdate: (value: CollabState["lastMealUpdate"]) => void;
  setLastPortionUpdate: (value: CollabState["lastPortionUpdate"]) => void;
  setLastError: (message: string | null) => void;
  setFeedOpen: (open: boolean) => void;
  markActivitiesSeen: () => void;
  reset: () => void;
};

const initial = {
  status: "idle" as CollabConnectionStatus,
  roomId: null as string | null,
  selfUserId: null as string | null,
  selfRoomRole: null as RoomRole | null,
  users: [] as CollabUser[],
  activities: [] as ActivityEntry[],
  locks: {} as Record<string, EntityLock>,
  followingUserId: null as string | null,
  followingUserName: null as string | null,
  followingUserColor: null as string | null,
  followPairs: [] as FollowPair[],
  leaderViewport: null as CollabViewport | null,
  localStep: null as string | null,
  remoteSearch: null as CollabState["remoteSearch"],
  lastSelectedFood: null as CollabState["lastSelectedFood"],
  lastMealUpdate: null as CollabState["lastMealUpdate"],
  lastPortionUpdate: null as CollabState["lastPortionUpdate"],
  lastError: null as string | null,
  feedOpen: false,
  lastSeenActivityAt: 0,
};

function lockKey(entityType: string, entityId: string) {
  return `${entityType}:${entityId}`;
}

export const useCollabStore = create<CollabState>((set) => ({
  ...initial,

  setStatus: (status) => set({ status }),
  setRoomId: (roomId) => set({ roomId }),
  setSelfUserId: (selfUserId) => set({ selfUserId }),
  setSelfRoomRole: (selfRoomRole) => set({ selfRoomRole }),

  setUsers: (users) => set({ users }),

  upsertUser: (user) =>
    set((s) => {
      const idx = s.users.findIndex((u) => u.userId === user.userId);
      if (idx === -1) return { users: [...s.users, user] };
      const prev = s.users[idx];
      // Jangan overwrite field opsional dengan undefined (cursor_update sering kirim parsial).
      const merged: CollabUser = {
        ...prev,
        ...user,
        roomRole: user.roomRole ?? prev.roomRole,
        following: user.following ?? prev.following,
        cursor: user.cursor ?? prev.cursor,
        color: user.color || prev.color,
        displayName: user.displayName || prev.displayName,
      };
      const next = [...s.users];
      next[idx] = merged;
      return { users: next };
    }),

  removeUser: (userId) =>
    set((s) => {
      const next: Partial<CollabState> = {
        users: s.users.filter((u) => u.userId !== userId),
      };
      if (s.followingUserId === userId) {
        next.followingUserId = null;
        next.followingUserName = null;
        next.followingUserColor = null;
        next.leaderViewport = null;
      }
      return next;
    }),

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

  setFollowing: ({ userId, name, color }) =>
    set({
      followingUserId: userId,
      followingUserName: userId ? (name ?? null) : null,
      followingUserColor: userId ? (color ?? null) : null,
      ...(userId ? {} : { leaderViewport: null }),
    }),

  setFollowPairs: (followPairs) => set({ followPairs }),
  setLeaderViewport: (leaderViewport) => set({ leaderViewport }),
  setLocalStep: (localStep) => set({ localStep }),
  setRemoteSearch: (remoteSearch) => set({ remoteSearch }),
  setLastSelectedFood: (lastSelectedFood) => set({ lastSelectedFood }),
  setLastMealUpdate: (lastMealUpdate) => set({ lastMealUpdate }),
  setLastPortionUpdate: (lastPortionUpdate) => set({ lastPortionUpdate }),
  setLastError: (lastError) => set({ lastError }),
  setFeedOpen: (feedOpen) =>
    set(feedOpen ? { feedOpen, lastSeenActivityAt: Date.now() } : { feedOpen }),
  markActivitiesSeen: () => set({ lastSeenActivityAt: Date.now() }),
  reset: () => set({ ...initial }),
}));
