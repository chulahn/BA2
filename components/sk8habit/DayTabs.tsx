"use client";

import React from "react";
import type { DayData } from "./types";

interface Props {
  days: DayData[];
  activeDayId: string;
  setActiveDayId: (id: string) => void;
  todayId: string;
}

export default function DayTabs({
  days,
  activeDayId,
  setActiveDayId,
  todayId,
}: Props) {
  return (
    <section className="flex flex-wrap gap-2 mb-2">
      {days
        .slice()
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((day) => {
          const isActive = day.id === activeDayId;
          const isToday = day.id === todayId;
          return (
            <button
              key={day.id}
              onClick={() => setActiveDayId(day.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                isActive
                  ? "bg-emerald-500 text-emerald-950 border-transparent"
                  : "bg-slate-900 text-slate-200 border-slate-700"
              }`}
            >
              {day.id}
              {isToday && (
                <span className="ml-1 text-[0.6rem] uppercase">(Today)</span>
              )}
            </button>
          );
        })}
    </section>
  );
}
