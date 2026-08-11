import React from 'react';
import { AlertCircle, Radio, CheckCircle, ShieldAlert } from 'lucide-react';
import ScenarioControls from './ScenarioControls';

export default function RightCommandPanel({
  currentScenario,
  onSelectScenario,
  onStepSimulation,
  systemStatus,
}) {
  const isCritical = systemStatus?.system_risk_level === 2;
  const isWarning  = systemStatus?.system_risk_level === 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Live Threat Feed */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #F0F2F5',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldAlert size={17} color={isCritical ? '#B91C1C' : isWarning ? '#92400E' : '#15803D'} />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F1923', margin: 0 }}>
              Real-Time Threat Feed
            </h3>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: '0.7rem', fontWeight: 700,
            padding: '3px 9px', borderRadius: '6px',
            background: '#FFF7ED', color: '#EA580C', border: '1px solid #FFEDD5',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EA580C', animation: 'dotBlink 1.2s infinite' }} />
            LIVE
          </span>
        </div>

        <div style={{
          padding: '12px 14px', borderRadius: 10,
          background: isCritical ? '#FEF2F2' : '#F0FDF4',
          borderLeft: `3px solid ${isCritical ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981'}`,
          border: `1px solid ${isCritical ? '#FECACA' : isWarning ? '#FDE68A' : '#BBF7D0'}`,
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: '0.72rem', fontWeight: 700,
            color: isCritical ? '#B91C1C' : isWarning ? '#92400E' : '#15803D',
            marginBottom: 5,
          }}>
            <span>{isCritical ? 'CRITICAL WILDFIRE ALARM' : isWarning ? 'ELEVATED RISK' : 'SYSTEM NORMAL'}</span>
            <span>{isCritical ? 'ACTIVE NOW' : 'SYNCED'}</span>
          </div>
          <p style={{ fontSize: '0.83rem', color: '#3D4F63', margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
            {isCritical
              ? 'Thermal anomaly expansion detected. High-risk ignition active on sensor mesh. Incident response dispatched.'
              : isWarning
              ? 'Environmental conditions indicate elevated fire weather risk. Monitoring closely.'
              : 'All sensors nominal. No thermal anomalies detected across the edge mesh network.'}
          </p>
        </div>
      </div>

      {/* Scenario Controls */}
      <ScenarioControls
        currentScenario={currentScenario}
        onSelectScenario={onSelectScenario}
        onStepSimulation={onStepSimulation}
      />

      {/* Emergency Broadcast */}
      <div className="card" style={{
        padding: '16px',
        background: '#FEF2F2',
        borderColor: '#FECACA',
      }}>
        <p style={{ fontSize: '0.72rem', color: '#B91C1C', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Emergency Action
        </p>
        <button
          onClick={() => onSelectScenario('ACTIVE_FIRE')}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
            color: '#fff',
            border: 'none',
            padding: '13px',
            borderRadius: 10,
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            boxShadow: '0 3px 14px rgba(220,38,38,0.35)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            fontFamily: 'inherit',
          }}
        >
          <Radio size={18} />
          🚨 Initiate Emergency Broadcast
        </button>
      </div>
    </div>
  );
}
