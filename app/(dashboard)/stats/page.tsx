import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { computeMetrics } from '@/lib/macros';
import { mapProfileRow } from '@/lib/profile';

const GOAL_LABELS: Record<string, string> = {
  recomp: 'Body Recomposition',
  cut: 'Fat Loss',
  bulk: 'Muscle Gain',
};

const EXP_LABELS: Record<string, string> = {
  beginner: 'Beginner (<1 year)',
  intermediate: 'Intermediate (1–3 years)',
  advanced: 'Advanced (3+ years)',
};

export default async function StatsPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: row } = await supabase.from('profiles').select('*').eq('user_id', session.user.id).single();
  if (!row) redirect('/onboarding');

  const profile = mapProfileRow(row);
  const metrics = computeMetrics(profile);

  const displayWeight = profile.unitPreference === 'imperial'
    ? `${metrics.weightLbs.toFixed(1)} lbs`
    : `${profile.weightKg} kg`;

  const method2Explanation = `Track calories for 2 weeks. If weight is stable, your average intake IS maintenance. If you lost weight, add ~200–500 kcal above average.`;

  return (
    <div className="fade-up" style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'Clash Display', fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>Body Stats & Science</h1>
        <p style={{ color: 'var(--muted2)', fontSize: '14px' }}>Your personal metrics and the science behind your calorie targets.</p>
      </div>

      {/* Metric cards */}
      <div className="section-label" style={{ marginBottom: '14px' }}>YOUR METRICS</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '28px' }}>
        {[
          { label: 'Weight', value: displayWeight, color: 'var(--text)' },
          { label: 'Height', value: `${profile.heightCm} cm`, color: 'var(--text)' },
          { label: 'Age', value: `${profile.age}`, color: 'var(--text)' },
          { label: 'Sex', value: profile.sex === 'male' ? 'Male ♂' : 'Female ♀', color: 'var(--text)' },
          { label: 'BMI', value: metrics.bmi.toString(), color: metrics.bmi < 18.5 ? 'var(--blue)' : metrics.bmi > 25 ? 'var(--orange)' : 'var(--green)' },
          { label: 'Est. Body Fat', value: `${metrics.estimatedBfPct}%`, color: 'var(--muted2)' },
          { label: 'Lean Mass', value: `${metrics.leanMassKg} kg`, color: 'var(--blue)' },
          { label: 'Weight (lbs)', value: `${metrics.weightLbs.toFixed(1)}`, color: 'var(--muted2)' },
          { label: 'Experience', value: EXP_LABELS[profile.experience], color: 'var(--teal)' },
          { label: 'Goal', value: GOAL_LABELS[profile.goal], color: 'var(--gold)' },
        ].map((stat) => (
          <div key={stat.label} className="card" style={{ padding: '14px' }}>
            <div style={{ fontSize: '10px', fontFamily: 'Syne', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
              {stat.label}
            </div>
            <div style={{ fontFamily: 'Clash Display', fontSize: '18px', fontWeight: 700, color: stat.color, lineHeight: 1.2 }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* TDEE breakdown */}
      <div className="section-label" style={{ marginBottom: '14px' }}>TDEE — HOW YOUR CALORIES WERE CALCULATED</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {/* Method 1 */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '13px', color: 'var(--gold)', marginBottom: '12px' }}>
            Method 1 — Quick Estimate (used for your targets)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '13px', color: 'var(--muted2)' }}>
              Bodyweight × activity multiplier
            </div>
            <div style={{ background: 'var(--s2)', borderRadius: '8px', padding: '12px', fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text)' }}>
              {metrics.weightLbs.toFixed(1)} lbs × {
                profile.trainingDays >= 6 ? '17.5' :
                profile.trainingDays >= 4 ? '16.0' :
                profile.trainingDays >= 2 ? '14.5' : '13.0'
              } = <strong style={{ color: 'var(--gold)' }}>{metrics.maintenanceKcal} kcal</strong>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
              Multiplier based on {profile.trainingDays} training days/week
            </div>
          </div>
        </div>

        {/* Method 2 */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '13px', color: 'var(--blue)', marginBottom: '12px' }}>
            Method 2 — Accurate Tracking Method
          </div>
          <div style={{ fontSize: '13px', color: 'var(--muted2)', lineHeight: 1.6 }}>
            {method2Explanation}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px' }}>
            More accurate but requires 2 weeks of data. Use Method 1 to start.
          </div>
        </div>
      </div>

      {/* Protein science */}
      <div className="section-label" style={{ marginBottom: '14px' }}>YOUR PROTEIN TARGET — THE SCIENCE</div>
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          {[
            { label: 'Daily Target', value: `${metrics.proteinG}g`, sub: 'height method', color: 'var(--blue)' },
            { label: 'Per kg bodyweight', value: `${(metrics.proteinG / profile.weightKg).toFixed(2)}g/kg`, sub: 'science recommends 1.6–2.7g/kg', color: 'var(--blue)' },
            { label: 'Calories from protein', value: `${metrics.proteinG * 4} kcal`, sub: `${Math.round((metrics.proteinG * 4 / metrics.targetKcal) * 100)}% of target`, color: 'var(--muted2)' },
          ].map((item) => (
            <div key={item.label}>
              <div style={{ fontSize: '11px', fontFamily: 'Syne', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
                {item.label}
              </div>
              <div style={{ fontFamily: 'Clash Display', fontSize: '22px', fontWeight: 700, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{item.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: '13px', color: 'var(--muted2)', lineHeight: 1.6, borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <strong style={{ color: 'var(--text)' }}>Why {metrics.proteinG}g?</strong> The height-in-cm method (your {profile.heightCm}cm = {profile.heightCm}g base
          {profile.goal === 'cut' ? `, ×1.1 for cut = ${metrics.proteinG}g` : ''}) is the simplest reliable method from Nippard's research.
          {' '}During a {profile.goal === 'cut' ? 'cut, higher protein (0.8–1.2g/lb) helps preserve muscle mass' : profile.goal === 'bulk' ? 'bulk, 0.7–1g/lb drives muscle protein synthesis' : 'recomp, 0.7–1g/lb supports simultaneous muscle gain and fat loss'}.
        </div>
      </div>
    </div>
  );
}
