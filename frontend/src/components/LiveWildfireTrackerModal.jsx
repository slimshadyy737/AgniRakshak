import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Flame, X, ExternalLink, Globe, Search, RefreshCw, MapPin, Radio } from 'lucide-react';

export default function LiveWildfireTrackerModal({ isOpen, onClose, onSelectCoordinates }) {
  const [wildfires, setWildfires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('ALL');

  const fetchFires = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/live/wildfires?limit=50');
      setWildfires(res.data.wildfires || []);
    } catch (e) {
      console.error('Error fetching NASA wildfires:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFires();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = wildfires.filter(f => {
    const matchesSearch = (f.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (f.source || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
        maxWidth: 920,
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
          background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: '#EA580C',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
            }}>
              <Flame size={24} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  NASA EONET Live Wildfire Database
                </h2>
                <span style={{
                  background: '#DC2626', color: '#FFFFFF',
                  fontSize: '0.72rem', fontWeight: 800,
                  padding: '2px 8px', borderRadius: 12,
                  display: 'flex', alignItems: 'center', gap: 4
                }}>
                  <Radio size={10} className="animate-pulse" /> LIVE NASA FEED
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '2px 0 0 0' }}>
                Earth Observatory Natural Event Tracker (EONET) & Satellite Radiometry Feed
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={fetchFires}
              disabled={loading}
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
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
        </div>

        {/* Search and Filters */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          gap: 14,
          alignItems: 'center',
          background: '#F8FAFC'
        }}>
          <div style={{
            position: 'relative', flex: 1,
            display: 'flex', alignItems: 'center'
          }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: 12 }} />
            <input
              type="text"
              placeholder="Search active wildfire by incident name, state, or source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: 10,
                border: '1px solid #CBD5E1',
                fontSize: '0.88rem',
                outline: 'none',
                background: '#FFFFFF'
              }}
            />
          </div>
          <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
            Showing <strong>{filtered.length}</strong> active fires
          </span>
        </div>

        {/* Content list */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          {loading && wildfires.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: '#64748B' }}>
              <RefreshCw size={30} className="animate-spin" color="#EA580C" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 600 }}>Syncing with NASA Earth Observatory Satellite API...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
              <Globe size={36} color="#CBD5E1" style={{ margin: '0 auto 10px' }} />
              <p style={{ fontWeight: 600 }}>No active wildfires found matching your filter.</p>
            </div>
          ) : (
            filtered.map((fire, idx) => (
              <div
                key={fire.id || idx}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 14,
                  border: '1px solid #E2E8F0',
                  padding: '16px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 6px rgba(15,23,42,0.03)'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{
                      background: '#FEE2E2', color: '#DC2626',
                      fontSize: '0.72rem', fontWeight: 800,
                      padding: '2px 8px', borderRadius: 6
                    }}>
                      ACTIVE
                    </span>
                    <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#0F172A' }}>
                      {fire.title}
                    </h4>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: '0.8rem', color: '#64748B' }}>
                    <span>📍 <code>{fire.latitude.toFixed(4)}°, {fire.longitude.toFixed(4)}°</code></span>
                    <span>🛰️ Satellite: <strong>{fire.satellite || 'VIIRS / MODIS'}</strong></span>
                    <span>📅 Tracked: {fire.date}</span>
                    <span>🏢 Source: <strong>{fire.source}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {fire.url && (
                    <a
                      href={fire.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary"
                      style={{ padding: '7px 12px', fontSize: '0.78rem', gap: 5, textDecoration: 'none' }}
                    >
                      <ExternalLink size={13} /> Official Source
                    </a>
                  )}
                  {onSelectCoordinates && (
                    <button
                      onClick={() => {
                        onSelectCoordinates(fire.latitude, fire.longitude, fire.title);
                        onClose();
                      }}
                      className="btn btn-primary"
                      style={{ padding: '7px 14px', fontSize: '0.78rem', gap: 5 }}
                    >
                      <MapPin size={13} /> Focus Map Here
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          background: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.78rem',
          color: '#64748B'
        }}>
          <span>Official Public Data: <strong>NASA EONET v3 & InciWeb/IRWIN</strong></span>
          <span>Zero Rate-Limit Caching Active</span>
        </div>
      </div>
    </div>
  );
}
