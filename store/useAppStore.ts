'use client';
// ============================================================
// FitOS — Zustand client store
// Client UI state ONLY — no profile, no auth, no sensitive data.
// weekPlan persisted to localStorage only.
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  MealsBySlot,
  Meal,
  TrainingPlan,
  WeekPlan,
  GoalMode,
  DayName,
  MealSlot,
} from '@/lib/types';

// ── Empty defaults ────────────────────────────────────────────────────────────
const EMPTY_MEALS: MealsBySlot = { b: [], l: [], d: [] };

const DAYS: DayName[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const EMPTY_WEEK_PLAN: WeekPlan = Object.fromEntries(
  DAYS.map((day) => [day, { b: null, l: null, d: null }])
) as WeekPlan;

// ── Store interface ───────────────────────────────────────────────────────────
interface AppStore {
  // Generated meal pools (session — clears on reload)
  cuisineMeals: MealsBySlot;
  ingrMeals: MealsBySlot;
  allMeals: Meal[];

  // Training plan (session cache)
  trainPlan: TrainingPlan | null;

  // Week plan (persisted to localStorage)
  weekPlan: WeekPlan;

  // UI selections
  selectedGoal: GoalMode;
  activeCuisine: string | null;
  activeIngredients: string[];

  // ── Actions ───────────────────────────────────────────────────────────────
  setCuisineMeals: (meals: MealsBySlot, cuisine: string) => void;
  setIngrMeals: (meals: MealsBySlot) => void;
  setTrainPlan: (plan: TrainingPlan) => void;
  setSelectedGoal: (goal: GoalMode) => void;
  addIngredient: (ingredient: string) => void;
  removeIngredient: (ingredient: string) => void;
  clearIngredients: () => void;

  // Planner actions
  assignMealToSlot: (day: DayName, slot: MealSlot, meal: Meal) => void;
  removeMealFromSlot: (day: DayName, slot: MealSlot) => void;
  clearWeekPlan: () => void;
  autoFillPlan: () => void;
}

// ── Store implementation ──────────────────────────────────────────────────────
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      cuisineMeals: EMPTY_MEALS,
      ingrMeals: EMPTY_MEALS,
      allMeals: [],
      trainPlan: null,
      weekPlan: EMPTY_WEEK_PLAN,
      selectedGoal: 'recomp',
      activeCuisine: null,
      activeIngredients: [],

      setCuisineMeals: (meals, cuisine) => {
        // Tag meals with their slot type and merge into allMeals pool
        const tagged: Meal[] = [
          ...meals.b.map((m) => ({ ...m, mealType: 'b' as const })),
          ...meals.l.map((m) => ({ ...m, mealType: 'l' as const })),
          ...meals.d.map((m) => ({ ...m, mealType: 'd' as const })),
        ];
        set((state) => {
          // Merge without duplicates (by name)
          const existingNames = new Set(state.allMeals.map((m) => m.name));
          const newMeals = tagged.filter((m) => !existingNames.has(m.name));
          return {
            cuisineMeals: meals,
            activeCuisine: cuisine,
            allMeals: [...state.allMeals, ...newMeals],
          };
        });
      },

      setIngrMeals: (meals) => {
        const tagged: Meal[] = [
          ...meals.b.map((m) => ({ ...m, mealType: 'b' as const })),
          ...meals.l.map((m) => ({ ...m, mealType: 'l' as const })),
          ...meals.d.map((m) => ({ ...m, mealType: 'd' as const })),
        ];
        set((state) => {
          const existingNames = new Set(state.allMeals.map((m) => m.name));
          const newMeals = tagged.filter((m) => !existingNames.has(m.name));
          return {
            ingrMeals: meals,
            allMeals: [...state.allMeals, ...newMeals],
          };
        });
      },

      setTrainPlan: (plan) => set({ trainPlan: plan }),
      setSelectedGoal: (goal) => set({ selectedGoal: goal }),

      addIngredient: (ingredient) => {
        const trimmed = ingredient.trim();
        if (!trimmed) return;
        set((state) => {
          if (state.activeIngredients.includes(trimmed)) return state;
          return { activeIngredients: [...state.activeIngredients, trimmed] };
        });
      },

      removeIngredient: (ingredient) =>
        set((state) => ({
          activeIngredients: state.activeIngredients.filter((i) => i !== ingredient),
        })),

      clearIngredients: () => set({ activeIngredients: [] }),

      assignMealToSlot: (day, slot, meal) =>
        set((state) => ({
          weekPlan: {
            ...state.weekPlan,
            [day]: { ...state.weekPlan[day], [slot]: meal },
          },
        })),

      removeMealFromSlot: (day, slot) =>
        set((state) => ({
          weekPlan: {
            ...state.weekPlan,
            [day]: { ...state.weekPlan[day], [slot]: null },
          },
        })),

      clearWeekPlan: () => set({ weekPlan: EMPTY_WEEK_PLAN }),

      autoFillPlan: () => {
        const { allMeals, weekPlan } = get();
        if (allMeals.length === 0) return;

        // Import variety check inline to avoid circular dep
        const countInPlan = (name: string, plan: WeekPlan): number => {
          let count = 0;
          for (const dayPlan of Object.values(plan)) {
            for (const meal of [dayPlan.b, dayPlan.l, dayPlan.d]) {
              if (meal?.name === name) count++;
            }
          }
          return count;
        };

        let newPlan = { ...weekPlan };

        for (const day of DAYS) {
          for (const slot of ['b', 'l', 'd'] as MealSlot[]) {
            if (newPlan[day][slot]) continue; // already filled

            // Filter by slot type preference, but fall back to any meal
            const slotMeals = allMeals.filter(
              (m) => m.mealType === slot && countInPlan(m.name, newPlan) < 2
            );
            const fallback = allMeals.filter(
              (m) => countInPlan(m.name, newPlan) < 2
            );
            const candidates = slotMeals.length > 0 ? slotMeals : fallback;

            if (candidates.length === 0) continue;

            const pick = candidates[Math.floor(Math.random() * candidates.length)];
            newPlan = {
              ...newPlan,
              [day]: { ...newPlan[day], [slot]: pick },
            };
          }
        }

        set({ weekPlan: newPlan });
      },
    }),

    {
      name: 'fitos-week-plan',
      storage: createJSONStorage(() => localStorage),
      // Only persist weekPlan — session data should reset on reload
      partialize: (state) => ({ weekPlan: state.weekPlan }),
    }
  )
);
