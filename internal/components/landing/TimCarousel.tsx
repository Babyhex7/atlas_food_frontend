"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { useRef } from "react";
import styles from "./TimPage.module.css";

// Baris kartu yang bisa digeser; tombol panah menggeser sejauh satu kartu.
export function TimCarousel({ title, children }: { title: string; children: ReactNode }) {
  const trackRef = useRef<HTMLUListElement>(null);

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    const card = track?.firstElementChild;
    if (!track || !card) return;

    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gap),
      behavior: "smooth",
    });
  };

  return (
    <>
      <div className={styles.carouselHead}>
        <h3 className={styles.subheading}>{title}</h3>
        <div className={styles.carouselButtons}>
          <button
            type="button"
            className={styles.carouselButton}
            aria-label="Geser ke kiri"
            onClick={() => scrollByCard(-1)}
          >
            <ChevronLeft size={18} aria-hidden />
          </button>
          <button
            type="button"
            className={styles.carouselButton}
            aria-label="Geser ke kanan"
            onClick={() => scrollByCard(1)}
          >
            <ChevronRight size={18} aria-hidden />
          </button>
        </div>
      </div>

      <ul ref={trackRef} className={styles.carouselTrack}>
        {children}
      </ul>
    </>
  );
}
