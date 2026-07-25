"use client";

import { useState } from "react";
import { ArrowRight, Check, CupSoda, Plus, UtensilsCrossed, X } from "lucide-react";
import type { RecallFood, AdditionalItem } from "../types/recall";
import { Button, Card, Chip, EmptyState, StepHeader, StepNav, StepShell } from "./ui/Primitives";

const COMMON_ADDITIONALS = [
  { name: "Bawang", unit: "g" },
  { name: "Gula", unit: "g" },
  { name: "Garam", unit: "mg" },
  { name: "Air", unit: "ml" },
  { name: "Minyak", unit: "ml" },
  { name: "Wortel", unit: "g" },
  { name: "Mentega", unit: "g" },
  { name: "Cabai", unit: "g" },
  { name: "Bawang Putih", unit: "g" },
  { name: "Kecap", unit: "ml" },
  { name: "Telur", unit: "butir" },
  { name: "Keju", unit: "g" },
];

interface Props {
  foods: RecallFood[];
  onSetAdditionals: (foodId: string, additionals: AdditionalItem[]) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function Step4Additional({ foods, onSetAdditionals, onContinue, onBack }: Props) {
  const [foodAdditionals, setFoodAdditionals] = useState<Record<string, AdditionalItem[]>>(() =>
    Object.fromEntries(foods.map((f) => [f.food.id, f.additionals ?? []]))
  );

  const addAdditional = (foodId: string, name: string, unit: string) => {
    setFoodAdditionals((prev) => {
      const existing = prev[foodId] ?? [];
      if (existing.some((a) => a.name === name)) return prev;
      return {
        ...prev,
        [foodId]: [...existing, { name, amount: `0${unit}`, amount_value: 0, unit }],
      };
    });
  };

  const updateAmount = (foodId: string, additionalName: string, value: string, unit: string) => {
    // Nilai negatif tidak masuk akal untuk takaran bahan dan akan mengacaukan
    // total gizi, jadi dijepit di 0 ke atas.
    const parsed = Number.parseFloat(value);
    const numVal = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    setFoodAdditionals((prev) => ({
      ...prev,
      [foodId]: (prev[foodId] ?? []).map((a) =>
        a.name === additionalName ? { ...a, amount: `${numVal}${unit}`, amount_value: numVal } : a
      ),
    }));
  };

  const removeAdditional = (foodId: string, name: string) => {
    setFoodAdditionals((prev) => ({
      ...prev,
      [foodId]: (prev[foodId] ?? []).filter((a) => a.name !== name),
    }));
  };

  /** Simpan seluruh bahan tambahan ke session sebelum berpindah langkah. */
  const persist = () => {
    foods.forEach((f) => onSetAdditionals(f.food.id, foodAdditionals[f.food.id] ?? []));
  };

  const handleContinue = () => {
    persist();
    onContinue();
  };

  if (foods.length === 0) {
    return (
      <StepShell>
        <StepHeader title="Detail tambahan" />
        <EmptyState>Belum ada makanan pada waktu makan ini.</EmptyState>
        <StepNav>
          <Button variant="ghost" onClick={onBack}>
            Kembali
          </Button>
          <Button icon={ArrowRight} iconPosition="right" onClick={onContinue}>
            Lanjut
          </Button>
        </StepNav>
      </StepShell>
    );
  }

  return (
    <StepShell>
      <StepHeader
        title="Detail tambahan"
        subtitle="Adakah bahan, topping, atau bumbu tambahan yang Anda gunakan? (Opsional)"
      />

      {foods.map((rf) => {
        const items = foodAdditionals[rf.food.id] ?? [];
        const ItemIcon = rf.food_type === "drink" ? CupSoda : UtensilsCrossed;

        return (
          <Card key={rf.food.id}>
            <div className="mb-4 flex items-center gap-3 border-b border-border pb-3">
              <ItemIcon aria-hidden className="h-4 w-4 shrink-0 text-primary" />
              <span className="flex-1 text-sm font-semibold text-text-primary">
                {rf.food.name}
              </span>
              {rf.portion ? (
                <span className="rounded-full bg-surface-alt px-2 py-px font-mono text-xs text-text-muted">
                  {rf.portion.portion_gram}g
                </span>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.07em] text-text-muted">
                Tambah cepat
              </span>
              <div className="flex flex-wrap gap-2">
                {COMMON_ADDITIONALS.map((a) => {
                  const added = items.some((fa) => fa.name === a.name);
                  return (
                    <Chip
                      key={a.name}
                      active={added}
                      onClick={() =>
                        added
                          ? removeAdditional(rf.food.id, a.name)
                          : addAdditional(rf.food.id, a.name, a.unit)
                      }
                    >
                      {added ? (
                        <Check aria-hidden className="h-3 w-3" />
                      ) : (
                        <Plus aria-hidden className="h-3 w-3" />
                      )}
                      {a.name}
                    </Chip>
                  );
                })}
              </div>
            </div>

            {items.length > 0 ? (
              <ul className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                {items.map((a) => (
                  <li key={a.name} className="flex items-center gap-3">
                    <span className="flex-1 text-sm text-text-secondary">{a.name}</span>
                    <input
                      type="number"
                      min={0}
                      inputMode="decimal"
                      aria-label={`Takaran ${a.name} untuk ${rf.food.name}`}
                      className="h-8 w-20 rounded-md border border-border bg-surface px-2 text-center font-mono text-sm text-text-primary outline-none transition-colors focus:border-primary focus:shadow-focus"
                      value={a.amount_value || ""}
                      placeholder="0"
                      onChange={(e) => updateAmount(rf.food.id, a.name, e.target.value, a.unit)}
                    />
                    <span className="w-10 text-xs text-text-muted">{a.unit}</span>
                    <button
                      type="button"
                      onClick={() => removeAdditional(rf.food.id, a.name)}
                      aria-label={`Hapus ${a.name}`}
                      className="rounded-md p-1 text-text-muted transition-colors hover:bg-danger-light hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <X aria-hidden className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </Card>
        );
      })}

      <StepNav>
        <Button variant="ghost" onClick={onBack}>
          Kembali
        </Button>
        {/* Langkah ini opsional, jadi cukup satu tombol lanjut: kosongkan saja
            bila tidak ada bahan tambahan. Tombol "Lewati" terpisah dihapus
            karena perilakunya identik dan hanya menimbulkan keraguan. */}
        <Button icon={ArrowRight} iconPosition="right" onClick={handleContinue}>
          Lanjut
        </Button>
      </StepNav>
    </StepShell>
  );
}
