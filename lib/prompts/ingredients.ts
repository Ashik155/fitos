// ============================================================
// FitOS — Ingredient-based meal prompt builder
// Rule 5: All numbers come from profile and metrics — never hardcoded.
// ============================================================

import type { UserProfile, ComputedMetrics } from '@/lib/types';

/**
 * Build the user prompt for ingredient-based meal generation.
 * Uses only the user's pantry items + standard staples.
 */
export function buildIngredientsPrompt(
  ingredients: string[],
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

  const ingredientList = ingredients.map((i) => `- ${i}`).join('\n');

  return `Generate as many different meals as possible using ONLY the listed ingredients.

## Available Ingredients
${ingredientList}

## Basic Pantry Staples (always assumed available)
Salt, black pepper, olive oil, vegetable oil, garlic, onion, water,
basic dried spices (cumin, paprika, turmeric, oregano, cinnamon, chilli flakes),
soy sauce, vinegar, lemon, lime, tomato paste, baking powder.

## User Profile
- Weight: ${profile.weightKg}kg | Height: ${profile.heightCm}cm | Age: ${profile.age}
- Goal: ${profile.goal} | Dietary restrictions: ${restrictionStr}

## CRITICAL — Dietary Restrictions
STRICTLY FORBIDDEN: ${restrictionStr}

## Per-Meal Macro Targets (this user specifically)
- Breakfast: ${B.kcal} kcal · ${B.p}g protein · ${B.c}g carbs · ${B.f}g fat
- Lunch:     ${L.kcal} kcal · ${L.p}g protein · ${L.c}g carbs · ${L.f}g fat
- Dinner:    ${D.kcal} kcal · ${D.p}g protein · ${D.c}g carbs · ${D.f}g fat

## Rules
- Use ONLY the listed ingredients + pantry staples. Do NOT introduce unlisted ingredients.
- Aim for 5–7 meals per category (b, l, d). If fewer are possible, return only valid ones.
- STRICTLY NO: ${restrictionStr}
- Maximise variety — no two meals should feel interchangeable
- If a full category cannot produce any valid meal, return an empty array for it
- Keep macros within 15% of targets (less strict since ingredients are user-constrained)
- Include a practical cooking tip per meal

## JSON Schema — respond with ONLY this exact structure:
{"b":[{"emoji":"🍽️","name":"","sub":"","kcal":0,"p":0,"c":0,"f":0,"ingredients":[{"name":"","qty":""}],"tip":""}],"l":[...],"d":[...]}`;
}
