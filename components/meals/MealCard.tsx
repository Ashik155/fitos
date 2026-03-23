'use client';

import { getVarietyStatus } from '@/lib/variety';
import type { Meal, WeekPlan } from '@/lib/types';

export default function MealCard({
  meal,
  weekPlan,
  onAdd,
}: {
  meal: Meal;
  weekPlan: WeekPlan;
  onAdd: () => void;
}) {
  const status = getVarietyStatus(meal.name, weekPlan);
  const blocked = status === 'blocked';

  return (
    <div
      className="card"
      style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '28px', flexShrink: 0 }}>{meal.emoji}</span>
        <div>
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '14px', lineHeight: 1.3 }}>{meal.name}</div>
          <div style={{ color: 'var(--muted2)', fontSize: '12px', marginTop: '2px' }}>{meal.sub}</div>
        </div>
      </div>

      {/* Macro pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        <MacroPill label="kcal" value={meal.kcal} color="var(--gold)" />
        <MacroPill label="P" value={`${meal.p}g`} color="var(--blue)" />
        <MacroPill label="C" value={`${meal.c}g`} color="var(--green)" />
        <MacroPill label="F" value={`${meal.f}g`} color="var(--red)" />
      </div>

      {/* Ingredients */}
      <div>
        <div style={{ fontSize: '11px', fontFamily: 'Syne', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
          Ingredients
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {meal.ingredients.slice(0, 5).map((ing) => (
            <div key={ing.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--text)' }}>{ing.name}</span>
              <span style={{ color: 'var(--muted2)' }}>{ing.qty}</span>
            </div>
          ))}
          {meal.ingredients.length > 5 && (
            <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
              +{meal.ingredients.length - 5} more
            </div>
          )}
        </div>
      </div>

      {/* Tip */}
      <div style={{ background: 'var(--s2)', borderRadius: '8px', padding: '10px 12px' }}>
        <span style={{ fontSize: '11px', fontFamily: 'Syne', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Tip </span>
        <span style={{ fontSize: '12px', color: 'var(--muted2)' }}>{meal.tip}</span>
      </div>

      {/* Add button */}
      <button
        onClick={onAdd}
        disabled={blocked}
        className={blocked ? 'btn-ghost' : 'btn-primary'}
        style={{ width: '100%', fontSize: '13px', padding: '9px' }}
      >
        {blocked ? '✗ Already in plan (2×)' : '+ Add to Plan'}
      </button>
    </div>
  );
}

function MacroPill({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <span style={{
      display: 'inline-flex', gap: '4px', alignItems: 'center',
      background: `${color}18`, borderRadius: '999px',
      padding: '3px 9px', fontSize: '12px',
    }}>
      <span style={{ fontFamily: 'Syne', fontWeight: 600, color, fontSize: '10px', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ color: 'var(--text)', fontWeight: 700 }}>{value}</span>
    </span>
  );
}
