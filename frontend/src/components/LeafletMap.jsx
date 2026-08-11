import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Satellite, PlusCircle } from 'lucide-react';
import axios from 'axios';

// Leaflet Recenter Helper
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 14, { duration: 1.2, animate: true });
    }
  }, [center[0], center[1]]);
  return null;
}

// Leaflet Map Click Handler Sub-Component
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export default function LeafletMap({ nodes, selectedNodeId, onSelectNode, onDeployNode, theme }) {
  const [showFirmsSatellites, setShowFirmsSatellites] = useState(true);
  const [firmsFires, setFirmsFires] = useState([]);
  const [clickCoords, setClickCoords] = useState(null);
  const lastFetchedRegionRef = useRef('');

  // Compute map center from first node coordinates or default
  const centerLat = (nodes && nodes.length > 0) ? nodes[0].latitude : 26.8430;
  const centerLon = (nodes && nodes.length > 0) ? nodes[0].longitude : 75.5655;
  const center = [centerLat, centerLon];

  // Fetch FIRMS Satellite Data only when region changes or every 60s (Decoupled from 2s telemetry polling)
  useEffect(() => {
    const regionKey = `${centerLat.toFixed(2)}_${centerLon.toFixed(2)}`;
    if (lastFetchedRegionRef.current !== regionKey) {
      lastFetchedRegionRef.current = regionKey;
      fetchFirmsData(centerLat, centerLon);
    }
  }, [centerLat, centerLon]);

  const fetchFirmsData = async (lat, lon) => {
    try {
      const res = await axios.get(`/api/firms/active-fires?lat=${lat}&lon=${lon}`);
      setFirmsFires(res.data.active_fires || []);
    } catch (err) {
      console.error('Error fetching NASA FIRMS satellite data:', err);
    }
  };

  const handleMapClick = (lat, lng) => {
    setClickCoords({ lat, lng });
  };

  const handleConfirmDeploy = async () => {
    if (!clickCoords) return;
    const name = prompt('Enter Sector Name for new Mesh Node:', `Sector ${nodes.length + 1}`);
    if (name) {
      try {
        await axios.post('/api/nodes/deploy', {
          name: name,
          latitude: clickCoords.lat,
          longitude: clickCoords.lng
        });
        if (onDeployNode) onDeployNode();
        setClickCoords(null);
      } catch (e) {
        console.error('Error deploying node:', e);
      }
    }
  };

  const tileUrl = theme === 'light'
    ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

  const getColor = (riskLevel) => {
    if (riskLevel === 2) return '#EF4444';
    if (riskLevel === 1) return '#F59E0B';
    return '#10B981';
  };

  // Build mesh lines between adjacent nodes
  const meshLines = [];
  if (nodes && nodes.length > 1) {
    for (let i = 0; i < nodes.length; i++) {
      const nextIdx = (i + 1) % nodes.length;
      meshLines.push([
        [nodes[i].latitude, nodes[i].longitude],
        [nodes[nextIdx].latitude, nodes[nextIdx].longitude]
      ]);
    }
  }

  return (
    <div className="glass-card" style={{ height: '440px', padding: '18px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{
          fontSize: '1.05rem',
          fontWeight: '700',
          color: 'var(--text-heading)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <MapPin size={18} color="#F97316" />
          Geospatial Mesh Network Map (Click Map to Deploy IoT Node)
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {clickCoords && (
            <button
              onClick={handleConfirmDeploy}
              style={{
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#FFFFFF',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <PlusCircle size={14} />
              Deploy at [{clickCoords.lat.toFixed(4)}, {clickCoords.lng.toFixed(4)}]
            </button>
          )}

          <button
            onClick={() => setShowFirmsSatellites(!showFirmsSatellites)}
            style={{
              background: showFirmsSatellites ? 'rgba(249, 115, 22, 0.2)' : 'var(--bg-input)',
              border: `1px solid ${showFirmsSatellites ? '#F97316' : 'var(--bg-card-border)'}`,
              color: showFirmsSatellites ? '#F97316' : 'var(--text-muted)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Satellite size={14} />
            {showFirmsSatellites ? 'NASA Satellites: ON' : 'NASA Satellites: OFF'}
          </button>
        </div>
      </div>

      <div style={{ height: '365px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--bg-card-border)', willChange: 'transform' }}>
        <MapContainer center={center} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%', background: 'transparent' }}>
          <ChangeView center={center} />
          
          <TileLayer
            key={theme}
            subdomains={['a', 'b', 'c', 'd']}
            maxZoom={19}
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
            url={tileUrl}
          />

          <MapClickHandler onMapClick={handleMapClick} />

          {/* Mesh Lines */}
          {meshLines.map((line, idx) => (
            <Polyline
              key={`mesh-link-${idx}`}
              positions={line}
              pathOptions={{
                color: theme === 'light' ? '#3B82F6' : '#0EA5E9',
                weight: 1.5,
                opacity: 0.6,
                dashArray: '5,5'
              }}
            />
          ))}

          {/* IoT Nodes */}
          {nodes && nodes.map((node) => {
            const isSelected = node.node_id === selectedNodeId;
            const color = getColor(node.risk_level);

            return (
              <CircleMarker
                key={node.node_id}
                center={[node.latitude, node.longitude]}
                radius={isSelected ? 14 : 9}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.85,
                  weight: isSelected ? 4 : 2
                }}
                eventHandlers={{
                  click: () => onSelectNode(node.node_id)
                }}
              >
                <Popup>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                    <strong style={{ color: 'var(--text-heading)', fontSize: '0.95rem' }}>{node.node_name}</strong> ({node.node_id})<br />
                    <strong>Status:</strong> <span style={{ color: color, fontWeight: 'bold' }}>{node.risk_label}</span><br />
                    <strong>Temp:</strong> {node.temperature} °C<br />
                    <strong>CO:</strong> {node.co_ppm} ppm<br />
                    <strong>Humidity:</strong> {node.humidity} %<br />
                    <strong>Battery:</strong> {node.battery_level}%
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* NASA Satellites */}
          {showFirmsSatellites && firmsFires.map((fire, idx) => (
            <CircleMarker
              key={`sat-${idx}`}
              center={[fire.latitude, fire.longitude]}
              radius={8}
              pathOptions={{
                color: '#FF5722',
                fillColor: '#FF5722',
                fillOpacity: 0.9,
                weight: 2,
                dashArray: '3,3'
              }}
            >
              <Popup>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  <strong style={{ color: '#FF5722', fontSize: '0.95rem' }}>🛰️ NASA FIRMS Satellite Detect</strong><br />
                  <strong>Instrument:</strong> {fire.instrument} ({fire.satellite})<br />
                  <strong>Brightness:</strong> {fire.brightness_kelvin} K<br />
                  <strong>FRP Power:</strong> {fire.frp_mw} MW
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Click Marker */}
          {clickCoords && (
            <CircleMarker
              center={[clickCoords.lat, clickCoords.lng]}
              radius={10}
              pathOptions={{
                color: '#10B981',
                fillColor: '#10B981',
                fillOpacity: 0.6,
                dashArray: '4,4'
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
