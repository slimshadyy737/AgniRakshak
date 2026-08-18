import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  Flame, FileText, Sparkles, Volume2, VolumeX,
  ShieldCheck, AlertTriangle, Map, Wifi, BarChart3, Cpu, Globe, Download,
  Radio, Zap, ChevronDown, Plus, Navigation
} from 'lucide-react';

export default function Header({
  systemStatus,
  onOpenAIReport,
  onOpenNASA,
  onOpenWebSerial,
  onOpenCustomLocation,
  isMuted,
  onToggleMute,
  activeTab,
  onSelectTab,
  onRegionChanged,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const riskLevel = systemStatus?.system_risk_level ?? 0;
  const isLiveData = systemStatus?.is_live_data ?? true;

  const RISK = {
    2: { label: 'Critical Fire Alert', dotColor: '#DC2626', bg: '#FEF2F2', border: '#FECACA', text: '#B91C1C' },
    1: { label: 'Elevated Risk',       dotColor: '#D97706', bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' },
    0: { label: 'System Normal',       dotColor: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D' },
  };
  const risk = RISK[riskLevel] ?? RISK[0];

  const regions = [
    { key: 'JAIPUR',     label: 'Manipal Univ Jaipur (MUJ) & Dehmi', code: 'IN' },
    { key: 'NAHARGARH',  label: 'Nahargarh & Jaigarh Forest',         code: 'IN' },
    { key: 'CALIFORNIA', label: 'Sierra Nevada, California',          code: 'US' },
    { key: 'AMAZON',     label: 'Amazon Basin, Brazil',               code: 'BR' },
    { key: 'AUSTRALIA',  label: 'NSW Bushlands, Australia',           code: 'AU' },
    { key: 'GREECE',     label: 'Attica Forest, Greece',              code: 'GR' },
  ];

  const tabs = [
    { id: 'tactical-map',    label: 'Tactical Map',    icon: <Map       size={14} /> },
    { id: 'sensor-network',  label: 'Sensor Network',  icon: <Wifi      size={14} /> },
    { id: 'analytics',       label: 'Analytics',       icon: <BarChart3 size={14} /> },
    { id: 'ai-intelligence', label: 'AI Intelligence', icon: <Cpu       size={14} /> },
  ];

  const currentRegionKey = systemStatus?.active_region?.id || 'JAIPUR';
  const currentRegionName = systemStatus?.active_region?.name || 'Jaipur Ridge, India';

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectRegion = async (key) => {
    setDropdownOpen(false);
    try {
      await axios.post('/api/region/switch', { region_id: key });
      onRegionChanged?.();
    } catch (e) {
      console.error('Region switch error:', e);
    }
  };

  const handleToggleDataMode = async () => {
    const newMode = isLiveData ? 'SIMULATION' : 'LIVE';
    try {
      await axios.post('/api/live/mode', { mode: newMode });
      onRegionChanged?.();
    } catch (e) {
      console.error('Data mode toggle error:', e);
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
        maxWidth: 1540,
        margin: '0 auto',
        padding: '0 20px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 38, height: 38,
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
              <Flame size={20} color="#fff" />
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                fontSize: '1.05rem', fontWeight: 800, color: '#0F1923',
                letterSpacing: '-0.02em', lineHeight: 1,
              }}>
                AgniRakshak
              </span>
              <span style={{
                fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.04em',
                padding: '2px 6px', borderRadius: '5px',
                background: '#FFF7ED', color: '#EA580C',
                border: '1px solid #FFEDD5',
              }}>
                v4.6 LIVE GIS
              </span>
            </div>
            <p style={{ fontSize: '0.68rem', color: '#7A8FA6', fontWeight: 500, lineHeight: 1.2, marginTop: 2, whiteSpace: 'nowrap' }}>
              NASA EONET · Copernicus CAMS · Open-Meteo · Edge IoT
            </p>
          </div>
        </div>

        {/* Centre — Live Mode Switcher & Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Real Data Mode Switch Button */}
          <button
            onClick={handleToggleDataMode}
            className="btn"
            style={{
              background: isLiveData ? 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)' : '#F1F5F9',
              color: isLiveData ? '#FFFFFF' : '#475569',
              border: isLiveData ? 'none' : '1px solid #CBD5E1',
              padding: '6px 11px',
              borderRadius: 8,
              fontSize: '0.76rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              boxShadow: isLiveData ? '0 2px 8px rgba(220, 38, 38, 0.3)' : 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            title="Toggle between Live Public Database Sync and Simulation"
          >
            <Radio size={12} className={isLiveData ? 'animate-pulse' : ''} />
            {isLiveData ? '🔴 LIVE REAL DATA' : '🟡 SIMULATION'}
          </button>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 12px',
            borderRadius: 8,
            background: risk.bg,
            border: `1px solid ${risk.border}`,
            whiteSpace: 'nowrap'
          }}>
            <span style={{ position: 'relative', width: 8, height: 8, flexShrink: 0 }}>
              <span style={{
                position: 'absolute', inset: 0,
                borderRadius: '50%',
                background: risk.dotColor,
                animation: riskLevel === 2 ? 'criticalPulse 1s infinite' : 'none',
              }} />
            </span>
            {riskLevel === 2 ? <AlertTriangle size={13} color={risk.text} /> : <ShieldCheck size={13} color={risk.text} />}
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: risk.text }}>
              {risk.label}
            </span>
          </div>
        </div>

        {/* Right — Custom Region Dropdown + Actions Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {/* Custom Styled Region Selector Dropdown */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(v => !v)}
              className="btn btn-secondary"
              style={{
                padding: '6px 10px',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                color: '#1E293B',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                whiteSpace: 'nowrap'
              }}
            >
              <Globe size={13} color="#0284C7" />
              <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentRegionName.split(',')[0]}
              </span>
              <ChevronDown size={12} color="#64748B" />
            </button>

            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 6,
                background: '#FFFFFF',
                borderRadius: 12,
                boxShadow: '0 10px 30px rgba(15,23,42,0.18)',
                border: '1px solid #E2E8F0',
                width: 260,
                zIndex: 1000,
                overflow: 'hidden',
                padding: 6
              }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', padding: '6px 10px', textTransform: 'uppercase' }}>
                  Select Wildfire Sector
                </div>

                {regions.map((r) => (
                  <div
                    key={r.key}
                    onClick={() => handleSelectRegion(r.key)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 8,
                      fontSize: '0.8rem',
                      fontWeight: currentRegionKey === r.key ? 700 : 500,
                      color: currentRegionKey === r.key ? '#EA580C' : '#334155',
                      background: currentRegionKey === r.key ? '#FFF7ED' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                    onMouseEnter={e => { if (currentRegionKey !== r.key) e.currentTarget.style.background = '#F8FAFC'; }}
                    onMouseLeave={e => { if (currentRegionKey !== r.key) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#F1F5F9', color: '#475569', padding: '1px 5px', borderRadius: 4 }}>
                      [{r.code}]
                    </span>
                    <span>{r.label}</span>
                  </div>
                ))}

                <div style={{ borderTop: '1px solid #F1F5F9', marginTop: 4, paddingTop: 4 }}>
                  <div
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenCustomLocation?.();
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 8,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#16A34A',
                      background: '#F0FDF4',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Navigation size={13} color="#16A34A" />
                    <span>+ Custom GPS / World City</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* NASA Live Wildfire Explorer Button */}
          <button
            onClick={onOpenNASA}
            className="btn btn-secondary"
            style={{
              padding: '6px 10px', fontSize: '0.78rem',
              color: '#DC2626', borderColor: '#FECACA', background: '#FEF2F2',
              whiteSpace: 'nowrap', gap: 4
            }}
            title="Explore Real Active Wildfires from NASA EONET Worldwide"
          >
            <Flame size={13} />
            NASA Fires
          </button>

          {/* Connect Physical Hardware USB Sensor */}
          <button
            onClick={onOpenWebSerial}
            className="btn btn-secondary"
            style={{
              padding: '6px 10px', fontSize: '0.78rem',
              color: '#2563EB', borderColor: '#BFDBFE', background: '#EFF6FF',
              whiteSpace: 'nowrap', gap: 4
            }}
            title="Connect ESP32 / Arduino sensor via USB Serial or Virtual Stream"
          >
            <Zap size={13} />
            USB Sensor
          </button>

          {/* AI Report */}
          <button
            onClick={onOpenAIReport}
            className="btn btn-primary"
            style={{ padding: '6px 11px', fontSize: '0.78rem', whiteSpace: 'nowrap', gap: 4 }}
          >
            <Sparkles size={13} />
            AI Report
          </button>

          {/* Dispatch */}
          <button
            onClick={handleOpenDispatch}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.78rem', whiteSpace: 'nowrap', gap: 4 }}
          >
            <FileText size={13} />
            Dispatch
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.78rem', whiteSpace: 'nowrap', gap: 4 }}
            title="Download Telemetry CSV"
          >
            <Download size={13} />
            CSV
          </button>

          {/* Mute Siren */}
          <button
            onClick={onToggleMute}
            className="btn btn-icon"
            aria-label={isMuted ? 'Unmute siren' : 'Mute siren'}
            style={{
              background: isMuted ? '#FEF2F2' : '#F4F6F9',
              border: `1px solid ${isMuted ? '#FECACA' : '#E2E6ED'}`,
              color: isMuted ? '#B91C1C' : '#7A8FA6',
              borderRadius: 8, padding: 6, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div style={{
        maxWidth: 1540,
        margin: '0 auto',
        padding: '0 20px',
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
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 15px',
                fontSize: '0.84rem',
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

        {/* Live Public Database Status Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#64748B' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#F8FAFC', padding: '3px 7px', borderRadius: 6, border: '1px solid #E2E8F0' }}>
            🛰️ NASA EONET: <strong style={{ color: '#16A34A' }}>ONLINE</strong>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#F8FAFC', padding: '3px 7px', borderRadius: 6, border: '1px solid #E2E8F0' }}>
            🌤️ Open-Meteo: <strong style={{ color: '#0284C7' }}>SYNCED</strong>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#F8FAFC', padding: '3px 7px', borderRadius: 6, border: '1px solid #E2E8F0' }}>
            🌍 Copernicus: <strong style={{ color: '#EA580C' }}>ACTIVE</strong>
          </span>
        </div>
      </div>

      <style>{`
        @keyframes criticalPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </header>
  );
}
