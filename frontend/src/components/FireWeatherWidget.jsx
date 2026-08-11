import React from 'react';
import { Flame, Droplets, Gauge, Compass } from 'lucide-react';

export default function FireWeatherWidget({ focusNode }) {
  const fwi = focusNode?.fwi_analytics || {
    danger_category: 'LOW DANGER',
    danger_color: '#15803D',
    vpd_kpa: 1.45,
    rate_of_spread_m_min: 2.1,
    initial_spread_index: 1.5,
  };

  const windSpeed = focusNode?.wind_speed_kmh ?? 12.0;
  const windDir   = focusNode?.wind_direction_deg ?? 90;

  const items = [
    {
      icon: <Flame size={16} color={fwi.danger_color || '#15803D'} />,
      label: 'FWI Danger Rating',
      value: fwi.danger_category,
      valueColor: fwi.danger_color || '#15803D',
      sub: `ISI: ${fwi.initial_spread_index}`,
      mono: false,
    },
    {
      icon: <Droplets size={16} color="#0369A1" />,
      label: 'Vapor Pressure Deficit',
      value: `${fwi.vpd_kpa ?? 1.45} kPa`,
      valueColor: '#0F1923',
      sub: fwi.vpd_kpa > 2.5 ? '⚠️ High drying potential' : 'Normal moisture balance',
      mono: true,
    },
    {
      icon: <Gauge size={16} color="#B91C1C" />,
      label: 'Rate of Spread (ROS)',
      value: `${fwi.rate_of_spread_m_min ?? 2.1} m/min`,
      valueColor: '#B91C1C',
      sub: 'Estimated propagation velocity',
      mono: true,
    },
    {
      icon: <Compass size={16} color="#B45309" />,
      label: 'Wind Vector',
      value: `${windSpeed} km/h`,
      valueColor: '#0F1923',
      sub: `Heading: ${windDir}°`,
      mono: true,
      extra: (
        <span style={{
          display: 'inline-block',
          transform: `rotate(${windDir}deg)`,
          transition: 'transform 0.5s ease',
          fontSize: '1.1rem',
          lineHeight: 1,
        }}>➡️</span>
      ),
    },
  ];

  return (
    <div className="card" style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: '#FFF7ED',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Flame size={16} color="#EA580C" />
        </div>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1923', margin: 0 }}>
            Fire Weather Index (FWI) & Rate of Spread
          </h3>
          <p style={{ fontSize: '0.74rem', color: '#7A8FA6', margin: 0 }}>
            Canadian FWI System analytics from sensor mesh
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {items.map((item) => (
          <div key={item.label} style={{
            background: '#F4F6F9',
            border: '1px solid #E2E6ED',
            borderRadius: 10,
            padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              {item.icon}
              <span className="section-label">{item.label}</span>
            </div>
            <div style={{
              fontSize: '1.3rem', fontWeight: 800,
              color: item.valueColor,
              fontFamily: item.mono ? 'JetBrains Mono, monospace' : 'Inter, sans-serif',
              letterSpacing: item.mono ? '-0.02em' : '-0.01em',
              display: 'flex', alignItems: 'center', gap: 8,
              marginBottom: 4,
            }}>
              {item.value}
              {item.extra}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#7A8FA6', margin: 0 }}>{item.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
