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
    <form onSubmit={handleSearch} style={{ position: "relative", maxWidth: 600, margin: "0 auto", width: "100%" }}>
      {/* Search icon */}
      <div
        style={{
          position: "absolute",
          insetBlock: 0,
          left: "var(--space-5)",
          display: "flex",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <Search size={18} style={{ color: "var(--color-text-muted)" }} />
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari hidangan (nama / kode, misal: Nasi, MP-01…)"
        aria-label="Cari makanan"
        style={{
          display: "block",
          width: "100%",
          paddingLeft: "3rem",
          paddingRight: "7rem",
          paddingTop: "var(--space-4)",
          paddingBottom: "var(--space-4)",
          borderRadius: "var(--radius-xl)",
          border: "1.5px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
          color: "var(--color-text-primary)",
          fontSize: "var(--text-base)",
          boxShadow: "var(--shadow-lg)",
          outline: "none",
          transition: "var(--transition-base)",
          fontFamily: "var(--font-sans)",
          boxSizing: "border-box",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--color-primary)";
          e.currentTarget.style.boxShadow = "var(--shadow-lg), var(--focus-ring)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--color-border)";
          e.currentTarget.style.boxShadow = "var(--shadow-lg)";
        }}
      />

      <button
        type="submit"
        style={{
          position: "absolute",
          insetBlock: "var(--space-2)",
          right: "var(--space-2)",
          paddingLeft: "var(--space-5)",
          paddingRight: "var(--space-5)",
          borderRadius: "var(--radius-lg)",
          backgroundColor: "var(--color-primary)",
          border: "none",
          color: "white",
          fontSize: "var(--text-sm)",
          fontWeight: "var(--weight-semibold)",
          cursor: "pointer",
          transition: "var(--transition-base)",
          fontFamily: "var(--font-sans)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary-hover)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary)"; }}
      >
        Cari
      </button>
    </form>
  );
}
