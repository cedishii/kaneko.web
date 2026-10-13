// Floating glass triangles behind the content column. Purely decorative;
// positions are fixed (percentages of the page) so server and client match.

import type { CSSProperties } from "react";

type Shape = { top: string; left: string; size: number; r: number; dur: number; dx: number; dy: number; opacity: number };

const SHAPES: Shape[] = [
  { top: "4%", left: "0%", size: 130, r: -18, dur: 16, dx: 12, dy: -16, opacity: 0.9 },
  { top: "5%", left: "94%", size: 110, r: 32, dur: 13, dx: -10, dy: 14, opacity: 0.85 },
  { top: "14%", left: "5%", size: 60, r: 70, dur: 11, dx: 8, dy: 10, opacity: 0.55 },
  { top: "17%", left: "88%", size: 80, r: -40, dur: 15, dx: -12, dy: -10, opacity: 0.6 },
  { top: "26%", left: "0%", size: 110, r: 12, dur: 17, dx: 10, dy: -12, opacity: 0.75 },
  { top: "31%", left: "96%", size: 95, r: -25, dur: 14, dx: -8, dy: 16, opacity: 0.7 },
  { top: "42%", left: "3%", size: 70, r: 50, dur: 12, dx: 12, dy: 8, opacity: 0.5 },
  { top: "47%", left: "92%", size: 120, r: 15, dur: 18, dx: -14, dy: -12, opacity: 0.8 },
  { top: "58%", left: "1%", size: 95, r: -35, dur: 15, dx: 10, dy: 14, opacity: 0.65 },
  { top: "63%", left: "96%", size: 70, r: 60, dur: 13, dx: -10, dy: -8, opacity: 0.55 },
  { top: "74%", left: "4%", size: 120, r: 22, dur: 16, dx: 12, dy: -14, opacity: 0.75 },
  { top: "79%", left: "91%", size: 100, r: -12, dur: 14, dx: -12, dy: 12, opacity: 0.7 },
  { top: "90%", left: "0%", size: 80, r: 40, dur: 12, dx: 8, dy: -10, opacity: 0.55 },
  { top: "93%", left: "95%", size: 110, r: -30, dur: 17, dx: -10, dy: -12, opacity: 0.75 },
];

function Triangle({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b5cf6" stopOpacity="0.32" />
          <stop offset="1" stopColor="#8b5cf6" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <polygon points="10,8 92,52 22,92" fill={`url(#${id})`} stroke="#a78bfa" strokeOpacity="0.55" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-35 xl:opacity-100">
      {SHAPES.map((s, i) => (
        <div
          key={i}
          className="shape"
          style={
            {
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              opacity: s.opacity,
              "--r": `${s.r}deg`,
              "--dur": `${s.dur}s`,
              "--dx": `${s.dx}px`,
              "--dy": `${s.dy}px`,
            } as CSSProperties
          }
        >
          <Triangle id={`tri-${i}`} />
        </div>
      ))}
    </div>
  );
}
