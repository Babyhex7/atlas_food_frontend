"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/internal/pkg/components/Button";
import { EmptyState } from "@/internal/pkg/components/EmptyState";
import { useAsServedSets } from "../hooks/usePortionQueries";

/** Daftar set foto porsi berbobot gram (brief §4) */
export function AsServedSetList() {
  const router = useRouter();
  const { data, isLoading, error } = useAsServedSets();
  const sets = data ?? [];

  if (isLoading) {
    return <div className="p-6 px-8 text-sm text-text-muted">Memuat set foto porsi…</div>;
  }

  if (error) {
    return (
      <div className="p-6 px-8">
        <div className="alert alert-danger">
          <span className="text-sm">
            {error instanceof Error ? error.message : "Gagal memuat set foto porsi"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Foto Porsi</h1>
          <p className="text-sm text-text-muted m-0">{sets.length} set ditemukan</p>
        </div>
        <Button onClick={() => router.push("/admin/as-served-sets/new")}>
          <Plus size={15} /> Tambah Set
        </Button>
      </div>

      {sets.length === 0 ? (
        <EmptyState
          icon={<Camera size={40} className="text-text-muted" />}
          title="Belum ada set foto porsi"
          description="Set berisi beberapa foto porsi dengan berat gram, dipakai responden saat memilih porsi."
          action={
            <Button onClick={() => router.push("/admin/as-served-sets/new")}>
              <Plus size={14} /> Tambah Set
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {sets.map((set) => (
            <Link
              key={set.id}
              href={`/admin/as-served-sets/${set.id}`}
              className="flex items-center gap-4 py-4 px-5 rounded-xl border-[1.5px] border-border bg-surface no-underline transition-base hover:border-primary-border hover:shadow-sm hover:-translate-y-px"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                <Camera size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary mb-0.5 truncate">
                  {set.name}
                </p>
                <p className="text-xs text-text-muted m-0 font-mono">{set.code}</p>
              </div>
              <ChevronRight size={16} className="text-text-muted shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
