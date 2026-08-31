"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Scale,
} from "lucide-react";
import { getFoodPublic } from "@/internal/services/food.service";
import { getApiErrorMessage } from "@/internal/pkg/utils/apiError";
import type { FoodDetail, PortionPhoto } from "@/internal/domain/food/types/food";
import type { RecallFood } from "../types/recall";
import type { SelectedPortion } from "@/internal/domain/portion/types/portion";
import { useCollab, LiveCanvasOverlay } from "@/internal/domain/collab";
import {
  Banner,
  Button,
  Card,
  CardLabel,
  EmptyState,
  LoadingState,
  SelectTile,
  StepHeader,
  StepNav,
  StepShell,
} from "./ui/Primitives";
import { cn } from "@/internal/lib/cn";

/** Batas berat yang masuk akal untuk satu porsi (gram). */
const MAX_PORTION_GRAM = 5000;

interface Props {
  foods: RecallFood[];
  foodIndex: number;
  onPortionSelected: (foodId: string, portion: SelectedPortion, detail?: FoodDetail) => void;
  onFoodIndexChange: (index: number) => void;
  onContinue: () => void;
  onBack: () => void;
}

/** Hasil fetch detail, disimpan bersama id makanan asalnya. */
interface FetchedDetail {
  foodId: string;
  detail: FoodDetail | null;
  error: string | null;
}

/** Pilihan porsi, juga terikat ke id makanan agar tidak bocor antar makanan. */
interface PortionSelection {
  foodId: string;
  photo: PortionPhoto | null;
  customGram: string;
}

function calcTotalWeight(selected: PortionPhoto | null, customGram: string): number {
  if (customGram.trim() !== "") {
    const parsed = Number.parseFloat(customGram);
    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return Math.min(parsed, MAX_PORTION_GRAM);
  }
  return selected?.weight_gram ?? 0;
}

export function Step3Portion({
  foods,
  foodIndex,
  onPortionSelected,
  onFoodIndexChange,
  onContinue,
  onBack,
}: Props) {
  const [fetched, setFetched] = useState<FetchedDetail | null>(null);
  const [selection, setSelection] = useState<PortionSelection | null>(null);
  const { send, isConnected } = useCollab();

  // Index dijepit ke daftar yang ada sekarang. Sesi tersimpan bisa membawa index
  // lama (mis. dari waktu makan sebelumnya), dan menampilkan "belum ada makanan"
  // padahal daftarnya terisi membuat langkah ini buntu.
  const safeIndex = foods.length > 0 ? Math.min(Math.max(foodIndex, 0), foods.length - 1) : 0;
  const currentFood = foods[safeIndex];
  const currentFoodId = currentFood?.food.id;

  // Detail yang sudah tersimpan di session dipakai langsung; sisanya diambil
  // dari hasil fetch, tapi hanya bila hasil itu memang milik makanan aktif.
  const cachedDetail = currentFood?.detail ?? null;
  const isFetchedForCurrent = Boolean(currentFoodId) && fetched?.foodId === currentFoodId;
  const detail = cachedDetail ?? (isFetchedForCurrent ? fetched.detail : null);
  const detailError = isFetchedForCurrent ? fetched.error : null;
  // Loading diturunkan: belum ada cache dan hasil fetch untuk makanan ini belum
  // tiba. Tidak ada setState sinkron di efek yang memicu cascading render.
  const loading = Boolean(currentFoodId) && !cachedDetail && !isFetchedForCurrent;

  // Pilihan hanya berlaku untuk makanan yang sedang aktif — berpindah makanan
  // otomatis mengosongkannya tanpa perlu efek reset.
  const activeSelection = selection?.foodId === currentFoodId ? selection : null;
  const selectedPhoto = activeSelection?.photo ?? null;
  const customGram = activeSelection?.customGram ?? "";

  // Muat detail makanan (nutrisi + foto porsi) saat makanan aktif berubah.
  useEffect(() => {
    if (!currentFoodId || cachedDetail) return;

    let cancelled = false;

    getFoodPublic(currentFoodId)
      .then((loaded) => {
        if (cancelled) return;
        setFetched({ foodId: currentFoodId, detail: loaded, error: null });
      })
      .catch((e) => {
        if (cancelled) return;
        // Kegagalan ditampilkan, bukan ditelan: user masih bisa mengisi berat manual.
        setFetched({
          foodId: currentFoodId,
          detail: null,
          error: getApiErrorMessage(e, "Gagal memuat pilihan porsi."),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [currentFoodId, cachedDetail]);

  const totalWeight = calcTotalWeight(selectedPhoto, customGram);
  const canConfirm = totalWeight > 0;
  const allPortioned = foods.every((f) => f.portion);
  const isLastFood = safeIndex >= foods.length - 1;

  const handleConfirm = () => {
    if (!currentFood || totalWeight <= 0) return;
    const usesCustom = customGram.trim() !== "";
    const portion: SelectedPortion = {
      method: usesCustom ? "input" : "simple_grid",
      image_id: usesCustom ? undefined : selectedPhoto?.id,
      image_label: usesCustom ? undefined : selectedPhoto?.label,
      base_weight: usesCustom ? undefined : selectedPhoto?.weight_gram,
      quantity: 1,
      fraction: 0,
      total_quantity: 1,
      portion_gram: totalWeight,
    };
    onPortionSelected(currentFood.food.id, portion, detail ?? undefined);
    if (isConnected) {
      send("portion_set", {
        food_id: currentFood.food.id,
        food_name: currentFood.food.name,
        portion_gram: totalWeight,
        image_label: portion.image_label,
      });
    }
    if (!isLastFood) onFoodIndexChange(safeIndex + 1);
  };

  if (!currentFood) {
    return (
      <StepShell>
        <StepHeader title="Estimasi porsi" />
        <EmptyState icon={AlertCircle}>
          Belum ada makanan untuk diatur porsinya. Kembali ke langkah sebelumnya untuk menambahkan
          makanan.
        </EmptyState>
        <StepNav>
          <Button variant="ghost" onClick={onBack}>
            Kembali
          </Button>
        </StepNav>
      </StepShell>
    );
  }

  const photos = detail?.portion_photos ?? [];

  return (
    <StepShell>
      <StepHeader
        title="Seberapa banyak porsinya?"
        subtitle={
          <>
            <span className="font-semibold text-text-primary">{currentFood.food.name}</span>
            {currentFood.food.local_name ? ` (${currentFood.food.local_name})` : ""}
          </>
        }
      />

      {/* ── Navigasi antar makanan ─────────────────────────────────────── */}
      <nav aria-label="Daftar makanan" className="flex flex-wrap gap-2">
        {foods.map((rf, i) => (
          <button
            key={`${rf.food.id}-${i}`}
            type="button"
            aria-current={i === safeIndex ? "true" : undefined}
            onClick={() => onFoodIndexChange(i)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              i === safeIndex
                ? "border-primary bg-primary font-semibold text-white"
                : rf.portion
                  ? "border-success-border bg-success-light text-success"
                  : "border-border text-text-muted hover:border-primary-border hover:text-primary"
            )}
          >
            {rf.portion ? <Check aria-hidden className="h-3 w-3" /> : <span>{i + 1}.</span>}
            {rf.food.name}
          </button>
        ))}
      </nav>

      {loading ? (
        <LoadingState label="Memuat pilihan porsi…" />
      ) : (
        <>
          {detailError ? (
            <Banner icon={AlertCircle} tone="danger">
              {detailError} Anda tetap bisa melanjutkan dengan mengisi berat secara manual.
            </Banner>
          ) : null}

          {/* ── Foto porsi ───────────────────────────────────────────── */}
          {photos.length > 0 ? (
            <div
              role="radiogroup"
              aria-label="Pilihan porsi"
              className="grid grid-cols-2 gap-3 sm:grid-cols-3"
            >
              {photos.map((photo) => {
                const active = selectedPhoto?.id === photo.id;
                return (
                  <SelectTile
                    key={photo.id}
                    role="radio"
                    aria-checked={active}
                    active={active}
                    onClick={() =>
                      setSelection({
                        foodId: currentFood.food.id,
                        photo,
                        customGram: "",
                      })
                    }
                  >
                    <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-surface-alt">
                      {photo.thumbnail_url || photo.image_url ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo.thumbnail_url ?? photo.image_url}
                            alt={photo.label}
                            className="h-full w-full object-cover"
                          />
                          <LiveCanvasOverlay send={send} targetImageId={photo.id} />
                        </>
                      ) : (
                        <ImageOff aria-hidden className="h-6 w-6 text-text-placeholder" />
                      )}
                      <span className="absolute bottom-1 right-1 rounded-sm bg-black/55 px-1 font-mono text-[10px] font-bold text-white">
                        {photo.weight_gram}g
                      </span>
                    </div>
                    <span className="text-xs font-bold text-text-secondary">{photo.label}</span>
                    {photo.description ? (
                      <span className="text-[10px] text-text-muted">{photo.description}</span>
                    ) : null}
                  </SelectTile>
                );
              })}
            </div>
          ) : !detailError ? (
            <EmptyState icon={ImageOff}>
              Belum ada foto porsi untuk makanan ini. Silakan isi beratnya secara manual di bawah.
            </EmptyState>
          ) : null}

          {/* ── Input manual + total ─────────────────────────────────── */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardLabel icon={Scale}>Atau isi berat manual</CardLabel>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={MAX_PORTION_GRAM}
                  inputMode="numeric"
                  aria-label="Berat porsi dalam gram"
                  className="h-10 w-32 rounded-lg border border-border bg-surface px-3 text-center font-mono text-sm text-text-primary outline-none transition-colors focus:border-primary focus:shadow-focus"
                  placeholder="mis. 150"
                  value={customGram}
                  onChange={(e) =>
                    setSelection({
                      foodId: currentFood.food.id,
                      photo: null,
                      customGram: e.target.value,
                    })
                  }
                />
                <span className="text-sm text-text-muted">gram</span>
              </div>
              <p className="mt-2 text-xs text-text-muted">Maksimal {MAX_PORTION_GRAM} gram.</p>
            </Card>

            <div className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-primary-border bg-surface p-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                Total berat
              </span>
              <span className="font-mono text-3xl font-bold leading-none text-primary">
                {totalWeight > 0 ? `${totalWeight}g` : "—"}
              </span>
            </div>
          </div>

          {/* ── Navigasi antar makanan ───────────────────────────────── */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              icon={ChevronLeft}
              onClick={() => onFoodIndexChange(Math.max(0, safeIndex - 1))}
              disabled={safeIndex === 0}
            >
              Sebelumnya
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={ChevronRight}
              iconPosition="right"
              onClick={() => onFoodIndexChange(Math.min(foods.length - 1, safeIndex + 1))}
              disabled={isLastFood}
            >
              Berikutnya
            </Button>
          </div>
        </>
      )}

      <StepNav>
        <Button variant="ghost" onClick={onBack}>
          Kembali
        </Button>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" icon={Check} onClick={handleConfirm} disabled={!canConfirm}>
            Simpan porsi ini
          </Button>
          <Button
            icon={ArrowRight}
            iconPosition="right"
            onClick={onContinue}
            disabled={!allPortioned}
            title={allPortioned ? undefined : "Semua makanan harus punya porsi dulu"}
          >
            Lanjut
          </Button>
        </div>
      </StepNav>
    </StepShell>
  );
}
