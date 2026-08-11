import React, { useEffect, useRef } from 'react';

export default function AudioSiren({ activeRiskLevel, isMuted }) {
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);

  useEffect(() => {
    if (activeRiskLevel === 2 && !isMuted) {
      startSiren();
    } else {
      stopSiren();
    }

    return () => stopSiren();
  }, [activeRiskLevel, isMuted]);

  const startSiren = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (!oscRef.current) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        
        // Modulate frequency up and down like an emergency siren
        const now = ctx.currentTime;
        osc.frequency.exponentialRampToValueAtTime(950, now + 0.4);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.8);
        
        gain.gain.setValueAtTime(0.08, ctx.currentTime); // Low non-intrusive volume
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        
        oscRef.current = osc;
      }
    } catch (e) {
      console.warn('Audio Siren context error:', e);
    }
  };

  const stopSiren = () => {
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch (e) {}
      oscRef.current = null;
    }
  };

  return null; // Invisible component
}
