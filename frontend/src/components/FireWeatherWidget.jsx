import React from 'react';
import { Flame, Compass, Droplets, Gauge } from 'lucide-react';

export default function FireWeatherWidget({ focusNode }) {
  if (!focusNode || !focusNode.fwi_analytics) return null;

  const fwi = focusNode.fwi_analytics;
  const windSpeed = focusNode.wind_speed_kmh || 12.0;
  const windDeg = focusNode.wind_direction_deg || 90;

  return (
    <div className="glass-card" style={{ marginBottom: '20px' }}>
      <h3 style={{
        fontSize: '1.05rem',
        fontWeight: '700',
        color: 'var(--text-heading)',
        marginBottom: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Gauge size={18} color="#F97316" />
        Fire Weather Index (FWI) & Rate of Spread Analytics
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        {/* FWI Danger Category */}
        <div style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--bg-card-border)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.5px' }}>FWI DANGER RATING</span>
          <div style={{ color: fwi.color, fontWeight: '800', fontSize: '1.15rem', marginTop: '2px' }}>
            {fwi.danger_category}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2px' }}>
            Initial Spread Index: <strong>{fwi.isi}</strong>
          </div>
        </div>

        {/* Vapor Pressure Deficit */}
        <div style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--bg-card-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700' }}>
            <Droplets size={14} color="#0EA5E9" />
            VAPOR PRESSURE DEFICIT (VPD)
          </div>
          <div style={{ color: 'var(--text-main)', fontWeight: '800', fontSize: '1.25rem', marginTop: '2px' }}>
            {fwi.vpd_kpa} kPa
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2px' }}>
            {fwi.vpd_kpa > 2.0 ? '🚨 Critical fuel drying' : 'Normal moisture balance'}
          </div>
        </div>

        {/* Estimated Rate of Spread */}
        <div style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--bg-card-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700' }}>
            <Flame size={14} color="#EF4444" />
            RATE OF SPREAD (ROS)
          </div>
          <div style={{ color: '#EF4444', fontWeight: '800', fontSize: '1.25rem', marginTop: '2px' }}>
            {fwi.rate_of_spread_m_min} m/min
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2px' }}>
            Estimated propagation velocity
          </div>
        </div>

        {/* Wind Vector */}
        <div style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--bg-card-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700' }}>
            <Compass size={14} color="#F59E0B" />
            WIND VECTOR
          </div>
          <div style={{ color: 'var(--text-main)', fontWeight: '800', fontSize: '1.25rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{windSpeed} km/h</span>
            <div style={{
              transform: `rotate(${windDeg}deg)`,
              display: 'inline-block',
              transition: 'transform 0.5s ease'
            }}>
              ⬆️
            </div>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2px' }}>
            Heading: <strong>{windDeg}°</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
