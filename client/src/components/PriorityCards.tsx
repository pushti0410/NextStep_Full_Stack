import React from 'react';
import { StructuredResponse, PriorityItem, ConstraintItem } from '../types';
import { CheckCircle, AlertTriangle, ArrowRight, Wrench } from 'lucide-react';
import { APIResponseMeta } from '../services/api';

interface PriorityCardsProps {
  response: StructuredResponse;
  meta?: APIResponseMeta;
  onStartReassessment: () => void;
}

export const PriorityCards: React.FC<PriorityCardsProps> = ({ response, meta, onStartReassessment }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Degraded State & Schema Repair Banner Flags */}
      {(meta?.isDegraded || response.mode === 'degraded_fallback') && (
        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 'var(--radius-sm)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertTriangle color="#d97706" size={20} />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400e' }}>
              System Operating in Degraded Fallback Mode
            </div>
            <div style={{ fontSize: '0.75rem', color: '#78350f' }}>
              AI provider experienced peak traffic / 429 rate limit. Rule-based heuristic fallback generated structured decision guidance without failing.
            </div>
          </div>
        </div>
      )}

      {meta?.wasRepaired && (
        <div style={{ background: '#f3e8ff', border: '1px solid #d8b4fe', borderRadius: 'var(--radius-sm)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Wrench color="#7c3aed" size={18} />
          <div style={{ fontSize: '0.8rem', color: '#6b21a8' }}>
            <strong>7% Schema Auto-Repair Applied:</strong> Malformed/partial LLM JSON response was automatically parsed, repaired, and validated against Zod schema.
          </div>
        </div>
      )}

      {/* Recommended Immediate Next Step (Hero Box) */}
      <div className="glass-panel" style={{ padding: '24px', borderLeft: '5px solid var(--accent-primary)', background: 'linear-gradient(135deg, rgba(45, 90, 39, 0.04), #ffffff)' }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle size={16} /> Recommended Immediate Next Step
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px', lineHeight: '1.4' }}>
          {response.recommendedNextAction}
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {response.summary}
        </p>

        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Confidence Assessment: <strong style={{ color: 'var(--text-primary)' }}>{Math.round(response.confidenceScore * 100)}%</strong>
          </div>
          <button className="btn btn-primary" onClick={onStartReassessment} style={{ fontSize: '0.85rem' }}>
            Update Situation / Action Taken <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Identified Issues & Active Constraints */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-secondary)' }}>
            Identified Core Issues ({response.identifiedIssues.length})
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {response.identifiedIssues.map((issue: string, idx: number) => (
              <li key={idx} style={{ fontSize: '0.85rem', background: 'var(--bg-primary)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>•</span> {issue}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-secondary)' }}>
            Active Constraints ({response.constraints.length})
          </h3>
          {response.constraints.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No severe constraints flagged.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {response.constraints.map((c: ConstraintItem) => (
                <div key={c.id} style={{ fontSize: '0.8rem', background: 'var(--bg-primary)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{c.description}</span>
                  <span className="badge badge-medium" style={{ fontSize: '0.65rem' }}>{c.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ranked Priorities Section */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Ranked Priorities & Action Plan
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {response.priorities.map((item: PriorityItem) => {
            const urgencyClass = `badge-${item.urgency}`;
            return (
              <div
                key={item.id}
                className="glass-panel"
                style={{
                  padding: '20px',
                  position: 'relative',
                  borderTop: item.isTied ? '4px solid #7c3aed' : item.rank === 1 ? '4px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: item.isTied ? '#f3e8ff' : 'var(--bg-card)',
                      color: item.isTied ? '#6b21a8' : 'var(--accent-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      border: '1px solid var(--border-color)'
                    }}>
                      #{item.rank}
                    </span>
                    <span className={`badge ${urgencyClass}`}>{item.urgency}</span>
                    {item.isTied && (
                      <span className="badge badge-tied" title="Two priorities returned with equal rank honestly without fake ordering">
                        Tied Rank
                      </span>
                    )}
                  </div>
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>
                  {item.title}
                </h4>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  <strong>Impact:</strong> {item.impact}
                </p>

                <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Action Step:
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {item.recommendedAction}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clarification Questions */}
      {response.clarificationQuestions.length > 0 && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Clarification Questions (Answer during situation update)
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {response.clarificationQuestions.map((q: string, idx: number) => (
              <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                ❓ {q}
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
};
