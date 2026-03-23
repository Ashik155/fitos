'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error service in production
    if (process.env.NODE_ENV === 'production') {
      // console.error suppressed — logged server-side
    }
  }, [error]);

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <div className="fade-up card" style={{ maxWidth: '480px', width: '100%', padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
        <h1 style={{ fontFamily: 'Clash Display', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
          Something went wrong
        </h1>
        <p style={{ color: 'var(--muted2)', fontSize: '14px', lineHeight: 1.6, marginBottom: '28px' }}>
          An unexpected error occurred. If this keeps happening, try refreshing the page.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={reset} className="btn-primary" style={{ padding: '11px 24px' }}>
            Try again
          </button>
          <Link href="/dashboard" className="btn-ghost" style={{ padding: '11px 24px', textDecoration: 'none' }}>
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
