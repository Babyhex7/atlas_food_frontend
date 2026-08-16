"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, Plus, Search, UtensilsCrossed } from "lucide-react";
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

    // Ruas tak dikenal = id. Namanya diambil dari induk supaya breadcrumb tidak
    // memamerkan UUID mentah ke admin.
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

  const crumbs = useMemo(() => buildCrumbs(pathname), [pathname]);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Panel hasil & menu aksi menutup sendiri saat pindah halaman — kalau tidak,
  // keduanya menggantung di atas halaman baru. Disetel saat render (bukan lewat
  // efek) supaya tidak ada satu frame dengan panel yang masih terbuka.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
    setQuickOpen(false);
  }

  const { data, isFetching } = useAdminFoods(
    { search: debounced, limit: 5, page: 1 },
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
      <div className="flex h-16 items-center gap-4 px-6">
        <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
          <ol className="m-0 flex list-none flex-wrap items-center gap-1 p-0 text-sm">
            {crumbs.map((crumb, index) => {
              const last = index === crumbs.length - 1;
              return (
                <li key={crumb.href} className="flex items-center gap-1">
                  {index > 0 ? (
                    <ChevronRight size={13} aria-hidden className="text-text-muted" />
                  ) : null}
                  {last ? (
                    <span aria-current="page" className="font-semibold text-text-primary">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link href={crumb.href} className="text-text-muted no-underline hover:text-primary">
                      {crumb.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="relative hidden w-full max-w-xs md:block">
          <Search
            size={14}
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 150)}
            onKeyDown={(event) => {
              if (event.key === "Enter") submitSearch();
              if (event.key === "Escape") setOpen(false);
            }}
            placeholder="Cari makanan…"
            aria-label="Cari makanan"
            className="h-9 w-full rounded-full border-[1.5px] border-border bg-surface-alt pl-8 pr-3 font-sans text-sm text-text-primary outline-none transition-base focus:border-primary focus:bg-surface focus:shadow-focus"
          />

          {open && debounced ? (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-lg">
              {isFetching && results.length === 0 ? (
                <p className="m-0 px-3 py-3 text-xs text-text-muted">Mencari…</p>
              ) : results.length === 0 ? (
                <p className="m-0 px-3 py-3 text-xs text-text-muted">
                  Tidak ada makanan cocok “{debounced}”.
                </p>
              ) : (
                <>
                  {results.map((food) => (
                    <Link
                      key={food.id}
                      href={`/admin/foods/${food.id}`}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 no-underline hover:bg-surface-alt"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary-light text-sm">
                        {food.category?.icon || <UtensilsCrossed size={13} className="text-primary" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-text-primary">{food.name}</span>
                        <span className="block truncate font-mono text-[11px] text-text-muted">
                          {food.code}
                        </span>
                      </span>
                    </Link>
                  ))}
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={submitSearch}
                    className="w-full cursor-pointer rounded-lg border-none bg-transparent px-2.5 py-2 text-left font-sans text-xs font-semibold text-primary hover:bg-primary-light"
                  >
                    Lihat semua hasil untuk “{debounced}”
                  </button>
                </>
              )}
            </div>
          ) : null}
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setQuickOpen((prev) => !prev)}
            aria-expanded={quickOpen}
            aria-haspopup="menu"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-primary px-3.5 py-2 font-sans text-sm font-semibold text-white shadow-sm transition-fast hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Plus size={15} aria-hidden />
            <span className="hidden sm:inline">Aksi Cepat</span>
          </button>

          {quickOpen ? (
            <>
              <button
                type="button"
                aria-label="Tutup menu aksi cepat"
                onClick={() => setQuickOpen(false)}
                className="fixed inset-0 z-40 cursor-default border-none bg-transparent"
              />
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+6px)] z-50 w-52 rounded-xl border border-border bg-surface p-1 shadow-lg"
              >
                {QUICK_ACTIONS.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    role="menuitem"
                    className="block rounded-lg px-3 py-2 text-sm text-text-primary no-underline hover:bg-surface-alt"
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
