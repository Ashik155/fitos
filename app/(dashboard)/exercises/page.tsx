'use client';

import { useState } from 'react';
import { EXERCISES, MUSCLE_CATEGORIES } from '@/lib/exercises';

export default function ExercisesPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? EXERCISES
    : EXERCISES.filter((ex) => ex.category === activeCategory);

  return (
    <div className="fade-up" style={{ maxWidth: '1100px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'Clash Display', fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>
          Exercise Library
        </h1>
        <p style={{ color: 'var(--muted2)', fontSize: '14px' }}>
          {EXERCISES.length} exercises with sets, reps, RPE targets, and form cues.
        </p>
      </div>

      {/* Muscle filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
        {MUSCLE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '8px 16px', borderRadius: '999px', cursor: 'pointer', border: 'none',
              background: activeCategory === cat ? 'var(--teal)' : 'var(--s2)',
              color: activeCategory === cat ? '#090b0e' : 'var(--muted2)',
              fontFamily: 'Syne', fontWeight: 700, fontSize: '13px', transition: 'all 0.15s',
            }}
          >
            {cat} {activeCategory === cat && cat !== 'All' && `(${filtered.length})`}
          </button>
        ))}
      </div>

      {/* Exercise grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
        {filtered.map((ex) => (
          <div key={ex.name} className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{ex.name}</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className="pill" style={{ background: 'rgba(91,141,238,0.12)', color: 'var(--blue)', fontSize: '11px' }}>
                    {ex.muscle}
                  </span>
                  <span className="pill" style={{ background: ex.type === 'Compound' ? 'rgba(45,212,191,0.1)' : 'rgba(167,139,250,0.1)', color: ex.type === 'Compound' ? 'var(--teal)' : 'var(--purple)', fontSize: '11px' }}>
                    {ex.type}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '6px', marginBottom: '10px' }}>
              {[
                { label: 'Sets', value: ex.sets, color: 'var(--gold)' },
                { label: 'Reps', value: ex.reps, color: 'var(--green)' },
                { label: 'Rest', value: ex.rest, color: 'var(--muted2)' },
                { label: 'RPE', value: ex.rpe, color: ex.rpe >= '8' ? 'var(--orange)' : 'var(--teal)' },
              ].map((item) => (
                <div key={item.label} style={{ background: 'var(--s2)', borderRadius: '8px', padding: '6px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '9px', fontFamily: 'Syne', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    {item.label}
                  </div>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '12px', color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Form note */}
            <div style={{ fontSize: '12px', color: 'var(--muted2)', lineHeight: 1.5, background: 'var(--s2)', borderRadius: '8px', padding: '8px 10px' }}>
              <span style={{ fontWeight: 700, color: 'var(--muted)', fontFamily: 'Syne', fontSize: '10px', textTransform: 'uppercase' }}>Form: </span>
              {ex.note}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
