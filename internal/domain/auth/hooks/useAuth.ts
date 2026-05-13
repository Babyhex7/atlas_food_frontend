"use client";

import { useMemo, useState } from "react";
import type { AuthResponse, UserInfo } from "../types/auth";

export function useAuth() {
  const [session, setSession] = useState<AuthResponse | null>(null);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.access_token,
      refreshToken: session?.refresh_token,
      isAuthenticated: Boolean(session?.access_token),
      setSession,
      clearSession: () => setSession(null),
    }),
    [session],
  );

  return value;
}

export type AuthUser = UserInfo;
