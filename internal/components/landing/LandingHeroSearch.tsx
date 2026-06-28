"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { loginWithRedirect } from "@/internal/lib/layout";

export function LandingHeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    const target = q.length >= 2 ? `/find-food?q=${encodeURIComponent(q)}` : "/find-food";
    router.push(loginWithRedirect(target));
  };

  return (
    <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto w-full">
      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-muted" />
      </div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari hidangan (nama / kode, misal: Nasi, MP-01...)"
        className="block w-full pl-14 pr-32 py-4 rounded-2xl border border-border bg-white text-foreground text-base shadow-lg shadow-primary/5 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/40 transition-all"
        aria-label="Cari makanan"
      />
      <button
        type="submit"
        className="absolute inset-y-2 right-2 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
      >
        Cari
      </button>
    </form>
  );
}
