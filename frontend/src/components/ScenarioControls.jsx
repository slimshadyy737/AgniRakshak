import React from 'react';
import { Play, Flame, Sun, Wind, Trees } from 'lucide-react';

export default function ScenarioControls({ currentScenario, onSelectScenario, onStepSimulation }) {
  const scenarios = [
    { id: 'NORMAL', label: 'Normal Forest', icon: Trees, color: '#10B981', desc: 'Ambient micro-climate (~24°C, 60% humidity)' },
    { id: 'HOT_DRY', label: 'Hot & Dry Weather', icon: Sun, color: '#F59E0B', desc: 'Extreme drought: Temp rising, humidity < 20%' },
    { id: 'SMOLDERING', label: 'Smoldering Fire', icon: Wind, color: '#F97316', desc: 'CO elevation +4.5 ppm/min before visible flames' },
    { id: 'ACTIVE_FIRE', label: 'Active Wildfire', icon: Flame, color: '#EF4444', desc: 'Critical emergency: Temp > 50°C, toxic CO & smoke' },
  ];

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-heading)' }}>
          🎛️ Interactive Scenario Simulation Engine
        </h3>
        <button
          onClick={onStepSimulation}
          style={{
            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            color: '#FFFFFF',
            border: 'none',
            padding: '8px 18px',
            borderRadius: '10px',
            fontWeight: '600',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)',
            transition: 'transform 0.15s ease'
          }}
        >
          <Play size={14} />
          Step Next Clock Tick
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isActive = currentScenario === sc.id;

          return (
            <div
              key={sc.id}
              onClick={() => onSelectScenario(sc.id)}
              style={{
                background: isActive ? `${sc.color}15` : 'var(--bg-input)',
                border: `2px solid ${isActive ? sc.color : 'var(--bg-card-border)'}`,
                borderRadius: '12px',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? `0 4px 20px ${sc.color}25` : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <div style={{ background: `${sc.color}20`, padding: '6px', borderRadius: '8px' }}>
                  <Icon size={18} color={sc.color} />
                </div>
                <span style={{ fontWeight: '700', fontSize: '0.92rem', color: isActive ? sc.color : 'var(--text-heading)' }}>
                  {sc.label}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: '1.3' }}>{sc.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
