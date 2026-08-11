import React, { useState } from 'react';
import axios from 'axios';
import { Sliders, RotateCcw, Zap } from 'lucide-react';

const SLIDERS = [
  { key: 'temp',     label: 'Temperature',  min: 10,  max: 90,   step: 1,   unit: '°C',   accent: '#EA580C', hotFn: v => v > 45 },
  { key: 'co',       label: 'CO Level',     min: 1,   max: 150,  step: 1,   unit: 'ppm',  accent: '#B45309', hotFn: v => v > 50 },
  { key: 'humidity', label: 'Humidity',     min: 5,   max: 95,   step: 1,   unit: '%',    accent: '#0369A1', hotFn: () => false },
  { key: 'smoke',    label: 'Smoke ADC',    min: 100, max: 3000, step: 50,  unit: '',     accent: '#7C3AED', hotFn: () => false },
  { key: 'wind',     label: 'Wind Speed',   min: 0,   max: 60,   step: 1,   unit: 'km/h', accent: '#15803D', hotFn: () => false },
];

const DEFAULTS = { temp: 25, co: 5, humidity: 55, smoke: 300, wind: 15 };

export default function ManualTelemetryInjector({ selectedNodeId, onTelemetryInjected }) {
  const [vals, setVals] = useState(DEFAULTS);
  const [injecting, setInjecting] = useState(false);
  const [success, setSuccess] = useState(false);

  const setVal = (key, v) => setVals(prev => ({ ...prev, [key]: v }));

  const handleInject = async () => {
    setInjecting(true);
    setSuccess(false);
    try {
      await axios.post('/api/nodes/inject-telemetry', {
        node_id: selectedNodeId,
        temperature:     parseFloat(vals.temp),
        humidity:        parseFloat(vals.humidity),
        co_ppm:          parseFloat(vals.co),
        smoke_raw:       parseFloat(vals.smoke),
        wind_speed_kmh:  parseFloat(vals.wind),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      if (onTelemetryInjected) onTelemetryInjected();
    } catch (e) {
      console.error('Inject error:', e);
    } finally {
      setInjecting(false);
    }
  };

  const handleReset = async () => {
    try {
      await axios.post(`/api/nodes/clear-override?node_id=${selectedNodeId}`);
      setVals(DEFAULTS);
      if (onTelemetryInjected) onTelemetryInjected();
    } catch (e) {
      console.error('Reset error:', e);
    }
  };

  return (
    <div className="card" style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        flexWrap: 'wrap', gap: 12, marginBottom: 18, paddingBottom: 14,
        borderBottom: '1px solid #F0F2F5',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: '#FFF7ED',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sliders size={16} color="#EA580C" />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1923', margin: 0 }}>
              Manual Telemetry Injector — <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>{selectedNodeId}</span>
            </h3>
            <p style={{ fontSize: '0.74rem', color: '#7A8FA6', margin: 0 }}>
              Override live sensor values to test the AI risk classifier
            </p>
          </div>
        </div>
        <button onClick={handleReset} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 13px' }}>
          <RotateCcw size={13} />
          Reset to Auto
        </button>
      </div>

      {/* Slider Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginBottom: 20 }}>
        {SLIDERS.map(({ key, label, min, max, step, unit, accent, hotFn }) => {
          const v = vals[key];
          const isHot = hotFn(parseFloat(v));
          return (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#3D4F63' }}>{label}</span>
                <span style={{
                  fontSize: '0.82rem', fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: isHot ? '#B91C1C' : '#0F1923',
                }}>
                  {v}{unit}
                </span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={v}
                onChange={(e) => setVal(key, e.target.value)}
                style={{ width: '100%', accentColor: accent, cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#B0BFCF', marginTop: 2 }}>
                <span>{min}{unit}</span>
                <span>{max}{unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inject Button */}
      <button
        onClick={handleInject}
        disabled={injecting}
        style={{
          width: '100%',
          background: success
            ? 'linear-gradient(135deg, #15803D, #166534)'
            : 'linear-gradient(135deg, #F97316, #EA580C)',
          color: '#fff',
          border: 'none',
          padding: '12px',
          borderRadius: 10,
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: injecting ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: success
            ? '0 3px 12px rgba(21,128,61,0.35)'
            : '0 3px 12px rgba(234,88,12,0.35)',
          transition: 'all 0.2s ease',
          fontFamily: 'inherit',
          opacity: injecting ? 0.7 : 1,
        }}
      >
        <Zap size={16} />
        {injecting ? 'Injecting...' : success ? '✓ Telemetry Injected!' : '⚡ Inject Override Telemetry'}
      </button>
    </div>
  );
}
