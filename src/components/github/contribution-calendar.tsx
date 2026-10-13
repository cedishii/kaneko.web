"use client";

// Contribution heatmap with a range picker (last 12 months or a single year).
// Hover, or focus the graph and use the arrow keys, to read individual days;
// the selected day is announced to screen readers.

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { ContributionDay } from "@/lib/github-types";

const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;
const LEFT = 30;
const TOP = 18;
const LEVEL_COLORS = ["#24222f", "#3b2a6b", "#5b3fb0", "#8b5cf6", "#c4b5fd"];

const dayFmt = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const monthFmt = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });

const toDate = (iso: string) => new Date(`${iso}T00:00:00Z`);
const describe = (d: ContributionDay) =>
  `${d.count === 0 ? "No" : d.count} contribution${d.count === 1 ? "" : "s"} on ${dayFmt.format(toDate(d.date))}`;

type Range = "last" | number;

function selectDays(all: ContributionDay[], range: Range): ContributionDay[] {
  if (range !== "last") return all.filter((d) => d.date.startsWith(`${range}-`));
  // Last 12 months, ending on the most recent day in the data (not "now", so
  // the server and browser render the same thing).
  const end = all.length ? toDate(all[all.length - 1].date) : new Date(0);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 364);
  const from = start.toISOString().slice(0, 10);
  return all.filter((d) => d.date >= from);
}

export function ContributionCalendar({ days, years }: { days: ContributionDay[]; years: { year: number; total: number }[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState<Range>("last");
  const [active, setActive] = useState<number | null>(null);

  const { cells, weeks, months, stats } = useMemo(() => {
    const sorted = selectDays(days, range);
    const offset = sorted.length ? toDate(sorted[0].date).getUTCDay() : 0;
    const cells = sorted.map((d, i) => {
      const slot = i + offset;
      return { ...d, x: Math.floor(slot / 7), y: slot % 7 };
    });
    const weeks = cells.length ? cells[cells.length - 1].x + 1 : 0;

    const months: { x: number; label: string }[] = [];
    let lastMonth = -1;
    for (const c of cells) {
      const date = toDate(c.date);
      if ((date.getUTCDate() === 1 || (c === cells[0] && date.getUTCDate() < 20)) && date.getUTCMonth() !== lastMonth) {
        const prev = months[months.length - 1];
        if (!prev || c.x - prev.x >= 3) months.push({ x: c.x, label: monthFmt.format(date) });
        lastMonth = date.getUTCMonth();
      }
    }

    let best: ContributionDay | null = null;
    let activeDays = 0;
    let longest = 0;
    let run = 0;
    let total = 0;
    for (const d of sorted) {
      total += d.count;
      if (d.count > 0) {
        activeDays++;
        run++;
        longest = Math.max(longest, run);
        if (!best || d.count > best.count) best = d;
      } else {
        run = 0;
      }
    }
    return { cells, weeks, months, stats: { best, activeDays, longest, total } };
  }, [days, range]);

  // Show the most recent weeks first on narrow screens.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = range === "last" ? el.scrollWidth : 0;
  }, [range]);

  const width = LEFT + Math.max(weeks, 1) * STEP;
  const height = TOP + 7 * STEP;
  const current = active !== null ? cells[active] : null;

  function onKeyDown(e: KeyboardEvent<SVGSVGElement>) {
    const moves: Record<string, number> = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1, Home: -Infinity, End: Infinity };
    if (!(e.key in moves)) return;
    e.preventDefault();
    const from = active ?? cells.length - 1;
    const next = Math.min(cells.length - 1, Math.max(0, from + moves[e.key]));
    setActive(Number.isFinite(next) ? next : 0);
  }

  const rangeLabel = range === "last" ? "in the last 12 months" : `in ${range}`;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          <span className="font-extrabold text-ink">{stats.total.toLocaleString("en-US")}</span> contributions {rangeLabel}
        </p>
        <div className="flex flex-wrap gap-1 rounded-xl border border-line bg-bg-elev/60 p-1" role="group" aria-label="Contribution range">
          {(["last", ...years.map((y) => y.year)] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={range === r}
              onClick={() => {
                setRange(r);
                setActive(null);
              }}
              className={`rounded-lg px-2.5 py-1 font-mono text-xs transition-colors ${
                range === r ? "bg-accent-strong/25 text-accent-soft" : "text-dim hover:text-ink"
              }`}
            >
              {r === "last" ? "12 months" : r}
            </button>
          ))}
        </div>
      </div>

      <div ref={scroller} className="thin-scroll overflow-x-auto pb-2">
        {/* Scales up to fill wide containers and keeps its natural size (scrolling)
            on narrow ones. The top padding is room for the tooltip. */}
        <div className="pt-9" style={{ minWidth: width, maxWidth: width * 1.3 }}>
          <div className="relative">
            <svg
              width="100%"
              viewBox={`0 0 ${width} ${height}`}
              className="block h-auto w-full"
              role="img"
              aria-label={`Contribution graph: ${stats.total} contributions ${rangeLabel}, ${stats.activeDays} active days. Use the arrow keys to read individual days.`}
              tabIndex={0}
              onKeyDown={onKeyDown}
              onFocus={() => setActive((a) => a ?? cells.length - 1)}
              onBlur={() => setActive(null)}
              onMouseLeave={() => setActive(null)}
            >
              {months.map((m) => (
                <text key={`${m.x}-${m.label}`} x={LEFT + m.x * STEP} y={11} className="fill-dim text-[10px] font-semibold">
                  {m.label}
                </text>
              ))}
              {(
                [
                  [1, "Mon"],
                  [3, "Wed"],
                  [5, "Fri"],
                ] as const
              ).map(([row, label]) => (
                <text key={label} x={0} y={TOP + row * STEP + 9} className="fill-dim text-[10px] font-semibold">
                  {label}
                </text>
              ))}
              {cells.map((c, i) => (
                <rect
                  key={c.date}
                  x={LEFT + c.x * STEP}
                  y={TOP + c.y * STEP}
                  width={CELL}
                  height={CELL}
                  rx={2.5}
                  fill={LEVEL_COLORS[Math.min(4, Math.max(0, c.level))]}
                  stroke={active === i ? "#f5f4fa" : "transparent"}
                  strokeWidth={1.5}
                  onMouseEnter={() => setActive(i)}
                >
                  <title>{describe(c)}</title>
                </rect>
              ))}
            </svg>

            {current ? (
              <div
                aria-hidden
                className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-line-strong bg-bg px-2.5 py-1.5 text-xs font-semibold text-ink shadow-lg"
                style={{
                  left: `${Math.min(Math.max(((LEFT + current.x * STEP + CELL / 2) / width) * 100, 16), 84)}%`,
                  top: `${((TOP + current.y * STEP) / height) * 100}%`,
                  marginTop: -6,
                }}
              >
                {describe(current)}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {current ? describe(current) : ""}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-dim" aria-hidden>
          Less
          {LEVEL_COLORS.map((c) => (
            <span key={c} className="h-[11px] w-[11px] rounded-[3px]" style={{ background: c }} />
          ))}
          More
        </div>
        <dl className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-dim">
          <div className="flex gap-1.5">
            <dt>active days</dt>
            <dd className="text-ink">{stats.activeDays}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt>longest streak</dt>
            <dd className="text-ink">{stats.longest}d</dd>
          </div>
          {stats.best ? (
            <div className="flex gap-1.5">
              <dt>busiest</dt>
              <dd className="text-ink">
                {stats.best.count} on {dayFmt.format(toDate(stats.best.date))}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
    </div>
  );
}
