"use client";

import React from "react";

interface Props {
  handlePlay: () => void;
  handleReplay: () => void;
  canPlay: boolean;
  canReplay: boolean;
  handleReset: () => void;
}

export default function Controls({ handlePlay, handleReplay, canPlay, canReplay, handleReset }: Props) {
  return (
    <div className="flex items-center gap-2 mt-2 flex-wrap">
      <button
        onClick={handlePlay}
        disabled={!canPlay}
        className={`px-4 py-2 rounded-full font-semibold text-sm ${
          !canPlay
            ? "bg-slate-600/60 text-slate-900 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-900"
        }`}
      >
        ▶ Play Day
      </button>

      <button
        onClick={handleReplay}
        disabled={!canReplay}
        className={`px-4 py-2 rounded-full font-semibold text-sm ${
          !canReplay
            ? "bg-slate-700/60 text-slate-400 cursor-not-allowed"
            : "bg-gradient-to-r from-fuchsia-500 to-pink-400 text-slate-900"
        }`}
      >
        ↺ Replay
      </button>

      <button
        onClick={handleReset}
        className="px-4 py-2 rounded-full font-semibold text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
      >
        🔄 Reset
      </button>

      <span className="text-xs text-slate-400">Each tab is a separate day with its own skate line.</span>
    </div>
  );
}
