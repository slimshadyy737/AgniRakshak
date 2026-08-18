import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, Radio, ExternalLink, ChevronRight, ChevronLeft, Globe, MapPin, Sparkles } from 'lucide-react';

export default function LiveNewsTicker({ systemStatus }) {
  const [news, setNews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState('LOCAL'); // 'LOCAL' or 'GLOBAL'
  const [loading, setLoading] = useState(false);

  const activeRegionId = systemStatus?.active_region?.id || 'JAIPUR';
  const activeRegionName = systemStatus?.active_region?.name || 'Manipal Univ Jaipur (MUJ) & Dehmi';
  const regionShortName = activeRegionName.split(',')[0].replace('Manipal Univ Jaipur (MUJ) & Dehmi', 'MUJ Dehmi');

  useEffect(() => {
    fetchNews();
  }, [mode, activeRegionId]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/live/disaster-news?mode=${mode}&region=${activeRegionId}`);
      if (res.data.news && res.data.news.length > 0) {
        setNews(res.data.news);
        setCurrentIndex(0);
      }
    } catch (e) {
      console.error('Error fetching live disaster news:', e);
    } finally {
      setLoading(false);
    }
  };

  // Auto rotate ticker every 6.5s
  useEffect(() => {
    if (news.length <= 1) return;
    const rotate = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % news.length);
    }, 6500);
    return () => clearInterval(rotate);
  }, [news.length]);

  if (news.length === 0) return null;

  const currentItem = news[currentIndex] || news[0];
  const isCritical = currentItem.severity === 'CRITICAL';
  const isWarning = currentItem.severity === 'WARNING';

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + news.length) % news.length);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % news.length);
  };

  return (
    <div style={{
      background: isCritical
        ? 'linear-gradient(90deg, #FEF2F2 0%, #FFFFFF 65%, #FEF2F2 100%)'
        : 'linear-gradient(90deg, #FFFBEB 0%, #FFFFFF 65%, #F0F9FF 100%)',
      border: isCritical ? '1.5px solid #FECACA' : '1px solid #E2E8F0',
      borderRadius: 10,
      padding: '7px 14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
      overflow: 'hidden'
    }}>
      {/* ── LEFT: MODE SWITCHER & SEVERITY PILL ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Toggle Mode: LOCAL vs GLOBAL */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: '#F1F5F9',
          borderRadius: 6,
          padding: '2px',
          border: '1px solid #CBD5E1'
        }}>
          <button
            onClick={() => setMode('LOCAL')}
            style={{
              background: mode === 'LOCAL' ? '#0284C7' : 'transparent',
              color: mode === 'LOCAL' ? '#FFFFFF' : '#64748B',
              border: 'none',
              borderRadius: 4,
              padding: '2px 7px',
              fontSize: '0.68rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              transition: 'all 0.15s ease'
            }}
            title={`Local Sector Alerts: ${activeRegionName}`}
          >
            <MapPin size={10} />
            <span>Local</span>
          </button>

          <button
            onClick={() => setMode('GLOBAL')}
            style={{
              background: mode === 'GLOBAL' ? '#EA580C' : 'transparent',
              color: mode === 'GLOBAL' ? '#FFFFFF' : '#64748B',
              border: 'none',
              borderRadius: 4,
              padding: '2px 7px',
              fontSize: '0.68rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              transition: 'all 0.15s ease'
            }}
            title="Global Satellite & NASA Active Wildfire Dispatches"
          >
            <Globe size={10} />
            <span>Global</span>
          </button>
        </div>

        {/* Severity Indicator */}
        <span style={{
          background: isCritical ? '#DC2626' : (isWarning ? '#D97706' : '#0284C7'),
          color: '#FFFFFF',
          fontSize: '0.66rem',
          fontWeight: 800,
          padding: '2px 7px',
          borderRadius: 4,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          flexShrink: 0
        }}>
          <Radio size={10} className="animate-pulse" />
          {isCritical ? 'CRITICAL' : (isWarning ? 'WARNING' : 'BULLETIN')}
        </span>
      </div>

      {/* ── CENTER: SCROLLING HEADLINE & SUMMARY ── */}
      <div style={{
        fontSize: '0.82rem',
        color: '#0F172A',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        flex: 1,
        minWidth: 0
      }}>
        <strong style={{ color: isCritical ? '#991B1B' : (isWarning ? '#92400E' : '#0369A1'), marginRight: 6 }}>
          {currentItem.headline}
        </strong>
        <span style={{ color: '#475569' }}>
          {currentItem.summary}
        </span>
      </div>

      {/* ── RIGHT: TIME, PAGINATION ARROWS & LINK ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontFamily: 'monospace' }}>
          {currentItem.timestamp}
        </span>

        {/* Pagination buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button
            onClick={handlePrev}
            style={{
              background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 4,
              width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#64748B'
            }}
            title="Previous Bulletin"
          >
            <ChevronLeft size={13} />
          </button>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', padding: '0 4px' }}>
            {currentIndex + 1}/{news.length}
          </span>
          <button
            onClick={handleNext}
            style={{
              background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 4,
              width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#64748B'
            }}
            title="Next Bulletin"
          >
            <ChevronRight size={13} />
          </button>
        </div>

        {currentItem.link && (
          <a
            href={currentItem.link}
            target="_blank"
            rel="noreferrer"
            style={{
              color: '#0284C7',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              fontSize: '0.72rem',
              fontWeight: 700,
              textDecoration: 'none'
            }}
            title="View Official Source Dispatch"
          >
            <span>Source</span>
            <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  );
}
