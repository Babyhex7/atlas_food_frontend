"use client";

import React from "react";
import { useGamificationProfile } from "../../hooks/useGamificationProfile";
import { FaStar } from "react-icons/fa";

export const LevelBadge: React.FC = () => {
  const { data, isLoading, error } = useGamificationProfile();

  if (isLoading || error || !data) return null;

  return (
    <div
      className="flex flex-col relative group cursor-pointer"
      title={`Level ${data.level}: ${data.rank_name}`}
    >
      <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 rounded-full shadow-md hover:shadow-lg transition-shadow">
        <FaStar className="text-yellow-300" />
        <span className="font-bold text-sm">Lvl {data.level}</span>
      </div>
      
      {/* Tooltip on hover */}
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white text-gray-800 rounded-lg shadow-xl p-3 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
        <p className="font-bold text-center text-indigo-600 mb-1">{data.rank_name}</p>
        <p className="text-xs text-center text-gray-500 mb-2">{data.total_points} XP</p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full" 
            style={{ width: `${Math.min(100, data.progress_to_next_level)}%` }} 
          />
        </div>
        {data.next_level_points > 0 ? (
          <p className="text-[10px] text-center text-gray-400 mt-1">
            {data.next_level_points - data.total_points} XP menuju Lvl {data.level + 1}
          </p>
        ) : (
          <p className="text-[10px] text-center text-gray-400 mt-1">Level Maksimal</p>
        )}
      </div>
    </div>
  );
};
