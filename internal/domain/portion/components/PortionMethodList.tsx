"use client";

import { useState } from "react";
import { Scale, Trash2 } from "lucide-react";
import { EmptyState } from "@/internal/pkg/components/EmptyState";
import { useAdminFoods } from "@/internal/domain/food/hooks/useFoodQueries";
import { useDeletePortionMethod, useFoodPortionMethods } from "../hooks/usePortionQueries";
import { PORTION_METHOD_TYPES } from "../constants/portionMethodTypes";

/**
 * Metode porsi selalu melekat pada satu makanan, bukan berdiri sendiri —
 * jadi halaman ini dimulai dengan memilih makanan, lalu menampilkan
 * metode milik makanan tersebut.
 */
export function PortionMethodList() {
  const { data: foodData, isLoading: loadingFoods } = useAdminFoods({ limit: 100 });
  const foods = foodData?.foods ?? [];

  const [foodId, setFoodId] = useState("");
  const { data: methods, isLoading } = useFoodPortionMethods(foodId || undefined);
  const remove = useDeletePortionMethod();

  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: number, label: string) {
    if (!window.confirm(`Hapus metode porsi "${label}"?`)) return;

    setError(null);

    try {
      await remove.mutateAsync(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus metode porsi");
    }
  }

  const list = methods ?? [];

  return (
    <div className="p-6 px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Metode Porsi</h1>
        <p className="text-sm text-text-muted m-0">
          Cara responden memperkirakan porsi untuk setiap makanan
        </p>
      </div>

      <div className="flex flex-col w-full gap-2 max-w-[420px] mb-6">
        <label htmlFor="food-picker" className="form-label text-sm font-medium text-text-secondary">
          Pilih makanan
        </label>
        <select
          id="food-picker"
          value={foodId}
          onChange={(event) => setFoodId(event.target.value)}
          disabled={loadingFoods}
          className="w-full py-2.5 px-3 text-sm text-text-primary bg-surface border-[1.5px] border-border rounded-md outline-none font-sans transition-base focus:border-primary focus:shadow-focus"
        >
          <option value="">{loadingFoods ? "Memuat makanan…" : "— pilih makanan —"}</option>
          {foods.map((food) => (
            <option key={food.id} value={food.id}>
              {food.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="alert alert-danger mb-4">
          <span className="text-sm">{error}</span>
        </div>
      )}

      {!foodId && (
        <EmptyState
          icon={<Scale size={40} className="text-text-muted" />}
          title="Pilih makanan dulu"
          description="Metode porsi ditentukan per makanan, jadi pilih salah satu untuk melihat dan mengelolanya."
        />
      )}

      {foodId && isLoading && <p className="text-sm text-text-muted">Memuat metode porsi…</p>}

      {foodId && !isLoading && list.length === 0 && (
        <EmptyState
          icon={<Scale size={40} className="text-text-muted" />}
          title="Belum ada metode porsi"
          description="Makanan ini belum punya cara estimasi porsi, sehingga responden hanya bisa mengisi berat manual."
        />
      )}

      {foodId && list.length > 0 && (
        <div className="flex flex-col gap-2">
          {list.map((method) => (
            <div
              key={method.id}
              className="flex items-center gap-4 py-4 px-5 rounded-xl border-[1.5px] border-border bg-surface"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                <Scale size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary mb-0.5 truncate">
                  {method.label}
                </p>
                <p className="text-xs text-text-muted m-0">
                  {PORTION_METHOD_TYPES.find((type) => type.value === method.method_type)?.label ??
                    method.method_type}
                  {method.description ? ` · ${method.description}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(method.id, method.label)}
                disabled={remove.isPending}
                className="btn btn-ghost btn-xs btn-icon shrink-0"
                title="Hapus metode"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
