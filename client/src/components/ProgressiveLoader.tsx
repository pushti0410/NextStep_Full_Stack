import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, ShieldCheck, Cpu, Sparkles } from 'lucide-react';

interface ProgressiveLoaderProps {
  isLoading: boolean;
}

export const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({ isLoading }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-glow)', color: 'var(--accent-primary)', marginBottom: '16px' }}>
        <Loader2 size={24} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
      </div>

      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px' }}>
        Structuring Decision Context... ({seconds}s)
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        Analyzing priorities, checking safety rules & validating decision boundaries.
      </p>

      {/* 3-Stage Progressive Pipeline (1s -> 5s -> 15s) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', maxWidth: '700px', margin: '0 auto', textAlign: 'left' }}>
        <div style={{
          padding: '12px',
          borderRadius: 'var(--radius-sm)',
          background: seconds >= 1 ? 'var(--accent-glow)' : 'var(--bg-primary)',
          border: `1px solid ${seconds >= 1 ? 'var(--accent-primary)' : 'var(--border-color)'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: seconds >= 1 ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
            {seconds >= 1 ? <CheckCircle2 size={16} color="var(--accent-primary)" /> : <ShieldCheck size={16} />}
            Second 1: Input Received
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Sanitizing prompt injection & checking idempotency keys.
          </p>
        </div>

        <div style={{
          padding: '12px',
          borderRadius: 'var(--radius-sm)',
          background: seconds >= 5 ? 'var(--accent-glow)' : 'var(--bg-primary)',
          border: `1px solid ${seconds >= 5 ? 'var(--accent-primary)' : 'var(--border-color)'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: seconds >= 5 ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
            {seconds >= 5 ? <CheckCircle2 size={16} color="var(--accent-primary)" /> : <Cpu size={16} />}
            Second 5: Structuring
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Extracting constraints, Hinglish terms & conflict matrix.
          </p>
        </div>

        <div style={{
          padding: '12px',
          borderRadius: 'var(--radius-sm)',
          background: seconds >= 10 ? 'var(--accent-glow)' : 'var(--bg-primary)',
          border: `1px solid ${seconds >= 10 ? 'var(--accent-primary)' : 'var(--border-color)'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: seconds >= 10 ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
            {seconds >= 10 ? <CheckCircle2 size={16} color="var(--accent-primary)" /> : <Sparkles size={16} />}
            Second 15: Finalizing
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Validating JSON schema & generating next step.
          </p>
        </div>
      </div>
    </div>
  );
};
