import { apiClient } from "@/internal/lib/axios";
import type { UserGamificationProfile, LeaderboardResponse, XPHistory } from "../types/gamification";

export const gamificationApi = {
  getProfile: async (): Promise<UserGamificationProfile> => {
    const res = await apiClient.get<{ data: UserGamificationProfile }>("/gamification/profile");
    return res.data.data;
  },

  getLeaderboard: async (period: "weekly" | "monthly" | "all_time" = "all_time"): Promise<LeaderboardResponse> => {
    const res = await apiClient.get<{ data: LeaderboardResponse }>(`/gamification/leaderboard?period=${period}`);
    return res.data.data;
  },

  getXPHistory: async (): Promise<XPHistory[]> => {
    const res = await apiClient.get<{ data: { history: XPHistory[] } }>("/gamification/xp-history");
    return res.data.data.history;
  },
};
