import { useQuery } from "@tanstack/react-query";
import { gamificationApi } from "../api/gamificationApi";

export const useGamificationProfile = () => {
  return useQuery({
    queryKey: ["gamification", "profile"],
    queryFn: () => gamificationApi.getProfile(),
    staleTime: 1000 * 60 * 5, // 5 menit
  });
};
