"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Clock,
  ArrowRight,
  ExternalLink,
  Flame,
  Scale,
  X,
  Search,
  Plus,
} from "lucide-react";
import { Button } from "@/internal/pkg/components/Button";
import { PageHeader } from "@/internal/pkg/components/PageHeader";
import { EmptyState } from "@/internal/pkg/components/EmptyState";
import {
  fetchMissingFoods,
  generateFoodAI,
  publishFoodAI,
  type MissingFoodSummary,
  type GenerateFoodAIResponse,
  type GeneratedPortionView,
} from "@/internal/domain/ai/services/aiGeneratorService";

export default function AdminMissingFoodsPage() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<MissingFoodSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCatalog, setFilterCatalog] = useState<"all" | "missing" | "in_catalog">("all");

  // State Modal AI Studio
  const [selectedFood, setSelectedFood] = useState<MissingFoodSummary | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCustomInputModalOpen, setIsCustomInputModalOpen] = useState(false);
  const [customFoodName, setCustomFoodName] = useState("");
  const [customDescription, setCustomDescription] = useState("");

  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [aiDraft, setAiDraft] = useState<GenerateFoodAIResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchMissingFoods();
      setItems(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memuat data missing foods");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Jika datang dari query parameter ?mode=generate
    const mode = searchParams.get("mode");
    const nameParam = searchParams.get("name");
    if (mode === "generate") {
      if (nameParam) {
        setCustomFoodName(nameParam);
      }
      setIsCustomInputModalOpen(true);
    }
  }, [searchParams]);

  // Filter items
  const filteredItems = items.filter((it) => {
    const matchSearch =
      it.name.toLowerCase().includes(search.toLowerCase()) ||
      (it.description && it.description.toLowerCase().includes(search.toLowerCase()));

    if (filterCatalog === "missing") return matchSearch && !it.is_in_catalog;
    if (filterCatalog === "in_catalog") return matchSearch && it.is_in_catalog;
    return matchSearch;
  });

  // Handle open generator modal for existing missing food
  const handleOpenGenerator = async (item: MissingFoodSummary) => {
    setSelectedFood(item);
    setIsModalOpen(true);
    setGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setAiDraft(null);

    try {
      const res = await generateFoodAI({
        food_name: item.name,
        description: item.description,
      });
      setAiDraft(res);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal melakukan generate dengan AI");
    } finally {
      setGenerating(false);
    }
  };

  // Handle trigger custom generation
  const handleTriggerCustomGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFoodName.trim()) return;

    setIsCustomInputModalOpen(false);
    setSelectedFood({
      name: customFoodName.trim(),
      description: customDescription.trim(),
      report_count: 1,
      last_reported_at: new Date().toISOString(),
      is_in_catalog: false,
    });
    setIsModalOpen(true);
    setGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setAiDraft(null);

    try {
      const res = await generateFoodAI({
        food_name: customFoodName.trim(),
        description: customDescription.trim(),
      });
      setAiDraft(res);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal melakukan generate dengan AI");
    } finally {
      setGenerating(false);
    }
  };

  // Handle portion weight / desc change in modal
  const handlePortionChange = (index: number, field: keyof GeneratedPortionView, val: any) => {
    if (!aiDraft) return;
    const nextPortions = [...aiDraft.portions];
    nextPortions[index] = {
      ...nextPortions[index],
      [field]: val,
    };
    setAiDraft({
      ...aiDraft,
      portions: nextPortions,
    });
  };

  // Handle publish approved food
  const handlePublish = async () => {
    if (!aiDraft) return;
    setPublishing(true);
    setErrorMsg(null);
    try {
      const res = await publishFoodAI({
        food_name: aiDraft.food_name,
        local_name: aiDraft.local_name,
        description: aiDraft.description,
        category_id: aiDraft.category_id,
        photo_type: aiDraft.photo_type || "series",
        calories_per_100g: Number(aiDraft.calories_per_100g),
        protein_per_100g: Number(aiDraft.protein_per_100g),
        fat_per_100g: Number(aiDraft.fat_per_100g),
        carbs_per_100g: Number(aiDraft.carbs_per_100g),
        portions: aiDraft.portions,
      });

      setSuccessMsg(res.message);
      // Refresh data
      loadData();
      setTimeout(() => {
        setIsModalOpen(false);
        setAiDraft(null);
        setSelectedFood(null);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal mempublikasikan makanan ke database");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Missing Foods & AI Studio"
        description="Daftar makanan yang dilaporkan responden namun belum terdaftar di basis data. Buat foto porsi standar dan estimasi nilai gizi secara otomatis menggunakan Gemini & Imagen 3."
        action={
          <Button onClick={() => setIsCustomInputModalOpen(true)}>
            <Sparkles className="h-4 w-4 mr-1.5" /> Buat Makanan Baru (AI)
          </Button>
        }
      />

      {/* Toolbar Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari makanan yang dilaporkan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-surface pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterCatalog}
            onChange={(e: any) => setFilterCatalog(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Semua Laporan</option>
            <option value="missing">Perlu Dibuat (Belum di Katalog)</option>
            <option value="in_catalog">Sudah di Katalog</option>
          </select>

          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-surface">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="Tidak ada laporan missing food"
          description="Belum ada responden yang melaporkan makanan di luar katalog atau tidak ada yang sesuai pencarian."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Nama Makanan Dilaporkan</th>
                <th className="px-4 py-3">Frekuensi Laporan</th>
                <th className="px-4 py-3">Terakhir Dilaporkan</th>
                <th className="px-4 py-3">Status Katalog</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        "{item.description}"
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {item.report_count}x dilaporkan
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(item.last_reported_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {item.is_in_catalog ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Sudah di Katalog
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Belum Ada
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {item.is_in_catalog ? (
                      <div className="flex items-center justify-end gap-2">
                        {item.catalog_food_id && (
                          <Link
                            href={`/admin/foods/${item.catalog_food_id}`}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            Buka di Katalog
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenGenerator(item)}
                          className="text-xs"
                        >
                          <Sparkles className="h-3.5 w-3.5 mr-1 text-primary" />
                          Regenerate
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleOpenGenerator(item)}
                        className="gap-1.5"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Generate AI
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Input Custom Food AI */}
      {isCustomInputModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-xl border border-border bg-surface shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Generate Makanan Baru (AI)</h3>
                  <p className="text-xs text-muted-foreground">
                    Buat makanan baru lengkap dengan estimasi gizi & 4 foto porsi.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomInputModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleTriggerCustomGenerate} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Nama Makanan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Mis. Soto Betawi, Nasi Ulam, Es Cendol..."
                  value={customFoodName}
                  onChange={(e) => setCustomFoodName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Deskripsi / Keterangan Bahan (Opsional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Mis. Daging sapi dengan kuah santan dan susu, disajikan dengan kentang dan emping..."
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCustomInputModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" size="sm" className="gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  Mulai Generate Studio
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal / Dialog AI Studio Generator */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl border border-border bg-surface shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    AI Food Studio · {selectedFood?.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Estimasi gizi TKPI & generator 4 foto porsi standar piring 23cm
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {errorMsg && (
                <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-600">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {successMsg}
                </div>
              )}

              {generating ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">
                      Menganalisis Komposisi Gizi & Merender Porsi...
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                      Gemini sedang menghitung kalori, protein, lemak, dan menyusun porsi piring 23cm sesuai standar buku foto makanan.
                    </p>
                  </div>
                </div>
              ) : aiDraft ? (
                <div className="space-y-6">
                  {/* Bagian 1: Identitas Makanan */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-lg border border-border p-4 bg-muted/20">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Nama Baku</label>
                      <input
                        type="text"
                        value={aiDraft.food_name}
                        onChange={(e) => setAiDraft({ ...aiDraft, food_name: e.target.value })}
                        className="w-full mt-1 rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Nama Daerah / Populer</label>
                      <input
                        type="text"
                        value={aiDraft.local_name}
                        onChange={(e) => setAiDraft({ ...aiDraft, local_name: e.target.value })}
                        className="w-full mt-1 rounded-md border border-border bg-surface px-3 py-1.5 text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-muted-foreground">Deskripsi / Komposisi</label>
                      <textarea
                        rows={2}
                        value={aiDraft.description}
                        onChange={(e) => setAiDraft({ ...aiDraft, description: e.target.value })}
                        className="w-full mt-1 rounded-md border border-border bg-surface px-3 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Kategori Makanan</label>
                      <input
                        type="text"
                        value={aiDraft.category_name}
                        disabled
                        className="w-full mt-1 rounded-md border border-border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Tipe Foto Porsi ({aiDraft.photo_type === "range" ? "Range (Ukuran S/M/L)" : aiDraft.photo_type === "guide" ? "Guide (Ragam Potongan)" : "Series (Porsi Bertingkat)"})
                      </label>
                      <select
                        value={aiDraft.photo_type || "series"}
                        onChange={(e) =>
                          setAiDraft({ ...aiDraft, photo_type: e.target.value as any })
                        }
                        className="w-full mt-1 rounded-md border border-primary/40 bg-surface px-3 py-1.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="series">Series — Porsi bertingkat (A, B, C, D)</option>
                        <option value="range">Range — Rentang ukuran fisik satuan (S, M, L)</option>
                        <option value="guide">Guide — Ragam bentuk potongan / variasi</option>
                      </select>
                    </div>
                  </div>

                  {/* Bagian 2: Estimasi Gizi per 100g */}
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <h4 className="text-sm font-semibold text-foreground">
                        Estimasi Kandungan Gizi per 100g (Standar TKPI Kemenkes)
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-md bg-muted/40 p-2.5">
                        <span className="text-xs text-muted-foreground">Energi</span>
                        <div className="flex items-center gap-1 mt-1">
                          <input
                            type="number"
                            step="0.1"
                            value={aiDraft.calories_per_100g}
                            onChange={(e) =>
                              setAiDraft({ ...aiDraft, calories_per_100g: parseFloat(e.target.value) || 0 })
                            }
                            className="w-full bg-surface border border-border rounded px-2 py-1 text-sm font-bold"
                          />
                          <span className="text-xs text-muted-foreground">kcal</span>
                        </div>
                      </div>

                      <div className="rounded-md bg-muted/40 p-2.5">
                        <span className="text-xs text-muted-foreground">Protein</span>
                        <div className="flex items-center gap-1 mt-1">
                          <input
                            type="number"
                            step="0.1"
                            value={aiDraft.protein_per_100g}
                            onChange={(e) =>
                              setAiDraft({ ...aiDraft, protein_per_100g: parseFloat(e.target.value) || 0 })
                            }
                            className="w-full bg-surface border border-border rounded px-2 py-1 text-sm font-bold"
                          />
                          <span className="text-xs text-muted-foreground">g</span>
                        </div>
                      </div>

                      <div className="rounded-md bg-muted/40 p-2.5">
                        <span className="text-xs text-muted-foreground">Lemak</span>
                        <div className="flex items-center gap-1 mt-1">
                          <input
                            type="number"
                            step="0.1"
                            value={aiDraft.fat_per_100g}
                            onChange={(e) =>
                              setAiDraft({ ...aiDraft, fat_per_100g: parseFloat(e.target.value) || 0 })
                            }
                            className="w-full bg-surface border border-border rounded px-2 py-1 text-sm font-bold"
                          />
                          <span className="text-xs text-muted-foreground">g</span>
                        </div>
                      </div>

                      <div className="rounded-md bg-muted/40 p-2.5">
                        <span className="text-xs text-muted-foreground">Karbohidrat</span>
                        <div className="flex items-center gap-1 mt-1">
                          <input
                            type="number"
                            step="0.1"
                            value={aiDraft.carbs_per_100g}
                            onChange={(e) =>
                              setAiDraft({ ...aiDraft, carbs_per_100g: parseFloat(e.target.value) || 0 })
                            }
                            className="w-full bg-surface border border-border rounded px-2 py-1 text-sm font-bold"
                          />
                          <span className="text-xs text-muted-foreground">g</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bagian 3: 4 Porsi Visual (Series A, B, C, D) */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Scale className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-semibold text-foreground">
                          Foto Panduan Porsi (Series A, B, C, D)
                        </h4>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Piring keramik 23cm · Sudut 45° · Sendok Garpu Skala
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {aiDraft.portions.map((p, pIdx) => (
                        <div
                          key={pIdx}
                          className="flex flex-col rounded-lg border border-border bg-surface overflow-hidden shadow-sm"
                        >
                          {/* Image preview */}
                          <div className="relative aspect-square w-full bg-muted/30 border-b border-border">
                            {p.image_url ? (
                              <img
                                src={p.image_url}
                                alt={`Porsi ${p.code}`}
                                className="h-full w-full object-contain p-2"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                                Render placeholder
                              </div>
                            )}
                            <span className="absolute top-2 left-2 rounded bg-foreground/80 px-2 py-0.5 text-xs font-bold text-background backdrop-blur">
                              Porsi {p.code}
                            </span>
                          </div>

                          {/* Portion inputs */}
                          <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-foreground">{p.label}</span>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={p.weight_gram}
                                    onChange={(e) =>
                                      handlePortionChange(pIdx, "weight_gram", parseFloat(e.target.value) || 0)
                                    }
                                    className="w-16 rounded border border-border bg-surface px-1.5 py-0.5 text-right text-xs font-bold"
                                  />
                                  <span className="text-xs text-muted-foreground">g</span>
                                </div>
                              </div>

                              <input
                                type="text"
                                value={p.description}
                                onChange={(e) => handlePortionChange(pIdx, "description", e.target.value)}
                                className="mt-2 w-full rounded border border-border bg-surface px-2 py-1 text-xs text-muted-foreground"
                                placeholder="Deskripsi porsi..."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-border px-6 py-4 bg-muted/10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                disabled={publishing}
              >
                Batal
              </Button>

              <div className="flex items-center gap-2">
                {selectedFood && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenGenerator(selectedFood)}
                    disabled={generating || publishing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${generating ? "animate-spin" : ""}`} />
                    Regenerate
                  </Button>
                )}

                <Button
                  size="sm"
                  onClick={handlePublish}
                  disabled={!aiDraft || generating || publishing}
                  className="gap-1.5"
                >
                  {publishing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Mempublikasikan...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Setujui & Publikasikan ke Katalog
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
