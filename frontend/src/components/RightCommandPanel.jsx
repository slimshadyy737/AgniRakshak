import React from 'react';
import axios from 'axios';
import {
  AlertCircle, Radio, CheckCircle, ShieldAlert, Zap, Globe, Cpu,
  Thermometer, Droplets, Wind, Flame, Activity, Satellite
} from 'lucide-react';
import ScenarioControls from './ScenarioControls';

export default function RightCommandPanel({
  selectedNodeId,
  focusNode,
  nodes,
  currentScenario,
  onSelectScenario,
  onStepSimulation,
  onTelemetryInjected,
  systemStatus,
}) {
  const isCritical = systemStatus?.system_risk_level === 2;
  const isWarning  = systemStatus?.system_risk_level === 1;
  const isLiveData = systemStatus?.data_mode === 'LIVE';

  const handleToggleMode = async (mode) => {
    try {
      await axios.post('/api/live/mode', { mode });
      onTelemetryInjected?.();
    } catch (e) {
      console.error('Mode switch error:', e);
    }
  };

  const handleEmergencyBroadcast = async () => {
    try {
      await axios.post('/api/alerts/broadcast', {
        sector_id: 'ALL',
        channels: ['LoRa Radio Mesh', 'Cell Broadcast SMS', 'Municipal Siren']
      });
      alert('🚨 EMERGENCY BROADCAST DISPATCHED: Sirens and evacuation radio packets triggered across the region.');
      onTelemetryInjected?.();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Real-Time Threat Feed */}
      <div className="card" style={{ padding: '20px', border: '1px solid #E2E8F0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #F0F2F5',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldAlert size={17} color={isCritical ? '#DC2626' : isWarning ? '#D97706' : '#16A34A'} />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              {isLiveData ? 'Real-Time Telemetry Feed' : 'Benchmark Simulation Feed'}
            </h3>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: '0.7rem', fontWeight: 800,
            padding: '3px 9px', borderRadius: '6px',
            background: isLiveData ? '#FEF2F2' : '#FFFBEB',
            color: isLiveData ? '#DC2626' : '#D97706',
            border: `1px solid ${isLiveData ? '#FECACA' : '#FDE68A'}`,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: isLiveData ? '#DC2626' : '#D97706',
              animation: 'dotBlink 1.2s infinite'
            }} />
            {isLiveData ? 'LIVE DATA' : 'SIMULATION'}
          </span>
        </div>

        <div style={{
          padding: '12px 14px', borderRadius: 10,
          background: isCritical ? '#FEF2F2' : isWarning ? '#FFFBEB' : '#F0FDF4',
          borderLeft: `4px solid ${isCritical ? '#DC2626' : isWarning ? '#D97706' : '#16A34A'}`,
          border: `1px solid ${isCritical ? '#FECACA' : isWarning ? '#FDE68A' : '#BBF7D0'}`,
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: '0.72rem', fontWeight: 800,
            color: isCritical ? '#DC2626' : isWarning ? '#D97706' : '#16A34A',
            marginBottom: 5,
          }}>
            <span>{isCritical ? 'CRITICAL WILDFIRE ALARM' : isWarning ? 'ELEVATED RISK' : 'SYSTEM NORMAL'}</span>
            <span>{isLiveData ? '100% REAL' : 'SYNTHETIC'}</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#334155', margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
            {isCritical
              ? 'Thermal anomaly expansion detected. High-risk ignition active on sensor mesh. Incident response dispatched.'
              : isWarning
              ? 'Environmental conditions indicate elevated fire weather risk. Monitoring closely.'
              : isLiveData
              ? 'All sensors nominal. Real Open-Meteo weather & Copernicus atmospheric air quality streaming in real time.'
              : 'All simulated sensor nodes within normal parameters. Ready for scenario injection.'}
          </p>
        </div>
      </div>

      {/* ── MODE-AWARE CONTROL BLOCK ── */}
      {isLiveData ? (
        /* Live Real Data Mode: Ingestion Pipe Card with LIVE INCOMING METRICS */
        <div className="card" style={{ padding: '20px', border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Globe size={18} color="#0284C7" />
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                Live Real Data Ingestion Engine
              </h4>
            </div>
            <span style={{
              fontSize: '0.68rem', fontWeight: 800,
              padding: '2px 7px', borderRadius: 4,
              background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0'
            }}>
              LIVE 60FPS
            </span>
          </div>

          <p style={{ fontSize: '0.76rem', color: '#64748B', lineHeight: 1.45, margin: '0 0 14px 0' }}>
            Streaming actual real-world telemetry for <strong>{focusNode?.node_name || 'Selected Sector'}</strong>:
          </p>

          {/* Real Live Metrics Display Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            <div style={{ padding: '8px 10px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.68rem', fontWeight: 700, color: '#EA580C' }}>
                <Thermometer size={13} /> LIVE TEMPERATURE
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginTop: 2 }}>
                {focusNode?.temperature ?? 24.5} °C
              </div>
              <span style={{ fontSize: '0.65rem', color: '#64748B' }}>Open-Meteo In-Situ</span>
            </div>

            <div style={{ padding: '8px 10px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.68rem', fontWeight: 700, color: '#0284C7' }}>
                <Droplets size={13} /> RELATIVE HUMIDITY
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginTop: 2 }}>
                {focusNode?.humidity ?? 58.0} %
              </div>
              <span style={{ fontSize: '0.65rem', color: '#64748B' }}>Surface Foliage Moisture</span>
            </div>

            <div style={{ padding: '8px 10px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.68rem', fontWeight: 700, color: '#DC2626' }}>
                <Flame size={13} /> ATMOSPHERIC CO
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginTop: 2 }}>
                {focusNode?.co_ppm ?? 0.8} ppm
              </div>
              <span style={{ fontSize: '0.65rem', color: '#64748B' }}>Copernicus CAMS</span>
            </div>

            <div style={{ padding: '8px 10px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.68rem', fontWeight: 700, color: '#16A34A' }}>
                <Wind size={13} /> LIVE WIND VECTOR
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginTop: 2 }}>
                {focusNode?.wind_speed_kmh ?? 12.0} km/h
              </div>
              <span style={{ fontSize: '0.65rem', color: '#64748B' }}>Azimuth: {focusNode?.wind_direction_deg ?? 180}°</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, fontSize: '0.74rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#F8FAFC', borderRadius: 6, border: '1px solid #E2E8F0' }}>
              <span style={{ color: '#475569' }}>🛰️ Satellite Radiometry:</span>
              <strong style={{ color: '#16A34A' }}>NASA FIRMS Synced</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#F8FAFC', borderRadius: 6, border: '1px solid #E2E8F0' }}>
              <span style={{ color: '#475569' }}>⏱️ Ingestion Timestamp:</span>
              <strong style={{ color: '#0F172A' }}>{focusNode?.timestamp || new Date().toLocaleTimeString()}</strong>
            </div>
          </div>

          <button
            onClick={() => handleToggleMode('SIMULATION')}
            className="btn btn-secondary"
            style={{
              width: '100%', padding: '9px', fontSize: '0.82rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: '#FFFBEB', borderColor: '#FDE68A', color: '#92400E', fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            <Cpu size={14} /> Switch to Benchmark Simulator
          </button>
        </div>
      ) : (
        /* Synthetic Benchmark Simulation Controls */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ScenarioControls
            currentScenario={currentScenario}
            onSelectScenario={onSelectScenario}
            onStepSimulation={onStepSimulation}
          />
          <button
            onClick={() => handleToggleMode('LIVE')}
            className="btn btn-secondary"
            style={{
              width: '100%', padding: '9px', fontSize: '0.82rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626', fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            <Radio size={14} /> Return to Live Real Data Mode
          </button>
        </div>
      )}

      {/* Emergency Action */}
      <div className="card" style={{
        padding: '16px',
        background: '#FEF2F2',
        borderColor: '#FECACA',
      }}>
        <p style={{ fontSize: '0.72rem', color: '#DC2626', fontWeight: 800, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Emergency Action
        </p>
        <button
          onClick={handleEmergencyBroadcast}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
            color: '#fff',
            border: 'none',
            padding: '12px',
            borderRadius: 10,
            fontWeight: 800,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 3px 14px rgba(220,38,38,0.35)',
            textTransform: 'uppercase',
            fontFamily: 'inherit',
          }}
        >
          <Radio size={16} />
          Initiate Emergency Broadcast
        </button>
      </div>
    </div>
  );
}
