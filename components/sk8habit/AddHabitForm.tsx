"use client";

import React from "react";

interface Props {
  activeDayId?: string | null;
  newName: string;
  setNewName: (s: string) => void;
  newTime: string;
  setNewTime: (s: string) => void;
  formError: string;
  handleAddHabit: (e: React.FormEvent) => void;
}

export default function AddHabitForm({
  activeDayId,
  newName,
  setNewName,
  newTime,
  setNewTime,
  formError,
  handleAddHabit,
}: Props) {
  return (
    <section className="max-w-xl space-y-2">
      <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
        Add a habit for {activeDayId ?? "…"}
      </h2>
      <form
        onSubmit={handleAddHabit}
        className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end"
      >
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-xs text-slate-400">Habit name (max 50 chars)</label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={50}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
            placeholder="Skate warmup, journal, stretch..."
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Time (blank = now)</label>
          <input
            type="time"
            value={newTime}
            placeholder="09:00"
            onChange={(e) => setNewTime(e.target.value)}
            className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
          />
        </div>
        <button
          type="submit"
          className="whitespace-nowrap rounded-lg bg-gradient-to-r from-emerald-500 to-lime-400 text-emerald-950 font-semibold text-sm px-4 py-2 mt-1 sm:mt-0"
        >
          + Add
        </button>
      </form>
      {formError && <p className="text-xs text-red-400 mt-1">{formError}</p>}
      <p className="text-xs text-slate-500">
        Only letters, numbers, spaces, and simple punctuation are allowed.
      </p>
    </section>
  );
}
