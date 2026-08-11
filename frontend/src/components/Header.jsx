import React, { useState } from 'react';
import axios from 'axios';
import {
  Flame, FileText, Sparkles, Volume2, VolumeX,
  ShieldAlert, Map, Wifi, BarChart3, Cpu, Globe, Download,
} from 'lucide-react';

export default function Header({
  systemStatus,
  onOpenAIReport,
  isMuted,
  onToggleMute,
  activeTab,
  onSelectTab,
  onRegionChanged,
}) {
  const riskLevel = systemStatus?.system_risk_level ?? 0;

  const RISK = {
    2: { label: 'Critical Fire Alarm', dotColor: '#DC2626', bg: '#FEF2F2', border: '#FECACA', text: '#B91C1C' },
    1: { label: 'Elevated Risk',       dotColor: '#D97706', bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' },
    0: { label: 'System Normal',       dotColor: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D' },
  };
  const risk = RISK[riskLevel] ?? RISK[0];

  const regions = [
    { key: 'JAIPUR',     label: 'Jaipur Ridge',       flag: '🇮🇳' },
    { key: 'CALIFORNIA', label: 'Sierra Nevada',       flag: '🇺🇸' },
    { key: 'AMAZON',     label: 'Amazon Rainforest',   flag: '🇧🇷' },
    { key: 'AUSTRALIA',  label: 'NSW Bushlands',       flag: '🇦🇺' },
    { key: 'GREECE',     label: 'Attica Pine Forest',  flag: '🇬🇷' },
  ];

  const tabs = [
    { id: 'tactical-map',    label: 'Tactical Map',    icon: <Map       size={14} /> },
    { id: 'sensor-network',  label: 'Sensor Network',  icon: <Wifi      size={14} /> },
    { id: 'analytics',       label: 'Analytics',       icon: <BarChart3 size={14} /> },
    { id: 'ai-intelligence', label: 'AI Intelligence', icon: <Cpu       size={14} /> },
  ];

  const currentRegionKey = systemStatus?.active_region?.id || 'JAIPUR';

  const handleSelectRegion = async (key) => {
    try {
      await axios.post('/api/region/switch', { region_id: key });
      onRegionChanged?.();
    } catch (e) {
      console.error('Region switch error:', e);
    }
  };

  const handleOpenDispatch = () => {
    const base = axios.defaults.baseURL || '';
    window.open(`${base}/api/incidents/export-html`, '_blank');
  };

  const handleExportCSV = () => {
    const base = axios.defaults.baseURL || '';
    window.open(`${base}/api/telemetry/export-csv`, '_blank');
  };

  const [imgError, setImgError] = useState(false);

  return (
    <header style={{
      background: '#FFFFFF',
      borderBottom: '1px solid #E2E6ED',
      boxShadow: '0 1px 6px rgba(15,25,35,0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%',
    }}>
      {/* ── TOP BAR ── */}
      <div style={{
        maxWidth: 1480,
        margin: '0 auto',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {/* Logo — img with icon fallback */}
          <div style={{
            width: 40, height: 40,
            borderRadius: 10,
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(234,88,12,0.3)',
            flexShrink: 0,
            background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {!imgError ? (
              <img
                src="/AgniRakshak.png"
                alt="AgniRakshak"
                onError={() => setImgError(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Flame size={22} color="#fff" />
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{
                fontSize: '1.05rem', fontWeight: 800, color: '#0F1923',
                letterSpacing: '-0.02em', lineHeight: 1,
              }}>
                AgniRakshak
              </span>
              <span style={{
                fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.04em',
                padding: '2px 7px', borderRadius: '5px',
                background: '#FFF7ED', color: '#EA580C',
                border: '1px solid #FFEDD5',
              }}>
                v4.0 EDGE AI
              </span>
            </div>
            <p style={{ fontSize: '0.7rem', color: '#7A8FA6', fontWeight: 500, lineHeight: 1.3, marginTop: 2 }}>
              Wildfire Defense Command · Distributed Edge-AI
            </p>
          </div>
        </div>

        {/* Centre — Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '6px 14px',
            borderRadius: 8,
            background: risk.bg,
            border: `1px solid ${risk.border}`,
          }}>
            {/* Animated dot */}
            <span style={{ position: 'relative', width: 9, height: 9, flexShrink: 0 }}>
              <span style={{
                position: 'absolute', inset: 0,
                borderRadius: '50%',
                background: risk.dotColor,
                animation: riskLevel === 2 ? 'criticalPulse 1s infinite' : 'none',
              }} />
              {riskLevel === 2 && (
                <span style={{
                  position: 'absolute', inset: -3,
                  borderRadius: '50%',
                  border: `2px solid ${risk.dotColor}`,
                  opacity: 0.4,
                  animation: 'sonarRing 1.6s ease-out infinite',
                }} />
              )}
            </span>
            <ShieldAlert size={14} color={risk.text} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: risk.text }}>
              {risk.label}
            </span>
          </div>
        </div>

        {/* Right — Region + Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Region selector */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Globe size={13} style={{ position: 'absolute', left: 10, color: '#7A8FA6', pointerEvents: 'none' }} />
            <select
              value={currentRegionKey}
              onChange={(e) => handleSelectRegion(e.target.value)}
              style={{
                appearance: 'none',
                background: '#F4F6F9',
                border: '1px solid #E2E6ED',
                borderRadius: 8,
                paddingLeft: 28,
                paddingRight: 14,
                paddingTop: 7,
                paddingBottom: 7,
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#3D4F63',
                cursor: 'pointer',
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={e => e.target.style.borderColor = '#EA580C'}
              onBlur={e => e.target.style.borderColor = '#E2E6ED'}
            >
              {regions.map(r => (
                <option key={r.key} value={r.key}>{r.flag} {r.label}</option>
              ))}
            </select>
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary"
            style={{ padding: '7px 13px', fontSize: '0.82rem' }}
            title="Download Telemetry CSV"
          >
            <Download size={14} />
            Export CSV
          </button>

          {/* Dispatch */}
          <button
            onClick={handleOpenDispatch}
            className="btn btn-secondary"
            style={{ padding: '7px 13px', fontSize: '0.82rem' }}
          >
            <FileText size={14} />
            Dispatch
          </button>

          {/* AI Report */}
          <button
            onClick={onOpenAIReport}
            className="btn btn-primary"
            style={{ padding: '7px 13px', fontSize: '0.82rem' }}
          >
            <Sparkles size={14} />
            AI Report
          </button>

          {/* Mute */}
          <button
            onClick={onToggleMute}
            className="btn btn-icon"
            aria-label={isMuted ? 'Unmute siren' : 'Mute siren'}
            style={{
              background: isMuted ? '#FEF2F2' : '#F4F6F9',
              border: `1px solid ${isMuted ? '#FECACA' : '#E2E6ED'}`,
              color: isMuted ? '#B91C1C' : '#7A8FA6',
              borderRadius: 8, padding: 8, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div style={{
        maxWidth: 1480,
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderTop: '1px solid #F0F2F5',
      }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 16px',
                fontSize: '0.86rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#EA580C' : '#7A8FA6',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #EA580C' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'color 0.15s ease, border-color 0.15s ease',
                marginBottom: -1,
                borderRadius: 0,
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ opacity: isActive ? 1 : 0.6 }}>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}

        <div style={{ flex: 1 }} />

        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: '0.7rem', color: '#CBD2DC', padding: '8px 0',
        }}>
          {['1','2','3','4'].map(k => (
            <span key={k} className="kbd" style={{ fontSize: '0.65rem' }}>{k}</span>
          ))}
          <span>Switch views</span>
        </div>
      </div>

      <style>{`
        @keyframes criticalPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes sonarRing { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.5);opacity:0} }
      `}</style>
    </header>
  );
}
