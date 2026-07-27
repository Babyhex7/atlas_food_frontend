/**
 * Satu sumber kebenaran untuk tampilan mode "Can view".
 *
 * Semua kontrol yang dikunci memakai helper ini supaya pesan, kursor, dan
 * atribut aksesibilitasnya seragam di seluruh aplikasi — bukan disalin-tempel
 * per komponen dan lama-lama jadi tidak konsisten.
 */
export const VIEWER_LOCK_HINT =
  "Mode Can view — Anda hanya bisa menonton dan mengikuti layar rekan.";

/** Props untuk elemen form/button asli (<input>, <button>, <select>). */
export function viewerLockProps(isViewer: boolean) {
  return isViewer
    ? { disabled: true, "aria-disabled": true, title: VIEWER_LOCK_HINT }
    : {};
}

/**
 * Props untuk elemen yang tidak punya atribut `disabled` (mis. <a> / <Link>).
 * aria-disabled + tabIndex -1 menjaga elemen tetap terbaca screen reader
 * sebagai nonaktif, sementara pointer-events mencegah klik mouse.
 */
export function viewerLockLinkProps(isViewer: boolean) {
  return isViewer
    ? {
        "aria-disabled": true as const,
        tabIndex: -1,
        title: VIEWER_LOCK_HINT,
        onClick: (e: { preventDefault: () => void }) => e.preventDefault(),
      }
    : {};
}

/** Kelas visual untuk kontrol yang sedang terkunci. */
export const VIEWER_LOCK_CLASS = "opacity-50 pointer-events-none select-none";
