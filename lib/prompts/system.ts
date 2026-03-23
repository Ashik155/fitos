// ============================================================
// FitOS — System prompt builder
// Injects full nutrition knowledge base from knowledge/nutrition.md
// ============================================================

import { readFileSync } from 'fs';
import path from 'path';

// Load at module level — cached for the lifetime of the server process
const NUTRITION_KB = readFileSync(
  path.join(process.cwd(), 'knowledge/nutrition.md'),
  'utf-8'
);

/**
 * Build the system prompt injected into every nutrition-related Claude call.
 * Uses prompt caching by keeping the knowledge base in the system role.
 */
export function buildSystemPrompt(): string {
  return `You are a senior nutritionist and chef assistant inside a fitness app called FitOS.

You apply evidence-based sports nutrition science. Here are the principles you follow:

${NUTRITION_KB}

## Your Output Rules
- ALWAYS respond with ONLY valid JSON — no markdown, no preamble, no explanation.
- NEVER include ingredients that violate the user's dietary restrictions.
- ALWAYS keep macro values within 10% of the stated per-meal targets.
- NEVER repeat the same meal name within a single response.
- Ingredient amounts must be realistic and precise (e.g. "220g cooked chicken breast").
- Always include a practical, specific cooking tip per meal.`;
}

/**
 * Build the system prompt for training plan generation.
 * Loads training knowledge base from knowledge/training.md
 */
export function buildTrainingSystemPrompt(): string {
  const TRAINING_KB = readFileSync(
    path.join(process.cwd(), 'knowledge/training.md'),
    'utf-8'
  );

  return `You are an elite strength and conditioning coach building personalised training programmes inside FitOS.

Apply this evidence-based training science:

${TRAINING_KB}

## Output Rules
- ALWAYS respond with ONLY valid JSON — no markdown fences, no explanation.
- Follow the exact day structure provided in the user prompt.
- Prescribe realistic sets, reps, rest periods, and RPE values.
- Include a specific, actionable form cue note for each exercise.`;
}
