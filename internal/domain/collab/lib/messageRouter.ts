import { useCollabStore } from "../store/collabStore";
import type { CollabIncomingMessage, CollabUser, EntityLock } from "../types/collab";
import { colorForUserId } from "../types/collab";

/** Event yang mengubah data bersama — diblokir untuk room_role viewer di FE. */
export const COLLAB_MUTATE_TYPES = new Set([
  "food_search",
  "food_select",
  "meal_add",
  "portion_set",
  "portion_select",
  "review_submit",
  "db_edit_start",
  "db_edit_field",
  "db_edit_save",
  "db_edit_cancel",
]);

/**
 * Fail-closed: hanya owner & editor yang boleh mengubah data.
 *
 * Role kosong berarti "server belum memberi tahu", bukan "boleh". Versi lama
 * mengembalikan true untuk role kosong, sehingga viewer masih bisa mengubah data
 * selama jeda antara koneksi terbuka dan state_sync diterima.
 *
 * Pemanggil yang berada DI LUAR room (mode solo) harus memutuskan sendiri —
 * lihat CollabSession & useWebSocket yang mengecek roomId terlebih dahulu.
 */
export function canEditRoom(role: string | null | undefined): boolean {
  return role === "owner" || role === "editor";
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

export function mapUser(raw: Record<string, unknown>): CollabUser {
  const userId = String(raw.user_id ?? raw.userId ?? "");
  return {
    userId,
    displayName: String(raw.display_name ?? raw.username ?? "User"),
    role: String(raw.role ?? "respondent"),
    roomRole: raw.room_role ? String(raw.room_role) : undefined,
    following: raw.following ? String(raw.following) : undefined,
    color: String(raw.color ?? colorForUserId(userId)),
    lastActive: Date.now(),
  };
}

function mapLock(raw: Record<string, unknown>): EntityLock {
  return {
    entityType: String(raw.entity_type ?? ""),
    entityId: String(raw.entity_id ?? ""),
    lockedBy: String(raw.locked_by ?? ""),
    username: String(raw.username ?? ""),
    version: Number(raw.version ?? 1),
  };
}

/**
 * Router pesan WS → store. Dipisah dari hook agar mudah diuji & tidak
 * menggembungkan useWebSocket dengan parsing protocol.
 */
export function routeCollabMessage(msg: CollabIncomingMessage) {
  const store = useCollabStore.getState();
  const payload = asRecord(msg.payload);
  const userId = msg.user_id ?? String(payload.user_id ?? "");
  const username = msg.username ?? String(payload.username ?? "User");

  switch (msg.type) {
    case "presence_list": {
      const usersRaw = Array.isArray(payload.users) ? payload.users : [];
      const users = usersRaw.map((u) => mapUser(asRecord(u)));
      store.setUsers(users);
      const self = users.find((u) => u.userId === store.selfUserId);
      if (self?.roomRole) store.setSelfRoomRole(self.roomRole);
      break;
    }
    case "presence_joined":
    case "user_joined": {
      store.upsertUser(mapUser({ ...payload, user_id: userId, username }));
      break;
    }
    case "presence_left":
    case "user_left": {
      store.removeUser(userId || String(payload.user_id ?? ""));
      break;
    }
    case "cursor_update": {
      if (!userId) break;
      store.upsertUser(
        mapUser({
          user_id: userId,
          username,
          color: payload.color,
          role: payload.role,
          room_role: payload.room_role,
        })
      );
      store.updateCursor(userId, {
        x: Number(payload.x ?? 0),
        y: Number(payload.y ?? 0),
        page: String(payload.page ?? ""),
        scrollX: Number(payload.scroll_x ?? 0),
        scrollY: Number(payload.scroll_y ?? 0),
        element_id: payload.element_id ? String(payload.element_id) : undefined,
      });
      break;
    }
    case "viewport_sync": {
      // Izinkan sync awal: kalau belum set following tapi payload match pending, tetap terima
      // setelah follow_started. Urutan BE: follow_started dulu lalu viewport.
      if (!userId || userId !== store.followingUserId) break;
      store.setLeaderViewport({
        page: String(payload.page ?? payload.path ?? ""),
        path: payload.path ? String(payload.path) : undefined,
        scrollX: Number(payload.scroll_x ?? 0),
        scrollY: Number(payload.scroll_y ?? 0),
        step: payload.step ? String(payload.step) : undefined,
        zoom: payload.zoom != null ? Number(payload.zoom) : undefined,
      });
      break;
    }
    case "follow_started": {
      const followerId = String(payload.follower_id ?? userId);
      const leaderId = String(payload.leader_id ?? "");
      if (followerId === store.selfUserId && leaderId) {
        store.setFollowing({
          userId: leaderId,
          name: String(payload.leader_name ?? ""),
          color: String(payload.leader_color ?? colorForUserId(leaderId)),
        });
      }
      break;
    }
    case "follow_stopped": {
      const followerId = String(payload.follower_id ?? userId);
      if (followerId === store.selfUserId) {
        store.setFollowing({ userId: null });
      }
      break;
    }
    case "follow_state": {
      const raw = Array.isArray(payload.follows) ? payload.follows : [];
      store.setFollowPairs(
        raw.map((p) => {
          const r = asRecord(p);
          return {
            followerId: String(r.follower_id ?? ""),
            leaderId: String(r.leader_id ?? ""),
          };
        })
      );
      break;
    }
    case "user_searching":
    case "food_search_shared": {
      store.setRemoteSearch({
        userId,
        username,
        query: String(payload.query ?? ""),
      });
      break;
    }
    case "food_selected": {
      store.setLastSelectedFood({
        userId,
        username,
        foodId: String(payload.food_id ?? ""),
        foodName: String(payload.food_name ?? ""),
      });
      break;
    }
    case "meal_updated": {
      store.setLastMealUpdate({
        userId,
        username,
        mealType: String(payload.meal_type ?? ""),
        foodId: String(payload.food_id ?? ""),
        foodName: String(payload.food_name ?? ""),
      });
      break;
    }
    case "portion_updated":
    case "portion_selected": {
      store.setLastPortionUpdate({
        userId,
        username,
        foodId: String(payload.food_id ?? ""),
        portionGram: Number(payload.portion_gram ?? 0),
      });
      break;
    }
    case "activity_log": {
      store.addActivity({
        userId,
        username,
        action: String(payload.action ?? msg.type),
        details: String(payload.details ?? ""),
        timestamp: Date.now(),
      });
      break;
    }
    case "db_locked": {
      store.setLock(mapLock({ ...payload, locked_by: payload.locked_by ?? userId }));
      break;
    }
    case "db_unlocked":
    case "db_edit_saved": {
      store.releaseLock(String(payload.entity_type ?? ""), String(payload.entity_id ?? ""));
      break;
    }
    case "state_sync": {
      const locksRaw = Array.isArray(payload.locks) ? payload.locks : [];
      store.setLocksFromSnapshot(locksRaw.map((l) => mapLock(asRecord(l))));

      // Identitas diri datang dari server, bukan dari auth store. Auth store tidak
      // dipersist, jadi setelah refresh / di tab baru nilainya null dan avatar
      // sendiri ikut bisa diklik Follow → BE menolak "user_id target tidak valid".
      const self = asRecord(payload.self);
      const selfId = String(self.user_id ?? "");
      if (selfId) {
        store.setSelfUserId(selfId);
        if (self.room_role) store.setSelfRoomRole(String(self.room_role));
      }
      break;
    }
    case "error": {
      store.setLastError(String(payload.message ?? "Terjadi kesalahan kolaborasi"));
      break;
    }
    default:
      break;
  }
}
