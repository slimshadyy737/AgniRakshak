import React, { useState } from 'react';
import { Flame, Droplets, Gauge, Compass, Sliders, Play, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function FireWeatherWidget({ focusNode }) {
  const [showSim, setShowSim] = useState(false);
  const [deltaTemp, setDeltaTemp] = useState(0);
  const [deltaHum, setDeltaHum] = useState(0);
  const [deltaWind, setDeltaWind] = useState(0);
  const [deltaCO, setDeltaCO] = useState(0);

  const baseFwi = focusNode?.fwi_analytics || {
    danger_category: 'LOW DANGER',
    danger_color: '#15803D',
    vpd_kpa: 1.45,
    rate_of_spread_m_min: 2.1,
    initial_spread_index: 1.5,
  };

  const baseTemp = focusNode?.temperature ?? 26.5;
  const baseHum = focusNode?.humidity ?? 55.0;
  const baseWind = focusNode?.wind_speed_kmh ?? 14.0;
  const baseCO = focusNode?.co_ppm ?? 3.8;
  const windDir = focusNode?.wind_direction_deg ?? 180;

  // Simulated dynamic values
  const simTemp = Math.max(10, baseTemp + deltaTemp);
  const simHum = Math.min(100, Math.max(5, baseHum + deltaHum));
  const simWind = Math.max(0, baseWind + deltaWind);
  const simCO = Math.max(0.5, baseCO + deltaCO);

  // Approximate dynamic Canadian FWI calculations
  const simVPD = (0.61078 * Math.exp((17.27 * simTemp) / (simTemp + 237.3)) * (1 - simHum / 100)).toFixed(2);
  const simFFMC = Math.min(99, Math.max(20, 85 + (simTemp * 0.4) - (simHum * 0.5) + (simWind * 0.2))).toFixed(1);
  const simISI = Math.max(0.5, (0.208 * Math.exp(0.05039 * simWind) * (simFFMC / 20))).toFixed(1);
  const simROS = Math.max(0.2, (simISI * 1.8 * (simTemp / 25) * (100 / Math.max(15, simHum)))).toFixed(1);
  
  let simDangerCategory = 'LOW DANGER';
  let simDangerColor = '#16A34A';
  if (simROS > 15 || simCO > 40 || simTemp > 45) {
    simDangerCategory = 'EXTREME / CRITICAL';
    simDangerColor = '#DC2626';
  } else if (simROS > 6 || simCO > 15 || simTemp > 35) {
    simDangerCategory = 'HIGH DANGER';
    simDangerColor = '#EA580C';
  } else if (simROS > 3 || simTemp > 30) {
    simDangerCategory = 'MODERATE RISK';
    simDangerColor = '#D97706';
  }

  const fwiMetrics = [
    {
      code: 'FFMC',
      name: 'Fine Fuel Moisture Code',
      val: showSim ? simFFMC : (focusNode?.fwi_analytics?.ffmc || 86.4),
      sub: 'Surface leaf & litter ignition ease',
      color: '#EA580C'
    },
    {
      code: 'ISI',
      name: 'Initial Spread Index',
      val: showSim ? simISI : (baseFwi.initial_spread_index || 2.4),
      sub: 'Wind-driven rate of spread rating',
      color: '#D97706'
    },
    {
      code: 'VPD',
      name: 'Vapor Pressure Deficit',
      val: `${showSim ? simVPD : (baseFwi.vpd_kpa || 1.45)} kPa`,
      sub: parseFloat(showSim ? simVPD : baseFwi.vpd_kpa) > 2.5 ? '⚠️ High drying potential' : 'Optimal moisture balance',
      color: '#0284C7'
    },
    {
      code: 'ROS',
      name: 'Rate of Spread (ROS)',
      val: `${showSim ? simROS : (baseFwi.rate_of_spread_m_min || 2.1)} m/min`,
      sub: 'Flame propagation velocity',
      color: '#DC2626'
    },
  ];

  return (
    <div className="card" style={{ padding: '20px', border: '1px solid #E2E8F0' }}>
      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: '#FFF7ED',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid #FFEDD5'
          }}>
            <Flame size={18} color="#EA580C" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Canadian Fire Weather Index (FWI) & Physics Spread Engine
              </h3>
              <span style={{
                fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: 6,
                background: showSim ? simDangerColor + '18' : (baseFwi.danger_color || '#16A34A') + '18',
                color: showSim ? simDangerColor : (baseFwi.danger_color || '#16A34A'),
                border: `1px solid ${showSim ? simDangerColor : (baseFwi.danger_color || '#16A34A')}`
              }}>
                {showSim ? simDangerCategory : (baseFwi.danger_category || 'LOW DANGER')}
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#64748B', margin: 0 }}>
              Van Wagner Atmospheric Drying & Spread Models synchronized with IoT Mesh
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowSim(v => !v)}
          className="btn btn-secondary"
          style={{
            padding: '6px 12px', fontSize: '0.78rem', gap: 6,
            background: showSim ? '#FFF7ED' : undefined,
            color: showSim ? '#EA580C' : undefined,
            borderColor: showSim ? '#FFEDD5' : undefined
          }}
        >
          <Sliders size={13} /> {showSim ? 'Close What-If Simulator' : '⚡ What-If Scenario Simulator'}
        </button>
      </div>

      {/* ── INTERACTIVE WHAT-IF SLIDERS (When open) ── */}
      {showSim && (
        <div style={{
          background: '#F8FAFC',
          border: '1px solid #CBD5E1',
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 16
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1E293B' }}>
              🔬 REAL-TIME CLIMATE PERTURBATION CONTROLS
            </span>
            <button
              onClick={() => { setDeltaTemp(0); setDeltaHum(0); setDeltaWind(0); setDeltaCO(0); }}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 4
              }}
            >
              <RotateCcw size={12} /> Reset Sliders
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {/* Temp Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: 4 }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>Temperature Offset:</span>
                <strong style={{ color: deltaTemp > 0 ? '#DC2626' : '#0F172A' }}>{deltaTemp > 0 ? `+${deltaTemp}` : deltaTemp} °C ({simTemp.toFixed(1)}°C)</strong>
              </div>
              <input
                type="range" min="-15" max="30" step="1"
                value={deltaTemp} onChange={e => setDeltaTemp(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            {/* Humidity Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: 4 }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>Humidity Offset:</span>
                <strong style={{ color: deltaHum < 0 ? '#EA580C' : '#0F172A' }}>{deltaHum > 0 ? `+${deltaHum}` : deltaHum} % ({simHum.toFixed(0)}%)</strong>
              </div>
              <input
                type="range" min="-40" max="40" step="2"
                value={deltaHum} onChange={e => setDeltaHum(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            {/* Wind Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: 4 }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>Wind Speed Offset:</span>
                <strong style={{ color: deltaWind > 10 ? '#DC2626' : '#0F172A' }}>{deltaWind > 0 ? `+${deltaWind}` : deltaWind} km/h ({simWind.toFixed(0)} km/h)</strong>
              </div>
              <input
                type="range" min="-10" max="50" step="2"
                value={deltaWind} onChange={e => setDeltaWind(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            {/* CO Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: 4 }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>CO Plume Injection:</span>
                <strong style={{ color: deltaCO > 10 ? '#DC2626' : '#0F172A' }}>{deltaCO > 0 ? `+${deltaCO}` : deltaCO} ppm ({simCO.toFixed(1)} ppm)</strong>
              </div>
              <input
                type="range" min="0" max="150" step="5"
                value={deltaCO} onChange={e => setDeltaCO(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── 4 CORE FWI METRICS GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
        {fwiMetrics.map((item) => (
          <div key={item.code} style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            padding: '16px',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{
                fontSize: '0.72rem', fontWeight: 800, background: item.color + '15',
                color: item.color, padding: '2px 6px', borderRadius: 4
              }}>
                {item.code}
              </span>
              <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>CANADIAN FWI</span>
            </div>

            <div style={{
              fontSize: '1.4rem', fontWeight: 800,
              color: '#0F172A',
              fontFamily: 'JetBrains Mono, monospace',
              margin: '4px 0'
            }}>
              {item.val}
            </div>

            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
              {item.name}
            </div>

            <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: 4 }}>
              {item.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
