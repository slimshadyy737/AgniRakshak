import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Cpu, X, Play, Square, Activity, Wifi, Terminal, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function WebSerialSensorModal({ isOpen, onClose, onSensorIngested }) {
  const [isConnected, setIsConnected] = useState(false);
  const [baudRate, setBaudRate] = useState(115200);
  const [nodeId, setNodeId] = useState('NODE-PHYSICAL-01');
  const [nodeName, setNodeName] = useState('ESP32 DevKit Sensor Outpost');
  const [logs, setLogs] = useState([]);
  const [isVirtualStreaming, setIsVirtualStreaming] = useState(false);
  const [latestData, setLatestData] = useState(null);
  const [packetsCount, setPacketsCount] = useState(0);

  const portRef = useRef(null);
  const readerRef = useRef(null);
  const virtualIntervalRef = useRef(null);

  const addLog = (msg) => {
    setLogs(prev => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev.slice(0, 40)
    ]);
  };

  // WebSerial API Connection
  const handleConnectSerial = async () => {
    if (!('serial' in navigator)) {
      alert('WebSerial API is supported in Google Chrome, Microsoft Edge, and Opera.\nFor Firefox/Safari or background streaming, use firmware/live_serial_sensor_bridge.py!');
      return;
    }

    try {
      addLog('Requesting USB Serial Port...');
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: parseInt(baudRate) });
      portRef.current = port;
      setIsConnected(true);
      addLog(`Connected to serial port at ${baudRate} baud.`);

      // Read serial stream loop
      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      readerRef.current = reader;

      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          reader.releaseLock();
          break;
        }
        if (value) {
          buffer += value;
          const lines = buffer.split('\n');
          buffer = lines.pop(); // keep remainder

          for (const line of lines) {
            const clean = line.trim();
            if (!clean) continue;
            addLog(`RX: ${clean}`);
            processSerialLine(clean);
          }
        }
      }
    } catch (err) {
      console.error('Serial connection error:', err);
      addLog(`Error: ${err.message}`);
      setIsConnected(false);
    }
  };

  const handleDisconnectSerial = async () => {
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
      }
      if (portRef.current) {
        await portRef.current.close();
      }
    } catch (e) {
      console.error(e);
    }
    setIsConnected(false);
    addLog('Disconnected from USB serial port.');
  };

  const processSerialLine = async (line) => {
    let payload = null;
    // Format 1: JSON
    if (line.startsWith('{') && line.endsWith('}')) {
      try {
        payload = JSON.parse(line);
      } catch (e) {}
    }
    // Format 2: CSV (temp,hum,co,smoke)
    else if (line.includes(',')) {
      const parts = line.split(',');
      if (parts.length >= 3) {
        payload = {
          temperature: parseFloat(parts[0]),
          humidity: parseFloat(parts[1]),
          co_ppm: parseFloat(parts[2]),
          smoke_raw: parts[3] ? parseFloat(parts[3]) : 300.0
        };
      }
    }

    if (payload && !isNaN(payload.temperature)) {
      payload.node_id = nodeId;
      payload.node_name = nodeName;
      transmitSensorData(payload);
    }
  };

  const transmitSensorData = async (payload) => {
    try {
      const res = await axios.post('/api/sensor/telemetry', payload);
      setLatestData(res.data.node_data);
      setPacketsCount(prev => prev + 1);
      onSensorIngested?.();
    } catch (err) {
      console.error('Sensor ingestion error:', err);
    }
  };

  // Virtual Mock Streamer for immediate testing
  const toggleVirtualStreamer = () => {
    if (isVirtualStreaming) {
      clearInterval(virtualIntervalRef.current);
      setIsVirtualStreaming(false);
      addLog('Virtual Hardware Streamer stopped.');
    } else {
      setIsVirtualStreaming(true);
      addLog('Virtual Hardware Streamer started (2.5s cadence).');
      virtualIntervalRef.current = setInterval(() => {
        const mockPayload = {
          node_id: nodeId,
          node_name: nodeName,
          temperature: +(27.0 + Math.random() * 3.5).toFixed(1),
          humidity: +(48.0 + Math.random() * 6.0).toFixed(1),
          co_ppm: +(3.2 + Math.random() * 1.5).toFixed(1),
          smoke_raw: +(280 + Math.floor(Math.random() * 35)),
          battery_level: +(98.5 - Math.random() * 0.2).toFixed(1),
          rssi_dbm: -54
        };
        addLog(`TX [Virtual]: ${mockPayload.temperature}°C, ${mockPayload.humidity}%, ${mockPayload.co_ppm}ppm CO`);
        transmitSensorData(mockPayload);
      }, 2500);
    }
  };

  useEffect(() => {
    return () => {
      if (virtualIntervalRef.current) clearInterval(virtualIntervalRef.current);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 20,
        width: '100%',
        maxWidth: 860,
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
          background: 'linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: '#2563EB',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}>
              <Cpu size={24} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Physical Sensor Hardware Ingestion
                </h2>
                <span style={{
                  background: isConnected || isVirtualStreaming ? '#DCFCE7' : '#F1F5F9',
                  color: isConnected || isVirtualStreaming ? '#16A34A' : '#64748B',
                  fontSize: '0.72rem', fontWeight: 800,
                  padding: '2px 8px', borderRadius: 12,
                  display: 'flex', alignItems: 'center', gap: 4
                }}>
                  <Activity size={10} className={isConnected || isVirtualStreaming ? 'animate-pulse' : ''} />
                  {isConnected ? 'USB SERIAL CONNECTED' : isVirtualStreaming ? 'VIRTUAL STREAM ACTIVE' : 'DISCONNECTED'}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '2px 0 0 0' }}>
                Connect ESP32, Arduino, or Raspberry Pi microcontrollers directly via Chrome WebSerial or REST API
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

        {/* Configuration Panel */}
        <div style={{
          padding: '20px 24px',
          background: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16
        }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
              NODE IDENTIFIER
            </label>
            <input
              type="text"
              value={nodeId}
              onChange={(e) => setNodeId(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 8,
                border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: 600
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
              HARDWARE NAME
            </label>
            <input
              type="text"
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 8,
                border: '1px solid #CBD5E1', fontSize: '0.85rem'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
              BAUD RATE
            </label>
            <select
              value={baudRate}
              onChange={(e) => setBaudRate(e.target.value)}
              disabled={isConnected}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 8,
                border: '1px solid #CBD5E1', fontSize: '0.85rem', background: '#FFFFFF'
              }}
            >
              <option value="9600">9600 Baud</option>
              <option value="57600">57600 Baud</option>
              <option value="115200">115200 Baud (Standard ESP32)</option>
              <option value="230400">230400 Baud</option>
            </select>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{
          padding: '14px 24px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#FFFFFF'
        }}>
          <div style={{ display: 'flex', gap: 10 }}>
            {!isConnected ? (
              <button
                onClick={handleConnectSerial}
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.84rem', gap: 6 }}
              >
                <Play size={14} /> Connect Physical USB Device
              </button>
            ) : (
              <button
                onClick={handleDisconnectSerial}
                className="btn"
                style={{ background: '#DC2626', color: '#FFFFFF', padding: '8px 16px', fontSize: '0.84rem', gap: 6 }}
              >
                <Square size={14} /> Disconnect USB
              </button>
            )}

            <button
              onClick={toggleVirtualStreamer}
              className="btn btn-secondary"
              style={{
                padding: '8px 16px', fontSize: '0.84rem', gap: 6,
                borderColor: isVirtualStreaming ? '#93C5FD' : undefined,
                background: isVirtualStreaming ? '#EFF6FF' : undefined,
                color: isVirtualStreaming ? '#2563EB' : undefined
              }}
            >
              <Activity size={14} />
              {isVirtualStreaming ? 'Stop Virtual Stream' : 'Run Virtual Test Stream'}
            </button>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
            Packets Ingested: <strong style={{ color: '#0F172A' }}>{packetsCount}</strong>
          </div>
        </div>

        {/* Main Content (Latest Telemetry + Terminal Logs) */}
        <div style={{
          flex: 1,
          padding: '20px 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 18,
          overflowY: 'auto'
        }}>
          {/* Latest Live Packet */}
          <div style={{
            background: '#F8FAFC',
            borderRadius: 14,
            border: '1px solid #E2E8F0',
            padding: 16,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.88rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={16} color="#16A34A" /> Live Ingested Sensor State
            </h4>

            {latestData ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, flex: 1 }}>
                <div style={{ background: '#FFFFFF', padding: 12, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>TEMPERATURE</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#EA580C', marginTop: 2 }}>
                    {latestData.temperature} °C
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', padding: 12, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>HUMIDITY</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0284C7', marginTop: 2 }}>
                    {latestData.humidity} %
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', padding: 12, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>CO CONCENTRATION</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#DC2626', marginTop: 2 }}>
                    {latestData.co_ppm} ppm
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', padding: 12, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>AI RISK STATUS</span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: latestData.color, marginTop: 4 }}>
                    {latestData.risk_label}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Activity size={32} style={{ marginBottom: 8 }} />
                <span>Awaiting incoming hardware packet...</span>
              </div>
            )}
          </div>

          {/* Terminal Logs */}
          <div style={{
            background: '#0F172A',
            borderRadius: 14,
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'monospace',
            fontSize: '0.76rem',
            color: '#38BDF8',
            maxHeight: 250,
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: '#94A3B8', borderBottom: '1px solid #334155', paddingBottom: 6 }}>
              <Terminal size={14} />
              <span>Hardware UART Stream Console</span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {logs.length === 0 ? (
                <span style={{ color: '#64748B' }}>// Ready for serial connection...</span>
              ) : (
                logs.map((l, i) => <div key={i} style={{ wordBreak: 'break-all' }}>{l}</div>)
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 24px',
          background: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.78rem',
          color: '#64748B'
        }}>
          <span>Direct REST Endpoint: <code>POST /api/sensor/telemetry</code></span>
          <span>Target Firmware: <code>firmware/esp32_agnirakshak.ino</code></span>
        </div>
      </div>
    </div>
  );
}
