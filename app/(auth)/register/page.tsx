'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!email.trim()) newErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email address.';
    if (!password) newErrors.password = 'Password is required.';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const { error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (authError) {
      setErrors({ form: authError.message });
      return;
    }

    setSuccess(true);
    // After email confirmation they hit /auth/callback which checks for profile → /onboarding
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  if (success) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div className="fade-up card" style={{ maxWidth: '420px', width: '100%', padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
          <h2 style={{ fontFamily: 'Clash Display', fontSize: '22px', marginBottom: '12px' }}>
            Check your email
          </h2>
          <p style={{ color: 'var(--muted2)', lineHeight: 1.6 }}>
            We sent a confirmation link to <strong style={{ color: 'var(--text)' }}>{email}</strong>.
            Click the link to activate your account and start your FitOS journey.
          </p>
          <Link
            href="/login"
            style={{
              display: 'inline-block',
              marginTop: '24px',
              color: 'var(--gold)',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Back to login →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div className="fade-up" style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div
              style={{
                width: '40px', height: '40px', background: 'var(--gold)',
                borderRadius: '10px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '20px',
              }}
            >
              💪
            </div>
            <span style={{ fontFamily: 'Clash Display', fontSize: '24px', fontWeight: 700 }}>
              FitOS
            </span>
          </div>
          <p style={{ color: 'var(--muted2)', fontSize: '14px' }}>
            Start your transformation today — free
          </p>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          <h1 style={{ fontFamily: 'Clash Display', fontSize: '22px', fontWeight: 600, marginBottom: '24px' }}>
            Create your account
          </h1>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="btn-ghost"
            style={{ width: '100%', marginBottom: '20px', justifyContent: 'center' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ color: 'var(--muted)', fontSize: '12px' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Field id="fullName" label="Full Name" type="text" value={fullName}
              onChange={setFullName} placeholder="Alex Johnson" autoComplete="name"
              error={errors.fullName} onBlur={validate} />
            <Field id="email" label="Email" type="email" value={email}
              onChange={setEmail} placeholder="you@example.com" autoComplete="email"
              error={errors.email} onBlur={validate} />
            <Field id="password" label="Password" type="password" value={password}
              onChange={setPassword} placeholder="At least 8 characters" autoComplete="new-password"
              error={errors.password} onBlur={validate} />
            <Field id="confirmPassword" label="Confirm Password" type="password"
              value={confirmPassword} onChange={setConfirmPassword}
              placeholder="Repeat your password" autoComplete="new-password"
              error={errors.confirmPassword} onBlur={validate} />

            {errors.form && (
              <div style={{
                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                borderRadius: '8px', padding: '10px 14px', color: 'var(--red)', fontSize: '13px',
              }}>
                {errors.form}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%' }}>
              {loading ? 'Creating account...' : 'Create free account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--muted2)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const Field = ({
  id, label, type, value, onChange, placeholder, autoComplete, error, onBlur,
}: {
  id: string; label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  autoComplete?: string; error?: string; onBlur?: () => void;
}) => (
  <div>
    <label
      htmlFor={id}
      style={{
        display: 'block', fontSize: '13px', fontFamily: 'Syne',
        fontWeight: 600, color: 'var(--muted2)', marginBottom: '6px',
      }}
    >
      {label}
    </label>
    <input
      id={id} type={type} value={value} placeholder={placeholder}
      autoComplete={autoComplete}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      style={error ? { borderColor: 'var(--red)' } : {}}
    />
    {error && (
      <p style={{ color: 'var(--red)', fontSize: '12px', marginTop: '4px' }}>
        {error}
      </p>
    )}
  </div>
);
