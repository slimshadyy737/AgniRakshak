import React from 'react';
import axios from 'axios';
import { Flame, ShieldAlert, Sun, Moon, Sparkles, Volume2, VolumeX, Printer } from 'lucide-react';

export default function Header({ systemStatus, theme, onToggleTheme, onOpenAIReport, isMuted, onToggleMute }) {
  const getBadgeStyle = (level) => {
    if (level === 2) return { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: '#EF4444', label: 'HIGH RISK CRITICAL' };
    if (level === 1) return { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: '#F59E0B', label: 'ELEVATED WARNING' };
    return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: '#10B981', label: 'SYSTEM NORMAL' };
  };

  const badge = getBadgeStyle(systemStatus?.system_risk_level || 0);

  const handleExportDispatchHTML = () => {
    const baseUrl = axios.defaults.baseURL || '';
    window.open(`${baseUrl}/api/incidents/export-html`, '_blank');
  };

  const isDark = theme === 'dark';

  return (
    <header className="glass-card" style={{
      marginBottom: '22px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 26px',
      borderRadius: '20px',
      background: 'var(--bg-card)',
      border: '1px solid var(--bg-card-border)',
      boxShadow: 'var(--shadow-card)'
    }}>
      {/* Brand & Animated Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            position: 'absolute',
            width: '50px',
            height: '50px',
            borderRadius: '16px',
            border: '2px solid rgba(249, 115, 22, 0.4)',
            animation: 'radarPulse 2.2s infinite ease-out'
          }} />

          <img
            src="/AgniRakshak.png"
            alt="AgniRakshak Logo"
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              boxShadow: '0 4px 18px rgba(249, 115, 22, 0.35)',
              position: 'relative',
              zIndex: 2,
              objectFit: 'cover',
              background: '#0B1120'
            }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '1.8rem',
              fontWeight: '800',
              color: isDark ? '#F97316' : '#EA580C',
              margin: 0,
              letterSpacing: '-0.4px'
            }}>
              AgniRakshak
            </h1>
            <span style={{
              background: 'rgba(249, 115, 22, 0.15)',
              color: '#F97316',
              fontSize: '0.72rem',
              fontWeight: '800',
              padding: '3px 9px',
              borderRadius: '20px',
              border: '1px solid rgba(249, 115, 22, 0.3)'
            }}>
              v4.0 Edge AI
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '2px', fontWeight: '500' }}>
            Distributed Edge-AI & NASA FIRMS Satellite Wildfire Response Network
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Printable Dispatch Sheet Export Button */}
        <button
          onClick={handleExportDispatchHTML}
          style={{
            background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
            color: '#FFFFFF',
            border: 'none',
            padding: '9px 18px',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)'
          }}
          title="Open & Print Printable Emergency Incident Dispatch Sheet"
        >
          <Printer size={16} />
          Print / PDF Dispatch Sheet
        </button>

        {/* Gemma AI Report Trigger Button */}
        <button
          onClick={onOpenAIReport}
          style={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
            color: '#FFFFFF',
            border: 'none',
            padding: '9px 18px',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)'
          }}
        >
          <Sparkles size={16} />
          Gemma AI Crisis Report
        </button>

        {/* System Risk Status Badge */}
        <div style={{
          background: badge.bg,
          color: badge.text,
          border: `1.5px solid ${badge.border}`,
          padding: '8px 16px',
          borderRadius: '12px',
          fontWeight: '800',
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          letterSpacing: '0.4px'
        }}>
          <ShieldAlert size={16} />
          {badge.label}
        </div>

        {/* Audio Siren Mute Toggle */}
        <button
          onClick={onToggleMute}
          style={{
            background: isMuted ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-input)',
            border: `1px solid ${isMuted ? '#EF4444' : 'var(--bg-card-border)'}`,
            color: isMuted ? '#EF4444' : 'var(--text-main)',
            padding: '9px',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={isMuted ? 'Unmute Emergency Siren Audio' : 'Mute Emergency Siren Audio'}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {/* Theme Switcher Toggle */}
        <button
          onClick={onToggleTheme}
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--bg-card-border)',
            color: 'var(--text-main)',
            padding: '9px',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Toggle Light/Dark Theme"
        >
          {isDark ? <Sun size={18} color="#F59E0B" /> : <Moon size={18} color="#6366F1" />}
        </button>
      </div>
    </header>
  );
}
