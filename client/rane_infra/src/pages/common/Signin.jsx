import { useState } from "react";
import { AUTH_STYLES, useInterFont } from "./authShared";
import { useAuthStore } from "../../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import {
  FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiArrowLeft,
  FiCheck, FiShield, FiAlertCircle, FiFileText, FiCreditCard,
} from "react-icons/fi";

const FEATURES = [
  { icon: <FiShield />, text: "Secure role-based access" },
  { icon: <FiFileText />, text: "Document forwarding & review" },
  { icon: <FiCreditCard />, text: "Bills, payments & salary in one place" },
];

const Signin = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  useInterFont();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const istrue = await login(formData.email, formData.password);
    if (istrue) {
      navigate("/client", { replace: true });
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
          <h1>Smarter infrastructure. <span>Simplified.</span></h1>
          <p>Manage your railway projects, documents, bills and payments with ease and security — all in one place.</p>
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
          <span className="su-eyebrow">Sign In</span>
          <h2>Welcome back</h2>
          <p className="su-sub">Sign in to continue managing your infrastructure tasks.</p>

          <form className="su-form" onSubmit={handleSubmit}>
            <div className="su-field">
              <label htmlFor="si-email">Email</label>
              <div className="su-input">
                <FiMail />
                <input
                  id="si-email" type="email" name="email" placeholder="you@company.com"
                  value={formData.email} onChange={handleChange} required autoComplete="email"
                />
              </div>
            </div>

            <div className="su-field">
              <div className="su-label-row">
                <label htmlFor="si-password">Password</label>
                <Link to="/reset-password" className="su-forgot">Forgot password?</Link>
              </div>
              <div className="su-input">
                <FiLock />
                <input
                  id="si-password" type={showPass ? "text" : "password"} name="password" placeholder="Enter your password"
                  value={formData.password} onChange={handleChange} required autoComplete="current-password"
                />
                <button
                  type="button" className="su-eye"
                  onClick={() => setShowPass((s) => !s)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {error && (
              <div className="su-error" role="alert">
                <FiAlertCircle />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="su-submit" disabled={isLoading}>
              {isLoading
                ? <><span className="su-spin" /> Signing in…</>
                : <>Sign In <FiArrowRight /></>}
            </button>
          </form>

          <p className="su-alt">New here?<Link to="/signup">Create an account</Link></p>

          <div className="su-trust"><FiCheck /> Your data is encrypted and secure</div>
        </div>
      </main>
    </div>
  );
};

export default Signin;
