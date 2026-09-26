import React from 'react';
import { Sparkles, Activity, Trash2, Cpu } from 'lucide-react';

interface HeaderProps {
  chaosMode: 'none' | '429' | 'malformed';
  setChaosMode: (mode: 'none' | '429' | 'malformed') => void;
  onOpenTestBench: () => void;
  onOpenArchitecture: () => void;
  onOpenPurgeModal: () => void;
  isCalmMode: boolean;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  chaosMode,
  setChaosMode,
  onOpenTestBench,
  onOpenArchitecture,
  onOpenPurgeModal,
  isCalmMode,
  onReset
}) => {
  return (
    <header className="glass-panel" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={onReset}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '10px', 
          background: isCalmMode ? 'linear-gradient(135deg, #235347, #163830)' : 'linear-gradient(135deg, #2d5a27, #1e3f1b)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          boxShadow: '0 2px 8px var(--accent-glow)'
        }}>
          NS
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            NextStep <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>Decision Workbench</span>
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            {isCalmMode ? "Support & Safety Mode Active" : "Personal Decision & Priority Triage"}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {/* Chaos Injection Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-card)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <Activity size={14} color={chaosMode !== 'none' ? '#d97706' : 'var(--text-muted)'} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Chaos:</span>
          <select
            value={chaosMode}
            onChange={(e) => setChaosMode(e.target.value as any)}
            style={{
              background: 'transparent',
              color: chaosMode !== 'none' ? '#d97706' : 'var(--text-primary)',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="none" style={{ background: 'var(--bg-surface)' }}>Normal (0% Chaos)</option>
            <option value="429" style={{ background: 'var(--bg-surface)' }}>Force 429 Peak Limit</option>
            <option value="malformed" style={{ background: 'var(--bg-surface)' }}>Force 7% Malformed JSON</option>
          </select>
        </div>

        <button className="btn btn-secondary" onClick={onOpenTestBench} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
          <Sparkles size={14} color="#2d5a27" /> Shared Scenarios (7)
        </button>

        <button className="btn btn-secondary" onClick={onOpenArchitecture} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
          <Cpu size={14} color="#3b6d8c" /> Architecture
        </button>

        <button className="btn btn-danger" onClick={onOpenPurgeModal} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
          <Trash2 size={14} /> Purge All Data
        </button>
      </div>
    </header>
  );
};
