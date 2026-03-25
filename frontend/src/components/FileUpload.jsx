import { useState, useRef } from 'react';

export default function FileUpload({ onUpload, apiUrl }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef();

  const processFile = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Only CSV files are supported.');
      return;
    }
    setError('');
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch(`${apiUrl}/upload`, { method: 'POST', body: form });
      const data = await res.json();
      if (res.ok) {
        onUpload(data, file.name);
      } else {
        setError(data.error || 'Upload failed.');
      }
    } catch {
      setError('Could not reach backend. Is it running on port 5000?');
    }
    setUploading(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  return (
    <div style={{ maxWidth: '560px', margin: '4rem auto 0' }}>
      {/* Title block */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-block',
          background: 'var(--accent-glow)',
          border: '1px solid var(--accent)',
          borderRadius: '8px',
          padding: '0.35rem 0.9rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          color: 'var(--accent2)',
          marginBottom: '1rem',
          letterSpacing: '0.08em',
        }}>
          READY
        </div>
        <h2 style={{ fontSize: '2rem', color: 'var(--text)', marginBottom: '0.5rem' }}>
          Drop your data.
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>
          Upload a CSV file and interrogate it with natural language.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border2)'}`,
          borderRadius: '16px',
          padding: '3rem 2rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? 'var(--accent-glow)' : 'var(--surface)',
          transition: 'all 0.2s ease',
          position: 'relative',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={(e) => processFile(e.target.files[0])}
        />
        {uploading ? (
          <div style={{ color: 'var(--text2)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p>uploading...</p>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.5 }}>⬆</div>
            <p style={{ color: 'var(--text)', fontSize: '0.95rem', marginBottom: '0.4rem' }}>
              Drag & drop a CSV file
            </p>
            <p style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>
              or click to browse — max 5MB
            </p>
          </>
        )}
      </div>

      {error && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          background: 'rgba(248, 113, 113, 0.1)',
          border: '1px solid rgba(248, 113, 113, 0.3)',
          borderRadius: '8px',
          color: 'var(--danger)',
          fontSize: '0.85rem',
        }}>
          ✕ {error}
        </div>
      )}

      {/* Features */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '0.75rem',
        marginTop: '2rem',
      }}>
        {[
          ['◈', 'AI Insights', 'Groq-powered analysis'],
          ['▦', 'Live Charts', 'Bar, line, pie'],
          ['◎', 'Q&A History', 'Track your queries'],
        ].map(([icon, title, desc]) => (
          <div key={title} style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '0.85rem',
            textAlign: 'center',
          }}>
            <div style={{ color: 'var(--accent)', fontSize: '1.1rem', marginBottom: '0.4rem' }}>{icon}</div>
            <p style={{ color: 'var(--text)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '2px' }}>{title}</p>
            <p style={{ color: 'var(--text3)', fontSize: '0.72rem' }}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}