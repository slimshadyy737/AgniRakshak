import React from 'react';
import { Wifi, Activity, AlertTriangle, CheckCircle, Flame } from 'lucide-react';

export default function ActiveSensorStream({ nodes, selectedNodeId, onSelectNode }) {
  const getStatus = (riskLevel) => {
    if (riskLevel === 2) return { label: 'CRITICAL', color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA', icon: <Flame size={11} /> };
    if (riskLevel === 1) return { label: 'WARNING',  color: '#92400E', bg: '#FFFBEB', border: '#FDE68A', icon: <AlertTriangle size={11} /> };
    return                { label: 'STABLE',   color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0', icon: <CheckCircle size={11} /> };
  };

  return (
    <div className="card" style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #F0F2F5',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: '#FFF7ED',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Wifi size={16} color="#EA580C" />
          </div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1923', margin: 0 }}>
            IoT Mesh Sensor Roster
          </h3>
        </div>
        <span className="badge badge-normal">
          {nodes.length} nodes online
        </span>
      </div>

      {/* Node Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12 }}>
        {nodes.map((node) => {
          const isSelected = node.node_id === selectedNodeId;
          const status = getStatus(node.risk_level);

          return (
            <div
              key={node.node_id}
              onClick={() => onSelectNode(node.node_id)}
              style={{
                background: isSelected ? '#FFF7ED' : '#FAFBFC',
                border: `1.5px solid ${isSelected ? '#EA580C' : '#E2E6ED'}`,
                borderRadius: 12,
                padding: '13px 15px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Left accent */}
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                background: status.color, borderRadius: '3px 0 0 3px',
              }} />

              <div style={{ paddingLeft: 4 }}>
                {/* Node ID + Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700, fontSize: '0.85rem', color: '#0F1923',
                  }}>
                    {node.node_id}
                  </span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: '0.68rem', fontWeight: 700,
                    color: status.color, background: status.bg,
                    border: `1px solid ${status.border}`,
                    padding: '2px 7px', borderRadius: '6px',
                  }}>
                    {status.icon}
                    {status.label}
                  </span>
                </div>

                {/* Name */}
                <p style={{ fontSize: '0.77rem', color: '#7A8FA6', fontWeight: 500, marginBottom: 9 }}>
                  {node.node_name}
                </p>

                {/* Readings */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 8, fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {[
                    { k: 'TEMP', v: `${node.temperature}°C`, hot: node.temperature > 40 },
                    { k: 'CO',   v: `${node.co_ppm}ppm`,     hot: node.co_ppm > 50 },
                    { k: 'WIND', v: `${node.wind_speed_kmh || 12}km/h`, hot: false },
                  ].map(({ k, v, hot }) => (
                    <div key={k}>
                      <div style={{ fontSize: '0.6rem', color: '#B0BFCF', textTransform: 'uppercase', marginBottom: 2 }}>{k}</div>
                      <strong style={{ fontSize: '0.82rem', color: hot ? '#B91C1C' : '#0F1923' }}>{v}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
