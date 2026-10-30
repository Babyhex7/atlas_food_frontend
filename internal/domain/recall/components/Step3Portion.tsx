"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  ImageOff,
  Scale,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";
import { getFoodPublic } from "@/internal/services/food.service";
import { getApiErrorMessage } from "@/internal/pkg/utils/apiError";
import type { FoodDetail, PortionPhoto } from "@/internal/domain/food/types/food";
import type { RecallFood } from "../types/recall";
import type { SelectedPortion } from "@/internal/domain/portion/types/portion";
import { useCollab } from "@/internal/domain/collab";
import { getImageUrl, isGuideType, isRangeType } from "@/internal/lib/image";
import { AnnotationHoverOverlay } from "@/internal/domain/annotation/components/AnnotationHoverOverlay";
import { usePublishedAnnotationsByFood } from "@/internal/domain/annotation/hooks/useAnnotationQueries";
import type { FoodImage } from "@/internal/domain/annotation/types/annotation";
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
import { PortionAdjustModal } from "./PortionAdjustModal";
import { AIAssistantSidebar } from "@/internal/domain/ai";

/** Batas berat yang masuk akal untuk satu porsi (gram) — maksimal 3.000g (3 kg) */
const MIN_PORTION_GRAM = 1;
const MAX_PORTION_GRAM = 3000;

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

function formatFractionDisplay(qty: number): string {
  if (qty === 0.25) return "1/4 porsi";
  if (qty === 0.5) return "1/2 porsi";
  if (qty === 0.75) return "3/4 porsi";
  if (qty === 1) return "1 porsi";
  if (qty === 1.25) return "1 1/4 porsi";
  if (qty === 1.5) return "1 1/2 porsi";
  if (qty === 1.75) return "1 3/4 porsi";
  if (qty % 1 === 0) return `${qty} porsi`;
  return `${qty} porsi`;
}

function formatPillValue(qty: number): string {
  if (qty === 0.25) return "1/4";
  if (qty === 0.5) return "1/2";
  if (qty === 0.75) return "3/4";
  if (qty === 1) return "1";
  if (qty === 1.25) return "1 1/4";
  if (qty === 1.5) return "1 1/2";
  if (qty === 1.75) return "1 3/4";
  return String(qty);
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
  const [activeModalPhoto, setActiveModalPhoto] = useState<PortionPhoto | null>(null);
  const [visiblePolygons, setVisiblePolygons] = useState(true);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [currentAreas, setCurrentAreas] = useState<FoodImage["areas"]>([]);
  const { send, isConnected } = useCollab();

  // Index dijepit ke daftar yang ada sekarang.
  const safeIndex = foods.length > 0 ? Math.min(Math.max(foodIndex, 0), foods.length - 1) : 0;
  const currentFood = foods[safeIndex];
  const currentFoodId = currentFood?.food.id;

  const { data: publishedImages } = usePublishedAnnotationsByFood(currentFoodId);
  const publishedImage = publishedImages && publishedImages.length > 0 ? publishedImages[0] : null;

  const cachedDetail = currentFood?.detail ?? null;
  const isFetchedForCurrent = Boolean(currentFoodId) && fetched?.foodId === currentFoodId;
  const detail = cachedDetail ?? (isFetchedForCurrent ? fetched.detail : null);
  const detailError = isFetchedForCurrent ? fetched.error : null;
  const loading = Boolean(currentFoodId) && !cachedDetail && !isFetchedForCurrent;

  const photos = useMemo(() => detail?.portion_photos ?? [], [detail]);
  const savedPortion = currentFood?.portion;

  const photoType = detail?.photo_type;
  const isGuide = isGuideType(photoType);
  const isRange = isRangeType(photoType);

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
  const selectedPhoto = activeSelection ? activeSelection.photo : (matchingSavedPhoto ?? photos[0] ?? null);

  // Foto yang digunakan sebagai scene anotasi:
  // Untuk Series, selalu ikuti foto porsi aktif (A, B, C, dst.) agar anotasinya tepat sesuai ukuran makanan.
  const effectiveFoodImageId =
    (isGuide || isRange)
      ? (photos.find((p) => p.food_image_id)?.food_image_id || photos[0]?.food_image_id || publishedImage?.id)
      : (selectedPhoto?.food_image_id || photos[0]?.food_image_id || publishedImage?.id);

  const hasInteractiveAnnotation = isGuide || isRange || Boolean(effectiveFoodImageId);
  const interactiveSceneUrl =
    (isGuide || isRange)
      ? (photos[0]?.image_url || publishedImage?.image_url)
      : (selectedPhoto?.image_url || photos[0]?.image_url || publishedImage?.image_url);

  // Sinkronkan highlight anotasi saat area selesai dimuat atau saat foto aktif berganti
  useEffect(() => {
    if (currentAreas.length > 0) {
      const match = currentAreas.find(
        (a) =>
          (selectedPhoto && a.weight_gram && Math.abs(a.weight_gram - selectedPhoto.weight_gram) < 0.5) ||
          (selectedPhoto && a.name.toLowerCase().includes(`porsi ${selectedPhoto.label.toLowerCase()}`))
      );
      setSelectedAreaId(match ? match.id : currentAreas[0].id);
    } else {
      setSelectedAreaId(null);
    }
  }, [currentAreas, selectedPhoto]);

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

      // Sinkronkan highlight anotasi jika foto ini memiliki area yang cocok
      if (currentAreas && currentAreas.length > 0) {
        const matchingArea = currentAreas.find(
          (a) =>
            a.name.toLowerCase() === photo.label.toLowerCase() ||
            (photo.description && a.name.toLowerCase() === photo.description.toLowerCase()) ||
            (a.weight_gram && Math.abs(a.weight_gram - photo.weight_gram) < 0.5)
        );
        setSelectedAreaId(matchingArea ? matchingArea.id : null);
      } else {
        setSelectedAreaId(null);
      }

      const portion: SelectedPortion = {
        method: "simple_grid",
        image_id: photo.id,
        image_label: photo.label,
        image_url: photo.thumbnail_url || photo.image_url,
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
    [currentFood, currentAreas, onPortionSelected, detail, isConnected, send]
  );

  // Daftar porsi terformat untuk Asisten AI (Step 3)
  const availablePortions = useMemo(
    () =>
      photos.map((p) => ({
        label: p.label || "",
        weight_gram: p.weight_gram,
        description: p.description || "",
      })),
    [photos]
  );

  const handleAISelectPortion = useCallback(
    (label: string, gram?: number) => {
      const match = photos.find(
        (p) =>
          p.label.toLowerCase() === label.toLowerCase() ||
          (typeof gram === "number" && Math.abs(p.weight_gram - gram) < 1)
      );
      if (match) {
        handleSelectPhoto(match);
      }
    },
    [photos, handleSelectPhoto]
  );

  const handlePresetSelect = useCallback(
    (qty: number, frac: number, total: number, photoOverride?: PortionPhoto) => {
      const photoToUse = photoOverride || selectedPhoto || activeModalPhoto;
      if (!currentFood || !photoToUse) return;
      setSelection({
        foodId: currentFood.food.id,
        photo: photoToUse,
        quantity: qty,
        fraction: frac,
        customGram: "",
      });
      const calculatedWeight = Math.min(
        Math.round(photoToUse.weight_gram * total * 10) / 10,
        MAX_PORTION_GRAM
      );
      const portion: SelectedPortion = {
        method: total === 1 ? "simple_grid" : "as_served_quantity",
        image_id: photoToUse.id,
        image_label: photoToUse.label,
        image_url: photoToUse.thumbnail_url || photoToUse.image_url,
        base_weight: photoToUse.weight_gram,
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
          image_label: photoToUse.label,
          quantity: qty,
          fraction: frac,
          total_quantity: total,
        });
      }
    },
    [currentFood, selectedPhoto, activeModalPhoto, onPortionSelected, detail, isConnected, send]
  );

  const handleStep = useCallback(
    (delta: number, photoOverride?: PortionPhoto) => {
      const photoToUse = photoOverride || selectedPhoto || activeModalPhoto;
      if (!currentFood || !photoToUse) return;
      let nextQty: number;
      if (delta > 0) {
        if (currentTotalQty < 1) {
          nextQty = Math.min(10, currentTotalQty + 0.25);
        } else {
          nextQty = Math.min(10, currentTotalQty + 0.5);
        }
      } else {
        if (currentTotalQty <= 1) {
          nextQty = Math.max(0.25, currentTotalQty - 0.25);
        } else {
          nextQty = Math.max(0.25, currentTotalQty - 0.5);
        }
      }

      const decomp = decomposeQuantity(nextQty);
      handlePresetSelect(decomp.quantity, decomp.fraction, nextQty, photoToUse);
    },
    [currentFood, selectedPhoto, activeModalPhoto, currentTotalQty, handlePresetSelect]
  );

  const handleCustomGramChange = useCallback(
    (val: string) => {
      if (!currentFood) return;

      // Filter hanya digit dan batasi maksimal 4 karakter (misal hingga 3000)
      const sanitized = val.replace(/[^\d]/g, "").slice(0, 4);
      let parsed = Number.parseInt(sanitized, 10);
      let clampedVal = sanitized;

      if (Number.isFinite(parsed) && parsed > MAX_PORTION_GRAM) {
        parsed = MAX_PORTION_GRAM;
        clampedVal = String(MAX_PORTION_GRAM);
      }

      setSelection({
        foodId: currentFood.food.id,
        photo: null,
        quantity: 1,
        fraction: 0,
        customGram: clampedVal,
      });

      if (Number.isFinite(parsed) && parsed >= MIN_PORTION_GRAM) {
        const portion: SelectedPortion = {
          method: "input",
          quantity: 1,
          fraction: 0,
          total_quantity: 1,
          portion_gram: parsed,
        };
        onPortionSelected(currentFood.food.id, portion, detail ?? undefined);
        if (isConnected) {
          send("portion_set", {
            food_id: currentFood.food.id,
            food_name: currentFood.food.name,
            portion_gram: parsed,
          });
        }
      }
    },
    [currentFood, onPortionSelected, detail, isConnected, send]
  );

  const handleAreaSelect = useCallback(
    (area: FoodImage["areas"][number]) => {
      setSelectedAreaId(area.id);
      // Cari apakah ada foto porsi dalam `photos` yang sesuai dengan nama/label area
      const match = photos.find(
        (p) =>
          p.label.toLowerCase() === area.name.toLowerCase() ||
          (p.description && p.description.toLowerCase().includes(area.name.toLowerCase())) ||
          (area.name && area.name.toLowerCase().includes(p.label.toLowerCase())) ||
          (area.weight_gram && Math.abs(p.weight_gram - area.weight_gram) < 0.5)
      );

      if (match) {
        handleSelectPhoto(match);
      } else if (area.weight_gram && area.weight_gram > 0) {
        handleCustomGramChange(String(Math.round(area.weight_gram)));
      }
    },
    [photos, handleSelectPhoto, handleCustomGramChange]
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

  const gridColsClass = useMemo(() => {
    const count = photos.length;
    if (count === 6) return "grid-cols-2 sm:grid-cols-3";
    if (count === 8) return "grid-cols-2 sm:grid-cols-4";
    if (count === 4) return "grid-cols-2 sm:grid-cols-4";
    if (count === 3) return "grid-cols-3";
    if (count === 2) return "grid-cols-2";
    return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";
  }, [photos.length]);

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
            {rf.portion?.image_url || rf.food.thumbnail_url || rf.food.image_url ? (
              <img
                src={getImageUrl(rf.portion?.image_url || rf.food.thumbnail_url || rf.food.image_url)}
                alt=""
                className="h-4 w-4 rounded-full object-cover shrink-0"
              />
            ) : rf.portion ? (
              <Check aria-hidden className="h-3 w-3" />
            ) : (
              <span>{i + 1}.</span>
            )}
            <span>{rf.food.name}</span>
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

          {/* ── Interactive Annotated Scene for Guide / Range / CMS Annotation ── */}
          {hasInteractiveAnnotation && interactiveSceneUrl && (
            <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xs mb-5">
              <div className="relative aspect-[16/9] max-h-[340px] w-full bg-slate-50/80 flex items-center justify-center overflow-hidden">
                <PortionThumb
                  src={interactiveSceneUrl}
                  alt={currentFood.food.name}
                  className="h-full w-full object-contain p-2 transition-transform duration-200"
                />

                {/* Interactive Polygons Overlay */}
                <AnnotationHoverOverlay
                  foodImageId={effectiveFoodImageId}
                  foodId={currentFoodId}
                  visiblePolygons={visiblePolygons}
                  selectedAreaId={selectedAreaId}
                  onAreaSelect={handleAreaSelect}
                  onLoadedAreas={setCurrentAreas}
                />

                {/* Toggle Visibility Area Button */}
                {currentAreas.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setVisiblePolygons(!visiblePolygons)}
                    className="absolute top-3 right-3 z-20 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-white/95 text-text-primary border border-border hover:bg-white transition-fast shadow-xs cursor-pointer"
                    title={visiblePolygons ? "Sembunyikan batas area" : "Tampilkan batas area"}
                  >
                    {visiblePolygons ? <Eye size={13} className="text-primary" /> : <EyeOff size={13} className="text-text-muted" />}
                    <span>{visiblePolygons ? "Area: ON" : "Area: OFF"}</span>
                  </button>
                )}

                {/* Badge Tipe Panduan */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-bold shadow-xs">
                    {isRange ? "Rentang Ukuran (Range)" : isGuide ? "Panduan Varian (Guide)" : "Panduan Porsi"}
                  </span>
                </div>
              </div>

              <div className="px-4 py-2.5 bg-surface-alt/70 border-t border-border flex items-center justify-between text-xs text-text-muted">
                <span>
                  Sentuh atau klik langsung bagian makanan pada foto di atas, atau pilih dari daftar di bawah.
                </span>
              </div>
            </div>
          )}

          {/* ── Foto porsi ───────────────────────────────────────────── */}
          {photos.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Pilih foto referensi porsi terdekat ({photos.length} pilihan):
                </span>
                <span className="text-xs text-text-muted">
                  Klik foto porsi aktif untuk menyesuaikan takaran
                </span>
              </div>

              {/* ── Grid Foto Porsi Proporsional ── */}
              <div
                role="radiogroup"
                aria-label="Pilihan porsi"
                className={cn("grid gap-3.5 pt-1", gridColsClass)}
              >
                {photos.map((photo) => {
                  const active = selectedPhoto?.id === photo.id;
                  const displayQty = active ? currentTotalQty : 1;
                  const displayGram = Math.round(photo.weight_gram * displayQty * 10) / 10;
                  const fractionText = formatFractionDisplay(displayQty);
                  const pillVal = formatPillValue(displayQty);

                  return (
                    <div
                      key={photo.id}
                      role="radio"
                      aria-checked={active}
                      onClick={() => {
                        handleSelectPhoto(photo);
                        if (active) {
                          setActiveModalPhoto(photo);
                        }
                      }}
                      className={cn(
                        "relative flex cursor-pointer flex-col items-center rounded-2xl border-2 p-3 text-center transition-all duration-150 select-none group",
                        active
                          ? "border-primary bg-primary/5 text-primary shadow-sm ring-2 ring-primary/20"
                          : "border-border bg-surface hover:border-primary/50 text-text-secondary hover:text-text-primary"
                      )}
                    >
                      {/* Top-Right Floating Pill Stepper Badge */}
                      {active && (
                        <div
                          className="absolute -top-3 -right-2 z-20 flex items-center justify-between gap-1 rounded-full bg-primary px-2.5 py-0.5 text-white shadow-md cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveModalPhoto(photo);
                          }}
                          title="Klik untuk buka modal penyesuaian porsi"
                        >
                          <button
                            type="button"
                            aria-label="Kurangi porsi"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStep(-1, photo);
                              setActiveModalPhoto(photo);
                            }}
                            disabled={currentTotalQty <= 0.25}
                            className="text-base font-bold leading-none text-white hover:scale-125 active:scale-95 disabled:opacity-40 transition-transform cursor-pointer"
                          >
                            −
                          </button>
                          <span
                            title="Klik untuk buka penyesuaian porsi"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveModalPhoto(photo);
                            }}
                            className="mx-1 font-mono text-xs font-bold leading-none text-white cursor-pointer hover:underline"
                          >
                            {pillVal}
                          </span>
                          <button
                            type="button"
                            aria-label="Tambah porsi"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStep(1, photo);
                              setActiveModalPhoto(photo);
                            }}
                            disabled={currentTotalQty >= 10}
                            className="text-base font-bold leading-none text-white hover:scale-125 active:scale-95 disabled:opacity-40 transition-transform cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      )}

                      {/* Photo Thumbnail Container 16:9 Proporsional */}
                      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-surface-alt">
                        <PortionThumb
                          src={photo.thumbnail_url || photo.image_url}
                          alt={photo.label}
                          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      </div>

                      {/* Info porsi di bawah foto */}
                      <div className="mt-3 flex flex-col items-center gap-0.5 w-full">
                        <span className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
                          Porsi {photo.label}
                        </span>
                        <span className="text-xs font-medium text-text-muted">
                          {displayGram}g <span className="text-text-placeholder">·</span> {fractionText}
                        </span>
                        {active && (
                          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                            ✏️ Atur takaran
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : !detailError ? (
            <EmptyState icon={ImageOff}>
              Belum ada foto porsi untuk makanan ini. Silakan isi beratnya secara manual di bawah.
            </EmptyState>
          ) : null}

          {/* ── Input manual + total ─────────────────────────────────── */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardLabel>Atau isi berat manual</CardLabel>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
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
                  ? `Menggunakan berat manual: ${customGram}g (foto referensi diabaikan).`
                  : `Batas porsi wajar: ${MIN_PORTION_GRAM} – ${MAX_PORTION_GRAM} gram (maks. 3 kg per porsi).`}
              </p>
              {Number(customGram) >= MAX_PORTION_GRAM && (
                <p className="mt-1.5 text-xs text-amber-600 font-semibold flex items-center gap-1">
                  <AlertCircle size={13} />
                  Maksimal {MAX_PORTION_GRAM}g tercapai (batas aman konsumsi 1 porsi makan).
                </p>
              )}
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

      {/* Modal Popup for Portion Adjustment */}
      {activeModalPhoto && (
        <PortionAdjustModal
          isOpen={Boolean(activeModalPhoto)}
          onClose={() => setActiveModalPhoto(null)}
          photo={activeModalPhoto}
          foodName={currentFood.food.name}
          currentTotalQty={currentTotalQty}
          onPresetSelect={(qty, frac, total) => {
            handlePresetSelect(qty, frac, total);
          }}
          onStep={handleStep}
          customGram={customGram}
          onCustomGram={handleCustomGramChange}
        />
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

      {/* Asisten AI Recall Sidebar (estimasi porsi URT & foto) */}
      <AIAssistantSidebar
        step="portion"
        foodName={currentFood?.food.name}
        availablePortions={availablePortions}
        contextFoods={foods.map((f) => f.food.name)}
        onSelectPortion={handleAISelectPortion}
      />
    </StepShell>
  );
}

/**
 * Foto referensi porsi.
 *
 * Path dari API relatif ("/uploads/atlas/..."), jadi WAJIB di-resolve lewat
 * getImageUrl — tanpa itu browser meminta gambar ke origin frontend dan semua
 * foto porsi tampil rusak. Bila file tetap gagal dimuat, tampilkan ikon
 * pengganti alih-alih ikon gambar rusak bawaan browser.
 */
function PortionThumb({
  src,
  alt,
  className = "h-full w-full object-cover transition-transform duration-200 hover:scale-105",
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  const resolved = getImageUrl(src);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!resolved || failedSrc === resolved) {
    return (
      <div className="flex h-full w-full items-center justify-center" data-testid="portion-photo-fallback">
        <ImageOff aria-hidden className="h-6 w-6 text-text-placeholder" />
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={resolved}
      alt={alt}
      onError={() => setFailedSrc(resolved)}
      className={className}
    />
  );
}
