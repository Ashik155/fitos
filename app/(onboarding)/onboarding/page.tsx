'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { computeMetrics } from '@/lib/macros';
import { SPLITS_META } from '@/lib/splits';
import type { UserProfile, GoalMode, ExperienceLevel, SplitId } from '@/lib/types';

// ── Types for local form state ────────────────────────────────────────────────
interface FormState {
  fullName: string;
  age: string;
  sex: 'male' | 'female';
  weight: string;
  weightUnit: 'kg' | 'lbs';
  heightUnit: 'cm' | 'ft';
  heightCm: string;
  heightFt: string;
  heightIn: string;
  goal: GoalMode;
  mealsPerDay: 2 | 3 | 4 | 5;
  restrictions: string[];
  additionalRestrictions: string;
  trainingDays: number;
  experience: ExperienceLevel;
  split: SplitId;
}

const RESTRICTION_OPTIONS = [
  'No Beef', 'No Pork', 'No Shellfish', 'Vegetarian', 'Vegan',
  'Gluten-Free', 'Dairy-Free', 'Halal', 'Kosher', 'No Restrictions',
];

const INITIAL: FormState = {
  fullName: '', age: '', sex: 'male',
  weight: '', weightUnit: 'kg',
  heightUnit: 'cm', heightCm: '', heightFt: '', heightIn: '',
  goal: 'recomp',
  mealsPerDay: 3,
  restrictions: [],
  additionalRestrictions: '',
  trainingDays: 4,
  experience: 'intermediate',
  split: 'upper_lower',
};

// ── Converters ────────────────────────────────────────────────────────────────
const lbsToKg = (lbs: number) => Math.round(lbs / 2.2046 * 10) / 10;
const ftInToCm = (ft: number, inches: number) => Math.round((ft * 30.48) + (inches * 2.54));

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  // ── Validation per step ──────────────────────────────────────────────────────
  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};

    if (s === 1) {
      if (!form.fullName.trim()) errs.fullName = 'Name is required.';
      const age = parseInt(form.age);
      if (!form.age || isNaN(age) || age < 16 || age > 80) errs.age = 'Age must be 16–80.';

      const w = parseFloat(form.weight);
      if (!form.weight || isNaN(w)) { errs.weight = 'Weight is required.'; }
      else {
        const wKg = form.weightUnit === 'lbs' ? lbsToKg(w) : w;
        if (wKg < 30 || wKg > 300) errs.weight = 'Weight must be 30–300 kg.';
      }

      if (form.heightUnit === 'cm') {
        const h = parseFloat(form.heightCm);
        if (!form.heightCm || isNaN(h) || h < 100 || h > 250) errs.height = 'Height must be 100–250 cm.';
      } else {
        const ft = parseInt(form.heightFt);
        if (!form.heightFt || isNaN(ft) || ft < 3 || ft > 8) errs.height = 'Enter valid feet (3–8).';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, 5));
  };

  const back = () => setStep((s) => Math.max(s - 1, 1));

  // ── Derived metric values ────────────────────────────────────────────────────
  const getWeightKg = () => {
    const w = parseFloat(form.weight);
    return form.weightUnit === 'lbs' ? lbsToKg(w) : w;
  };

  const getHeightCm = () => {
    if (form.heightUnit === 'cm') return parseFloat(form.heightCm) || 0;
    const ft = parseInt(form.heightFt) || 0;
    const inc = parseInt(form.heightIn) || 0;
    return ftInToCm(ft, inc);
  };

  // Build a preview profile for step 5
  const previewProfile = (): UserProfile => ({
    id: '', userId: '',
    fullName: form.fullName,
    age: parseInt(form.age) || 25,
    sex: form.sex,
    weightKg: getWeightKg() || 70,
    heightCm: getHeightCm() || 170,
    goal: form.goal,
    mealsPerDay: form.mealsPerDay,
    restrictions: form.restrictions,
    additionalRestrictions: form.additionalRestrictions,
    trainingDays: form.trainingDays,
    experience: form.experience,
    split: form.split,
    unitPreference: form.weightUnit === 'kg' ? 'metric' : 'imperial',
    createdAt: '', updatedAt: '',
  });

  // ── Submit to API ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    const body = {
      fullName: form.fullName,
      age: parseInt(form.age),
      sex: form.sex,
      weightKg: getWeightKg(),
      heightCm: getHeightCm(),
      goal: form.goal,
      mealsPerDay: form.mealsPerDay,
      restrictions: form.restrictions,
      additionalRestrictions: form.additionalRestrictions,
      trainingDays: form.trainingDays,
      experience: form.experience,
      split: form.split,
      unitPreference: form.weightUnit === 'kg' ? 'metric' : 'imperial',
    };

    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    setSubmitting(false);

    if (res.ok) {
      router.push('/dashboard');
    } else {
      const data = await res.json();
      setErrors({ form: data.error || 'Failed to save profile. Please try again.' });
    }
  };


  // ── Step renderers ────────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <div className="fade-up">
      <h2 style={{ fontFamily: 'Clash Display', fontSize: '26px', fontWeight: 700, marginBottom: '8px' }}>
        Let's start with your basics
      </h2>
      <p style={{ color: 'var(--muted2)', marginBottom: '28px', lineHeight: 1.5 }}>
        This is used to calculate your personalised calorie and macro targets.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Full Name */}
        <div>
          <label style={labelStyle}>Full Name</label>
          <input value={form.fullName} onChange={e => update('fullName', e.target.value)}
            placeholder="Alex Johnson" />
          {errors.fullName && <ErrMsg msg={errors.fullName} />}
        </div>

        {/* Age */}
        <div>
          <label style={labelStyle}>Age</label>
          <input type="number" value={form.age} onChange={e => update('age', e.target.value)}
            placeholder="25" min={16} max={80} />
          {errors.age && <ErrMsg msg={errors.age} />}
        </div>

        {/* Sex toggle */}
        <div>
          <label style={labelStyle}>Sex</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {(['male', 'female'] as const).map(s => (
              <button key={s} onClick={() => update('sex', s)}
                className={form.sex === s ? 'btn-primary' : 'btn-ghost'}
                style={{ flex: 1, padding: '10px' }}>
                {s === 'male' ? '♂ Male' : '♀ Female'}
              </button>
            ))}
          </div>
        </div>

        {/* Weight */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={labelStyle}>Weight</label>
            <UnitToggle
              options={['kg', 'lbs']} selected={form.weightUnit}
              onChange={v => update('weightUnit', v as 'kg' | 'lbs')} />
          </div>
          <input type="number" value={form.weight}
            onChange={e => update('weight', e.target.value)}
            placeholder={form.weightUnit === 'kg' ? '70' : '154'} step="0.1" />
          {errors.weight && <ErrMsg msg={errors.weight} />}
        </div>

        {/* Height */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={labelStyle}>Height</label>
            <UnitToggle
              options={['cm', 'ft']} selected={form.heightUnit}
              onChange={v => update('heightUnit', v as 'cm' | 'ft')} />
          </div>
          {form.heightUnit === 'cm' ? (
            <input type="number" value={form.heightCm}
              onChange={e => update('heightCm', e.target.value)}
              placeholder="175" min={100} max={250} />
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="number" value={form.heightFt}
                onChange={e => update('heightFt', e.target.value)}
                placeholder="5 ft" min={3} max={8} style={{ flex: 1 }} />
              <input type="number" value={form.heightIn}
                onChange={e => update('heightIn', e.target.value)}
                placeholder="9 in" min={0} max={11} style={{ flex: 1 }} />
            </div>
          )}
          {errors.height && <ErrMsg msg={errors.height} />}
        </div>
      </div>

      <NavButtons step={step} back={back} onNext={next} submitting={submitting} />
    </div>
  );

  const renderStep2 = () => {
    const goals: { id: GoalMode; title: string; icon: string; description: string; science: string }[] = [
      {
        id: 'recomp', icon: '⚡', title: 'Body Recomposition',
        description: 'Build muscle & lose fat simultaneously',
        science: 'Eat at maintenance calories with high protein. Scales barely move but body composition transforms over 12–16 weeks.',
      },
      {
        id: 'cut', icon: '🔥', title: 'Fat Loss',
        description: 'Lose fat while preserving muscle',
        science: '12.5% calorie deficit with elevated protein (×1.1 multiplier). Optimal 0.5–1% bodyweight loss per week.',
      },
      {
        id: 'bulk', icon: '💪', title: 'Muscle Gain',
        description: 'Build maximum muscle with minimal fat',
        science: '10% calorie surplus. Maximises muscle protein synthesis while minimising excess fat accumulation.',
      },
    ];

    return (
      <div className="fade-up">
        <h2 style={{ fontFamily: 'Clash Display', fontSize: '26px', fontWeight: 700, marginBottom: '8px' }}>
          What's your primary goal?
        </h2>
        <p style={{ color: 'var(--muted2)', marginBottom: '28px', lineHeight: 1.5 }}>
          This shapes your calorie target and macro split. You can change it later in settings.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {goals.map(g => (
            <button key={g.id} onClick={() => update('goal', g.id)}
              style={{
                textAlign: 'left', padding: '20px', borderRadius: '16px',
                border: `2px solid ${form.goal === g.id ? 'var(--gold)' : 'var(--border)'}`,
                background: form.goal === g.id ? 'rgba(232,194,122,0.06)' : 'var(--s1)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '28px' }}>{g.icon}</span>
                <div>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, color: form.goal === g.id ? 'var(--gold)' : 'var(--text)', marginBottom: '2px' }}>
                    {g.title}
                  </div>
                  <div style={{ color: 'var(--muted2)', fontSize: '14px', marginBottom: '6px' }}>{g.description}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '12px', lineHeight: 1.5 }}>{g.science}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
        <NavButtons step={step} back={back} onNext={next} submitting={submitting} />
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="fade-up">
      <h2 style={{ fontFamily: 'Clash Display', fontSize: '26px', fontWeight: 700, marginBottom: '8px' }}>
        Diet preferences
      </h2>
      <p style={{ color: 'var(--muted2)', marginBottom: '28px', lineHeight: 1.5 }}>
        Your restrictions are enforced on every meal generated — we take these seriously.
      </p>

      {/* Meals per day */}
      <div style={{ marginBottom: '28px' }}>
        <label style={labelStyle}>Meals per day</label>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
          {([2, 3, 4, 5] as const).map(n => (
            <button key={n} onClick={() => update('mealsPerDay', n)}
              className={form.mealsPerDay === n ? 'btn-primary' : 'btn-ghost'}
              style={{ flex: 1, minWidth: '60px', padding: '10px 0' }}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Dietary restrictions */}
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Dietary restrictions</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
          {RESTRICTION_OPTIONS.map(r => {
            const active = form.restrictions.includes(r);
            return (
              <button key={r} onClick={() => {
                if (r === 'No Restrictions') {
                  update('restrictions', active ? [] : ['No Restrictions']);
                  return;
                }
                const filtered = form.restrictions.filter(x => x !== 'No Restrictions');
                update('restrictions', active ? filtered.filter(x => x !== r) : [...filtered, r]);
              }}
                style={{
                  padding: '6px 14px', borderRadius: '999px', fontSize: '13px',
                  fontFamily: 'Syne', fontWeight: 600, cursor: 'pointer',
                  border: `1px solid ${active ? 'var(--gold)' : 'var(--border2)'}`,
                  background: active ? 'rgba(232,194,122,0.12)' : 'transparent',
                  color: active ? 'var(--gold)' : 'var(--muted2)',
                  transition: 'all 0.15s',
                }}>
                {r}
              </button>
            );
          })}
        </div>
      </div>

      {/* Additional restrictions */}
      <div>
        <label style={labelStyle}>Additional restrictions (optional)</label>
        <textarea
          value={form.additionalRestrictions}
          onChange={e => update('additionalRestrictions', e.target.value)}
          placeholder="E.g. no mushrooms, tree nut allergy..."
          rows={3}
          style={{ resize: 'vertical', marginTop: '8px' }}
        />
      </div>

      <NavButtons step={step} back={back} onNext={next} submitting={submitting} />
    </div>
  );

  const renderStep4 = () => {
    const expOptions: { id: ExperienceLevel; title: string; description: string; icon: string }[] = [
      { id: 'beginner', icon: '🌱', title: 'Beginner', description: 'Less than 1 year of consistent lifting. Focus on learning movement patterns and building the habit.' },
      { id: 'intermediate', icon: '🔥', title: 'Intermediate', description: '1–3 years of consistent training. Solid form on main lifts, ready for more volume and intensity.' },
      { id: 'advanced', icon: '⚡', title: 'Advanced', description: '3+ years of progressive training. Strong foundation, ready for advanced techniques and periodisation.' },
    ];

    return (
      <div className="fade-up">
        <h2 style={{ fontFamily: 'Clash Display', fontSize: '26px', fontWeight: 700, marginBottom: '8px' }}>
          Training setup
        </h2>
        <p style={{ color: 'var(--muted2)', marginBottom: '28px', lineHeight: 1.5 }}>
          Your training plan difficulty and split will be tailored to your experience.
        </p>

        {/* Training days slider */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={labelStyle}>Training days per week</label>
            <span style={{ fontFamily: 'Clash Display', fontSize: '20px', color: 'var(--gold)' }}>
              {form.trainingDays}
            </span>
          </div>
          <input
            type="range" min={1} max={7} value={form.trainingDays}
            onChange={e => update('trainingDays', parseInt(e.target.value))}
            style={{
              width: '100%', height: '6px', background: 'var(--s3)',
              appearance: 'none', borderRadius: '999px', outline: 'none',
              accentColor: 'var(--gold)',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            {[1,2,3,4,5,6,7].map(n => (
              <span key={n} style={{ fontSize: '11px', color: n === form.trainingDays ? 'var(--gold)' : 'var(--muted)', fontWeight: n === form.trainingDays ? 700 : 400 }}>
                {n}
              </span>
            ))}
          </div>
        </div>

        {/* Experience level */}
        <div style={{ marginBottom: '28px' }}>
          <label style={labelStyle}>Experience level</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
            {expOptions.map(opt => (
              <button key={opt.id} onClick={() => update('experience', opt.id)}
                style={{
                  textAlign: 'left', padding: '16px', borderRadius: '12px', cursor: 'pointer',
                  border: `2px solid ${form.experience === opt.id ? 'var(--teal)' : 'var(--border)'}`,
                  background: form.experience === opt.id ? 'rgba(45,212,191,0.06)' : 'var(--s1)',
                  transition: 'all 0.15s',
                }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ fontSize: '22px' }}>{opt.icon}</span>
                  <div>
                    <div style={{ fontFamily: 'Syne', fontWeight: 700, color: form.experience === opt.id ? 'var(--teal)' : 'var(--text)' }}>
                      {opt.title}
                    </div>
                    <div style={{ color: 'var(--muted2)', fontSize: '13px', marginTop: '2px' }}>{opt.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Split picker */}
        <div>
          <label style={labelStyle}>Training split</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginTop: '8px' }}>
            {(Object.entries(SPLITS_META) as [SplitId, typeof SPLITS_META[SplitId]][]).map(([id, meta]) => (
              <button key={id} onClick={() => update('split', id)}
                style={{
                  textAlign: 'left', padding: '14px', borderRadius: '12px', cursor: 'pointer',
                  border: `2px solid ${form.split === id ? 'var(--teal)' : 'var(--border)'}`,
                  background: form.split === id ? 'rgba(45,212,191,0.06)' : 'var(--s1)',
                  transition: 'all 0.15s',
                }}>
                <div style={{ fontSize: '22px', marginBottom: '6px' }}>{meta.icon}</div>
                <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '13px', color: form.split === id ? 'var(--teal)' : 'var(--text)', marginBottom: '2px' }}>
                  {meta.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted2)' }}>{meta.days} days/week</div>
              </button>
            ))}
          </div>
        </div>

        <NavButtons step={step} back={back} onNext={next} submitting={submitting} />
      </div>
    );
  };

  const renderStep5 = () => {
    const profile = previewProfile();
    const metrics = computeMetrics(profile);

    const goalAdjustNote = {
      recomp: 'Eating at maintenance calories — ideal for simultaneous fat loss and muscle gain.',
      cut: '12.5% calorie deficit with elevated protein to preserve muscle during fat loss.',
      bulk: '10% calorie surplus to support lean muscle gain with minimal fat accumulation.',
    }[form.goal];

    const cards = [
      { label: 'Maintenance Calories', value: `${metrics.maintenanceKcal} kcal`, color: 'var(--muted2)', note: 'Calories to maintain current weight with your activity level.' },
      { label: 'Target Calories', value: `${metrics.targetKcal} kcal`, color: 'var(--gold)', note: goalAdjustNote },
      { label: 'Protein Target', value: `${metrics.proteinG}g`, color: 'var(--blue)', note: `Height method: ${profile.heightCm}cm = ${metrics.proteinG}g/day${profile.goal === 'cut' ? ' (×1.1 for cut)' : ''}.` },
      { label: 'Fat Target', value: `${metrics.fatG}g`, color: 'var(--red)', note: '25% of target calories. Supports hormonal health and fat-soluble vitamins.' },
      { label: 'Carb Target', value: `${metrics.carbsG}g`, color: 'var(--green)', note: 'Remaining calories after protein and fat. Fuels your training sessions.' },
    ];

    return (
      <div className="fade-up">
        <h2 style={{ fontFamily: 'Clash Display', fontSize: '26px', fontWeight: 700, marginBottom: '8px' }}>
          Your macro preview
        </h2>
        <p style={{ color: 'var(--muted2)', marginBottom: '28px', lineHeight: 1.5 }}>
          All numbers are computed specifically for your body and goal using Nippard methodology.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {cards.map(card => (
            <div key={card.label} className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'Syne', fontSize: '11px', fontWeight: 600, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>
                  {card.label}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '12px', maxWidth: '240px', lineHeight: 1.4 }}>{card.note}</div>
              </div>
              <div style={{ fontFamily: 'Clash Display', fontSize: '24px', fontWeight: 700, color: card.color, flexShrink: 0, marginLeft: '16px' }}>
                {card.value}
              </div>
            </div>
          ))}
        </div>

        {errors.form && (
          <div style={{
            background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: '8px', padding: '10px 14px', color: 'var(--red)', fontSize: '13px', marginBottom: '16px',
          }}>
            {errors.form}
          </div>
        )}

        <NavButtons step={step} back={back} onNext={handleSubmit} submitting={submitting} nextLabel="Looks good — Let's go!" />
      </div>
    );
  };

  const steps = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '560px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <div style={{ width: '36px', height: '36px', background: 'var(--gold)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
            💪
          </div>
          <span style={{ fontFamily: 'Clash Display', fontSize: '20px', fontWeight: 700 }}>FitOS</span>
        </div>

        <ProgressBar step={step} />

        {steps[step - 1]()}
      </div>
    </div>
  );
}

// ── Shared helper components ──────────────────────────────────────────────────

const ProgressBar = ({ step }: { step: number }) => (
  <div style={{ marginBottom: '32px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
      <span style={{ fontFamily: 'Syne', fontSize: '12px', fontWeight: 600, color: 'var(--muted2)' }}>
        STEP {step} OF 5
      </span>
      <span style={{ fontFamily: 'Syne', fontSize: '12px', color: 'var(--gold)' }}>
        {Math.round((step / 5) * 100)}%
      </span>
    </div>
    <div style={{ height: '4px', background: 'var(--s3)', borderRadius: '999px', overflow: 'hidden' }}>
      <div
        style={{
          height: '100%',
          width: `${(step / 5) * 100}%`,
          background: 'var(--gold)',
          borderRadius: '999px',
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  </div>
);

const NavButtons = ({
  step, back, onNext, submitting, nextLabel = 'Continue',
}: {
  step: number; back: () => void; onNext: () => void;
  submitting: boolean; nextLabel?: string;
}) => (
  <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
    {step > 1 && (
      <button onClick={back} className="btn-ghost" style={{ flex: 1 }}>
        ← Back
      </button>
    )}
    <button
      onClick={onNext}
      disabled={submitting}
      className="btn-primary"
      style={{ flex: 2 }}
    >
      {submitting ? 'Saving...' : nextLabel} {!submitting && '→'}
    </button>
  </div>
);

const labelStyle: React.CSSProperties = {
  fontSize: '13px', fontFamily: 'Syne', fontWeight: 600, color: 'var(--muted2)',
};

const ErrMsg = ({ msg }: { msg: string }) => (
  <p style={{ color: 'var(--red)', fontSize: '12px', marginTop: '4px' }}>{msg}</p>
);

const UnitToggle = ({
  options, selected, onChange,
}: { options: string[]; selected: string; onChange: (v: string) => void }) => (
  <div style={{ display: 'flex', background: 'var(--s3)', borderRadius: '8px', padding: '2px' }}>
    {options.map(opt => (
      <button key={opt} onClick={() => onChange(opt)}
        style={{
          padding: '4px 12px', borderRadius: '6px', fontSize: '12px',
          fontFamily: 'Syne', fontWeight: 600, cursor: 'pointer', border: 'none',
          background: selected === opt ? 'var(--s1)' : 'transparent',
          color: selected === opt ? 'var(--text)' : 'var(--muted)',
          transition: 'all 0.15s',
        }}>
        {opt}
      </button>
    ))}
  </div>
);
