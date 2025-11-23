"use client";

import React from "react";
import type { Habit } from "./types";

interface Props {
  habits: Habit[];
  toggleHabit: (id: number) => void;
}

export default function HabitList({ habits, toggleHabit }: Props) {
  return (
    <section className="flex flex-col gap-2 max-w-xl">
      <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
        Habits
      </h2>
      {habits
        .slice()
        .sort((a, b) => a.timeMins - b.timeMins)
        .map((h) => (
          <button
            key={h.id}
            onClick={() => toggleHabit(h.id)}
            className={`flex items-center justify-between px-3 py-2 rounded-full border text-sm ${
              h.completed
                ? "bg-gradient-to-r from-emerald-500 to-lime-400 text-emerald-950 border-transparent"
                : "bg-slate-900/90 text-slate-100 border-slate-700/70"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-300">{h.timeLabel}</span>
              <span>{h.name}</span>
            </div>
            <span className="text-xs opacity-80">{h.completed ? "✔" : "○"}</span>
          </button>
        ))}
    </section>
  );
}
