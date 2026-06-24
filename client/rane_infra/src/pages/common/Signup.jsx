import React, { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiUserPlus, FiArrowRight, FiCheckCircle, FiShield } from "react-icons/fi";

// ── Hardcoded icon colors ─────────────────────────────────────────────────────
const C = {
  primary: '#6b3e2b',
  accent: '#b95a52',
  success: '#225b31',
  destructive: '#c94a3a',
  muted: '#8b7b74',
};

const Signup = () => {
  const navigate = useNavigate();
  const { signup, isLoading, error } = useAuthStore();

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(formData.email, formData.password, formData.name);
      await signup(formData.email, formData.password, formData.name);
      navigate("/verify-email");
    } catch (error) {
      console.log(error);
    }
  };

  const fieldWrap = (name) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    border: `1px solid ${focused === name ? 'var(--accent)' : 'var(--border)'}`,
    background: 'var(--input)', borderRadius: 10, padding: '11px 14px',
    boxShadow: focused === name ? '0 0 0 3px rgba(185,90,82,0.12)' : 'none',
    transition: 'border-color .15s, box-shadow .15s',
  });

  const inputStyle = {
    flex: 1, border: 'none', outline: 'none', background: 'transparent',
    fontSize: 14, color: 'var(--foreground)',
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
        <div className="signup-brand" style={{
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
              <FiUserPlus size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.02em' }}>RS-WMS</div>
              <div style={{ fontSize: 10.5, opacity: 0.8, letterSpacing: '0.06em' }}>WORK MANAGEMENT SYSTEM</div>
            </div>
          </div>

          {/* illustration */}
          <div style={{ position: 'relative', textAlign: 'center', margin: '28px 0' }}>
            <img
              src="/images/signup-illustration.png"
              alt="Signup Illustration"
              style={{ maxWidth: '80%', height: 'auto', filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.18))' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>

          {/* footer */}
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 21, fontWeight: 800, lineHeight: 1.25, marginBottom: 8 }}>
              Join the future of<br />infrastructure.
            </div>
            <p style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.5, margin: '0 0 18px' }}>
              Create your RS-WMS account and start managing smarter today.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Your own dashboard & history', 'Secure role-based access', 'Collaborate with your team'].map((t) => (
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
          <div className="signup-mobile-logo" style={{ display: 'none', alignItems: 'center', gap: 9, marginBottom: 18 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiUserPlus size={17} color={C.primary} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-strong)' }}>RS-WMS</span>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-strong)', margin: 0, lineHeight: 1.2 }}>
              Create your account
            </h1>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: '7px 0 0', lineHeight: 1.5 }}>
              Join to access your dashboard, history, and team tools.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Full Name</label>
              <div style={fieldWrap('name')}>
                <FiUser size={16} color={C.accent} style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused('')}
                  required
                  style={inputStyle}
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email</label>
              <div style={fieldWrap('email')}>
                <FiMail size={16} color={C.accent} style={{ flexShrink: 0 }} />
                <input
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                  required
                  style={inputStyle}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Password</label>
              <div style={fieldWrap('password')}>
                <FiLock size={16} color={C.accent} style={{ flexShrink: 0 }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused('')}
                  required
                  style={inputStyle}
                  autoComplete="new-password"
                />
                <span
                  onClick={() => setShowPass((s) => !s)}
                  style={{ fontSize: 12, fontWeight: 600, color: C.primary, cursor: 'pointer', userSelect: 'none', flexShrink: 0 }}
                >
                  {showPass ? 'Hide' : 'Show'}
                </span>
              </div>
            </div>

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

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '12px', borderRadius: 10, border: 'none',
                background: 'var(--primary)', color: '#fff',
                fontSize: 14, fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.75 : 1,
                transition: 'opacity .15s',
              }}
            >
              {isLoading
                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} /> Creating account…</>
                : <>Create Account <FiArrowRight size={16} color="#fff" /></>}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>ALREADY A MEMBER?</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            {/* Sign in */}
            <Link
              to="/signin"
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '11px', borderRadius: 10, border: '1px solid var(--primary)',
                background: 'var(--secondary)', color: C.primary,
                fontSize: 13.5, fontWeight: 700, textDecoration: 'none', boxSizing: 'border-box',
              }}
            >
              Sign in instead
            </Link>

            {/* Trust line */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 22, fontSize: 11.5, color: 'var(--text-muted)' }}>
              <FiShield size={13} color={C.muted} />
              Your data is encrypted and secure
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: var(--text-muted); opacity: 0.7; }
        @media (max-width: 680px) {
          .signup-brand { display: none !important; }
          .signup-mobile-logo { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default Signup;