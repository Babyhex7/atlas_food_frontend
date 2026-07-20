"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { replaceAreas } from "../services/annotationService";
import { useAnnotationEditorStore } from "../store/annotationEditorStore";
import { AUTOSAVE_DEBOUNCE_MS } from "../constants/annotationStatus";
import type { AutosaveState } from "../types/annotation";

type UseAnnotationAutosaveResult = {
  state: AutosaveState;
  lastSavedAt: Date | null;
  error: string | null;
  /** Simpan sekarang juga, lewati debounce — dipakai sebelum publish */
  flush: () => Promise<void>;
};

/**
 * Autosave draft area (brief §8.2).
 *
 * Kontrak: hook ini HANYA mengurus kapan menyimpan dan bagaimana melaporkan
 * statusnya. Ia tidak menyentuh kanvas dan tidak mengubah bentuk polygon.
 */
export function useAnnotationAutosave(imageId: string | undefined): UseAnnotationAutosaveResult {
  const dirty = useAnnotationEditorStore((s) => s.dirty);
  const areas = useAnnotationEditorStore((s) => s.areas);
  const markSaved = useAnnotationEditorStore((s) => s.markSaved);
  const toPayload = useAnnotationEditorStore((s) => s.toPayload);

  // Status request yang sebenarnya. Status "pending" tidak disimpan di sini:
  // ia bisa diturunkan dari `dirty`, dan menyetelnya di dalam effect akan
  // memicu render bertingkat tanpa menambah informasi apa pun.
  const [requestState, setRequestState] = useState<AutosaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Request yang sedang terbang. Disimpan sebagai promise, bukan boolean,
  // supaya flush() bisa benar-benar menunggunya selesai sebelum publish.
  const inFlightRef = useRef<Promise<void> | null>(null);
  // Ada perubahan baru yang masuk saat request terbang — perlu simpan ulang
  const pendingRef = useRef(false);

  const runSave = useCallback(async () => {
    if (!imageId) return;

    setRequestState("saving");
    setError(null);

    try {
      await replaceAreas(imageId, { areas: toPayload() });
      markSaved();
      setLastSavedAt(new Date());
      setRequestState("saved");
    } catch (err) {
      // Status "error" sengaja tidak me-reset dirty: perubahan tetap ada
      // di store dan akan dicoba lagi pada perubahan berikutnya.
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
      setRequestState("error");
      throw err;
    }
  }, [imageId, markSaved, toPayload]);

  /**
   * Simpan dengan penyerialan request. Menunggu request yang sedang berjalan,
   * lalu menyimpan ulang bila ada perubahan yang masuk selama itu — sehingga
   * promise yang dikembalikan selalu mencerminkan state terakhir.
   */
  const save = useCallback(async (): Promise<void> => {
    if (!imageId) return;

    if (inFlightRef.current) {
      pendingRef.current = true;
      // Tunggu request berjalan; kegagalannya sudah dilaporkan di sana
      await inFlightRef.current.catch(() => undefined);
    }

    const task = (async () => {
      do {
        pendingRef.current = false;
        await runSave();
        // Ulangi bila ada perubahan yang datang saat request berlangsung
      } while (pendingRef.current);
    })();

    inFlightRef.current = task;

    try {
      await task;
    } finally {
      if (inFlightRef.current === task) inFlightRef.current = null;
    }
  }, [imageId, runSave]);

  // Jadwalkan simpan setiap kali ada perubahan
  useEffect(() => {
    if (!imageId || !dirty) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    // Kegagalan sudah tercermin di state "error"; ditelan di sini agar tidak
    // jadi unhandled rejection.
    timerRef.current = setTimeout(() => {
      save().catch(() => undefined);
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // `areas` ikut sebagai dependensi supaya timer di-reset pada tiap
    // perubahan, bukan hanya saat dirty berubah false → true.
  }, [imageId, dirty, areas, save]);

  // Peringatkan sebelum tab ditutup dengan perubahan belum tersimpan
  useEffect(() => {
    if (!dirty) return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Browser modern mengabaikan teks kustom, tapi returnValue tetap
      // dibutuhkan agar dialog konfirmasi muncul.
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    await save();
  }, [save]);

  // "pending" = ada perubahan menunggu debounce. Diturunkan saat render,
  // bukan disimpan sebagai state tersendiri.
  //
  // "saving" dan "error" menang atas "pending": keduanya tetap dirty, dan
  // menampilkan "belum tersimpan" saat penyimpanan gagal akan menyembunyikan
  // kegagalan itu dari admin.
  const state: AutosaveState =
    requestState === "saving" || requestState === "error"
      ? requestState
      : dirty
        ? "pending"
        : requestState;

  return { state, lastSavedAt, error, flush };
}
