import { Button } from "@/internal/pkg/components/Button";
import { Input } from "@/internal/pkg/components/Input";

const SECTION: React.CSSProperties = {
  backgroundColor: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-xl)",
  padding: "var(--space-6)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-5)",
};

export function CategoryForm() {
  return (
    <div style={{ padding: "var(--space-6) var(--space-8)" }}>
      <div style={{ maxWidth: 640 }}>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--color-text-primary)", margin: "0 0 var(--space-8)" }}>
          Tambah Kategori
        </h1>

        <form style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          <div style={SECTION}>
            <h2 style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)", margin: 0 }}>
              Detail Kategori
            </h2>
            <Input id="code" name="code" label="Kode" placeholder="MP" required />
            <Input id="name" name="name" label="Nama Kategori" placeholder="Makanan Pokok" required />
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <label style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-secondary)" }}>
                Ikon (emoji)
              </label>
              <Input id="icon" name="icon" label="" placeholder="🍚" />
              <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                Gunakan emoji sebagai ikon kategori, misal: 🍚 🍗 🥬
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
            <Button type="button" variant="secondary">Batal</Button>
            <Button type="submit">Simpan Kategori</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
