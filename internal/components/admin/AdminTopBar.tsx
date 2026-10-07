"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronRight, Plus, Search, UtensilsCrossed } from "lucide-react";
import { useAdminFoods } from "@/internal/domain/food/hooks/useFoodQueries";

/** Label ruas path yang dikenal. Sisanya dianggap id dan diberi label induknya. */
const SEGMENT_LABEL: Record<string, string> = {
  admin: "Dashboard",
  surveys: "Survey",
  foods: "Makanan",
  categories: "Kategori",
  annotations: "Anotasi",
  "as-served-sets": "Foto Porsi",
  "portion-methods": "Metode Porsi",
  submissions: "Submissions",
  images: "Gambar",
  preview: "Pratinjau",
  new: "Baru",
};

const QUICK_ACTIONS = [
  { href: "/admin/foods/new", label: "Tambah makanan" },
  { href: "/admin/surveys/new", label: "Buat survey" },
  { href: "/admin/categories/new", label: "Tambah kategori" },
];

type Crumb = { label: string; href: string };

function buildCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [];
  segments.forEach((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const known = SEGMENT_LABEL[segment];
    if (known) {
      crumbs.push({ label: known, href });
      return;
    }
    const parent = SEGMENT_LABEL[segments[index - 1] ?? ""] ?? "Detail";
    crumbs.push({ label: `Edit ${parent}`, href });
  });
  return crumbs;
}

export function AdminTopBar() {
  const pathname = usePathname();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const crumbs = useMemo(() => buildCrumbs(pathname), [pathname]);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Close panels on navigation
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
    setQuickOpen(false);
  }

  const { data, isFetching } = useAdminFoods(
    { search: debounced, limit: 6, page: 1 },
    { enabled: debounced.length > 0 }
  );
  const results = debounced ? (data?.foods ?? []) : [];

  function submitSearch() {
    if (!debounced) return;
    setOpen(false);
    router.push(`/admin/foods?q=${encodeURIComponent(debounced)}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <div className="flex h-14 items-center gap-3 px-5">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
          <ol className="m-0 flex list-none flex-wrap items-center gap-1 p-0">
            {crumbs.map((crumb, index) => {
              const last = index === crumbs.length - 1;
              return (
                <li key={crumb.href} className="flex items-center gap-1">
                  {index > 0 ? (
                    <ChevronRight size={12} aria-hidden className="text-text-muted" />
                  ) : null}
                  {last ? (
                    <span
                      aria-current="page"
                      className="text-[13px] font-semibold text-text-primary"
                    >
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="text-[13px] text-text-muted no-underline hover:text-text-primary"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Search */}
        <div className="relative hidden w-full max-w-[220px] md:block">
          <Search
            size={13}
            aria-hidden
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitSearch();
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder="Cari makanan…"
            aria-label="Cari makanan"
            className="h-8 w-full rounded-md border border-border bg-surface-alt pl-7 pr-3 font-sans text-[13px] text-text-primary outline-none transition-base focus:border-primary focus:bg-surface focus:shadow-focus"
          />

          {open && debounced ? (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-md">
              {isFetching && results.length === 0 ? (
                <p className="m-0 px-3 py-2 text-xs text-text-muted">Mencari…</p>
              ) : results.length === 0 ? (
                <p className="m-0 px-3 py-2 text-xs text-text-muted">
                  Tidak ada hasil untuk &ldquo;{debounced}&rdquo;.
                </p>
              ) : (
                <>
                  {results.map((food) => (
                    <Link
                      key={food.id}
                      href={`/admin/foods/${food.id}`}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 no-underline hover:bg-surface-alt"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary-light text-xs">
                        {food.category?.icon || (
                          <UtensilsCrossed size={11} className="text-primary" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] text-text-primary">
                          {food.name}
                        </span>
                        <span className="block truncate font-mono text-[10px] text-text-muted">
                          {food.code}
                        </span>
                      </span>
                    </Link>
                  ))}
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={submitSearch}
                    className="w-full cursor-pointer rounded-md border-none bg-transparent px-2 py-1.5 text-left font-sans text-xs font-semibold text-primary hover:bg-primary-light"
                  >
                    Lihat semua hasil
                  </button>
                </>
              )}
            </div>
          ) : null}
        </div>

        {/* Notification placeholder */}
        <button
          type="button"
          aria-label="Notifikasi"
          className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-text-muted transition-fast hover:bg-surface-alt hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
        >
          <Bell size={15} aria-hidden />
        </button>

        {/* Quick action */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setQuickOpen((prev) => !prev)}
            aria-expanded={quickOpen}
            aria-haspopup="menu"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 font-sans text-[13px] font-semibold text-text-primary transition-fast hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
          >
            <Plus size={13} aria-hidden />
            <span className="hidden sm:inline">Baru</span>
          </button>

          {quickOpen ? (
            <>
              <button
                type="button"
                aria-label="Tutup menu"
                onClick={() => setQuickOpen(false)}
                className="fixed inset-0 z-40 cursor-default border-none bg-transparent"
              />
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+6px)] z-50 w-48 rounded-lg border border-border bg-surface p-1 shadow-md"
              >
                {QUICK_ACTIONS.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    role="menuitem"
                    className="block rounded-md px-3 py-2 text-[13px] text-text-primary no-underline hover:bg-surface-alt"
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
