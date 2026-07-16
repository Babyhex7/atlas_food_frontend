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
    <form onSubmit={handleSearch} className="relative max-w-[600px] mx-auto w-full">
      {/* Search icon */}
      <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
        <Search size={18} className="text-text-muted" />
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari hidangan (nama / kode, misal: Nasi, MP-01…)"
        aria-label="Cari makanan"
        className="shadow-lg-focus-ring block w-full pl-12 pr-28 py-4 rounded-xl border-[1.5px] border-border bg-surface text-text-primary text-base shadow-lg outline-none transition-base font-sans box-border focus:border-primary"
      />

      <button
        type="submit"
        className="absolute inset-y-2 right-2 px-5 rounded-lg bg-primary border-none text-white text-sm font-semibold cursor-pointer transition-base font-sans hover:bg-primary-hover"
      >
        Cari
      </button>
    </form>
  );
}
