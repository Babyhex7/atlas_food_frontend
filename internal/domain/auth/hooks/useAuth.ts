"use client";

import { useAuthStore } from "../store/authStore";
import type { UserInfo } from "../types/auth";

export function useAuth() {
  const session = useAuthStore((state) => state.session);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  return {
    user: session?.user ?? null,
    accessToken: session?.access_token,
    refreshToken: session?.refresh_token,
    isAuthenticated: Boolean(session?.access_token),
    setSession,
    clearSession,
  };
}

export type AuthUser = UserInfo;
