'use client';

import { useState, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { SPLITS_META } from '@/lib/splits';
import { TrainingPlanSchema } from '@/lib/schemas';
import type { SplitId, DayName } from '@/lib/types';

const DAYS: DayName[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function TrainingPage() {
  const { trainPlan, setTrainPlan } = useAppStore();
  const [selectedSplit, setSelectedSplit] = useState<SplitId | null>(null);
  const [activeDay, setActiveDay] = useState<DayName | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [streamProgress, setStreamProgress] = useState('');
  const [error, setError] = useState('');
  const bufferRef = useRef('');

  const handleGenerate = async () => {
    if (!selectedSplit) return;
    setStreaming(true);
    setError('');
    setStreamProgress('');
    bufferRef.current = '';

    try {
      const res = await fetch('/api/training/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ split: selectedSplit }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Generation failed');
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream');

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.text) {
              bufferRef.current += parsed.text;
              // Show progress dots
              setStreamProgress((p) => p.length > 40 ? '.' : p + '.');
            }
          } catch {
            // Skip malformed SSE lines
          }
        }
      }

      // Parse full collected JSON
      const raw = bufferRef.current.trim()
        .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

      const parsed = JSON.parse(raw);
      const plan = TrainingPlanSchema.parse(parsed);
      setTrainPlan(plan);

      // Auto-select first training day
      const firstTraining = plan.schedule.find((d) => d.type === 'training');
      if (firstTraining) setActiveDay(firstTraining.day as DayName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate training plan.');
    } finally {
      setStreaming(false);
      setStreamProgress('');
    }
  };

  const schedule = trainPlan?.schedule ?? [];
  const activeDayData = schedule.find((d) => d.day === activeDay);
  const trainingDays = schedule.filter((d) => d.type === 'training');

  return (
    <div className="fade-up" style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'Clash Display', fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>
          AI Training Plan
        </h1>
        <p style={{ color: 'var(--muted2)', fontSize: '14px' }}>
          Choose your split and AI generates a full weekly programme calibrated to your experience.
        </p>
      </div>

      {/* Split picker */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {(Object.entries(SPLITS_META) as [SplitId, typeof SPLITS_META[SplitId]][]).map(([id, meta]) => (
          <button
            key={id}
            onClick={() => setSelectedSplit(id)}
            style={{
              textAlign: 'left', padding: '18px', borderRadius: '14px', cursor: 'pointer',
              border: `2px solid ${selectedSplit === id ? 'var(--teal)' : 'var(--border)'}`,
              background: selectedSplit === id ? 'rgba(45,212,191,0.06)' : 'var(--s1)',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: '26px', marginBottom: '8px' }}>{meta.icon}</div>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '14px', color: selectedSplit === id ? 'var(--teal)' : 'var(--text)', marginBottom: '2px' }}>
              {meta.name}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted2)' }}>{meta.days} days/week</div>
          </button>
        ))}
      </div>

      {/* Info banner */}
      {selectedSplit && (
        <div style={{
          background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.2)',
          borderRadius: '10px', padding: '14px 18px', marginBottom: '20px',
          fontSize: '13px', color: 'var(--muted2)',
        }}>
          <strong style={{ color: 'var(--teal)' }}>{SPLITS_META[selectedSplit].name}</strong>
          {' — '}{SPLITS_META[selectedSplit].description}
        </div>
      )}

      {/* Generate */}
      <button
        onClick={handleGenerate}
        disabled={!selectedSplit || streaming}
        className="btn-primary"
        style={{ marginBottom: '28px', padding: '14px 32px', fontSize: '15px' }}
      >
        {streaming ? `Generating${streamProgress}` : 'Generate Training Plan'}
      </button>

      {/* Streaming indicator */}
      {streaming && (
        <div style={{
          background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '10px',
          padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center',
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--teal)', animation: 'pulse 1s infinite' }} />
          <span style={{ color: 'var(--muted2)', fontSize: '14px' }}>
            AI is designing your training programme...
          </span>
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
          borderRadius: '10px', padding: '12px 16px', color: 'var(--red)', marginBottom: '20px',
        }}>
          {error}
        </div>
      )}

      {/* Training plan display */}
      {trainPlan && schedule.length > 0 && (
        <>
          {/* 7-day week overview */}
          <div className="section-label" style={{ marginBottom: '14px' }}>WEEKLY SCHEDULE</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '28px' }}>
            {DAYS.map((day) => {
              const dayData = schedule.find((d) => d.day === day);
              const isTraining = dayData?.type === 'training';
              const isActive = activeDay === day;
              return (
                <button
                  key={day}
                  onClick={() => isTraining && setActiveDay(day)}
                  style={{
                    padding: '12px 4px', borderRadius: '10px', cursor: isTraining ? 'pointer' : 'default',
                    border: `2px solid ${isActive ? 'var(--teal)' : isTraining ? 'var(--border2)' : 'var(--border)'}`,
                    background: isActive ? 'rgba(45,212,191,0.1)' : isTraining ? 'var(--s1)' : 'transparent',
                    textAlign: 'center', transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: '16px', marginBottom: '4px' }}>{dayData?.emoji ?? '😴'}</div>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '12px', color: isActive ? 'var(--teal)' : isTraining ? 'var(--text)' : 'var(--muted)' }}>
                    {day}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--muted2)', marginTop: '2px' }}>
                    {isTraining ? dayData?.muscles?.slice(0,1)?.[0] ?? 'Train' : 'Rest'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Day tabs */}
          {trainingDays.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '4px' }}>
              {trainingDays.map((day) => (
                <button
                  key={day.day}
                  onClick={() => setActiveDay(day.day as DayName)}
                  style={{
                    padding: '8px 16px', borderRadius: '9px', border: 'none', cursor: 'pointer', flexShrink: 0,
                    background: activeDay === day.day ? 'var(--teal)' : 'var(--s2)',
                    color: activeDay === day.day ? '#090b0e' : 'var(--muted2)',
                    fontFamily: 'Syne', fontWeight: 700, fontSize: '13px', transition: 'all 0.15s',
                  }}
                >
                  {day.day} — {day.label}
                </button>
              ))}
            </div>
          )}

          {/* Active day exercises */}
          {activeDayData && activeDayData.type === 'training' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontFamily: 'Clash Display', fontSize: '20px', fontWeight: 700 }}>
                  {activeDayData.emoji} {activeDayData.label}
                </h2>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {activeDayData.muscles.map((m) => (
                    <span key={m} className="pill" style={{ background: 'rgba(45,212,191,0.1)', color: 'var(--teal)', fontSize: '11px' }}>
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {activeDayData.exercises.map((ex, i) => (
                  <div key={ex.name} className="card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '14px' }}>{ex.name}</div>
                        <span className="pill" style={{ background: 'rgba(91,141,238,0.12)', color: 'var(--blue)', fontSize: '11px', marginTop: '4px', display: 'inline-block' }}>
                          {ex.muscle}
                        </span>
                      </div>
                      <span style={{ fontFamily: 'Clash Display', fontSize: '16px', color: 'var(--muted)', fontWeight: 700 }}>
                        #{i + 1}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                      {[
                        { label: 'Sets', value: ex.sets },
                        { label: 'Reps', value: ex.reps },
                        { label: 'Rest', value: ex.rest },
                        { label: 'RPE', value: ex.rpe },
                      ].map((item) => (
                        <div key={item.label} style={{ background: 'var(--s2)', borderRadius: '8px', padding: '8px 10px' }}>
                          <div style={{ fontSize: '10px', fontFamily: 'Syne', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                            {item.label}
                          </div>
                          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '14px', color: 'var(--teal)' }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted2)', lineHeight: 1.5, background: 'var(--s2)', borderRadius: '8px', padding: '8px 10px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--muted)', fontFamily: 'Syne', fontSize: '10px', textTransform: 'uppercase' }}>Form: </span>
                      {ex.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
