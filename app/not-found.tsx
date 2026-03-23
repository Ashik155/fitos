import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <div className="fade-up card" style={{ maxWidth: '480px', width: '100%', padding: '40px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Clash Display', fontSize: '80px', fontWeight: 700, color: 'var(--s3)', lineHeight: 1, marginBottom: '16px' }}>
          404
        </div>
        <h1 style={{ fontFamily: 'Clash Display', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
          Page not found
        </h1>
        <p style={{ color: 'var(--muted2)', fontSize: '14px', lineHeight: 1.6, marginBottom: '28px' }}>
          That page doesn't exist. You might have mistyped the URL or the page has moved.
        </p>
        <Link href="/dashboard" className="btn-primary" style={{ padding: '11px 24px', textDecoration: 'none', display: 'inline-block' }}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
