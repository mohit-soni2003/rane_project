import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import {
  FiMail, FiArrowRight, FiArrowLeft, FiCheck, FiShield, FiAlertCircle, FiClock,
} from "react-icons/fi";
import { AUTH_STYLES, useInterFont } from "./authShared";

const OTP_LENGTH = 6;

const FEATURES = [
  { icon: <FiMail />, text: "Confirms your email is yours" },
  { icon: <FiShield />, text: "Keeps your account secure" },
  { icon: <FiClock />, text: "Takes less than a minute" },
];

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const inputs = useRef([]);
  const { verifyEmail, error, isLoading, user } = useAuthStore();

  useInterFont();

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const focusAt = (i) => inputs.current[Math.max(0, Math.min(OTP_LENGTH - 1, i))]?.focus();

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return; // single digit only
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < OTP_LENGTH - 1) focusAt(index + 1);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) focusAt(index - 1);
    else if (e.key === "ArrowLeft") focusAt(index - 1);
    else if (e.key === "ArrowRight") focusAt(index + 1);
  };

  const handlePaste = (e) => {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!digits) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    digits.split("").forEach((d, i) => { next[i] = d; });
    setOtp(next);
    focusAt(digits.length >= OTP_LENGTH ? OTP_LENGTH - 1 : digits.length);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const isEmailVerified = await verifyEmail(otp.join(""));
      if (isEmailVerified) {
        navigate("/signin");
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
    }
  };

  const complete = otp.every(Boolean);

  return (
    <div className="su">
      <style>{AUTH_STYLES}</style>

      {/* ── Brand panel ── */}
      <aside className="su-brand">
        <img className="su-brand-img" src="/images/train1.jpg" alt="" />

        <Link to="/" className="su-logo" aria-label="Rane & Sons home">
          <img src="/logo.webp" alt="" />
          <div>
            <b>RANE &amp; SONS PVT. LTD.</b>
            <span>Construction &amp; Infrastructure</span>
          </div>
        </Link>

        <div className="su-hero">
          <span className="su-pill"><i />Client Portal</span>
          <h1>One last step <span>to get started.</span></h1>
          <p>We&apos;ve sent a 6-digit verification code to your email. Enter it to confirm your account.</p>
        </div>

        <ul className="su-feats">
          {FEATURES.map((f) => (
            <li key={f.text}><span className="ico">{f.icon}</span>{f.text}</li>
          ))}
        </ul>
      </aside>

      {/* ── Form panel ── */}
      <main className="su-side">
        <Link to="/signup" className="su-back"><FiArrowLeft /> Back to sign up</Link>

        <div className="su-card">
          <span className="su-eyebrow">Verification</span>
          <h2>Verify your email</h2>
          <p className="su-sub">
            {user?.email ? "Enter the 6-digit code we sent to" : "Enter the 6-digit code sent to your email address."}
          </p>
          {user?.email && <div className="su-mail-chip"><FiMail />{user.email}</div>}

          <form className="su-form" onSubmit={handleSubmit}>
            <div className="su-field">
              <label htmlFor="otp-input-0">Verification code</label>
              <div className="su-otp" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-input-${index}`}
                    ref={(el) => { inputs.current[index] = el; }}
                    className={digit ? "filled" : ""}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onFocus={(e) => e.target.select()}
                    aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="su-error" role="alert">
                <FiAlertCircle />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="su-submit" disabled={isLoading || !complete}>
              {isLoading
                ? <><span className="su-spin" /> Verifying…</>
                : <>Verify Email <FiArrowRight /></>}
            </button>
          </form>

          <p className="su-code-hint">Didn&apos;t receive the code? Check your spam folder.</p>

          <div className="su-trust"><FiCheck /> Your verification is encrypted and secure</div>
        </div>
      </main>
    </div>
  );
};

export default VerifyEmail;
