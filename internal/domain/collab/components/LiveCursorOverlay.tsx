"use client";

type Cursor = {
  userId: string;
  name: string;
  x: number;
  y: number;
  color: string;
};

export function LiveCursorOverlay({ cursors }: { cursors: Cursor[] }) {
  if (cursors.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]" aria-hidden>
      {cursors.map((c) => (
        <div
          key={c.userId}
          className="absolute transition-all duration-75 ease-linear"
          style={{ left: c.x, top: c.y, transform: "translate(-2px, -2px)" }}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill={c.color}>
            <path d="M3 1l15 12-6 2-3 5-3-1 3-6-6-2z" />
          </svg>
          <span
            className="ml-4 -mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium text-white whitespace-nowrap font-sans shadow-sm"
            style={{ backgroundColor: c.color }}
          >
            {c.name}
          </span>
        </div>
      ))}
    </div>
  );
}
