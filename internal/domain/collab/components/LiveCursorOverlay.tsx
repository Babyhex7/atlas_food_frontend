"use client";

type Cursor = {
  userId: string;
  name: string;
  x: number;
  y: number;
  color: string;
  isLeader?: boolean;
};

function inViewport(x: number, y: number) {
  if (typeof window === "undefined") return true;
  return x >= -40 && y >= -40 && x <= window.innerWidth + 40 && y <= window.innerHeight + 40;
}

/** Cursor multiplayer ala Figma — pointer + name chip. */
export function LiveCursorOverlay({ cursors }: { cursors: Cursor[] }) {
  if (cursors.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden>
      {cursors.map((c) => {
        if (!inViewport(c.x, c.y)) return null;
        return (
          <div
            key={c.userId}
            className="absolute transition-[left,top] duration-75 ease-linear will-change-[left,top]"
            style={{
              left: c.x,
              top: c.y,
              transform: "translate(-1px, -1px)",
              zIndex: c.isLeader ? 3 : 1,
            }}
          >
            <svg
              width={c.isLeader ? 20 : 16}
              height={c.isLeader ? 20 : 16}
              viewBox="0 0 16 16"
              fill="none"
              className="drop-shadow-sm"
            >
              <path
                d="M1.5 1.5L14 8.2l-5.2 1.1L6.5 14.5 1.5 1.5Z"
                fill={c.color}
                stroke="#fff"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className="ml-3 -mt-0.5 inline-flex max-w-[140px] items-center truncate rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm font-sans"
              style={{ backgroundColor: c.color }}
            >
              {c.isLeader ? "● " : ""}
              {c.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
