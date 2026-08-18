import React from 'react';
import {
  Battery, Signal, MapPin, Radio, Trash2, Thermometer,
  Wind, Droplets, Flame, Activity, Cpu, ShieldCheck, AlertTriangle
} from 'lucide-react';

export default function NodeDetails({ node, onDecommissionNode }) {
  if (!node) {
    return (
      <div className="card" style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
        <Activity size={32} style={{ margin: '0 auto 8px', color: '#94A3B8' }} />
        <p style={{ margin: 0, fontWeight: 600 }}>Select a sensor node on the map to inspect telemetry</p>
      </div>
    );
  }

  const riskLevel = node.risk_level || 0;
  const riskColor = riskLevel === 2 ? '#DC2626' : riskLevel === 1 ? '#D97706' : '#16A34A';
  const riskBg = riskLevel === 2 ? '#FEF2F2' : riskLevel === 1 ? '#FFFBEB' : '#F0FDF4';
  const riskBorder = riskLevel === 2 ? '#FECACA' : riskLevel === 1 ? '#FDE68A' : '#BBF7D0';

  const dT = node.derivatives?.dT_dt ?? 0;
  const dCO = node.derivatives?.dCO_dt ?? 0;
  const fwi = node.fwi_analytics || {};

  return (
    <div className="card" style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: node.is_physical_hardware ? '#EFF6FF' : '#FFF7ED',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${node.is_physical_hardware ? '#BFDBFE' : '#FFEDD5'}`
          }}>
            <Radio size={18} color={node.is_physical_hardware ? '#2563EB' : '#EA580C'} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {node.node_name}
              </h3>
              <span style={{
                fontSize: '0.7rem', fontWeight: 700,
                background: node.is_physical_hardware ? '#EFF6FF' : '#F1F5F9',
                color: node.is_physical_hardware ? '#2563EB' : '#475569',
                padding: '2px 7px', borderRadius: 6,
                border: `1px solid ${node.is_physical_hardware ? '#BFDBFE' : '#E2E8F0'}`
              }}>
                {node.node_id}
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: '#64748B', margin: '2px 0 0 0' }}>
              {node.is_physical_hardware ? '🔌 USB Hardware Telemetry' : '🛰️ Open-Meteo & Copernicus CAMS Synced'} · Altitude: {node.altitude || 380}m
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            background: riskBg,
            color: riskColor,
            border: `1px solid ${riskBorder}`,
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: '0.76rem',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            {riskLevel === 2 ? <AlertTriangle size={12} /> : <ShieldCheck size={12} />}
            {node.risk_label || 'NORMAL'}
          </span>

          {onDecommissionNode && (
            <button
              onClick={() => {
                if (window.confirm(`Decommission node ${node.node_name} (${node.node_id})?`)) {
                  onDecommissionNode(node.node_id);
                }
              }}
              className="btn btn-secondary"
              style={{
                padding: '5px 9px',
                fontSize: '0.75rem',
                color: '#DC2626',
                borderColor: '#FECACA',
                background: '#FEF2F2',
                gap: 4,
              }}
              title="Decommission node from mesh"
            >
              <Trash2 size={13} />
              Decommission
            </button>
          )}
        </div>
      </div>

      {/* Main Grid — Telemetry + Physics + Hardware Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
        {/* Temp */}
        <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748B', fontSize: '0.72rem', fontWeight: 700 }}>
            <Thermometer size={13} color="#EA580C" /> TEMPERATURE
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
            {node.temperature} °C
          </div>
          <div style={{ fontSize: '0.68rem', color: dT >= 0 ? '#DC2626' : '#16A34A', fontWeight: 700, marginTop: 2 }}>
            dT/dt: {dT >= 0 ? '+' : ''}{dT.toFixed(2)} °C/min
          </div>
        </div>

        {/* Humidity */}
        <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748B', fontSize: '0.72rem', fontWeight: 700 }}>
            <Droplets size={13} color="#0284C7" /> HUMIDITY
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
            {node.humidity} %
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: 2 }}>
            VPD: <strong>{fwi.vpd_kpa || '1.8'} kPa</strong>
          </div>
        </div>

        {/* CO PPM */}
        <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748B', fontSize: '0.72rem', fontWeight: 700 }}>
            <Wind size={13} color="#B45309" /> CARBON MONOXIDE
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
            {node.co_ppm} ppm
          </div>
          <div style={{ fontSize: '0.68rem', color: dCO >= 0 ? '#DC2626' : '#16A34A', fontWeight: 700, marginTop: 2 }}>
            dCO/dt: {dCO >= 0 ? '+' : ''}{dCO.toFixed(2)} ppm/min
          </div>
        </div>

        {/* Smoke ADC & ROS */}
        <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748B', fontSize: '0.72rem', fontWeight: 700 }}>
            <Flame size={13} color="#DC2626" /> SMOKE & SPREAD
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
            {node.smoke_raw} <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748B' }}>ADC</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: 2 }}>
            ROS: <strong>{fwi.rate_of_spread_m_min || '0.2'} m/min</strong>
          </div>
        </div>
      </div>

      {/* Geospatial Coordinates, Battery, RSSI, AI Confidence */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr 1fr 1.2fr',
        gap: 10,
        background: '#F8FAFC',
        padding: '10px 14px',
        borderRadius: 10,
        border: '1px solid #E2E8F0',
        fontSize: '0.78rem',
        color: '#475569'
      }}>
        <div>
          <span style={{ color: '#94A3B8', fontSize: '0.68rem', fontWeight: 700, display: 'block' }}>GPS POSITION</span>
          <span style={{ fontWeight: 700, color: '#0F172A' }}>
            📍 {node.latitude?.toFixed(4)}° N, {node.longitude?.toFixed(4)}° E
          </span>
        </div>

        <div>
          <span style={{ color: '#94A3B8', fontSize: '0.68rem', fontWeight: 700, display: 'block' }}>BATTERY</span>
          <span style={{ fontWeight: 700, color: '#16A34A', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Battery size={13} /> {node.battery_level}%
          </span>
        </div>

        <div>
          <span style={{ color: '#94A3B8', fontSize: '0.68rem', fontWeight: 700, display: 'block' }}>LORA / RSSI</span>
          <span style={{ fontWeight: 700, color: '#2563EB', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Signal size={13} /> {node.rssi_dbm} dBm
          </span>
        </div>

        <div>
          <span style={{ color: '#94A3B8', fontSize: '0.68rem', fontWeight: 700, display: 'block' }}>AI MODEL CONFIDENCE</span>
          <span style={{ fontWeight: 700, color: '#7C3AED', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Cpu size={13} /> {((node.confidence || 0.96) * 100).toFixed(1)}% (RF+FWI)
          </span>
        </div>
      </div>
    </div>
  );
}
