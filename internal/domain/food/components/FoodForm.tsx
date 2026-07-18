"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/internal/pkg/components/Button";
import { Input } from "@/internal/pkg/components/Input";
import { LockIndicator, useCollab } from "@/internal/domain/collab";

const SECTION = "bg-surface border border-border rounded-xl p-6 flex flex-col gap-5";

export function FoodForm() {
  const params = useParams();
  const foodId = (params?.id as string) || "new";
  const isEdit = foodId !== "new" && Boolean(params?.id);
  const { send, isConnected } = useCollab();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [localName, setLocalName] = useState("");
  const [version] = useState(1);

  useEffect(() => {
    if (!isEdit || !isConnected) return;
    send("db_edit_start", {
      entity_type: "food",
      entity_id: foodId,
      version,
    });
    return () => {
      // Only cancel if still connected — avoid noisy errors on unmount/nav
      send("db_edit_cancel", { entity_type: "food", entity_id: foodId });
    };
    // intentionally omit `send` identity thrash; room send is stable enough per connection
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, isConnected, foodId, version]);

  const onFieldChange = (field: string, value: string) => {
    if (!isEdit || !isConnected) return;
    send("db_edit_field", {
      entity_type: "food",
      entity_id: foodId,
      field,
      value,
      version,
    });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isEdit && isConnected) {
      send("db_edit_save", {
        entity_type: "food",
        entity_id: foodId,
        version,
        changes: { code, name, local_name: localName },
      });
    }
  };

  return (
    <div className="p-6 px-8">
      <div className="max-w-[640px]">
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <h1 className="text-2xl font-bold text-text-primary m-0">
            {isEdit ? "Edit Makanan" : "Tambah Makanan"}
          </h1>
          {isEdit ? <LockIndicator entityType="food" entityId={foodId} /> : null}
        </div>

        <form className="flex flex-col gap-5" onSubmit={onSubmit}>
          <div className={SECTION}>
            <h2 className="text-base font-semibold text-text-primary m-0">
              Informasi Dasar
            </h2>
            <Input
              id="code"
              name="code"
              label="Kode"
              placeholder="MP-01"
              required
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                onFieldChange("code", e.target.value);
              }}
            />
            <Input
              id="name"
              name="name"
              label="Nama"
              placeholder="Nasi Putih"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                onFieldChange("name", e.target.value);
              }}
            />
            <Input
              id="local_name"
              name="local_name"
              label="Nama Lokal"
              placeholder="Sego Putih"
              value={localName}
              onChange={(e) => {
                setLocalName(e.target.value);
                onFieldChange("local_name", e.target.value);
              }}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (isEdit && isConnected) {
                  send("db_edit_cancel", { entity_type: "food", entity_id: foodId });
                }
              }}
            >
              Batal
            </Button>
            <Button type="submit">Simpan Makanan</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
