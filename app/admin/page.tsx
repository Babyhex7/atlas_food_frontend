"use client";

import Link from "next/link";
import {
  ClipboardList,
  FileWarning,
  FolderOpen,
  TrendingUp,
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
import { cn } from "@/internal/lib/cn";

// ─── KPI card ────────────────────────────────────────────────────────────────

type KpiCardProps = {
  label: string;
  value: number | null;
  meta?: string;
  trend?: string;
  href: string;
  loading: boolean;
};

function KpiCard({ label, value, meta, trend, href, loading }: KpiCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 no-underline transition-base hover:border-border-strong hover:shadow-xs"
    >
      <span className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
        {label}
      </span>
      <span className="text-[28px] font-bold leading-none tabular-nums text-text-primary">
        {loading ? (
          <span className="inline-block h-7 w-20 animate-pulse rounded bg-surface-alt" />
        ) : (
          (value ?? 0).toLocaleString("id-ID")
        )}
      </span>
      {(meta || trend) && (
        <span className="flex items-center gap-1.5 text-xs text-text-muted">
          {trend && (
            <span className="flex items-center gap-0.5 font-semibold text-success">
              <TrendingUp size={11} aria-hidden />
              {trend}
            </span>
          )}
          {meta && <span>{meta}</span>}
        </span>
      )}
    </Link>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
  draft:     "bg-warning-light text-warning border-warning-border",
  published: "bg-success-light text-success border-success-border",
  archived:  "bg-surface-alt text-text-muted border-border",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "rounded border px-1.5 py-px text-[10px] font-semibold uppercase tracking-wider",
        STATUS_STYLE[status] ?? "bg-surface-alt text-text-muted border-border"
      )}
    >
      {ANNOTATION_STATUS_LABEL[status as keyof typeof ANNOTATION_STATUS_LABEL] ?? status}
    </span>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  title,
  count,
  href,
  linkLabel = "Lihat semua",
}: {
  title: string;
  count?: number;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <h2 className="m-0 text-[13px] font-semibold text-text-primary">{title}</h2>
        {count !== undefined && (
          <span className="rounded bg-surface-alt px-1.5 py-px text-[11px] tabular-nums text-text-muted">
            {count}
          </span>
        )}
      </div>
      {href && (
        <Link href={href} className="text-[12px] font-medium text-primary no-underline hover:underline">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 rounded-md px-2 py-2.5">
      <div className="h-9 w-12 animate-pulse rounded bg-surface-alt" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-40 animate-pulse rounded bg-surface-alt" />
        <div className="h-2.5 w-24 animate-pulse rounded bg-surface-alt" />
      </div>
      <div className="h-4 w-12 animate-pulse rounded bg-surface-alt" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const token = getAccessToken() ?? "";

  const surveys    = useQuery({
    queryKey: ["admin-surveys"],
    queryFn:  () => getSurveys(token),
    enabled:  Boolean(token),
  });
  const foods      = useAdminFoods({ page: 1, limit: 1 });
  const categories = useAdminCategories();
  const drafts     = useAnnotationList({ status: "draft", limit: 5, page: 1 });
  const published  = useAnnotationList({ status: "published", limit: 1, page: 1 });

  const draftItems = drafts.data?.items ?? [];
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="m-0 text-[22px] font-semibold tracking-tight text-text-primary">
            Dashboard
          </h1>
          <p className="m-0 mt-0.5 text-sm text-text-muted">{today}</p>
        </div>
        <Link
          href="/admin/foods/new"
          className="rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-white no-underline shadow-xs transition-fast hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          + Tambah makanan
        </Link>
      </div>

      {/* ── KPI summary ──────────────────────────────────────── */}
      <section aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">Ringkasan</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard
            label="Total survey"
            value={surveys.data?.length ?? null}
            meta="Survey aktif"
            href="/admin/surveys"
            loading={surveys.isLoading}
          />
          <KpiCard
            label="Data makanan"
            value={foods.data?.pagination?.total ?? null}
            meta="Entri di database"
            href="/admin/foods"
            loading={foods.isLoading}
          />
          <KpiCard
            label="Kategori"
            value={categories.data?.length ?? null}
            meta="Pengelompokan makanan"
            href="/admin/categories"
            loading={categories.isLoading}
          />
          <KpiCard
            label="Draft anotasi"
            value={drafts.data?.total ?? null}
            meta={`${published.data?.total ?? "–"} sudah dipublikasikan`}
            href="/admin/foods"
            loading={drafts.isLoading}
          />
        </div>
      </section>

      {/* ── Main content row ─────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_288px]">

        {/* Draft anotasi table */}
        <section
          aria-labelledby="drafts-heading"
          className="rounded-lg border border-border bg-surface p-4"
        >
          <SectionHeader
            title="Draft menunggu publikasi"
            count={drafts.data?.total}
            href="/admin/foods"
            linkLabel="Kelola makanan"
          />

          {drafts.isLoading ? (
            <div className="flex flex-col gap-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          ) : draftItems.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <FileWarning size={28} className="text-text-muted/40" aria-hidden />
              <p className="m-0 text-sm text-text-muted">
                Semua anotasi sudah dipublikasikan.
              </p>
            </div>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-px p-0">
              {draftItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/admin/annotations/${item.id}`}
                    className="flex items-center gap-3 rounded-md px-2 py-2.5 no-underline transition-fast hover:bg-surface-alt"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${API_ASSET_ORIGIN}${item.thumbnail_url || item.image_url}`}
                      alt=""
                      className="h-9 w-12 shrink-0 rounded-md border border-border object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-text-primary">
                        {item.title}
                      </span>
                      <span className="block text-[11px] text-text-muted">
                        {item.areas_count} area &middot; diperbarui{" "}
                        {new Date(item.updated_at).toLocaleDateString("id-ID")}
                      </span>
                    </span>
                    <StatusBadge status={item.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Quick actions */}
          <section
            aria-labelledby="quick-actions-heading"
            className="rounded-lg border border-border bg-surface p-4"
          >
            <h2
              id="quick-actions-heading"
              className="m-0 mb-3 text-[13px] font-semibold text-text-primary"
            >
              Aksi cepat
            </h2>
            <div className="flex flex-col gap-1.5">
              {[
                { href: "/admin/foods/new",      label: "Tambah makanan",  icon: UtensilsCrossed },
                { href: "/admin/surveys/new",     label: "Buat survey",     icon: ClipboardList   },
                { href: "/admin/categories/new",  label: "Tambah kategori", icon: FolderOpen       },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2.5 rounded-md border border-border bg-surface px-3 py-2 text-[13px] font-medium text-text-primary no-underline transition-fast hover:border-border-strong hover:bg-surface-alt"
                >
                  <Icon size={13} aria-hidden className="shrink-0 text-text-muted" />
                  <span className="flex-1">{label}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Status overview */}
          <section
            aria-labelledby="status-heading"
            className="rounded-lg border border-border bg-surface p-4"
          >
            <h2
              id="status-heading"
              className="m-0 mb-3 text-[13px] font-semibold text-text-primary"
            >
              Status anotasi
            </h2>
            <div className="flex flex-col gap-2">
              {[
                {
                  label: "Draft",
                  value: drafts.data?.total ?? 0,
                  loading: drafts.isLoading,
                  style: "bg-warning-light text-warning",
                },
                {
                  label: "Dipublikasikan",
                  value: published.data?.total ?? 0,
                  loading: published.isLoading,
                  style: "bg-success-light text-success",
                },
              ].map(({ label, value, loading, style }) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <span className="text-[13px] text-text-secondary">{label}</span>
                  {loading ? (
                    <span className="h-4 w-10 animate-pulse rounded bg-surface-alt" />
                  ) : (
                    <span className={cn("rounded px-2 py-0.5 text-[12px] font-semibold tabular-nums", style)}>
                      {value.toLocaleString("id-ID")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
