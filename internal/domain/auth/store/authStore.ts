import { create } from "zustand";
import type { AuthResponse } from "../types/auth";
import { clearAuthCookies, setAuthCookies } from "@/internal/lib/cookies";

export type AuthState = {
  session: AuthResponse | null;
  setSession: (session: AuthResponse | null) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
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
}));
