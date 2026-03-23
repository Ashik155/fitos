import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { computeMetrics } from '@/lib/macros';
import { mapProfileRow } from '@/lib/profile';

const GOAL_LABELS: Record<string, string> = {
  recomp: 'Body Recomposition',
  cut: 'Fat Loss',
  bulk: 'Muscle Gain',
};

export default async function DashboardPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: row } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (!row) redirect('/onboarding');

  const profile = mapProfileRow(row);
  const metrics = computeMetrics(profile);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  const firstName = profile.fullName.split(' ')[0];

  const goalScience: Record<string, { title: string; points: [string, string, string, string] }> = {
    recomp: {
      title: 'How Body Recomposition Works',
      points: [
        '⚡ Eat at maintenance calories to give your body resources without excess fat storage',
        '💪 High protein (your height in grams) drives muscle protein synthesis even at maintenance',
        '📸 Progress measured by photos and strength — not scale weight (it barely moves)',
        '⏱ Results visible in 12–16 weeks of consistent training and nutrition',
      ],
    },
    cut: {
      title: 'How Fat Loss While Preserving Muscle Works',
      points: [
        '🔥 12.5% calorie deficit — aggressive enough to lose fat, modest enough to keep muscle',
        '💪 Elevated protein (×1.1 of height) protects muscle mass during deficit',
        '🎯 Optimal rate: 0.5–1% bodyweight per week — faster loses muscle, slower is fine',
        '📉 Expect to lose mostly fat, not strength — protein and training preserve the muscle',
      ],
    },
    bulk: {
      title: 'How Lean Muscle Gain Works',
      points: [
        '📈 10% calorie surplus provides resources for muscle growth without excess fat gain',
        '💪 Maximum natural muscle gain: ~0.5–1 kg/month — bigger surplus doesn\'t help',
        '🏋️ Progressive overload is the real driver — the surplus just provides the resources',
        '🥩 Post-workout carbs are especially important for recovery and anabolism',
      ],
    },
  };

  const goal = goalScience[profile.goal] ?? goalScience.recomp;

  const supplements = [
    { name: 'Creatine Monohydrate', dose: '5g/day', timing: 'Any time', icon: '🧪', tier: 'Must Have', color: 'var(--green)' },
    { name: 'Caffeine', dose: '150–250mg', timing: '30–60 min pre-workout', icon: '☕', tier: 'Recommended', color: 'var(--blue)' },
    { name: 'Protein Powder', dose: 'As needed', timing: 'Any time', icon: '🥛', tier: 'If Needed', color: 'var(--gold)' },
    { name: 'Multivitamin', dose: '1 serving/day', timing: 'With food', icon: '💊', tier: 'Optional', color: 'var(--muted2)' },
  ];

  const quickLinks = [
    { href: '/cuisine', icon: '🍽️', label: 'Generate Meals', sub: 'By cuisine' },
    { href: '/training', icon: '💪', label: 'Build Training Plan', sub: 'AI-generated' },
    { href: '/roadmap', icon: '🗺️', label: 'View Roadmap', sub: '16-week plan' },
    { href: '/planner', icon: '📅', label: 'Meal Planner', sub: 'Weekly grid' },
  ];

  return (
    <div className="fade-up" style={{ maxWidth: '960px' }}>
      {/* Welcome */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Clash Display', fontSize: '32px', fontWeight: 700, marginBottom: '4px' }}>
          Good {greeting}, {firstName} 👋
        </h1>
        <p style={{ color: 'var(--muted2)', fontSize: '15px' }}>
          Here's your personalised fitness command centre.
        </p>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Target Calories', value: `${metrics.targetKcal}`, unit: 'kcal/day', color: 'var(--gold)', icon: '🔥' },
          { label: 'Protein Target', value: `${metrics.proteinG}g`, unit: 'per day', color: 'var(--blue)', icon: '💪' },
          { label: 'Training Days', value: `${profile.trainingDays}`, unit: 'per week', color: 'var(--teal)', icon: '🏋️' },
          { label: 'Goal', value: GOAL_LABELS[profile.goal] ?? profile.goal, unit: '', color: 'var(--purple)', icon: '🎯' },
        ].map((kpi) => (
          <div key={kpi.label} className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '11px', fontFamily: 'Syne', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
                  {kpi.label}
                </div>
                <div style={{ fontFamily: 'Clash Display', fontSize: '28px', fontWeight: 700, color: kpi.color, lineHeight: 1 }}>
                  {kpi.value}
                </div>
                {kpi.unit && (
                  <div style={{ fontSize: '12px', color: 'var(--muted2)', marginTop: '2px' }}>{kpi.unit}</div>
                )}
              </div>
              <span style={{ fontSize: '24px', opacity: 0.7 }}>{kpi.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Macro split */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div className="section-label" style={{ marginBottom: '20px' }}>DAILY MACRO SPLIT</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { label: 'Protein', grams: metrics.proteinG, kcal: metrics.proteinG * 4, color: 'var(--blue)', total: metrics.targetKcal },
            { label: 'Carbs', grams: metrics.carbsG, kcal: metrics.carbsG * 4, color: 'var(--green)', total: metrics.targetKcal },
            { label: 'Fats', grams: metrics.fatG, kcal: metrics.fatG * 9, color: 'var(--red)', total: metrics.targetKcal },
          ].map((macro) => {
            const pct = Math.round((macro.kcal / macro.total) * 100);
            return (
              <div key={macro.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '14px', color: macro.color }}>{macro.label}</span>
                    <span style={{ fontSize: '13px', color: 'var(--muted2)' }}>{macro.grams}g</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--muted2)' }}>{macro.kcal} kcal</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: macro.color }}>{pct}%</span>
                  </div>
                </div>
                <div style={{ height: '6px', background: 'var(--s3)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: macro.color, borderRadius: '999px' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goal science + Supplements side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Goal science */}
        <div className="card" style={{ padding: '24px' }}>
          <div className="section-label" style={{ marginBottom: '16px' }}>YOUR GOAL</div>
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '15px', marginBottom: '14px', color: 'var(--gold)' }}>
            {goal.title}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {goal.points.map((point, i) => (
              <p key={i} style={{ fontSize: '13px', color: 'var(--muted2)', lineHeight: 1.5, margin: 0 }}>{point}</p>
            ))}
          </div>
        </div>

        {/* Supplement stack */}
        <div className="card" style={{ padding: '24px' }}>
          <div className="section-label" style={{ marginBottom: '16px' }}>SUPPLEMENT STACK</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {supplements.map((s) => (
              <div key={s.name} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '22px' }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '13px' }}>{s.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted2)' }}>{s.dose} · {s.timing}</div>
                </div>
                <span className="pill" style={{ background: `${s.color}18`, color: s.color, fontSize: '11px' }}>
                  {s.tier}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick nav */}
      <div className="section-label" style={{ marginBottom: '16px' }}>QUICK START</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              background: 'var(--s1)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              transition: 'all 0.15s',
              color: 'var(--text)',
            }}
          >
            <span style={{ fontSize: '24px' }}>{link.icon}</span>
            <div>
              <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '14px' }}>{link.label}</div>
              <div style={{ fontSize: '12px', color: 'var(--muted2)' }}>{link.sub}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
