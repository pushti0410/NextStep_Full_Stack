import React from 'react';
import { StructuredResponse, PriorityItem } from '../types';
import { HeartHandshake, PhoneCall, ArrowLeft } from 'lucide-react';

interface CalmModeScreenProps {
  response: StructuredResponse;
  onReset: () => void;
}

export const CalmModeScreen: React.FC<CalmModeScreenProps> = ({ response, onReset }) => {
  return (
    <div className="calm-mode-theme" style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.4s ease' }}>
      
      {/* Calm Header Banner */}
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', border: '1px solid rgba(20, 184, 166, 0.3)', background: 'linear-gradient(135deg, rgba(20,184,166,0.1), rgba(17,37,39,0.95))' }}>
        <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'var(--accent-glow)', color: 'var(--accent-primary)', marginBottom: '16px' }}>
          <HeartHandshake size={36} />
        </div>
        
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
          Take a Moment. You Are Not Alone.
        </h2>

        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto 20px', lineHeight: '1.6' }}>
          {response.summary}
        </p>

        <button className="btn btn-primary" onClick={onReset} style={{ fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Return to Main Menu
        </button>
      </div>

      {/* Safety Helplines Box */}
      {response.riskGuidance && (
        <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid #ef4444', background: 'rgba(239, 68, 68, 0.08)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fca5a5', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PhoneCall size={20} color="#ef4444" /> 24/7 Free Confidential Support Helplines
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>iCall Helpline (India)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)', margin: '4px 0' }}>9152987821</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mon–Sat, 10am to 8pm • Professional Counselors</div>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>KIRAN Mental Health Helpline</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)', margin: '4px 0' }}>1800-599-0019</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>24/7 Toll-Free • Multi-language Support</div>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Vandrevala Foundation</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)', margin: '4px 0' }}>9999666555</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>24/7 Crisis Intervention</div>
            </div>
          </div>
        </div>
      )}

      {/* Gentle Micro Action Steps */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
          Gentle Grounding Steps for Right Now
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {response.priorities.map((item: PriorityItem, idx: number) => (
            <div key={item.id} style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <span style={{ background: 'var(--accent-glow)', color: 'var(--accent-primary)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                {idx + 1}
              </span>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{item.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.recommendedAction}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
