import { useState } from 'react';

export default function QuestionInput({ onAsk, loading }) {
  const [question, setQuestion] = useState('');

  const submit = () => {
    const q = question.trim();
    if (!q || loading) return;
    onAsk(q);
    setQuestion('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div style={{
      display: 'flex',
      gap: '0.6rem',
      alignItems: 'stretch',
    }}>
      <div style={{
        flex: 1,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1rem',
        transition: 'border-color 0.18s',
      }}
        onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--accent)'}
        onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginRight: '0.6rem', fontSize: '0.85rem' }}>›</span>
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask something about your data..."
          disabled={loading}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text)',
            fontSize: '0.9rem',
            padding: '0.85rem 0',
          }}
        />
      </div>
      <button
        onClick={submit}
        disabled={loading || !question.trim()}
        style={{
          background: loading ? 'var(--surface2)' : 'var(--accent)',
          color: loading ? 'var(--text3)' : '#fff',
          border: 'none',
          borderRadius: '10px',
          padding: '0 1.4rem',
          fontSize: '0.85rem',
          fontWeight: 600,
          letterSpacing: '0.03em',
          whiteSpace: 'nowrap',
        }}
      >
        {loading ? '...' : 'Ask →'}
      </button>
    </div>
  );
}