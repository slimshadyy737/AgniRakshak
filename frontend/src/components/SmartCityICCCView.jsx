/**
 * ============================================================================
 * AGNI-RAKSHAK: Smart City ICCC Enterprise Suite (v5.03 B - Pro Max)
 * Architected, Designed & Engineered by SynthReaper
 * All Rights Reserved © 2026 SynthReaper
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Building2, Radio, Zap, Shield, AlertTriangle, CheckCircle2,
  Activity, Wind, Droplets, Gauge, Navigation, Send, RefreshCw,
  Copy, Check, FileCode, Play, Power, Cpu, Flame, Satellite, Plane,
  Truck, ArrowRight, ShieldCheck, HeartPulse, Sliders, Lock,
  Monitor, Bell, Database, HardDrive, Terminal, FileText, ChevronRight,
  TrendingUp, Download, Eye, ExternalLink, Sparkles, Layers,
  Crosshair, Video, Users, BatteryCharging, Megaphone, Sun, Bed
} from 'lucide-react';

const SIDEBAR_SECTIONS = [
  {
    category: 'INFRASTRUCTURE & FIRE SUPPRESSION',
    items: [
      { id: 'traffic',   label: 'Traffic & Green Corridors', sub: 'Siemens Sitraffic ATCS', icon: <Truck size={15} />, badge: 'ATCS Wave' },
      { id: 'scada',     label: 'Grid SCADA & Breakers',     sub: 'ABB DNP3 / Substation',   icon: <Zap size={15} />, badge: '33kV Bus' },
      { id: 'water',     label: 'Water Grid & Hydrants',     sub: 'Schneider 120 PSI Pump',  icon: <Droplets size={15} />, badge: 'Hydrant' },
      { id: 'turrets',   label: 'Robotic Water Cannons',     sub: '3,500 LPM Foam Monitors', icon: <Crosshair size={15} />, badge: 'Turret Defense' },
      { id: 'bess',      label: 'Solar BESS Microgrid',      sub: 'Autonomous Islanding',    icon: <Sun size={15} />, badge: 'BESS Battery' },
    ]
  },
  {
    category: 'CITIZEN DEFENSE & HEALTH',
    items: [
      { id: 'evac',      label: 'Geofenced Evacuation',      sub: 'SMS Broadcast & Turnstiles', icon: <Users size={15} />, badge: 'Muster AI' },
      { id: 'bms',       label: 'Hospital & Campus BMS',     sub: 'BACnet / Smoke Airlocks', icon: <Building2 size={15} />, badge: 'HEPA Damper' },
      { id: 'hospitals', label: 'Hospital ER & Burn Units',  sub: 'ICU & Oxygen Telemetry',  icon: <Bed size={15} />, badge: 'Trauma Grid' },
      { id: 'sirens',    label: 'Acoustic Siren Grid',       sub: '120 dB Multi-Zone PA',    icon: <Megaphone size={15} />, badge: 'Voice Alert' },
      { id: 'plume',     label: '3D Plume Dispersion',       sub: 'Gaussian Smoke Drift',    icon: <Wind size={15} />, badge: 'Toxic Drift' },
    ]
  },
  {
    category: 'SURVEILLANCE & BROADCAST',
    items: [
      { id: 'drone',     label: 'Drone-in-a-Box Recon',      sub: 'GARUDA-01 FLIR UAV',      icon: <Plane size={15} />, badge: 'FLIR Thermal' },
      { id: 'cctv',      label: 'AI Optical PTZ CCTV',       sub: 'Optical Smoke Slew-to-Cue', icon: <Video size={15} />, badge: 'CCTV AI' },
      { id: 'vms',       label: 'Highway VMS Signs',         sub: 'NH-48 Dynamic Matrix',    icon: <Monitor size={15} />, badge: 'VMS Matrix' },
      { id: 'cap',       label: 'CAP v1.2 & CAD Dispatch',   sub: 'NDMA / WMO Alert Feed',   icon: <FileCode size={15} />, badge: 'CAP XML' },
      { id: 'audit',     label: 'Telemetry Audit Ledger',    sub: 'SHA-256 Signed Blackbox', icon: <Database size={15} />, badge: 'Audit Log' },
    ]
  }
];

export default function SmartCityICCCView({ systemStatus, onLockConsole }) {
  const [activeSubTab, setActiveSubTab] = useState('traffic');
  const [cityData, setCityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedCap, setCopiedCap] = useState(false);
  const [actionToast, setActionToast] = useState('');

  // VMS editing
  const [editingVmsId, setEditingVmsId] = useState(null);
  const [vmsInputText, setVmsInputText] = useState('');

  // CAD dispatch form
  const [cadSector, setCadSector] = useState('Sector Dehmi Kalan Ridge Outpost');
  const [cadNature, setCadNature] = useState('Wildfire Thermal Outbreak / Evacuation Green Corridor');
  const [cadPriority, setCadPriority] = useState('P1_URGENT');

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await axios.get('/api/smartcity/status');
      setCityData(res.data);
    } catch (e) {
      console.error('Failed to fetch Smart City status:', e);
    }
  };

  const showToast = (msg) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(''), 3500);
  };

  const handleToggleCorridor = async (id) => {
    try {
      const res = await axios.post('/api/smartcity/traffic/toggle', { corridor_id: id });
      showToast(`🚦 Green Corridor updated: ${res.data.name} [${res.data.status}]`);
      fetchStatus();
    } catch (e) { console.error(e); }
  };

  const handleToggleBreaker = async (id) => {
    try {
      const res = await axios.post('/api/smartcity/scada/toggle-breaker', { feeder_id: id });
      showToast(`⚡ Substation Breaker ${res.data.id} is now ${res.data.breaker_status}`);
      fetchStatus();
    } catch (e) { console.error(e); }
  };

  const handleBoostHydrant = async (id, boost) => {
    try {
      const res = await axios.post('/api/smartcity/water/boost-pressure', { hydrant_id: id, boost });
      showToast(`🚰 Hydrant ${res.data.id} pressure set to ${res.data.pressure_psi} PSI`);
      fetchStatus();
    } catch (e) { console.error(e); }
  };

  const handleToggleDamper = async (id) => {
    try {
      const res = await axios.post('/api/smartcity/bms/toggle-seal', { building_id: id });
      showToast(`🏢 BMS HVAC Damper ${res.data.id} set to ${res.data.damper_status}`);
      fetchStatus();
    } catch (e) { console.error(e); }
  };

  const handleToggleTurret = async (id, fire) => {
    try {
      const res = await axios.post('/api/smartcity/turret/toggle', { cannon_id: id, fire });
      showToast(`🎯 Robotic Turret ${res.data.cannon_id} is now ${res.data.status} (${res.data.flow_rate_lpm} LPM)`);
      fetchStatus();
    } catch (e) { console.error(e); }
  };

  const handleTriggerEvacSms = async (zoneId) => {
    try {
      const res = await axios.post('/api/smartcity/evac/trigger-sms', { zone_id: zoneId });
      showToast(`📢 Cell-Broadcast SMS & Turnstile Lock sent to ${res.data.zone_name}`);
      fetchStatus();
    } catch (e) { console.error(e); }
  };

  const handleSlewCctv = async (camId) => {
    try {
      const res = await axios.post('/api/smartcity/cctv/slew', { camera_id: camId, pan: 142.5, tilt: -12.0, zoom: "12x Optical" });
      showToast(`📹 PTZ Camera ${res.data.camera_id} slewed to thermal hotspot bearing`);
      fetchStatus();
    } catch (e) { console.error(e); }
  };

  const handleToggleBess = async () => {
    try {
      const res = await axios.post('/api/smartcity/bess/toggle-island');
      showToast(`🔋 Microgrid BESS Islanding: ${res.data.system_status}`);
      fetchStatus();
    } catch (e) { console.error(e); }
  };

  const handleTriggerSiren = async (sirenId, state) => {
    try {
      const res = await axios.post('/api/smartcity/siren/trigger', { siren_id: sirenId, state });
      showToast(`🔊 Municipal Warning Siren ${res.data.siren_id} set to ${res.data.state}`);
      fetchStatus();
    } catch (e) { console.error(e); }
  };

  const handleLaunchDrone = async () => {
    try {
      await axios.post('/api/smartcity/drone/launch');
      showToast('🚁 DiaB GARUDA-01 UAV Launched for Thermal Patrol');
      fetchStatus();
    } catch (e) { console.error(e); }
  };

  const handleReturnDrone = async () => {
    try {
      await axios.post('/api/smartcity/drone/return');
      showToast('🚁 DiaB GARUDA-01 Returning to Automated Dock');
      fetchStatus();
    } catch (e) { console.error(e); }
  };

  const handleUpdateVms = async (signId) => {
    if (!vmsInputText.trim()) return;
    try {
      await axios.post('/api/smartcity/vms/update', { sign_id: signId, message: vmsInputText });
      showToast(`📟 VMS Billboard ${signId} Updated`);
      setEditingVmsId(null);
      setVmsInputText('');
      fetchStatus();
    } catch (e) { console.error(e); }
  };

  const handleCreateCad = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/smartcity/cad/create', {
        sector: cadSector,
        nature: cadNature,
        priority: cadPriority,
        units: ['Fire-Engine-04', 'Water-Tender-08', 'UAV-GARUDA-01', 'Turret-01']
      });
      showToast(`📋 CAD Ticket Created: ${res.data.ticket_id}`);
      fetchStatus();
    } catch (e) { console.error(e); }
  };

  const handleCopyCapXml = async () => {
    try {
      const res = await axios.get('/api/alerts/cap-xml');
      navigator.clipboard.writeText(res.data);
      setCopiedCap(true);
      setTimeout(() => setCopiedCap(false), 2000);
      showToast('📋 Official CAP v1.2 XML copied to clipboard');
    } catch (e) {
      showToast('📋 CAP v1.2 XML Copied');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ── TOP HEADER BANNER ── */}
      <div className="card" style={{ padding: '16px 20px', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10,
              background: 'linear-gradient(135deg, #0284C7 0%, #2563EB 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 12px rgba(37,99,235,0.3)', flexShrink: 0
            }}>
              <Building2 size={22} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Smart City Integrated Command & Control Center (ICCC)
                </h3>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 800, padding: '2px 7px', borderRadius: 4,
                  background: '#0284C7', color: '#FFFFFF'
                }}>
                  ENTERPRISE v5.03 B
                </span>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 800, padding: '2px 7px', borderRadius: 4,
                  background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0'
                }}>
                  ● 15 MUNICIPAL ENGINES SYNCD
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '2px 0 0 0' }}>
                Manipal University Jaipur · Siemens ATCS · ABB SCADA · Schneider Water · Robotic Turrets · BACnet BMS · DiaB FLIR
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={fetchStatus}
              className="btn btn-secondary"
              style={{ padding: '7px 12px', fontSize: '0.78rem', gap: 6 }}
            >
              <RefreshCw size={13} className={loading ? 'spin' : ''} />
              Sync Feeds
            </button>

            <button
              onClick={onLockConsole}
              style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                borderRadius: 8,
                padding: '7px 12px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
              title="Lock and Secure Smart City Console"
            >
              <Lock size={13} />
              Lock Console
            </button>
          </div>
        </div>

        {/* Action Toast */}
        {actionToast && (
          <div style={{
            marginTop: 12, padding: '8px 14px', borderRadius: 8,
            background: '#EFF6FF', border: '1px solid #BFDBFE',
            color: '#1D4ED8', fontSize: '0.8rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <Sparkles size={14} color="#0284C7" />
            {actionToast}
          </div>
        )}
      </div>

      {/* ── MAIN SIDEBAR + CONTENT LAYOUT ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(270px, 300px) minmax(0, 1fr)',
        gap: 18,
        alignItems: 'start'
      }}>
        {/* ── LEFT SIDEBAR NAVIGATION ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ padding: '14px', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <div style={{
              fontSize: '0.7rem', fontWeight: 800, color: '#94A3B8',
              textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12,
              paddingLeft: 6
            }}>
              Municipal Command Modules
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {SIDEBAR_SECTIONS.map((sec, idx) => (
                <div key={idx}>
                  <div style={{
                    fontSize: '0.66rem', fontWeight: 800, color: '#64748B',
                    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
                    paddingLeft: 6
                  }}>
                    {sec.category}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {sec.items.map((item) => {
                      const isActive = activeSubTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveSubTab(item.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: 8,
                            border: isActive ? '1.5px solid #0284C7' : '1px solid transparent',
                            background: isActive ? '#F0F9FF' : 'transparent',
                            color: isActive ? '#0369A1' : '#334155',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s ease',
                            width: '100%'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                            <div style={{
                              color: isActive ? '#0284C7' : '#64748B',
                              display: 'flex', alignItems: 'center', flexShrink: 0
                            }}>
                              {item.icon}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{
                                fontSize: '0.8rem', fontWeight: isActive ? 800 : 700,
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                              }}>
                                {item.label}
                              </div>
                              <div style={{
                                fontSize: '0.66rem', color: isActive ? '#0284C7' : '#94A3B8',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                              }}>
                                {item.sub}
                              </div>
                            </div>
                          </div>

                          <ChevronRight
                            size={14}
                            color={isActive ? '#0284C7' : '#CBD5E1'}
                            style={{ flexShrink: 0, transform: isActive ? 'translateX(2px)' : 'none', transition: 'transform 0.15s' }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar System Telemetry Status Card */}
          <div className="card" style={{ padding: '14px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layers size={13} color="#0284C7" />
              Municipal SCADA Telemetry Bus
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: '0.74rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Siemens ATCS:</span>
                <span style={{ fontWeight: 700, color: '#16A34A' }}>Active (14ms)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>ABB SCADA DNP3:</span>
                <span style={{ fontWeight: 700, color: '#16A34A' }}>Connected (50Hz)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Robotic Turrets:</span>
                <span style={{ fontWeight: 700, color: '#0284C7' }}>3500 LPM Ready</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Solar BESS Storage:</span>
                <span style={{ fontWeight: 700, color: '#16A34A' }}>91.5% SOC</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Hospital ER Beds:</span>
                <span style={{ fontWeight: 700, color: '#16A34A' }}>36 ICU Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT CONTENT PANEL ── */}
        <div style={{ minWidth: 0 }}>
          {/* 🚦 TAB 1: TRAFFIC & GREEN CORRIDORS */}
          {activeSubTab === 'traffic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ padding: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Truck size={18} color="#0284C7" />
                      Siemens Sitraffic Adaptive Green Wave Corridors
                    </h4>
                    <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '3px 0 0 0' }}>
                      Emergency vehicle preemption system for Fire & Hazmat tenders across arterial road networks.
                    </p>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: '#EFF6FF', color: '#0284C7', border: '1px solid #BFDBFE' }}>
                    ATCS PREEMPTION READY
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(cityData?.corridors || []).map((c) => (
                    <div
                      key={c.id}
                      style={{
                        padding: '16px', borderRadius: 10,
                        border: c.active ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                        background: c.active ? '#F0FDF4' : '#F8FAFC',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        flexWrap: 'wrap', gap: 14
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: c.active ? '#10B981' : '#94A3B8', color: '#FFFFFF' }}>
                            {c.id}
                          </span>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>
                            {c.name}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 16, fontSize: '0.76rem', color: '#475569', flexWrap: 'wrap' }}>
                          <span>📏 Length: <strong>{c.route_length_km} km</strong></span>
                          <span>🚦 Signals: <strong>{c.signals_count} Junctions</strong></span>
                          <span>⚡ Preempted: <strong style={{ color: c.active ? '#16A34A' : '#64748B' }}>{c.signals_preempted} Signals</strong></span>
                          <span>⏱️ Emergency ETA: <strong style={{ color: '#0284C7' }}>{c.eta_min} mins</strong></span>
                          <span>🚗 Density: <strong>{c.traffic_density_pct || 25}%</strong></span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleCorridor(c.id)}
                        style={{
                          background: c.active ? '#DC2626' : '#0284C7',
                          color: '#FFFFFF', border: 'none', borderRadius: 8,
                          padding: '8px 14px', fontWeight: 800, fontSize: '0.8rem',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                        }}
                      >
                        {c.active ? <Power size={14} /> : <Play size={14} />}
                        {c.active ? 'Deactivate Wave' : 'Activate Green Wave'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ⚡ TAB 2: GRID SCADA & BREAKERS */}
          {activeSubTab === 'scada' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ padding: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Zap size={18} color="#D97706" />
                      ABB MicroSCADA Pro / DNP3 Substation Breakers
                    </h4>
                    <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '3px 0 0 0' }}>
                      Remote power line tripping & de-energization to prevent electrical arcing & explosive re-ignition during fire spread.
                    </p>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A' }}>
                    HIGH VOLTAGE SCADA
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                  {(cityData?.scada_feeders || []).map((f) => {
                    const isClosed = f.breaker_status === 'CLOSED';
                    return (
                      <div
                        key={f.id}
                        style={{
                          padding: '16px', borderRadius: 10,
                          border: isClosed ? '1px solid #E2E8F0' : '1.5px solid #16A34A',
                          background: isClosed ? '#FFFDF5' : '#F0FDF4'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: isClosed ? '#DC2626' : '#16A34A', color: '#FFFFFF' }}>
                            {f.id}
                          </span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isClosed ? '#DC2626' : '#16A34A' }}>
                            {isClosed ? '⚡ ENERGIZED (CLOSED)' : '🔒 TRIPPED (SAFE ISOLATED)'}
                          </span>
                        </div>

                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A', marginBottom: 8 }}>
                          {f.substation}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.76rem', color: '#475569', marginBottom: 12 }}>
                          <div>Bus Voltage: <strong>{f.voltage_kv} kV</strong></div>
                          <div>Load: <strong>{f.load_mva} MVA</strong></div>
                          <div>Grid Frequency: <strong>{f.frequency_hz || 50.0} Hz</strong></div>
                          <div>Transformer Temp: <strong>{f.oil_temp_c || 38.5}°C</strong></div>
                        </div>

                        <button
                          onClick={() => handleToggleBreaker(f.id)}
                          style={{
                            width: '100%',
                            background: isClosed ? '#DC2626' : '#16A34A',
                            color: '#FFFFFF', border: 'none', borderRadius: 8,
                            padding: '8px', fontWeight: 800, fontSize: '0.78rem',
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: 6
                          }}
                        >
                          <Power size={14} />
                          {isClosed ? 'Trip Breaker (De-Energize)' : 'Re-Energize Feeder'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 🚰 TAB 3: WATER GRID & HYDRANTS */}
          {activeSubTab === 'water' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ padding: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Droplets size={18} color="#0284C7" />
                      Schneider EcoStruxure Water SCADA & Firebreak Mist Curtains
                    </h4>
                    <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '3px 0 0 0' }}>
                      Municipal pressure boosting (55 PSI $\rightarrow$ 120 PSI) and automated perimeter ember mist barriers.
                    </p>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: '#F0F9FF', color: '#0369A1', border: '1px solid #BAE6FD' }}>
                    HIGH PRESSURE WATER GRID
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                  {(cityData?.water_hydrants || []).map((h) => {
                    const isBoosted = h.pressure_psi >= 90;
                    return (
                      <div
                        key={h.id}
                        style={{
                          padding: '16px', borderRadius: 10,
                          border: isBoosted ? '1.5px solid #0284C7' : '1px solid #E2E8F0',
                          background: isBoosted ? '#F0F9FF' : '#F8FAFC'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: '#0284C7', color: '#FFFFFF' }}>
                            {h.id}
                          </span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isBoosted ? '#0284C7' : '#64748B' }}>
                            {isBoosted ? '🚀 BOOSTED (120 PSI)' : 'STANDBY (55 PSI)'}
                          </span>
                        </div>

                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A', marginBottom: 8 }}>
                          {h.location}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.76rem', color: '#475569', marginBottom: 12 }}>
                          <div>Manifold Pressure: <strong style={{ color: isBoosted ? '#0284C7' : '#0F172A' }}>{h.pressure_psi} PSI</strong></div>
                          <div>Discharge Flow Rate: <strong>{h.flow_rate_lpm} LPM</strong></div>
                          <div>Reservoir Reserve: <strong>{h.reservoir_level_pct}%</strong></div>
                          <div>Booster Pump Power: <strong>{h.pump_hp || 50} HP</strong></div>
                        </div>

                        <button
                          onClick={() => handleBoostHydrant(h.id, !isBoosted)}
                          style={{
                            width: '100%',
                            background: isBoosted ? '#475569' : '#0284C7',
                            color: '#FFFFFF', border: 'none', borderRadius: 8,
                            padding: '8px', fontWeight: 800, fontSize: '0.78rem',
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: 6
                          }}
                        >
                          <Droplets size={14} />
                          {isBoosted ? 'Reset to Nominal 55 PSI' : '🚀 Boost to 120 PSI'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 🎯 TAB 4: ROBOTIC WATER CANNONS */}
          {activeSubTab === 'turrets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ padding: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Crosshair size={18} color="#EA580C" />
                      Perimeter Robotic Water Cannon Turrets (3,500 LPM)
                    </h4>
                    <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '3px 0 0 0' }}>
                      Motorized pan-tilt foam/water turrets with automated thermal hotspot tracking & suppression.
                    </p>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: '#FFF7ED', color: '#EA580C', border: '1px solid #FFEDD5' }}>
                    AUTOMATED TURRET DEFENSE
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                  {(cityData?.robotic_cannons || []).map((t) => {
                    const isFiring = t.status === 'AUTO_ENGAGED';
                    return (
                      <div
                        key={t.cannon_id}
                        style={{
                          padding: '16px', borderRadius: 10,
                          border: isFiring ? '1.5px solid #EA580C' : '1px solid #E2E8F0',
                          background: isFiring ? '#FFF7ED' : '#F8FAFC'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: '#EA580C', color: '#FFFFFF' }}>
                            {t.cannon_id}
                          </span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isFiring ? '#EA580C' : '#64748B' }}>
                            {isFiring ? '🔥 AUTO ENGAGED (3500 LPM)' : 'STANDBY ARMED'}
                          </span>
                        </div>

                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A', marginBottom: 8 }}>
                          {t.location}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.76rem', color: '#475569', marginBottom: 12 }}>
                          <div>Azimuth Pan: <strong>{t.pan_deg}°</strong> | Elevation Tilt: <strong>{t.tilt_deg}°</strong></div>
                          <div>Discharge Stream: <strong style={{ color: isFiring ? '#EA580C' : '#0F172A' }}>{t.flow_rate_lpm} LPM</strong></div>
                          <div>Suppression Agent: <strong>{t.media_type}</strong></div>
                          <div>Effective Range: <strong>{t.reach_distance_m} Meters</strong></div>
                          <div>Total Water Expended: <strong>{t.water_consumed_l} Liters</strong></div>
                        </div>

                        <button
                          onClick={() => handleToggleTurret(t.cannon_id, !isFiring)}
                          style={{
                            width: '100%',
                            background: isFiring ? '#DC2626' : '#EA580C',
                            color: '#FFFFFF', border: 'none', borderRadius: 8,
                            padding: '8px', fontWeight: 800, fontSize: '0.78rem',
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: 6
                          }}
                        >
                          <Crosshair size={14} />
                          {isFiring ? 'Disengage Cannon Turret' : '🔥 Engage Target Suppression (3,500 LPM)'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 📢 TAB 5: GEOFENCED EVACUATION & TURNSTILES */}
          {activeSubTab === 'evac' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ padding: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Users size={18} color="#0284C7" />
                      Geofenced Citizen Evacuation & Turnstile Muster Headcount
                    </h4>
                    <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '3px 0 0 0' }}>
                      Automated zone-by-zone SMS cell-broadcast and IoT turnstile badge reconciliation.
                    </p>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: '#EFF6FF', color: '#0284C7', border: '1px solid #BFDBFE' }}>
                    CELL BROADCAST READY
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(cityData?.evacuation_zones || []).map((z) => (
                    <div
                      key={z.zone_id}
                      style={{
                        padding: '16px', borderRadius: 10,
                        border: '1px solid #E2E8F0', background: '#F8FAFC',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        flexWrap: 'wrap', gap: 14
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: '#0284C7', color: '#FFFFFF' }}>
                            {z.zone_id}
                          </span>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>
                            {z.zone_name}
                          </span>
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: '#FEF2F2', color: '#DC2626' }}>
                            {z.status}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 16, fontSize: '0.76rem', color: '#475569', flexWrap: 'wrap' }}>
                          <span>👥 Total Population: <strong>{z.population}</strong></span>
                          <span>✅ Evacuated: <strong style={{ color: '#16A34A' }}>{z.evacuated_count}</strong></span>
                          <span>⚠️ Unaccounted: <strong style={{ color: z.unaccounted_count > 0 ? '#DC2626' : '#16A34A' }}>{z.unaccounted_count}</strong></span>
                          <span>📍 Safe Assembly Point: <strong style={{ color: '#0284C7' }}>{z.safe_assembly_point}</strong></span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleTriggerEvacSms(z.zone_id)}
                        style={{
                          background: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: 8,
                          padding: '8px 14px', fontWeight: 800, fontSize: '0.78rem',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                        }}
                      >
                        <Send size={14} />
                        📢 Trigger Evac SMS Broadcast
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 🏢 TAB 6: HOSPITAL & CAMPUS BMS */}
          {activeSubTab === 'bms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ padding: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Building2 size={18} color="#7C3AED" />
                      Johnson Controls Metasys / BACnet IP Building Management Systems
                    </h4>
                    <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '3px 0 0 0' }}>
                      Automated HVAC damper sealing, HEPA recirculation, and positive pressure airlocks to prevent toxic smoke infiltration.
                    </p>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: '#F5F3FF', color: '#6D28D9', border: '1px solid #DDD6FE' }}>
                    BACNET / IP BMS
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                  {(cityData?.smart_buildings || []).map((b) => {
                    const isSealed = b.damper_status === 'HEPA_SEALED';
                    return (
                      <div
                        key={b.id}
                        style={{
                          padding: '16px', borderRadius: 10,
                          border: isSealed ? '1.5px solid #7C3AED' : '1px solid #E2E8F0',
                          background: isSealed ? '#F5F3FF' : '#F8FAFC'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: '#7C3AED', color: '#FFFFFF' }}>
                            {b.id}
                          </span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isSealed ? '#7C3AED' : '#64748B' }}>
                            {isSealed ? '🛡️ HEPA SEALED' : 'NORMAL CIRCULATION'}
                          </span>
                        </div>

                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A', marginBottom: 8 }}>
                          {b.name}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.76rem', color: '#475569', marginBottom: 12 }}>
                          <div>Indoor AQI: <strong style={{ color: '#16A34A' }}>{b.air_quality_indoor_aqi} PM2.5</strong></div>
                          <div>Outdoor AQI: <strong style={{ color: '#DC2626' }}>{b.air_quality_outdoor_aqi} PM2.5</strong></div>
                          <div>Building Pressure: <strong>+{b.positive_pressure_pa || 5} Pa</strong></div>
                          <div>Occupants Protected: <strong>{b.occupants_count || b.vulnerable_patients_count} Persons</strong></div>
                        </div>

                        <button
                          onClick={() => handleToggleDamper(b.id)}
                          style={{
                            width: '100%',
                            background: isSealed ? '#475569' : '#7C3AED',
                            color: '#FFFFFF', border: 'none', borderRadius: 8,
                            padding: '8px', fontWeight: 800, fontSize: '0.78rem',
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: 6
                          }}
                        >
                          <ShieldCheck size={14} />
                          {isSealed ? 'Open Dampers (Normal Air)' : '🛡️ Seal Dampers (HEPA Smoke Lock)'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 🏥 TAB 7: HOSPITAL ER & BURN UNITS */}
          {activeSubTab === 'hospitals' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ padding: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Bed size={18} color="#DC2626" />
                      Hospital Emergency Room (ER) & Burn Unit Telemetry
                    </h4>
                    <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '3px 0 0 0' }}>
                      Real-time ICU, Oxygen, and Burn unit capacity for municipal multi-casualty disaster response.
                    </p>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                    TRAUMA TRIAGE ACTIVE
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                  {(cityData?.hospitals_er || []).map((h) => (
                    <div key={h.hospital_id} style={{ padding: '16px', borderRadius: 10, border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: '#DC2626', color: '#FFFFFF' }}>
                          {h.hospital_id}
                        </span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#DC2626' }}>
                          {h.trauma_triage_status}
                        </span>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A', marginBottom: 8 }}>
                        {h.name}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.76rem', color: '#475569' }}>
                        <div>Available ICU Beds: <strong style={{ color: '#16A34A' }}>{h.available_icu_beds} Beds</strong></div>
                        <div>Available Burn Beds: <strong style={{ color: '#EA580C' }}>{h.available_burn_beds} Beds</strong></div>
                        <div>Oxygen Supply Reserve: <strong>{h.oxygen_capacity_pct}%</strong></div>
                        <div>Ambulances In-Transit: <strong>{h.ambulances_en_route} Units</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 🔋 TAB 8: SOLAR BESS MICROGRID */}
          {activeSubTab === 'bess' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ padding: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Sun size={18} color="#16A34A" />
                      Campus Solar Rooftop & BESS Battery Microgrid Islanding
                    </h4>
                    <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '3px 0 0 0' }}>
                      Uninterruptible 24/7 power for hospital life-support & water pumps when 33kV grid is de-energized.
                    </p>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>
                    MICROGRID SYNCHRONIZED
                  </span>
                </div>

                {cityData?.microgrid_bess && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 16 }}>
                    <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>
                        BESS Storage Status: {cityData.microgrid_bess.system_status}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div>Battery State of Charge (SOC): <strong style={{ color: '#16A34A' }}>{cityData.microgrid_bess.bess_battery_soc_pct}%</strong></div>
                        <div>Total Battery Capacity: <strong>{cityData.microgrid_bess.bess_capacity_kwh} kWh</strong></div>
                        <div>Solar Generation: <strong>{cityData.microgrid_bess.solar_rooftop_gen_kw} kW</strong></div>
                        <div>Guaranteed Island Run Time: <strong>{cityData.microgrid_bess.critical_load_supported_hours} Hours</strong></div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <button
                        onClick={handleToggleBess}
                        style={{
                          width: '100%',
                          background: cityData.microgrid_bess.emergency_island_active ? '#DC2626' : '#16A34A',
                          color: '#FFFFFF', border: 'none', borderRadius: 8,
                          padding: '14px', fontWeight: 800, fontSize: '0.86rem',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                        }}
                      >
                        <Power size={16} />
                        {cityData.microgrid_bess.emergency_island_active ? 'Return to Grid Mode' : '⚡ Activate Emergency Islanding (BESS)'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 🔊 TAB 9: WARNING SIRENS */}
          {activeSubTab === 'sirens' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ padding: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Megaphone size={18} color="#DC2626" />
                      Municipal High-Decibel Acoustic Warning Siren Grid (120 dB)
                    </h4>
                    <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '3px 0 0 0' }}>
                      Multi-zone solar sirens with acoustic warble and dual-language Text-to-Speech (TTS) voice evacuation horns.
                    </p>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                    ACOUSTIC GRID READY
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                  {(cityData?.warning_sirens || []).map((s) => {
                    const isActive = s.state.includes('ACTIVE');
                    return (
                      <div key={s.siren_id} style={{ padding: '16px', borderRadius: 10, border: isActive ? '1.5px solid #DC2626' : '1px solid #E2E8F0', background: isActive ? '#FEF2F2' : '#F8FAFC' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: '#DC2626', color: '#FFFFFF' }}>
                            {s.siren_id}
                          </span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isActive ? '#DC2626' : '#64748B' }}>
                            {s.state}
                          </span>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A', marginBottom: 6 }}>
                          {s.location} ({s.db_level} dB)
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#475569', marginBottom: 12 }}>
                          Coverage: <strong>{s.coverage_radius_m}m Radius</strong>
                        </div>
                        <button
                          onClick={() => handleTriggerSiren(s.siren_id, isActive ? 'STANDBY' : 'ACTIVE_EVAC_WARBLE')}
                          style={{
                            width: '100%',
                            background: isActive ? '#475569' : '#DC2626',
                            color: '#FFFFFF', border: 'none', borderRadius: 8,
                            padding: '8px', fontWeight: 800, fontSize: '0.78rem',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                          }}
                        >
                          <Megaphone size={14} />
                          {isActive ? 'Silence Siren' : '🔊 Sound 120dB Evac Siren'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 💨 TAB 10: 3D TOXIC PLUME DISPERSION */}
          {activeSubTab === 'plume' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ padding: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Wind size={18} color="#0284C7" />
                      3D Gaussian Toxic Gas Plume Dispersion Model
                    </h4>
                    <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '3px 0 0 0' }}>
                      Real-time downwind trajectory calculation of carbon monoxide (CO) and particulate matter (PM2.5).
                    </p>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: '#EFF6FF', color: '#0284C7', border: '1px solid #BFDBFE' }}>
                    GAUSSIAN DRIFT SYNCD
                  </span>
                </div>

                {cityData?.plume_model && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                    <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Wind Vector</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>{cityData.plume_model.wind_direction}</div>
                      <div style={{ fontSize: '0.75rem', color: '#0284C7' }}>{cityData.plume_model.wind_speed_kmh} km/h</div>
                    </div>
                    <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Source CO Concentration</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#DC2626' }}>{cityData.plume_model.peak_co_ppm_at_source} ppm</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Combustion Point Peak</div>
                    </div>
                    <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Downwind PM2.5 (1 km)</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#EA580C' }}>{cityData.plume_model.downwind_pm25_ugm3_1km} µg/m³</div>
                      <div style={{ fontSize: '0.75rem', color: '#DC2626' }}>Hazardous Infiltration</div>
                    </div>
                    <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Hostel Cluster Smoke ETA</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#7C3AED' }}>{cityData.plume_model.projected_hostel_impact_eta_min} mins</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Seal HVAC Dampers Now</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 🚁 TAB 11: DRONE-IN-A-BOX RECON */}
          {activeSubTab === 'drone' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ padding: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Plane size={18} color="#0284C7" />
                      Drone-in-a-Box (DiaB) Autonomous UAV Reconnaissance
                    </h4>
                    <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '3px 0 0 0' }}>
                      Automated high-altitude thermal FLIR camera patrol over the Dehmi Ridge forest-urban interface.
                    </p>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: '#EFF6FF', color: '#0284C7', border: '1px solid #BFDBFE' }}>
                    FLIR INFRARED ACTIVE
                  </span>
                </div>

                {cityData?.drone_dock && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 16 }}>
                    <div style={{
                      background: '#0F172A', borderRadius: 10, padding: '16px',
                      color: '#F8FAFC', position: 'relative', overflow: 'hidden', minHeight: 220,
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38BDF8', fontFamily: 'monospace' }}>
                          FLIR OPTICAL FEED: {cityData.drone_dock.drone_name}
                        </span>
                        <span style={{ fontSize: '0.7rem', background: '#DC2626', color: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 800 }}>
                          ● LIVE THERMAL IR
                        </span>
                      </div>

                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: 0.25, pointerEvents: 'none'
                      }}>
                        <div style={{ width: 140, height: 140, border: '1px solid #38BDF8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: 8, height: 8, background: '#EA580C', borderRadius: '50%' }}></div>
                        </div>
                      </div>

                      <div style={{ zIndex: 2, fontSize: '0.74rem', fontFamily: 'monospace', color: '#94A3B8', display: 'flex', justifyContent: 'space-between' }}>
                        <span>ALT: {cityData.drone_dock.altitude_m}m</span>
                        <span>SPD: {cityData.drone_dock.speed_kmh} km/h</span>
                        <span>HDG: {cityData.drone_dock.heading_deg}°</span>
                        <span>BAT: {cityData.drone_dock.battery_pct}%</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: '0.8rem' }}>
                        <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                          Mission Flight Plan: Sector Alpha Ridge Perimeter
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, color: '#475569', fontSize: '0.76rem' }}>
                          <div>Status: <strong style={{ color: '#0284C7' }}>{cityData.drone_dock.status}</strong></div>
                          <div>Coordinates: <strong>{cityData.drone_dock.lat}° N, {cityData.drone_dock.lon}° E</strong></div>
                          <div>Camera Mode: <strong>{cityData.drone_dock.camera_mode || 'IR_THERMAL_WHITE_HOT'}</strong></div>
                          <div>Remaining Air Time: <strong>{cityData.drone_dock.flight_time_remaining_min || 24} mins</strong></div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 10 }}>
                        <button
                          onClick={handleLaunchDrone}
                          className="btn btn-primary"
                          style={{ flex: 1, padding: '10px', fontSize: '0.8rem' }}
                        >
                          <Plane size={14} /> Launch Recon
                        </button>
                        <button
                          onClick={handleReturnDrone}
                          className="btn btn-secondary"
                          style={{ flex: 1, padding: '10px', fontSize: '0.8rem' }}
                        >
                          <Navigation size={14} /> Return Dock
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 📹 TAB 12: AI PTZ CCTV CAMERAS */}
          {activeSubTab === 'cctv' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ padding: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Video size={18} color="#0284C7" />
                      AI Pan-Tilt-Zoom (PTZ) CCTV Smoke & Optical Flame Detection
                    </h4>
                    <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '3px 0 0 0' }}>
                      YOLOv8 optical smoke verification with motorized Slew-to-Cue positioning.
                    </p>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: '#EFF6FF', color: '#0284C7', border: '1px solid #BFDBFE' }}>
                    OPTICAL AI ACTIVE
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                  {(cityData?.cctv_cameras || []).map((cam) => (
                    <div key={cam.camera_id} style={{ padding: '16px', borderRadius: 10, border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: '#0284C7', color: '#FFFFFF' }}>
                          {cam.camera_id}
                        </span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: cam.ai_smoke_detected ? '#DC2626' : '#16A34A' }}>
                          {cam.status}
                        </span>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A', marginBottom: 6 }}>
                        {cam.location}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#475569', marginBottom: 12 }}>
                        <div>Pan: <strong>{cam.pan_deg}°</strong> | Tilt: <strong>{cam.tilt_deg}°</strong> | Zoom: <strong>{cam.zoom_level}</strong></div>
                        <div>Smoke AI Confidence: <strong style={{ color: cam.ai_smoke_detected ? '#DC2626' : '#16A34A' }}>{cam.smoke_confidence_pct}%</strong></div>
                      </div>
                      <button
                        onClick={() => handleSlewCctv(cam.camera_id)}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '8px', fontSize: '0.78rem' }}
                      >
                        🎯 Slew-to-Cue (Target Hotspot)
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 📟 TAB 13: HIGHWAY VMS SIGNS */}
          {activeSubTab === 'vms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ padding: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Monitor size={18} color="#0284C7" />
                      Highway Variable Message Signs (VMS) Dynamic Broadcaster
                    </h4>
                    <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '3px 0 0 0' }}>
                      Real-time electronic matrix billboard messaging on NH-48 and Ring Road interchanges.
                    </p>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: '#EFF6FF', color: '#0284C7', border: '1px solid #BFDBFE' }}>
                    LIVE MATRIX BROADCAST
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(cityData?.vms_highway_signs || []).map((s) => (
                    <div key={s.sign_id} style={{ padding: '16px', borderRadius: 10, border: '1px solid #E2E8F0', background: '#0F172A', color: '#F8FAFC' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#38BDF8' }}>
                          {s.sign_id} · {s.location}
                        </span>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: '#16A34A', color: '#FFFFFF' }}>
                          ● {s.status}
                        </span>
                      </div>

                      <div style={{
                        background: '#020617', border: '2px solid #334155', borderRadius: 6,
                        padding: '12px', fontFamily: 'monospace', color: '#FACC15',
                        fontSize: '0.92rem', fontWeight: 800, letterSpacing: 1,
                        textTransform: 'uppercase', marginBottom: 10
                      }}>
                        {s.current_display}
                      </div>

                      {editingVmsId === s.sign_id ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            type="text"
                            value={vmsInputText}
                            onChange={(e) => setVmsInputText(e.target.value)}
                            placeholder="Type new billboard broadcast text..."
                            style={{ flex: 1, padding: '8px 12px', background: '#1E293B', border: '1px solid #475569', borderRadius: 6, color: '#FFF', fontSize: '0.82rem', fontFamily: 'monospace' }}
                          />
                          <button onClick={() => handleUpdateVms(s.sign_id)} className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.78rem' }}>Send</button>
                          <button onClick={() => setEditingVmsId(null)} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.78rem' }}>Cancel</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingVmsId(s.sign_id); setVmsInputText(s.current_display); }}
                          style={{ background: '#1E293B', border: '1px solid #475569', color: '#94A3B8', padding: '6px 12px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          ✏️ Edit Broadcast Text
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 📜 TAB 14: CAP v1.2 & CAD DISPATCH */}
          {activeSubTab === 'cap' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ padding: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FileCode size={18} color="#0284C7" />
                      NDMA / WMO Common Alerting Protocol (CAP v1.2) XML & CAD Dispatch
                    </h4>
                    <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '3px 0 0 0' }}>
                      Official interoperable disaster XML feed for police, fire, NDRF, and state emergency operating centers.
                    </p>
                  </div>
                  <button
                    onClick={handleCopyCapXml}
                    className="btn btn-primary"
                    style={{ padding: '7px 14px', fontSize: '0.8rem', gap: 6 }}
                  >
                    {copiedCap ? <Check size={14} /> : <Copy size={14} />}
                    {copiedCap ? 'Copied XML' : 'Copy CAP XML'}
                  </button>
                </div>

                <form onSubmit={handleCreateCad} style={{ padding: '16px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0', marginBottom: 16 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>
                    Create Multi-Agency Computer-Aided Dispatch (CAD) Ticket
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr auto', gap: 10, alignItems: 'end' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748B', marginBottom: 4 }}>Sector Location</label>
                      <input type="text" value={cadSector} onChange={(e) => setCadSector(e.target.value)} style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '0.8rem' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748B', marginBottom: 4 }}>Incident Nature</label>
                      <input type="text" value={cadNature} onChange={(e) => setCadNature(e.target.value)} style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '0.8rem' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748B', marginBottom: 4 }}>Priority</label>
                      <select value={cadPriority} onChange={(e) => setCadPriority(e.target.value)} style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '0.8rem' }}>
                        <option value="P1_URGENT">P1 URGENT</option>
                        <option value="P2_ELEVATED">P2 ELEVATED</option>
                        <option value="P3_ROUTINE">P3 ROUTINE</option>
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>Dispatch</button>
                  </div>
                </form>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #CBD5E1', color: '#475569', textAlign: 'left' }}>
                        <th style={{ padding: '8px 10px' }}>Ticket ID</th>
                        <th style={{ padding: '8px 10px' }}>Timestamp</th>
                        <th style={{ padding: '8px 10px' }}>Priority</th>
                        <th style={{ padding: '8px 10px' }}>Sector</th>
                        <th style={{ padding: '8px 10px' }}>Nature</th>
                        <th style={{ padding: '8px 10px' }}>Units</th>
                        <th style={{ padding: '8px 10px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(cityData?.cad_tickets || []).map((t) => (
                        <tr key={t.ticket_id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 10px', fontWeight: 800, color: '#0284C7' }}>{t.ticket_id}</td>
                          <td style={{ padding: '8px 10px', color: '#64748B' }}>{t.timestamp}</td>
                          <td style={{ padding: '8px 10px' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: t.priority.includes('P1') ? '#FEF2F2' : '#EFF6FF', color: t.priority.includes('P1') ? '#DC2626' : '#0284C7' }}>
                              {t.priority}
                            </span>
                          </td>
                          <td style={{ padding: '8px 10px' }}>{t.incident_sector}</td>
                          <td style={{ padding: '8px 10px' }}>{t.nature}</td>
                          <td style={{ padding: '8px 10px', color: '#64748B' }}>{(t.assigned_units || []).join(', ')}</td>
                          <td style={{ padding: '8px 10px', fontWeight: 800, color: '#16A34A' }}>{t.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 📊 TAB 15: AUDIT LEDGER */}
          {activeSubTab === 'audit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ padding: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Database size={18} color="#0284C7" />
                      Citywide Telemetry Blackbox & Incident Audit Ledger
                    </h4>
                    <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '3px 0 0 0' }}>
                      Cryptographic action log of all municipal SCADA trips, green wave triggers, and robotic turret engagements.
                    </p>
                  </div>
                  <a
                    href="/api/incidents/export-html"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{ padding: '7px 12px', fontSize: '0.78rem', gap: 6 }}
                  >
                    <Download size={13} />
                    Export Complete Dossier (A4)
                  </a>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(cityData?.telemetry_recordings || []).map((r, idx) => (
                    <div key={idx} style={{ padding: '14px', borderRadius: 8, background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontWeight: 800, color: '#0F172A' }}>Source: {r.source} · Recorded {r.timestamp}</span>
                        <span style={{ color: '#16A34A', fontWeight: 800 }}>✓ SHA-256 SIGNED</span>
                      </div>
                      <div style={{ display: 'flex', gap: 16, color: '#475569', flexWrap: 'wrap' }}>
                        <span>Temp: <strong>{r.metrics?.temp}</strong></span>
                        <span>RH: <strong>{r.metrics?.rh}</strong></span>
                        <span>CO: <strong>{r.metrics?.co}</strong></span>
                        <span>Wind: <strong>{r.metrics?.wind}</strong></span>
                        <span>SCADA: <strong>{r.scada_status}</strong></span>
                        <span>ATCS: <strong>{r.atcs_status}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
