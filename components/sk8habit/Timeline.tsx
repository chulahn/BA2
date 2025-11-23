"use client";

import React from "react";
import type { Habit, Point } from "./types";

interface Props {
  habits: Habit[];
  pathPoints: Point[];
  skaterPosition: Point | null;
}

export default function Timeline({ habits, pathPoints, skaterPosition }: Props) {
  return (
    <div className="mt-2 w-full max-w-3xl aspect-[3/1] sm:aspect-[16/5] rounded-2xl p-3 bg-slate-950 border border-slate-700/70 bg-[radial-gradient(circle_at_top_left,#22c55e22,transparent_60%),radial-gradient(circle_at_bottom_right,#3b82f622,transparent_60%)]">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* time grid */}
        {[0, 25, 50, 75, 100].map((x) => (
          <g key={x}>
            <line x1={x} y1="5" x2={x} y2="95" stroke="rgba(148,163,184,0.18)" strokeWidth="0.4" />
          </g>
        ))}

        {/* time labels */}
        <text x={0} y={98} fontSize="3" fill="rgba(148,163,184,0.8)">00:00</text>
        <text x={25} y={98} fontSize="3" fill="rgba(148,163,184,0.8)">06:00</text>
        <text x={50} y={98} fontSize="3" fill="rgba(148,163,184,0.8)">12:00</text>
        <text x={75} y={98} fontSize="3" fill="rgba(148,163,184,0.8)">18:00</text>
        <text x={90} y={98} fontSize="3" fill="rgba(148,163,184,0.8)">24:00</text>

        {/* path of completed habits */}
        {pathPoints.length >= 2 && (
          <polyline points={pathPoints.map((p) => p.join(",")).join(" ")} fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* habit nodes */}
        {habits.map((h) => {
          const x = (h.timeMins / (24 * 60)) * 100;
          const y = h.y;
          return <circle key={h.id} cx={x} cy={y} r={h.completed ? 3.5 : 2.5} fill={h.completed ? "#22c55e" : "rgba(148,163,184,0.8)"} />;
        })}

        {/* skater */}
        {skaterPosition && <circle cx={skaterPosition[0]} cy={skaterPosition[1]} r={4} fill="#f97316" />}
      </svg>
    </div>
  );
}