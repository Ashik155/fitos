// ============================================================
// FitOS — Ingredient-based meal generation API
// Rule 2: Profile loaded server-side from Supabase
// Rule 4: JSON parsed via callClaudeJSON + Zod
// ============================================================

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { computeMetrics } from '@/lib/macros';
import { mapProfileRow } from '@/lib/profile';
import { buildSystemPrompt } from '@/lib/prompts/system';
import { buildIngredientsPrompt } from '@/lib/prompts/ingredients';
import { callClaudeJSON } from '@/lib/claude';
import { MealsBySlotSchema } from '@/lib/schemas';

// Simple in-memory rate limit
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
  const ingredients: unknown = body.ingredients;

  if (!Array.isArray(ingredients)) {
    return NextResponse.json({ error: 'ingredients must be an array.' }, { status: 400 });
  }
  if (ingredients.length === 0) {
    return NextResponse.json({ error: 'At least one ingredient is required.' }, { status: 400 });
  }
  if (ingredients.length > 30) {
    return NextResponse.json({ error: 'Maximum 30 ingredients allowed.' }, { status: 400 });
  }

  // Sanitise: ensure each item is a short string
  const cleaned: string[] = ingredients
    .filter((i): i is string => typeof i === 'string' && i.trim().length > 0)
    .map((i) => i.trim().slice(0, 50));

  if (cleaned.length === 0) {
    return NextResponse.json({ error: 'No valid ingredients provided.' }, { status: 400 });
  }

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

  // ── Call Claude ───────────────────────────────────────────────────────────
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildIngredientsPrompt(cleaned, profile, metrics);

  const meals = await callClaudeJSON(
    systemPrompt,
    userPrompt,
    MealsBySlotSchema,
    3500
  );

  const totalCount = meals.b.length + meals.l.length + meals.d.length;

  return NextResponse.json({ ...meals, totalCount });
}
