import React from 'react';
import { Thermometer, Wind, Activity, Cpu, Radio, Droplets } from 'lucide-react';

export default function MetricsRow({ systemStatus, focusNode }) {
  const riskLevel = systemStatus?.system_risk_level || 0;
  const isLive = systemStatus?.is_live_data ?? true;

  const risk = riskLevel === 2
    ? { label: 'Critical Fire Risk', badgeClass: 'badge badge-critical', valueColor: '#B91C1C' }
    : riskLevel === 1
    ? { label: 'Elevated Warning',   badgeClass: 'badge badge-warning',  valueColor: '#92400E' }
    : { label: 'System Normal',      badgeClass: 'badge badge-normal',   valueColor: '#15803D' };

  const dT  = focusNode?.derivatives?.dT_dt ?? 0;
  const dCO = focusNode?.derivatives?.dCO_dt ?? 0;

  const metrics = [
    {
      label: 'Network Risk Status',
      icon: <Activity size={18} color={riskLevel === 2 ? '#B91C1C' : riskLevel === 1 ? '#B45309' : '#15803D'} />,
      value: systemStatus?.system_risk_label || 'NORMAL',
      valueColor: risk.valueColor,
      badge: <span className={risk.badgeClass}>{risk.label}</span>,
      sub: isLive ? (
        <span style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Radio size={11} className="animate-pulse" /> <strong>LIVE DATA STREAM</strong>
        </span>
      ) : (
        <>Scenario: <strong>{systemStatus?.current_scenario || 'NORMAL'}</strong></>
      ),
    },
    {
      label: 'Ambient Temp & Rate',
      icon: <Thermometer size={18} color="#EA580C" />,
      value: focusNode?.temperature != null ? `${focusNode.temperature} °C` : '— °C',
      valueColor: '#0F1923',
      badge: (
        <span className={`badge ${dT >= 0 ? 'badge-critical' : 'badge-normal'}`}
          style={{ fontSize: '0.72rem' }}>
          {dT >= 0 ? '+' : ''}{dT.toFixed(2)} °C/min
        </span>
      ),
      sub: <>Node: <strong>{focusNode?.node_name || 'NODE-01'}</strong> ({isLive ? 'Open-Meteo' : 'Sim'})</>,
    },
    {
      label: 'Atmospheric CO & Smoke',
      icon: <Wind size={18} color="#B45309" />,
      value: focusNode?.co_ppm != null ? `${focusNode.co_ppm} ppm` : '— ppm',
      valueColor: '#0F1923',
      badge: (
        <span className={`badge ${dCO >= 0 ? 'badge-critical' : 'badge-normal'}`}
          style={{ fontSize: '0.72rem' }}>
          {dCO >= 0 ? '+' : ''}{dCO.toFixed(2)} ppm/min
        </span>
      ),
      sub: <>Copernicus CAMS: <strong>{focusNode?.smoke_raw || '—'} eq ADC</strong></>,
    },
    {
      label: 'AI & Physics Engine',
      icon: <Cpu size={18} color="#0369A1" />,
      value: focusNode?.confidence != null
        ? `${(focusNode.confidence * 100).toFixed(1)}%`
        : '100.0%',
      valueColor: '#0369A1',
      badge: <span className="badge" style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', fontSize: '0.72rem' }}>RANDOM FOREST + FWI</span>,
      sub: <>VPD: <strong>{focusNode?.fwi_analytics?.vpd_kpa || '1.8'} kPa</strong> · ROS: <strong>{focusNode?.fwi_analytics?.rate_of_spread_m_min || '0.2'} m/m</strong></>,
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '16px',
    }}>
      {metrics.map((m) => (
        <div key={m.label} className="stat-card">
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: '#F4F6F9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {m.icon}
              </div>
              <span className="section-label">{m.label}</span>
            </div>
          </div>

          {/* Value */}
          <div style={{
            fontSize: '1.9rem', fontWeight: 800,
            color: m.valueColor,
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '-0.03em',
            lineHeight: 1,
            marginBottom: 8,
          }}>
            {m.value}
          </div>

          {/* Badge + sub */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {m.badge}
          </div>
          <p style={{ fontSize: '0.78rem', color: '#7A8FA6', marginTop: 6 }}>
            {m.sub}
          </p>
        </div>
      ))}
    </div>
  );
}
