// ============================================================
// FitOS — Profile API route
// Rule 2: Profile always loaded from Supabase using session.
// Rule 9: Uses anon key only (RLS enforced).
// ============================================================

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { computeMetrics } from '@/lib/macros';
import { mapProfileRow } from '@/lib/profile';

// GET /api/profile — return current user's profile + computed metrics
export async function GET() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: row, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (error || !row) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const profile = mapProfileRow(row);
  const metrics = computeMetrics(profile);

  return NextResponse.json({ profile, metrics });
}

// POST /api/profile — create profile from onboarding
export async function POST(request: Request) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const { error } = await supabase.from('profiles').insert({
    user_id: session.user.id,
    full_name: body.fullName,
    age: body.age,
    sex: body.sex,
    weight_kg: body.weightKg,
    height_cm: body.heightCm,
    goal: body.goal,
    meals_per_day: body.mealsPerDay,
    restrictions: body.restrictions ?? [],
    additional_restrictions: body.additionalRestrictions ?? '',
    training_days: body.trainingDays,
    experience: body.experience,
    split: body.split,
    unit_preference: body.unitPreference ?? 'metric',
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

// PATCH /api/profile — update profile fields
export async function PATCH(request: Request) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Build update payload (only accepted fields — never trust user_id from body)
  const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.fullName !== undefined) updatePayload.full_name = body.fullName;
  if (body.age !== undefined) updatePayload.age = body.age;
  if (body.sex !== undefined) updatePayload.sex = body.sex;
  if (body.weightKg !== undefined) updatePayload.weight_kg = body.weightKg;
  if (body.heightCm !== undefined) updatePayload.height_cm = body.heightCm;
  if (body.goal !== undefined) updatePayload.goal = body.goal;
  if (body.mealsPerDay !== undefined) updatePayload.meals_per_day = body.mealsPerDay;
  if (body.restrictions !== undefined) updatePayload.restrictions = body.restrictions;
  if (body.additionalRestrictions !== undefined) updatePayload.additional_restrictions = body.additionalRestrictions;
  if (body.trainingDays !== undefined) updatePayload.training_days = body.trainingDays;
  if (body.experience !== undefined) updatePayload.experience = body.experience;
  if (body.split !== undefined) updatePayload.split = body.split;
  if (body.unitPreference !== undefined) updatePayload.unit_preference = body.unitPreference;

  const { data: row, error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('user_id', session.user.id)
    .select('*')
    .single();

  if (error || !row) {
    return NextResponse.json({ error: error?.message ?? 'Update failed' }, { status: 500 });
  }

  const profile = mapProfileRow(row);
  const metrics = computeMetrics(profile);

  return NextResponse.json({ profile, metrics });
}
