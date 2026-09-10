import { useQuery } from "@tanstack/react-query";
import { gamificationApi } from "../api/gamificationApi";

export const useLeaderboard = (period: "weekly" | "monthly" | "all_time") => {
  return useQuery({
    queryKey: ["gamification", "leaderboard", period],
    queryFn: () => gamificationApi.getLeaderboard(period),
    staleTime: 1000 * 60, // 1 menit
  });
};
