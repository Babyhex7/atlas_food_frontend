"use client";

import React, { useState } from "react";
import { useLeaderboard } from "../../internal/domain/gamification/hooks/useLeaderboard";
import { LeaderboardPodium } from "../../internal/components/gamification/LeaderboardPodium";
import { LeaderboardRow } from "../../internal/components/gamification/LeaderboardRow";
import { useAuth } from "../../internal/domain/auth/hooks/useAuth";

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<"weekly" | "monthly" | "all_time">("all_time");
  const { data, isLoading, error } = useLeaderboard(period);
  const { user } = useAuth(); // Assume we have useAuth

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Leaderboard Atlas Food
          </h1>
          <p className="text-gray-600">Jadilah Pahlawan Gizi dan raih posisi puncak!</p>
          
          {/* Period Selector */}
          <div className="flex justify-center gap-2 mt-6">
            {(["weekly", "monthly", "all_time"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  period === p 
                    ? "bg-indigo-600 text-white shadow-md transform scale-105" 
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {p === "weekly" ? "Mingguan" : p === "monthly" ? "Bulanan" : "Semua Waktu"}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-8 bg-red-50 rounded-xl">
            Gagal memuat leaderboard.
          </div>
        ) : data?.leaderboard && data.leaderboard.length > 0 ? (
          <>
            {/* Podium for Top 3 */}
            <LeaderboardPodium top3={data.leaderboard.slice(0, 3)} />

            {/* List for others */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 md:p-6 mb-8">
              {data.leaderboard.slice(3).map((entry) => (
                <LeaderboardRow 
                  key={entry.user_id} 
                  entry={entry} 
                  isCurrentUser={user?.id === entry.user_id} 
                />
              ))}
              
              {data.leaderboard.length <= 3 && (
                <p className="text-center text-gray-500 py-4">Belum banyak data untuk periode ini.</p>
              )}
            </div>

            {/* Current User Fixed Position if outside top */}
            {data.my_position && data.my_position.rank > 10 && (
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] z-40">
                <div className="max-w-4xl mx-auto">
                  <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Posisi Anda</p>
                  <LeaderboardRow 
                    entry={{
                      rank: data.my_position.rank,
                      user_id: user?.id || "",
                      name: user?.name || "Anda",
                      avatar_url: null, // Get from Auth if exists
                      level: 1, // Optional, could map from profile
                      rank_name: "TBA",
                      total_xp: data.my_position.total_xp,
                      current_streak: 0
                    }} 
                    isCurrentUser={true} 
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 p-12 bg-white rounded-xl border border-gray-100">
            <p className="text-lg font-semibold">Belum ada data</p>
            <p className="text-sm">Jadilah yang pertama untuk mendapatkan XP!</p>
          </div>
        )}
      </div>
    </div>
  );
}
