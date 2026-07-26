import { apiClient } from "@/internal/lib/axios";
import type { RoomRole } from "../types/collab";

export type InviteRole = Extract<RoomRole, "editor" | "viewer">;

export type CollabInviteResult = {
  roomId: string;
  inviteToken: string;
  role: InviteRole | string;
  joinPath: string;
  expiresAt: string | null;
  shareUrl: string;
};

/** REST invite — dipisah dari UI ShareModal. */
export async function createCollabInvite(
  roomId: string,
  role: InviteRole,
  pageUrl?: string
): Promise<CollabInviteResult> {
  const { data: res } = await apiClient.post(`/collab/rooms/${encodeURIComponent(roomId)}/invite`, {
    role,
  });
  const joinPath = String(res?.data?.join_path ?? `?room=${roomId}`);
  const base = pageUrl || (typeof window !== "undefined" ? window.location.href : "");
  const url = new URL(base);
  const params = new URLSearchParams(joinPath.startsWith("?") ? joinPath.slice(1) : joinPath);
  url.search = "";
  params.forEach((v, k) => url.searchParams.set(k, v));

  return {
    roomId: String(res?.data?.room_id ?? roomId),
    inviteToken: String(res?.data?.invite_token ?? ""),
    role: String(res?.data?.role ?? role),
    joinPath,
    expiresAt: res?.data?.expires_at ? String(res.data.expires_at) : null,
    shareUrl: url.toString(),
  };
}

export async function revokeCollabInvite(token: string): Promise<void> {
  await apiClient.delete(`/collab/invites/${encodeURIComponent(token)}`);
}
