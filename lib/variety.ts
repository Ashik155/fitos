// ============================================================
// FitOS — Variety enforcement for weekly meal planner
// Rule 6: Max 2× same meal per week. Enforced here AND in UI.
// ============================================================

import type { WeekPlan } from '@/lib/types';

const MAX_OCCURRENCES = 2;

/**
 * Count how many times a meal with the given name appears in the current week plan.
 */
export function countMealInPlan(name: string, plan: WeekPlan): number {
  let count = 0;
  for (const dayPlan of Object.values(plan)) {
    for (const meal of [dayPlan.b, dayPlan.l, dayPlan.d]) {
      if (meal && meal.name === name) count++;
    }
  }
  return count;
}

/**
 * Returns true if the meal can still be added (count < 2).
 */
export function canAddMeal(name: string, plan: WeekPlan): boolean {
  return countMealInPlan(name, plan) < MAX_OCCURRENCES;
}

/**
 * Returns a map of meal name → occurrence count for all meals in the plan.
 */
export function getVarietyMap(plan: WeekPlan): Record<string, number> {
  const map: Record<string, number> = {};
  for (const dayPlan of Object.values(plan)) {
    for (const meal of [dayPlan.b, dayPlan.l, dayPlan.d]) {
      if (meal) {
        map[meal.name] = (map[meal.name] ?? 0) + 1;
      }
    }
  }
  return map;
}

/**
 * Returns the variety status for a given meal name:
 * - 'ok'      → 0–1 occurrences (can be added freely)
 * - 'warn'    → exactly 2 occurrences (already at limit — cannot add again)
 * - 'blocked' → 2+ occurrences (blocked — should not appear in picker)
 */
export function getVarietyStatus(
  name: string,
  plan: WeekPlan
): 'ok' | 'warn' | 'blocked' {
  const count = countMealInPlan(name, plan);
  if (count >= MAX_OCCURRENCES) return 'blocked';
  if (count === MAX_OCCURRENCES - 1) return 'warn';
  return 'ok';
}
