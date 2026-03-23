'use client';

export default function Toast({ message }: { message: string }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--s3)',
        border: '1px solid var(--border2)',
        borderRadius: '10px',
        padding: '12px 20px',
        fontFamily: 'Syne',
        fontWeight: 600,
        fontSize: '14px',
        color: 'var(--text)',
        zIndex: 9999,
        whiteSpace: 'nowrap',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        animation: 'fadeUp 0.2s ease forwards',
      }}
    >
      {message}
    </div>
  );
}
