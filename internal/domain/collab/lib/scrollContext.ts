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

  // 1. Cek apakah ada scrollable <main> container (seperti pada RecallWizard)
  const mainEl = document.querySelector<HTMLElement>("main.overflow-y-auto, main[class*='overflow-y-auto']");
  if (mainEl && mainEl.clientHeight > 0) {
    const rect = mainEl.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    return {
      containerRect: {
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        width: w,
        height: h,
      },
      scrollLeft: mainEl.scrollLeft,
      scrollTop: mainEl.scrollTop,
      contentWidth: Math.max(w, mainEl.scrollWidth),
      contentHeight: Math.max(h, mainEl.scrollHeight),
      scrollEl: mainEl,
    };
  }

  // 2. Fallback: Window / Document scrolling (seperti pada Find Food dan halaman standar)
  const headerEl = document.querySelector("header");
  let top = 56;
  if (headerEl) {
    top = Math.max(0, Math.round(headerEl.getBoundingClientRect().bottom));
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
    scrollLeft: window.scrollX || document.documentElement.scrollLeft || 0,
    scrollTop: window.scrollY || document.documentElement.scrollTop || 0,
    contentWidth: docScrollWidth,
    contentHeight: docScrollHeight,
    scrollEl: window,
  };
}
