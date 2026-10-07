import React, { useState } from 'react';
import { FaLock, FaEye, FaEyeSlash, FaUnlockAlt } from 'react-icons/fa';

const SafeKeyGuard = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

  const submit = () => {
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError('Incorrect safe key. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', padding: '56px 16px', background: 'var(--background)',
        minHeight: '70vh', fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{
          width: '100%', maxWidth: 400, height: 'fit-content', textAlign: 'center',
          background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14,
          boxShadow: '0 2px 10px var(--shadow-color)', padding: '30px 26px',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', margin: '0 auto 14px', background: '#fde8e6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FaLock size={22} color="#c94a3a" />
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 4 }}>Restricted area</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 18 }}>
            This page shows sensitive user data. Enter the safe key to continue.
          </div>

          <div style={{ position: 'relative', marginBottom: 12 }}>
            <input
              type={show ? 'text' : 'password'}
              placeholder="Safe key"
              value={password}
              autoFocus
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
              style={{
                width: '100%', height: 42, boxSizing: 'border-box', padding: '0 42px 0 14px', fontSize: 14,
                border: `1px solid ${error ? '#c94a3a' : 'var(--border)'}`, borderRadius: 10,
                background: 'var(--input)', color: 'var(--foreground)', outline: 'none',
              }}
            />
            <button
              type="button"
              aria-label={show ? 'Hide key' : 'Show key'}
              onClick={() => setShow((v) => !v)}
              style={{
                position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', width: 30, height: 30,
                border: 'none', background: 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {show ? <FaEyeSlash size={14} color="#8b7b74" /> : <FaEye size={14} color="#8b7b74" />}
            </button>
          </div>

          {error && (
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#c94a3a', marginBottom: 12, textAlign: 'left' }}>{error}</div>
          )}

          <button
            type="button"
            onClick={submit}
            style={{
              width: '100%', height: 42, border: 'none', borderRadius: 10, cursor: 'pointer',
              background: 'var(--primary)', color: 'var(--primary-foreground, #fff)', fontSize: 14, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <FaUnlockAlt size={13} /> Unlock
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default SafeKeyGuard;
