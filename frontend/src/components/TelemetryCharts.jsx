import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Download } from 'lucide-react';

export default function TelemetryCharts({ historyData, selectedNodeId, theme }) {
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#334155' : '#E2E8F0';
  const textColor = isDark ? '#94A3B8' : '#64748B';
  const tooltipBg = isDark ? '#1E293B' : '#FFFFFF';
  const tooltipBorder = isDark ? '#334155' : '#CBD5E1';

  const handleDownloadCSV = () => {
    window.open(`/api/telemetry/export-csv?node_id=${selectedNodeId}`, '_blank');
  };

  if (!historyData || historyData.length === 0) {
    return (
      <div className="glass-card" style={{ height: '440px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading telemetry time-series streams...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-heading)', margin: 0 }}>
          📈 Live Multi-Sensor Telemetry Time-Series ({selectedNodeId})
        </h3>
        <button
          onClick={handleDownloadCSV}
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--bg-card-border)',
            color: 'var(--text-main)',
            padding: '6px 14px',
            borderRadius: '10px',
            fontSize: '0.8rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          title="Download Telemetry CSV for Data Science analysis"
        >
          <Download size={14} />
          Export CSV Telemetry Logs
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Chart 1: Temperature */}
        <div className="glass-card" style={{ height: '245px' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-heading)', fontWeight: '700', marginBottom: '8px' }}>
            🌡️ Temperature (°C) & Derivative dT/dt (°C/min)
          </h4>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="timestamp" stroke={textColor} fontSize={11} />
              <YAxis stroke={textColor} fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px', color: 'var(--text-main)' }} />
              <Line type="monotone" dataKey="temperature" stroke="#F97316" strokeWidth={2.5} dot={false} name="Temp (°C)" />
              <Line type="monotone" dataKey="derivatives.dT_dt" stroke="#EF4444" strokeWidth={1.5} dot={false} name="dT/dt (°C/min)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: CO Level */}
        <div className="glass-card" style={{ height: '245px' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-heading)', fontWeight: '700', marginBottom: '8px' }}>
            💨 Carbon Monoxide CO (ppm) & dCO/dt (ppm/min)
          </h4>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="timestamp" stroke={textColor} fontSize={11} />
              <YAxis stroke={textColor} fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px', color: 'var(--text-main)' }} />
              <Line type="monotone" dataKey="co_ppm" stroke="#F59E0B" strokeWidth={2.5} dot={false} name="CO (ppm)" />
              <Line type="monotone" dataKey="derivatives.dCO_dt" stroke="#F43F5E" strokeWidth={1.5} dot={false} name="dCO/dt (ppm/min)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 3: Humidity */}
        <div className="glass-card" style={{ height: '225px' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-heading)', fontWeight: '700', marginBottom: '8px' }}>
            💧 Relative Humidity (%)
          </h4>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="timestamp" stroke={textColor} fontSize={11} />
              <YAxis stroke={textColor} fontSize={11} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px', color: 'var(--text-main)' }} />
              <Line type="monotone" dataKey="humidity" stroke="#0EA5E9" strokeWidth={2.5} dot={false} name="Humidity (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 4: Smoke ADC */}
        <div className="glass-card" style={{ height: '225px' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-heading)', fontWeight: '700', marginBottom: '8px' }}>
            🔥 Smoke / Air Quality Signal (Raw ADC)
          </h4>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="timestamp" stroke={textColor} fontSize={11} />
              <YAxis stroke={textColor} fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px', color: 'var(--text-main)' }} />
              <Line type="monotone" dataKey="smoke_raw" stroke="#8B5CF6" strokeWidth={2.5} dot={false} name="Smoke (ADC)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
