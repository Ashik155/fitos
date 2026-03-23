'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { computeMetrics } from '@/lib/macros';
import { SPLITS_META } from '@/lib/splits';
import type { UserProfile, ComputedMetrics, GoalMode, ExperienceLevel, SplitId } from '@/lib/types';

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [metrics, setMetrics] = useState<ComputedMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const supabase = createClient();

  // Form fields
  const [form, setForm] = useState({
    fullName: '',
    age: '',
    sex: 'male' as 'male' | 'female',
    weightKg: '',
    heightCm: '',
    goal: 'recomp' as GoalMode,
    mealsPerDay: 3 as 2 | 3 | 4 | 5,
    restrictions: [] as string[],
    additionalRestrictions: '',
    trainingDays: 4,
    experience: 'intermediate' as ExperienceLevel,
    split: 'upper_lower' as SplitId,
    unitPreference: 'metric' as 'metric' | 'imperial',
  });

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          const p: UserProfile = data.profile;
          setProfile(p);
          setMetrics(data.metrics);
          setForm({
            fullName: p.fullName, age: String(p.age), sex: p.sex,
            weightKg: String(p.weightKg), heightCm: String(p.heightCm),
            goal: p.goal, mealsPerDay: p.mealsPerDay,
            restrictions: p.restrictions, additionalRestrictions: p.additionalRestrictions,
            trainingDays: p.trainingDays, experience: p.experience, split: p.split,
            unitPreference: p.unitPreference,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: form.fullName,
        age: parseInt(form.age),
        sex: form.sex,
        weightKg: parseFloat(form.weightKg),
        heightCm: parseFloat(form.heightCm),
        goal: form.goal,
        mealsPerDay: form.mealsPerDay,
        restrictions: form.restrictions,
        additionalRestrictions: form.additionalRestrictions,
        trainingDays: form.trainingDays,
        experience: form.experience,
        split: form.split,
        unitPreference: form.unitPreference,
      }),
    });

    setSaving(false);

    if (res.ok) {
      const data = await res.json();
      setMetrics(data.metrics);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } else {
      const data = await res.json();
      setError(data.error || 'Save failed.');
    }
  };

  const handleDeleteAccount = async () => {
    const { error } = await supabase.rpc('delete_user');
    if (!error) {
      await supabase.auth.signOut();
      window.location.href = '/';
    }
  };

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '700px' }}>
        {[80, 60, 120, 60].map((h, i) => (
          <div key={i} className="skeleton" style={{ height: `${h}px`, borderRadius: '12px', marginBottom: '16px' }} />
        ))}
      </div>
    );
  }

  const RESTRICTIONS = ['No Beef', 'No Pork', 'No Shellfish', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Halal', 'Kosher', 'No Restrictions'];
  const labelStyle: React.CSSProperties = { fontSize: '13px', fontFamily: 'Syne', fontWeight: 600, color: 'var(--muted2)', display: 'block', marginBottom: '6px' };

  return (
    <div className="fade-up" style={{ maxWidth: '700px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'Clash Display', fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>Settings</h1>
        <p style={{ color: 'var(--muted2)', fontSize: '14px' }}>Update your profile — macros will be recomputed instantly.</p>
      </div>

      {/* Success banner with new metrics */}
      {saved && metrics && (
        <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px' }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--green)', marginBottom: '8px' }}>✓ Profile updated — macros recomputed</div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--muted2)' }}>
            <span>Calories: <strong style={{ color: 'var(--gold)' }}>{metrics.targetKcal} kcal</strong></span>
            <span>Protein: <strong style={{ color: 'var(--blue)' }}>{metrics.proteinG}g</strong></span>
            <span>Carbs: <strong style={{ color: 'var(--green)' }}>{metrics.carbsG}g</strong></span>
            <span>Fats: <strong style={{ color: 'var(--red)' }}>{metrics.fatG}g</strong></span>
          </div>
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* Basic info */}
        <div className="card" style={{ padding: '24px', marginBottom: '16px' }}>
          <div className="section-label" style={{ marginBottom: '20px' }}>BASIC INFORMATION</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input value={form.fullName} onChange={e => update('fullName', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Age</label>
                <input type="number" value={form.age} onChange={e => update('age', e.target.value)} min={16} max={80} />
              </div>
              <div>
                <label style={labelStyle}>Sex</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['male', 'female'] as const).map(s => (
                    <button key={s} type="button" onClick={() => update('sex', s)}
                      className={form.sex === s ? 'btn-primary' : 'btn-ghost'}
                      style={{ flex: 1, padding: '9px' }}>
                      {s === 'male' ? '♂ Male' : '♀ Female'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Weight (kg)</label>
                <input type="number" value={form.weightKg} onChange={e => update('weightKg', e.target.value)} step="0.1" />
              </div>
              <div>
                <label style={labelStyle}>Height (cm)</label>
                <input type="number" value={form.heightCm} onChange={e => update('heightCm', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Goal + Diet */}
        <div className="card" style={{ padding: '24px', marginBottom: '16px' }}>
          <div className="section-label" style={{ marginBottom: '20px' }}>GOAL & DIET</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Primary Goal</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {([['recomp', '⚡ Recomp'], ['cut', '🔥 Fat Loss'], ['bulk', '💪 Muscle Gain']] as [GoalMode, string][]).map(([g, label]) => (
                  <button key={g} type="button" onClick={() => update('goal', g)}
                    className={form.goal === g ? 'btn-primary' : 'btn-ghost'}
                    style={{ flex: 1, padding: '9px', fontSize: '12px' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Meals per day</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {([2, 3, 4, 5] as const).map(n => (
                  <button key={n} type="button" onClick={() => update('mealsPerDay', n)}
                    className={form.mealsPerDay === n ? 'btn-primary' : 'btn-ghost'}
                    style={{ flex: 1, padding: '9px' }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Dietary restrictions</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {RESTRICTIONS.map(r => {
                  const active = form.restrictions.includes(r);
                  return (
                    <button key={r} type="button" onClick={() => {
                      const filtered = form.restrictions.filter(x => x !== 'No Restrictions');
                      if (r === 'No Restrictions') { update('restrictions', active ? [] : ['No Restrictions']); return; }
                      update('restrictions', active ? filtered.filter(x => x !== r) : [...filtered, r]);
                    }}
                      style={{
                        padding: '5px 12px', borderRadius: '999px', fontSize: '12px',
                        fontFamily: 'Syne', fontWeight: 600, cursor: 'pointer',
                        border: `1px solid ${active ? 'var(--gold)' : 'var(--border2)'}`,
                        background: active ? 'rgba(232,194,122,0.12)' : 'transparent',
                        color: active ? 'var(--gold)' : 'var(--muted2)', transition: 'all 0.12s',
                      }}>
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Additional restrictions</label>
              <textarea value={form.additionalRestrictions} onChange={e => update('additionalRestrictions', e.target.value)} rows={2} style={{ resize: 'vertical' }} />
            </div>
          </div>
        </div>

        {/* Training */}
        <div className="card" style={{ padding: '24px', marginBottom: '16px' }}>
          <div className="section-label" style={{ marginBottom: '20px' }}>TRAINING</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={labelStyle}>Training days/week</label>
                <span style={{ fontFamily: 'Clash Display', fontSize: '18px', color: 'var(--gold)' }}>{form.trainingDays}</span>
              </div>
              <input type="range" min={1} max={7} value={form.trainingDays}
                onChange={e => update('trainingDays', parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--gold)' }} />
            </div>
            <div>
              <label style={labelStyle}>Experience level</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {([['beginner', '🌱 Beginner'], ['intermediate', '🔥 Intermediate'], ['advanced', '⚡ Advanced']] as [ExperienceLevel, string][]).map(([exp, label]) => (
                  <button key={exp} type="button" onClick={() => update('experience', exp)}
                    className={form.experience === exp ? 'btn-primary' : 'btn-ghost'}
                    style={{ flex: 1, padding: '9px', fontSize: '12px', minWidth: '100px' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Training split</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                {(Object.entries(SPLITS_META) as [SplitId, typeof SPLITS_META[SplitId]][]).map(([id, meta]) => (
                  <button key={id} type="button" onClick={() => update('split', id)}
                    style={{
                      padding: '10px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
                      border: `2px solid ${form.split === id ? 'var(--teal)' : 'var(--border)'}`,
                      background: form.split === id ? 'rgba(45,212,191,0.06)' : 'transparent',
                      transition: 'all 0.12s',
                    }}>
                    <div style={{ fontSize: '18px' }}>{meta.icon}</div>
                    <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '11px', color: form.split === id ? 'var(--teal)' : 'var(--muted2)', marginTop: '4px' }}>
                      {meta.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', padding: '10px 14px', color: 'var(--red)', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={saving} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Danger zone */}
      <div style={{ marginTop: '40px', padding: '24px', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '16px' }}>
        <div className="section-label" style={{ marginBottom: '12px', color: 'var(--red)' }}>DANGER ZONE</div>
        <p style={{ color: 'var(--muted2)', fontSize: '13px', marginBottom: '16px' }}>
          Deleting your account is permanent. All profile data, meal plans, and training history will be removed.
        </p>
        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)} className="btn-ghost" style={{ color: 'var(--red)', borderColor: 'rgba(248,113,113,0.3)' }}>
            Delete Account
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleDeleteAccount} style={{ background: 'var(--red)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', fontFamily: 'Syne', fontWeight: 700 }}>
              Yes, permanently delete
            </button>
            <button onClick={() => setShowDeleteConfirm(false)} className="btn-ghost">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
