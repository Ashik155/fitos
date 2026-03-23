// ============================================================
// FitOS — Macro computation engine
// Rule 3: ALL calorie/macro math lives here exclusively.
// Never duplicate these formulas elsewhere.
// ============================================================

import type { UserProfile, ComputedMetrics, MealTarget } from '@/lib/types';

// ── Activity multiplier lookup ────────────────────────────────────────────────
const getActivityMultiplier = (trainingDays: number): number => {
  if (trainingDays >= 6) return 17.5;
  if (trainingDays >= 4) return 16.0;
  if (trainingDays >= 2) return 14.5;
  return 13.0;
};

// ── Goal multiplier lookup ────────────────────────────────────────────────────
const getGoalMultiplier = (goal: UserProfile['goal']): number => {
  if (goal === 'bulk') return 1.10;
  if (goal === 'cut') return 0.875;
  return 1.0; // recomp = maintenance
};

// ── Meal calorie split percentages ───────────────────────────────────────────
const MEAL_SPLITS: Record<number, number[]> = {
  2: [0.50, 0.50],
  3: [0.35, 0.35, 0.30],
  4: [0.25, 0.30, 0.30, 0.15],
  5: [0.20, 0.25, 0.25, 0.15, 0.15],
};

/**
 * Get per-meal macro targets for a given total and meal count.
 * Each target is proportional to its meal-slot percentage.
 */
export function getMealTargets(
  targetKcal: number,
  proteinG: number,
  fatG: number,
  carbsG: number,
  mealsPerDay: number
): MealTarget[] {
  const pcts = MEAL_SPLITS[mealsPerDay] ?? MEAL_SPLITS[3];
  return pcts.map((pct) => ({
    kcal: Math.round(targetKcal * pct),
    p: Math.round(proteinG * pct),
    f: Math.round(fatG * pct),
    c: Math.round(carbsG * pct),
  }));
}

/**
 * Estimate body fat % using a simplified formula.
 * This is a rough estimate only — not medical advice.
 * Uses BMI-based method as a proxy.
 */
const estimateBfPct = (bmi: number, age: number, sex: 'male' | 'female'): number => {
  // Deurenberg formula (1991): BF% = (1.20 × BMI) + (0.23 × age) − (10.8 × sex) − 5.4
  // sex: 1 = male, 0 = female
  const sexFactor = sex === 'male' ? 1 : 0;
  const bf = 1.2 * bmi + 0.23 * age - 10.8 * sexFactor - 5.4;
  return parseFloat(Math.max(5, Math.min(60, bf)).toFixed(1));
};

/**
 * Core macro engine — given a user profile, computes all derived metrics.
 * This is the ONLY place in the codebase that performs these calculations.
 *
 * @param profile - The authenticated user's profile from Supabase
 * @returns ComputedMetrics — never stored, always computed fresh
 */
export function computeMetrics(profile: UserProfile): ComputedMetrics {
  // Convert to imperial for activity-based TDEE
  const weightLbs = profile.weightKg * 2.2046;

  // Step 1 — Maintenance calories (Nippard quick method)
  const activityMultiplier = getActivityMultiplier(profile.trainingDays);
  const maintenanceKcal = Math.round(weightLbs * activityMultiplier);

  // Step 2 — Apply goal adjustment
  const goalMultiplier = getGoalMultiplier(profile.goal);
  const targetKcal = Math.round(maintenanceKcal * goalMultiplier);

  // Step 3 — Protein (height-cm method; extra 10% during cut)
  const proteinG =
    profile.goal === 'cut'
      ? Math.round(profile.heightCm * 1.1)
      : Math.round(profile.heightCm);

  // Step 4 — Fat at 25% of target calories
  const fatG = Math.round((targetKcal * 0.25) / 9);

  // Step 5 — Carbs fill remaining calories
  const carbsG = Math.round((targetKcal - proteinG * 4 - fatG * 9) / 4);

  // Step 6 — BMI
  const heightM = profile.heightCm / 100;
  const bmi = parseFloat((profile.weightKg / (heightM * heightM)).toFixed(1));

  // Step 7 — Estimated body fat % + lean mass
  const estimatedBfPct = estimateBfPct(bmi, profile.age, profile.sex);
  const leanMassKg = parseFloat(
    (profile.weightKg * (1 - estimatedBfPct / 100)).toFixed(1)
  );

  // Step 8 — Per-meal targets
  const mealTargets = getMealTargets(
    targetKcal,
    proteinG,
    fatG,
    carbsG,
    profile.mealsPerDay
  );

  return {
    weightLbs: parseFloat(weightLbs.toFixed(1)),
    maintenanceKcal,
    targetKcal,
    proteinG,
    fatG,
    carbsG,
    bmi,
    estimatedBfPct,
    leanMassKg,
    mealTargets,
  };
}

/**
 * Format computed metrics into a human-readable string for prompt injection.
 * Used in every AI prompt to ensure all numbers are the user's real numbers.
 */
export function formatMacrosForPrompt(metrics: ComputedMetrics): string {
  return [
    `Target calories: ${metrics.targetKcal} kcal/day`,
    `Protein: ${metrics.proteinG}g/day`,
    `Fat: ${metrics.fatG}g/day`,
    `Carbs: ${metrics.carbsG}g/day`,
    `Maintenance: ${metrics.maintenanceKcal} kcal/day`,
  ].join(' | ');
}
