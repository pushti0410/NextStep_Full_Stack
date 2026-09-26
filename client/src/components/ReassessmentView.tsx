import React, { useState } from 'react';
import { Situation, SituationVersion, DeltaSummary } from '../types';
import { RefreshCw, GitCommit, Calendar } from 'lucide-react';

interface ReassessmentViewProps {
  situation: Situation;
  currentVersion: SituationVersion;
  deltaSummary?: DeltaSummary | null;
  onReassessSubmit: (updateText: string) => void;
  isLoading: boolean;
}

export const ReassessmentView: React.FC<ReassessmentViewProps> = ({
  situation,
  currentVersion,
  deltaSummary,
  onReassessSubmit,
  isLoading
}) => {
  const [updateInput, setUpdateInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateInput.trim() || isLoading) return;
    onReassessSubmit(updateInput);
    setUpdateInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* What Changed Delta Card (Blocker 4 & 5) */}
      {deltaSummary && (
        <div className="glass-panel" style={{ padding: '24px', borderLeft: '5px solid #7c3aed', background: 'linear-gradient(135deg, #f3e8ff, #ffffff)' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: '#7c3aed', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <GitCommit size={16} /> Reassessment Delta — Version {deltaSummary.previousVersion} → Version {deltaSummary.currentVersion}
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
            {deltaSummary.summaryDelta}
          </h3>

          {/* Conflict Resolution Highlight (Scenario 3 Deadline Change) */}
          {deltaSummary.deadlineShift && (
            <div style={{ background: 'var(--bg-primary)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', margin: '12px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={18} color="#d97706" />
              <div style={{ fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Deadline Conflict Resolution:</span>{' '}
                <strong style={{ color: '#c93b2b', textDecoration: 'line-through', marginRight: '6px' }}>{deltaSummary.deadlineShift.oldVal}</strong>
                <span style={{ color: '#2d5a27', fontWeight: 700 }}>→ {deltaSummary.deadlineShift.resolvedVal}</span> (Latest explicit user update adopted)
              </div>
            </div>
          )}

          {deltaSummary.priorityChanges.length > 0 && (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              {deltaSummary.priorityChanges.map((change: string, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#7c3aed' }}>•</span> {change}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Situation Update Form */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={18} color="var(--accent-primary)" /> Reassess & Update Situation (Version {situation.currentVersionNumber})
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Did new information arrive? Did a deadline change or did you complete a step? Describe what changed.
        </p>

        <form onSubmit={handleSubmit}>
          <textarea
            value={updateInput}
            onChange={(e) => setUpdateInput(e.target.value)}
            placeholder="e.g. 'Actually wait, professor said deadline is Thursday instead of Friday' or 'I borrowed a laptop from roommate...'"
            rows={3}
            style={{
              width: '100%',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              fontSize: '0.9rem',
              outline: 'none',
              marginBottom: '12px'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={isLoading || !updateInput.trim()}
              className="btn btn-primary"
              style={{ opacity: isLoading || !updateInput.trim() ? 0.6 : 1 }}
            >
              {isLoading ? "Computing Reassessment..." : "Submit Update & Re-evaluate"}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
