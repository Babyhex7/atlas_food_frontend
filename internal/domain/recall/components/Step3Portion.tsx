"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  ImageOff,
  Scale,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { getFoodPublic } from "@/internal/services/food.service";
import { getApiErrorMessage } from "@/internal/pkg/utils/apiError";
import type { FoodDetail, PortionPhoto } from "@/internal/domain/food/types/food";
import type { RecallFood } from "../types/recall";
import type { SelectedPortion } from "@/internal/domain/portion/types/portion";
import { useCollab } from "@/internal/domain/collab";
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

/** Pilihan pecahan dan kelipatan cepat porsi standar gizi */
const PORTION_PRESETS = [
  { label: "¼", name: "Seperempat", totalQty: 0.25, quantity: 0, fraction: 0.25 },
  { label: "½", name: "Setengah", totalQty: 0.5, quantity: 0, fraction: 0.5 },
  { label: "¾", name: "Tiga perempat", totalQty: 0.75, quantity: 0, fraction: 0.75 },
  { label: "1x", name: "Standar (1 porsi)", totalQty: 1.0, quantity: 1, fraction: 0 },
  { label: "1½", name: "Satu setengah", totalQty: 1.5, quantity: 1, fraction: 0.5 },
  { label: "2x", name: "Dua porsi", totalQty: 2.0, quantity: 2, fraction: 0 },
] as const;

/** Format label pecahan porsi agar ramah dibaca manusia */
function formatQuantityLabel(qty: number): string {
  if (qty === 0.25) return "¼ porsi";
  if (qty === 0.5) return "½ porsi";
  if (qty === 0.75) return "¾ porsi";
  if (qty === 1) return "1 porsi (penuh)";
  if (qty === 1.25) return "1 ¼ porsi";
  if (qty === 1.5) return "1 ½ porsi";
  if (qty === 1.75) return "1 ¾ porsi";
  if (qty % 1 === 0) return `${qty} porsi`;
  if (qty % 1 === 0.5) return `${Math.floor(qty)} ½ porsi`;
  if (qty % 1 === 0.25) return `${Math.floor(qty)} ¼ porsi`;
  if (qty % 1 === 0.75) return `${Math.floor(qty)} ¾ porsi`;
  return `${qty} porsi`;
}

/** Pisahkan total quantity menjadi integer bulat dan pecahan */
function decomposeQuantity(total: number): { quantity: number; fraction: number } {
  const whole = Math.floor(total);
  const frac = Math.round((total - whole) * 100) / 100;
  return {
    quantity: whole,
    fraction: frac,
  };
}

interface Props {
  foods: RecallFood[];
  foodIndex: number;
  onPortionSelected: (foodId: string, portion: SelectedPortion, detail?: FoodDetail) => void;
  onFoodIndexChange: (index: number) => void;
  onContinue: () => void;
  onBack: () => void;
  portionNextRef?: React.MutableRefObject<(() => void) | null>;
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
  quantity: number;
  fraction: number;
  customGram: string;
}

function calcTotalWeight(
  selected: PortionPhoto | null,
  quantity: number,
  fraction: number,
  customGram: string
): number {
  if (customGram.trim() !== "") {
    const parsed = Number.parseFloat(customGram);
    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return Math.min(parsed, MAX_PORTION_GRAM);
  }
  if (!selected) return 0;
  const totalQty = quantity + fraction;
  const rawWeight = selected.weight_gram * totalQty;
  return Math.min(Math.round(rawWeight * 10) / 10, MAX_PORTION_GRAM);
}

export function Step3Portion({
  foods,
  foodIndex,
  onPortionSelected,
  onFoodIndexChange,
  onContinue,
  onBack,
  portionNextRef,
}: Props) {
  const [fetched, setFetched] = useState<FetchedDetail | null>(null);
  const [selection, setSelection] = useState<PortionSelection | null>(null);
  const { send, isConnected } = useCollab();

  // Index dijepit ke daftar yang ada sekarang.
  const safeIndex = foods.length > 0 ? Math.min(Math.max(foodIndex, 0), foods.length - 1) : 0;
  const currentFood = foods[safeIndex];
  const currentFoodId = currentFood?.food.id;

  const cachedDetail = currentFood?.detail ?? null;
  const isFetchedForCurrent = Boolean(currentFoodId) && fetched?.foodId === currentFoodId;
  const detail = cachedDetail ?? (isFetchedForCurrent ? fetched.detail : null);
  const detailError = isFetchedForCurrent ? fetched.error : null;
  const loading = Boolean(currentFoodId) && !cachedDetail && !isFetchedForCurrent;

  const photos = useMemo(() => detail?.portion_photos ?? [], [detail]);
  const savedPortion = currentFood?.portion;

  // Cari foto yang cocok bila makanan aktif sudah memiliki porsi di session
  const matchingSavedPhoto = useMemo(() => {
    if (!savedPortion || savedPortion.method === "input") return null;
    return (
      photos.find(
        (p) =>
          (savedPortion.image_id && p.id === savedPortion.image_id) ||
          (savedPortion.image_label && p.label === savedPortion.image_label) ||
          (savedPortion.base_weight && p.weight_gram === savedPortion.base_weight) ||
          (savedPortion.portion_gram && p.weight_gram === savedPortion.portion_gram)
      ) ?? null
    );
  }, [savedPortion, photos]);

  const savedDecomposed = useMemo(() => {
    if (!savedPortion) return { quantity: 1, fraction: 0, total_quantity: 1 };
    if (typeof savedPortion.total_quantity === "number" && savedPortion.total_quantity > 0) {
      const decomp = decomposeQuantity(savedPortion.total_quantity);
      return { ...decomp, total_quantity: savedPortion.total_quantity };
    }
    const q = savedPortion.quantity ?? 1;
    const f = savedPortion.fraction ?? 0;
    return { quantity: q, fraction: f, total_quantity: q + f };
  }, [savedPortion]);

  // Pilihan lokal hanya berlaku untuk makanan yang aktif; bila belum diedit lokal,
  // ambil dari data tersimpan di session agar tidak hilang saat navigasi tab.
  const activeSelection = selection?.foodId === currentFoodId ? selection : null;
  const selectedPhoto = activeSelection ? activeSelection.photo : matchingSavedPhoto;

  const currentQuantity = activeSelection
    ? activeSelection.quantity
    : (savedDecomposed?.quantity ?? 1);
  const currentFraction = activeSelection
    ? activeSelection.fraction
    : (savedDecomposed?.fraction ?? 0);
  const currentTotalQty = Math.round((currentQuantity + currentFraction) * 100) / 100;

  const customGram = activeSelection
    ? activeSelection.customGram
    : savedPortion?.method === "input"
      ? String(savedPortion.portion_gram)
      : "";

  const totalWeight = activeSelection
    ? calcTotalWeight(selectedPhoto, currentQuantity, currentFraction, customGram)
    : (savedPortion?.portion_gram ??
       (selectedPhoto ? Math.round(selectedPhoto.weight_gram * currentTotalQty * 10) / 10 : 0));

  // Muat detail makanan saat makanan aktif berubah.
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

  const currentFoodHasPortion =
    totalWeight > 0 || Boolean(currentFood?.portion && currentFood.portion.portion_gram > 0);
  const allPortioned = foods.every((f, i) =>
    i === safeIndex
      ? currentFoodHasPortion
      : Boolean(f.portion && f.portion.portion_gram > 0)
  );
  const isLastFood = safeIndex >= foods.length - 1;

  const handleConfirm = useCallback(() => {
    if (!currentFood || totalWeight <= 0) return;
    const usesCustom = customGram.trim() !== "";
    const portion: SelectedPortion = {
      method: usesCustom
        ? "input"
        : currentTotalQty === 1
          ? "simple_grid"
          : "as_served_quantity",
      image_id: usesCustom ? undefined : selectedPhoto?.id,
      image_label: usesCustom ? undefined : selectedPhoto?.label,
      base_weight: usesCustom ? undefined : selectedPhoto?.weight_gram,
      quantity: usesCustom ? 1 : currentQuantity,
      fraction: usesCustom ? 0 : currentFraction,
      total_quantity: usesCustom ? 1 : currentTotalQty,
      portion_gram: totalWeight,
    };
    onPortionSelected(currentFood.food.id, portion, detail ?? undefined);
    if (isConnected) {
      send("portion_set", {
        food_id: currentFood.food.id,
        food_name: currentFood.food.name,
        portion_gram: totalWeight,
        image_label: portion.image_label,
        quantity: portion.quantity,
        fraction: portion.fraction,
        total_quantity: portion.total_quantity,
      });
    }
  }, [
    currentFood,
    totalWeight,
    customGram,
    currentTotalQty,
    currentQuantity,
    currentFraction,
    selectedPhoto,
    detail,
    onPortionSelected,
    isConnected,
    send,
  ]);

  const handleSelectPhoto = useCallback(
    (photo: PortionPhoto) => {
      if (!currentFood) return;
      setSelection({
        foodId: currentFood.food.id,
        photo,
        quantity: 1,
        fraction: 0,
        customGram: "",
      });
      const portion: SelectedPortion = {
        method: "simple_grid",
        image_id: photo.id,
        image_label: photo.label,
        base_weight: photo.weight_gram,
        quantity: 1,
        fraction: 0,
        total_quantity: 1,
        portion_gram: photo.weight_gram,
      };
      onPortionSelected(currentFood.food.id, portion, detail ?? undefined);
      if (isConnected) {
        send("portion_set", {
          food_id: currentFood.food.id,
          food_name: currentFood.food.name,
          portion_gram: photo.weight_gram,
          image_label: photo.label,
          quantity: 1,
          fraction: 0,
          total_quantity: 1,
        });
      }
    },
    [currentFood, onPortionSelected, detail, isConnected, send]
  );

  const handlePresetSelect = useCallback(
    (qty: number, frac: number, total: number) => {
      if (!currentFood || !selectedPhoto) return;
      setSelection({
        foodId: currentFood.food.id,
        photo: selectedPhoto,
        quantity: qty,
        fraction: frac,
        customGram: "",
      });
      const calculatedWeight = Math.min(
        Math.round(selectedPhoto.weight_gram * total * 10) / 10,
        MAX_PORTION_GRAM
      );
      const portion: SelectedPortion = {
        method: total === 1 ? "simple_grid" : "as_served_quantity",
        image_id: selectedPhoto.id,
        image_label: selectedPhoto.label,
        base_weight: selectedPhoto.weight_gram,
        quantity: qty,
        fraction: frac,
        total_quantity: total,
        portion_gram: calculatedWeight,
      };
      onPortionSelected(currentFood.food.id, portion, detail ?? undefined);
      if (isConnected) {
        send("portion_set", {
          food_id: currentFood.food.id,
          food_name: currentFood.food.name,
          portion_gram: calculatedWeight,
          image_label: selectedPhoto.label,
          quantity: qty,
          fraction: frac,
          total_quantity: total,
        });
      }
    },
    [currentFood, selectedPhoto, onPortionSelected, detail, isConnected, send]
  );

  const handleStep = useCallback(
    (delta: number) => {
      if (!currentFood || !selectedPhoto) return;
      let nextQty: number;
      if (delta > 0) {
        if (currentTotalQty < 1) {
          nextQty = Math.round((currentTotalQty + 0.25) * 100) / 100;
        } else {
          nextQty = Math.round((currentTotalQty + 0.5) * 10) / 10;
        }
        nextQty = Math.min(nextQty, 10);
      } else {
        if (currentTotalQty <= 1) {
          nextQty = Math.round((currentTotalQty - 0.25) * 100) / 100;
        } else {
          nextQty = Math.round((currentTotalQty - 0.5) * 10) / 10;
        }
        nextQty = Math.max(nextQty, 0.25);
      }

      const decomp = decomposeQuantity(nextQty);
      handlePresetSelect(decomp.quantity, decomp.fraction, nextQty);
    },
    [currentFood, selectedPhoto, currentTotalQty, handlePresetSelect]
  );

  const handleCustomGramChange = useCallback(
    (val: string) => {
      if (!currentFood) return;
      setSelection({
        foodId: currentFood.food.id,
        photo: null,
        quantity: 1,
        fraction: 0,
        customGram: val,
      });
      const parsed = Number.parseFloat(val);
      if (Number.isFinite(parsed) && parsed > 0) {
        const gram = Math.min(parsed, MAX_PORTION_GRAM);
        const portion: SelectedPortion = {
          method: "input",
          quantity: 1,
          fraction: 0,
          total_quantity: 1,
          portion_gram: gram,
        };
        onPortionSelected(currentFood.food.id, portion, detail ?? undefined);
        if (isConnected) {
          send("portion_set", {
            food_id: currentFood.food.id,
            food_name: currentFood.food.name,
            portion_gram: gram,
          });
        }
      }
    },
    [currentFood, onPortionSelected, detail, isConnected, send]
  );

  const handleNextStep3 = useCallback(() => {
    if (!currentFoodHasPortion) return;

    handleConfirm();

    // Cari makanan pertama yang belum diisi porsinya
    const unportionedIndex = foods.findIndex((f, i) =>
      i === safeIndex ? !currentFoodHasPortion : !f.portion || f.portion.portion_gram <= 0
    );

    if (unportionedIndex === -1) {
      onContinue();
    } else {
      onFoodIndexChange(unportionedIndex);
    }
  }, [currentFoodHasPortion, handleConfirm, foods, safeIndex, onContinue, onFoodIndexChange]);

  useEffect(() => {
    if (portionNextRef) {
      portionNextRef.current = handleNextStep3;
    }
    return () => {
      if (portionNextRef) portionNextRef.current = null;
    };
  }, [portionNextRef, handleNextStep3]);

  if (!currentFood) {
    return (
      <StepShell>
        <StepHeader title="Estimasi porsi" />
        <EmptyState icon={AlertCircle}>
          Belum ada makanan untuk diatur porsinya. Kembali ke langkah sebelumnya untuk menambahkan
          makanan.
        </EmptyState>
        <StepNav>
          <Button variant="secondary" onClick={onBack}>
            Kembali
          </Button>
        </StepNav>
      </StepShell>
    );
  }

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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Pilih foto referensi terdekat:
                </span>
                {selectedPhoto && (
                  <span className="text-xs text-text-muted">
                    Acuan terpilih:{" "}
                    <strong className="text-text-primary">{selectedPhoto.label}</strong> (
                    {selectedPhoto.weight_gram}g)
                  </span>
                )}
              </div>

              <div
                role="radiogroup"
                aria-label="Pilihan porsi"
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              >
                {photos.map((photo) => {
                  const active = selectedPhoto?.id === photo.id;
                  const isModified = active && currentTotalQty !== 1;
                  const displayGram = isModified
                    ? Math.round(photo.weight_gram * currentTotalQty * 10) / 10
                    : photo.weight_gram;

                  return (
                    <SelectTile
                      key={photo.id}
                      role="radio"
                      aria-checked={active}
                      active={active}
                      onClick={() => handleSelectPhoto(photo)}
                    >
                      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-surface-alt">
                        {photo.thumbnail_url || photo.image_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={photo.thumbnail_url ?? photo.image_url}
                            alt={photo.label}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageOff aria-hidden className="h-6 w-6 text-text-placeholder" />
                        )}

                        {/* Tag berat porsi di sudut foto */}
                        <span
                          className={cn(
                            "absolute bottom-1 right-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold text-white shadow-sm transition-colors",
                            isModified ? "bg-primary" : "bg-black/60"
                          )}
                        >
                          {isModified ? `${currentTotalQty}x (${displayGram}g)` : `${photo.weight_gram}g`}
                        </span>

                        {active && (
                          <div className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white shadow">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-bold text-text-secondary">{photo.label}</span>
                      {photo.description ? (
                        <span className="text-[10px] text-text-muted">{photo.description}</span>
                      ) : null}
                    </SelectTile>
                  );
                })}
              </div>

              {/* ── Panel Penyesuaian Porsi (Muncul saat foto dipilih) ────── */}
              {selectedPhoto && (
                <div className="rounded-2xl border-2 border-primary/20 bg-surface p-4 shadow-sm transition-all sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Sparkles className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm font-semibold text-text-primary">
                        Sesuaikan jumlah porsi dari foto{" "}
                        <strong className="text-primary">{selectedPhoto.label}</strong>
                      </span>
                      <span className="rounded-md bg-surface-alt px-2 py-0.5 font-mono text-xs text-text-muted">
                        Acuan 1 porsi = {selectedPhoto.weight_gram}g
                      </span>
                    </div>

                    {currentTotalQty !== 1 && (
                      <button
                        type="button"
                        onClick={() => handlePresetSelect(1, 0, 1)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-text-muted transition-colors hover:bg-surface-alt hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Reset ke 1x ({selectedPhoto.weight_gram}g)
                      </button>
                    )}
                  </div>

                  <div className="mt-4 space-y-4">
                    {/* Petunjuk pecahan */}
                    <div>
                      <span className="text-xs font-semibold text-text-secondary">
                        Berapa banyak yang Anda konsumsi dari porsi di atas?
                      </span>
                      <p className="text-[11px] text-text-muted">
                        Pilih pecahan porsi (misal makan setengahnya atau nambah porsi):
                      </p>
                    </div>

                    {/* Quick Preset Buttons (Chips) */}
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                      {PORTION_PRESETS.map((preset) => {
                        const isSelected = Math.abs(currentTotalQty - preset.totalQty) < 0.01;
                        const calculatedGram =
                          Math.round(selectedPhoto.weight_gram * preset.totalQty * 10) / 10;
                        return (
                          <button
                            key={preset.totalQty}
                            type="button"
                            onClick={() =>
                              handlePresetSelect(preset.quantity, preset.fraction, preset.totalQty)
                            }
                            className={cn(
                              "flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95",
                              isSelected
                                ? "border-primary bg-primary/10 font-bold text-primary shadow-sm ring-1 ring-primary"
                                : "border-border bg-surface hover:border-primary-border hover:bg-surface-alt text-text-secondary"
                            )}
                          >
                            <span className="text-sm font-bold">{preset.label}</span>
                            <span className="text-[10px] text-text-muted">{preset.name}</span>
                            <span className="mt-1 font-mono text-[11px] font-semibold text-primary">
                              {calculatedGram}g
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Stepper (+ / -) untuk porsi custom / kelipatan lebih lanjut */}
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-alt/40 p-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-text-primary">
                          Atur kelipatan lebih lanjut (+ / -)
                        </span>
                        <span className="text-[11px] text-text-muted">
                          Tekan plus untuk porsi nambah, atau minus jika makan lebih sedikit
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStep(-1)}
                          disabled={currentTotalQty <= 0.25}
                          aria-label="Kurangi porsi"
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface font-bold text-text-primary transition-colors",
                            "hover:border-primary hover:bg-primary/5 hover:text-primary active:scale-95 disabled:pointer-events-none disabled:opacity-30"
                          )}
                        >
                          <Minus className="h-4 w-4" />
                        </button>

                        <div className="flex min-w-[110px] flex-col items-center justify-center rounded-lg border border-border bg-surface px-3 py-1">
                          <span className="font-mono text-sm font-bold text-text-primary">
                            {formatQuantityLabel(currentTotalQty)}
                          </span>
                          <span className="font-mono text-[10px] text-text-muted">
                            ({currentTotalQty}x acuan)
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleStep(1)}
                          disabled={currentTotalQty >= 10}
                          aria-label="Tambah porsi"
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface font-bold text-text-primary transition-colors",
                            "hover:border-primary hover:bg-primary/5 hover:text-primary active:scale-95 disabled:pointer-events-none disabled:opacity-30"
                          )}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Rincian hitungan kalkulasi */}
                    <div className="flex items-center justify-between rounded-xl bg-primary/10 px-4 py-2.5 text-xs text-primary">
                      <span className="flex items-center gap-2 font-medium">
                        <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                        <span>
                          {currentTotalQty} porsi × {selectedPhoto.weight_gram}g (berat acuan foto)
                        </span>
                      </span>
                      <span className="font-mono text-sm font-bold">= {totalWeight} gram</span>
                    </div>
                  </div>
                </div>
              )}
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
                  className={cn(
                    "h-10 w-32 rounded-lg border bg-surface px-3 text-center font-mono text-sm text-text-primary outline-none transition-colors",
                    "focus:border-primary focus:shadow-focus",
                    customGram.trim() !== "" ? "border-primary ring-1 ring-primary" : "border-border"
                  )}
                  placeholder="mis. 150"
                  value={customGram}
                  onChange={(e) => handleCustomGramChange(e.target.value)}
                />
                <span className="text-sm text-text-muted">gram</span>
              </div>
              <p className="mt-2 text-xs text-text-muted">
                {customGram.trim() !== ""
                  ? "Menggunakan input berat manual (foto diabaikan)."
                  : `Gunakan jika Anda menimbang sendiri dengan timbangan dapur (maks ${MAX_PORTION_GRAM}g).`}
              </p>
            </Card>

            <div className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-primary-border bg-surface p-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                Total berat makanan
              </span>
              <span className="font-mono text-3xl font-bold leading-none text-primary">
                {totalWeight > 0 ? `${totalWeight}g` : "—"}
              </span>
              {selectedPhoto && customGram.trim() === "" && (
                <span className="mt-1 text-xs text-text-muted">
                  {formatQuantityLabel(currentTotalQty)} ({selectedPhoto.label})
                </span>
              )}
            </div>
          </div>
        </>
      )}

      <StepNav>
        <Button variant="secondary" onClick={onBack}>
          Kembali
        </Button>
        <Button
          icon={ArrowRight}
          iconPosition="right"
          onClick={handleNextStep3}
          disabled={!currentFoodHasPortion}
        >
          {allPortioned
            ? "Lanjut ke Detail Tambahan"
            : isLastFood
              ? "Lanjut ke Makanan yang Belum Diisi"
              : "Lanjut ke Makanan Berikutnya"}
        </Button>
      </StepNav>
    </StepShell>
  );
}
