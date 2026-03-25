import { useState } from 'react';
import FileUpload from './components/FileUpload';
import PreviewTable from './components/PreviewTable';
import QuestionInput from './components/QuestionInput';
import ChartRenderer from './components/ChartRenderer';
import QnAHistory from './components/QnAHistory';

const API = 'http://localhost:5000';

function getSuggestedQuestions(columns) {
  if (!columns || columns.length === 0) return [];
  const c0 = columns[0];
  const c1 = columns.length > 1 ? columns[1] : columns[0];
  return [
    `What are the top 5 values in ${c1}?`,
    `Show me the distribution of ${c1}`,
    `What is the average of ${c1}?`,
  ];
}

export default function App() {
  const [uploadedData, setUploadedData] = useState(null);
  const [filename, setFilename] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState([]);

  const suggested = uploadedData ? getSuggestedQuestions(uploadedData.columns) : [];

  const handleUpload = (data, name) => {
    setUploadedData(data);
    setFilename(name);
    setCurrentResult(null);
    setHistory([]);
  };

  const handleReset = () => {
    setUploadedData(null);
    setFilename('');
    setCurrentResult(null);
    setHistory([]);
  };

  const handleAsk = async (question) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentResult({ ...data, question });
        setHistory(prev => [{ question, ...data }, ...prev]);
      } else {
        alert(data.error || 'Unknown error');
      }
    } catch {
      alert('Could not reach backend. Is it running on port 5000?');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '1.5rem 0 1.25rem',
        marginBottom: '2.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--text)', margin: 0 }}>
            <span style={{ color: 'var(--accent)' }}>CSV</span>_analyzer
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
            v1.0 // data interrogation tool
          </p>
        </div>
        {uploadedData && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '0.35rem 0.75rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--success)',
            }}>
              ● {filename}
            </div>
            <button
              onClick={handleReset}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text2)',
                borderRadius: '6px',
                padding: '0.35rem 0.85rem',
                fontSize: '0.8rem',
              }}
            >
              ✕ new file
            </button>
          </div>
        )}
      </header>

      {/* Upload screen */}
      {!uploadedData && <FileUpload onUpload={handleUpload} apiUrl={API} />}

      {/* Analysis screen */}
      {uploadedData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Preview */}
          <PreviewTable columns={uploadedData.columns} preview={uploadedData.preview} />

          {/* Suggested prompts */}
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: '0.6rem' }}>
              // suggested queries
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {suggested.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleAsk(q)}
                  disabled={loading}
                  style={{
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text2)',
                    padding: '0.45rem 0.9rem',
                    borderRadius: '999px',
                    fontSize: '0.82rem',
                    transition: 'all 0.18s',
                  }}
                  onMouseEnter={e => {
                    e.target.style.borderColor = 'var(--accent)';
                    e.target.style.color = 'var(--accent2)';
                  }}
                  onMouseLeave={e => {
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.color = 'var(--text2)';
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Question input */}
          <QuestionInput onAsk={handleAsk} loading={loading} />

          {/* Loading */}
          {loading && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              background: 'var(--surface)',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              color: 'var(--text2)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
            }}>
              <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
              analyzing data...
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Current result */}
          {currentResult && !loading && (
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}>
              {/* Insight banner */}
              <div style={{
                padding: '0.9rem 1.25rem',
                borderBottom: '1px solid var(--border)',
                background: 'var(--surface2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}>
                <span style={{ color: 'var(--accent)', fontSize: '1rem' }}>◈</span>
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>insight</p>
                  <p style={{ color: 'var(--text)', fontSize: '0.92rem' }}>{currentResult.insight}</p>
                  {currentResult.warning && (
                    <p style={{ color: 'var(--warning)', fontSize: '0.75rem', marginTop: '4px' }}>
                      ⚠ {currentResult.warning}
                    </p>
                  )}
                </div>
              </div>
              {/* Chart */}
              <div style={{ padding: '1.5rem' }}>
                <ChartRenderer
                  chartType={currentResult.chart_type}
                  data={currentResult.data}
                  xCol={currentResult.x_col}
                  yCol={currentResult.y_col}
                />
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && <QnAHistory history={history} onReask={handleAsk} loading={loading} />}
        </div>
      )}
    </div>
  );
}