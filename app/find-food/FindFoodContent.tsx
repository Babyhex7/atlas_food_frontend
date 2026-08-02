"use client";

import { useState, useEffect, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ChevronRight, Loader2, UtensilsCrossed } from "lucide-react";
import { searchFoodsPublic, getCategoriesPublic } from "@/internal/services/food.service";
import { useDebounce } from "@/internal/hooks/use-debounce";
import type { FoodSearchResult } from "@/internal/types/food.types";
import { AppHeader } from "@/internal/components/layout/AppHeader";
import { CONTAINER_CLASS } from "@/internal/lib/layout";
import { cn } from "@/internal/lib/cn";
import {
  useCollab,
  viewerLockProps,
  viewerLockLinkProps,
  VIEWER_LOCK_CLASS,
  VIEWER_LOCK_HINT,
  useCollabStore,
  withCollabParams,
} from "@/internal/domain/collab";

function FindFoodBody() {
  const searchParams = useSearchParams();
  const { send, isConnected, isViewer } = useCollab();
  const followingUserId = useCollabStore((s) => s.followingUserId);
  const remoteSearch = useCollabStore((s) => s.remoteSearch);
  const queryFromUrl = searchParams.get("q") ?? "";
  const [searchTerm, setSearchTerm] = useState(queryFromUrl);
  const [prevQuery, setPrevQuery] = useState(queryFromUrl);
  if (queryFromUrl !== prevQuery) {
    setPrevQuery(queryFromUrl);
    setSearchTerm(queryFromUrl);
  }
  const debouncedSearch = useDebounce(searchTerm, 300);
  const canSearch = debouncedSearch.trim().length >= 2;
  const roomParam = searchParams.get("room");
  const inviteParam = searchParams.get("invite");
  const isFollowing = Boolean(followingUserId);

  const { data: categories = [] } = useQuery({
    queryKey: ["public-categories"],
    queryFn: getCategoriesPublic,
  });

  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ["public-search", debouncedSearch],
    queryFn: () => searchFoodsPublic(debouncedSearch.trim()),
    enabled: canSearch,
  });

  // Saat follow: mirror query leader ke search bar (awareness instan, ala Figma)
  useEffect(() => {
    if (!isFollowing || !remoteSearch?.query) return;
    if (remoteSearch.userId !== followingUserId) return;
    setSearchTerm(remoteSearch.query);
  }, [isFollowing, followingUserId, remoteSearch]);

  // Leader menulis ?q= ke URL + push viewport agar follower ikut (replaceState
  // tidak memicu useSearchParams Next.js, jadi broadcast eksplisit wajib).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isViewer || isFollowing) return;
    const url = new URL(window.location.href);
    const q = debouncedSearch.trim();
    const current = url.searchParams.get("q") ?? "";
    let changed = false;
    if (q.length >= 2) {
      if (current !== q) {
        url.searchParams.set("q", q);
        changed = true;
      }
    } else if (url.searchParams.has("q")) {
      url.searchParams.delete("q");
      changed = true;
    }
    if (!changed) return;
    const qs = url.searchParams.toString();
    window.history.replaceState(null, "", `${url.pathname}${qs ? `?${qs}` : ""}`);
    if (isConnected) {
      send("viewport_update", {
        page: window.location.pathname,
        path: window.location.pathname + window.location.search,
        scroll_x: window.scrollX,
        scroll_y: window.scrollY,
      });
    }
  }, [debouncedSearch, isViewer, isFollowing, isConnected, send]);

  useEffect(() => {
    // Viewer / follower tidak menyiarkan pencarian — layarnya mengikuti leader
    if (!isConnected || !canSearch || isViewer || isFollowing) return;
    send("food_search", { query: debouncedSearch.trim(), filters: {} });
  }, [debouncedSearch, canSearch, isConnected, isViewer, isFollowing, send]);

  return (
    <>
      {/* ── Hero banner ── */}
      <div className="bg-primary text-white pt-10 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[radial-gradient(rgba(255,255,255,0.8)_1.5px,transparent_1.5px)] bg-[length:24px_24px]" />

        <div className={cn(CONTAINER_CLASS, "relative z-[1] text-center")}>
          <h1 className="text-[clamp(1.875rem,5vw,2.75rem)] font-bold font-sans text-white mb-3 mt-0 tracking-[-0.025em]">
            Find Your Food
          </h1>
          <p className="text-white/85 text-base mx-auto mb-8 max-w-[480px] leading-relaxed">
            Temukan estimasi ukuran porsi dan kandungan gizi lengkap dari makanan Indonesia.
          </p>

          <div className="relative max-w-[600px] mx-auto">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
              <Search size={18} className="text-text-muted" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                isViewer || isFollowing
                  ? isFollowing
                    ? "Mengikuti pencarian rekan…"
                    : "Pencarian dikunci — mode Can view"
                  : "Cari makanan (nama / kode, misal: Nasi, MP-01…)"
              }
              {...viewerLockProps(isViewer || isFollowing)}
              className={cn(
                "shadow-xl-focus-ring block w-full pl-12 pr-12 py-4 rounded-xl border-none bg-surface text-text-primary text-base outline-none shadow-xl transition-base font-sans box-border",
                (isViewer || isFollowing) && "cursor-not-allowed opacity-60"
              )}
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                <Loader2 size={18} className="animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={cn(CONTAINER_CLASS, "-mt-8 relative z-10 pb-16 flex-1")}>
        {isViewer && (
          <div className="card mb-4 border-warning-border bg-warning-light p-4 text-sm text-warning">
            {VIEWER_LOCK_HINT}
          </div>
        )}

        {debouncedSearch.trim().length > 0 && debouncedSearch.trim().length < 2 && (
          <div className="card p-6 text-center text-text-muted text-sm">
            Ketik minimal 2 karakter untuk mencari…
          </div>
        )}

        {debouncedSearch.trim().length === 0 && (
          <div className="card animate-fade-in p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-5 mt-0 flex items-center gap-2">
              <UtensilsCrossed size={20} className="text-primary" />
              Kategori Makanan
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories.map((cat: { id: string; code: string; name: string; icon?: string }) => (
                <Link
                  key={cat.id}
                  href={withCollabParams(`/find-food/category/${cat.code}`, {
                    room: roomParam,
                    invite: inviteParam,
                  })}
                  {...viewerLockLinkProps(isViewer)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-[1.5px] border-border no-underline text-center transition-base bg-surface hover:border-primary-border hover:bg-primary-light hover:-translate-y-0.5 hover:shadow-sm",
                    isViewer && VIEWER_LOCK_CLASS
                  )}
                >
                  <span className="text-[2rem] leading-none">
                    {cat.icon ? (
                      <span>{cat.icon}</span>
                    ) : (
                      <UtensilsCrossed size={30} className="text-primary" />
                    )}
                  </span>
                  <span className="text-sm font-medium text-text-primary">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {canSearch && (
          <div className="card animate-fade-in p-6">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <h2 className="text-lg font-semibold text-text-primary m-0">
                Hasil: &ldquo;{debouncedSearch}&rdquo;
              </h2>
              <span className="badge badge-default">{searchResults.length} hasil</span>
            </div>

            {searchResults.length === 0 && !isSearching && (
              <div className="text-center py-12 px-4">
                <div className="flex justify-center mb-4">
                  <Search size={48} className="text-text-muted" />
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-2 mt-0">
                  Makanan tidak ditemukan
                </h3>
                <p className="text-sm text-text-muted m-0">Coba gunakan kata kunci lain.</p>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="grid md:grid-cols-2 gap-3">
                {searchResults.map((food: FoodSearchResult) => (
                  <Link
                    key={food.id}
                    href={withCollabParams(`/find-food/${food.id}`, {
                      room: roomParam,
                      invite: inviteParam,
                    })}
                    {...viewerLockLinkProps(isViewer)}
                    onClick={(e) => {
                      if (isViewer) {
                        e.preventDefault();
                        return;
                      }
                      if (isConnected && !isFollowing) {
                        send("food_select", {
                          food_id: food.id,
                          food_name: food.name,
                        });
                      }
                    }}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border-[1.5px] border-border no-underline bg-surface transition-base hover:border-primary-border hover:shadow-md hover:-translate-y-px",
                      isViewer && VIEWER_LOCK_CLASS
                    )}
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                      {food.category?.icon ? (
                        <span className="text-xl">{food.category.icon}</span>
                      ) : (
                        <UtensilsCrossed size={20} className="text-primary" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-text-primary mb-1 mt-0 overflow-hidden text-ellipsis whitespace-nowrap">
                        {food.name}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-semibold bg-surface-alt text-text-muted py-[1px] px-2 rounded-sm border border-border">
                          {food.code}
                        </span>
                        {food.category?.name && (
                          <span className="badge badge-default">{food.category.name}</span>
                        )}
                        {food.photo_type && (
                          <span className="text-xs text-primary">
                            · {food.photo_type === "series" ? "Foto Series" : "Foto Range"}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight size={18} className="text-text-muted shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export function FindFoodContent() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <Suspense fallback={null}>
        <FindFoodBody />
      </Suspense>
    </div>
  );
}
