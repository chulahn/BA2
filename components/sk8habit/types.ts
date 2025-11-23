export type Habit = {
  id: number;
  name: string;
  timeLabel: string; // "HH:MM"
  timeMins: number; // minutes since midnight
  y: number; // vertical position 0–100
  completed: boolean;
};

export type DayData = {
  id: string; // "YYYY-MM-DD"
  habits: Habit[];
};

export type Point = [number, number];
