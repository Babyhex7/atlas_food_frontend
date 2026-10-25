"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

interface CounterTickerProps {
  value: string;
  className?: string;
  duration?: number;
}

export function CounterTicker({ value, className = "", duration = 1.5 }: CounterTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  // Ekstrak angka dan teks non-angka (misal: "250+" -> num: 250, suffix: "+")
  const match = value.match(/^(\d+)(.*)$/);
  const targetNumber = match ? parseInt(match[1], 10) : null;
  const suffix = match ? match[2] : "";

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });

  const [displayNumber, setDisplayNumber] = useState(0);

  useEffect(() => {
    if (isInView && targetNumber !== null) {
      motionValue.set(targetNumber);
    }
  }, [isInView, targetNumber, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      setDisplayNumber(Math.round(latest));
    });
  }, [springValue]);

  // Jika formatnya bukan angka murni (misal: "3 Jenis"), handle ekstraksi dengan aman
  if (targetNumber === null) {
    const genericMatch = value.match(/^(\d+)\s*(.*)$/);
    if (genericMatch) {
      const num = parseInt(genericMatch[1], 10);
      const text = genericMatch[2];
      return (
        <span ref={ref} className={className}>
          {isInView ? displayNumber : 0} {text}
        </span>
      );
    }
    return <span ref={ref} className={className}>{value}</span>;
  }

  return (
    <span ref={ref} className={className}>
      {displayNumber}
      {suffix}
    </span>
  );
}
