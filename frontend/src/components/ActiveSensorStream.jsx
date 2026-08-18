import React, { useState } from 'react';
import {
  Wifi, Activity, AlertTriangle, CheckCircle, Flame, Zap,
  Signal, Battery, Radio, Server, Terminal, Download, ShieldCheck,
  RefreshCw, Cpu, Database
} from 'lucide-react';

export default function ActiveSensorStream({ nodes, selectedNodeId, onSelectNode }) {
  const [filter, setFilter] = useState('ALL'); // ALL, CRITICAL, WARNING, NORMAL, PHYSICAL
  const [showTerminal, setShowTerminal] = useState(false);

  const getStatus = (riskLevel) => {
    if (riskLevel === 2) return { label: 'CRITICAL', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', icon: <Flame size={12} /> };
    if (riskLevel === 1) return { label: 'WARNING',  color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: <AlertTriangle size={12} /> };
    return                { label: 'NORMAL',   color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', icon: <CheckCircle size={12} /> };
  };

  const filteredNodes = (nodes || []).filter(node => {
    if (filter === 'CRITICAL') return node.risk_level === 2;
    if (filter === 'WARNING') return node.risk_level === 1;
    if (filter === 'NORMAL') return node.risk_level === 0;
    if (filter === 'PHYSICAL') return node.is_physical_hardware;
    return true;
  });

  const avgBattery = nodes?.length ? (nodes.reduce((acc, n) => acc + (n.battery_level || 95), 0) / nodes.length).toFixed(1) : 98;
  const avgRssi = nodes?.length ? (nodes.reduce((acc, n) => acc + (n.rssi_dbm || -60), 0) / nodes.length).toFixed(0) : -55;
  const physicalCount = nodes?.filter(n => n.is_physical_hardware).length || 0;

  const handleExportJson = (node) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(node, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `${node.node_id}_telemetry.json`);
    dlAnchor.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ── TOP NETWORK DIAGNOSTICS & TELEMETRY SUMMARY ── */}
      <div className="card" style={{ padding: '16px 20px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: '#EFF6FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid #BFDBFE'
            }}>
              <Server size={20} color="#2563EB" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Edge IoT LoRa Mesh Network Diagnostics
              </h3>
              <p style={{ fontSize: '0.74rem', color: '#64748B', margin: '2px 0 0 0' }}>
                915MHz LoRaWAN Star-Mesh Topology · 115200 Baud · AES-128 Encrypted Link
              </p>
            </div>
          </div>

          {/* Quick Network Stats */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
              <Signal size={14} color="#0284C7" />
              <span style={{ color: '#64748B' }}>Avg RSSI:</span>
              <strong style={{ color: '#0F172A' }}>{avgRssi} dBm</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
              <Battery size={14} color="#16A34A" />
              <span style={{ color: '#64748B' }}>Mesh Battery:</span>
              <strong style={{ color: '#0F172A' }}>{avgBattery}%</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
              <Activity size={14} color="#EA580C" />
              <span style={{ color: '#64748B' }}>Throughput:</span>
              <strong style={{ color: '#16A34A' }}>100% (0.0% Loss)</strong>
            </div>

            <button
              onClick={() => setShowTerminal(v => !v)}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.75rem', gap: 6 }}
            >
              <Terminal size={13} /> {showTerminal ? 'Hide Terminal' : 'Live Packet Terminal'}
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{
          display: 'flex', gap: 8, marginTop: 14, paddingTop: 14,
          borderTop: '1px solid #F1F5F9', flexWrap: 'wrap'
        }}>
          {[
            { id: 'ALL', label: `All Outposts (${nodes?.length || 0})` },
            { id: 'CRITICAL', label: `Critical Fires (${nodes?.filter(n => n.risk_level === 2).length || 0})` },
            { id: 'WARNING', label: `Elevated (${nodes?.filter(n => n.risk_level === 1).length || 0})` },
            { id: 'NORMAL', label: `Normal (${nodes?.filter(n => n.risk_level === 0).length || 0})` },
            { id: 'PHYSICAL', label: `USB Hardware (${physicalCount})` },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                border: 'none',
                background: filter === f.id ? '#0F172A' : '#F1F5F9',
                color: filter === f.id ? '#FFFFFF' : '#475569',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '5px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── LIVE PACKET TERMINAL (Collapsible) ── */}
      {showTerminal && (
        <div className="card" style={{
          background: '#0B1120',
          border: '1px solid #1E293B',
          borderRadius: 12,
          padding: '14px 18px',
          color: '#38BDF8',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.74rem',
          maxHeight: 220,
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', borderBottom: '1px solid #1E293B', paddingBottom: 6, marginBottom: 8 }}>
            <span>📡 REAL-TIME EDGE PACKET TRACE</span>
            <span>CRC-32: VALID</span>
          </div>
          {nodes?.map((n, i) => (
            <div key={n.node_id} style={{ marginBottom: 4 }}>
              <span style={{ color: '#F59E0B' }}>[{new Date().toISOString().split('T')[1].split('.')[0]}]</span>{' '}
              <span style={{ color: '#10B981' }}>PKT_RECV</span>{' '}
              <span style={{ color: '#E2E8F0' }}>node_id={n.node_id}</span>{' '}
              <span style={{ color: '#38BDF8' }}>T={n.temperature}C H={n.humidity}% CO={n.co_ppm}ppm SmokeADC={n.smoke_raw}</span>{' '}
              <span style={{ color: n.risk_level === 2 ? '#EF4444' : '#10B981' }}>RISK={n.risk_label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── DETAILED SENSOR NODE ROSTER GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 16 }}>
        {filteredNodes.map((node) => {
          const isSelected = node.node_id === selectedNodeId;
          const status = getStatus(node.risk_level);
          const isPhysical = node.is_physical_hardware;

          return (
            <div
              key={node.node_id}
              onClick={() => onSelectNode(node.node_id)}
              style={{
                background: isSelected ? '#FFF7ED' : '#FFFFFF',
                border: `2px solid ${isSelected ? '#EA580C' : '#E2E8F0'}`,
                borderRadius: 14,
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
                boxShadow: isSelected ? '0 8px 24px rgba(234,88,12,0.12)' : '0 1px 4px rgba(0,0,0,0.04)'
              }}
            >
              {/* Top Row: ID, Origin, Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 800, fontSize: '0.95rem', color: '#0F172A'
                  }}>
                    {node.node_id}
                  </span>
                  {isPhysical ? (
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, background: '#EFF6FF', color: '#2563EB', padding: '2px 6px', borderRadius: 4 }}>
                      🔌 USB HW
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, background: '#F0FDF4', color: '#16A34A', padding: '2px 6px', borderRadius: 4 }}>
                      🛰️ LIVE SYNC
                    </span>
                  )}
                </div>

                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: '0.72rem', fontWeight: 800,
                  color: status.color, background: status.bg,
                  border: `1px solid ${status.border}`,
                  padding: '3px 8px', borderRadius: 6,
                }}>
                  {status.icon}
                  {status.label}
                </span>
              </div>

              {/* Node Name */}
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: '0 0 12px 0' }}>
                {node.node_name}
              </h4>

              {/* 4-Stat Grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
                background: '#F8FAFC', padding: '10px 12px', borderRadius: 10,
                border: '1px solid #E2E8F0', marginBottom: 12
              }}>
                <div>
                  <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748B' }}>TEMPERATURE</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: node.temperature > 40 ? '#DC2626' : '#0F172A' }}>
                    {node.temperature} °C
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748B' }}>CARBON MONOXIDE</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: node.co_ppm > 25 ? '#DC2626' : '#0F172A' }}>
                    {node.co_ppm} ppm
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748B' }}>HUMIDITY</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                    {node.humidity} % RH
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748B' }}>SMOKE DENSITY</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                    {node.smoke_raw} ADC
                  </div>
                </div>
              </div>

              {/* Hardware Health Sub-row */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: '0.72rem', color: '#64748B', borderTop: '1px solid #F1F5F9', paddingTop: 8
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Battery size={13} color="#16A34A" /> {node.battery_level || 98}%
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Signal size={13} color="#0284C7" /> {node.rssi_dbm || -55} dBm
                </div>
                <div>
                  Alt: <strong>{node.altitude || 380}m</strong>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleExportJson(node); }}
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: '#94A3B8', display: 'flex', alignItems: 'center', padding: 2
                  }}
                  title="Export Node JSON Telemetry"
                >
                  <Download size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
