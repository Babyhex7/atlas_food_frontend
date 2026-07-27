"use client";

import type { ReactNode } from "react";
import { useCollab } from "./CollabSession";
import { VIEWER_LOCK_HINT } from "../lib/viewerLock";
import { cn } from "@/internal/lib/cn";

type Props = {
  children: ReactNode;
  /** Tampilkan strip penjelasan di atas area terkunci */
  hint?: boolean;
  className?: string;
};

/**
 * Mengunci total area interaktif saat peserta berperan "Can view".
 *
 * Memakai atribut `inert` (React 19), bukan sekadar `pointer-events-none`.
 * pointer-events hanya memblokir mouse — tab/Enter, autofill, dan screen reader
 * masih bisa menembus. `inert` mengeluarkan seluruh subtree dari tab order,
 * event pointer, dan accessibility tree sekaligus, jadi tidak ada celah yang
 * perlu ditambal satu per satu tiap kali ada kontrol baru di dalamnya.
 *
 * Ini lapis UI. Lapisannya masih ada dua lagi: `send()` memblokir event mutasi,
 * dan hub Go menolak pesan dari viewer. Yang di server adalah yang mengikat.
 */
export function ViewerLock({ children, hint = true, className }: Props) {
  const { isViewer } = useCollab();

  if (!isViewer) return <>{children}</>;

  return (
    <>
      {hint ? (
        <p className="m-0 mb-3 rounded-lg border border-warning-border bg-warning-light px-3 py-2 text-xs text-warning">
          {VIEWER_LOCK_HINT}
        </p>
      ) : null}
      <div inert className={cn("opacity-50 select-none", className)}>
        {children}
      </div>
    </>
  );
}
