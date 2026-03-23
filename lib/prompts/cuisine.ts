// ============================================================
// FitOS — Cuisine meal prompt builder
// Rule 5: All numbers come from profile and metrics — never hardcoded.
// ============================================================

import type { UserProfile, ComputedMetrics } from '@/lib/types';

/**
 * Build the user prompt for cuisine-based meal generation.
 * Every macro target is computed from the authenticated user's profile.
 */
export function buildCuisinePrompt(
  cuisine: string,
  profile: UserProfile,
  metrics: ComputedMetrics
): string {
  const targets = metrics.mealTargets;
  const B = targets[0];
  const L = targets[1];
  const D = targets[2];

  const restrictionStr =
    [...profile.restrictions, profile.additionalRestrictions]
      .filter(Boolean)
      .join(', ') || 'None';

  const mealCount = profile.mealsPerDay;

  // For users with 4–5 meals, note the extra snack slots
  const extraNote =
    mealCount > 3
      ? `Note: This user eats ${mealCount} meals/day. The 3 main slots (breakfast, lunch, dinner) are shown here. Additional snack calories are accounted for in the main meal targets.`
      : '';

  return `Generate exactly 7 ${cuisine} breakfast meals, 7 ${cuisine} lunch meals, and 7 ${cuisine} dinner meals.

## User Profile
- Age: ${profile.age} | Sex: ${profile.sex} | Experience: ${profile.experience}
- Weight: ${profile.weightKg}kg (${metrics.weightLbs.toFixed(1)} lbs)
- Height: ${profile.heightCm}cm
- Goal: ${profile.goal} | Training: ${profile.trainingDays} days/week
- Dietary restrictions: ${restrictionStr}
${extraNote}

## CRITICAL — Dietary Restrictions
STRICTLY FORBIDDEN ingredients/foods: ${restrictionStr}
Do NOT include ANY of the above in any meal under any circumstances.

## Per-Meal Macro Targets (calibrated specifically to this user)
- Breakfast: ${B.kcal} kcal · ${B.p}g protein · ${B.c}g carbs · ${B.f}g fat
- Lunch:     ${L.kcal} kcal · ${L.p}g protein · ${L.c}g carbs · ${L.f}g fat
- Dinner:    ${D.kcal} kcal · ${D.p}g protein · ${D.c}g carbs · ${D.f}g fat

## Constraints
- ALL meals must be authentically ${cuisine} cuisine or strongly ${cuisine}-inspired
- Each of the 7 meals per slot must be meaningfully different (different proteins, bases, cooking styles)
- Ingredient quantities must be realistic and precise (e.g. "220g cooked chicken breast", "150g cooked rice")
- Do not repeat any meal name across the full response (all 21 meals must have unique names)
- Keep each meal's macros within 10% of the targets above
- Include a practical, meal-specific cooking tip for each meal

## JSON Schema — respond with ONLY this exact structure, no other text:
{"b":[{"emoji":"🍽️","name":"","sub":"","kcal":0,"p":0,"c":0,"f":0,"ingredients":[{"name":"","qty":""}],"tip":""}],"l":[...],"d":[...]}`;
}
