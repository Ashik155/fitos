'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { canAddMeal, getVarietyMap, getVarietyStatus } from '@/lib/variety';
import Toast from '@/components/ui/Toast';
import type { DayName, MealSlot, Meal } from '@/lib/types';

const DAYS: DayName[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SLOTS: { id: MealSlot; label: string; icon: string }[] = [
  { id: 'b', label: 'Breakfast', icon: '🌅' },
  { id: 'l', label: 'Lunch', icon: '☀️' },
  { id: 'd', label: 'Dinner', icon: '🌙' },
];

export default function PlannerPage() {
  const { weekPlan, allMeals, assignMealToSlot, removeMealFromSlot, clearWeekPlan, autoFillPlan } = useAppStore();
  const [pickerOpen, setPickerOpen] = useState<{ day: DayName; slot: MealSlot } | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const allSlots = DAYS.flatMap((d) => SLOTS.map((s) => weekPlan[d][s.id]));
  const filledSlots = allSlots.filter(Boolean);
  const totalSlots = DAYS.length * SLOTS.length;
  const pctComplete = Math.round((filledSlots.length / totalSlots) * 100);
  const avgKcal = filledSlots.length > 0
    ? Math.round(filledSlots.reduce((sum, m) => sum + (m?.kcal ?? 0), 0) / filledSlots.length)
    : 0;
  const avgProtein = filledSlots.length > 0
    ? Math.round(filledSlots.reduce((sum, m) => sum + (m?.p ?? 0), 0) / filledSlots.length)
    : 0;

  const varietyMap = getVarietyMap(weekPlan);

  // Copy plan as text
  const copyPlan = () => {
    const lines: string[] = ['FitOS — Weekly Meal Plan', ''];
    DAYS.forEach((day) => {
      lines.push(`📅 ${day}`);
      SLOTS.forEach((slot) => {
        const meal = weekPlan[day][slot.id];
        lines.push(`  ${slot.icon} ${slot.label}: ${meal ? `${meal.name} (${meal.kcal} kcal, ${meal.p}g P)` : '—'}`);
      });
      lines.push('');
    });
    navigator.clipboard.writeText(lines.join('\n'));
    showToast('Plan copied to clipboard!');
  };

  const handlePickMeal = (meal: Meal) => {
    if (!pickerOpen) return;
    const { day, slot } = pickerOpen;
    if (!canAddMeal(meal.name, weekPlan)) {
      showToast(`"${meal.name}" is already in your plan twice (max 2×).`);
      return;
    }
    assignMealToSlot(day, slot, meal);
    setPickerOpen(null);
  };

  // Filter meals for picker
  const pickerMeals = allMeals.filter((m) => getVarietyStatus(m.name, weekPlan) !== 'blocked');
  const slotFiltered = pickerOpen
    ? pickerMeals.filter((m) => !m.mealType || m.mealType === pickerOpen.slot)
    : [];
  const pickerList = slotFiltered.length > 0 ? slotFiltered : pickerMeals;

  return (
    <div className="fade-up" style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'Clash Display', fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>
            Weekly Meal Planner
          </h1>
          <p style={{ color: 'var(--muted2)', fontSize: '14px' }}>
            Assign meals to slots. Max 2× same meal per week is enforced.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => { autoFillPlan(); showToast('Plan auto-filled!'); }} className="btn-ghost" style={{ fontSize: '13px', padding: '9px 16px' }}>
            ✨ Auto-Fill
          </button>
          <button onClick={copyPlan} className="btn-ghost" style={{ fontSize: '13px', padding: '9px 16px' }}>
            📋 Copy
          </button>
          <button onClick={() => { clearWeekPlan(); showToast('Plan cleared.'); }} className="btn-ghost" style={{ fontSize: '13px', padding: '9px 16px', color: 'var(--red)' }}>
            🗑 Clear
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Slots Filled', value: `${filledSlots.length}/${totalSlots}`, color: 'var(--gold)' },
          { label: 'Avg Calories', value: avgKcal > 0 ? `${avgKcal}` : '—', color: 'var(--orange)' },
          { label: 'Avg Protein', value: avgProtein > 0 ? `${avgProtein}g` : '—', color: 'var(--blue)' },
          { label: 'Complete', value: `${pctComplete}%`, color: 'var(--green)' },
        ].map((stat) => (
          <div key={stat.label} style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '10px', fontFamily: 'Syne', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              {stat.label}
            </div>
            <div style={{ fontFamily: 'Clash Display', fontSize: '22px', fontWeight: 700, color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Variety tracker */}
      {Object.keys(varietyMap).length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div className="section-label" style={{ marginBottom: '10px' }}>VARIETY TRACKER</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {Object.entries(varietyMap).map(([name, count]) => {
              const color = count >= 2 ? 'var(--red)' : count === 1 ? 'var(--orange)' : 'var(--green)';
              return (
                <span key={name} style={{
                  background: `${color}15`, border: `1px solid ${color}40`,
                  borderRadius: '999px', padding: '4px 10px',
                  fontSize: '12px', fontFamily: 'Syne', fontWeight: 600, color,
                }}>
                  {name} ×{count}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Week grid — horizontal scroll on mobile */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `120px repeat(${DAYS.length}, 1fr)`, gap: '4px', minWidth: '900px' }}>
          {/* Header row */}
          <div />
          {DAYS.map((day) => (
            <div key={day} style={{ textAlign: 'center', padding: '10px 0', fontFamily: 'Syne', fontWeight: 700, fontSize: '13px', color: 'var(--muted2)' }}>
              {day}
            </div>
          ))}

          {/* Slot rows */}
          {SLOTS.map((slot) => (
            <>
              {/* Row label */}
              <div key={slot.id + '_label'} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 0', fontFamily: 'Syne', fontWeight: 600, fontSize: '12px', color: 'var(--muted2)',
              }}>
                <span>{slot.icon}</span> {slot.label}
              </div>

              {/* Day cells */}
              {DAYS.map((day) => {
                const meal = weekPlan[day][slot.id];
                return (
                  <div key={day + slot.id}
                    onClick={() => !meal && setPickerOpen({ day, slot: slot.id })}
                    style={{
                      minHeight: '80px', borderRadius: '10px', padding: '8px',
                      border: `1px solid ${meal ? 'var(--border2)' : 'var(--border)'}`,
                      background: meal ? 'var(--s1)' : 'var(--s2)',
                      cursor: meal ? 'default' : 'pointer',
                      transition: 'all 0.15s', position: 'relative',
                    }}
                  >
                    {meal ? (
                      <div style={{ height: '100%' }}>
                        <div style={{ fontSize: '16px', marginBottom: '4px' }}>{meal.emoji}</div>
                        <div style={{ fontSize: '11px', fontFamily: 'Syne', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
                          {meal.name}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--muted2)', marginTop: '2px' }}>{meal.kcal} kcal</div>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeMealFromSlot(day, slot.id); }}
                          style={{
                            position: 'absolute', top: '6px', right: '6px',
                            background: 'var(--s3)', border: 'none', borderRadius: '50%',
                            width: '18px', height: '18px', cursor: 'pointer',
                            color: 'var(--muted2)', fontSize: '12px', lineHeight: 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)', fontSize: '20px' }}>
                        +
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      {allMeals.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted2)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🍽️</div>
          <p style={{ fontSize: '15px', marginBottom: '8px' }}>No meals generated yet</p>
          <p style={{ fontSize: '13px' }}>Go to <strong>By Cuisine</strong> or <strong>By Ingredients</strong> to generate meals, then come back here to plan your week.</p>
        </div>
      )}

      {/* Meal picker modal */}
      {pickerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={() => setPickerOpen(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} />
          <div style={{
            position: 'relative', width: '100%', maxHeight: '70vh',
            background: 'var(--s1)', borderTopLeftRadius: '20px', borderTopRightRadius: '20px',
            padding: '24px', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'Clash Display', fontSize: '18px', fontWeight: 700 }}>
                Pick a meal for {pickerOpen.day} {SLOTS.find(s => s.id === pickerOpen.slot)?.label}
              </h3>
              <button onClick={() => setPickerOpen(null)} style={{ background: 'none', border: 'none', color: 'var(--muted2)', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>
            {pickerList.length === 0 ? (
              <p style={{ color: 'var(--muted2)', textAlign: 'center', padding: '24px' }}>No available meals. Generate some first.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                {pickerList.map((meal) => {
                  const status = getVarietyStatus(meal.name, weekPlan);
                  return (
                    <button
                      key={meal.name}
                      onClick={() => handlePickMeal(meal)}
                      style={{
                        textAlign: 'left', padding: '12px', borderRadius: '10px',
                        border: '1px solid var(--border)', background: 'var(--s2)',
                        cursor: 'pointer', transition: 'all 0.12s',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '20px' }}>{meal.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '13px' }}>{meal.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--muted2)' }}>{meal.kcal} kcal · {meal.p}g P</div>
                        </div>
                        {status === 'warn' && (
                          <span style={{ fontSize: '10px', background: 'rgba(251,146,60,0.15)', color: 'var(--orange)', borderRadius: '999px', padding: '2px 7px', fontWeight: 600 }}>
                            ×1
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}
