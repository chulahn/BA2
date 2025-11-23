"use client";

import React from "react";

import {
  useState,
  useEffect,
  useMemo,
  useRef,
  FormEvent,
} from "react";

import type { Habit, DayData, Point } from "@/components/sk8habit/types";
import DayTabs from "@/components/sk8habit/DayTabs";
import AddHabitForm from "@/components/sk8habit/AddHabitForm";
import HabitList from "@/components/sk8habit/HabitList";
import Controls from "@/components/sk8habit/Controls";
import Timeline from "@/components/sk8habit/Timeline";
// ---------- helpers ----------

function getTodayId() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentTimeHHMM() {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, "0");
  const m = now.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

// Base template for NEW days (not hardcoded ones)
const baseHabitsTemplate = [
  {
    id: 1,
    name: "Drink water",
    timeLabel: "08:00",
    timeMins: 8 * 60,
  },
  {
    id: 2,
    name: "Read 10 pages",
    timeLabel: "11:30",
    timeMins: 11 * 60 + 30,
  },
  {
    id: 3,
    name: "Stretch 5 min",
    timeLabel: "15:00",
    timeMins: 15 * 60,
  },
  {
    id: 4,
    name: "Code 30 min",
    timeLabel: "21:15",
    timeMins: 21 * 60 + 15,
  },
];

// Hardcoded test data so you can see multiple days/tabs immediately
// Note: y is fixed numbers here, not random
const testDaysSeed: DayData[] = [
  {
    id: "2025-11-14",
    habits: [
      {
        id: 1,
        name: "Morning stretch",
        timeLabel: "08:00",
        timeMins: 8 * 60,
        y: 30,
        completed: true,
      },
      {
        id: 2,
        name: "Read 10 pages",
        timeLabel: "10:15",
        timeMins: 10 * 60 + 15,
        y: 55,
        completed: true,
      },
      {
        id: 3,
        name: "Skate practice",
        timeLabel: "16:30",
        timeMins: 16 * 60 + 30,
        y: 70,
        completed: false,
      },
    ],
  },
  {
    id: "2025-11-15",
    habits: [
      {
        id: 1,
        name: "Hydrate",
        timeLabel: "09:00",
        timeMins: 9 * 60,
        y: 25,
        completed: true,
      },
      {
        id: 2,
        name: "Code 30 min",
        timeLabel: "13:45",
        timeMins: 13 * 60 + 45,
        y: 60,
        completed: true,
      },
      {
        id: 3,
        name: "Evening walk",
        timeLabel: "20:10",
        timeMins: 20 * 60 + 10,
        y: 45,
        completed: true,
      },
    ],
  },
  {
    id: "2025-11-16",
    habits: [
      {
        id: 1,
        name: "Journal",
        timeLabel: "07:30",
        timeMins: 7 * 60 + 30,
        y: 40,
        completed: false,
      },
      {
        id: 2,
        name: "Stretch 5 min",
        timeLabel: "12:00",
        timeMins: 12 * 60,
        y: 65,
        completed: false,
      },
      {
        id: 3,
        name: "Skate clips",
        timeLabel: "18:20",
        timeMins: 18 * 60 + 20,
        y: 35,
        completed: false,
      },
    ],
  },
];

// For brand-new days only: assign random y once per habit
function createDay(id: string): DayData {
  return {
    id,
    habits: baseHabitsTemplate.map((h) => ({
      ...h,
      y: Math.floor(20 + Math.random() * 60), // random ONCE per habit
      completed: false,
    })),
  };
}

function HomeContent() {
  // ---------- days + active day ----------

  const [days, setDays] = useState<DayData[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("skateDays");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as DayData[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch {
          // ignore
        }
      }
    }
    // If nothing saved, start with test data so you can see multiple tabs
    return testDaysSeed;
  });

  const [activeDayId, setActiveDayId] = useState<string>(getTodayId);

  // After days load / change, make sure we have an active day (but don't force switch)
  useEffect(() => {
    const todayId = getTodayId();
    // Only auto-set active day if it no longer exists
    if (!days.some((d) => d.id === activeDayId)) {
      if (days.some((d) => d.id === todayId)) {
        setActiveDayId(todayId);
      } else if (days.length > 0) {
        setActiveDayId(days[0].id);
      }
    }
  }, [days, activeDayId]);

  // Ensure today exists as a day (random y assigned only here for new days)
  useEffect(() => {
    const todayId = getTodayId();
    setDays((prev) => {
      if (prev.some((d) => d.id === todayId)) return prev;
      return [...prev, createDay(todayId)];
    });
  }, []);

  // Persist days whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("skateDays", JSON.stringify(days));
    }
  }, [days]);

  const activeDay =
    days.find((d) => d.id === activeDayId) ?? days[0] ?? null;
  const habits: Habit[] = activeDay?.habits ?? [];

  // ---------- animation + form state ----------

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 → 1 along path

  const [newName, setNewName] = useState("");
  const [newTime, setNewTime] = useState(""); // empty = use current time
  const [formError, setFormError] = useState("");

  // Only letters, numbers, spaces, and simple punctuation
  const nameRegex = /^[a-zA-Z0-9\s.,'!?#-]{1,50}$/;

  // Reset animation when switching day
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
  }, [activeDayId]);

  // ---------- derived path for the active day ----------

  const completedHabits = habits
    .filter((h) => h.completed)
    .sort((a, b) => a.timeMins - b.timeMins);

  const pathPoints = completedHabits.map(
    (h) =>
      [
        (h.timeMins / (24 * 60)) * 100, // time 0–1440 → x 0–100
        h.y,
      ] as [number, number]
  );

  const { segments, totalLength } = useMemo(() => {
    if (pathPoints.length < 2) {
      return {
        segments: [] as {
          from: [number, number];
          to: [number, number];
          length: number;
        }[],
        totalLength: 0,
      };
    }

    const segs: {
      from: [number, number];
      to: [number, number];
      length: number;
    }[] = [];
    let lengthSum = 0;

    for (let i = 0; i < pathPoints.length - 1; i++) {
      const from = pathPoints[i];
      const to = pathPoints[i + 1];
      const dx = to[0] - from[0];
      const dy = to[1] - from[1];
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        segs.push({ from, to, length: len });
        lengthSum += len;
      }
    }

    return { segments: segs, totalLength: lengthSum };
  }, [pathPoints]);

  // ---------- actions ----------

  const toggleHabit = (habitId: number) => {
    if (!activeDay) return;
    setDays((prev) =>
      prev.map((day) => {
        if (day.id !== activeDay.id) return day;
        return {
          ...day,
          habits: day.habits.map((h) =>
            h.id === habitId ? { ...h, completed: !h.completed } : h
          ),
        };
      })
    );
  };

  const handlePlay = () => {
    if (pathPoints.length < 2) return;
    setProgress(0);
    setIsPlaying(true);
  };

  const handleReplay = () => {
    if (pathPoints.length < 2) return;
    setProgress(0);
    setIsPlaying(true);
  };

  const handleAddHabit = (e: FormEvent) => {
    e.preventDefault();
    if (!activeDay) return;

    const trimmed = newName.trim();

    if (!trimmed) {
      setFormError("Habit name can’t be empty.");
      return;
    }
    if (trimmed.length > 50) {
      setFormError("Max 50 characters.");
      return;
    }
    if (!nameRegex.test(trimmed)) {
      setFormError(
        "Use only letters, numbers, spaces, and simple punctuation."
      );
      return;
    }

    // Time logic: if empty, use current time
    let chosenTime = newTime;
    if (!chosenTime || chosenTime.trim() === "") {
      chosenTime = getCurrentTimeHHMM();
    }

    if (!/^\d{2}:\d{2}$/.test(chosenTime)) {
      setFormError("Please choose a valid time.");
      return;
    }

    const [hStr, mStr] = chosenTime.split(":");
    const hours = Number(hStr);
    const mins = Number(mStr);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(mins) ||
      hours < 0 ||
      hours > 23 ||
      mins < 0 ||
      mins > 59
    ) {
      setFormError("Please choose a valid time.");
      return;
    }

    const timeMins = hours * 60 + mins;

    setDays((prev) =>
      prev.map((day) => {
        if (day.id !== activeDay.id) return day;
        const nextId =
          day.habits.length > 0
            ? Math.max(...day.habits.map((h) => h.id)) + 1
            : 1;
        return {
          ...day,
          habits: [
            ...day.habits,
            {
              id: nextId,
              name: trimmed,
              timeLabel: chosenTime,
              timeMins,
              y: Math.floor(20 + Math.random() * 60), // random ONCE for new habit
              completed: false,
            },
          ],
        };
      })
    );

    setNewName("");
    setNewTime("");
    setFormError("");
  };

  const handleReset = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("skateDays");
    }
    const todayId = getTodayId();
    const daysWithToday = testDaysSeed.some((d) => d.id === todayId)
      ? testDaysSeed
      : [...testDaysSeed, createDay(todayId)];
    setDays(daysWithToday);
    setActiveDayId(todayId);
    setNewName("");
    setNewTime("");
    setFormError("");
    setIsPlaying(false);
    setProgress(0);
  };

  // ---------- animation ----------

  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying || totalLength <= 0) return;

    const duration = 4000; // ms for full run
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const nextProgress = Math.min(elapsed / duration, 1);
      setProgress(nextProgress);

      if (nextProgress < 1) {
        animationRef.current = requestAnimationFrame(tick);
      } else {
        setIsPlaying(false);
      }
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current != null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, totalLength]);

  const skaterPosition = useMemo(() => {
    if (pathPoints.length === 0) return null;
    if (pathPoints.length === 1 || totalLength === 0) {
      return pathPoints[0];
    }

    let distanceAlong = progress * totalLength;

    for (const seg of segments) {
      if (distanceAlong <= seg.length) {
        const t = distanceAlong / seg.length;
        const x = seg.from[0] + (seg.to[0] - seg.from[0]) * t;
        const y = seg.from[1] + (seg.to[1] - seg.from[1]) * t;
        return [x, y] as [number, number];
      } else {
        distanceAlong -= seg.length;
      }
    }

    const last = segments[segments.length - 1];
    return last ? last.to : pathPoints[pathPoints.length - 1];
  }, [pathPoints, segments, totalLength, progress]);

  const canPlay = pathPoints.length >= 2 && !isPlaying;
  const canReplay = pathPoints.length >= 2 && !isPlaying && progress >= 1;

  const todayId = getTodayId();

  return (
    <main className="min-h-screen flex flex-col gap-6 p-4 sm:p-8 bg-slate-950 text-slate-100">
      <h1 className="text-2xl sm:text-3xl font-bold">Skate Your Day 🛹</h1>

      <DayTabs days={days} activeDayId={activeDayId} setActiveDayId={setActiveDayId} todayId={todayId} />

      <AddHabitForm
        activeDayId={activeDay?.id}
        newName={newName}
        setNewName={setNewName}
        newTime={newTime}
        setNewTime={setNewTime}
        formError={formError}
        handleAddHabit={handleAddHabit}
      />

      <HabitList habits={habits} toggleHabit={toggleHabit} />

      <Controls handlePlay={handlePlay} handleReplay={handleReplay} canPlay={canPlay} canReplay={canReplay} handleReset={handleReset} />

      <Timeline habits={habits} pathPoints={pathPoints} skaterPosition={skaterPosition} />
    </main>
  );
}

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <HomeContent />;
}
