"use client";

import React from "react";
import type { LeaderboardEntry } from "../../types/gamification";
import { FaCrown } from "react-icons/fa";

interface Props {
  top3: LeaderboardEntry[];
}

export const LeaderboardPodium: React.FC<Props> = ({ top3 }) => {
  // Podium positions: [2, 1, 3] for visual layout
  const rank2 = top3.find(e => e.rank === 2);
  const rank1 = top3.find(e => e.rank === 1);
  const rank3 = top3.find(e => e.rank === 3);

  const PodiumItem = ({ entry, heightClass, colorClass, crownColor }: any) => {
    if (!entry) return <div className="w-1/3 flex flex-col items-center justify-end" />;
    
    return (
      <div className="w-1/3 flex flex-col items-center justify-end relative group">
        <div className="mb-2 relative">
          {entry.rank === 1 && (
            <FaCrown className={`absolute -top-6 left-1/2 -translate-x-1/2 text-3xl ${crownColor} drop-shadow-md z-10`} />
          )}
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 ${colorClass} bg-white shadow-lg flex items-center justify-center overflow-hidden z-0 relative`}>
            {entry.avatar_url ? (
              <img src={entry.avatar_url} alt={entry.name} className="w-full h-full object-cover" />
            ) : (
              <span className={`font-bold text-xl sm:text-2xl text-gray-700`}>{entry.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full ${colorClass} text-white font-bold flex items-center justify-center shadow border-2 border-white`}>
            {entry.rank}
          </div>
        </div>
        
        <div className="text-center mt-4 mb-2 z-10">
          <p className="font-bold text-sm sm:text-base text-gray-800 line-clamp-1 px-1">{entry.name}</p>
          <p className="text-xs sm:text-sm font-semibold text-indigo-600">{entry.total_xp} XP</p>
        </div>
        
        <div className={`w-full ${heightClass} ${colorClass} rounded-t-lg shadow-inner flex items-start justify-center pt-2 opacity-90 transition-all hover:opacity-100`}>
          <span className="text-white font-black opacity-30 text-2xl">{entry.rank}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-end justify-center h-64 sm:h-80 max-w-lg mx-auto mb-10 px-4">
      <PodiumItem entry={rank2} heightClass="h-24 sm:h-32" colorClass="bg-slate-300 border-slate-300" crownColor="text-slate-400" />
      <PodiumItem entry={rank1} heightClass="h-32 sm:h-44" colorClass="bg-amber-400 border-amber-400" crownColor="text-yellow-500" />
      <PodiumItem entry={rank3} heightClass="h-20 sm:h-24" colorClass="bg-amber-600 border-amber-600" crownColor="text-amber-700" />
    </div>
  );
};
