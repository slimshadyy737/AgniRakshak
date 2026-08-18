import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, Radio, ExternalLink, ChevronRight, Bell } from 'lucide-react';

export default function LiveNewsTicker() {
  const [news, setNews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get('/api/live/disaster-news');
        if (res.data.news && res.data.news.length > 0) {
          setNews(res.data.news);
        }
      } catch (e) {
        console.error('Error fetching live disaster news:', e);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 60000); // 1 minute refresh
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (news.length <= 1) return;
    const rotate = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % news.length);
    }, 6000);
    return () => clearInterval(rotate);
  }, [news.length]);

  if (news.length === 0) return null;

  const currentItem = news[currentIndex] || news[0];
  const isCritical = currentItem.severity === 'CRITICAL';

  return (
    <div style={{
      background: isCritical ? 'linear-gradient(90deg, #FEF2F2 0%, #FFFFFF 100%)' : 'linear-gradient(90deg, #FFFBEB 0%, #FFFFFF 100%)',
      border: isCritical ? '1px solid #FECACA' : '1px solid #FDE68A',
      borderRadius: 12,
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      boxShadow: '0 2px 6px rgba(15,23,42,0.03)',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        <span style={{
          background: isCritical ? '#DC2626' : '#D97706',
          color: '#FFFFFF',
          fontSize: '0.7rem',
          fontWeight: 800,
          padding: '2px 8px',
          borderRadius: 6,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          flexShrink: 0
        }}>
          <Radio size={10} className="animate-pulse" />
          {isCritical ? 'CRITICAL ALERT' : 'LIVE INTELLIGENCE'}
        </span>

        <div style={{
          fontSize: '0.84rem',
          color: '#0F172A',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flex: 1
        }}>
          <strong style={{ color: isCritical ? '#991B1B' : '#92400E' }}>
            {currentItem.headline}
          </strong> — <span style={{ color: '#475569' }}>{currentItem.summary}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
          {currentItem.timestamp}
        </span>
        {currentItem.link && (
          <a
            href={currentItem.link}
            target="_blank"
            rel="noreferrer"
            style={{
              color: '#EA580C',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              fontSize: '0.74rem',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            Source <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  );
}
