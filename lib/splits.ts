// ============================================================
// FitOS — Training split templates
// Used for prompt injection and UI display.
// ============================================================

import type { SplitId, DayTemplate } from '@/lib/types';

export const SPLIT_TEMPLATES: Record<SplitId, DayTemplate[]> = {
  ppl: [
    { day: 'Mon', label: 'Push 1 — Chest, Shoulders, Triceps', muscles: ['Chest', 'Front Delt', 'Triceps'], type: 'training' },
    { day: 'Tue', label: 'Pull 1 — Back, Biceps, Rear Delts', muscles: ['Back', 'Biceps', 'Rear Delt'], type: 'training' },
    { day: 'Wed', label: 'Legs 1 — Quads, Hamstrings, Glutes, Calves', muscles: ['Quads', 'Hamstrings', 'Glutes', 'Calves'], type: 'training' },
    { day: 'Thu', label: 'Push 2 — Shoulder Focus', muscles: ['Shoulders', 'Chest', 'Triceps'], type: 'training' },
    { day: 'Fri', label: 'Pull 2 — Arm Focus', muscles: ['Back', 'Biceps', 'Forearms'], type: 'training' },
    { day: 'Sat', label: 'Legs 2 — Posterior Chain', muscles: ['Hamstrings', 'Glutes', 'Calves'], type: 'training' },
    { day: 'Sun', label: 'Rest', muscles: [], type: 'rest' },
  ],

  upper_lower: [
    { day: 'Mon', label: 'Upper — Chest, Back, Shoulders, Arms', muscles: ['Chest', 'Back', 'Shoulders', 'Arms'], type: 'training' },
    { day: 'Tue', label: 'Lower — Quads, Hamstrings, Glutes, Calves', muscles: ['Quads', 'Hamstrings', 'Glutes', 'Calves'], type: 'training' },
    { day: 'Wed', label: 'Rest', muscles: [], type: 'rest' },
    { day: 'Thu', label: 'Upper — Variation', muscles: ['Chest', 'Back', 'Shoulders', 'Arms'], type: 'training' },
    { day: 'Fri', label: 'Lower — Variation', muscles: ['Quads', 'Hamstrings', 'Glutes', 'Calves'], type: 'training' },
    { day: 'Sat', label: 'Rest', muscles: [], type: 'rest' },
    { day: 'Sun', label: 'Rest', muscles: [], type: 'rest' },
  ],

  hybrid: [
    { day: 'Mon', label: 'Strength — Heavy Compounds', muscles: ['Full Body', 'CNS'], type: 'training' },
    { day: 'Tue', label: 'Endurance — Zone 2 Cardio + Core', muscles: ['Core', 'Cardiovascular'], type: 'training' },
    { day: 'Wed', label: 'Hypertrophy Upper — High Volume', muscles: ['Chest', 'Back', 'Shoulders', 'Arms'], type: 'training' },
    { day: 'Thu', label: 'Mobility / Active Recovery', muscles: ['Full Body', 'Flexibility'], type: 'training' },
    { day: 'Fri', label: 'Hypertrophy Lower — High Volume', muscles: ['Quads', 'Hamstrings', 'Glutes', 'Calves'], type: 'training' },
    { day: 'Sat', label: 'Conditioning — HIIT or Functional', muscles: ['Full Body', 'Cardiovascular'], type: 'training' },
    { day: 'Sun', label: 'Rest', muscles: [], type: 'rest' },
  ],

  full_body: [
    { day: 'Mon', label: 'Full Body A — Squat, Push, Pull, Hinge', muscles: ['Quads', 'Chest', 'Back', 'Hamstrings'], type: 'training' },
    { day: 'Tue', label: 'Rest', muscles: [], type: 'rest' },
    { day: 'Wed', label: 'Full Body B — Variation', muscles: ['Glutes', 'Chest', 'Back', 'Shoulders'], type: 'training' },
    { day: 'Thu', label: 'Rest', muscles: [], type: 'rest' },
    { day: 'Fri', label: 'Full Body C — Emphasis Variation', muscles: ['Legs', 'Back', 'Arms', 'Core'], type: 'training' },
    { day: 'Sat', label: 'Rest', muscles: [], type: 'rest' },
    { day: 'Sun', label: 'Rest', muscles: [], type: 'rest' },
  ],

  arnold: [
    { day: 'Mon', label: 'Chest + Back', muscles: ['Chest', 'Back', 'Lats'], type: 'training' },
    { day: 'Tue', label: 'Shoulders + Arms', muscles: ['Shoulders', 'Biceps', 'Triceps'], type: 'training' },
    { day: 'Wed', label: 'Legs', muscles: ['Quads', 'Hamstrings', 'Glutes', 'Calves'], type: 'training' },
    { day: 'Thu', label: 'Chest + Back — Variation', muscles: ['Upper Chest', 'Mid Back', 'Lats'], type: 'training' },
    { day: 'Fri', label: 'Shoulders + Arms — Variation', muscles: ['Side Delt', 'Rear Delt', 'Biceps', 'Triceps'], type: 'training' },
    { day: 'Sat', label: 'Legs — Variation', muscles: ['Hamstrings', 'Glutes', 'Quads', 'Calves'], type: 'training' },
    { day: 'Sun', label: 'Rest', muscles: [], type: 'rest' },
  ],

  '5day': [
    { day: 'Mon', label: 'Upper — Chest & Back Focus', muscles: ['Chest', 'Back', 'Shoulders'], type: 'training' },
    { day: 'Tue', label: 'Lower — Quad Dominant', muscles: ['Quads', 'Glutes', 'Calves'], type: 'training' },
    { day: 'Wed', label: 'Rest', muscles: [], type: 'rest' },
    { day: 'Thu', label: 'Upper — Shoulder & Arms Focus', muscles: ['Shoulders', 'Biceps', 'Triceps', 'Back'], type: 'training' },
    { day: 'Fri', label: 'Lower — Posterior Chain', muscles: ['Hamstrings', 'Glutes', 'Calves'], type: 'training' },
    { day: 'Sat', label: 'Full Body — Compound Focus', muscles: ['Full Body'], type: 'training' },
    { day: 'Sun', label: 'Rest', muscles: [], type: 'rest' },
  ],
};

// ── Display metadata for split picker UI ──────────────────────────────────────
export interface SplitMeta {
  name: string;
  days: number;
  description: string;
  icon: string;
}

export const SPLITS_META: Record<SplitId, SplitMeta> = {
  ppl: {
    name: 'Push / Pull / Legs',
    days: 6,
    description: '2× push, 2× pull, 2× legs. Classic high-frequency split for intermediate/advanced lifters.',
    icon: '🔄',
  },
  upper_lower: {
    name: 'Upper / Lower',
    days: 4,
    description: 'Alternating upper and lower body days. Each muscle trained twice per week with adequate recovery.',
    icon: '↕️',
  },
  hybrid: {
    name: 'Hybrid',
    days: 6,
    description: 'Strength + Hypertrophy + Endurance + Mobility. Ideal for well-rounded fitness athletes.',
    icon: '⚡',
  },
  full_body: {
    name: 'Full Body',
    days: 3,
    description: '3× full compound sessions per week. Perfect for beginners and time-efficient training.',
    icon: '💪',
  },
  arnold: {
    name: 'Arnold Split',
    days: 6,
    description: 'Chest+Back / Shoulders+Arms / Legs × 2. High volume classic used by Arnold Schwarzenegger.',
    icon: '🏆',
  },
  '5day': {
    name: '5-Day Split',
    days: 5,
    description: 'Upper, Lower, Rest, Upper, Lower, Full Body. Balanced frequency with dedicated rest midweek.',
    icon: '📅',
  },
};
