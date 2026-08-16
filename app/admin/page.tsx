"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  FileWarning,
  FolderOpen,
  Plus,
  UtensilsCrossed,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/internal/domain/auth/hooks/useAuth";
import { getAccessToken } from "@/internal/lib/cookies";
import { getSurveys } from "@/internal/domain/survey/services/surveyService";
import { useAdminFoods } from "@/internal/domain/food/hooks/useFoodQueries";
import { useAdminCategories } from "@/internal/domain/category/hooks/useCategoryQueries";
import { useAnnotationList } from "@/internal/domain/annotation/hooks/useAnnotationQueries";
import { API_ASSET_ORIGIN } from "@/internal/pkg/api";
import { ANNOTATION_STATUS_LABEL } from "@/internal/domain/annotation/constants/annotationStatus";

const QUICK_ACTIONS = [
  { href: "/admin/foods/new", label: "Tambah makanan", icon: UtensilsCrossed },
  { href: "/admin/surveys/new", label: "Buat survey", icon: ClipboardList },
  { href: "/admin/categories/new", label: "Tambah kategori", icon: FolderOpen },
];

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
  loading,
}: {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  href: string;
  loading: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-3 rounded-xl border-[1.5px] border-border bg-surface p-5 no-underline transition-base hover:border-primary-border hover:shadow-sm"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-text-muted">{label}</span>
        <Icon size={16} aria-hidden className="text-primary" />
      </span>
      <span className="text-3xl font-bold leading-none text-text-primary tabular-nums">
        {loading ? "—" : value.toLocaleString("id-ID")}
      </span>
      <span className="text-xs text-text-muted">{hint}</span>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const token = getAccessToken() ?? "";

  const surveys = useQuery({
    queryKey: ["admin-surveys"],
    queryFn: () => getSurveys(token),
    enabled: Boolean(token),
  });

  // limit 1: yang dipakai cuma pagination.total, tidak perlu menarik seluruh baris.
  const foods = useAdminFoods({ page: 1, limit: 1 });
  const categories = useAdminCategories();
  const drafts = useAnnotationList({ status: "draft", limit: 5, page: 1 });

  const draftItems = drafts.data?.items ?? [];

  return (
    <div className="flex flex-col gap-5 p-6 px-8">
      <section className="flex flex-wrap items-center justify-between gap-6 rounded-xl border-[1.5px] border-border bg-surface p-7">
        <div className="max-w-xl">
          <h1 className="m-0 mb-2 text-2xl font-bold tracking-tight text-text-primary">
            Selamat datang, {user?.name ?? "Admin"}
          </h1>
          <p className="m-0 mb-5 text-sm leading-relaxed text-text-muted">
            Kelola data makanan, kategori, survey, dan anotasi Atlas Food dari satu tempat.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/foods"
              className="rounded-lg bg-primary px-4 py-2.5 font-sans text-sm font-semibold text-white no-underline shadow-sm transition-fast hover:opacity-95"
            >
              Kelola makanan
            </Link>
            <Link
              href="/admin/surveys"
              className="rounded-lg border-[1.5px] border-border bg-surface px-4 py-2.5 font-sans text-sm font-semibold text-text-primary no-underline transition-fast hover:border-primary-border hover:text-primary"
            >
              Lihat survey
            </Link>
          </div>
        </div>
        <div
          aria-hidden
          className="hidden h-28 w-28 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary md:flex"
        >
          <UtensilsCrossed size={44} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Survey"
          value={surveys.data?.length ?? 0}
          hint="Total survey yang Anda buat"
          icon={ClipboardList}
          href="/admin/surveys"
          loading={surveys.isLoading}
        />
        <StatCard
          label="Makanan"
          value={foods.data?.pagination?.total ?? 0}
          hint="Entri di database makanan"
          icon={UtensilsCrossed}
          href="/admin/foods"
          loading={foods.isLoading}
        />
        <StatCard
          label="Kategori"
          value={categories.data?.length ?? 0}
          hint="Pengelompokan di Find Food"
          icon={FolderOpen}
          href="/admin/categories"
          loading={categories.isLoading}
        />
        <StatCard
          label="Anotasi draft"
          value={drafts.data?.total ?? 0}
          hint="Belum dipublikasikan ke responden"
          icon={FileWarning}
          href="/admin/foods"
          loading={drafts.isLoading}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border-[1.5px] border-border bg-surface p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="m-0 text-base font-semibold text-text-primary">
              Draft menunggu publikasi
            </h2>
            <span className="text-xs text-text-muted tabular-nums">
              {drafts.data?.total ?? 0} draft
            </span>
          </div>

          {drafts.isLoading ? (
            <p className="m-0 text-sm text-text-muted">Memuat draft…</p>
          ) : draftItems.length === 0 ? (
            <p className="m-0 text-sm text-text-muted">
              Semua anotasi sudah dipublikasikan. Tidak ada yang menunggu review.
            </p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-1 p-0">
              {draftItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/admin/annotations/${item.id}`}
                    className="flex items-center gap-3 rounded-lg px-2 py-2.5 no-underline hover:bg-surface-alt"
                  >
                    {/* next/image dilewati: host uploads tidak terdaftar di
                        next.config remotePatterns. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${API_ASSET_ORIGIN}${item.thumbnail_url || item.image_url}`}
                      alt=""
                      className="h-10 w-14 shrink-0 rounded-md border border-border object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-text-primary">
                        {item.title}
                      </span>
                      <span className="block text-xs text-text-muted">
                        {item.areas_count} area · diperbarui{" "}
                        {new Date(item.updated_at).toLocaleDateString("id-ID")}
                      </span>
                    </span>
                    <span className="shrink-0 rounded bg-warning-light px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning">
                      {ANNOTATION_STATUS_LABEL[item.status]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border-[1.5px] border-border bg-surface p-5">
          <h2 className="m-0 mb-4 text-base font-semibold text-text-primary">Aksi cepat</h2>
          <div className="flex flex-col gap-2">
            {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-lg border-[1.5px] border-border bg-surface px-3 py-2.5 text-sm font-medium text-text-primary no-underline transition-fast hover:border-primary-border hover:text-primary"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-light text-primary">
                  <Icon size={15} aria-hidden />
                </span>
                <span className="flex-1">{label}</span>
                <Plus size={14} aria-hidden className="text-text-muted" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
