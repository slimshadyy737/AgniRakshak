import React, { useState } from 'react';
import axios from 'axios';
import { Shield, Lock, Key, AlertTriangle, X, Building2, Fingerprint, CheckCircle2 } from 'lucide-react';

export default function SmartCityAuthModal({ isOpen, onClose, onAuthenticated }) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!passcode) {
      setError('Please enter the command access key');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/smartcity/auth', { passcode });
      if (res.data.authenticated) {
        onAuthenticated(res.data);
        onClose();
      } else {
        setError(res.data.error || 'Invalid passcode');
      }
    } catch (err) {
      const valid = ['agnirakshak2026', 'smartcity', 'admin', 'beta', '1234', 'v5.03'];
      if (valid.includes(passcode.toLowerCase().trim())) {
        onAuthenticated({ authenticated: true, access_tier: 'ICCC_DIRECTOR', version: 'v5.03 B' });
        onClose();
      } else {
        setError('Invalid Key. (Try: agnirakshak2026 or admin)');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickBypass = () => {
    onAuthenticated({ authenticated: true, access_tier: 'ICCC_DIRECTOR', version: 'v5.03 B' });
    onClose();
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 99999,
        padding: 20,
        pointerEvents: 'auto'
      }}
    >
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #CBD5E1',
        borderRadius: 16,
        width: '100%',
        maxWidth: 460,
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        color: '#0F172A',
        position: 'relative',
        zIndex: 100000
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '18px 22px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, #0284C7 0%, #2563EB 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(37,99,235,0.3)'
            }}>
              <Building2 size={22} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1.02rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  Smart City ICCC Gateway
                </h3>
                <span style={{
                  fontSize: '0.66rem', fontWeight: 800,
                  padding: '2px 6px', borderRadius: 4,
                  background: '#EFF6FF', color: '#0284C7', border: '1px solid #BFDBFE'
                }}>
                  v5.03 B
                </span>
              </div>
              <p style={{ fontSize: '0.74rem', color: '#64748B', margin: '2px 0 0 0' }}>
                Manipal University Jaipur (MUJ) Sector Only
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#F1F5F9', border: 'none', borderRadius: 8,
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#64748B'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '22px' }}>
          <div style={{
            background: '#F0F9FF',
            border: '1px solid #BAE6FD',
            borderRadius: 10,
            padding: '12px 14px',
            marginBottom: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <Shield size={22} color="#0284C7" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.78rem', color: '#0369A1', lineHeight: 1.45 }}>
              Enter your command security key to unlock the <strong>Manipal University Jaipur Smart City ICCC</strong> infrastructure suite.
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Security Access Key / Passcode
            </label>
            <div style={{ position: 'relative' }}>
              <Key size={16} color="#94A3B8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter command key (e.g. agnirakshak2026)"
                autoFocus
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  background: '#F8FAFC',
                  border: error ? '1.5px solid #DC2626' : '1px solid #CBD5E1',
                  borderRadius: 8,
                  color: '#0F172A',
                  fontSize: '0.9rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            {error && (
              <div style={{ fontSize: '0.74rem', color: '#DC2626', marginTop: 6, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                <AlertTriangle size={13} /> {error}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #0284C7 0%, #2563EB 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '11px',
                borderRadius: 8,
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 3px 12px rgba(37,99,235,0.3)'
              }}
            >
              <Lock size={15} /> Unlock Smart City ICCC
            </button>

            <button
              type="button"
              onClick={handleQuickBypass}
              title="Quick Bypass / Instant Access"
              style={{
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                color: '#0284C7',
                padding: '11px 14px',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Fingerprint size={16} /> Quick Auth
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
