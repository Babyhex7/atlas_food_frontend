"use client";

import React from "react";
import type { LeaderboardEntry } from "../../types/gamification";
import { FaTrophy } from "react-icons/fa";

interface Props {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}

export const LeaderboardRow: React.FC<Props> = ({ entry, isCurrentUser }) => {
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl mb-3 transition-all ${isCurrentUser ? 'bg-indigo-50 border border-indigo-200 shadow-md transform scale-[1.02]' : 'bg-white shadow-sm border border-gray-100 hover:shadow-md'}`}>
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="w-8 text-center font-bold text-gray-500">
          {entry.rank}
        </div>
        
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-indigo-100 border-2 border-white shadow flex items-center justify-center overflow-hidden">
          {entry.avatar_url ? (
            <img src={entry.avatar_url} alt={entry.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-indigo-600 font-bold text-lg">{entry.name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        
        {/* Info */}
        <div className="flex flex-col">
          <span className="font-bold text-gray-800 flex items-center gap-2">
            {entry.name} {isCurrentUser && <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Anda</span>}
          </span>
          <span className="text-xs text-gray-500">{entry.rank_name} (Lvl {entry.level})</span>
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="font-bold text-indigo-600 text-lg flex items-center gap-1">
            {entry.total_xp} <span className="text-xs text-indigo-400">XP</span>
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            🔥 {entry.current_streak} Hari
          </span>
        </div>
      </div>
    </div>
  );
};
