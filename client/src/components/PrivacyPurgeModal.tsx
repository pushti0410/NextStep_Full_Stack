import React, { useState } from 'react';
import { apiService } from '../services/api';
import { Trash2, AlertTriangle, CheckCircle, X } from 'lucide-react';

interface PrivacyPurgeModalProps {
  onClose: () => void;
  onPurgedSuccess: () => void;
}

export const PrivacyPurgeModal: React.FC<PrivacyPurgeModalProps> = ({ onClose, onPurgedSuccess }) => {
  const [purgeReport, setPurgeReport] = useState<any>(null);
  const [isPurging, setIsPurging] = useState(false);

  const handleExecutePurge = async () => {
    setIsPurging(true);
    try {
      const res = await apiService.purgeUserData('user_demo_1');
      setPurgeReport(res.purgeReport);
      onPurgedSuccess();
    } catch (err) {
      alert(`Purge failed: ${(err as Error).message}`);
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '550px',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trash2 size={20} /> GDPR Complete Data Purge (Blocker 7)
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Requirement 7 compliance: Permanently wipes <strong>all stored situations, version history, audit logs, and prompt logs</strong> associated with user <code>user_demo_1</code>.
        </p>

        {!purgeReport ? (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fca5a5', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={16} /> Irreversible Cascade Deletion
            </div>
            <div style={{ fontSize: '0.75rem', color: '#fef2f2' }}>
              This will remove all database records, vector prompts, and history.
            </div>
            <button className="btn btn-danger" onClick={handleExecutePurge} disabled={isPurging} style={{ marginTop: '16px', width: '100%' }}>
              {isPurging ? "Purging All Records..." : "Execute Complete Data Purge"}
            </button>
          </div>
        ) : (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#6ee7b7', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={18} /> Cascade Purge Executed Successfully
            </div>
            <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '20px' }}>
              <li>Situations Purged: <strong>{purgeReport.situationsPurged}</strong></li>
              <li>Versions Purged: <strong>{purgeReport.versionsPurged}</strong></li>
              <li>Audit Logs Purged: <strong>{purgeReport.logsPurged}</strong></li>
              <li>Prompt Logs Purged: <strong>{purgeReport.promptsPurged}</strong></li>
            </ul>
          </div>
        )}

      </div>
    </div>
  );
};
