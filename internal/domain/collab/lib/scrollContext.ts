/**
 * Utilitas untuk membaca dan menyinkronkan konteks scroll serta dimensi konten
 * pada kanvas kolaboratif (Live Canvas Annotation) dan live cursor.
 */

export interface ScrollContext {
  containerRect: { top: number; left: number; width: number; height: number };
  scrollLeft: number;
  scrollTop: number;
  contentWidth: number;
  contentHeight: number;
  scrollEl: HTMLElement | Window;
}

/**
 * Mengambil konteks scroll dan batas container aktif secara dinamis.
 * Mendukung baik kontainer lokal (misal: bingkai foto piring),
 * kontainer scrollable wizard (<main className="overflow-y-auto">),
 * maupun scroll halaman utama (window).
 */
export function getScrollContext(container: HTMLElement | null, isGlobal: boolean): ScrollContext {
  if (typeof window === "undefined" || !container) {
    return {
      containerRect: { top: 0, left: 0, width: 800, height: 600 },
      scrollLeft: 0,
      scrollTop: 0,
      contentWidth: 800,
      contentHeight: 600,
      scrollEl: typeof window !== "undefined" ? window : ({} as any),
    };
  }

  // Jika bukan mode global (misal kanvas ditempelkan langsung di dalam bingkai foto piring)
  if (!isGlobal) {
    const rect = container.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    return {
      containerRect: {
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        width: w,
        height: h,
      },
      scrollLeft: 0,
      scrollTop: 0,
      contentWidth: w,
      contentHeight: h,
      scrollEl: container,
    };
  }

  // 1. Cek scroll dokumen / window saat ini
  const winScrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
  const winScrollX = window.scrollX || document.documentElement.scrollLeft || document.body.scrollLeft || 0;

  // 2. Cek apakah ada inner scroll container yang sedang bergulir aktif
  // (misal <main className="overflow-y-auto"> jika dikunci di dalam h-screen)
  const mainEl = document.querySelector<HTMLElement>("main.overflow-y-auto, main[class*='overflow-y-auto']");
  const isMainActuallyScrolling = Boolean(
    mainEl &&
    mainEl.clientHeight > 0 &&
    mainEl.scrollHeight > mainEl.clientHeight + 10 &&
    (mainEl.scrollTop > 0 || (winScrollY === 0 && window.innerHeight >= document.documentElement.scrollHeight))
  );

  if (isMainActuallyScrolling && mainEl) {
    const rect = mainEl.getBoundingClientRect();
    return {
      containerRect: {
        top: Math.max(0, Math.round(rect.top)),
        left: Math.max(0, Math.round(rect.left)),
        width: Math.max(1, Math.round(rect.width)),
        height: Math.max(1, Math.round(rect.height)),
      },
      scrollLeft: mainEl.scrollLeft,
      scrollTop: mainEl.scrollTop,
      contentWidth: Math.max(rect.width, mainEl.scrollWidth),
      contentHeight: Math.max(rect.height, mainEl.scrollHeight),
      scrollEl: mainEl,
    };
  }

  // 3. Fallback standar (seluruh halaman web / window):
  // Menentukan batas kanvas di bawah header aktif
  const headerEl = document.querySelector("header");
  let top = 56;
  if (headerEl) {
    const hRect = headerEl.getBoundingClientRect();
    if (hRect.top <= 0 && hRect.bottom > 0) {
      top = Math.max(0, Math.round(hRect.bottom));
    }
  }

  const footerEl = document.querySelector("footer");
  let bottomPadding = 0;
  if (footerEl) {
    const fRect = footerEl.getBoundingClientRect();
    if (fRect.top < window.innerHeight) {
      bottomPadding = Math.max(0, Math.round(window.innerHeight - fRect.top));
    }
  }

  const w = window.innerWidth;
  const h = Math.max(100, window.innerHeight - top - bottomPadding);
  const docScrollWidth = Math.max(w, document.documentElement.scrollWidth, document.body.scrollWidth);
  const docScrollHeight = Math.max(h, document.documentElement.scrollHeight, document.body.scrollHeight);

  return {
    containerRect: {
      top,
      left: 0,
      width: w,
      height: h,
    },
    scrollLeft: winScrollX,
    scrollTop: winScrollY,
    contentWidth: docScrollWidth,
    contentHeight: docScrollHeight,
    scrollEl: window,
  };
}
