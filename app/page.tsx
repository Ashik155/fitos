import Link from 'next/link';

const FEATURES = [
  { icon: '🫕', title: 'Cuisine Meals', desc: '11 cuisines × 21 meals each, calibrated to your exact macro targets and restrictions.' },
  { icon: '🥗', title: 'Ingredient Meals', desc: "Tell us what's in your fridge — AI builds meals from exactly what you have." },
  { icon: '💪', title: 'AI Training Plans', desc: '6 splits, fully personalised to your experience level, goal, and training frequency.' },
  { icon: '📅', title: 'Weekly Planner', desc: 'Drag meals into a 7-day grid. Variety-safe auto-fill keeps your diet interesting.' },
  { icon: '🗺️', title: 'Progress Roadmap', desc: '16-week milestone timeline with your actual numbers — not generic advice.' },
  { icon: '📊', title: 'Body Stats', desc: 'BMI, lean mass, TDEE breakdown, and protein science explained for your body.' },
];

const STEPS = [
  { step: '01', title: 'Enter your stats', desc: '5-step onboarding: age, weight, height, goal, diet preferences, training days.' },
  { step: '02', title: 'AI builds your plan', desc: 'Claude generates personalised meals and a full training programme from your data.' },
  { step: '03', title: 'Train with purpose', desc: 'Every metric, every meal, every milestone — specific to your body and goal.' },
];

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(9,11,14,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)', padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--gold)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>💪</div>
          <span style={{ fontFamily: 'Clash Display', fontSize: '20px', fontWeight: 700 }}>FitOS</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/login" className="btn-ghost" style={{ padding: '8px 18px', fontSize: '14px', textDecoration: 'none' }}>Sign in</Link>
          <Link href="/register" className="btn-primary" style={{ padding: '8px 18px', fontSize: '14px', textDecoration: 'none' }}>Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '100px 24px 80px', maxWidth: '800px', margin: '0 auto' }}>
        <div className="fade-up">
          <div style={{
            display: 'inline-block', background: 'rgba(232,194,122,0.1)', border: '1px solid rgba(232,194,122,0.3)',
            borderRadius: '999px', padding: '6px 18px', marginBottom: '24px',
            fontFamily: 'Syne', fontWeight: 700, fontSize: '12px', color: 'var(--gold)',
            textTransform: 'uppercase', letterSpacing: '1.2px',
          }}>
            Powered by Claude AI · Evidence-based methodology
          </div>

          <h1 style={{
            fontFamily: 'Clash Display', fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 700, lineHeight: 1.1, marginBottom: '24px',
          }}>
            Your AI Fitness<br />
            <span style={{ color: 'var(--gold)' }}>Command Centre</span>
          </h1>

          <p style={{ fontSize: '18px', color: 'var(--muted2)', lineHeight: 1.7, marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
            Enter your stats. Get a personalised nutrition plan, AI training programme, and 16-week roadmap — all grounded in Jeff Nippard's evidence-based methodology.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn-primary" style={{ padding: '16px 36px', fontSize: '16px', textDecoration: 'none' }}>
              Get Started Free →
            </Link>
            <Link href="#how-it-works" className="btn-ghost" style={{ padding: '16px 36px', fontSize: '16px', textDecoration: 'none' }}>
              See how it works
            </Link>
          </div>
        </div>

        {/* Mock dashboard preview */}
        <div style={{
          marginTop: '64px', background: 'var(--s1)', border: '1px solid var(--border)',
          borderRadius: '20px', padding: '24px', textAlign: 'left',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
            {[
              { label: 'Target Calories', value: '2,480', unit: 'kcal/day', color: 'var(--gold)' },
              { label: 'Protein Target', value: '178g', unit: 'per day', color: 'var(--blue)' },
              { label: 'Training Days', value: '5', unit: 'per week', color: 'var(--teal)' },
              { label: 'Goal', value: 'Fat Loss', unit: '', color: 'var(--purple)' },
            ].map((kpi) => (
              <div key={kpi.label} style={{ background: 'var(--s2)', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '10px', fontFamily: 'Syne', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>{kpi.label}</div>
                <div style={{ fontFamily: 'Clash Display', fontSize: '22px', fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
                {kpi.unit && <div style={{ fontSize: '11px', color: 'var(--muted2)', marginTop: '2px' }}>{kpi.unit}</div>}
              </div>
            ))}
          </div>
          <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--muted)', textAlign: 'center' }}>
            ↑ Live preview — your actual numbers after signing up
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ padding: '80px 24px', maxWidth: '900px', margin: '0 auto' }}>
        <div className="section-label" style={{ justifyContent: 'center', marginBottom: '16px' }}>HOW IT WORKS</div>
        <h2 style={{ fontFamily: 'Clash Display', fontSize: '36px', fontWeight: 700, textAlign: 'center', marginBottom: '48px' }}>
          From zero to personalised in minutes
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
          {STEPS.map((step) => (
            <div key={step.step} style={{ padding: '28px', background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: '16px' }}>
              <div style={{ fontFamily: 'Clash Display', fontSize: '40px', fontWeight: 700, color: 'var(--s4)', marginBottom: '16px' }}>
                {step.step}
              </div>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>{step.title}</h3>
              <p style={{ color: 'var(--muted2)', fontSize: '14px', lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div className="section-label" style={{ justifyContent: 'center', marginBottom: '16px' }}>FEATURES</div>
        <h2 style={{ fontFamily: 'Clash Display', fontSize: '36px', fontWeight: 700, textAlign: 'center', marginBottom: '48px' }}>
          Everything you need, nothing you don't
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>{f.title}</h3>
              <p style={{ color: 'var(--muted2)', fontSize: '13px', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Science section */}
      <section style={{ padding: '80px 24px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div className="section-label" style={{ justifyContent: 'center', marginBottom: '16px' }}>EVIDENCE-BASED</div>
        <h2 style={{ fontFamily: 'Clash Display', fontSize: '36px', fontWeight: 700, marginBottom: '16px' }}>
          Built on real science
        </h2>
        <p style={{ color: 'var(--muted2)', fontSize: '16px', lineHeight: 1.7, marginBottom: '40px' }}>
          Every calorie target, protein recommendation, and training prescription follows Jeff Nippard's evidence-based methodology from his Pure Bodybuilding Nutrition Booklet and Ultimate Guide to Body Recomposition. No broscience. No guessing.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
          {[
            { stat: '±10%', label: 'Macro target accuracy' },
            { stat: '6', label: 'Training splits available' },
            { stat: '21', label: 'Meals per cuisine' },
            { stat: '16', label: 'Week roadmap' },
          ].map((item) => (
            <div key={item.label} style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontFamily: 'Clash Display', fontSize: '32px', fontWeight: 700, color: 'var(--gold)' }}>{item.stat}</div>
              <div style={{ fontSize: '13px', color: 'var(--muted2)', marginTop: '4px' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA footer */}
      <section style={{ padding: '80px 24px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <h2 style={{ fontFamily: 'Clash Display', fontSize: '40px', fontWeight: 700, marginBottom: '16px' }}>
          Start your transformation today
        </h2>
        <p style={{ color: 'var(--muted2)', fontSize: '16px', marginBottom: '32px' }}>
          Free to use. No credit card required. Fully personalised in 5 minutes.
        </p>
        <Link href="/register" className="btn-primary" style={{ padding: '18px 48px', fontSize: '18px', textDecoration: 'none' }}>
          Create Free Account →
        </Link>
        <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--muted)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>
        FitOS — AI Fitness Platform. Built with Claude AI and evidence-based nutrition science.
      </footer>
    </div>
  );
}
