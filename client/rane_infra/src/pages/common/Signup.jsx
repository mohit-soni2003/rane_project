import { useState } from "react";
import { AUTH_STYLES, useInterFont } from "./authShared";
import { useAuthStore } from "../../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import {
  FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiArrowLeft,
  FiCheck, FiShield, FiAlertCircle, FiGrid, FiUsers,
} from "react-icons/fi";

const STRENGTH = [
  { label: "Too short", color: "#ef4444" },
  { label: "Weak", color: "#ef4444" },
  { label: "Fair", color: "#f59e0b" },
  { label: "Good", color: "#84cc16" },
  { label: "Strong", color: "#16a34a" },
];

// UI hint only — does not block submission
const scorePassword = (pw) => {
  if (!pw) return -1;
  if (pw.length < 6) return 0;
  return (
    (pw.length >= 8) +
    /[A-Z]/.test(pw) +
    /[0-9]/.test(pw) +
    /[^A-Za-z0-9]/.test(pw)
  );
};

const FEATURES = [
  { icon: <FiGrid />, text: "Your own dashboard & history" },
  { icon: <FiShield />, text: "Secure role-based access" },
  { icon: <FiUsers />, text: "Collaborate with your team" },
];

const Signup = () => {
  const navigate = useNavigate();
  const { signup, isLoading, error } = useAuthStore();

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  useInterFont();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(formData.email, formData.password, formData.name);
      navigate("/verify-email");
    } catch (error) {
      console.log(error);
    }
  };

  const score = scorePassword(formData.password);

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
          <h1>Join the future of <span>infrastructure.</span></h1>
          <p>Create your RS-WMS account and start managing your railway projects, documents and payments smarter.</p>
        </div>

        <ul className="su-feats">
          {FEATURES.map((f) => (
            <li key={f.text}><span className="ico">{f.icon}</span>{f.text}</li>
          ))}
        </ul>
      </aside>

      {/* ── Form panel ── */}
      <main className="su-side">
        <Link to="/" className="su-back"><FiArrowLeft /> Back to home</Link>

        <div className="su-card">
          <span className="su-eyebrow">Sign Up</span>
          <h2>Create your account</h2>
          <p className="su-sub">Join to access your dashboard, history, and team tools.</p>

          <form className="su-form" onSubmit={handleSubmit}>
            <div className="su-field">
              <label htmlFor="su-name">Full Name</label>
              <div className="su-input">
                <FiUser />
                <input
                  id="su-name" type="text" name="name" placeholder="Enter your full name"
                  value={formData.name} onChange={handleChange} required autoComplete="name"
                />
              </div>
            </div>

            <div className="su-field">
              <label htmlFor="su-email">Email</label>
              <div className="su-input">
                <FiMail />
                <input
                  id="su-email" type="email" name="email" placeholder="you@company.com"
                  value={formData.email} onChange={handleChange} required autoComplete="email"
                />
              </div>
            </div>

            <div className="su-field">
              <label htmlFor="su-password">Password</label>
              <div className="su-input">
                <FiLock />
                <input
                  id="su-password" type={showPass ? "text" : "password"} name="password" placeholder="Create a password"
                  value={formData.password} onChange={handleChange} required autoComplete="new-password"
                />
                <button
                  type="button" className="su-eye"
                  onClick={() => setShowPass((s) => !s)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {score >= 0 && (
                <>
                  <div className="su-meter" aria-hidden="true">
                    {[1, 2, 3, 4].map((n) => (
                      <i key={n} style={{ background: score >= n ? STRENGTH[score].color : undefined }} />
                    ))}
                  </div>
                  <div className="su-meter-label">
                    <span>Use 8+ characters with numbers &amp; symbols</span>
                    <b style={{ color: STRENGTH[score].color }}>{STRENGTH[score].label}</b>
                  </div>
                </>
              )}
            </div>

            {error && (
              <div className="su-error" role="alert">
                <FiAlertCircle />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="su-submit" disabled={isLoading}>
              {isLoading
                ? <><span className="su-spin" /> Creating account…</>
                : <>Create Account <FiArrowRight /></>}
            </button>
          </form>

          <p className="su-alt">Already a member?<Link to="/signin">Sign in</Link></p>

          <div className="su-trust"><FiCheck /> Your data is encrypted and secure</div>
        </div>
      </main>
    </div>
  );
};

export default Signup;
