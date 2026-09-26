import React from 'react';
import { Cpu, GitBranch, Layers, Zap, X } from 'lucide-react';

interface ArchitectureModalProps {
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(28, 34, 30, 0.45)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu color="#3b6d8c" size={24} /> Architecture & Technical System Design
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              End-to-End System Components, Data Model, Trade-offs & 10x Scale Breakdown
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* 1. Core Component Flow */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={18} /> System Flow & Blockers Handled
          </h3>
          <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', lineHeight: '1.8', color: 'var(--text-primary)' }}>
            [User Input] → (Idempotency Check) → (Prompt Injection Shield) → [AI Reasoning Pipeline]<br />
            ↓ (7% Schema Error?) → [Zod Schema & JSON Auto-Repair Parser]<br />
            ↓ (Provider 429/Timeout?) → [Heuristic Degraded Fallback Engine]<br />
            ↓ [Immutable Versioning Engine] → (situations + situation_versions tables)<br />
            ↓ [Delta Engine] → (Conflict Resolution: Latest Claim Wins & "What Changed" Summary)<br />
            → [React UI] (Calm Mode / Tied Badges / Progressive Loader)
          </div>
        </div>

        {/* 2. Key Decisions & Rejected Alternatives */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <GitBranch size={18} /> 3 Key Decisions & Alternatives Rejected
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>1. Immutable Event-Sourced Versioning</strong>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <strong>Chosen:</strong> Keep full version history (`situation_versions`).<br />
                <span style={{ color: '#c93b2b' }}>Rejected:</span> Overwriting situation rows in-place.<br />
                <em>Why:</em> Preserves audit history, resolves deadline conflicts (Scenario 3), enables natural language delta calculation.
              </p>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>2. 4-Tier Resilience vs Immediate 500</strong>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <strong>Chosen:</strong> Primary AI → JSON Repair → Retry → Degraded Heuristic Engine.<br />
                <span style={{ color: '#c93b2b' }}>Rejected:</span> Returning 500 error on 429 rate limit.<br />
                <em>Why:</em> Guaranteed 100% availability for stressed users under peak exam load.
              </p>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>3. Server-Side Idempotency Window</strong>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <strong>Chosen:</strong> Request payload hashing + X-Idempotency-Key.<br />
                <span style={{ color: '#c93b2b' }}>Rejected:</span> Client-only button disabling.<br />
                <em>Why:</em> Client button disable fails on patchy mobile reconnections.
              </p>
            </div>
          </div>
        </div>

        {/* 3. What Breaks First at 10x Users */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#d97706', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={18} /> What Would Break First at 10x Users & Mitigation
          </h3>
          <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li><strong>AI Provider Rate Limits (429s):</strong> At 10x traffic during exam season, synchronous LLM API calls exhaust quota instantly. <em>Mitigation:</em> Introduce an async worker queue (BullMQ + Redis) with background streaming responses and local cached embeddings for repeated common scenarios.</li>
            <li><strong>Context Window Cost & Latency:</strong> Appending full history on every update inflates token costs exponentially. <em>Mitigation:</em> Implemented rolling context summarization (`contextSummarizer`) keeping only current state + 150-token compressed summary.</li>
          </ul>
        </div>

      </div>
    </div>
  );
};
