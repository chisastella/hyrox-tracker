export const HYROX_DATE = new Date('2026-08-09T00:00:00');

export const WORKOUT_TYPES = {
  HYROX:     { label: 'HYROX Training', points: 20, emoji: '🏋️', color: '#f97316' },
  CROSSFIT:  { label: 'CrossFit',       points: 15, emoji: '⚡',  color: '#eab308' },
  RUNNING:   { label: 'Running',        points: 12, emoji: '🏃',  color: '#22c55e', distanceMode: true },
  SWIMMING:  { label: 'Swimming',       points: 12, emoji: '🏊',  color: '#38bdf8' },
  HOME:      { label: 'Home Training',  points: 12, emoji: '🏠',  color: '#a855f7' },
  KICKBOXING:{ label: 'Kickboxing',     points: 10, emoji: '🥊',  color: '#ef4444' },
  WALKING:   { label: 'Walking',        points:  8, emoji: '🚶',  color: '#84cc16', distanceMode: true },
  OTHER:     { label: 'Other',          points: 10, emoji: '🏅',  color: '#94a3b8' },
};

export const DISTANCE_TYPES = ['RUNNING', 'WALKING'];
export const DISTANCE_PTS_PER_KM = { RUNNING: 3, WALKING: 2 };

export const USER_WORKOUT_TYPES = {
  chisa:   ['HYROX', 'CROSSFIT', 'RUNNING', 'SWIMMING', 'WALKING', 'OTHER'],
  partner: ['HYROX', 'RUNNING', 'HOME', 'KICKBOXING', 'WALKING', 'OTHER'],
};

export const USER_META = {
  chisa: {
    color: '#f97316',
    bg: 'bg-orange-500',
    bgLight: 'bg-orange-500/20',
    text: 'text-orange-400',
    border: 'border-orange-500',
    gradient: 'from-orange-500 to-rose-500',
  },
  partner: {
    color: '#38bdf8',
    bg: 'bg-sky-500',
    bgLight: 'bg-sky-500/20',
    text: 'text-sky-400',
    border: 'border-sky-500',
    gradient: 'from-sky-400 to-blue-600',
  },
};

export const MOTIVATION_MESSAGES = [
  "You're an absolute BEAST! HYROX glory awaits! 🔥",
  "That session just paid dividends — compound gains, baby!",
  "August 9th is calling — and you just answered!",
  "Every drop of sweat is a deposit in the HYROX bank!",
  "Champions are built in sessions exactly like this!",
  "Your future self just did a happy dance! Keep going!",
  "Pain is temporary. HYROX finisher medals are forever! 🏅",
  "Look at you GO! Absolutely crushing it!",
  "That's what dedication looks like. You're unstoppable!",
  "One workout closer to crossing that finish line! 🏁",
  "You showed up. That's already half the battle — won!",
  "The grind is real. So is your progress! 🚀",
  "LOCKED IN. Let's go!",
  "Your training partner is proud of you. WE GOT THIS!",
];

export function getStreakMessage(streak) {
  if (streak >= 30) return "A whole MONTH?! You're a legend! 🏆";
  if (streak >= 21) return "3 weeks straight! This is your lifestyle now! 🚀";
  if (streak >= 14) return "Two full weeks! You're unstoppable! 💪";
  if (streak >= 7)  return "A full week! You're in beast mode! 🔥";
  if (streak >= 3)  return "3 days strong — you're locked in!";
  if (streak >= 2)  return "Two days running — momentum builds!";
  if (streak === 1) return "Day 1 — the hardest part is starting! 🌱";
  return "Log a workout to start your streak!";
}

// Sorted highest → lowest so getLevel() works with a simple find
export const LEVELS = [
  { level: 10, name: 'HYROX Beast',  emoji: '🔥', color: '#ef4444', minPts: 2000 },
  { level:  9, name: 'Legend',       emoji: '🏆', color: '#f97316', minPts: 1200 },
  { level:  8, name: 'Champion',     emoji: '🥇', color: '#f59e0b', minPts:  700 },
  { level:  7, name: 'Elite',        emoji: '💜', color: '#8b5cf6', minPts:  400 },
  { level:  6, name: 'Pro',          emoji: '💙', color: '#06b6d4', minPts:  220 },
  { level:  5, name: 'Athlete',      emoji: '💚', color: '#22c55e', minPts:  110 },
  { level:  4, name: 'Active',       emoji: '⚡', color: '#84cc16', minPts:   50 },
  { level:  3, name: 'Motivated',    emoji: '🌱', color: '#a3e635', minPts:   20 },
  { level:  2, name: 'Starter',      emoji: '✨', color: '#60a5fa', minPts:    5 },
  { level:  1, name: 'Rookie',       emoji: '🐣', color: '#9ca3af', minPts:    0 },
];

export function getLevel(totalPoints) {
  return LEVELS.find(l => totalPoints >= l.minPts) ?? LEVELS[LEVELS.length - 1];
}

export function getLevelProgress(totalPoints) {
  const current = getLevel(totalPoints);
  const currentIdx = LEVELS.findIndex(l => l.level === current.level);
  const next = currentIdx > 0 ? LEVELS[currentIdx - 1] : null;
  if (!next) return 100;
  return Math.min(100, Math.round(((totalPoints - current.minPts) / (next.minPts - current.minPts)) * 100));
}

export const COUPLE_LEVELS = [
  { name: 'HYROX Legends',   emoji: '🏆', minPts: 4000 },
  { name: 'Diamond Couple',  emoji: '💎', minPts: 2000 },
  { name: 'Gold Couple',     emoji: '🥇', minPts:  800 },
  { name: 'Silver Couple',   emoji: '🥈', minPts:  300 },
  { name: 'Bronze Couple',   emoji: '🥉', minPts:  100 },
  { name: 'Training Couple', emoji: '💪', minPts:    0 },
];

export function getCoupleLevel(combinedPoints) {
  return COUPLE_LEVELS.find(cl => combinedPoints >= cl.minPts) ?? COUPLE_LEVELS[COUPLE_LEVELS.length - 1];
}

export const DURATION_TIERS = [
  { minMin: 90, bonus: 15, label: '90+ min' },
  { minMin: 75, bonus: 12, label: '75+ min' },
  { minMin: 60, bonus:  8, label: '60+ min' },
  { minMin: 45, bonus:  5, label: '45+ min' },
  { minMin: 30, bonus:  2, label: '30+ min' },
  { minMin:  0, bonus:  0, label: ''         },
];

export function getDurationBonus(minutes) {
  return (DURATION_TIERS.find(t => minutes >= t.minMin) ?? DURATION_TIERS[DURATION_TIERS.length - 1]).bonus;
}
