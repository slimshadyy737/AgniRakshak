import React, { useState } from 'react';
import axios from 'axios';
import { Globe, MapPin, X, Navigation, Search, CheckCircle } from 'lucide-react';

const POPULAR_GLOBAL_ZONES = [
  { name: 'Lahaina, Maui (Hawaii)', lat: 20.8783, lon: -156.6825, code: 'US' },
  { name: 'Valparaiso Forest (Chile)', lat: -33.0472, lon: -71.6127, code: 'CL' },
  { name: 'Fort McMurray Boreal (Canada)', lat: 56.7262, lon: -111.3803, code: 'CA' },
  { name: 'Rhodes Island (Greece)', lat: 36.4349, lon: 28.2175, code: 'GR' },
  { name: 'Pantanal Wetlands (Brazil)', lat: -16.2750, lon: -56.6340, code: 'BR' },
  { name: 'Uttarkashi Himalayan Forest (India)', lat: 30.7268, lon: 78.4354, code: 'IN' },
  { name: 'Mallacoota Bushlands (Australia)', lat: -37.5550, lon: 149.7567, code: 'AU' },
  { name: 'Bordeaux Pine Forest (France)', lat: 44.8378, lon: -0.5792, code: 'FR' },
];

export default function CustomLocationModal({ isOpen, onClose, onLocationSet }) {
  const [cityName, setCityName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleApplyCustom = async (name, lat, lon) => {
    const finalName = name || cityName || `Sector [${parseFloat(lat).toFixed(2)}, ${parseFloat(lon).toFixed(2)}]`;
    const numLat = parseFloat(lat || latitude);
    const numLon = parseFloat(lon || longitude);

    if (isNaN(numLat) || isNaN(numLon)) {
      setErrorMsg('Please enter valid numerical latitude and longitude coordinates.');
      return;
    }

    if (numLat < -90 || numLat > 90 || numLon < -180 || numLon > 180) {
      setErrorMsg('Latitude must be between -90 and 90, Longitude between -180 and 180.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await axios.post('/api/region/custom', {
        name: finalName,
        latitude: numLat,
        longitude: numLon
      });
      onLocationSet?.();
      onClose();
    } catch (e) {
      setErrorMsg('Failed to set custom location: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1100,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 20,
        width: '100%',
        maxWidth: 720,
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        border: '1px solid #E2E8F0',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: '#16A34A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
            }}>
              <Globe size={22} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Global City & Custom GPS Model
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0 0' }}>
                Teleport AgniRakshak to any GPS coordinate on Earth with live weather & NASA satellites
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#F1F5F9', border: 'none', borderRadius: 10,
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#64748B'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Custom Input Form */}
        <div style={{ padding: '20px 24px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr auto', gap: 10, alignItems: 'flex-end' }}>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                LOCATION / CITY NAME
              </label>
              <input
                type="text"
                placeholder="e.g. Maui Forest Sector"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 8,
                  border: '1px solid #CBD5E1', fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                LATITUDE (° N/S)
              </label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 20.878"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 8,
                  border: '1px solid #CBD5E1', fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                LONGITUDE (° E/W)
              </label>
              <input
                type="number"
                step="any"
                placeholder="e.g. -156.682"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 8,
                  border: '1px solid #CBD5E1', fontSize: '0.85rem'
                }}
              />
            </div>

            <button
              onClick={() => handleApplyCustom(cityName, latitude, longitude)}
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '9px 16px', fontSize: '0.84rem', gap: 6 }}
            >
              <Navigation size={14} /> Teleport Network
            </button>
          </div>

          {errorMsg && (
            <div style={{ color: '#DC2626', fontSize: '0.78rem', fontWeight: 600, marginTop: 8 }}>
              {errorMsg}
            </div>
          )}
        </div>

        {/* Global Wildfire Zone Presets */}
        <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155', margin: '0 0 12px 0' }}>
            🌍 1-Click Iconic Global Wildfire Hazard Zones
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {POPULAR_GLOBAL_ZONES.map((zone) => (
              <div
                key={zone.name}
                onClick={() => handleApplyCustom(zone.name, zone.lat, zone.lon)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: 12,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#16A34A';
                  e.currentTarget.style.background = '#F0FDF4';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.background = '#FFFFFF';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#F1F5F9', color: '#475569', padding: '1px 5px', borderRadius: 4 }}>
                      [{zone.code}]
                    </span>
                    <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>{zone.name}</strong>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2, display: 'block' }}>
                    {zone.lat.toFixed(4)}°, {zone.lon.toFixed(4)}°
                  </span>
                </div>
                <Navigation size={14} color="#16A34A" />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 24px',
          background: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#64748B'
        }}>
          <span>Live Environmental Sync: <strong>Open-Meteo & Copernicus Satellite Grid</strong></span>
          <span>Mesh Outposts Auto-Populated</span>
        </div>
      </div>
    </div>
  );
}
