import React, { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { FiMail, FiArrowRight, FiShield, FiCheckCircle } from "react-icons/fi";

// ── Hardcoded icon colors ─────────────────────────────────────────────────────
const C = {
  primary: '#6b3e2b',
  accent: '#b95a52',
  success: '#225b31',
  destructive: '#c94a3a',
  muted: '#8b7b74',
};

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [activeIdx, setActiveIdx] = useState(null);
  const { verifyEmail, error, isLoading, user } = useAuthStore();

  const handleChange = (value, index) => {
    if (isNaN(value)) return; // numbers only
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleBackspace = (value, index) => {
    if (!value && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(otp.join(""));
      const isEmailVerified = await verifyEmail(otp.join(""));
      console.log(isEmailVerified);

      if (isEmailVerified) {
        navigate("/signin");
      } else {
        console.log("Email Not verified");
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
    }
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
        <div className="verify-brand" style={{
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
              <FiMail size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.02em' }}>RS-WMS</div>
              <div style={{ fontSize: 10.5, opacity: 0.8, letterSpacing: '0.06em' }}>WORK MANAGEMENT SYSTEM</div>
            </div>
          </div>

          {/* center graphic */}
          <div style={{ position: 'relative', textAlign: 'center', margin: '28px 0' }}>
            <div style={{
              width: 110, height: 110, borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            }}>
              <FiMail size={48} color="#fff" />
            </div>
          </div>

          {/* footer */}
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 21, fontWeight: 800, lineHeight: 1.25, marginBottom: 8 }}>
              One last step<br />to get started.
            </div>
            <p style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.5, margin: '0 0 18px' }}>
              We've sent a 6-digit verification code to your email. Enter it to confirm your account.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Confirms your email is yours', 'Keeps your account secure', 'Takes less than a minute'].map((t) => (
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
          <div className="verify-mobile-logo" style={{ display: 'none', alignItems: 'center', gap: 9, marginBottom: 18 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiMail size={17} color={C.primary} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-strong)' }}>RS-WMS</span>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-strong)', margin: 0, lineHeight: 1.2 }}>
              Verify your email
            </h1>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: '7px 0 0', lineHeight: 1.5 }}>
              Enter the 6-digit code sent to{user?.email ? ' ' : ' your email address.'}
              {user?.email && <strong style={{ color: 'var(--text-strong)' }}>{user.email}</strong>}
            </p>
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

          <form onSubmit={handleSubmit}>
            {/* OTP inputs */}
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-strong)', display: 'block', marginBottom: 10 }}>
              Verification code
            </label>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginBottom: 22 }}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onFocus={() => setActiveIdx(index)}
                  onBlur={() => setActiveIdx(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace") handleBackspace(e.target.value, index);
                  }}
                  style={{
                    flex: 1, minWidth: 0, height: 54,
                    textAlign: 'center', fontSize: 22, fontWeight: 700,
                    color: 'var(--text-strong)',
                    border: `1.5px solid ${activeIdx === index ? 'var(--accent)' : digit ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 10, background: 'var(--input)', outline: 'none',
                    boxShadow: activeIdx === index ? '0 0 0 3px rgba(185,90,82,0.12)' : 'none',
                    transition: 'border-color .15s, box-shadow .15s',
                  }}
                />
              ))}
            </div>

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
                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} /> Verifying…</>
                : <>Verify Email <FiArrowRight size={16} color="#fff" /></>}
            </button>

            {/* Helper */}
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12.5, color: 'var(--text-muted)' }}>
              Didn't receive the code? Check your spam folder.
            </div>

            {/* Trust line */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 20, fontSize: 11.5, color: 'var(--text-muted)' }}>
              <FiShield size={13} color={C.muted} />
              Your verification is encrypted and secure
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 680px) {
          .verify-brand { display: none !important; }
          .verify-mobile-logo { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default VerifyEmail;