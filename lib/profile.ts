// Shared profile mapper — Supabase row → UserProfile
import type { UserProfile } from '@/lib/types';

export function mapProfileRow(row: Record<string, unknown>): UserProfile {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    fullName: row.full_name as string,
    age: row.age as number,
    sex: row.sex as 'male' | 'female',
    weightKg: parseFloat(String(row.weight_kg)),
    heightCm: parseFloat(String(row.height_cm)),
    goal: row.goal as UserProfile['goal'],
    mealsPerDay: row.meals_per_day as UserProfile['mealsPerDay'],
    restrictions: (row.restrictions as string[]) ?? [],
    additionalRestrictions: (row.additional_restrictions as string) ?? '',
    trainingDays: row.training_days as number,
    experience: row.experience as UserProfile['experience'],
    split: row.split as UserProfile['split'],
    unitPreference: (row.unit_preference as UserProfile['unitPreference']) ?? 'metric',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
