"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/internal/domain/auth/store/authStore";
import { getProfile } from "@/internal/domain/auth/services/authService";
import { clearAuthCookies, getAccessToken, getRefreshToken } from "@/internal/lib/cookies";

/**
 * Hydrate session dari cookie setelah refresh halaman.
 * Token disimpan di cookie; state user di-restore via /auth/me.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const session = useAuthStore((state) => state.session);
  const setSession = useAuthStore((state) => state.setSession);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current || session) return;
    hydrated.current = true;

    const token = getAccessToken();
    if (!token) return;

    getProfile(token)
      .then((profile) => {
        setSession({
          user: {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role,
            is_active: profile.is_active,
          },
          access_token: token,
          refresh_token: getRefreshToken() ?? "",
          expires_in: 86400,
        });
      })
      .catch(() => {
        clearAuthCookies();
        setSession(null);
      });
  }, [session, setSession]);

  return <>{children}</>;
}
