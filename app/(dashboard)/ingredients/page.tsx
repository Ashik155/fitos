'use client';

import { useState, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { canAddMeal } from '@/lib/variety';
import MealCard from '@/components/meals/MealCard';
import MealCardSkeleton from '@/components/meals/MealCardSkeleton';
import Toast from '@/components/ui/Toast';
import type { Meal } from '@/lib/types';

const QUICK_ADD = [
  'Chicken breast', 'Eggs', 'Rice', 'Oats', 'Salmon', 'Greek yogurt',
  'Sweet potato', 'Broccoli', 'Spinach', 'Cottage cheese', 'Tuna',
  'Lentils', 'Quinoa', 'Beef mince', 'Tofu', 'Chickpeas',
  'Banana', 'Blueberries', 'Almonds', 'Peanut butter', 'Milk', 'Whey protein',
];

const TABS = [
  { id: 'b' as const, label: 'Breakfast', icon: '🌅' },
  { id: 'l' as const, label: 'Lunch', icon: '☀️' },
  { id: 'd' as const, label: 'Dinner', icon: '🌙' },
];

export default function IngredientsPage() {
  const { ingrMeals, weekPlan, setIngrMeals, activeIngredients, addIngredient, removeIngredient, clearIngredients, assignMealToSlot } = useAppStore();
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'b' | 'l' | 'd'>('b');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [totalFound, setTotalFound] = useState<{ b: number; l: number; d: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      addIngredient(input.trim());
      setInput('');
    }
  };

  const handleGenerate = async () => {
    if (activeIngredients.length === 0) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/meals/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: activeIngredients }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Generation failed'); }
      const data = await res.json();
      setIngrMeals({ b: data.b, l: data.l, d: data.d });
      setTotalFound({ b: data.b.length, l: data.l.length, d: data.d.length });
      setActiveTab('b');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlan = (meal: Meal, slot: 'b' | 'l' | 'd') => {
    if (!canAddMeal(meal.name, weekPlan)) { showToast(`"${meal.name}" is already in your plan twice.`); return; }
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
    const emptyDay = days.find((d) => !weekPlan[d][slot]);
    if (!emptyDay) { showToast('All slots of that type are filled.'); return; }
    assignMealToSlot(emptyDay, slot, meal);
    showToast(`Added "${meal.name}" to plan.`);
  };

  const hasMeals = ingrMeals.b.length > 0 || ingrMeals.l.length > 0 || ingrMeals.d.length > 0;
  const currentMeals = ingrMeals[activeTab] ?? [];

  return (
    <div className="fade-up" style={{ maxWidth: '1100px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'Clash Display', fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>
          Ingredient-Based Meals
        </h1>
        <p style={{ color: 'var(--muted2)', fontSize: '14px' }}>
          Tell us what's in your fridge — AI builds meals from exactly what you have.
        </p>
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type ingredient + Enter to add (e.g. chicken breast)"
          style={{ flex: 1 }}
        />
        <button
          onClick={() => { if (input.trim()) { addIngredient(input.trim()); setInput(''); } }}
          className="btn-primary"
          style={{ padding: '10px 20px', flexShrink: 0 }}
          disabled={!input.trim()}
        >
          Add
        </button>
      </div>

      {/* Quick-add chips */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', fontFamily: 'Syne', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
          Quick Add
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {QUICK_ADD.map((item) => {
            const active = activeIngredients.includes(item);
            return (
              <button
                key={item}
                onClick={() => active ? removeIngredient(item) : addIngredient(item)}
                style={{
                  padding: '5px 12px', borderRadius: '999px', fontSize: '12px',
                  fontFamily: 'Syne', fontWeight: 600, cursor: 'pointer',
                  border: `1px solid ${active ? 'var(--teal)' : 'var(--border)'}`,
                  background: active ? 'rgba(45,212,191,0.1)' : 'transparent',
                  color: active ? 'var(--teal)' : 'var(--muted2)',
                  transition: 'all 0.12s',
                }}
              >
                {active ? '✓ ' : ''}{item}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected ingredient tags */}
      {activeIngredients.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'Syne', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Your Ingredients ({activeIngredients.length})
            </div>
            <button onClick={clearIngredients} style={{ background: 'none', border: 'none', color: 'var(--muted2)', fontSize: '12px', cursor: 'pointer', fontFamily: 'Syne' }}>
              Clear all
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {activeIngredients.map((ing) => (
              <span
                key={ing}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'var(--s2)', border: '1px solid var(--border2)',
                  borderRadius: '999px', padding: '5px 12px',
                  fontSize: '13px', fontFamily: 'Syne', fontWeight: 600,
                }}
              >
                {ing}
                <button
                  onClick={() => removeIngredient(ing)}
                  style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: 0 }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Find Meals button */}
      <button
        onClick={handleGenerate}
        disabled={activeIngredients.length === 0 || loading}
        className="btn-primary"
        style={{ marginBottom: '24px', padding: '14px 32px', fontSize: '15px' }}
      >
        {loading ? 'Finding meals...' : `Find Meals from ${activeIngredients.length} ingredient${activeIngredients.length !== 1 ? 's' : ''}`}
      </button>

      {error && (
        <div style={{
          background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
          borderRadius: '10px', padding: '12px 16px', color: 'var(--red)', marginBottom: '20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          {error}
          <button onClick={handleGenerate} disabled={loading} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>
            Retry →
          </button>
        </div>
      )}

      {/* Result summary */}
      {totalFound && (
        <div style={{
          background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)',
          borderRadius: '10px', padding: '12px 16px', marginBottom: '20px',
          display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap',
        }}>
          <span style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--teal)' }}>
            Found {totalFound.b + totalFound.l + totalFound.d} meals
          </span>
          <span style={{ color: 'var(--muted2)', fontSize: '13px' }}>
            {totalFound.b} Breakfast · {totalFound.l} Lunch · {totalFound.d} Dinner
          </span>
        </div>
      )}

      {/* Tabs + meals */}
      {(hasMeals || loading) && (
        <>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'var(--s2)', borderRadius: '12px', padding: '4px', width: 'fit-content' }}>
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '9px 20px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                  background: activeTab === tab.id ? 'var(--s1)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--text)' : 'var(--muted2)',
                  fontFamily: 'Syne', fontWeight: 600, fontSize: '14px', transition: 'all 0.15s',
                }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <MealCardSkeleton key={i} />)
              : currentMeals.map((meal) => (
                  <MealCard key={meal.name} meal={meal} weekPlan={weekPlan} onAdd={() => handleAddToPlan(meal, activeTab)} />
                ))}
          </div>
        </>
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}
