"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import { getAccessToken } from "@/internal/lib/cookies";
import { useAuth } from "@/internal/domain/auth/hooks/useAuth";
import { CollaborationBar } from "./CollaborationBar";
import { ActivityFeed } from "./ActivityFeed";
import { LiveCursorOverlay } from "./LiveCursorOverlay";
import { useWebSocket, type CollabSend } from "../hooks/useWebSocket";
import { useLiveCursor } from "../hooks/useLiveCursor";
import { useFollowMode } from "../hooks/useFollowMode";
import { generateRoomId } from "../lib/wsUrl";
import { canEditRoom } from "../lib/messageRouter";
import { useCollabStore } from "../store/collabStore";
import type { CollabConnectionStatus } from "../types/collab";

type CollabContextValue = {
  send: CollabSend;
  roomId: string | null;
  status: CollabConnectionStatus;
  isConnected: boolean;
  canEdit: boolean;
  followUser: (userId: string) => void;
  unfollow: () => void;
  isFollowing: boolean;
};

const CollabContext = createContext<CollabContextValue>({
  send: () => undefined,
  roomId: null,
  status: "idle",
  isConnected: false,
  canEdit: true,
  followUser: () => undefined,
  unfollow: () => undefined,
  isFollowing: false,
});

export function useCollab() {
  return useContext(CollabContext);
}

type Props = {
  roomPrefix: string;
  /** unused for room creation when fixedRoomId set; kept for API clarity */
  autoConnect?: boolean;
  fixedRoomId?: string | null;
  /** When false, room id is not written to the URL (admin shared rooms). */
  syncUrl?: boolean;
  children?: ReactNode;
};

export function CollabSession({
  roomPrefix,
  autoConnect: _autoConnect = true,
  fixedRoomId = null,
  syncUrl = true,
  children,
}: Props) {
  void _autoConnect;
  const searchParams = useSearchParams();
  const { accessToken, isAuthenticated } = useAuth();
  const reset = useCollabStore((s) => s.reset);
  const syncedRef = useRef<string | null>(null);

  const [isClient, setIsClient] = useState(false);
  if (typeof window !== "undefined" && !isClient) {
    setIsClient(true);
  }

  const cookieToken = isClient ? getAccessToken() : null;
  const hasToken = Boolean(accessToken || cookieToken || isAuthenticated);
  const authPending = isClient && Boolean(cookieToken) && !accessToken && !isAuthenticated;

  const roomFromQuery = searchParams.get("room")?.trim() || null;
  const [createdRoom, setCreatedRoom] = useState<string | null>(null);

  const enabledRoom = fixedRoomId || roomFromQuery || createdRoom;

  useEffect(() => {
    if (!syncUrl || !enabledRoom || !hasToken) return;
    const url = new URL(window.location.href);
    const currentRoom = url.searchParams.get("room");
    if (currentRoom === enabledRoom) {
      syncedRef.current = enabledRoom;
      return;
    }
    if (syncedRef.current === enabledRoom) return;
    syncedRef.current = enabledRoom;
    url.searchParams.set("room", enabledRoom);
    // Pertahankan invite token bila ada (role viewer/editor dari share)
    const invite = searchParams.get("invite");
    if (invite) url.searchParams.set("invite", invite);
    window.history.replaceState(null, "", `${url.pathname}?${url.searchParams.toString()}`);
  }, [syncUrl, enabledRoom, hasToken, searchParams]);

  useEffect(() => () => reset(), [reset]);

  const activeRoom = hasToken ? enabledRoom : null;
  const { send, status, isConnected } = useWebSocket(activeRoom);
  const { followUser, unfollow, isFollowing } = useFollowMode(send, isConnected);
  const { remoteCursors } = useLiveCursor(send, isConnected);
  const selfRoomRole = useCollabStore((s) => s.selfRoomRole);
  const users = useCollabStore((s) => s.users);
  const selfUserId = useCollabStore((s) => s.selfUserId);
  const canEdit = canEditRoom(selfRoomRole);

  // Pulihkan room_role jika presence datang sebelum selfUserId siap
  useEffect(() => {
    if (!selfUserId) return;
    const self = users.find((u) => u.userId === selfUserId);
    if (self?.roomRole) useCollabStore.getState().setSelfRoomRole(self.roomRole);
  }, [selfUserId, users]);

  const enableCollab = useCallback(() => {
    if (!hasToken) return;
    const id = fixedRoomId || roomFromQuery || generateRoomId(roomPrefix);
    syncedRef.current = null;
    setCreatedRoom(id);
  }, [hasToken, fixedRoomId, roomFromQuery, roomPrefix]);

  const value = useMemo(
    () => ({
      send,
      roomId: activeRoom,
      status,
      isConnected,
      canEdit,
      followUser,
      unfollow,
      isFollowing,
    }),
    [send, activeRoom, status, isConnected, canEdit, followUser, unfollow, isFollowing]
  );

  return (
    <CollabContext.Provider value={value}>
      <CollaborationBar
        roomId={activeRoom}
        status={status}
        onEnableCollab={!activeRoom && hasToken && !authPending ? enableCollab : undefined}
        requireAuthHint={!hasToken && Boolean(roomFromQuery) && isClient && !authPending}
        showLoginCta={!hasToken && !roomFromQuery && isClient && !authPending}
        onFollowUser={isConnected ? followUser : undefined}
        onUnfollow={isConnected ? unfollow : undefined}
      />
      <LiveCursorOverlay cursors={remoteCursors} />
      <ActivityFeed />
      {children}
    </CollabContext.Provider>
  );
}
