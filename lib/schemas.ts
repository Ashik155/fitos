// ============================================================
// FitOS — Zod schemas for Claude AI response validation
// Rule 4: Always validate with Zod via parseClaudeJSON()
// ============================================================

import { z } from 'zod';

// ── Meal schemas ──────────────────────────────────────────────────────────────
export const MealIngredientSchema = z.object({
  name: z.string(),
  qty: z.string(),
});

export const MealSchema = z.object({
  emoji: z.string(),
  name: z.string(),
  sub: z.string(),
  kcal: z.number(),
  p: z.number(),
  c: z.number(),
  f: z.number(),
  ingredients: z.array(MealIngredientSchema),
  tip: z.string(),
});

export const MealsBySlotSchema = z.object({
  b: z.array(MealSchema),
  l: z.array(MealSchema),
  d: z.array(MealSchema),
});

// ── Exercise and training schemas ─────────────────────────────────────────────
export const ExerciseSchema = z.object({
  name: z.string(),
  muscle: z.string(),
  sets: z.string(),
  reps: z.string(),
  rest: z.string(),
  rpe: z.string(),
  note: z.string(),
});

export const DayScheduleSchema = z.object({
  day: z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']),
  type: z.enum(['training', 'rest']),
  label: z.string(),
  emoji: z.string(),
  muscles: z.array(z.string()),
  exercises: z.array(ExerciseSchema),
});

export const TrainingPlanSchema = z.object({
  schedule: z.array(DayScheduleSchema),
});

// ── User profile schema ───────────────────────────────────────────────────────
export const UserProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  fullName: z.string(),
  age: z.number().min(16).max(80),
  sex: z.enum(['male', 'female']),
  weightKg: z.number().min(30).max(300),
  heightCm: z.number().min(100).max(250),
  goal: z.enum(['recomp', 'cut', 'bulk']),
  mealsPerDay: z.union([z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  restrictions: z.array(z.string()),
  additionalRestrictions: z.string(),
  trainingDays: z.number().min(1).max(7),
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  split: z.enum(['ppl', 'upper_lower', 'hybrid', 'full_body', 'arnold', '5day']),
  unitPreference: z.enum(['metric', 'imperial']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ── Inferred types (match lib/types.ts interfaces) ───────────────────────────
export type MealIngredientType = z.infer<typeof MealIngredientSchema>;
export type MealType = z.infer<typeof MealSchema>;
export type MealsBySlotType = z.infer<typeof MealsBySlotSchema>;
export type ExerciseType = z.infer<typeof ExerciseSchema>;
export type DayScheduleType = z.infer<typeof DayScheduleSchema>;
export type TrainingPlanType = z.infer<typeof TrainingPlanSchema>;
export type UserProfileType = z.infer<typeof UserProfileSchema>;
