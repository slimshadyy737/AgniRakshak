import React from 'react';
import { Map, Wifi, BarChart3, Cpu } from 'lucide-react';

export default function NavbarTabs({ activeTab, onSelectTab }) {
  const tabs = [
    { id: 'tactical-map', label: 'Tactical Map & Mesh', icon: <Map size={18} /> },
    { id: 'sensor-network', label: 'Sensor Network & Stream', icon: <Wifi size={18} /> },
    { id: 'analytics', label: 'Analytics & FWI Metrics', icon: <BarChart3 size={18} /> },
    { id: 'ai-intelligence', label: 'AI Intelligence & Logs', icon: <Cpu size={18} /> }
  ];

  return (
    <div className="glass-card" style={{ padding: '8px 12px', marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '10px', overflowX: 'auto' }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            style={{
              background: isActive ? 'linear-gradient(135deg, #FF5722 0%, #EA580C 100%)' : 'transparent',
              color: isActive ? '#FFFFFF' : 'var(--text-muted)',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: isActive ? '0 4px 16px rgba(255, 87, 34, 0.35)' : 'none',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
