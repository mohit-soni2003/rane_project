import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMail, FiArrowLeft, FiArrowRight, FiKey, FiCheckCircle, FiShield } from "react-icons/fi";
import { backend_url } from "../../store/keyStore";

// ── Hardcoded icon colors ─────────────────────────────────────────────────────
const C = {
  primary: '#6b3e2b',
  accent: '#b95a52',
  success: '#225b31',
  destructive: '#c94a3a',
  muted: '#8b7b74',
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`${backend_url}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong!");
      }

      setMessage("Password reset link sent to your email.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = {
    fontSize: 12, fontWeight: 600, color: 'var(--text-strong)',
    display: 'block', marginBottom: 6,
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: 'var(--background)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, boxSizing: 'border-box',
    }}>
      <div style={{
        width: '100%', maxWidth: 940,
        background: 'var(--card)',
        borderRadius: 20, overflow: 'hidden',
        border: '1px solid var(--border)',
        boxShadow: '0 12px 40px var(--shadow-color)',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      }}>

        {/* ── Brand panel ── */}
        <div className="forgot-brand" style={{
          position: 'relative',
          background: `linear-gradient(150deg, ${C.primary} 0%, #7d4a33 55%, ${C.accent} 130%)`,
          padding: '44px 40px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          color: '#fff', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', bottom: -80, left: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

          {/* logo */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.16)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FiKey size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.02em' }}>RS-WMS</div>
              <div style={{ fontSize: 10.5, opacity: 0.8, letterSpacing: '0.06em' }}>WORK MANAGEMENT SYSTEM</div>
            </div>
          </div>

          {/* center lock graphic */}
          <div style={{ position: 'relative', textAlign: 'center', margin: '28px 0' }}>
            <div style={{
              width: 110, height: 110, borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            }}>
              <FiKey size={48} color="#fff" />
            </div>
          </div>

          {/* footer */}
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 21, fontWeight: 800, lineHeight: 1.25, marginBottom: 8 }}>
              Locked out?<br />We've got you.
            </div>
            <p style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.5, margin: '0 0 18px' }}>
              Reset your password securely and get back to managing your tasks in minutes.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Secure email-based reset', 'Link expires for your safety', 'No password ever shared'].map((t) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, opacity: 0.92 }}>
                  <FiCheckCircle size={14} color="#fff" style={{ flexShrink: 0, opacity: 0.85 }} />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Form panel ── */}
        <div style={{ padding: '40px 38px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

          {/* mobile mini-logo */}
          <div className="forgot-mobile-logo" style={{ display: 'none', alignItems: 'center', gap: 9, marginBottom: 18 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiKey size={17} color={C.primary} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-strong)' }}>RS-WMS</span>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-strong)', margin: 0, lineHeight: 1.2 }}>
              Forgot password?
            </h1>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: '7px 0 0', lineHeight: 1.5 }}>
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Success */}
          {message && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--success)', border: '1px solid #b6dfc4', borderRadius: 8,
              padding: '10px 12px', marginBottom: 16, fontSize: 13, color: C.success,
            }}>
              <FiCheckCircle size={15} color={C.success} style={{ flexShrink: 0 }} />
              <span>{message}</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#fde8e6', border: '1px solid #f5b8b2', borderRadius: 8,
              padding: '9px 12px', marginBottom: 16, fontSize: 13, color: C.destructive,
            }}>
              <FiShield size={14} color={C.destructive} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleReset}>
            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Email</label>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                border: `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
                background: 'var(--input)', borderRadius: 10, padding: '11px 14px',
                boxShadow: focused ? '0 0 0 3px rgba(185,90,82,0.12)' : 'none',
                transition: 'border-color .15s, box-shadow .15s',
              }}>
                <FiMail size={16} color={C.accent} style={{ flexShrink: 0 }} />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  required
                  autoComplete="email"
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: 'var(--foreground)' }}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '12px', borderRadius: 10, border: 'none',
                background: 'var(--primary)', color: '#fff',
                fontSize: 14, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.75 : 1,
                transition: 'opacity .15s',
              }}
            >
              {loading
                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} /> Sending…</>
                : <>Send Reset Link <FiArrowRight size={16} color="#fff" /></>}
            </button>

            {/* Back to sign in */}
            <Link
              to="/signin"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                marginTop: 18, fontSize: 13, fontWeight: 600, color: C.accent, textDecoration: 'none',
              }}
            >
              <FiArrowLeft size={14} color={C.accent} /> Back to Sign In
            </Link>

            {/* Trust line */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 22, fontSize: 11.5, color: 'var(--text-muted)' }}>
              <FiShield size={13} color={C.muted} />
              Reset links are encrypted and time-limited
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: var(--text-muted); opacity: 0.7; }
        @media (max-width: 680px) {
          .forgot-brand { display: none !important; }
          .forgot-mobile-logo { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;