import React, { useState, useEffect } from 'react';
import { Cpu, Radio, CheckCircle2, Flame, Satellite, ShieldCheck, Zap, Activity, Sparkles } from 'lucide-react';

const BOOT_LOGS = [
  { id: 0, title: 'Edge-AI Core Initialization', sub: 'Loading Scikit-Learn Random Forest (100 estimators)...', icon: Cpu },
  { id: 1, title: 'NASA FIRMS Satellite Link', sub: 'Polling MODIS & VIIRS active fire radiometry feed...', icon: Satellite },
  { id: 2, title: 'LoRa Mesh Network Synchronization', sub: 'Establishing 868MHz encrypted node mesh telemetry...', icon: Radio },
  { id: 3, title: 'Canadian FWI & ROS Analytics Engine', sub: 'Calibrating Vapor Pressure Deficit & Rate of Spread...', icon: Activity },
  { id: 4, title: 'Google Gemma 3n AI Briefing Service', sub: 'Pre-warming offline neural risk generator pipeline...', icon: Sparkles },
];

export default function LoadingOverlay() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(12);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // Step progression timers
    const stepTimers = BOOT_LOGS.map((_, i) =>
      setTimeout(() => {
        setCurrentStep(i + 1);
      }, (i + 1) * 380)
    );

    // Smooth progress bar timer
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        const delta = Math.floor(Math.random() * 8) + 5;
        return Math.min(100, prev + delta);
      });
    }, 120);

    return () => {
      stepTimers.forEach(clearTimeout);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#FFFFFF',
      backgroundImage: `
        radial-gradient(circle at 50% 30%, rgba(249, 115, 22, 0.08) 0%, transparent 55%),
        linear-gradient(to bottom, #FFFFFF 0%, #F8FAFC 100%)
      `,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: 24,
      fontFamily: 'Inter, system-ui, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Background Decorative Mesh Lines */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none',
        backgroundImage: `radial-gradient(#0F1923 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }} />

      {/* Main Container */}
      <div style={{
        width: '100%',
        maxWidth: 480,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        zIndex: 2,
      }}>

        {/* Logo Shield & Orbital Ring Animation */}
        <div style={{ position: 'relative', width: 96, height: 96, marginBottom: 32 }}>
          {/* Outer Sonar Ring */}
          <div style={{
            position: 'absolute', inset: -24,
            borderRadius: '50%',
            border: '1.5px solid rgba(234, 88, 12, 0.25)',
            animation: 'bootSonar 2s cubic-bezier(0, 0.2, 0.8, 1) infinite',
          }} />

          {/* Dual Orbiting Rings */}
          <div style={{
            position: 'absolute', inset: -14,
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: '#EA580C',
            borderRightColor: '#F97316',
            animation: 'bootRotate 1.2s linear infinite',
          }} />
          <div style={{
            position: 'absolute', inset: -6,
            borderRadius: '50%',
            border: '2px solid transparent',
            borderBottomColor: '#FB923C',
            borderLeftColor: '#FDBA74',
            animation: 'bootRotateReverse 1.8s linear infinite',
          }} />

          {/* Logo Card */}
          <div style={{
            width: 96, height: 96,
            borderRadius: 24,
            background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 36px rgba(234, 88, 12, 0.35)',
            overflow: 'hidden',
          }}>
            {!imgError ? (
              <img
                src="/AgniRakshak.png"
                alt="AgniRakshak"
                onError={() => setImgError(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Flame size={44} color="#FFFFFF" />
            )}
          </div>
        </div>

        {/* Title & Badge Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 20,
            background: '#FFF7ED', border: '1px solid #FFEDD5',
            fontSize: '0.72rem', fontWeight: 800, color: '#EA580C',
            letterSpacing: '0.04em', marginBottom: 10,
          }}>
            <ShieldCheck size={13} color="#EA580C" />
            AGNIRAKSHAK v4.0 COMMAND SYSTEM
          </div>

          <h1 style={{
            fontSize: '1.75rem', fontWeight: 900,
            color: '#0F1923', letterSpacing: '-0.03em', margin: 0,
          }}>
            Initializing Wildfire Defense
          </h1>
          <p style={{ fontSize: '0.84rem', color: '#7A8FA6', marginTop: 4, margin: 0 }}>
            Distributed Edge-AI Sensor Mesh & NASA Radiometry Boot Sequence
          </p>
        </div>

        {/* Progress Bar Container */}
        <div style={{ width: '100%', marginBottom: 28 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: '0.78rem', fontWeight: 700, marginBottom: 8,
          }}>
            <span style={{ color: '#3D4F63', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={14} color="#EA580C" /> Boot Sequence Status
            </span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#EA580C', fontSize: '0.85rem' }}>
              {progress}%
            </span>
          </div>

          {/* Outer Track */}
          <div style={{
            width: '100%', height: 10,
            background: '#F1F5F9', border: '1px solid #E2E6ED',
            borderRadius: 99, overflow: 'hidden', padding: 1,
          }}>
            {/* Fill Bar */}
            <div style={{
              width: `${progress}%`, height: '100%',
              borderRadius: 99,
              background: 'linear-gradient(90deg, #EA580C 0%, #F97316 60%, #F59E0B 100%)',
              boxShadow: '0 0 12px rgba(249, 115, 22, 0.4)',
              transition: 'width 0.15s ease-out',
            }} />
          </div>
        </div>

        {/* Interactive Boot Logs Card */}
        <div style={{
          width: '100%',
          background: '#FFFFFF',
          border: '1px solid #E2E6ED',
          borderRadius: 16,
          padding: '18px 20px',
          boxShadow: '0 4px 20px rgba(15, 25, 35, 0.05)',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          {BOOT_LOGS.map((item, idx) => {
            const Icon = item.icon;
            const isDone = currentStep > idx;
            const isActive = currentStep === idx;

            return (
              <div
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  opacity: isDone || isActive ? 1 : 0.4,
                  transition: 'opacity 0.3s ease, transform 0.2s ease',
                  transform: isActive ? 'translateX(4px)' : 'none',
                }}
              >
                {/* Status Indicator Icon */}
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: isDone ? '#F0FDF4' : isActive ? '#FFF7ED' : '#F4F6F9',
                  border: `1px solid ${isDone ? '#BBF7D0' : isActive ? '#FFEDD5' : '#E2E6ED'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: 1,
                  transition: 'all 0.3s ease',
                }}>
                  {isDone ? (
                    <CheckCircle2 size={15} color="#15803D" />
                  ) : (
                    <Icon size={14} color={isActive ? '#EA580C' : '#94A3B8'} />
                  )}
                </div>

                {/* Text Description */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.83rem', fontWeight: 700,
                    color: isDone ? '#15803D' : isActive ? '#0F1923' : '#64748B',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span>{item.title}</span>
                    {isActive && (
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 800,
                        color: '#EA580C', background: '#FFF7ED',
                        padding: '1px 6px', borderRadius: 4,
                        fontFamily: 'JetBrains Mono, monospace',
                      }}>
                        RUNNING
                      </span>
                    )}
                    {isDone && (
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 800,
                        color: '#15803D',
                        fontFamily: 'JetBrains Mono, monospace',
                      }}>
                        READY
                      </span>
                    )}
                  </div>
                  <p style={{
                    fontSize: '0.74rem', color: '#7A8FA6',
                    margin: '2px 0 0 0', lineHeight: 1.3,
                    fontFamily: 'JetBrains Mono, monospace',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {item.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Hardware Spec Tag */}
        <div style={{
          marginTop: 24, fontSize: '0.72rem', color: '#94A3B8',
          display: 'flex', alignItems: 'center', gap: 12, fontWeight: 600,
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          <span>ESP32 LORA MESH</span>
          <span>•</span>
          <span>GEMMA 3N NEURAL</span>
          <span>•</span>
          <span>NASA FIRMS</span>
        </div>

      </div>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes bootRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bootRotateReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes bootSonar {
          0% { transform: scale(0.9); opacity: 0.8; }
          100% { transform: scale(1.45); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
