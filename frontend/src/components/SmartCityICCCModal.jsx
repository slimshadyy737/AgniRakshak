import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  X, Building2, Radio, Zap, Shield, AlertTriangle, CheckCircle2,
  Activity, Wind, Droplets, Gauge, Navigation, Send, RefreshCw,
  Copy, Check, FileCode, Play, Power, Cpu, Flame, Satellite, Plane,
  Truck, ArrowRight, ShieldCheck, HeartPulse, Sliders
} from 'lucide-react';

const TABS = [
  { id: 'traffic',   label: 'Traffic & Green Corridors', icon: <Truck size={15} /> },
  { id: 'scada',     label: 'Grid SCADA & Power Breakers', icon: <Zap size={15} /> },
  { id: 'water',     label: 'Water Grid & Smart Hydrants', icon: <Droplets size={15} /> },
  { id: 'bms',       label: 'Hospital & Building BMS', icon: <Building2 size={15} /> },
  { id: 'drone',     label: 'Drone-in-a-Box Recon (DiaB)', icon: <Plane size={15} /> },
  { id: 'cap',       label: 'CAP v1.2 XML & CAD Dispatch', icon: <FileCode size={15} /> },
];

export default function SmartCityICCCModal({ isOpen, onClose, systemStatus }) {
  const [activeTab, setActiveTab] = useState('traffic');
  const [cityData, setCityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedCap, setCopiedCap] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    if (isOpen) fetchStatus();
  }, [isOpen]);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/smartcity/status');
      setCityData(res.data);
    } catch (e) {
      console.error('Failed to fetch Smart City status:', e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(''), 3500);
  };

  const handleToggleCorridor = async (id) => {
    try {
      const res = await axios.post('/api/smartcity/traffic/toggle', { corridor_id: id });
      showToast(`🚦 Green Corridor updated: ${res.data.name} [${res.data.status}]`);
      fetchStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleBreaker = async (id) => {
    try {
      const res = await axios.post('/api/smartcity/scada/toggle-breaker', { feeder_id: id });
      showToast(`⚡ Substation Breaker ${res.data.id} is now ${res.data.breaker_status} [${res.data.hazard_risk}]`);
      fetchStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const handleBoostWater = async (id, currentPressure) => {
    const isBoosted = currentPressure > 80;
    try {
      const res = await axios.post('/api/smartcity/water/boost-pressure', { hydrant_id: id, boost: !isBoosted });
      showToast(`🚰 Hydrant ${res.data.id} pressure adjusted to ${res.data.pressure_psi} PSI`);
      fetchStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleBms = async (id) => {
    try {
      const res = await axios.post('/api/smartcity/bms/toggle-seal', { building_id: id });
      showToast(`🏢 BMS HVAC ${res.data.name} updated: Damper ${res.data.damper_status}`);
      fetchStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const handleLaunchDrone = async () => {
    try {
      const res = await axios.post('/api/smartcity/drone/launch');
      showToast(`🚁 DiaB Drone ${res.data.drone_name} Launched! Cruising at ${res.data.altitude_m}m with FLIR Thermal Optical feed.`);
      fetchStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyCap = () => {
    if (cityData) {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>URN:AGNIRAKSHAK:CAP:${Math.random().toString(16).slice(2, 10)}</identifier>
  <sender>iccc.disaster@smartcity.gov.in</sender>
  <sent>${new Date().toISOString()}</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <code>AgniRakshak-v5.03B</code>
  <info>
    <category>Fire</category>
    <event>Wildfire Early Combustion &amp; Spread Hazard</event>
    <urgency>Immediate</urgency>
    <severity>Severe</severity>
    <certainty>Observed</certainty>
    <eventHeadline>Wildfire Threat Alert - Jaipur Metropolitan Smart City</eventHeadline>
    <description>In-situ multi-sensor telemetry coupled with Gemma 3n physics-informed AI detected significant thermal anomalies, rapid rate of temperature rise, and elevated carbon monoxide plume.</description>
    <instruction>Execute Green Corridor preemption for Fire Department units. Seal hospital and educational HVAC fresh-air dampers. De-energize high-voltage power lines in sector perimeter.</instruction>
  </info>
</alert>`;
      navigator.clipboard.writeText(xml);
      setCopiedCap(true);
      setTimeout(() => setCopiedCap(false), 2000);
      showToast('📋 CAP v1.2 XML copied to clipboard');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(11, 17, 32, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999,
        padding: 16
      }}
    >
      <div style={{
        background: '#0B1120',
        borderRadius: 20,
        width: '100%',
        maxWidth: 1120,
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 40px rgba(2,132,199,0.2)',
        border: '1px solid #1E293B',
        overflow: 'hidden',
        color: '#F8FAFC'
      }}>
        {/* Top ICCC Command Bar */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #1E293B',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0F172A 0%, #0B1120 100%)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #0284C7 0%, #2563EB 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(2,132,199,0.4)'
            }}>
              <Building2 size={24} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, letterSpacing: -0.3, color: '#FFFFFF' }}>
                  Smart City Integrated Command Center (ICCC)
                </h2>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 800,
                  padding: '3px 8px', borderRadius: 4,
                  background: '#0284C7', color: '#FFFFFF', letterSpacing: 0.5
                }}>
                  BETA v5.03 B
                </span>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 800,
                  padding: '2px 7px', borderRadius: 4,
                  background: 'rgba(34,197,94,0.15)', color: '#4ADE80', border: '1px solid rgba(34,197,94,0.3)'
                }}>
                  ● ICCC ONLINE
                </span>
              </div>
              <p style={{ fontSize: '0.76rem', color: '#94A3B8', margin: '3px 0 0 0' }}>
                Municipal Traffic ATCS · Grid SCADA · Smart Hydrants · Building BMS (BACnet) · Autonomous Drone Fleet
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={fetchStatus}
              style={{
                background: '#1E293B', border: '1px solid #334155', color: '#38BDF8',
                borderRadius: 8, padding: '7px 12px', fontSize: '0.78rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer'
              }}
            >
              <RefreshCw size={13} className={loading ? 'spin' : ''} /> Refresh ICCC
            </button>

            <button
              onClick={onClose}
              style={{
                background: '#1E293B', border: 'none', borderRadius: 8,
                width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#94A3B8'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Status Notification Toast */}
        {actionMessage && (
          <div style={{
            background: 'linear-gradient(90deg, #0369A1 0%, #0284C7 100%)',
            color: '#FFFFFF', padding: '8px 24px', fontSize: '0.8rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <ShieldCheck size={16} /> {actionMessage}
          </div>
        )}

        {/* Sub-Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #1E293B',
          background: '#0F172A',
          padding: '0 20px',
          gap: 6,
          flexShrink: 0,
          overflowX: 'auto'
        }}>
          {TABS.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '12px 16px',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? '#38BDF8' : '#94A3B8',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #38BDF8' : '2px solid transparent',
                  cursor: 'pointer',
                  marginBottom: -1,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {t.icon}
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#0B1120' }}>

          {/* ── TAB 1: TRAFFIC & GREEN CORRIDORS ── */}
          {activeTab === 'traffic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{
                background: '#1E293B', border: '1px solid #334155', borderRadius: 14, padding: 18,
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14
              }}>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>ATCS SYSTEM</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38BDF8', marginTop: 3 }}>Siemens Sitraffic</div>
                  <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Adaptive Signal Preemption</span>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>SIGNALS PREEMPTED</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#4ADE80', marginTop: 3 }}>6 Intersections</div>
                  <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Continuous Green Wave</span>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>FIRST RESPONDER ETA</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#F59E0B', marginTop: 3 }}>3.8 min (-48% Time)</div>
                  <span style={{ fontSize: '0.7rem', color: '#64748B' }}>From Fire Station 04</span>
                </div>
              </div>

              <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 800, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Truck size={16} color="#38BDF8" /> Emergency Vehicle Preemption (EVP) Corridors
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {cityData?.corridors?.map((corr) => (
                  <div key={corr.id} style={{
                    background: corr.active ? 'rgba(2, 132, 199, 0.12)' : '#1E293B',
                    border: corr.active ? '1.5px solid #0284C7' : '1px solid #334155',
                    borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 12
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#38BDF8' }}>{corr.id}</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF', marginTop: 2 }}>{corr.name}</div>
                      </div>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: 4,
                        background: corr.active ? '#16A34A' : '#475569', color: '#FFFFFF'
                      }}>
                        {corr.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#94A3B8' }}>
                      <span>Length: <strong>{corr.route_length_km} km</strong></span>
                      <span>Signals: <strong>{corr.signals_preempted}/{corr.signals_count} Preempted</strong></span>
                      <span>ETA: <strong>{corr.eta_min} min</strong></span>
                    </div>

                    <button
                      onClick={() => handleToggleCorridor(corr.id)}
                      style={{
                        background: corr.active ? '#DC2626' : 'linear-gradient(135deg, #0284C7 0%, #2563EB 100%)',
                        color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '9px',
                        fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', gap: 6
                      }}
                    >
                      <Power size={14} /> {corr.active ? 'Deactivate Green Wave' : 'Activate Priority Green Corridor'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Highway VMS Signs */}
              <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: 18 }}>
                <h5 style={{ margin: '0 0 12px 0', fontSize: '0.84rem', fontWeight: 800, color: '#E2E8F0' }}>
                  Overhead Highway Variable Message Signs (VMS Digital Billboards)
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {cityData?.vms_highway_signs?.map((vms) => (
                    <div key={vms.sign_id} style={{
                      padding: 12, background: '#0B1120', borderRadius: 8, border: '1px solid #334155',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700 }}>{vms.location} ({vms.sign_id})</div>
                        <div style={{ fontSize: '0.85rem', color: '#F59E0B', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, marginTop: 4 }}>
                          "{vms.current_display}"
                        </div>
                      </div>
                      <span style={{ fontSize: '0.68rem', color: '#4ADE80', fontWeight: 800, padding: '3px 8px', background: 'rgba(34,197,94,0.15)', borderRadius: 4 }}>
                        ● {vms.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: GRID SCADA & POWER BREAKERS ── */}
          {activeTab === 'scada' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                <AlertTriangle size={24} color="#EF4444" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.78rem', color: '#FECACA', lineHeight: 1.45 }}>
                  <strong>High-Voltage Wildfire Arc Protection (DNP3 Protocol)</strong>: Air ionization by hot soot causes catastrophic power line flashovers. Trip breakers to de-energize overhead lines in active fire sectors.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
                {cityData?.scada_feeders?.map((feeder) => {
                  const isClosed = feeder.breaker_status === 'CLOSED';
                  return (
                    <div key={feeder.id} style={{
                      background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: 18,
                      display: 'flex', flexDirection: 'column', gap: 12
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#38BDF8' }}>{feeder.id}</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF', marginTop: 2 }}>{feeder.substation}</div>
                        </div>
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: 4,
                          background: isClosed ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)',
                          color: isClosed ? '#EF4444' : '#4ADE80',
                          border: `1px solid ${isClosed ? '#EF4444' : '#4ADE80'}`
                        }}>
                          {isClosed ? 'CLOSED (ENERGIZED)' : 'OPEN (TRIPPED / SAFE)'}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.76rem', color: '#94A3B8' }}>
                        <div>Voltage: <strong style={{ color: '#F8FAFC' }}>{feeder.voltage_kv} kV</strong></div>
                        <div>Load: <strong style={{ color: '#F8FAFC' }}>{feeder.load_mva} MVA</strong></div>
                        <div>Hazard Risk: <strong style={{ color: feeder.hazard_risk === 'ELEVATED' ? '#F59E0B' : '#4ADE80' }}>{feeder.hazard_risk}</strong></div>
                        <div>Auto-Trip: <strong style={{ color: '#38BDF8' }}>ENABLED</strong></div>
                      </div>

                      <button
                        onClick={() => handleToggleBreaker(feeder.id)}
                        style={{
                          background: isClosed ? '#DC2626' : '#16A34A',
                          color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '9px',
                          fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', gap: 6
                        }}
                      >
                        <Zap size={14} /> {isClosed ? 'Trip Breaker (De-Energize Line)' : 'Re-Energize Feeder Line'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── TAB 3: WATER GRID & HYDRANTS ── */}
          {activeTab === 'water' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
                {cityData?.water_hydrants?.map((hyd) => {
                  const isBoosted = hyd.pressure_psi > 80;
                  return (
                    <div key={hyd.id} style={{
                      background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: 18,
                      display: 'flex', flexDirection: 'column', gap: 12
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#38BDF8' }}>{hyd.id}</div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FFFFFF', marginTop: 2 }}>{hyd.location}</div>
                        </div>
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: 4,
                          background: isBoosted ? '#0284C7' : '#475569', color: '#FFFFFF'
                        }}>
                          {hyd.status}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.76rem', color: '#94A3B8' }}>
                        <div>Water Pressure: <strong style={{ color: isBoosted ? '#38BDF8' : '#F8FAFC', fontSize: '0.9rem' }}>{hyd.pressure_psi} PSI</strong></div>
                        <div>Flow Rate: <strong style={{ color: '#F8FAFC' }}>{hyd.flow_rate_lpm} LPM</strong></div>
                        <div>Valve State: <strong style={{ color: hyd.valve_state === 'OPEN' ? '#4ADE80' : '#94A3B8' }}>{hyd.valve_state}</strong></div>
                        <div>Reservoir: <strong style={{ color: '#4ADE80' }}>{hyd.reservoir_level_pct}% Full</strong></div>
                      </div>

                      <button
                        onClick={() => handleBoostWater(hyd.id, hyd.pressure_psi)}
                        style={{
                          background: isBoosted ? '#475569' : 'linear-gradient(135deg, #0284C7 0%, #2563EB 100%)',
                          color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '9px',
                          fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', gap: 6
                        }}
                      >
                        <Gauge size={14} /> {isBoosted ? 'Restore Normal Pressure (55 PSI)' : 'Boost Firefighting Pressure (120 PSI)'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── TAB 4: SMART BUILDINGS & HOSPITAL BMS ── */}
          {activeTab === 'bms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
                {cityData?.smart_buildings?.map((bldg) => {
                  const isSealed = bldg.damper_status === 'HEPA_SEALED';
                  return (
                    <div key={bldg.id} style={{
                      background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: 18,
                      display: 'flex', flexDirection: 'column', gap: 12
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#38BDF8' }}>{bldg.id}</div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FFFFFF', marginTop: 2 }}>{bldg.name}</div>
                        </div>
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: 4,
                          background: isSealed ? 'rgba(34,197,94,0.2)' : 'rgba(56,189,248,0.2)',
                          color: isSealed ? '#4ADE80' : '#38BDF8',
                          border: `1px solid ${isSealed ? '#4ADE80' : '#38BDF8'}`
                        }}>
                          {bldg.damper_status}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.76rem', color: '#94A3B8' }}>
                        <div>Indoor AQI: <strong style={{ color: '#4ADE80', fontSize: '0.9rem' }}>{bldg.air_quality_indoor_aqi} AQI</strong></div>
                        <div>Outdoor Smoke: <strong style={{ color: '#F59E0B' }}>{bldg.air_quality_outdoor_aqi} AQI</strong></div>
                        <div>Occupants / Patients: <strong style={{ color: '#F8FAFC' }}>{bldg.occupants_count || bldg.vulnerable_patients_count}</strong></div>
                        <div>HVAC Mode: <strong style={{ color: '#38BDF8' }}>{bldg.hvac_protocol}</strong></div>
                      </div>

                      <button
                        onClick={() => handleToggleBms(bldg.id)}
                        style={{
                          background: isSealed ? '#475569' : 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                          color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '9px',
                          fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', gap: 6
                        }}
                      >
                        <ShieldCheck size={14} /> {isSealed ? 'Reopen Fresh Air Dampers' : 'Seal HVAC (HEPA Smoke Isolation)'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── TAB 5: DRONE-IN-A-BOX RECONNAISSANCE ── */}
          {activeTab === 'drone' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18 }}>
                {/* Simulated FLIR Viewfinder */}
                <div style={{
                  background: '#000000', border: '2px solid #334155', borderRadius: 14, padding: 16,
                  display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', minHeight: 280
                }}>
                  <div style={{
                    position: 'absolute', top: 12, left: 16, zIndex: 2,
                    fontSize: '0.72rem', color: '#4ADE80', fontFamily: 'JetBrains Mono, monospace'
                  }}>
                    FLIR THERMAL IR · 8-14μm LWIR<br />
                    ALT: 120m | HDG: 215° SW | FOV: 45°
                  </div>
                  <div style={{
                    position: 'absolute', top: 12, right: 16, zIndex: 2,
                    fontSize: '0.72rem', color: '#EF4444', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800
                  }}>
                    ● REC [UAV LIVE FEED]
                  </div>

                  {/* Simulated Thermal Heat Spot */}
                  <div style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'radial-gradient(circle at 55% 45%, rgba(239,68,68,0.7) 0%, rgba(245,158,11,0.4) 25%, rgba(56,189,248,0.15) 60%, #000000 85%)',
                    borderRadius: 8, position: 'relative'
                  }}>
                    <div style={{
                      width: 80, height: 80, border: '1.5px dashed rgba(255,255,255,0.4)',
                      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <div style={{ width: 10, height: 10, background: '#EF4444', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                    </div>
                    <span style={{
                      position: 'absolute', bottom: 20,
                      background: 'rgba(0,0,0,0.7)', padding: '4px 10px', borderRadius: 4,
                      fontSize: '0.75rem', color: '#FCD34D', fontFamily: 'JetBrains Mono, monospace'
                    }}>
                      MAX TEMP: 58.4°C | CO GRADIENT DETECTED
                    </span>
                  </div>
                </div>

                {/* Drone Telemetry & Controls */}
                <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#38BDF8' }}>AUTONOMOUS DRONE-IN-A-BOX</div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', margin: '4px 0 14px 0' }}>
                      GARUDA-01 Recon UAV
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.78rem', color: '#CBD5E1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #334155' }}>
                        <span>Flight Status:</span>
                        <strong style={{ color: '#4ADE80' }}>AIRBORNE PATROL</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #334155' }}>
                        <span>Battery Level:</span>
                        <strong style={{ color: '#38BDF8' }}>88% LiPo Smart Pack</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #334155' }}>
                        <span>Ground Speed:</span>
                        <strong style={{ color: '#F8FAFC' }}>45 km/h</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                        <span>Thermal Hotspots:</span>
                        <strong style={{ color: '#EF4444' }}>1 Anomaly Tracked</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleLaunchDrone}
                    style={{
                      background: 'linear-gradient(135deg, #0284C7 0%, #2563EB 100%)',
                      color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '12px',
                      fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16
                    }}
                  >
                    <Plane size={16} /> Command Aerial Drone Sweep
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 6: CAP v1.2 XML & CAD DISPATCH LOG ── */}
          {activeTab === 'cap' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#F8FAFC' }}>
                  Common Alerting Protocol (CAP v1.2 XML Feed)
                </h4>
                <button
                  onClick={handleCopyCap}
                  style={{
                    background: '#1E293B', border: '1px solid #334155', color: '#38BDF8',
                    borderRadius: 8, padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer'
                  }}
                >
                  {copiedCap ? <Check size={14} color="#4ADE80" /> : <Copy size={14} />}
                  {copiedCap ? 'Copied XML' : 'Copy CAP XML'}
                </button>
              </div>

              <pre style={{
                background: '#000000', border: '1px solid #1E293B', borderRadius: 10,
                padding: 16, fontSize: '0.75rem', color: '#38BDF8', fontFamily: 'JetBrains Mono, monospace',
                lineHeight: 1.5, overflowX: 'auto', margin: 0
              }}>
{`<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>URN:AGNIRAKSHAK:CAP:9F4A812E01</identifier>
  <sender>iccc.disaster@smartcity.gov.in</sender>
  <sent>${new Date().toISOString()}</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <code>AgniRakshak-v5.03B</code>
  <info>
    <category>Fire</category>
    <event>Wildfire Early Combustion &amp; Spread Hazard</event>
    <urgency>Immediate</urgency>
    <severity>Severe</severity>
    <certainty>Observed</certainty>
    <eventHeadline>Wildfire Threat Alert - Jaipur Metropolitan Smart City</eventHeadline>
    <description>In-situ multi-sensor telemetry coupled with Gemma 3n physics-informed AI detected thermal anomalies, rapid rate of temperature rise, and elevated carbon monoxide plume.</description>
    <instruction>Execute Green Corridor preemption for Fire Department units. Seal hospital and educational HVAC dampers. De-energize high-voltage power lines in sector perimeter.</instruction>
  </info>
</alert>`}
              </pre>

              {/* CAD Incident Ticket Log */}
              <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: 18 }}>
                <h5 style={{ margin: '0 0 12px 0', fontSize: '0.84rem', fontWeight: 800, color: '#E2E8F0' }}>
                  Municipal Fire Department CAD Dispatch Tickets
                </h5>
                {cityData?.cad_tickets?.map((ticket) => (
                  <div key={ticket.ticket_id} style={{
                    padding: 12, background: '#0B1120', borderRadius: 8, border: '1px solid #334155',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#EF4444', fontWeight: 800 }}>
                        {ticket.ticket_id} · {ticket.priority}
                      </div>
                      <div style={{ fontSize: '0.86rem', color: '#F8FAFC', fontWeight: 700, marginTop: 3 }}>
                        {ticket.incident_sector} — {ticket.nature}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: 2 }}>
                        Assigned Units: <strong>{ticket.assigned_units.join(', ')}</strong> | Time: {ticket.timestamp}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px',
                      background: '#16A34A', color: '#FFFFFF', borderRadius: 6
                    }}>
                      {ticket.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
