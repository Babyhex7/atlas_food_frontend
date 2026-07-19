import { create } from "zustand";
import type { AuthResponse, UserInfo } from "../types/auth";
import { clearAuthCookies, setAuthCookies } from "@/internal/lib/cookies";

export type AuthState = {
  session: AuthResponse | null;
  setSession: (session: AuthResponse | null) => void;
  clearSession: () => void;
  updateUser: (patch: Partial<UserInfo>) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  setSession: (session) => {
    if (session?.access_token) {
      setAuthCookies(session.access_token, session.refresh_token, session.expires_in);
    } else {
      clearAuthCookies();
    }
    set({ session });
  },
  clearSession: () => {
    clearAuthCookies();
    set({ session: null });
  },
  updateUser: (patch) => {
    const current = get().session;
    if (!current) return;
    set({ session: { ...current, user: { ...current.user, ...patch } } });
  },
}));
