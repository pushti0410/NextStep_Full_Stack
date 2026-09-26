import React, { useState } from 'react';
import { apiService } from '../services/api';
import { Sparkles, Play, CheckCircle2, XCircle, Clock, X } from 'lucide-react';

interface ScenarioTestBenchProps {
  onClose: () => void;
  onSelectScenario: (input: string) => void;
}

export const ScenarioTestBench: React.FC<ScenarioTestBenchProps> = ({ onClose, onSelectScenario }) => {
  const [benchmarkResult, setBenchmarkResult] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunAll = async () => {
    setIsRunning(true);
    try {
      const data = await apiService.runBenchmark();
      setBenchmarkResult(data);
    } catch (err) {
      alert(`Benchmark execution failed: ${(err as Error).message}`);
    } finally {
      setIsRunning(false);
    }
  };

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
        gap: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles color="#2d5a27" size={22} /> Shared Scenario Pack Benchmark Suite
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              Run all 7 shared scenarios to test Hinglish parsing, prompt injection defense, calm mode, and failure resilience.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Automated Benchmark Runner</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Executes 7 test cases and outputs structured analysis</div>
          </div>
          <button className="btn btn-primary" onClick={handleRunAll} disabled={isRunning}>
            {isRunning ? "Running Suite..." : <><Play size={16} /> Run Benchmark Suite</>}
          </button>
        </div>

        {benchmarkResult && (
          <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Passed: </span>
                <strong style={{ color: '#2d5a27', fontSize: '1.2rem' }}>{benchmarkResult.passedCount} / {benchmarkResult.totalScenarios}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Success Rate: </span>
                <strong style={{ color: 'var(--accent-primary)', fontSize: '1.2rem' }}>{benchmarkResult.successRate}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {benchmarkResult.results.map((r: any) => (
                <div key={r.scenarioId} style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.85rem' }}>
                      {r.pass ? <CheckCircle2 size={16} color="#2d5a27" /> : <XCircle size={16} color="#c93b2b" />}
                      #{r.scenarioId} ({r.type})
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {r.durationMs}ms
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    "{r.input}"
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>
                    Summary: {r.outputSummary}
                  </div>
                  <button
                    className="btn btn-secondary"
                    onClick={() => { onSelectScenario(r.input); onClose(); }}
                    style={{ marginTop: '8px', padding: '4px 8px', fontSize: '0.7rem' }}
                  >
                    Load into Main Workspace
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
