"use client";

import React from "react";
import { useGamificationProfile } from "../../hooks/useGamificationProfile";
import { FaFire } from "react-icons/fa";

export const StreakBadge: React.FC = () => {
  const { data, isLoading, error } = useGamificationProfile();

  if (isLoading || error || !data) return null;

  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 text-orange-600 border border-orange-200 shadow-sm cursor-pointer hover:bg-orange-200 transition-colors"
      title={`Streak Anda: ${data.current_streak} hari berturut-turut`}
    >
      <FaFire className={data.current_streak > 0 ? "text-orange-500" : "text-gray-400"} />
      <span className="font-semibold text-sm">{data.current_streak}</span>
    </div>
  );
};
