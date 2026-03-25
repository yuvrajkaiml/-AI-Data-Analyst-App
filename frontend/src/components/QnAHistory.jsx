export default function QnAHistory({ history, onReask, loading }) {
  if (!history || history.length === 0) return null;

  return (
    <div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: '0.75rem' }}>
        // query history ({history.length})
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {history.map((item, i) => (
          <div
            key={i}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              transition: 'border-color 0.18s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            onClick={() => !loading && onReask(item.question)}
          >
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: 'var(--text3)',
              minWidth: '20px',
            }}>
              {String(history.length - i).padStart(2, '0')}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: 'var(--text)', fontSize: '0.85rem', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.question}
              </p>
              <p style={{ color: 'var(--text3)', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.insight}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '0.15rem 0.45rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                color: 'var(--accent2)',
              }}>
                {item.chart_type || 'bar'}
              </span>
              <span style={{ color: 'var(--text3)', fontSize: '0.75rem' }}>↩</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}