"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import styles from "./LandingPage.module.css";

type LandingImageProps = {
  src: string;
  alt: string;
  sizes: string;
  /** Rasio slot, mis. "600 / 334". Kosongkan bila ukuran diatur lewat className. */
  ratio?: string;
  fit?: "cover" | "contain";
  className?: string;
  /** Class tambahan saat aset belum ada, mis. untuk menyembunyikan placeholder. */
  missingClassName?: string;
  priority?: boolean;
  /** Pengganti saat aset belum ada. Tanpa ini slot menampilkan placeholder. */
  fallback?: ReactNode;
};

// Slot gambar agar layout tidak rusak ketika aset belum ditambahkan.
export function LandingImage({
  src,
  alt,
  sizes,
  ratio,
  fit = "cover",
  className = "",
  missingClassName = "",
  priority = false,
  fallback,
}: LandingImageProps) {
  const [isMissing, setIsMissing] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  // Error yang terjadi sebelum hidrasi tidak memicu onError.
  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth === 0) setIsMissing(true);
  }, []);

  if (isMissing && fallback) return <>{fallback}</>;

  if (isMissing) {
    return (
      <div
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        className={`${styles.media} ${styles.mediaMissing} ${className} ${missingClassName}`}
        style={{ aspectRatio: ratio }}
      />
    );
  }

  return (
    <div className={`${styles.media} ${className}`} style={{ aspectRatio: ratio }}>
      <Image
        ref={imageRef}
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        style={{ objectFit: fit }}
        onError={() => setIsMissing(true)}
      />
    </div>
  );
}
