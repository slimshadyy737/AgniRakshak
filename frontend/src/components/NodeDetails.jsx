import React from 'react';
import { Battery, Signal, MapPin, Radio, Trash2 } from 'lucide-react';

export default function NodeDetails({ node, onDecommissionNode }) {
  if (!node) return null;

  const riskLevel = node.risk_level || 0;
  const riskColor  = riskLevel === 2 ? '#B91C1C' : riskLevel === 1 ? '#92400E' : '#15803D';
  const riskBg     = riskLevel === 2 ? '#FEF2F2' : riskLevel === 1 ? '#FFFBEB' : '#F0FDF4';
  const riskBorder = riskLevel === 2 ? '#FECACA' : riskLevel === 1 ? '#FDE68A' : '#BBF7D0';

  const infoRows = [
    { label: 'Node Identifier', value: node.node_name, sub: `ID: ${node.node_id} · ESP32 Solar Mesh` },
    { label: 'Geospatial Location', value: `${node.latitude?.toFixed(4)}° N, ${node.longitude?.toFixed(4)}° E`, icon: <MapPin size={13} color="#EA580C" />, sub: `Altitude: ${node.altitude}m` },
  ];

  return (
    <div className="card" style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: '#EFF6FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Radio size={16} color="#1D4ED8" />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1923', margin: 0 }}>
              Active Node Metadata
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#7A8FA6', margin: 0 }}>Live sensor telemetry</p>
          </div>
        </div>

        {onDecommissionNode && (
          <button
            onClick={() => {
              if (window.confirm(`Decommission IoT node ${node.node_name} (${node.node_id})?`)) {
                onDecommissionNode(node.node_id);
              }
            }}
            className="btn btn-secondary"
            style={{
              padding: '5px 10px',
              fontSize: '0.75rem',
              color: '#B91C1C',
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Info rows */}
        {infoRows.map((row) => (
          <div key={row.label} style={{
            background: '#F4F6F9',
            padding: '11px 14px',
            borderRadius: 10,
            border: '1px solid #E2E6ED',
          }}>
            <p className="section-label" style={{ marginBottom: 3 }}>{row.label}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, color: '#0F1923', fontSize: '0.92rem' }}>
              {row.icon}
              {row.value}
            </div>
            {row.sub && <p style={{ fontSize: '0.75rem', color: '#7A8FA6', marginTop: 2 }}>{row.sub}</p>}
          </div>
        ))}

        {/* Battery & Signal */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { icon: <Battery size={14} color="#15803D" />, label: 'Battery', value: `${node.battery_level}%` },
            { icon: <Signal  size={14} color="#1D4ED8" />, label: 'RSSI Signal', value: `${node.rssi_dbm} dBm` },
          ].map((item) => (
            <div key={item.label} style={{
              background: '#F4F6F9',
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid #E2E6ED',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                {item.icon}
                <span className="section-label">{item.label}</span>
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F1923', fontFamily: 'JetBrains Mono, monospace' }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* Risk Status */}
        <div style={{
          background: riskBg,
          border: `1px solid ${riskBorder}`,
          padding: '12px 14px',
          borderRadius: 10,
        }}>
          <p className="section-label" style={{ marginBottom: 4, color: riskColor }}>Predicted Risk Status</p>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: riskColor }}>{node.risk_label}</div>
          <p style={{ fontSize: '0.77rem', color: '#7A8FA6', marginTop: 3 }}>
            Confidence: <strong style={{ color: riskColor }}>{((node.confidence || 0.95) * 100).toFixed(1)}%</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
