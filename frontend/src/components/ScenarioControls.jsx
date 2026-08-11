import React from 'react';
import { Play, Flame, Sun, Wind, Trees } from 'lucide-react';

const SCENARIOS = [
  {
    id: 'NORMAL',
    label: 'Normal Forest',
    icon: Trees,
    color: '#15803D',
    accentBg: '#F0FDF4',
    accentBorder: '#BBF7D0',
    desc: 'Ambient micro-climate (~24 °C, 60% humidity)',
  },
  {
    id: 'HOT_DRY',
    label: 'Hot & Dry Weather',
    icon: Sun,
    color: '#B45309',
    accentBg: '#FFFBEB',
    accentBorder: '#FDE68A',
    desc: 'Extreme drought: temp rising, humidity < 20%',
  },
  {
    id: 'SMOLDERING',
    label: 'Smoldering Fire',
    icon: Wind,
    color: '#C2410C',
    accentBg: '#FFF7ED',
    accentBorder: '#FFEDD5',
    desc: 'CO elevation +4.5 ppm/min before visible flames',
  },
  {
    id: 'ACTIVE_FIRE',
    label: 'Active Wildfire',
    icon: Flame,
    color: '#B91C1C',
    accentBg: '#FEF2F2',
    accentBorder: '#FECACA',
    desc: 'Critical: Temp > 50 °C, toxic CO & smoke',
  },
];

export default function ScenarioControls({ currentScenario, onSelectScenario, onStepSimulation }) {
  return (
    <div className="card" style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1923', margin: 0 }}>
            Scenario Simulation Engine
          </h3>
          <p style={{ fontSize: '0.76rem', color: '#7A8FA6', marginTop: 2 }}>
            Select a fire scenario to inject into the sensor mesh
          </p>
        </div>
        <button
          onClick={onStepSimulation}
          className="btn btn-secondary"
          style={{ padding: '7px 14px', fontSize: '0.82rem', gap: 6 }}
        >
          <Play size={13} />
          Step Tick
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
        {SCENARIOS.map((sc) => {
          const Icon = sc.icon;
          const isActive = currentScenario === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => onSelectScenario(sc.id)}
              style={{
                background: isActive ? sc.accentBg : '#FAFBFC',
                border: `1.5px solid ${isActive ? sc.accentBorder : '#E2E6ED'}`,
                borderRadius: 10,
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                outline: isActive ? `2px solid ${sc.color}` : '2px solid transparent',
                outlineOffset: 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: isActive ? sc.accentBorder : '#F0F2F5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={16} color={isActive ? sc.color : '#7A8FA6'} />
                </div>
                <span style={{
                  fontSize: '0.85rem', fontWeight: 700,
                  color: isActive ? sc.color : '#3D4F63',
                }}>
                  {sc.label}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#7A8FA6', lineHeight: 1.4, margin: 0 }}>
                {sc.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
