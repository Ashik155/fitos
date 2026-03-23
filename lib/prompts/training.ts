// ============================================================
// FitOS — Training plan prompt builder
// Injects SPLIT_TEMPLATES to reduce hallucination of day structure.
// ============================================================

import type { UserProfile, SplitId } from '@/lib/types';
import { SPLIT_TEMPLATES } from '@/lib/splits';

const EXPERIENCE_GUIDANCE: Record<UserProfile['experience'], string> = {
  beginner:
    'Use fundamental compound movements only. 3–4 exercises per session max. No drop sets, rest-pause, or advanced techniques. Focus on form and establishing the movement patterns.',
  intermediate:
    'Mix compound and isolation exercises. 5–6 exercises per session. Include progressive overload notes. Can introduce some intensity techniques like pausing at bottom of reps.',
  advanced:
    'Include advanced techniques where appropriate (e.g. drop sets, supersets, rest-pause). 6–8 exercises per session. Varied rep ranges within a session (strength + hypertrophy).',
};

/**
 * Build the user prompt for training plan generation.
 * Injects the pre-defined schedule structure to prevent Claude from inventing day layouts.
 */
export function buildTrainingPrompt(
  splitId: SplitId,
  splitName: string,
  profile: UserProfile
): string {
  const template = SPLIT_TEMPLATES[splitId];
  const scheduleStructure = template
    .map((d) => `  ${d.day}: ${d.label} — muscles: ${d.muscles.join(', ') || 'Rest'}`)
    .join('\n');

  const experienceGuidance = EXPERIENCE_GUIDANCE[profile.experience];

  const goalDescription =
    profile.goal === 'recomp'
      ? 'Body recomposition (simultaneous muscle gain + fat loss)'
      : profile.goal === 'cut'
      ? 'Fat loss while preserving maximum muscle mass'
      : 'Lean muscle gain (hypertrophy focus)';

  return `You are an elite strength and conditioning coach. Create a detailed ${splitName} training programme.

## Athlete Profile
- Weight: ${profile.weightKg}kg | Height: ${profile.heightCm}cm | Age: ${profile.age} | Sex: ${profile.sex}
- Goal: ${goalDescription}
- Experience: ${profile.experience} — ${experienceGuidance}
- Training frequency: ${profile.trainingDays} days/week

## Required Schedule Structure
Follow this EXACT day-by-day layout (do not change the day assignments or muscle focus):
${scheduleStructure}

## Exercise Requirements Per Training Day
- Provide ${profile.experience === 'beginner' ? '3–4' : profile.experience === 'intermediate' ? '5–6' : '6–8'} exercises matching the day's muscle focus
- Start with 1–2 compound movements, end with isolation work
- Include: sets (as string e.g. "4"), reps (as string e.g. "8-10"), rest period (e.g. "90s"), RPE (1–10 scale as string e.g. "8"), and a form cue note
- RPE target: 7–9 for working sets
- Rest: 2–3 min for strength work, 60–90s for hypertrophy, 45–60s for isolation
- For rest days: return type "rest", no exercises, label and emoji only

## JSON Schema — respond with ONLY this exact structure:
{"schedule":[{"day":"Mon","type":"training","label":"Push","emoji":"💪","muscles":["Chest","Shoulders","Triceps"],"exercises":[{"name":"Barbell Bench Press","muscle":"Chest","sets":"4","reps":"6-8","rest":"2-3 min","rpe":"8","note":"Keep scapulae retracted throughout the movement"}]},{"day":"Tue","type":"rest","label":"Rest","emoji":"🧘","muscles":[],"exercises":[]},{"day":"Wed","type":"training",...}]}

Return ALL 7 days. ONLY valid JSON, no other text before or after.`;
}
