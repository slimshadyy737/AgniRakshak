import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Sparkles, Copy, Check, Printer, ShieldAlert, Cpu, Activity, Compass, Flame } from 'lucide-react';

// Helper function to parse inline bold **text** and `code` tags into React elements
const renderFormattedText = (text) => {
  if (!text) return null;

  // Split by ** delimiters to identify bold text
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} style={{ color: 'var(--text-heading)', fontWeight: '800' }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index} style={{ background: 'var(--bg-input)', padding: '2px 6px', borderRadius: '4px', color: '#0EA5E9', fontSize: '0.88rem' }}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
};

// Formatted Markdown Component handling Headers, Lists, Dividers, and Inline Bold Text
const FormattedMarkdown = ({ text }) => {
  if (!text) return null;

  const lines = text.split('\n');
  return (
    <div style={{ lineHeight: '1.7' }}>
      {lines.map((line, idx) => {
        if (line.startsWith('### ')) {
          return (
            <h3 key={idx} style={{
              color: '#F97316',
              fontSize: '1.25rem',
              fontWeight: '800',
              marginTop: '16px',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {renderFormattedText(line.replace('### ', ''))}
            </h3>
          );
        }
        if (line.startsWith('#### ')) {
          return (
            <h4 key={idx} style={{
              color: '#38BDF8',
              fontSize: '1.08rem',
              fontWeight: '700',
              marginTop: '16px',
              marginBottom: '8px'
            }}>
              {renderFormattedText(line.replace('#### ', ''))}
            </h4>
          );
        }
        if (line.startsWith('- ')) {
          return (
            <li key={idx} style={{ marginLeft: '20px', marginBottom: '6px', color: 'var(--text-main)' }}>
              {renderFormattedText(line.replace('- ', ''))}
            </li>
          );
        }
        if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
          return (
            <div key={idx} style={{ marginLeft: '12px', marginBottom: '8px', fontWeight: '500' }}>
              {renderFormattedText(line)}
            </div>
          );
        }
        if (line.startsWith('---')) {
          return <hr key={idx} style={{ borderColor: 'var(--bg-card-border)', margin: '16px 0', opacity: 0.6 }} />;
        }
        if (line.trim() === '') return <br key={idx} />;
        return <p key={idx} style={{ margin: '6px 0', color: 'var(--text-main)' }}>{renderFormattedText(line)}</p>;
      })}
    </div>
  );
};

export default function AIReportModal({ isOpen, onClose, selectedNode }) {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('executive');

  useEffect(() => {
    if (isOpen && selectedNode) {
      fetchAIReport();
    }
  }, [isOpen, selectedNode]);

  const fetchAIReport = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/analyze-fire-map', {
        latitude: selectedNode.latitude,
        longitude: selectedNode.longitude,
        node_id: selectedNode.node_id
      });
      setReportData(res.data);
    } catch (e) {
      console.error('Error fetching Gemma AI report:', e);
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

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(11, 17, 32, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '880px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '20px',
        border: '1.5px solid var(--bg-card-border)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.65)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--bg-card-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-input)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
              padding: '10px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
            }}>
              <Sparkles size={22} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>
                AgniRakshak Gemma 3n AI Crisis Intelligence Briefing
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Google Gemma 3n Architecture with Offline Cache Fallback & FWI Analytics
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleCopy}
              style={{
                background: copied ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-card-border)',
                border: `1px solid ${copied ? '#10B981' : 'transparent'}`,
                color: copied ? '#10B981' : 'var(--text-main)',
                padding: '7px 14px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Text'}
            </button>

            <button
              onClick={handlePrint}
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                color: '#FFFFFF',
                border: 'none',
                padding: '7px 14px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              <Printer size={14} />
              Print / Save PDF
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 24px',
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--bg-card-border)'
        }}>
          <button
            onClick={() => setActiveTab('executive')}
            style={{
              background: activeTab === 'executive' ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)' : 'transparent',
              color: activeTab === 'executive' ? '#FFFFFF' : 'var(--text-muted)',
              border: 'none',
              padding: '7px 18px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            📋 Executive Briefing
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            style={{
              background: activeTab === 'telemetry' ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)' : 'transparent',
              color: activeTab === 'telemetry' ? '#FFFFFF' : 'var(--text-muted)',
              border: 'none',
              padding: '7px 18px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            📡 Telemetry & FWI Audit
          </button>

          <button
            onClick={() => setActiveTab('tactical')}
            style={{
              background: activeTab === 'tactical' ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)' : 'transparent',
              color: activeTab === 'tactical' ? '#FFFFFF' : 'var(--text-muted)',
              border: 'none',
              padding: '7px 18px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            🚒 Tactical Action Plan
          </button>

          <button
            onClick={() => setActiveTab('raw')}
            style={{
              background: activeTab === 'raw' ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)' : 'transparent',
              color: activeTab === 'raw' ? '#FFFFFF' : 'var(--text-muted)',
              border: 'none',
              padding: '7px 18px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            ⚙️ Raw JSON Log
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Sparkles size={36} color="#3B82F6" style={{ animation: 'spin 2s linear infinite' }} />
              <p style={{ marginTop: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>
                Synthesizing Gemma 3n AI Environmental Risk Briefing...
              </p>
            </div>
          ) : reportData ? (
            <>
              {activeTab === 'executive' && (
                <div>
                  <FormattedMarkdown text={reportData.analysis} />
                </div>
              )}

              {activeTab === 'telemetry' && selectedNode && (
                <div>
                  <h4 style={{ color: 'var(--text-heading)', marginBottom: '14px', fontSize: '1.1rem' }}>
                    Sensor Telemetry Audit — {selectedNode.node_name} ({selectedNode.node_id})
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', border: '1px solid var(--bg-card-border)' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700' }}>TEMPERATURE & DERIVATIVE</span>
                      <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#F97316', marginTop: '4px' }}>
                        {selectedNode.temperature} °C ({selectedNode.derivatives?.dT_dt >= 0 ? `+${selectedNode.derivatives?.dT_dt.toFixed(2)}` : selectedNode.derivatives?.dT_dt.toFixed(2)} °C/min)
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', border: '1px solid var(--bg-card-border)' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700' }}>CARBON MONOXIDE & DERIVATIVE</span>
                      <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#F59E0B', marginTop: '4px' }}>
                        {selectedNode.co_ppm} ppm ({selectedNode.derivatives?.dCO_dt >= 0 ? `+${selectedNode.derivatives?.dCO_dt.toFixed(2)}` : selectedNode.derivatives?.dCO_dt.toFixed(2)} ppm/min)
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', border: '1px solid var(--bg-card-border)' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700' }}>FIRE WEATHER INDEX (FWI)</span>
                      <div style={{ fontSize: '1.45rem', fontWeight: '800', color: selectedNode.fwi_analytics?.color || '#EF4444', marginTop: '4px' }}>
                        {selectedNode.fwi_analytics?.danger_category || 'HIGH DANGER'}
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', border: '1px solid var(--bg-card-border)' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700' }}>RATE OF SPREAD (ROS)</span>
                      <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#EF4444', marginTop: '4px' }}>
                        {selectedNode.fwi_analytics?.rate_of_spread_m_min || 2.4} m/min
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tactical' && selectedNode && (
                <div>
                  <h4 style={{ color: '#EF4444', marginBottom: '14px', fontSize: '1.1rem' }}>
                    🚒 Emergency Response Directives — Sector {selectedNode.node_id}
                  </h4>
                  <ul style={{ lineHeight: '1.9', fontSize: '0.94rem' }}>
                    <li><strong>Perimeter Isolation:</strong> Enforce 1.5 km downwind safety perimeter from coordinates <code>{selectedNode.latitude.toFixed(4)}° N, {selectedNode.longitude.toFixed(4)}° E</code>.</li>
                    <li><strong>Aerial Drone Vectoring:</strong> Deploy UAV infrared thermal sweep along the western ridge.</li>
                    <li><strong>Chemical Retardant Drop:</strong> Target dry brush fuel beds exhibiting Vapor Pressure Deficit &gt; 1.8 kPa.</li>
                    <li><strong>Responder Safety:</strong> SCBA respirators mandatory due to CO concentration ({selectedNode.co_ppm} ppm).</li>
                  </ul>
                </div>
              )}

              {activeTab === 'raw' && (
                <pre style={{
                  background: 'var(--bg-input)',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  color: '#38BDF8',
                  overflowX: 'auto',
                  border: '1px solid var(--bg-card-border)'
                }}>
                  {JSON.stringify(reportData, null, 2)}
                </pre>
              )}
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No report data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
