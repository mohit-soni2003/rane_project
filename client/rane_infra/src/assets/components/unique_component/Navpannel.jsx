import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { FaArrowRight } from "react-icons/fa";
import { useAuthStore } from "../../../store/authStore";
import { backend_url } from "../../../store/keyStore";
import LogoutModal from "../../../component/models/LogoutModal";

const NAV_STYLES = `
  .rnav-drawer {
    --rn-accent: var(--primary-orange, #f59e0b);
    --rn-accent-hover: var(--primary-orange-hover, #d97706);
    --rn-text: #0b1220;
    --rn-text-soft: #475569;
  }
  .rnav {
    --rn-accent: var(--primary-orange, #f59e0b);
    --rn-accent-hover: var(--primary-orange-hover, #d97706);
    --rn-text: #fff;
    --rn-text-soft: rgba(255,255,255,.82);
    --rn-brand-sub: rgba(255,255,255,.62);
    --rn-hover-bg: rgba(255,255,255,.14);
    position: fixed;
    top: 14px;
    left: 0;
    right: 0;
    z-index: 1000;
    padding: 0 16px;
    pointer-events: none;
    transition: top .35s ease, padding .35s ease;
  }
  .rnav.scrolled {
    --rn-text: #0b1220;
    --rn-text-soft: #475569;
    --rn-brand-sub: #94a3b8;
    --rn-hover-bg: color-mix(in srgb, var(--rn-accent) 12%, white);
  }
  .rnav-inner {
    pointer-events: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    height: 64px;
    padding: 0 10px 0 14px;
    max-width: 1180px;
    margin: 0 auto;
    box-sizing: border-box;
    border-radius: 999px;
    background: rgba(255,255,255,.10);
    border: 1px solid rgba(255,255,255,.22);
    backdrop-filter: blur(16px) saturate(140%);
    -webkit-backdrop-filter: blur(16px) saturate(140%);
    transition: background .35s ease, border-color .35s ease, box-shadow .35s ease, border-radius .35s ease, max-width .35s ease, padding .35s ease;
  }
  /* After the hero: dock to the top edge as a solid full-width bar so no content shows above or around it */
  .rnav.scrolled { top: 0; padding: 0; }
  .rnav.scrolled .rnav-inner {
    max-width: none;
    border-radius: 0;
    padding: 0 max(20px, calc((100% - 1180px) / 2 + 14px));
    background: rgba(255,255,255,.97);
    border-width: 0 0 1px 0;
    border-color: rgba(15,23,42,.07);
    box-shadow: 0 8px 28px -12px rgba(15,23,42,.18);
  }

  /* Brand */
  .rnav-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    flex-shrink: 1;
    min-width: 0;
  }
  .rnav-brand > div { min-width: 0; }
  .rnav-logo {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: #fff;
    display: grid;
    place-items: center;
    flex: none;
    box-shadow: 0 2px 10px rgba(0,0,0,.14);
  }
  .rnav-logo img { width: 32px; height: 32px; object-fit: contain; border-radius: 50%; }
  .rnav-brand-name, .rnav-brand-sub { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .rnav-brand-name {
    display: block;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: -.005em;
    color: var(--rn-text);
    line-height: 1.2;
    transition: color .3s ease;
  }
  .rnav-brand-sub {
    display: block;
    font-size: 0.7rem;
    color: var(--rn-brand-sub);
    transition: color .3s ease;
  }

  /* Desktop links */
  .rnav-links {
    display: flex;
    align-items: center;
    gap: 4px;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .rnav-links a {
    display: block;
    padding: 9px 16px;
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--rn-text-soft);
    text-decoration: none;
    border-radius: 999px;
    transition: color .2s, background .2s;
    white-space: nowrap;
  }
  .rnav-links a:hover {
    color: var(--rn-text);
    background: var(--rn-hover-bg);
  }
  .rnav.scrolled .rnav-links a:hover { color: var(--rn-accent-hover); }

  /* Auth buttons */
  .rnav-auth {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  .btn-signin {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 0.86rem;
    font-weight: 600;
    color: #fff;
    background: var(--rn-accent);
    border: 1px solid transparent;
    padding: 10px 22px;
    border-radius: 999px;
    cursor: pointer;
    text-decoration: none;
    box-shadow: 0 8px 20px -8px color-mix(in srgb, var(--rn-accent) 85%, transparent);
    transition: background .2s, transform .2s, box-shadow .2s;
  }
  .btn-signin:hover {
    background: var(--rn-accent-hover);
    color: #fff;
    transform: translateY(-1px);
  }
  .btn-signup {
    display: inline-block;
    font-size: 0.86rem;
    font-weight: 600;
    color: var(--rn-text);
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--rn-text) 28%, transparent);
    padding: 10px 22px;
    border-radius: 999px;
    cursor: pointer;
    text-decoration: none;
    transition: all .2s;
  }
  .btn-signup:hover {
    background: var(--rn-text);
    color: var(--rn-accent-hover);
    border-color: var(--rn-text);
    transform: translateY(-1px);
  }
  .rnav.scrolled .btn-signup:hover { background: #0b1220; color: #fff; border-color: #0b1220; }
  .btn-logout {
    font-size: 0.84rem;
    font-weight: 600;
    color: var(--rn-text-soft);
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--rn-text) 22%, transparent);
    padding: 9px 20px;
    border-radius: 999px;
    cursor: pointer;
    transition: all .2s;
  }
  .btn-logout:hover {
    border-color: #ef4444;
    color: #ef4444;
    background: #fef2f2;
  }
  .rnav-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--rn-accent);
    transition: transform .2s, box-shadow .2s;
    cursor: pointer;
    display: block;
  }
  .rnav-avatar:hover {
    transform: scale(1.06);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--rn-accent) 22%, transparent);
  }

  /* Hamburger */
  .rnav-burger {
    display: none;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 5px;
    width: 42px;
    height: 42px;
    background: var(--rn-hover-bg);
    border: 1px solid transparent;
    border-radius: 50%;
    cursor: pointer;
    padding: 0;
    transition: background .2s;
    flex-shrink: 0;
  }
  .rnav-burger span {
    display: block;
    width: 18px;
    height: 2px;
    background: var(--rn-text);
    border-radius: 2px;
    transition: all .28s ease;
    transform-origin: center;
  }
  .rnav-burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .rnav-burger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .rnav-burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

  /* Mobile drawer */
  .rnav-drawer {
    position: fixed;
    top: 72px;
    left: 16px;
    right: 16px;
    max-width: 520px;
    margin: 0 auto;
    background: rgba(255,255,255,.96);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border: 1px solid rgba(15,23,42,.06);
    border-radius: 24px;
    box-shadow: 0 24px 60px -16px rgba(15,23,42,.35);
    z-index: 999;
    max-height: 0;
    overflow: hidden;
    transform: translateY(-8px);
    transition: max-height .36s cubic-bezier(.16,1,.3,1), opacity .25s ease, transform .3s ease;
    opacity: 0;
    visibility: hidden;
  }
  .rnav-drawer.open {
    max-height: 520px;
    opacity: 1;
    transform: none;
    visibility: visible;
  }
  .rnav-drawer-inner {
    padding: 14px 14px 18px;
    box-sizing: border-box;
  }
  .rnav-drawer-links {
    list-style: none;
    margin: 0 0 4px;
    padding: 0;
  }
  .rnav-drawer-links li a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    font-size: 0.95rem;
    font-weight: 600;
    color: #334155;
    text-decoration: none;
    border-radius: 14px;
    transition: background .2s, color .2s;
  }
  .rnav-drawer-links li a:hover {
    background: color-mix(in srgb, var(--rn-accent) 12%, white);
    color: var(--rn-accent-hover);
  }
  .rnav-divider {
    height: 1px;
    background: #eef2f6;
    margin: 8px 6px 12px;
  }
  .rnav-drawer .btn-signup { color: #0b1220; border-color: #dbe2ea; }
  .rnav-drawer .btn-signup:hover { background: #0b1220; color: #fff; border-color: #0b1220; }
  .rnav-drawer .btn-logout { color: #475569; border-color: #dbe2ea; }
  .rnav-drawer-auth {
    display: flex;
    gap: 10px;
    padding: 0 4px;
  }
  .rnav-drawer-auth a {
    flex: 1;
    text-align: center;
    justify-content: center;
  }
  .rnav-drawer-logged {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 8px;
  }
  .rnav-drawer-user {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .rnav-user-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: #0b1220;
  }
  .rnav-user-role {
    font-size: 0.74rem;
    color: #94a3b8;
    text-transform: capitalize;
  }

  /* Backdrop */
  .rnav-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(7,12,24,.35);
    backdrop-filter: blur(3px);
    z-index: 998;
  }

  /* Breakpoints */
  @media (max-width: 991px) {
    .rnav-links, .rnav-auth { display: none !important; }
    .rnav-burger { display: flex; }
    .rnav-inner { padding: 0 10px 0 12px; }
  }
  @media (min-width: 992px) {
    .rnav-drawer, .rnav-backdrop { display: none !important; }
  }
  @media (max-width: 480px) {
    .rnav { padding: 0 10px; }
    .rnav-inner { gap: 10px; height: 60px; }
    .rnav-brand { gap: 10px; }
    .rnav-logo { width: 38px; height: 38px; }
    .rnav-logo img { width: 28px; height: 28px; }
    .rnav-brand-name { font-size: .8rem; }
    .rnav-brand-sub { font-size: .64rem; }
    .rnav-burger { width: 40px; height: 40px; }
    .rnav-drawer { top: 68px; left: 10px; right: 10px; }
  }
  @media (max-width: 360px) {
    .rnav-brand-sub { display: none; }
  }

  html, body { overflow-x: hidden; }
`;

function Navpannel() {
  const { isAuthenticated, user } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* Inject styles */
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "rnav-styles";
    if (!document.getElementById("rnav-styles")) document.head.appendChild(el);
    el.innerHTML = NAV_STYLES;
    return () => el.remove();
  }, []);

  /* Frosted-white state once the page leaves the hero */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    handler();
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
    if (role === "admin") return "/admin";
    if (role === "client") return "/client";
    if (role === "staff") return "/staff";
    return "/";
  };

  const closeDrawer = () => setDrawerOpen(false);
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const isLoggedIn = isAuthenticated && user?.isverified;

  return (
    <>
      {/* ── Navbar ── */}
      <nav className={`rnav${scrolled || drawerOpen ? " scrolled" : ""}`}>
        <div className="rnav-inner">

          {/* Brand */}
          <Link to="/" className="rnav-brand" onClick={scrollToTop}>
            <span className="rnav-logo"><img src="/logo.jpeg" alt="Logo" /></span>
            <div>
              <span className="rnav-brand-name">RANE &amp; SONS PVT. LTD.</span>
              <span className="rnav-brand-sub">Construction &amp; Infrastructure</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <ul className="rnav-links">
            <li><Link to="/" onClick={scrollToTop}>Home</Link></li>
            <li><HashLink to="/#pride-moment" smooth>Gallery</HashLink></li>
            <li><HashLink to="/#documents" smooth>Documents</HashLink></li>
            <li><HashLink to="/#contactus" smooth>Contact-us</HashLink></li>
          </ul>

          {/* Desktop auth */}
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
                <Link to="/signup" className="btn-signup">Sign Up</Link>
                <Link to="/signin" className="btn-signin">Sign In <FaArrowRight size={11} /></Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            className={`rnav-burger${drawerOpen ? " open" : ""}`}
            onClick={() => setDrawerOpen(o => !o)}
            aria-label="Toggle menu"
            aria-expanded={drawerOpen}
          >
            <span /><span /><span />
          </button>

        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      <div className={`rnav-drawer${drawerOpen ? " open" : ""}`}>
        <div className="rnav-drawer-inner">

          <ul className="rnav-drawer-links">
            <li><Link to="/" onClick={() => { closeDrawer(); scrollToTop(); }}>Home</Link></li>
            <li><HashLink to="/#pride-moment" smooth onClick={closeDrawer}>Gallery</HashLink></li>
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
