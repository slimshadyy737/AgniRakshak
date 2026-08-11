import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import RegionSelector from './components/RegionSelector';
import MetricsRow from './components/MetricsRow';
import LeafletMap from './components/LeafletMap';
import TelemetryCharts from './components/TelemetryCharts';
import ScenarioControls from './components/ScenarioControls';
import AIExplanationCard from './components/AIExplanationCard';
import NodeDetails from './components/NodeDetails';
import LoadingOverlay from './components/LoadingOverlay';
import AIReportModal from './components/AIReportModal';
import AudioSiren from './components/AudioSiren';
import FireWeatherWidget from './components/FireWeatherWidget';
import ManualTelemetryInjector from './components/ManualTelemetryInjector';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [systemStatus, setSystemStatus] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState('NODE-01');
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAIReportOpen, setIsAIReportOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('agnirakshak_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('agnirakshak_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // REST Data Polling & History Fetcher
  const fetchData = async () => {
    try {
      const [statusRes, nodesRes, historyRes] = await Promise.all([
        axios.get('/api/system/status'),
        axios.get('/api/nodes'),
        axios.get(`/api/nodes/${selectedNodeId}/history`)
      ]);

      setSystemStatus(statusRes.data);
      setNodes(nodesRes.data);
      setHistoryData(historyRes.data);
      
      if (loading) {
        setTimeout(() => setLoading(false), 600);
      }
    } catch (error) {
      console.error('Error fetching data from FastAPI backend:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [selectedNodeId]);

  const handleSelectScenario = async (scenario) => {
    try {
      await axios.post('/api/simulation/scenario', { scenario });
      fetchData();
    } catch (error) {
      console.error('Error setting scenario:', error);
    }
  };

  const handleStepSimulation = async () => {
    try {
      await axios.post('/api/simulation/step');
      fetchData();
    } catch (error) {
      console.error('Error stepping simulation:', error);
    }
  };

  const focusNode = nodes.find((n) => n.node_id === selectedNodeId) || nodes[0];

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Audio Siren Synthesizer */}
      <AudioSiren activeRiskLevel={systemStatus?.system_risk_level || 0} isMuted={isMuted} />

      {/* Top Header Navigation */}
      <Header
        systemStatus={systemStatus}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenAIReport={() => setIsAIReportOpen(true)}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
      />

      {/* Global Region & Location Selector */}
      <RegionSelector onRegionChanged={fetchData} />

      {/* Emergency Alert Banner */}
      {systemStatus?.system_risk_level === 2 && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1.5px solid #EF4444',
          color: '#EF4444',
          padding: '14px 20px',
          borderRadius: '14px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontWeight: '700',
          fontSize: '0.95rem',
          boxShadow: '0 4px 20px rgba(239, 68, 68, 0.25)',
          animation: 'pulseGlowRed 2s infinite'
        }}>
          <AlertCircle size={24} />
          🚨 CRITICAL WILDFIRE EMERGENCY DETECTED! High-risk ignition active on node mesh. Incident response dispatched.
        </div>
      )}

      {/* Metrics Row Cards */}
      <MetricsRow systemStatus={systemStatus} focusNode={focusNode} />

      {/* Fire Weather Index & Rate of Spread Analytics Widget */}
      <FireWeatherWidget focusNode={focusNode} />

      {/* Main Content Layout: Map + Node Metadata */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <LeafletMap
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          onDeployNode={fetchData}
          theme={theme}
        />
        <NodeDetails node={focusNode} />
      </div>

      {/* Real-time Telemetry Recharts */}
      <div style={{ marginBottom: '20px' }}>
        <TelemetryCharts
          historyData={historyData}
          selectedNodeId={selectedNodeId}
          theme={theme}
        />
      </div>

      {/* Interactive Manual Sensor Telemetry Injector Sliders */}
      <ManualTelemetryInjector
        selectedNodeId={selectedNodeId}
        onTelemetryInjected={fetchData}
      />

      {/* Scenario Controls Panel */}
      <ScenarioControls
        currentScenario={systemStatus?.current_scenario || 'NORMAL'}
        onSelectScenario={handleSelectScenario}
        onStepSimulation={handleStepSimulation}
      />

      {/* AI Explanation Card */}
      <AIExplanationCard focusNode={focusNode} />

      {/* Gemma AI Situation Report Modal */}
      <AIReportModal
        isOpen={isAIReportOpen}
        onClose={() => setIsAIReportOpen(false)}
        selectedNode={focusNode}
      />

      {/* Footer */}
      <footer style={{
        marginTop: '30px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.82rem',
        paddingTop: '16px',
        borderTop: '1px solid var(--bg-card-border)'
      }}>
        AgniRakshak Next-Generation Environmental AI & Wildfire Response Network
      </footer>
    </div>
  );
}
