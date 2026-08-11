import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Sparkles, Copy, Check, Printer, ShieldAlert, Cpu, Activity, Flame, Brain, AlertTriangle } from 'lucide-react';

// Inline markdown renderer
const renderInline = (text) => {
  if (!text) return null;
  return text.split(/(\*\*.*?\*\*|`.*?`)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} style={{ color: '#0F1923' }}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} style={{ background: '#F4F6F9', padding: '1px 5px', borderRadius: 4, color: '#EA580C', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85em' }}>{part.slice(1, -1)}</code>;
    return part;
  });
};

const FormattedMarkdown = ({ text }) => {
  if (!text) return null;
  return (
    <div style={{ lineHeight: 1.75, color: '#3D4F63', fontSize: '0.9rem' }}>
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### '))
          return <h3 key={i} style={{ color: '#EA580C', fontSize: '1.05rem', fontWeight: 800, marginTop: 20, marginBottom: 8 }}>{renderInline(line.slice(4))}</h3>;
        if (line.startsWith('#### '))
          return <h4 key={i} style={{ color: '#0369A1', fontSize: '0.95rem', fontWeight: 700, marginTop: 14, marginBottom: 6 }}>{renderInline(line.slice(5))}</h4>;
        if (line.startsWith('- '))
          return <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
            <span style={{ color: '#EA580C', flexShrink: 0, marginTop: 1 }}>•</span>
            <span>{renderInline(line.slice(2))}</span>
          </div>;
        if (/^\d+\.\s/.test(line))
          return <div key={i} style={{ marginLeft: 4, marginBottom: 6 }}>{renderInline(line)}</div>;
        if (line.startsWith('---'))
          return <hr key={i} style={{ border: 'none', borderTop: '1px solid #E2E6ED', margin: '16px 0' }} />;
        if (line.trim() === '') return <br key={i} />;
        return <p key={i} style={{ margin: '4px 0' }}>{renderInline(line)}</p>;
      })}
    </div>
  );
};

const TABS = [
  { id: 'executive', label: 'Executive Briefing',   icon: <Brain size={14} /> },
  { id: 'telemetry', label: 'Telemetry Audit',      icon: <Activity size={14} /> },
  { id: 'tactical',  label: 'Tactical Action Plan', icon: <AlertTriangle size={14} /> },
  { id: 'raw',       label: 'Raw JSON Log',          icon: <Cpu size={14} /> },
];

export default function AIReportModal({ isOpen, onClose, selectedNode }) {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('executive');

  useEffect(() => {
    if (isOpen && selectedNode) fetchReport();
  }, [isOpen, selectedNode?.node_id]);

  const fetchReport = async () => {
    setLoading(true);
    setReportData(null);
    try {
      const res = await axios.post('/api/analyze-fire-map', {
        latitude:  selectedNode.latitude,
        longitude: selectedNode.longitude,
        node_id:   selectedNode.node_id,
      });
      setReportData(res.data);
    } catch (e) {
      console.error('AI Report error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (reportData?.analysis) {
      navigator.clipboard.writeText(reportData.analysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  const node = selectedNode;
  const riskLevel = node?.risk_level ?? 0;
  const riskColor = riskLevel === 2 ? '#B91C1C' : riskLevel === 1 ? '#92400E' : '#15803D';
  const riskBg    = riskLevel === 2 ? '#FEF2F2' : riskLevel === 1 ? '#FFFBEB' : '#F0FDF4';

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15, 25, 35, 0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999,
        padding: 20,
      }}
    >
      <div style={{
        width: '100%', maxWidth: 900,
        maxHeight: '90vh',
        background: '#FFFFFF',
        border: '1px solid #E2E6ED',
        borderRadius: 16,
        boxShadow: '0 20px 60px rgba(15,25,35,0.18)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        animation: 'tabFadeIn 0.2s ease',
      }}>

        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #F0F2F5',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#FAFBFC',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'linear-gradient(135deg, #1D4ED8, #0369A1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 12px rgba(29,78,216,0.3)',
            }}>
              <Sparkles size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F1923', margin: 0 }}>
                AgniRakshak AI Intelligence Briefing
              </h3>
              <p style={{ fontSize: '0.74rem', color: '#7A8FA6', margin: 0 }}>
                Gemma 3n · FWI Analytics · Offline Cache Fallback · {node?.node_id}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={handleCopy} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={() => window.print()} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <Printer size={13} />
              Print / PDF
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent', border: 'none',
                color: '#7A8FA6', cursor: 'pointer',
                display: 'flex', alignItems: 'center',
                padding: 6, borderRadius: 6,
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 2,
          padding: '0 20px',
          borderBottom: '1px solid #F0F2F5',
          background: '#FFFFFF',
        }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 14px',
                  fontSize: '0.83rem', fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#1D4ED8' : '#7A8FA6',
                  background: 'transparent', border: 'none',
                  borderBottom: isActive ? '2px solid #1D4ED8' : '2px solid transparent',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                  marginBottom: -1, whiteSpace: 'nowrap',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ opacity: isActive ? 1 : 0.6 }}>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div style={{ padding: '22px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                border: '3px solid #BFDBFE',
                borderTopColor: '#1D4ED8',
                animation: 'radarSpin 0.9s linear infinite',
              }} />
              <p style={{ color: '#7A8FA6', fontWeight: 600, fontSize: '0.9rem' }}>
                Synthesizing Gemma 3n AI Risk Briefing...
              </p>
            </div>
          ) : reportData ? (
            <>
              {/* Executive Briefing */}
              {activeTab === 'executive' && (
                <FormattedMarkdown text={reportData.analysis} />
              )}

              {/* Telemetry Audit */}
              {activeTab === 'telemetry' && node && (
                <div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '6px 14px', borderRadius: 8,
                    background: riskBg, color: riskColor,
                    border: `1px solid ${riskColor}30`,
                    fontSize: '0.82rem', fontWeight: 700, marginBottom: 18,
                  }}>
                    <ShieldAlert size={14} />
                    {node.risk_label} — {node.node_name} ({node.node_id})
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
                    {[
                      { label: 'Temperature', value: `${node.temperature} °C`, sub: `Rate: ${node.derivatives?.dT_dt >= 0 ? '+' : ''}${node.derivatives?.dT_dt?.toFixed(2) ?? '0.00'} °C/min`, color: '#EA580C' },
                      { label: 'Carbon Monoxide', value: `${node.co_ppm} ppm`, sub: `Rate: ${node.derivatives?.dCO_dt >= 0 ? '+' : ''}${node.derivatives?.dCO_dt?.toFixed(2) ?? '0.00'} ppm/min`, color: '#D97706' },
                      { label: 'FWI Danger Rating', value: node.fwi_analytics?.danger_category ?? 'N/A', sub: `ISI: ${node.fwi_analytics?.initial_spread_index ?? '—'}`, color: riskColor },
                      { label: 'Rate of Spread', value: `${node.fwi_analytics?.rate_of_spread_m_min ?? '—'} m/min`, sub: 'Propagation velocity', color: '#B91C1C' },
                      { label: 'Humidity', value: `${node.humidity ?? '—'} %`, sub: 'Relative humidity', color: '#0369A1' },
                      { label: 'Wind Speed', value: `${node.wind_speed_kmh ?? '—'} km/h`, sub: `Direction: ${node.wind_direction_deg ?? '—'}°`, color: '#7C3AED' },
                    ].map(({ label, value, sub, color }) => (
                      <div key={label} style={{
                        background: '#F4F6F9',
                        border: '1px solid #E2E6ED',
                        borderRadius: 10, padding: '14px 16px',
                      }}>
                        <p className="section-label" style={{ marginBottom: 6 }}>{label}</p>
                        <div style={{
                          fontSize: '1.3rem', fontWeight: 800, color,
                          fontFamily: 'JetBrains Mono, monospace',
                          letterSpacing: '-0.02em', marginBottom: 4,
                        }}>
                          {value}
                        </div>
                        <p style={{ fontSize: '0.74rem', color: '#7A8FA6', margin: 0 }}>{sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tactical Action Plan */}
              {activeTab === 'tactical' && node && (
                <div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: '#FEF2F2', border: '1px solid #FECACA',
                    borderRadius: 10, padding: '12px 16px', marginBottom: 20,
                  }}>
                    <Flame size={18} color="#B91C1C" />
                    <div>
                      <p style={{ fontWeight: 700, color: '#B91C1C', margin: 0, fontSize: '0.9rem' }}>
                        Emergency Response Directives — Sector {node.node_id}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#7A8FA6', margin: 0 }}>
                        {node.latitude?.toFixed(4)}° N, {node.longitude?.toFixed(4)}° E
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { num: '01', title: 'Perimeter Isolation', detail: `Enforce 1.5 km downwind safety perimeter from coordinates ${node.latitude?.toFixed(4)}° N, ${node.longitude?.toFixed(4)}° E. Evacuate civilian zones.` },
                      { num: '02', title: 'Aerial Drone Vectoring', detail: 'Deploy UAV infrared thermal sweep along the western ridge to map active fire perimeter.' },
                      { num: '03', title: 'Chemical Retardant Drop', detail: `Target dry brush fuel beds exhibiting Vapor Pressure Deficit > 1.8 kPa. Rate of Spread: ${node.fwi_analytics?.rate_of_spread_m_min ?? '—'} m/min.` },
                      { num: '04', title: 'Responder Safety Protocol', detail: `SCBA respirators mandatory. Current CO concentration: ${node.co_ppm} ppm. Maintain 300m upwind distance.` },
                      { num: '05', title: 'Sensor Mesh Monitoring', detail: 'Continue live telemetry polling. Alert threshold: Temp > 45°C or CO > 80 ppm triggers evacuation.' },
                    ].map(({ num, title, detail }) => (
                      <div key={num} style={{
                        display: 'flex', gap: 14,
                        background: '#FAFBFC',
                        border: '1px solid #E2E6ED',
                        borderRadius: 10, padding: '14px 16px',
                      }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: 8,
                          background: '#FFF7ED', border: '1px solid #FFEDD5',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.72rem', fontWeight: 800, color: '#EA580C',
                          flexShrink: 0,
                        }}>
                          {num}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: '#0F1923', margin: '0 0 4px', fontSize: '0.9rem' }}>{title}</p>
                          <p style={{ fontSize: '0.83rem', color: '#3D4F63', margin: 0, lineHeight: 1.5 }}>{detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw JSON */}
              {activeTab === 'raw' && (
                <pre style={{
                  background: '#0F172A',
                  color: '#7DD3FC',
                  padding: '18px',
                  borderRadius: 10,
                  fontSize: '0.78rem',
                  overflowX: 'auto',
                  fontFamily: 'JetBrains Mono, monospace',
                  lineHeight: 1.7,
                  margin: 0,
                }}>
                  {JSON.stringify(reportData, null, 2)}
                </pre>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#7A8FA6' }}>
              <Brain size={32} style={{ opacity: 0.3, marginBottom: 10 }} />
              <p style={{ fontWeight: 600 }}>No report generated yet.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes radarSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
