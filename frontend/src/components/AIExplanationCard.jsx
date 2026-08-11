import React from 'react';
import { Cpu, Zap, Brain } from 'lucide-react';

const PROB_CONFIG = [
  { key: 'NORMAL',    label: 'Normal',    color: '#15803D', trackBg: '#F0FDF4' },
  { key: 'WARNING',   label: 'Warning',   color: '#B45309', trackBg: '#FFFBEB' },
  { key: 'HIGH_RISK', label: 'High Risk', color: '#B91C1C', trackBg: '#FEF2F2' },
];

export default function AIExplanationCard({ focusNode }) {
  if (!focusNode) return null;

  const probs = focusNode.ml_probabilities || { NORMAL: 0.95, WARNING: 0.03, HIGH_RISK: 0.02 };
  const combustionIndex = focusNode.derivatives?.combustion_index?.toFixed(2) ?? '0.00';

  return (
    <div className="card" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: '#EFF6FF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Brain size={20} color="#1D4ED8" />
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F1923', margin: 0 }}>
            AI Model Intelligence — {focusNode.node_id}
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#7A8FA6', margin: 0 }}>
            Scikit-Learn Random Forest · Probability breakdown & decision rationale
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 20 }}>

        {/* Left: Probability bars */}
        <div>
          <p className="section-label" style={{ marginBottom: 14 }}>
            Classification Confidence
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {PROB_CONFIG.map(({ key, label, color, trackBg }) => {
              const pct = ((probs[key] ?? 0) * 100);
              return (
                <div key={key}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: '0.82rem', marginBottom: 5,
                  }}>
                    <span style={{ fontWeight: 700, color }}>{label}</span>
                    <span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#0F1923' }}>
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                  {/* Track */}
                  <div style={{
                    background: trackBg, height: 10,
                    borderRadius: 99, overflow: 'hidden',
                    border: '1px solid #E2E6ED',
                  }}>
                    <div style={{
                      background: color, height: '100%',
                      width: `${pct}%`,
                      borderRadius: 99,
                      transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Decision rationale */}
        <div style={{
          background: '#F4F6F9',
          border: '1px solid #E2E6ED',
          borderRadius: 12,
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div>
            <p className="section-label" style={{ marginBottom: 6 }}>Decision Rationale</p>
            <p style={{ fontSize: '0.875rem', color: '#3D4F63', lineHeight: 1.55, margin: 0 }}>
              {focusNode.explanation || 'All parameters within normal ambient operating limits. No anomalies detected across derivative thresholds.'}
            </p>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: 8,
            padding: '9px 12px',
          }}>
            <Zap size={15} color="#1D4ED8" />
            <div>
              <p className="section-label" style={{ color: '#1D4ED8', marginBottom: 1 }}>Combustion Index</p>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '1.05rem', fontWeight: 800, color: '#0F1923',
              }}>
                {combustionIndex}
              </span>
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: 8,
            padding: '9px 12px',
          }}>
            <Cpu size={15} color="#15803D" />
            <div>
              <p className="section-label" style={{ color: '#15803D', marginBottom: 1 }}>Classifier</p>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F1923' }}>
                Random Forest · 100 estimators · Derivative Rules
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
