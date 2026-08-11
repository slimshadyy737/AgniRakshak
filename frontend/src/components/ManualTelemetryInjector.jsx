import React, { useState } from 'react';
import axios from 'axios';
import { Sliders, RefreshCw, Send } from 'lucide-react';

export default function ManualTelemetryInjector({ selectedNodeId, onTelemetryInjected }) {
  const [temp, setTemp] = useState(25);
  const [co, setCo] = useState(5);
  const [humidity, setHumidity] = useState(55);
  const [smoke, setSmoke] = useState(300);
  const [wind, setWind] = useState(15);
  const [injecting, setInjecting] = useState(false);

  const handleInject = async () => {
    setInjecting(true);
    try {
      await axios.post('/api/nodes/inject-telemetry', {
        node_id: selectedNodeId,
        temperature: parseFloat(temp),
        humidity: parseFloat(humidity),
        co_ppm: parseFloat(co),
        smoke_raw: parseFloat(smoke),
        wind_speed_kmh: parseFloat(wind)
      });
      if (onTelemetryInjected) onTelemetryInjected();
    } catch (e) {
      console.error('Error injecting telemetry:', e);
    } finally {
      setInjecting(false);
    }
  };

  const handleClearOverride = async () => {
    try {
      await axios.post(`/api/nodes/clear-override?node_id=${selectedNodeId}`);
      if (onTelemetryInjected) onTelemetryInjected();
    } catch (e) {
      console.error('Error clearing override:', e);
    }
  };

  return (
    <div className="glass-card" style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={18} color="#0EA5E9" />
          Interactive Live Telemetry Injector ({selectedNodeId})
        </h3>
        <button
          onClick={handleClearOverride}
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--bg-card-border)',
            color: 'var(--text-muted)',
            padding: '4px 12px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw size={12} />
          Reset to Auto Simulator
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        {/* Slider 1: Temperature */}
        <div>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            <span>Temperature</span>
            <span style={{ color: '#F97316', fontWeight: '700' }}>{temp} °C</span>
          </label>
          <input
            type="range"
            min="10"
            max="80"
            step="1"
            value={temp}
            onChange={(e) => setTemp(e.target.value)}
            style={{ width: '100%', accentColor: '#F97316', marginTop: '6px' }}
          />
        </div>

        {/* Slider 2: Carbon Monoxide */}
        <div>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            <span>CO Level</span>
            <span style={{ color: '#F59E0B', fontWeight: '700' }}>{co} ppm</span>
          </label>
          <input
            type="range"
            min="0"
            max="250"
            step="5"
            value={co}
            onChange={(e) => setCo(e.target.value)}
            style={{ width: '100%', accentColor: '#F59E0B', marginTop: '6px' }}
          />
        </div>

        {/* Slider 3: Humidity */}
        <div>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            <span>Humidity</span>
            <span style={{ color: '#0EA5E9', fontWeight: '700' }}>{humidity} %</span>
          </label>
          <input
            type="range"
            min="5"
            max="95"
            step="1"
            value={humidity}
            onChange={(e) => setHumidity(e.target.value)}
            style={{ width: '100%', accentColor: '#0EA5E9', marginTop: '6px' }}
          />
        </div>

        {/* Slider 4: Smoke ADC */}
        <div>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            <span>Smoke ADC</span>
            <span style={{ color: '#8B5CF6', fontWeight: '700' }}>{smoke}</span>
          </label>
          <input
            type="range"
            min="100"
            max="3000"
            step="50"
            value={smoke}
            onChange={(e) => setSmoke(e.target.value)}
            style={{ width: '100%', accentColor: '#8B5CF6', marginTop: '6px' }}
          />
        </div>

        {/* Slider 5: Wind Speed */}
        <div>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            <span>Wind Speed</span>
            <span style={{ color: '#10B981', fontWeight: '700' }}>{wind} km/h</span>
          </label>
          <input
            type="range"
            min="0"
            max="60"
            step="2"
            value={wind}
            onChange={(e) => setWind(e.target.value)}
            style={{ width: '100%', accentColor: '#10B981', marginTop: '6px' }}
          />
        </div>
      </div>

      <button
        onClick={handleInject}
        disabled={injecting}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
          color: '#FFFFFF',
          border: 'none',
          padding: '10px',
          borderRadius: '10px',
          fontWeight: '700',
          fontSize: '0.9rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 4px 14px rgba(14, 165, 233, 0.35)'
        }}
      >
        <Send size={16} />
        {injecting ? 'Injecting Custom Telemetry...' : 'Inject Test Telemetry & Evaluate AI Model'}
      </button>
    </div>
  );
}
