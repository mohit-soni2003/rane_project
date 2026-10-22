import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiMail, FiArrowLeft, FiArrowRight, FiCheck, FiShield, FiAlertCircle, FiClock,
} from "react-icons/fi";
import { backend_url } from "../../store/keyStore";
import { AUTH_STYLES, useInterFont } from "./authShared";

const FEATURES = [
  { icon: <FiMail />, text: "Secure email-based reset" },
  { icon: <FiClock />, text: "Link expires for your safety" },
  { icon: <FiShield />, text: "No password ever shared" },
];

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useInterFont();

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
          <h1>Locked out? <span>We&apos;ve got you.</span></h1>
          <p>Reset your password in a minute and get back to managing your projects, documents and payments.</p>
        </div>

        <ul className="su-feats">
          {FEATURES.map((f) => (
            <li key={f.text}><span className="ico">{f.icon}</span>{f.text}</li>
          ))}
        </ul>
      </aside>

      {/* ── Form panel ── */}
      <main className="su-side">
        <Link to="/signin" className="su-back"><FiArrowLeft /> Back to sign in</Link>

        <div className="su-card">
          {message ? (
            <div className="su-success" role="status">
              <div className="su-success-ico"><FiMail /></div>
              <h2>Check your email</h2>
              <p className="su-sub">
                We&apos;ve sent a password reset link to <b>{email}</b>. Open it to choose a new password.
              </p>
              <div className="su-tip">
                Can&apos;t see it? Check your spam or junk folder. The link expires after a short time,
                so use it soon.
              </div>
              <Link to="/signin" className="su-submit">Back to Sign In <FiArrowRight /></Link>
              <button type="button" className="su-link-btn" onClick={() => setMessage(null)}>
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <span className="su-eyebrow">Forgot Password</span>
              <h2>Reset your password</h2>
              <p className="su-sub">Enter your account email and we&apos;ll send you a secure link to set a new password.</p>

              <form className="su-form" onSubmit={handleReset}>
                <div className="su-field">
                  <label htmlFor="fp-email">Email</label>
                  <div className="su-input">
                    <FiMail />
                    <input
                      id="fp-email" type="email" name="email" placeholder="you@company.com"
                      value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
                    />
                  </div>
                </div>

                {error && (
                  <div className="su-error" role="alert">
                    <FiAlertCircle />
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" className="su-submit" disabled={loading}>
                  {loading
                    ? <><span className="su-spin" /> Sending…</>
                    : <>Send Reset Link <FiArrowRight /></>}
                </button>
              </form>

              <p className="su-alt">Remembered it?<Link to="/signin">Sign in</Link></p>

              <div className="su-trust"><FiCheck /> Your data is encrypted and secure</div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
