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
  /** false = UI yang mengubah data harus dinonaktifkan */
  canEdit: boolean;
  /** true = mode "Can view": kunci total, hanya boleh menonton & follow */
  isViewer: boolean;
  followUser: (userId: string) => void;
  unfollow: () => void;
  isFollowing: boolean;
  /** Mulai sesi baru; undefined saat sudah di dalam room atau belum bisa mulai. */
  enableCollab?: () => void;
  /** Keluar sesi; undefined untuk room tetap yang memang terikat ke survei. */
  leaveRoom?: () => void;
  /** true = siap memulai, false = perlu login, null = status auth belum pasti. */
  canStart: boolean | null;
  /** true = sedang membuka link undangan tapi belum login. */
  requireAuth: boolean;
};

// Default context = mode solo (tidak ada room): semua boleh. Halaman di luar
// CollabSession tetap berfungsi normal tanpa perlu tahu soal kolaborasi.
const CollabContext = createContext<CollabContextValue>({
  send: () => undefined,
  roomId: null,
  status: "idle",
  isConnected: false,
  canEdit: true,
  isViewer: false,
  followUser: () => undefined,
  unfollow: () => undefined,
  isFollowing: false,
  canStart: null,
  requireAuth: false,
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

  // Room + invite aktif disimpan per tab (sessionStorage). Tanpa ini, navigasi
  // lewat <Link> yang tidak membawa ?room=/?invite= membuat sesi/role hilang.
  // sessionStorage dipilih agar sesi berakhir saat tab ditutup — bukan localStorage
  // yang membuat user otomatis masuk room lama berhari-hari kemudian.
  const storageKey = `collab:room:${roomPrefix}`;
  const inviteStorageKey = `collab:invite:${roomPrefix}`;
  const inviteFromQuery = searchParams.get("invite")?.trim() || null;

  // Pemulihan dilakukan saat render (pola "adjust state during render" React),
  // bukan di dalam useEffect. Lewat effect, render pertama sempat memakai room
  // kosong lalu langsung render ulang — WebSocket ikut dibuka-tutup sekali.
  const [roomRestored, setRoomRestored] = useState(false);
  if (isClient && !roomRestored) {
    setRoomRestored(true);
    if (!fixedRoomId && !roomFromQuery && !createdRoom) {
      const saved = window.sessionStorage.getItem(storageKey);
      if (saved) setCreatedRoom(saved);
    }
  }

  const enabledRoom = fixedRoomId || roomFromQuery || createdRoom;

  useEffect(() => {
    if (typeof window === "undefined" || !enabledRoom) return;
    window.sessionStorage.setItem(storageKey, enabledRoom);
  }, [enabledRoom, storageKey]);

  // Simpan invite per-room agar role viewer/editor tetap setelah navigasi tanpa ?invite=
  useEffect(() => {
    if (typeof window === "undefined" || !enabledRoom) return;
    if (inviteFromQuery) {
      window.sessionStorage.setItem(`collab:invite:${enabledRoom}`, inviteFromQuery);
      window.sessionStorage.setItem(inviteStorageKey, inviteFromQuery);
    }
  }, [inviteFromQuery, inviteStorageKey, enabledRoom]);

  useEffect(() => {
    if (!syncUrl || !enabledRoom || !hasToken) return;
    const url = new URL(window.location.href);
    const currentRoom = url.searchParams.get("room");
    const currentInvite = url.searchParams.get("invite");
    const savedInvite =
      inviteFromQuery ||
      (typeof window !== "undefined"
        ? window.sessionStorage.getItem(`collab:invite:${enabledRoom}`)?.trim() ||
          window.sessionStorage.getItem(inviteStorageKey)?.trim() ||
          null
        : null);

    const roomOk = currentRoom === enabledRoom;
    const inviteOk = !savedInvite || currentInvite === savedInvite;
    if (roomOk && inviteOk) {
      syncedRef.current = enabledRoom;
      return;
    }
    if (syncedRef.current === enabledRoom && roomOk && inviteOk) return;
    syncedRef.current = enabledRoom;
    url.searchParams.set("room", enabledRoom);
    if (savedInvite) url.searchParams.set("invite", savedInvite);
    window.history.replaceState(null, "", `${url.pathname}?${url.searchParams.toString()}`);
  }, [syncUrl, enabledRoom, hasToken, searchParams, inviteFromQuery, inviteStorageKey]);

  useEffect(() => () => reset(), [reset]);

  const activeRoom = hasToken ? enabledRoom : null;
  const { send, status, isConnected } = useWebSocket(activeRoom);
  const { followUser, unfollow, isFollowing } = useFollowMode(send, isConnected);
  const { remoteCursors } = useLiveCursor(send, isConnected);
  const selfRoomRole = useCollabStore((s) => s.selfRoomRole);
  const users = useCollabStore((s) => s.users);
  const selfUserId = useCollabStore((s) => s.selfUserId);

  // Fail-closed: selama kita berada di sebuah room tapi role dari server belum
  // diketahui, perlakukan sebagai viewer. Jeda ini hanya beberapa milidetik
  // (state_sync datang tepat setelah connect), dan mencegah viewer sempat
  // menekan tombol ubah di sela-sela handshake.
  const inRoom = Boolean(activeRoom);
  const canEdit = inRoom ? canEditRoom(selfRoomRole) : true;
  const isViewer = inRoom && !canEdit;

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

  /**
   * Keluar dari sesi kolaborasi.
   *
   * Karena room sekarang bertahan di sessionStorage, tanpa tombol ini pengguna
   * tidak punya cara keluar selain menutup tab. Semua jejak room harus dibersihkan
   * sekaligus — state, sessionStorage, dan query di URL — kalau tidak, salah satu
   * sumber akan menariknya kembali masuk pada render berikutnya.
   */
  const leaveRoom = useCallback(() => {
    syncedRef.current = null;
    setCreatedRoom(null);
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(storageKey);
    window.sessionStorage.removeItem(inviteStorageKey);
    if (enabledRoom) {
      window.sessionStorage.removeItem(`collab:invite:${enabledRoom}`);
    }
    const url = new URL(window.location.href);
    url.searchParams.delete("room");
    url.searchParams.delete("invite");
    const qs = url.searchParams.toString();
    window.history.replaceState(null, "", `${url.pathname}${qs ? `?${qs}` : ""}`);
    reset();
  }, [storageKey, inviteStorageKey, enabledRoom, reset]);

  // Selama status auth belum pasti (SSR / token cookie belum ditukar), canStart
  // sengaja null: menampilkan ajakan login pada saat itu membuat pengguna yang
  // sebenarnya sudah login melihat tombol "Masuk" berkedip sesaat.
  const canStart = !isClient || authPending ? null : hasToken;
  const requireAuth = !hasToken && Boolean(roomFromQuery) && isClient && !authPending;

  const value = useMemo(
    () => ({
      send,
      roomId: activeRoom,
      status,
      isConnected,
      canEdit,
      isViewer,
      followUser,
      unfollow,
      isFollowing,
      enableCollab: !activeRoom && hasToken && !authPending ? enableCollab : undefined,
      // Room tetap (mis. recall-<token>) tidak bisa ditinggalkan — sesinya
      // memang terikat ke survei itu, bukan room ad-hoc yang dibuat pengguna.
      leaveRoom: activeRoom && !fixedRoomId ? leaveRoom : undefined,
      canStart,
      requireAuth,
    }),
    [
      send,
      activeRoom,
      status,
      isConnected,
      canEdit,
      isViewer,
      followUser,
      unfollow,
      isFollowing,
      enableCollab,
      leaveRoom,
      hasToken,
      authPending,
      fixedRoomId,
      canStart,
      requireAuth,
    ]
  );

  return (
    <CollabContext.Provider value={value}>
      <LiveCursorOverlay cursors={remoteCursors} />
      <ActivityFeed />
      {children}
    </CollabContext.Provider>
  );
}
