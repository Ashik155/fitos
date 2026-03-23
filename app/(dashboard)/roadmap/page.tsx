'use client';

import { useState, useEffect } from 'react';
import { computeMetrics } from '@/lib/macros';
import type { UserProfile, ComputedMetrics, GoalMode } from '@/lib/types';

const GOAL_LABELS: Record<GoalMode, string> = {
  recomp: 'Recomposition',
  cut: 'Fat Loss',
  bulk: 'Muscle Gain',
};

const MILESTONES: Record<GoalMode, { week: number; title: string; detail: string }[]> = {
  recomp: [
    { week: 1, title: 'Baseline established', detail: 'Photos, measurements and lifts logged. Nutrition dialled in.' },
    { week: 2, title: 'Neural adaptation', detail: 'Strength increases begin — mostly neurological. Fat stores mobilising.' },
    { week: 4, title: 'First visible changes', detail: 'Slight tightening in waist. Muscles appear more defined. Scale stable.' },
    { week: 6, title: 'Momentum phase', detail: 'Progressive overload clear on main lifts. Energy levels improved.' },
    { week: 8, title: 'Deload week', detail: 'Reduce volume 40%. Let adaptations consolidate. Sleep prioritised.' },
    { week: 10, title: 'Composition shift', detail: 'Photos show clear change vs week 1. Clothes fitting differently.' },
    { week: 12, title: 'Strength milestone', detail: 'Significant strength increase on primary lifts. Muscle visible under lower bodyfat.' },
    { week: 16, title: 'Transformation complete', detail: 'Full recomp phase done. Reassess goal. Maintain or begin dedicated bulk/cut.' },
  ],
  cut: [
    { week: 1, title: 'Deficit established', detail: 'Calories set, protein elevated. First week often shows water weight drop.' },
    { week: 2, title: 'True fat loss begins', detail: 'After water weight, real fat loss of ~0.5kg/week begins.' },
    { week: 4, title: 'Noticeable changes', detail: 'Face, waist, and abdomen showing early changes. Strength maintained.' },
    { week: 6, title: 'Energy management', detail: 'Carb timing optimised around training. NEAT awareness key.' },
    { week: 8, title: 'Diet break or deload', detail: 'One week at maintenance to reset hormones and maintain performance.' },
    { week: 10, title: 'Visible definition', detail: 'Muscle separation visible. Vascularity increasing for leaner individuals.' },
    { week: 12, title: 'Major milestone', detail: '6-8% bodyweight potentially lost. Most individuals reach goal physique.' },
    { week: 16, title: 'Maintenance transition', detail: 'Reverse diet begins. Slowly increase calories to find new maintenance.' },
  ],
  bulk: [
    { week: 1, title: 'Surplus established', detail: 'Calories above maintenance. Body adapts to higher food volume.' },
    { week: 2, title: 'Performance boost', detail: 'Training performance noticeably improves — more fuel available.' },
    { week: 4, title: 'First size gains', detail: 'Pump is more visible. Muscles appear fuller. Progressive overload kicking in.' },
    { week: 6, title: 'Strength plateau broken', detail: 'Old PRs surpassed. New strength levels established on main compounds.' },
    { week: 8, title: 'Deload week', detail: 'Reduce volume 40%. Allow connective tissue and CNS to fully recover.' },
    { week: 10, title: 'Hypertrophy visible', detail: 'Real muscle gain measurable. Bodyfat slightly increased — expected.' },
    { week: 12, title: 'Strength peak', detail: 'All-time PRs on squat, bench, row. Body adapting to heavier loads.' },
    { week: 16, title: 'Bulk complete', detail: 'Estimated 2-4kg lean muscle gained. Begin mini-cut to reveal gains.' },
  ],
};

const HABITS = [
  { icon: '💪', title: 'Progressive Overload', body: 'Add reps, then weight, then sets. Record every session.' },
  { icon: '🥩', title: 'Hit Protein Daily', body: 'Every meal contains a protein source. Non-negotiable.' },
  { icon: '😴', title: '7.5–9h Sleep', body: 'Where the gains actually happen. No sleep = no recovery = no progress.' },
  { icon: '💧', title: 'Hydration', body: '3–4L on training days. Add 500ml per hour of intense exercise.' },
  { icon: '📊', title: 'Weekly Check-in', body: 'Weigh 3× weekly (average). Progress photos every 4 weeks.' },
  { icon: '🧘', title: 'Manage Stress', body: 'High cortisol impairs fat loss and muscle gain. Sleep and deloads help.' },
];

export default function RoadmapPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [metrics, setMetrics] = useState<ComputedMetrics | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<GoalMode>('recomp');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        if (data.profile) {
          setProfile(data.profile);
          setMetrics(data.metrics);
          setSelectedGoal(data.profile.goal);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const milestones = MILESTONES[selectedGoal];
  const currentWeek = 1; // In a real app, this would be computed from profile.createdAt

  if (loading) {
    return (
      <div style={{ maxWidth: '900px' }}>
        {[200, 120, 300, 400].map((h, i) => (
          <div key={i} className="skeleton" style={{ height: `${h}px`, borderRadius: '16px', marginBottom: '20px' }} />
        ))}
      </div>
    );
  }

  return (
    <div className="fade-up" style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'Clash Display', fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>
          16-Week Progress Roadmap
        </h1>
        <p style={{ color: 'var(--muted2)', fontSize: '14px' }}>
          Your transformation timeline based on your body stats and goal.
        </p>
      </div>

      {/* Goal toggle */}
      <div style={{ display: 'flex', background: 'var(--s2)', borderRadius: '12px', padding: '4px', marginBottom: '28px', width: 'fit-content' }}>
        {(['recomp', 'cut', 'bulk'] as GoalMode[]).map((g) => (
          <button key={g} onClick={() => setSelectedGoal(g)}
            style={{
              padding: '10px 20px', borderRadius: '9px', border: 'none', cursor: 'pointer',
              background: selectedGoal === g ? 'var(--s1)' : 'transparent',
              color: selectedGoal === g ? 'var(--gold)' : 'var(--muted2)',
              fontFamily: 'Syne', fontWeight: 700, fontSize: '13px', transition: 'all 0.15s',
            }}
          >
            {GOAL_LABELS[g]}
          </button>
        ))}
      </div>

      {/* Body stat cards */}
      {profile && metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginBottom: '28px' }}>
          {[
            { label: 'Weight', value: profile.unitPreference === 'imperial' ? `${metrics.weightLbs.toFixed(1)} lbs` : `${profile.weightKg} kg`, color: 'var(--text)' },
            { label: 'Height', value: `${profile.heightCm} cm`, color: 'var(--text)' },
            { label: 'BMI', value: metrics.bmi.toString(), color: metrics.bmi < 18.5 || metrics.bmi > 25 ? 'var(--orange)' : 'var(--green)' },
            { label: 'Est. Body Fat', value: `${metrics.estimatedBfPct}%`, color: 'var(--muted2)' },
            { label: 'Lean Mass', value: `${metrics.leanMassKg} kg`, color: 'var(--blue)' },
            { label: 'Target', value: `${metrics.targetKcal} kcal`, color: 'var(--gold)' },
          ].map((stat) => (
            <div key={stat.label} className="card" style={{ padding: '14px' }}>
              <div style={{ fontSize: '10px', fontFamily: 'Syne', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
                {stat.label}
              </div>
              <div style={{ fontFamily: 'Clash Display', fontSize: '20px', fontWeight: 700, color: stat.color }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calorie math */}
      {metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', marginBottom: '28px' }}>
          {[
            {
              icon: '🔥', title: 'Calorie Setup',
              points: [
                `Maintenance: ${metrics.maintenanceKcal} kcal`,
                `Target: ${metrics.targetKcal} kcal`,
                selectedGoal === 'cut' ? `Deficit: ${metrics.maintenanceKcal - metrics.targetKcal} kcal` :
                selectedGoal === 'bulk' ? `Surplus: ${metrics.targetKcal - metrics.maintenanceKcal} kcal` :
                'At maintenance (0% adjustment)',
              ],
            },
            {
              icon: '📈', title: 'Rate of Change',
              points: [
                selectedGoal === 'cut' ? 'Target: −0.5 to −1kg/week' :
                selectedGoal === 'bulk' ? 'Expect: +0.5–1 kg/month' :
                'Scale: minimal change',
                selectedGoal === 'recomp' ? 'Fat: −0.5–1 kg/month' : `Over 16 weeks: ${selectedGoal === 'cut' ? '−4 to −8 kg' : '+2–4 kg lean mass'}`,
                'Measure with photos, not just scales',
              ],
            },
            {
              icon: '💪', title: 'Macro Targets',
              points: [
                `Protein: ${metrics.proteinG}g/day`,
                `Carbs: ${metrics.carbsG}g/day`,
                `Fats: ${metrics.fatG}g/day`,
              ],
            },
          ].map((card) => (
            <div key={card.title} className="card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{card.icon}</div>
              <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '13px', marginBottom: '10px' }}>{card.title}</div>
              {card.points.map((p, i) => (
                <div key={i} style={{ fontSize: '12px', color: 'var(--muted2)', marginBottom: '4px', lineHeight: 1.4 }}>• {p}</div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* 16-week timeline */}
      <div className="section-label" style={{ marginBottom: '20px' }}>16-WEEK MILESTONE TIMELINE</div>
      <div style={{ position: 'relative', paddingLeft: '32px' }}>
        {/* Vertical line */}
        <div style={{ position: 'absolute', left: '11px', top: 0, bottom: 0, width: '2px', background: 'var(--s3)' }} />

        {milestones.map((milestone, i) => {
          const isDone = milestone.week < currentWeek;
          const isCurrent = milestone.week === currentWeek;
          return (
            <div key={milestone.week} style={{ position: 'relative', marginBottom: '24px' }}>
              {/* Dot */}
              <div style={{
                position: 'absolute', left: '-26px', top: '3px',
                width: '14px', height: '14px', borderRadius: '50%',
                background: isDone ? 'var(--green)' : isCurrent ? 'var(--gold)' : 'var(--s3)',
                border: `2px solid ${isDone ? 'var(--green)' : isCurrent ? 'var(--gold)' : 'var(--border2)'}`,
                transition: 'all 0.3s',
              }} />
              <div style={{
                background: 'var(--s1)', border: `1px solid ${isCurrent ? 'var(--gold)' : 'var(--border)'}`,
                borderRadius: '12px', padding: '14px 16px',
                opacity: isDone ? 0.6 : 1,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '14px', color: isCurrent ? 'var(--gold)' : 'var(--text)' }}>
                    {milestone.title}
                  </div>
                  <span className="pill" style={{
                    background: isCurrent ? 'rgba(232,194,122,0.15)' : 'rgba(255,255,255,0.04)',
                    color: isCurrent ? 'var(--gold)' : 'var(--muted2)',
                    fontSize: '11px',
                  }}>
                    Week {milestone.week}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--muted2)' }}>{milestone.detail}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 6 habits */}
      <div className="section-label" style={{ margin: '28px 0 16px' }}>FOUNDATIONAL HABITS</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
        {HABITS.map((h) => (
          <div key={h.title} className="card" style={{ padding: '18px', display: 'flex', gap: '14px' }}>
            <span style={{ fontSize: '28px', flexShrink: 0 }}>{h.icon}</span>
            <div>
              <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{h.title}</div>
              <div style={{ fontSize: '12px', color: 'var(--muted2)', lineHeight: 1.5 }}>{h.body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
