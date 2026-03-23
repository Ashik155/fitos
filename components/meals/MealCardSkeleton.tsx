export default function MealCardSkeleton() {
  return (
    <div
      className="card"
      style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}
    >
      <div style={{ display: 'flex', gap: '10px' }}>
        <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '8px', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: '16px', width: '70%', marginBottom: '6px' }} />
          <div className="skeleton" style={{ height: '12px', width: '50%' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        {[60, 50, 50, 50].map((w, i) => (
          <div key={i} className="skeleton" style={{ height: '22px', width: `${w}px`, borderRadius: '999px' }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {[90, 75, 80].map((w, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="skeleton" style={{ height: '12px', width: `${w}%` }} />
          </div>
        ))}
      </div>
      <div className="skeleton" style={{ height: '40px', borderRadius: '8px' }} />
      <div className="skeleton" style={{ height: '36px', borderRadius: '10px' }} />
    </div>
  );
}
