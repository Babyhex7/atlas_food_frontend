import { Button } from "@/internal/pkg/components/Button";
import { Input } from "@/internal/pkg/components/Input";

const SECTION = "bg-surface border border-border rounded-xl p-6 flex flex-col gap-5";

export function FoodForm() {
  return (
    <div className="p-6 px-8">
      <div className="max-w-[640px]">
        <h1 className="text-2xl font-bold text-text-primary mb-8">
          Tambah Makanan
        </h1>

        <form className="flex flex-col gap-5">
          <div className={SECTION}>
            <h2 className="text-base font-semibold text-text-primary m-0">
              Informasi Dasar
            </h2>
            <Input id="code"       name="code"       label="Kode"        placeholder="MP-01"       required />
            <Input id="name"       name="name"       label="Nama"        placeholder="Nasi Putih"  required />
            <Input id="local_name" name="local_name" label="Nama Lokal"  placeholder="Sego Putih"           />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary">Batal</Button>
            <Button type="submit">Simpan Makanan</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
