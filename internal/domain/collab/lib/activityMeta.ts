import type { ActivityEntry } from "../types/collab";

/**
 * Metadata activity log — dipakai ActivityFeed untuk mengelompokkan, memberi
 * label, dan memformat waktu.
 *
 * Daftar action-nya mengikuti apa yang benar-benar dikirim backend
 * (internal/domain/collab: hub.go & client.go), bukan tebakan.
 */
export type ActivityGroup = "join" | "edit" | "follow";

const GROUP_BY_ACTION: Record<string, ActivityGroup> = {
  joined: "join",
  left: "join",
  follow: "follow",
  food_search: "edit",
  food_select: "edit",
  meal_add: "edit",
  portion_set: "edit",
  review_submit: "edit",
  db_edit_start: "edit",
  db_edit_save: "edit",
  db_edit_cancel: "edit",
};

/** Frasa cadangan saat backend mengirim details kosong. */
const FALLBACK_PHRASE: Record<string, string> = {
  joined: "bergabung ke sesi",
  left: "keluar dari sesi",
  follow: "mengikuti rekan",
  food_search: "mencari makanan",
  food_select: "memilih makanan",
  meal_add: "menambah makanan",
  portion_set: "mengatur porsi",
  review_submit: "mengirim laporan",
  db_edit_start: "mulai mengedit",
  db_edit_save: "menyimpan perubahan",
  db_edit_cancel: "membatalkan edit",
};

export const ACTIVITY_FILTERS: { value: ActivityGroup | "all"; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "join", label: "Gabung" },
  { value: "edit", label: "Perubahan" },
  { value: "follow", label: "Follow" },
];

export function activityGroup(action: string): ActivityGroup {
  return GROUP_BY_ACTION[action] ?? "edit";
}

/**
 * Frasa aksi tanpa nama pengguna.
 *
 * Backend menulis details dengan nama di depan ("Bagas memilih Nasi Goreng"),
 * sementara barisnya sudah menampilkan nama secara terpisah. Tanpa pemotongan
 * ini namanya tercetak dua kali.
 */
export function activityPhrase(entry: ActivityEntry): string {
  const details = (entry.details ?? "").trim();
  const name = (entry.username ?? "").trim();

  if (details && name && details.toLowerCase().startsWith(`${name.toLowerCase()} `)) {
    return details.slice(name.length + 1).trim();
  }
  if (details) return details;
  return FALLBACK_PHRASE[entry.action] ?? entry.action.replace(/_/g, " ");
}

/** Badge kecil di ujung baris — hanya untuk peristiwa masuk/keluar sesi. */
export function activityBadge(action: string): { label: string; tone: "join" | "leave" } | null {
  if (action === "joined") return { label: "Gabung", tone: "join" };
  if (action === "left") return { label: "Keluar", tone: "leave" };
  return null;
}

/** Waktu relatif ringkas: "baru saja" → "5 mnt lalu" → "2 jam lalu" → tanggal. */
export function relativeTime(timestamp: number, now = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
  if (seconds < 45) return "baru saja";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} mnt lalu`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;

  return new Date(timestamp).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
