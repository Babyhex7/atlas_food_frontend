import { Button } from "@/internal/pkg/components/Button";
import { Input } from "@/internal/pkg/components/Input";

const SECTION = "bg-surface border border-border rounded-xl p-6 flex flex-col gap-5";

export function CategoryForm() {
  return (
    <div className="p-6 px-8">
      <div className="max-w-[640px]">
        <h1 className="text-2xl font-bold text-text-primary mb-8">
          Tambah Kategori
        </h1>

        <form className="flex flex-col gap-5">
          <div className={SECTION}>
            <h2 className="text-base font-semibold text-text-primary m-0">
              Detail Kategori
            </h2>
            <Input id="code" name="code" label="Kode" placeholder="MP" required />
            <Input id="name" name="name" label="Nama Kategori" placeholder="Makanan Pokok" required />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary">
                Ikon (emoji)
              </label>
              <Input id="icon" name="icon" label="" placeholder="🍚" />
              <span className="text-xs text-text-muted">
                Gunakan emoji sebagai ikon kategori, misal: 🍚 🍗 🥬
              </span>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary">Batal</Button>
            <Button type="submit">Simpan Kategori</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
