/** Build WebSocket URL for collab room (JWT via query token for browser handshake). */
export function buildCollabWsUrl(
  roomId: string,
  token: string,
  inviteToken?: string | null
): string {
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:8080/api/v1";

  const wsBase =
    process.env.NEXT_PUBLIC_WS_URL ||
    apiBase.replace(/^http/, "ws").replace(/\/$/, "");

  const encodedRoom = encodeURIComponent(roomId);
  const params = new URLSearchParams({ token });
  if (inviteToken) params.set("invite", inviteToken);
  return `${wsBase}/collab/rooms/${encodedRoom}/ws?${params.toString()}`;
}

export function generateRoomId(prefix: string): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${rand}`;
}

export function resolveRoomIdFromUrl(
  searchParams: URLSearchParams | null,
  fallbackPrefix: string
): string {
  const fromQuery = searchParams?.get("room")?.trim();
  if (fromQuery) return fromQuery;
  return generateRoomId(fallbackPrefix);
}
