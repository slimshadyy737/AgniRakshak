import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Satellite, PlusCircle, Layers } from 'lucide-react';
import axios from 'axios';

// Fly-to helper — fires whenever center changes
function ChangeView({ center, zoom }) {
  const map = useMap();
  const prevCenter = useRef(null);

  useEffect(() => {
    if (!center || !center[0] || !center[1]) return;
    const key = `${center[0].toFixed(3)}_${center[1].toFixed(3)}`;
    if (prevCenter.current !== key) {
      prevCenter.current = key;
      map.flyTo(center, zoom, { duration: 1.4, animate: true });
    }
  }, [center[0], center[1]]);

  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) });
  return null;
}

export default function LeafletMap({ nodes, selectedNodeId, onSelectNode, onDeployNode }) {
  const [showSatellites, setShowSatellites] = useState(true);
  const [firmsFires, setFirmsFires] = useState([]);
  const [clickCoords, setClickCoords] = useState(null);
  const lastFetchedRegionKey = useRef('');

  // Derive center from nodes
  const centerLat = nodes?.length > 0 ? nodes[0].latitude  : 26.8430;
  const centerLon = nodes?.length > 0 ? nodes[0].longitude : 75.5655;
  const center = [centerLat, centerLon];

  // Unique key forces MapContainer remount when region changes (fixes tile not reloading)
  const mapKey = `${centerLat.toFixed(3)}_${centerLon.toFixed(3)}`;

  // Fetch NASA FIRMS only when region changes
  useEffect(() => {
    if (lastFetchedRegionKey.current === mapKey) return;
    lastFetchedRegionKey.current = mapKey;
    axios.get(`/api/firms/active-fires?lat=${centerLat}&lon=${centerLon}`)
      .then(res => setFirmsFires(res.data.active_fires || []))
      .catch(() => setFirmsFires([]));
  }, [mapKey]);

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

  // Mesh lines
  const meshLines = (nodes?.length > 1)
    ? nodes.map((n, i) => [[n.latitude, n.longitude], [nodes[(i + 1) % nodes.length].latitude, nodes[(i + 1) % nodes.length].longitude]])
    : [];

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
      {/* Header bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 18px',
        borderBottom: '1px solid #F0F2F5',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 7,
            background: '#FFF7ED',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MapPin size={15} color="#EA580C" />
          </div>
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F1923', margin: 0 }}>
              Geospatial Mesh Network
            </h3>
            <p style={{ fontSize: '0.7rem', color: '#7A8FA6', margin: 0 }}>
              Click map to deploy new IoT node
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {clickCoords && (
            <button
              onClick={handleConfirmDeploy}
              className="btn btn-primary"
              style={{ padding: '6px 12px', fontSize: '0.78rem', gap: 5 }}
            >
              <PlusCircle size={13} />
              Deploy [{clickCoords.lat.toFixed(3)}, {clickCoords.lng.toFixed(3)}]
            </button>
          )}
          <button
            onClick={() => setShowSatellites(v => !v)}
            className="btn btn-secondary"
            style={{
              padding: '6px 12px', fontSize: '0.78rem', gap: 5,
              color: showSatellites ? '#EA580C' : undefined,
              borderColor: showSatellites ? '#FFEDD5' : undefined,
              background: showSatellites ? '#FFF7ED' : undefined,
            }}
          >
            <Satellite size={13} />
            {showSatellites ? 'FIRMS: ON' : 'FIRMS: OFF'}
          </button>
        </div>
      </div>

      {/* Map — key forces remount on region switch */}
      <div style={{ height: 400, position: 'relative' }}>
        <MapContainer
          key={mapKey}
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <ChangeView center={center} zoom={13} />
          <MapClickHandler onMapClick={handleMapClick} />

          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
            subdomains={['a', 'b', 'c', 'd']}
            maxZoom={19}
          />

          {/* Mesh lines */}
          {meshLines.map((line, i) => (
            <Polyline
              key={`mesh-${i}`}
              positions={line}
              pathOptions={{ color: '#3B82F6', weight: 1.5, opacity: 0.5, dashArray: '6,5' }}
            />
          ))}

          {/* IoT Sensor Nodes */}
          {nodes?.map((node) => {
            const isSelected = node.node_id === selectedNodeId;
            const color = getColor(node.risk_level);
            return (
              <CircleMarker
                key={node.node_id}
                center={[node.latitude, node.longitude]}
                radius={isSelected ? 15 : 9}
                pathOptions={{
                  color: '#FFFFFF',
                  fillColor: color,
                  fillOpacity: isSelected ? 1 : 0.85,
                  weight: isSelected ? 3 : 2,
                }}
                eventHandlers={{ click: () => onSelectNode(node.node_id) }}
              >
                <Popup>
                  <div style={{ fontSize: '0.85rem', fontFamily: 'Inter, sans-serif', minWidth: 180 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F1923', marginBottom: 6 }}>
                      {node.node_name}
                      <span style={{ fontSize: '0.72rem', color: '#7A8FA6', fontWeight: 500, marginLeft: 6 }}>
                        {node.node_id}
                      </span>
                    </div>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '2px 8px', borderRadius: 6,
                      background: node.risk_level === 2 ? '#FEF2F2' : node.risk_level === 1 ? '#FFFBEB' : '#F0FDF4',
                      color,
                      fontSize: '0.75rem', fontWeight: 700, marginBottom: 8,
                    }}>
                      {node.risk_label}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: '0.8rem', color: '#3D4F63' }}>
                      <span>🌡️ {node.temperature} °C</span>
                      <span>💨 {node.co_ppm} ppm CO</span>
                      <span>💧 {node.humidity}% RH</span>
                      <span>🔋 {node.battery_level}%</span>
                    </div>
                    <div style={{ marginTop: 6, fontSize: '0.72rem', color: '#7A8FA6' }}>
                      📍 {node.latitude?.toFixed(4)}° N, {node.longitude?.toFixed(4)}° E
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* NASA FIRMS Satellite Fire Detects */}
          {showSatellites && firmsFires.map((fire, i) => (
            <CircleMarker
              key={`fire-${i}`}
              center={[fire.latitude, fire.longitude]}
              radius={7}
              pathOptions={{ color: '#FF5722', fillColor: '#FF5722', fillOpacity: 0.8, weight: 1.5 }}
            >
              <Popup>
                <div style={{ fontSize: '0.82rem', fontFamily: 'Inter, sans-serif' }}>
                  <div style={{ fontWeight: 700, color: '#DC2626', marginBottom: 5 }}>
                    🛰️ NASA FIRMS Detection
                  </div>
                  <div style={{ color: '#3D4F63' }}>
                    <div>Instrument: {fire.instrument} ({fire.satellite})</div>
                    <div>Brightness: {fire.brightness_kelvin} K</div>
                    <div>FRP Power: {fire.frp_mw} MW</div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Click deployment marker */}
          {clickCoords && (
            <CircleMarker
              center={[clickCoords.lat, clickCoords.lng]}
              radius={10}
              pathOptions={{ color: '#16A34A', fillColor: '#16A34A', fillOpacity: 0.5, dashArray: '4,4', weight: 2 }}
            />
          )}
        </MapContainer>

        {/* Map Legend */}
        <div style={{
          position: 'absolute', bottom: 12, left: 12, zIndex: 1000,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          border: '1px solid #E2E6ED',
          borderRadius: 8,
          padding: '7px 11px',
          fontSize: '0.72rem',
          fontWeight: 600,
          display: 'flex', flexDirection: 'column', gap: 4,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          {[
            { color: '#DC2626', label: 'Critical' },
            { color: '#D97706', label: 'Warning' },
            { color: '#16A34A', label: 'Normal' },
            { color: '#FF5722', label: 'FIRMS Satellite' },
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
