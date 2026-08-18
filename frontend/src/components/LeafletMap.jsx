import React, { useState, useEffect, useRef } from 'react';
import {
  MapContainer, TileLayer, CircleMarker, Circle, Polyline, Polygon, Popup, useMap, useMapEvents
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin, Satellite, PlusCircle, Layers, Flame, Radio, Zap,
  Compass, Eye, Maximize2, Wind, ShieldAlert, Sparkles, Navigation
} from 'lucide-react';
import axios from 'axios';

// Base Tile Layers
const MAP_LAYERS = {
  satellite: {
    name: 'Satellite Orthophoto',
    icon: '🛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Earthstar Geographics, NASA FIRMS',
    maxZoom: 19
  },
  topo: {
    name: 'Forest Topo',
    icon: '🌲',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB &copy; OpenStreetMap contributors',
    subdomains: ['a', 'b', 'c', 'd'],
    maxZoom: 19
  },
  dark: {
    name: 'Tactical Dark',
    icon: '🌙',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB Dark Matter',
    subdomains: ['a', 'b', 'c', 'd'],
    maxZoom: 19
  },
  terrain: {
    name: 'Elevation Contours',
    icon: '🏔️',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap contributors',
    maxZoom: 17
  }
};

// High-speed Fly-to Controller — smooth panning without remounting DOM
function ChangeView({ center, zoom }) {
  const map = useMap();
  const prevCenter = useRef(null);

  useEffect(() => {
    if (!center || !center[0] || !center[1]) return;
    const key = `${center[0].toFixed(3)}_${center[1].toFixed(3)}`;
    if (prevCenter.current !== key) {
      prevCenter.current = key;
      map.flyTo(center, zoom || 13, { duration: 0.75, easeLinearity: 0.25 });
    }
  }, [center[0], center[1], zoom]);

  return null;
}

// Fit all nodes controller
function FitBoundsController({ nodes, shouldFit, onFitted }) {
  const map = useMap();

  useEffect(() => {
    if (shouldFit && nodes && nodes.length > 0) {
      const bounds = nodes.map(n => [n.latitude, n.longitude]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      onFitted?.();
    }
  }, [shouldFit, nodes]);

  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) });
  return null;
}

export default function LeafletMap({ nodes, selectedNodeId, onSelectNode, onDeployNode, customCenter }) {
  const [activeLayerKey, setActiveLayerKey] = useState('satellite'); // Default to high-res satellite
  const [showSatellites, setShowSatellites] = useState(true);
  const [showThreatZones, setShowThreatZones] = useState(true);
  const [firmsFires, setFirmsFires] = useState([]);
  const [clickCoords, setClickCoords] = useState(null);
  const [fitTrigger, setFitTrigger] = useState(false);
  const lastFetchedRegionKey = useRef('');

  // Center resolution
  const centerLat = customCenter ? customCenter[0] : (nodes?.length > 0 ? nodes[0].latitude : 26.8430);
  const centerLon = customCenter ? customCenter[1] : (nodes?.length > 0 ? nodes[0].longitude : 75.5655);
  const center = [centerLat, centerLon];
  const coordKey = `${centerLat.toFixed(3)}_${centerLon.toFixed(3)}`;

  // Fetch NASA FIRMS / EONET active fires when coordinates change
  useEffect(() => {
    if (lastFetchedRegionKey.current === coordKey) return;
    lastFetchedRegionKey.current = coordKey;
    axios.get(`/api/firms/active-fires?lat=${centerLat}&lon=${centerLon}`)
      .then(res => setFirmsFires(res.data.active_fires || []))
      .catch(() => setFirmsFires([]));
  }, [coordKey]);

  const handleMapClick = (lat, lng) => setClickCoords({ lat, lng });

  const handleConfirmDeploy = async () => {
    if (!clickCoords) return;
    const name = prompt('Enter Sector Name for new Mesh Node:', `Sector ${(nodes?.length || 0) + 1}`);
    if (name) {
      try {
        await axios.post('/api/nodes/deploy', { name, latitude: clickCoords.lat, longitude: clickCoords.lng });
        onDeployNode?.();
        setClickCoords(null);
      } catch (e) { console.error(e); }
    }
  };

  const getColor = (riskLevel) =>
    riskLevel === 2 ? '#DC2626' : riskLevel === 1 ? '#D97706' : '#16A34A';

  // Mesh connectivity lines
  const meshLines = (nodes?.length > 1)
    ? nodes.map((n, i) => [[n.latitude, n.longitude], [nodes[(i + 1) % nodes.length].latitude, nodes[(i + 1) % nodes.length].longitude]])
    : [];

  const currentLayer = MAP_LAYERS[activeLayerKey] || MAP_LAYERS.satellite;
  const focusNode = nodes?.find(n => n.node_id === selectedNodeId) || nodes?.[0];
  const windSpeed = focusNode?.wind_speed_kmh || 14.5;
  const windDeg = focusNode?.wind_direction_deg || 180;

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
      {/* ── TOP MAP CONTROLS & SECTOR INTELLIGENCE BAR ── */}
      <div style={{
        padding: '12px 18px',
        borderBottom: '1px solid #E2E8F0',
        background: '#FFFFFF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 10
      }}>
        {/* Left: Sector & Quick Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: '#FFF7ED',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid #FFEDD5'
          }}>
            <MapPin size={16} color="#EA580C" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {focusNode?.node_name ? focusNode.node_name.split(' - ')[0] : 'Tactical Sensor Grid'}
              </h3>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#16A34A', background: '#DCFCE7', padding: '1px 6px', borderRadius: 4 }}>
                LIVE 60FPS
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#64748B', margin: 0 }}>
              {nodes?.length || 0} IoT Outposts · {firmsFires.length} Thermal Hotspots · Wind: <strong>{windSpeed} km/h ({windDeg}°)</strong>
            </p>
          </div>
        </div>

        {/* Right: Map Layers + Feature Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {/* Layer Selector Buttons */}
          <div style={{
            display: 'flex',
            background: '#F1F5F9',
            padding: 2,
            borderRadius: 8,
            border: '1px solid #CBD5E1',
            gap: 2
          }}>
            {Object.entries(MAP_LAYERS).map(([key, lyr]) => (
              <button
                key={key}
                onClick={() => setActiveLayerKey(key)}
                style={{
                  border: 'none',
                  background: activeLayerKey === key ? '#FFFFFF' : 'transparent',
                  color: activeLayerKey === key ? '#0F172A' : '#64748B',
                  fontWeight: activeLayerKey === key ? 800 : 600,
                  fontSize: '0.72rem',
                  padding: '4px 8px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  boxShadow: activeLayerKey === key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{lyr.icon}</span>
                <span>{lyr.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Fit Mesh Extent Button */}
          <button
            onClick={() => setFitTrigger(true)}
            className="btn btn-secondary"
            style={{ padding: '5px 9px', fontSize: '0.75rem', gap: 4 }}
            title="Fit All Sensor Nodes in View"
          >
            <Maximize2 size={12} /> Fit Mesh
          </button>

          {/* Threat Zone Toggle */}
          <button
            onClick={() => setShowThreatZones(v => !v)}
            className="btn btn-secondary"
            style={{
              padding: '5px 9px', fontSize: '0.75rem', gap: 4,
              color: showThreatZones ? '#EA580C' : undefined,
              background: showThreatZones ? '#FFF7ED' : undefined,
              borderColor: showThreatZones ? '#FFEDD5' : undefined
            }}
            title="Toggle Fire Spread Threat Perimeter Buffer"
          >
            <ShieldAlert size={12} /> {showThreatZones ? 'Threat Buffer' : 'Buffer Off'}
          </button>

          {/* Deploy Confirmation Button if clicked */}
          {clickCoords && (
            <button
              onClick={handleConfirmDeploy}
              className="btn btn-primary"
              style={{ padding: '5px 10px', fontSize: '0.75rem', gap: 4 }}
            >
              <PlusCircle size={12} /> Deploy Node
            </button>
          )}
        </div>
      </div>

      {/* ── FAST MAP VIEW CONTAINER (No DOM destroying key) ── */}
      <div style={{ height: 440, position: 'relative' }}>
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          preferCanvas={true}
        >
          <ChangeView center={center} zoom={13} />
          <FitBoundsController
            nodes={nodes}
            shouldFit={fitTrigger}
            onFitted={() => setFitTrigger(false)}
          />
          <MapClickHandler onMapClick={handleMapClick} />

          {/* Active Dynamic Tile Layer */}
          <TileLayer
            key={activeLayerKey}
            url={currentLayer.url}
            attribution={currentLayer.attribution}
            subdomains={currentLayer.subdomains || ['a', 'b', 'c', 'd']}
            maxZoom={currentLayer.maxZoom || 19}
          />

          {/* Mesh communication lines */}
          {meshLines.map((line, i) => (
            <Polyline
              key={`mesh-${i}`}
              positions={line}
              pathOptions={{ color: '#38BDF8', weight: 2, opacity: 0.6, dashArray: '6,6' }}
            />
          ))}

          {/* Threat Buffer / Fire Spread Radius Circles around elevated/critical nodes */}
          {showThreatZones && nodes?.map((n) => {
            if (n.risk_level > 0) {
              const radiusMeters = n.risk_level === 2 ? 850 : 450;
              return (
                <Circle
                  key={`threat-${n.node_id}`}
                  center={[n.latitude, n.longitude]}
                  radius={radiusMeters}
                  pathOptions={{
                    color: n.risk_level === 2 ? '#DC2626' : '#D97706',
                    fillColor: n.risk_level === 2 ? '#EF4444' : '#F59E0B',
                    fillOpacity: 0.18,
                    weight: 1.5,
                    dashArray: '4,4'
                  }}
                />
              );
            }
            return null;
          })}

          {/* IoT Sensor Nodes */}
          {nodes?.map((node) => {
            const isSelected = node.node_id === selectedNodeId;
            const isPhysical = node.is_physical_hardware;
            const color = getColor(node.risk_level);
            return (
              <CircleMarker
                key={node.node_id}
                center={[node.latitude, node.longitude]}
                radius={isSelected ? 16 : (isPhysical ? 12 : 9)}
                pathOptions={{
                  color: isSelected ? '#FFFFFF' : (isPhysical ? '#2563EB' : '#FFFFFF'),
                  fillColor: isPhysical ? '#2563EB' : color,
                  fillOpacity: isSelected ? 1 : 0.9,
                  weight: isSelected ? 3.5 : 2,
                }}
                eventHandlers={{
                  click: () => onSelectNode(node.node_id)
                }}
              >
                <Popup>
                  <div style={{ fontSize: '0.85rem', fontFamily: 'Inter, sans-serif', minWidth: 210 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>
                        {node.node_name}
                      </div>
                      {isPhysical && (
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#EFF6FF', color: '#2563EB', padding: '1px 5px', borderRadius: 4 }}>
                          PHYSICAL
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', marginBottom: 6 }}>
                      ID: <strong>{node.node_id}</strong> · {node.is_live_data ? '🛰️ Live Synced' : 'Simulation'}
                    </div>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '2px 8px', borderRadius: 6,
                      background: node.risk_level === 2 ? '#FEF2F2' : node.risk_level === 1 ? '#FFFBEB' : '#F0FDF4',
                      color,
                      fontSize: '0.75rem', fontWeight: 800, marginBottom: 8,
                    }}>
                      {node.risk_label}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 10px', fontSize: '0.8rem', color: '#334155' }}>
                      <span>🌡️ {node.temperature} °C</span>
                      <span>💨 {node.co_ppm} ppm CO</span>
                      <span>💧 {node.humidity}% RH</span>
                      <span>🔋 {node.battery_level}%</span>
                    </div>
                    <div style={{ marginTop: 6, fontSize: '0.72rem', color: '#94A3B8' }}>
                      📍 {node.latitude?.toFixed(4)}° N, {node.longitude?.toFixed(4)}° E
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* NASA FIRMS & EONET Satellite Active Fire Hotspots */}
          {showSatellites && firmsFires.map((fire, i) => (
            <CircleMarker
              key={`sat-fire-${i}`}
              center={[fire.latitude, fire.longitude]}
              radius={10}
              pathOptions={{
                color: '#EA580C',
                fillColor: '#F97316',
                fillOpacity: 0.9,
                weight: 2.5,
                dashArray: '3,3'
              }}
            >
              <Popup>
                <div style={{ fontSize: '0.82rem', fontFamily: 'Inter, sans-serif', minWidth: 200 }}>
                  <div style={{ fontWeight: 800, color: '#C2410C', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Flame size={15} color="#EA580C" /> {fire.title || 'NASA Satellite Active Fire'}
                  </div>
                  <div style={{ color: '#334155', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div>🛰️ Sensor: <strong>{fire.satellite || fire.instrument}</strong></div>
                    <div>🔥 Brightness: <strong>{fire.brightness_kelvin} K</strong></div>
                    <div>⚡ Fire Radiative Power: <strong style={{ color: '#EA580C' }}>{fire.frp_mw} MW</strong></div>
                    <div>📅 Scan Date: <strong>{fire.scan_date} ({fire.scan_time || 'NRT'})</strong></div>
                    <div>🎯 Confidence: <strong style={{ color: '#15803D' }}>{fire.confidence || 'HIGH'}</strong></div>
                    {fire.source && <div>🏢 Source: <strong>{fire.source}</strong></div>}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Click deployment preview marker */}
          {clickCoords && (
            <CircleMarker
              center={[clickCoords.lat, clickCoords.lng]}
              radius={10}
              pathOptions={{ color: '#16A34A', fillColor: '#16A34A', fillOpacity: 0.5, dashArray: '4,4', weight: 2 }}
            />
          )}
        </MapContainer>

        {/* ── LIVE WIND VECTOR OVERLAY WIDGET (Top Right inside map) ── */}
        <div style={{
          position: 'absolute', top: 12, right: 12, zIndex: 1000,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          border: '1px solid #E2E6ED',
          borderRadius: 10,
          padding: '8px 12px',
          fontSize: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: '#EFF6FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: `rotate(${windDeg}deg)`,
            transition: 'transform 0.5s ease'
          }}>
            <Navigation size={13} color="#2563EB" />
          </div>
          <div>
            <div style={{ fontWeight: 800, color: '#0F172A' }}>{windSpeed} km/h</div>
            <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Wind Vector ({windDeg}°)</div>
          </div>
        </div>

        {/* ── MAP LEGEND (Bottom Left inside map) ── */}
        <div style={{
          position: 'absolute', bottom: 12, left: 12, zIndex: 1000,
          background: 'rgba(255,255,255,0.94)',
          backdropFilter: 'blur(8px)',
          border: '1px solid #E2E6ED',
          borderRadius: 10,
          padding: '8px 12px',
          fontSize: '0.72rem',
          fontWeight: 600,
          display: 'flex', flexDirection: 'column', gap: 4,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}>
          {[
            { color: '#DC2626', label: 'Critical Wildfire Alarm Node' },
            { color: '#D97706', label: 'Elevated Risk Outpost' },
            { color: '#16A34A', label: 'Normal Forest Sensor' },
            { color: '#2563EB', label: 'Physical USB Sensor Node' },
            { color: '#F97316', label: 'NASA Thermal Radiometry Hotspot' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ color: '#3D4F63' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
