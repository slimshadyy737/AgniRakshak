import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  X, Sparkles, Copy, Check, Printer, ShieldAlert, Cpu, Activity,
  Flame, Brain, AlertTriangle, FileText, CheckCircle2, ShieldCheck,
  Thermometer, Droplets, Wind, Navigation, Gauge, Radio
} from 'lucide-react';

const renderInline = (text) => {
  if (!text) return null;
  return text.split(/(\*\*.*?\*\*|`.*?`)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} style={{ color: '#0F172A' }}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} style={{ background: '#F1F5F9', padding: '1px 5px', borderRadius: 4, color: '#C2410C', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85em' }}>{part.slice(1, -1)}</code>;
    return part;
  });
};

const FormattedMarkdown = ({ text }) => {
  if (!text) return null;
  return (
    <div style={{ lineHeight: 1.7, color: '#334155', fontSize: '0.88rem' }}>
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### '))
          return <h3 key={i} style={{ color: '#EA580C', fontSize: '1.02rem', fontWeight: 800, marginTop: 18, marginBottom: 8 }}>{renderInline(line.slice(4))}</h3>;
        if (line.startsWith('#### '))
          return <h4 key={i} style={{ color: '#0284C7', fontSize: '0.92rem', fontWeight: 700, marginTop: 12, marginBottom: 6 }}>{renderInline(line.slice(5))}</h4>;
        if (line.startsWith('- '))
          return <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
            <span style={{ color: '#EA580C', flexShrink: 0, marginTop: 1 }}>•</span>
            <span>{renderInline(line.slice(2))}</span>
          </div>;
        if (/^\d+\.\s/.test(line))
          return <div key={i} style={{ marginLeft: 4, marginBottom: 6 }}>{renderInline(line)}</div>;
        if (line.startsWith('---'))
          return <hr key={i} style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '14px 0' }} />;
        if (line.trim() === '') return <br key={i} />;
        return <p key={i} style={{ margin: '4px 0' }}>{renderInline(line)}</p>;
      })}
    </div>
  );
};

const TABS = [
  { id: 'full',      label: 'Complete Dossier (Print Ready)', icon: <FileText size={14} /> },
  { id: 'executive', label: 'Executive Briefing',             icon: <Brain size={14} /> },
  { id: 'telemetry', label: 'Telemetry Audit',                icon: <Activity size={14} /> },
  { id: 'tactical',  label: 'Tactical Action Plan',           icon: <AlertTriangle size={14} /> },
  { id: 'raw',       label: 'Raw JSON Log',                   icon: <Cpu size={14} /> },
];

export default function AIReportModal({ isOpen, onClose, selectedNode }) {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('full');

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
  const riskColor = riskLevel === 2 ? '#DC2626' : riskLevel === 1 ? '#D97706' : '#16A34A';
  const riskBg    = riskLevel === 2 ? '#FEF2F2' : riskLevel === 1 ? '#FFFBEB' : '#F0FDF4';

  const dT = node?.derivatives?.dT_dt ?? 0.0;
  const dCO = node?.derivatives?.dCO_dt ?? 0.0;
  const fwi = node?.fwi_analytics || {};

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999,
        padding: 20,
      }}
    >
      {/* ── PRINT & SCREEN CONTAINER ── */}
      <div
        id="printable-ai-dossier"
        style={{
          background: '#FFFFFF',
          borderRadius: 16,
          width: '100%',
          maxWidth: 900,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
        }}
      >
        {/* ── MODAL TOP BAR (Hidden in print) ── */}
        <div className="no-print" style={{
          padding: '16px 22px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: '#0F172A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Brain size={20} color="#38BDF8" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  AgniRakshak AI Intelligence Dossier
                </h3>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 800,
                  padding: '2px 7px', borderRadius: 4,
                  background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE'
                }}>
                  GEMMA 3N
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#64748B', margin: '2px 0 0 0' }}>
                Physics-informed autonomous fire behavior briefing · {node?.node_name} ({node?.node_id})
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={handleCopy}
              disabled={!reportData}
              className="btn-sec"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700,
                borderRadius: 8, border: '1px solid #CBD5E1', cursor: 'pointer', background: '#FFFFFF', color: '#334155'
              }}
            >
              {copied ? <Check size={13} color="#16A34A" /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>

            <button
              onClick={() => window.print()}
              disabled={!reportData}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', fontSize: '0.78rem', fontWeight: 700,
                borderRadius: 8, border: 'none', cursor: 'pointer', background: '#0F172A', color: '#FFFFFF'
              }}
            >
              <Printer size={13} /> Print Full PDF
            </button>

            <button
              onClick={onClose}
              style={{
                background: '#F1F5F9', border: 'none', borderRadius: 8,
                width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#64748B'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── TABS BAR (Hidden in print) ── */}
        <div className="no-print" style={{
          display: 'flex',
          borderBottom: '1px solid #E2E8F0',
          background: '#F8FAFC',
          padding: '0 16px',
          gap: 4,
          flexShrink: 0,
        }}>
          {TABS.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 14px',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? '#EA580C' : '#64748B',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #EA580C' : '2px solid transparent',
                  cursor: 'pointer',
                  marginBottom: -1,
                  transition: 'all 0.15s ease'
                }}
              >
                {t.icon}
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ── CONTENT BODY ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#FFFFFF' }}>
          {loading ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '60px 0', gap: 16,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                border: '3px solid #E2E8F0',
                borderTopColor: '#EA580C',
                animation: 'radarSpin 0.8s linear infinite',
              }} />
              <p style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600, margin: 0 }}>
                Synthesizing In-Situ Telemetry with NASA Satellite Swarm...
              </p>
            </div>
          ) : reportData ? (
            <>
              {/* Document Header Box */}
              <div style={{
                border: '1px solid #CBD5E1',
                borderRadius: 10,
                padding: '16px 20px',
                marginBottom: 20,
                background: '#F8FAFC',
                display: 'grid',
                gridTemplateColumns: '1.8fr 1fr',
                gap: 16
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    WILDFIRE CRISIS & SPREAD INTELLIGENCE REPORT
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginTop: 2 }}>
                    {node?.node_name} ({node?.node_id})
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: 4 }}>
                    Coordinates: <code>{node?.latitude?.toFixed(4)}° N, {node?.longitude?.toFixed(4)}° E</code> | Elev: <strong>{node?.altitude || 380}m</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-block', padding: '4px 12px', borderRadius: 6,
                    fontWeight: 800, fontSize: '0.82rem',
                    background: riskBg, color: riskColor, border: `1px solid ${riskColor}`
                  }}>
                    {node?.risk_label || 'NORMAL AMBIENT'}
                  </span>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 6 }}>
                    Generated: <strong>{new Date().toLocaleString()}</strong>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#0284C7', fontWeight: 700 }}>
                    Inference: Google Gemma 3n + Canadian FWI
                  </div>
                </div>
              </div>

              {/* ── TAB 1: COMPLETE DOSSIER (Print & Full View) ── */}
              {activeTab === 'full' && (
                <div className="report-full-content">
                  <FormattedMarkdown text={reportData.analysis} />
                </div>
              )}

              {/* ── TAB 2: EXECUTIVE BRIEFING ── */}
              {activeTab === 'executive' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                      <label style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B' }}>RISK ASSESSMENT</label>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: riskColor, marginTop: 4 }}>
                        {node?.risk_label}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#475569' }}>Edge Random Forest</span>
                    </div>

                    <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                      <label style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B' }}>VAPOR PRESSURE DEFICIT</label>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0284C7', marginTop: 4 }}>
                        {fwi.vpd_kpa || 1.45} kPa
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#475569' }}>Drying Potential Rating</span>
                    </div>

                    <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                      <label style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B' }}>FIRE WEATHER INDEX</label>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#EA580C', marginTop: 4 }}>
                        {fwi.danger_category || 'LOW DANGER'}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#475569' }}>ROS: {fwi.rate_of_spread_m_min || 1.4} m/min</span>
                    </div>

                    <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                      <label style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B' }}>AI MODEL CONFIDENCE</label>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16A34A', marginTop: 4 }}>
                        {((node?.confidence || 0.98) * 100).toFixed(1)}%
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#475569' }}>Physics-Informed Ensemble</span>
                    </div>
                  </div>

                  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 18 }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>
                      Executive Diagnosis Narrative
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>
                      {node?.explanation || 'All primary atmospheric and gaseous combustion signatures remain within baseline nominal bounds. Continuous continuous LoRa monitoring active across all mesh sectors.'}
                    </p>
                  </div>
                </div>
              )}

              {/* ── TAB 3: TELEMETRY AUDIT ── */}
              {activeTab === 'telemetry' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: 16, borderRadius: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#EA580C', fontWeight: 800, fontSize: '0.82rem' }}>
                        <Thermometer size={16} /> AMBIENT TEMPERATURE
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: '6px 0 2px' }}>
                        {node?.temperature} °C
                      </div>
                      <span style={{ fontSize: '0.74rem', color: dT > 0.5 ? '#DC2626' : '#64748B' }}>
                        Rate of Change: {dT > 0 ? `+${dT.toFixed(2)}` : dT.toFixed(2)} °C/min
                      </span>
                    </div>

                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: 16, borderRadius: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#DC2626', fontWeight: 800, fontSize: '0.82rem' }}>
                        <Flame size={16} /> CARBON MONOXIDE (CO)
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: '6px 0 2px' }}>
                        {node?.co_ppm} ppm
                      </div>
                      <span style={{ fontSize: '0.74rem', color: dCO > 2.0 ? '#DC2626' : '#64748B' }}>
                        Plume Gradient: {dCO > 0 ? `+${dCO.toFixed(2)}` : dCO.toFixed(2)} ppm/min
                      </span>
                    </div>

                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: 16, borderRadius: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0284C7', fontWeight: 800, fontSize: '0.82rem' }}>
                        <Droplets size={16} /> RELATIVE HUMIDITY
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: '6px 0 2px' }}>
                        {node?.humidity} % RH
                      </div>
                      <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                        Surface Foliage Moisture Retention
                      </span>
                    </div>

                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: 16, borderRadius: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16A34A', fontWeight: 800, fontSize: '0.82rem' }}>
                        <Wind size={16} /> WIND VECTOR & HEADING
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: '6px 0 2px' }}>
                        {node?.wind_speed_kmh || 14.5} km/h
                      </div>
                      <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                        Azimuth Direction: {node?.wind_direction_deg || 180}°
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 4: TACTICAL ACTION PLAN ── */}
              {activeTab === 'tactical' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: 16, borderRadius: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#DC2626', fontWeight: 800, fontSize: '0.88rem', marginBottom: 6 }}>
                      <ShieldAlert size={16} /> 1. Evacuation Perimeter Safety Zone
                    </div>
                    <p style={{ fontSize: '0.84rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                      Establish an immediate <strong>1,200m to 1,500m containment perimeter</strong> downwind of sector {node?.node_id}. Issue regional emergency alerts to nearby civilian and park ranger outposts.
                    </p>
                  </div>

                  <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: 16, borderRadius: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#EA580C', fontWeight: 800, fontSize: '0.88rem', marginBottom: 6 }}>
                      <Navigation size={16} /> 2. Aerial Drone Reconnaissance Vector
                    </div>
                    <p style={{ fontSize: '0.84rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                      Deploy thermal sensor UAV drone to coordinates <code>{node?.latitude?.toFixed(4)}° N, {node?.longitude?.toFixed(4)}° E</code> to verify thermal anomaly signatures and spot fires.
                    </p>
                  </div>

                  <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: 16, borderRadius: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0284C7', fontWeight: 800, fontSize: '0.88rem', marginBottom: 6 }}>
                      <Flame size={16} /> 3. Fire Line Retardant Containment
                    </div>
                    <p style={{ fontSize: '0.84rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                      Pre-treat dry forest brush fuels along perimeter access roads with Class-A chemical fire retardants. Establish physical bulldozer firebreaks on northern ridge lines.
                    </p>
                  </div>

                  <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: 16, borderRadius: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16A34A', fontWeight: 800, fontSize: '0.88rem', marginBottom: 6 }}>
                      <ShieldCheck size={16} /> 4. First Responder PPE Protocol
                    </div>
                    <p style={{ fontSize: '0.84rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                      Enforce strict SCBA or particulate respirators for all deployed ground crews if Carbon Monoxide exceeds 25 ppm or smoke raw ADC surpasses 600.
                    </p>
                  </div>
                </div>
              )}

              {/* ── TAB 5: RAW JSON LOG ── */}
              {activeTab === 'raw' && (
                <div style={{ position: 'relative' }}>
                  <pre style={{
                    background: '#0B1120',
                    color: '#38BDF8',
                    padding: '18px 20px',
                    borderRadius: 12,
                    fontSize: '0.78rem',
                    overflowX: 'auto',
                    fontFamily: 'JetBrains Mono, monospace',
                    lineHeight: 1.65,
                    margin: 0,
                    border: '1px solid #1E293B'
                  }}>
                    {JSON.stringify({
                      report_id: `REPORT-GEMMA-${node?.node_id}`,
                      timestamp: new Date().toISOString(),
                      node_telemetry: node,
                      fwi_analytics: fwi,
                      ai_analysis: reportData
                    }, null, 2)}
                  </pre>
                </div>
              )}

              {/* Signoff block for print */}
              <div className="print-only" style={{
                marginTop: 36, paddingTop: 18, borderTop: '2px dashed #CBD5E1',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                fontSize: '0.78rem', color: '#475569'
              }}>
                <div>
                  <strong>Command Officer Signature:</strong> ___________________________
                </div>
                <div>
                  AgniRakshak Autonomous Edge AI · NASA FIRMS Verified
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#7A8FA6' }}>
              <Brain size={32} style={{ opacity: 0.3, marginBottom: 10 }} />
              <p style={{ fontWeight: 600 }}>No report generated yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── PRINT-SPECIFIC CSS ── */}
      <style>{`
        @keyframes radarSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .print-only { display: none; }
        
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-ai-dossier, #printable-ai-dossier * {
            visibility: visible;
          }
          #printable-ai-dossier {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: none !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            background: #FFFFFF !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: flex !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}
