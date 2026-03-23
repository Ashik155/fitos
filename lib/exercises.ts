import type { Exercise } from '@/lib/types';

export interface StaticExercise extends Exercise {
  category: string;
  type: 'Compound' | 'Isolation';
}

export const EXERCISES: StaticExercise[] = [
  // Chest
  { name: 'Barbell Bench Press', muscle: 'Chest', sets: '4', reps: '6-8', rest: '2-3 min', rpe: '8', note: 'Keep scapulae retracted. Touch chest lightly, drive through triceps.', category: 'Chest', type: 'Compound' },
  { name: 'Incline Dumbbell Press', muscle: 'Upper Chest', sets: '3', reps: '8-12', rest: '90s', rpe: '8', note: 'Set bench at 30-45°. Control the eccentric, press at shoulder width.', category: 'Chest', type: 'Compound' },
  { name: 'Cable Crossover / Fly', muscle: 'Chest', sets: '3', reps: '12-15', rest: '60s', rpe: '7', note: 'Maintain slight bend in elbows throughout. Squeeze at peak contraction.', category: 'Chest', type: 'Isolation' },
  { name: 'Dips (Chest Version)', muscle: 'Lower Chest', sets: '3', reps: '8-12', rest: '90s', rpe: '8', note: 'Lean forward 30° to target chest over triceps.', category: 'Chest', type: 'Compound' },
  // Back
  { name: 'Barbell Row', muscle: 'Mid Back', sets: '4', reps: '6-10', rest: '2 min', rpe: '8', note: 'Hinge at hip, torso ~45°. Row to lower sternum. No leg drive.', category: 'Back', type: 'Compound' },
  { name: 'Pull-up / Lat Pulldown', muscle: 'Lats', sets: '4', reps: '6-10', rest: '90s', rpe: '8', note: 'Initiate with lat depression. Drive elbows down and back.', category: 'Back', type: 'Compound' },
  { name: 'Seated Cable Row', muscle: 'Mid Back', sets: '3', reps: '10-12', rest: '90s', rpe: '7', note: 'Row to belly button. Retract scapulae at peak. Control return.', category: 'Back', type: 'Compound' },
  { name: 'Face Pull', muscle: 'Rear Delt', sets: '3', reps: '15-20', rest: '60s', rpe: '7', note: 'Pull to forehead height with external rotation. Use light weight.', category: 'Back', type: 'Isolation' },
  // Legs
  { name: 'Back Squat', muscle: 'Quads', sets: '4', reps: '5-8', rest: '3 min', rpe: '8', note: 'Brace core fully before descent. Keep chest tall and knees tracking toes.', category: 'Legs', type: 'Compound' },
  { name: 'Romanian Deadlift', muscle: 'Hamstrings', sets: '3', reps: '8-12', rest: '2 min', rpe: '8', note: 'Hinge at hip, slight knee bend. Feel hamstring stretch before driving through glutes.', category: 'Legs', type: 'Compound' },
  { name: 'Leg Press', muscle: 'Quads', sets: '3', reps: '10-15', rest: '90s', rpe: '8', note: 'Place feet hip-width. Never lock knees at top. Control the descent.', category: 'Legs', type: 'Compound' },
  { name: 'Hip Thrust', muscle: 'Glutes', sets: '4', reps: '10-15', rest: '90s', rpe: '8', note: 'Drive through heels, squeeze glutes hard at top. Chin tucked throughout.', category: 'Legs', type: 'Compound' },
  { name: 'Bulgarian Split Squat', muscle: 'Quads / Glutes', sets: '3', reps: '8-12 each', rest: '90s', rpe: '8', note: 'Rear foot elevated. Torso upright. Drive through front heel.', category: 'Legs', type: 'Compound' },
  { name: 'Leg Extension', muscle: 'Quads', sets: '3', reps: '12-15', rest: '60s', rpe: '7', note: 'Squeeze at full extension. Slow eccentric (3s) for maximum TUT.', category: 'Legs', type: 'Isolation' },
  { name: 'Leg Curl (Seated/Lying)', muscle: 'Hamstrings', sets: '3', reps: '12-15', rest: '60s', rpe: '7', note: 'Full range of motion. Slow negative. Avoid hip flexion at start.', category: 'Legs', type: 'Isolation' },
  { name: 'Calf Raise (Standing)', muscle: 'Gastrocnemius', sets: '4', reps: '15-20', rest: '60s', rpe: '8', note: 'Full range — all the way down for stretch, rise to full contraction.', category: 'Legs', type: 'Isolation' },
  // Shoulders
  { name: 'Overhead Press (Barbell)', muscle: 'Front Delt', sets: '4', reps: '6-10', rest: '2 min', rpe: '8', note: 'Press in a slight arc back. Lock out overhead. Avoid excessive lumbar extension.', category: 'Shoulders', type: 'Compound' },
  { name: 'Lateral Raise', muscle: 'Mid Delt', sets: '4', reps: '12-20', rest: '60s', rpe: '8', note: 'Slight forward lean. Pinky-up at top. Use controlled weight — no swinging.', category: 'Shoulders', type: 'Isolation' },
  { name: 'Rear Delt Fly', muscle: 'Rear Delt', sets: '3', reps: '15-20', rest: '60s', rpe: '7', note: 'Prone on bench or cable. Lead with elbows, not hands. Squeeze at peak.', category: 'Shoulders', type: 'Isolation' },
  // Arms
  { name: 'Barbell Curl', muscle: 'Biceps', sets: '3', reps: '8-12', rest: '90s', rpe: '8', note: 'Elbows pinned at sides. Full supination at top. Control eccentric (2s).', category: 'Arms', type: 'Isolation' },
  { name: 'Hammer Curl', muscle: 'Brachialis', sets: '3', reps: '10-15', rest: '60s', rpe: '7', note: 'Neutral grip throughout. Great for arm thickness and forearm development.', category: 'Arms', type: 'Isolation' },
  { name: 'Tricep Pushdown', muscle: 'Triceps', sets: '3', reps: '12-15', rest: '60s', rpe: '7', note: 'Elbows pinned. Full extension at bottom. Rope attachment gives better peak contraction.', category: 'Arms', type: 'Isolation' },
  { name: 'Skull Crusher', muscle: 'Triceps (Long Head)', sets: '3', reps: '8-12', rest: '90s', rpe: '8', note: 'Lower to just above forehead. Maximises long head stretch at bottom.', category: 'Arms', type: 'Isolation' },
  // Core
  { name: 'Hanging Leg Raise', muscle: 'Core', sets: '3', reps: '10-15', rest: '60s', rpe: '7', note: 'Posterior pelvic tilt at top. Avoid swinging. Slow eccentric.', category: 'Core', type: 'Isolation' },
  { name: 'Ab Wheel Rollout', muscle: 'Core (Anti-Extension)', sets: '3', reps: '8-12', rest: '60s', rpe: '8', note: 'Maintain neutral spine. Roll to point of tension — not full extension initially.', category: 'Core', type: 'Isolation' },
  { name: 'Plank', muscle: 'Core', sets: '3', reps: '45-60s', rest: '60s', rpe: '7', note: 'Squeeze glutes and quads. Breath normally. Avoid hips dropping or raising.', category: 'Core', type: 'Isolation' },
];

export const MUSCLE_CATEGORIES = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
