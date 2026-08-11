import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Globe, MapPin } from 'lucide-react';

export default function RegionSelector({ onRegionChanged }) {
  const [regions, setRegions] = useState([]);
  const [activeRegionId, setActiveRegionId] = useState('JAIPUR');
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const res = await axios.get('/api/regions');
      setRegions(res.data.regions || []);
      setActiveRegionId(res.data.active_region || 'JAIPUR');
    } catch (e) {
      console.error('Error fetching regions:', e);
    }
  };

  const handleSwitchRegion = async (regionId) => {
    if (regionId === activeRegionId) return;
    setSwitching(true);
    try {
      await axios.post('/api/region/switch', { region_id: regionId });
      setActiveRegionId(regionId);
      if (onRegionChanged) onRegionChanged(regionId);
    } catch (e) {
      console.error('Error switching region:', e);
    } finally {
      setSwitching(false);
    }
  };

  if (!regions || regions.length === 0) return null;

  return (
    <div className="glass-card" style={{ marginBottom: '20px', padding: '14px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={18} color="#F97316" />
          <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-heading)' }}>
            Active Monitoring Region & Location Preset:
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {regions.map((reg) => {
            const isSelected = activeRegionId === reg.id;
            return (
              <button
                key={reg.id}
                onClick={() => handleSwitchRegion(reg.id)}
                disabled={switching}
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)'
                    : 'var(--bg-input)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                  border: `1.5px solid ${isSelected ? '#F97316' : 'var(--bg-card-border)'}`,
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: isSelected ? '0 4px 14px rgba(249, 115, 22, 0.35)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{reg.flag}</span>
                <span>{reg.name.split(',')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
