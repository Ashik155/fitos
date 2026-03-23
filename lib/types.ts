// ============================================================
// FitOS — All shared TypeScript types
// Rule 8: No `any` types. All shapes defined here.
// ============================================================

export type SplitId = 'ppl' | 'upper_lower' | 'hybrid' | 'full_body' | 'arnold' | '5day';
export type GoalMode = 'recomp' | 'cut' | 'bulk';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type MealSlot = 'b' | 'l' | 'd';
export type DayName = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

// ── User Profile (stored in Supabase `profiles` table) ─────────────────────
export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  age: number;
  sex: 'male' | 'female';
  weightKg: number;
  heightCm: number;
  goal: GoalMode;
  mealsPerDay: 2 | 3 | 4 | 5;
  restrictions: string[];
  additionalRestrictions: string;
  trainingDays: number;
  experience: ExperienceLevel;
  split: SplitId;
  unitPreference: 'metric' | 'imperial';
  createdAt: string;
  updatedAt: string;
}

// ── Per-meal calorie/macro target ────────────────────────────────────────────
export interface MealTarget {
  kcal: number;
  p: number;
  f: number;
  c: number;
}

// ── Computed metrics (never stored — always derived from profile) ────────────
export interface ComputedMetrics {
  weightLbs: number;
  maintenanceKcal: number;
  targetKcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  bmi: number;
  estimatedBfPct: number;
  leanMassKg: number;
  mealTargets: MealTarget[];
}

// ── Meal ingredient ──────────────────────────────────────────────────────────
export interface MealIngredient {
  name: string;
  qty: string;
}

// ── Single meal ──────────────────────────────────────────────────────────────
export interface Meal {
  emoji: string;
  name: string;
  sub: string;
  kcal: number;
  p: number;
  c: number;
  f: number;
  ingredients: MealIngredient[];
  tip: string;
  mealType?: MealSlot;
}

// ── Meals keyed by slot ──────────────────────────────────────────────────────
export interface MealsBySlot {
  b: Meal[];
  l: Meal[];
  d: Meal[];
}

// ── Weekly plan: 7 days × 3 slots ───────────────────────────────────────────
export type DayPlan = {
  b: Meal | null;
  l: Meal | null;
  d: Meal | null;
};

export type WeekPlan = Record<DayName, DayPlan>;

// ── Exercise ─────────────────────────────────────────────────────────────────
export interface Exercise {
  name: string;
  muscle: string;
  sets: string;
  reps: string;
  rest: string;
  rpe: string;
  note: string;
}

// ── Training: single day schedule ────────────────────────────────────────────
export interface DaySchedule {
  day: DayName;
  type: 'training' | 'rest';
  label: string;
  emoji: string;
  muscles: string[];
  exercises: Exercise[];
}

// ── Full training plan ───────────────────────────────────────────────────────
export interface TrainingPlan {
  schedule: DaySchedule[];
}

// ── Split template (used for prompt injection) ───────────────────────────────
export interface DayTemplate {
  day: DayName;
  label: string;
  muscles: string[];
  type: 'training' | 'rest';
}

// ── Zustand app store shape ──────────────────────────────────────────────────
export interface AppState {
  cuisineMeals: MealsBySlot;
  ingrMeals: MealsBySlot;
  allMeals: Meal[];
  trainPlan: TrainingPlan | null;
  weekPlan: WeekPlan;
  selectedGoal: GoalMode;
  activeCuisine: string | null;
  activeIngredients: string[];
}
