"use client";

// Pixel-art padlock under a spotlight. Click (or press Enter/Space) to
// unlock it. A small cybersecurity-flavoured easter egg; purely for fun.

import { useState } from "react";

// 14×14 body grid: # = body, k = keyhole, s = shade.
const BODY = [
  ".############.",
  "#ssssssssssss#",
  "#s##########s#",
  "#s###kkkk###s#",
  "#s###kkkk###s#",
  "#s####kk####s#",
  "#s####kk####s#",
  "#s####kk####s#",
  "#s##########s#",
  "#ssssssssssss#",
  ".############.",
];

const SHACKLE = [
  "....######....",
  "...##....##...",
  "...#......#...",
  "...#......#...",
  "...#......#...",
  "...#......#...",
];

const U = 6; // pixel size

export function PixelLock() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-pressed={open}
        aria-label={open ? "Lock the padlock" : "Unlock the padlock"}
        className="group relative rounded-2xl p-3"
      >
        <svg width={14 * U} height={19 * U} viewBox={`0 0 ${14 * U} ${19 * U}`} className="bob block" aria-hidden shapeRendering="crispEdges">
          <g
            style={{
              transform: open ? `translate(${U * 2}px, ${-U * 2}px)` : "translate(0, 0)",
              transition: "transform 300ms cubic-bezier(.3,1.6,.5,1)",
            }}
          >
            {SHACKLE.flatMap((row, y) =>
              [...row].map((c, x) =>
                c === "#" ? <rect key={`s${x}-${y}`} x={x * U} y={(y + 2) * U} width={U} height={U} fill="#d6d0f5" /> : null,
              ),
            )}
          </g>
          {BODY.flatMap((row, y) =>
            [...row].map((c, x) => {
              if (c === ".") return null;
              const fill = c === "k" ? "#2b2937" : c === "s" ? "#cfc8f2" : "#f1eeff";
              return <rect key={`b${x}-${y}`} x={x * U} y={(y + 8) * U} width={U} height={U} fill={fill} />;
            }),
          )}
        </svg>
        <span aria-hidden className="mx-auto mt-2 block h-3 w-24 rounded-[50%] bg-black/40 blur-[2px]" />
      </button>
      <p className="mt-6 font-mono text-sm font-bold uppercase tracking-[0.2em] text-accent" aria-live="polite">
        {open ? "access granted" : "access denied"}
      </p>
      <span aria-hidden className="mt-2 h-px w-24 bg-accent/60" />
    </div>
  );
}
