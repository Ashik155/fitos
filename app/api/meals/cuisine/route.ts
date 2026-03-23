// ============================================================
// FitOS — Cuisine meal generation API
// Rule 2: Profile loaded server-side from Supabase
// Rule 4: JSON parsed via callClaudeJSON + Zod
// Rule 5: All prompt values from real profile + metrics
// ============================================================

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { computeMetrics } from '@/lib/macros';
import { mapProfileRow } from '@/lib/profile';
import { buildSystemPrompt } from '@/lib/prompts/system';
import { buildCuisinePrompt } from '@/lib/prompts/cuisine';
import { callClaudeJSON } from '@/lib/claude';
import { MealsBySlotSchema } from '@/lib/schemas';

const ALLOWED_CUISINES = [
  'Indian', 'Japanese', 'Mediterranean', 'Mexican', 'Chinese',
  'Thai', 'Italian', 'Korean', 'Middle Eastern', 'Turkish',
  'Surprise Me',
];

// Simple in-memory rate limit: one generation per 10s per user
const lastGenTime: Map<string, number> = new Map();

export async function POST(request: Request) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Rate limit ────────────────────────────────────────────────────────────
  const now = Date.now();
  const lastTime = lastGenTime.get(session.user.id) ?? 0;
  if (now - lastTime < 10_000) {
    return NextResponse.json(
      { error: 'Please wait 10 seconds before generating again.' },
      { status: 429 }
    );
  }
  lastGenTime.set(session.user.id, now);

  // ── Validate request body ─────────────────────────────────────────────────
  const body = await request.json();
  const cuisine: string = body.cuisine ?? '';

  if (!ALLOWED_CUISINES.includes(cuisine)) {
    return NextResponse.json(
      { error: 'Invalid cuisine selection.' },
      { status: 400 }
    );
  }

  // Resolve "Surprise Me" to a random allowed cuisine
  const resolvedCuisine =
    cuisine === 'Surprise Me'
      ? ALLOWED_CUISINES[Math.floor(Math.random() * (ALLOWED_CUISINES.length - 1))]
      : cuisine;

  // ── Load profile server-side (Rule 2) ─────────────────────────────────────
  const { data: row, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (profileError || !row) {
    return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
  }

  const profile = mapProfileRow(row);
  const metrics = computeMetrics(profile);

  // ── Call Claude (Rule 4 + 5) ──────────────────────────────────────────────
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildCuisinePrompt(resolvedCuisine, profile, metrics);

  const meals = await callClaudeJSON(
    systemPrompt,
    userPrompt,
    MealsBySlotSchema,
    8000
  );

  return NextResponse.json(meals);
}
