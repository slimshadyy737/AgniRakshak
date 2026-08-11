import React from 'react';
import { Cpu, Zap } from 'lucide-react';

export default function AIExplanationCard({ focusNode }) {
  if (!focusNode) return null;

  const probs = focusNode.ml_probabilities || { NORMAL: 0.95, WARNING: 0.03, HIGH_RISK: 0.02 };

  return (
    <div className="glass-card" style={{ marginTop: '16px' }}>
      <h3 style={{
        fontSize: '1.05rem',
        fontWeight: '700',
        color: 'var(--text-heading)',
        marginBottom: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Cpu size={18} color="#0EA5E9" />
        Scikit-Learn Model Probability & Rule Trigger Rationale
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Class Probabilities Progress Bars */}
        <div>
          <h4 style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: '700' }}>
            CLASSIFICATION CONFIDENCE BREAKDOWN ({focusNode.node_id})
          </h4>

          {/* NORMAL BAR */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
              <span style={{ color: '#10B981', fontWeight: '700' }}>NORMAL</span>
              <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{(probs.NORMAL * 100).toFixed(1)}%</span>
            </div>
            <div style={{ background: 'var(--bg-input)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ background: '#10B981', width: `${probs.NORMAL * 100}%`, height: '100%', borderRadius: '5px', transition: 'width 0.5s ease' }} />
            </div>
          </div>

          {/* WARNING BAR */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
              <span style={{ color: '#F59E0B', fontWeight: '700' }}>WARNING</span>
              <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{(probs.WARNING * 100).toFixed(1)}%</span>
            </div>
            <div style={{ background: 'var(--bg-input)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ background: '#F59E0B', width: `${probs.WARNING * 100}%`, height: '100%', borderRadius: '5px', transition: 'width 0.5s ease' }} />
            </div>
          </div>

          {/* HIGH RISK BAR */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
              <span style={{ color: '#EF4444', fontWeight: '700' }}>HIGH RISK</span>
              <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{(probs.HIGH_RISK * 100).toFixed(1)}%</span>
            </div>
            <div style={{ background: 'var(--bg-input)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ background: '#EF4444', width: `${probs.HIGH_RISK * 100}%`, height: '100%', borderRadius: '5px', transition: 'width 0.5s ease' }} />
            </div>
          </div>
        </div>

        {/* AI Explanation Text */}
        <div style={{
          background: 'var(--bg-input)',
          border: '1px solid var(--bg-card-border)',
          borderRadius: '12px',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <h4 style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '700' }}>
            DECISION RATIONALE & FUSION METRIC
          </h4>
          <p style={{ color: 'var(--text-main)', fontSize: '0.88rem', lineHeight: '1.45' }}>
            {focusNode.explanation || 'All parameters within normal ambient operating limits.'}
          </p>
          <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#0EA5E9', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} />
            Combustion Index: <strong>{focusNode.derivatives?.combustion_index?.toFixed(2) || '0.00'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
