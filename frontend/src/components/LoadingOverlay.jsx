import React from 'react';
import { Flame, Radio, Zap } from 'lucide-react';

export default function LoadingOverlay() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #0B1120 0%, #0F172A 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      color: '#F8FAFC'
    }}>
      {/* Animated Logo Container */}
      <div style={{ position: 'relative', width: '100px', height: '100px', marginBottom: '24px' }}>
        {/* Pulsing Outer Radar Ring */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: '2px solid rgba(249, 115, 22, 0.4)',
          animation: 'radarPulse 2s infinite ease-out'
        }} />
        
        <div style={{
          position: 'absolute',
          top: '-15px',
          left: '-15px',
          width: '130px',
          height: '130px',
          borderRadius: '50%',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          animation: 'radarPulse 2s infinite ease-out 0.5s'
        }} />

        {/* Center Logo Image */}
        <img
          src="/AgniRakshak.png"
          alt="AgniRakshak Logo"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '24px',
            boxShadow: '0 0 35px rgba(255, 87, 34, 0.6)',
            objectFit: 'cover'
          }}
        />
      </div>

      <h2 style={{
        fontFamily: 'Outfit, sans-serif',
        fontWeight: '800',
        fontSize: '1.8rem',
        background: 'linear-gradient(90deg, #F97316 0%, #FF8A65 50%, #38BDF8 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: '0.5px'
      }}>
        AGNIRAKSHAK AI NETWORK
      </h2>

      <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Radio size={16} color="#10B981" style={{ animation: 'spin 3s linear infinite' }} />
        Synchronizing Edge-AI Telemetry & Mesh Sensors...
      </p>
    </div>
  );
}
