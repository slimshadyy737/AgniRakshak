import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import ActiveSensorStream from './components/ActiveSensorStream';
import RightCommandPanel from './components/RightCommandPanel';
import MetricsRow from './components/MetricsRow';
import LeafletMap from './components/LeafletMap';
import TelemetryCharts from './components/TelemetryCharts';
import ManualTelemetryInjector from './components/ManualTelemetryInjector';
import AIExplanationCard from './components/AIExplanationCard';
import NodeDetails from './components/NodeDetails';
import LoadingOverlay from './components/LoadingOverlay';
import AIReportModal from './components/AIReportModal';
import AudioSiren from './components/AudioSiren';
import FireWeatherWidget from './components/FireWeatherWidget';
import { AlertCircle, Clock, Keyboard } from 'lucide-react';

export default function App() {
  const [systemStatus, setSystemStatus] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState('NODE-01');
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAIReportOpen, setIsAIReportOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState('tactical-map');

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      const k = e.key;
      if (k === 'r' || k === 'R') setIsAIReportOpen(v => !v);
      if (k === 'm' || k === 'M') setIsMuted(v => !v);
      if (k === 'd' || k === 'D') {
        const base = axios.defaults.baseURL || '';
        window.open(`${base}/api/incidents/export-html`, '_blank');
      }
      if (k === '1') setActiveTab('tactical-map');
      if (k === '2') setActiveTab('sensor-network');
      if (k === '3') setActiveTab('analytics');
      if (k === '4') setActiveTab('ai-intelligence');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const fetchData = async () => {
    try {
      const [statusRes, nodesRes, historyRes] = await Promise.all([
        axios.get('/api/system/status'),
        axios.get('/api/nodes'),
        axios.get(`/api/nodes/${selectedNodeId}/history`),
      ]);
      setSystemStatus(statusRes.data);
      setNodes(nodesRes.data);
      setHistoryData(historyRes.data);
      if (loading) setTimeout(() => setLoading(false), 600);
    } catch (err) {
      console.error('Fetch error:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2500);
    return () => clearInterval(interval);
  }, [selectedNodeId]);

  const handleSelectScenario = async (scenario) => {
    try { await axios.post('/api/simulation/scenario', { scenario }); fetchData(); }
    catch (e) { console.error(e); }
  };

  const handleStepSimulation = async () => {
    try { await axios.post('/api/simulation/step'); fetchData(); }
    catch (e) { console.error(e); }
  };

  const handleDecommissionNode = async (nodeId) => {
    try {
      await axios.delete(`/api/nodes/${nodeId}`);
      fetchData();
    } catch (e) {
      console.error('Error decommissioning node:', e);
    }
  };

  const focusNode = nodes.find(n => n.node_id === selectedNodeId) || nodes[0];

  if (loading) return <LoadingOverlay />;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F0F2F5' }}>
      <AudioSiren activeRiskLevel={systemStatus?.system_risk_level || 0} isMuted={isMuted} />

      {/* Sticky Header */}
      <Header
        systemStatus={systemStatus}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(v => !v)}
        onOpenAIReport={() => setIsAIReportOpen(true)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onRegionChanged={fetchData}
      />

      {/* Page Body */}
      <main style={{
        flex: 1,
        maxWidth: '1480px',
        margin: '0 auto',
        width: '100%',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}>

        {/* Critical Alert Banner */}
        {systemStatus?.system_risk_level === 2 && (
          <div className="alert-banner critical">
            <AlertCircle size={20} />
            <strong>Critical Wildfire Emergency:</strong> High-risk ignition detected on the sensor mesh. Incident response dispatched.
          </div>
        )}
        {systemStatus?.system_risk_level === 1 && (
          <div className="alert-banner warning">
            <AlertCircle size={20} />
            <strong>Elevated Risk Warning:</strong> Environmental conditions indicate elevated fire weather. Monitor closely.
          </div>
        )}

        {/* ── TAB 1: TACTICAL MAP ── */}
        {activeTab === 'tactical-map' && (
          <div className="tab-view-content" style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)',
            gap: '20px',
            alignItems: 'start',
          }}>
            {/* Left column: map + node details stacked */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <LeafletMap
                nodes={nodes}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
                onDeployNode={fetchData}
                theme="light"
              />
              <NodeDetails node={focusNode} onDecommissionNode={handleDecommissionNode} />
            </div>

            {/* Right column */}
            <RightCommandPanel
              selectedNodeId={selectedNodeId}
              currentScenario={systemStatus?.current_scenario || 'NORMAL'}
              onSelectScenario={handleSelectScenario}
              onStepSimulation={handleStepSimulation}
              onTelemetryInjected={fetchData}
              systemStatus={systemStatus}
            />
          </div>
        )}

        {/* ── TAB 2: SENSOR NETWORK ── */}
        {activeTab === 'sensor-network' && (
          <div className="tab-view-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <ActiveSensorStream
              nodes={nodes}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
            />
            <ManualTelemetryInjector
              selectedNodeId={selectedNodeId}
              onTelemetryInjected={fetchData}
            />
          </div>
        )}

        {/* ── TAB 3: ANALYTICS ── */}
        {activeTab === 'analytics' && (
          <div className="tab-view-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <MetricsRow systemStatus={systemStatus} focusNode={focusNode} />
            <FireWeatherWidget focusNode={focusNode} />
            <TelemetryCharts
              historyData={historyData}
              selectedNodeId={selectedNodeId}
              theme="light"
            />
          </div>
        )}

        {/* ── TAB 4: AI INTELLIGENCE ── */}
        {activeTab === 'ai-intelligence' && (
          <div className="tab-view-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <AIExplanationCard focusNode={focusNode} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        background: '#FFFFFF',
        borderTop: '1px solid #E2E6ED',
        padding: '10px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        fontSize: '0.78rem',
        color: '#7A8FA6',
        fontFamily: 'JetBrains Mono, monospace',
      }}>
        {/* Coordinates */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{
            background: '#F0FDF4', color: '#15803D',
            border: '1px solid #BBF7D0',
            padding: '3px 10px', borderRadius: '6px',
            fontSize: '0.75rem', fontWeight: 600,
          }}>
            {focusNode?.latitude ? `${focusNode.latitude.toFixed(4)}° N` : '26.8430° N'}
          </span>
          <span style={{
            background: '#F0FDF4', color: '#15803D',
            border: '1px solid #BBF7D0',
            padding: '3px 10px', borderRadius: '6px',
            fontSize: '0.75rem', fontWeight: 600,
          }}>
            {focusNode?.longitude ? `${focusNode.longitude.toFixed(4)}° E` : '75.5655° E'}
          </span>
        </div>

        {/* Shortcuts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Keyboard size={12} color="#EA580C" />
          {[['R', 'AI Report'], ['M', 'Mute'], ['D', 'Dispatch'], ['1-4', 'Tabs']].map(([key, label]) => (
            <span key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="kbd">{key}</span>
              <span style={{ color: '#B0BFCF' }}>{label}</span>
            </span>
          ))}
        </div>

        {/* Timestamp */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={12} />
          {systemStatus?.timestamp || new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
        </div>
      </footer>

      <AIReportModal
        isOpen={isAIReportOpen}
        onClose={() => setIsAIReportOpen(false)}
        selectedNode={focusNode}
      />
    </div>
  );
}
