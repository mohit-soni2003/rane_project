import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { useAuthStore } from "../../../store/authStore";
import { backend_url } from "../../../store/keyStore";
import LogoutModal from "../../../component/models/LogoutModal";

const NAV_STYLES = `
  .rnav {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    background: #ffffff;
    border-bottom: 1px solid #f1f5f9;
    transition: box-shadow 0.3s ease;
  }
  .rnav.scrolled {
    box-shadow: 0 2px 16px rgba(0,0,0,0.09);
  }
  .rnav-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    padding: 0 20px;
    max-width: 1280px;
    margin: 0 auto;
    box-sizing: border-box;
  }

  /* Brand */
  .rnav-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    flex-shrink: 0;
  }
  .rnav-brand-name {
    display: block;
    font-size: 0.88rem;
    font-weight: 700;
    color: #1e293b;
    line-height: 1.2;
  }
  .rnav-brand-sub {
    display: block;
    font-size: 0.68rem;
    color: #94a3b8;
  }

  /* Desktop links */
  .rnav-links {
    display: flex;
    align-items: center;
    gap: 2px;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .rnav-links a {
    display: block;
    padding: 7px 13px;
    font-size: 0.875rem;
    font-weight: 600;
    color: #475569;
    text-decoration: none;
    border-radius: 6px;
    transition: color 0.2s, background 0.2s;
    white-space: nowrap;
  }
  .rnav-links a:hover {
    color: var(--primary-orange);
    background: #fff7f0;
  }

  /* Auth buttons */
  .rnav-auth {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  .btn-signin {
    font-size: 0.85rem;
    font-weight: 600;
    color: #fff;
    background: var(--primary-orange);
    border: none;
    padding: 8px 18px;
    border-radius: 7px;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.2s, transform 0.15s;
    display: inline-block;
  }
  .btn-signin:hover {
    background: var(--primary-orange-hover);
    color: #fff;
    transform: translateY(-1px);
  }
  .btn-signup {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--primary-orange);
    background: transparent;
    border: 1.5px solid var(--primary-orange);
    padding: 7px 18px;
    border-radius: 7px;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s;
    display: inline-block;
  }
  .btn-signup:hover {
    background: var(--primary-orange);
    color: #fff;
    transform: translateY(-1px);
  }
  .btn-logout {
    font-size: 0.82rem;
    font-weight: 600;
    color: #64748b;
    background: transparent;
    border: 1.5px solid #e2e8f0;
    padding: 7px 16px;
    border-radius: 7px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-logout:hover {
    border-color: #ef4444;
    color: #ef4444;
    background: #fff5f5;
  }
  .rnav-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--primary-orange);
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
  }
  .rnav-avatar:hover {
    transform: scale(1.08);
    box-shadow: 0 0 0 3px rgba(255,120,0,0.18);
  }

  /* Hamburger */
  .rnav-burger {
    display: none;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    width: 38px;
    height: 38px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    padding: 8px;
    transition: background 0.2s;
    flex-shrink: 0;
  }
  .rnav-burger:hover { background: #f1f5f9; }
  .rnav-burger span {
    display: block;
    height: 2px;
    background: #475569;
    border-radius: 2px;
    transition: all 0.28s ease;
    transform-origin: center;
  }
  .rnav-burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .rnav-burger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .rnav-burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

  /* Mobile drawer */
  .rnav-drawer {
    position: fixed;
    top: 64px;
    left: 0;
    width: 100%;
    background: #fff;
    border-bottom: 1px solid #f1f5f9;
    box-shadow: 0 8px 24px rgba(0,0,0,0.09);
    z-index: 999;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease;
    opacity: 0;
  }
  .rnav-drawer.open {
    max-height: 480px;
    opacity: 1;
  }
  .rnav-drawer-inner {
    padding: 10px 16px 18px;
    box-sizing: border-box;
  }
  .rnav-drawer-links {
    list-style: none;
    margin: 0 0 4px;
    padding: 0;
  }
  .rnav-drawer-links li a {
    display: block;
    padding: 12px 14px;
    font-size: 0.93rem;
    font-weight: 600;
    color: #475569;
    text-decoration: none;
    border-radius: 8px;
    transition: background 0.2s, color 0.2s;
  }
  .rnav-drawer-links li a:hover {
    background: #fff7f0;
    color: var(--primary-orange);
  }
  .rnav-divider {
    height: 1px;
    background: #f1f5f9;
    margin: 8px 0;
  }
  .rnav-drawer-auth {
    display: flex;
    gap: 10px;
    padding: 4px 14px;
  }
  .rnav-drawer-auth a {
    flex: 1;
    text-align: center;
  }
  .rnav-drawer-logged {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 14px;
  }
  .rnav-drawer-user {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .rnav-user-name {
    font-size: 0.88rem;
    font-weight: 600;
    color: #1e293b;
  }
  .rnav-user-role {
    font-size: 0.72rem;
    color: #94a3b8;
    text-transform: capitalize;
  }

  /* Backdrop */
  .rnav-backdrop {
    position: fixed;
    inset: 0;
    top: 64px;
    background: rgba(0,0,0,0.15);
    z-index: 998;
  }

  /* Breakpoints */
  @media (max-width: 991px) {
    .rnav-links, .rnav-auth { display: none !important; }
    .rnav-burger { display: flex; }
  }
  @media (min-width: 992px) {
    .rnav-drawer, .rnav-backdrop { display: none !important; }
  }

  html, body { overflow-x: hidden; }
  body { padding-top: 64px; }
`;

function Navpannel() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [scrolled, setScrolled]               = useState(false);
  const [drawerOpen, setDrawerOpen]           = useState(false);

  /* Inject styles */
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "rnav-styles";
    if (!document.getElementById("rnav-styles")) document.head.appendChild(el);
    el.innerHTML = NAV_STYLES;
    return () => el.remove();
  }, []);

  /* Scroll shadow */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  /* Auth check — same logic as original */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${backend_url}/check-auth`, { credentials: "include" });
        if (!res.ok) throw new Error("Authentication check failed");
        const data = await res.json();
        useAuthStore.setState({ user: data.user, isAuthenticated: true, role: data.user.role });
      } catch {
        useAuthStore.setState({ user: null, isAuthenticated: false, role: null });
      }
    })();
  }, []);

  const getDashboardPath = (role) => {
    if (role === "admin")  return "/admin";
    if (role === "client") return "/client";
    if (role === "staff")  return "/staff";
    return "/";
  };

  const closeDrawer = () => setDrawerOpen(false);
  const isLoggedIn  = isAuthenticated && user?.isverified;

  return (
    <>
      {/* ── Navbar ── */}
      <nav className={`rnav${scrolled ? " scrolled" : ""}`}>
        <div className="rnav-inner">

          {/* Brand — same as original */}
          <Link to="/" className="rnav-brand">
            <img src="/logo.webp" alt="Logo" style={{ width: "32px", height: "32px", objectFit: "contain" }} />
            <div>
              <span className="rnav-brand-name">RANE &amp; RANE'S SONS</span>
              <span className="rnav-brand-sub">Construction &amp; Infrastructure</span>
            </div>
          </Link>

          {/* Desktop nav links — same routes as original */}
          <ul className="rnav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/maintain">Tenders</Link></li>
            <li><Link to="/client/upload-bill">Bill Uploads</Link></li>
            <li><HashLink to="/#documents" smooth>Documents</HashLink></li>
            <li><HashLink to="/#contactus" smooth>Contact-us</HashLink></li>
          </ul>

          {/* Desktop auth — same logic as original */}
          <div className="rnav-auth">
            {isLoggedIn ? (
              <>
                <button className="btn-logout" onClick={() => setShowLogoutModal(true)}>
                  Logout
                </button>
                <Link to={getDashboardPath(user.role)}>
                  <img src={user.profile} alt="Profile" className="rnav-avatar" />
                </Link>
              </>
            ) : (
              <>
                <Link to="/signin" className="btn-signin">Sign In</Link>
                <Link to="/signup" className="btn-signup">Sign Up</Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            className={`rnav-burger${drawerOpen ? " open" : ""}`}
            onClick={() => setDrawerOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>

        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      <div className={`rnav-drawer${drawerOpen ? " open" : ""}`}>
        <div className="rnav-drawer-inner">

          <ul className="rnav-drawer-links">
            <li><Link to="/" onClick={closeDrawer}>Home</Link></li>
            <li><Link to="/maintain" onClick={closeDrawer}>Tenders</Link></li>
            <li><Link to="/client/upload-bill" onClick={closeDrawer}>Bill Uploads</Link></li>
            <li><HashLink to="/#documents" smooth onClick={closeDrawer}>Documents</HashLink></li>
            <li><HashLink to="/#contactus" smooth onClick={closeDrawer}>Contact-us</HashLink></li>
          </ul>

          <div className="rnav-divider" />

          {isLoggedIn ? (
            <div className="rnav-drawer-logged">
              <div className="rnav-drawer-user">
                <Link to={getDashboardPath(user.role)} onClick={closeDrawer}>
                  <img src={user.profile} alt="Profile" className="rnav-avatar" />
                </Link>
                <div>
                  <div className="rnav-user-name">{user.name || "My Account"}</div>
                  <div className="rnav-user-role">{user.role}</div>
                </div>
              </div>
              <button className="btn-logout" onClick={() => { closeDrawer(); setShowLogoutModal(true); }}>
                Logout
              </button>
            </div>
          ) : (
            <div className="rnav-drawer-auth">
              <Link to="/signin" className="btn-signin" onClick={closeDrawer}>Sign In</Link>
              <Link to="/signup" className="btn-signup" onClick={closeDrawer}>Sign Up</Link>
            </div>
          )}

        </div>
      </div>

      {/* Backdrop */}
      {drawerOpen && <div className="rnav-backdrop" onClick={closeDrawer} />}

      <LogoutModal show={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
    </>
  );
}

export default Navpannel;