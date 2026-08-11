import React from 'react';
import { Shield, Thermometer, Wind, Cpu, TrendingUp, Zap } from 'lucide-react';

export default function MetricsRow({ systemStatus, focusNode }) {
  const getRiskColor = (level) => {
    if (level === 2) return '#EF4444';
    if (level === 1) return '#F59E0B';
    return '#10B981';
  };

  const dT_dt = focusNode?.derivatives?.dT_dt || 0.0;
  const dCO_dt = focusNode?.derivatives?.dCO_dt || 0.0;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px',
      marginBottom: '20px'
    }}>
      {/* Metric 1: System Risk Status */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.5px' }}>
            OVERALL SYSTEM RISK
          </span>
          <div style={{
            background: `${getRiskColor(systemStatus?.system_risk_level)}20`,
            padding: '8px',
            borderRadius: '10px'
          }}>
            <Shield size={18} color={getRiskColor(systemStatus?.system_risk_level)} />
          </div>
        </div>
        <div style={{
          color: getRiskColor(systemStatus?.system_risk_level),
          fontSize: '1.65rem',
          fontWeight: '800',
          marginTop: '8px'
        }}>
          {systemStatus?.system_risk_label || 'NORMAL'}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={14} color="#F97316" />
          Active Scenario: <strong style={{ color: 'var(--text-main)' }}>{systemStatus?.current_scenario || 'NORMAL'}</strong>
        </div>
      </div>

      {/* Metric 2: Temperature & Derivative */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.5px' }}>
            TEMPERATURE & dT/dt
          </span>
          <div style={{ background: 'rgba(249, 115, 22, 0.15)', padding: '8px', borderRadius: '10px' }}>
            <Thermometer size={18} color="#F97316" />
          </div>
        </div>
        <div style={{ color: 'var(--text-main)', fontSize: '1.55rem', fontWeight: '800', marginTop: '8px' }}>
          {focusNode?.temperature || 25.0} °C
          <span style={{
            fontSize: '0.88rem',
            marginLeft: '8px',
            fontWeight: '700',
            color: dT_dt > 1.0 ? '#EF4444' : '#10B981'
          }}>
            ({dT_dt >= 0 ? `+${dT_dt.toFixed(2)}` : dT_dt.toFixed(2)} °C/min)
          </span>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px' }}>
          Target Node: <strong style={{ color: 'var(--text-main)' }}>{focusNode?.node_id || 'NODE-01'}</strong>
        </div>
      </div>

      {/* Metric 3: Carbon Monoxide */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.5px' }}>
            CARBON MONOXIDE (CO)
          </span>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '8px', borderRadius: '10px' }}>
            <Wind size={18} color="#F59E0B" />
          </div>
        </div>
        <div style={{ color: 'var(--text-main)', fontSize: '1.55rem', fontWeight: '800', marginTop: '8px' }}>
          {focusNode?.co_ppm || 4.0} ppm
          <span style={{
            fontSize: '0.88rem',
            marginLeft: '8px',
            fontWeight: '700',
            color: dCO_dt > 2.0 ? '#EF4444' : '#10B981'
          }}>
            ({dCO_dt >= 0 ? `+${dCO_dt.toFixed(2)}` : dCO_dt.toFixed(2)} ppm/min)
          </span>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px' }}>
          Smoke Raw ADC: <strong style={{ color: 'var(--text-main)' }}>{focusNode?.smoke_raw || 300}</strong>
        </div>
      </div>

      {/* Metric 4: AI Model Confidence */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.5px' }}>
            AI CONFIDENCE SCORE
          </span>
          <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '8px', borderRadius: '10px' }}>
            <Cpu size={18} color="#0EA5E9" />
          </div>
        </div>
        <div style={{ color: '#0EA5E9', fontSize: '1.65rem', fontWeight: '800', marginTop: '8px' }}>
          {((focusNode?.confidence || 0.95) * 100).toFixed(1)}%
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px' }}>
          Classifier: <strong style={{ color: 'var(--text-main)' }}>Random Forest + Rules</strong>
        </div>
      </div>
    </div>
  );
}
