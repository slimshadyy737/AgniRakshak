import React from 'react';
import { Battery, Signal, MapPin, Radio } from 'lucide-react';

export default function NodeDetails({ node }) {
  if (!node) return null;

  const getRiskColor = (level) => {
    if (level === 2) return '#EF4444';
    if (level === 1) return '#F59E0B';
    return '#10B981';
  };

  return (
    <div className="glass-card" style={{ height: '440px', padding: '18px' }}>
      <h3 style={{
        fontSize: '1.05rem',
        fontWeight: '700',
        color: 'var(--text-heading)',
        marginBottom: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Radio size={18} color="#0EA5E9" />
        Active Sensor Node Metadata
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--bg-card-border)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.5px' }}>NODE IDENTIFIER</span>
          <div style={{ color: 'var(--text-main)', fontWeight: '800', fontSize: '1.05rem', marginTop: '2px' }}>{node.node_name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1px' }}>ID: {node.node_id} • ESP32 Solar Mesh</div>
        </div>

        <div style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--bg-card-border)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.5px' }}>GEOSPATIAL LOCATION</span>
          <div style={{ color: 'var(--text-main)', fontWeight: '700', fontSize: '0.9rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} color="#F97316" />
            {node.latitude?.toFixed(4)}° N, {node.longitude?.toFixed(4)}° E
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
            Altitude: <strong>{node.altitude}m</strong>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ background: 'var(--bg-input)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--bg-card-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700' }}>
              <Battery size={14} color="#10B981" />
              BATTERY
            </div>
            <div style={{ color: 'var(--text-main)', fontWeight: '800', fontSize: '1.1rem', marginTop: '2px' }}>
              {node.battery_level}%
            </div>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--bg-card-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700' }}>
              <Signal size={14} color="#0EA5E9" />
              RSSI SIGNAL
            </div>
            <div style={{ color: 'var(--text-main)', fontWeight: '800', fontSize: '1.1rem', marginTop: '2px' }}>
              {node.rssi_dbm} dBm
            </div>
          </div>
        </div>

        <div style={{
          background: `${getRiskColor(node.risk_level)}10`,
          border: `1.5px solid ${getRiskColor(node.risk_level)}`,
          padding: '12px',
          borderRadius: '10px',
          marginTop: '4px'
        }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700' }}>PREDICTED RISK STATUS</span>
          <div style={{ color: getRiskColor(node.risk_level), fontWeight: '800', fontSize: '1.1rem' }}>
            {node.risk_label}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2px' }}>
            Confidence: <strong>{((node.confidence || 0.95) * 100).toFixed(1)}%</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
