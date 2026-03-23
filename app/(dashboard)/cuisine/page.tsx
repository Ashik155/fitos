'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { canAddMeal } from '@/lib/variety';
import MealCard from '@/components/meals/MealCard';
import MealCardSkeleton from '@/components/meals/MealCardSkeleton';
import Toast from '@/components/ui/Toast';
import type { Meal } from '@/lib/types';

const CUISINES = [
  { id: 'Indian', icon: '🫕', label: 'Indian' },
  { id: 'Japanese', icon: '🍱', label: 'Japanese' },
  { id: 'Mediterranean', icon: '🥗', label: 'Mediterranean' },
  { id: 'Mexican', icon: '🌮', label: 'Mexican' },
  { id: 'Chinese', icon: '🥢', label: 'Chinese' },
  { id: 'Thai', icon: '🍜', label: 'Thai' },
  { id: 'Italian', icon: '🍝', label: 'Italian' },
  { id: 'Korean', icon: '🥘', label: 'Korean' },
  { id: 'Middle Eastern', icon: '🧆', label: 'Middle Eastern' },
  { id: 'Turkish', icon: '🫔', label: 'Turkish' },
  { id: 'Surprise Me', icon: '🎲', label: 'Surprise Me' },
];

const TABS = [
  { id: 'b', label: 'Breakfast', icon: '🌅' },
  { id: 'l', label: 'Lunch', icon: '☀️' },
  { id: 'd', label: 'Dinner', icon: '🌙' },
] as const;

type TabId = 'b' | 'l' | 'd';

export default function CuisinePage() {
  const { cuisineMeals, weekPlan, setCuisineMeals, assignMealToSlot } = useAppStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('b');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const hasMeals = cuisineMeals.b.length > 0 || cuisineMeals.l.length > 0 || cuisineMeals.d.length > 0;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleGenerate = async () => {
    if (!selected) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/meals/cuisine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cuisine: selected }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Generation failed');
      }

      const meals = await res.json();
      setCuisineMeals(meals, selected);
      setActiveTab('b');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlan = (meal: Meal, slot: TabId) => {
    if (!canAddMeal(meal.name, weekPlan)) {
      showToast(`"${meal.name}" is already in your plan twice. Max 2× per week.`);
      return;
    }
    // Find first empty slot of this type in the week
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
    const emptyDay = days.find((d) => !weekPlan[d][slot]);
    if (!emptyDay) {
      showToast(`All ${slot === 'b' ? 'breakfast' : slot === 'l' ? 'lunch' : 'dinner'} slots are filled.`);
      return;
    }
    assignMealToSlot(emptyDay, slot, meal);
    showToast(`Added "${meal.name}" to ${emptyDay} ${slot === 'b' ? 'breakfast' : slot === 'l' ? 'lunch' : 'dinner'}.`);
  };

  const currentMeals = cuisineMeals[activeTab] ?? [];

  return (
    <div className="fade-up" style={{ maxWidth: '1100px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'Clash Display', fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>
          Cuisine Meal Generator
        </h1>
        <p style={{ color: 'var(--muted2)', fontSize: '14px' }}>
          Pick a cuisine and AI generates 21 meals calibrated to your exact macro targets.
        </p>
      </div>

      {/* Cuisine grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginBottom: '24px' }}>
        {CUISINES.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c.id)}
            style={{
              padding: '16px 8px',
              borderRadius: '12px',
              border: `2px solid ${selected === c.id ? 'var(--gold)' : 'var(--border)'}`,
              background: selected === c.id ? 'rgba(232,194,122,0.08)' : 'var(--s1)',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>{c.icon}</div>
            <div style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: '13px', color: selected === c.id ? 'var(--gold)' : 'var(--text)' }}>
              {c.label}
            </div>
          </button>
        ))}
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={!selected || loading}
        className="btn-primary"
        style={{ marginBottom: '28px', padding: '14px 32px', fontSize: '15px' }}
      >
        {loading ? 'Generating...' : selected ? `Generate ${selected} Meals` : 'Select a cuisine first'}
      </button>

      {error && (
        <div style={{
          background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
          borderRadius: '10px', padding: '12px 16px', color: 'var(--red)',
          marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          {error}
          <button onClick={handleGenerate} disabled={loading} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>
            Retry →
          </button>
        </div>
      )}

      {/* Tabs */}
      {(hasMeals || loading) && (
        <>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'var(--s2)', borderRadius: '12px', padding: '4px', width: 'fit-content' }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '9px 20px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                  background: activeTab === tab.id ? 'var(--s1)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--text)' : 'var(--muted2)',
                  fontFamily: 'Syne', fontWeight: 600, fontSize: '14px',
                  transition: 'all 0.15s',
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Meal grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {loading
              ? Array.from({ length: 7 }).map((_, i) => <MealCardSkeleton key={i} />)
              : currentMeals.map((meal) => (
                  <MealCard
                    key={meal.name}
                    meal={meal}
                    weekPlan={weekPlan}
                    onAdd={() => handleAddToPlan(meal, activeTab)}
                  />
                ))}
          </div>
        </>
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}
