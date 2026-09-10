export interface Badge {
  id: string;
  name: string;
  icon_emoji: string;
  earned_at: string;
}

export interface UserGamificationProfile {
  user_id: string;
  name: string;
  avatar_url: string | null;
  total_points: number;
  level: number;
  rank_name: string;
  next_level_points: number;
  progress_to_next_level: number;
  current_streak: number;
  max_streak: number;
  badges_earned: number;
  badges: Badge[];
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  avatar_url: string | null;
  level: number;
  rank_name: string;
  total_xp: number;
  current_streak: number;
}

export interface MyPosition {
  rank: number;
  total_xp: number;
}

export interface LeaderboardResponse {
  period: "weekly" | "monthly" | "all_time";
  leaderboard: LeaderboardEntry[];
  my_position?: MyPosition;
}

export interface XPHistory {
  id: string;
  activity: string;
  xp_earned: number;
  description: string;
  created_at: string;
}
