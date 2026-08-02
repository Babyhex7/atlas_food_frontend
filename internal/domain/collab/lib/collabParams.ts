/** Query keys yang mengikat sesi kolaborasi — harus ikut di setiap navigasi internal. */
export const COLLAB_QUERY_KEYS = ["room", "invite"] as const;

export type CollabQueryBag = {
  room?: string | null;
  invite?: string | null;
};

/** Ambil room + invite dari URLSearchParams / sessionStorage. */
export function readCollabParams(
  searchParams: { get: (key: string) => string | null },
  storageKeyPrefix?: string
): CollabQueryBag {
  const room = searchParams.get("room")?.trim() || null;
  let invite = searchParams.get("invite")?.trim() || null;

  if (!invite && storageKeyPrefix && typeof window !== "undefined") {
    invite = window.sessionStorage.getItem(`${storageKeyPrefix}:invite`)?.trim() || null;
  }

  return { room, invite };
}

/** Bangun path dengan room/invite (dan query opsional lain) tanpa menimpa yang sudah ada. */
export function withCollabParams(
  pathname: string,
  collab: CollabQueryBag,
  extra?: Record<string, string | null | undefined>
): string {
  const params = new URLSearchParams();
  if (collab.room) params.set("room", collab.room);
  if (collab.invite) params.set("invite", collab.invite);
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v == null || v === "") params.delete(k);
      else params.set(k, v);
    }
  }
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

/**
 * Gabungkan path leader ke follower: salin pathname + query relevan (q),
 * tapi room/invite tetap milik follower.
 */
export function mergeLeaderPathForFollower(
  leaderRaw: string,
  followerHref: string
): string | null {
  try {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "http://localhost";
    const leader = new URL(leaderRaw, origin);
    const follower = new URL(followerHref, origin);

    const next = new URL(leader.pathname, origin);
    // Query dari leader yang boleh di-mirror (awareness navigasi)
    const q = leader.searchParams.get("q");
    if (q) next.searchParams.set("q", q);

    const room = follower.searchParams.get("room");
    const invite = follower.searchParams.get("invite");
    if (room) next.searchParams.set("room", room);
    if (invite) next.searchParams.set("invite", invite);

    return `${next.pathname}${next.search}`;
  } catch {
    return null;
  }
}
