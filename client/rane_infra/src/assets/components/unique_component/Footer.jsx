import Lottie from "lottie-react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import {
  FaFacebookF, FaInstagram, FaTwitter, FaLinkedin, FaHardHat, FaPhoneAlt,
} from "react-icons/fa";
import trainAnimation from "../../animation/train.navpannel.json";

const FOOTER_STYLES = `
  .ft {
    --ft-accent: var(--primary-orange, #f59e0b);
    position: relative;
    overflow: hidden;
    color: #fff;
    background: #0a0a1c;
    font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    /* keeps the 1900x400 animation fully in frame on wide screens */
    min-height: clamp(0px, 21vw, 440px);
  }
  .ft *, .ft *::before, .ft *::after { box-sizing: border-box; }
  .ft h2, .ft p { margin: 0; }
  .ft a { text-decoration: none; }

  /* Train animation is the full-bleed background */
  .footer-lottie-bg,
  .footer-lottie-bg > div,
  .footer-lottie-bg svg {
    width: 100% !important;
    height: 100% !important;
    display: block !important;
  }
  .ft-lottie { position: absolute; inset: 0; pointer-events: none; user-select: none; z-index: 0; }
  .ft-overlay { position: absolute; inset: 0; z-index: 1; background: rgba(10, 10, 28, 0.68); }
  .ft-body { position: relative; z-index: 2; padding: 40px 20px 0; text-align: center; }

  .ft-brand { display: flex; align-items: center; justify-content: center; gap: 10px; }
  .ft-brand h2 { font-size: 1.2rem; font-weight: 800; letter-spacing: -.01em; }
  .ft-tag { margin-top: 8px; color: rgba(255,255,255,.72); font-size: .9rem; }

  .ft-nav { display: flex; justify-content: center; flex-wrap: wrap; gap: 6px 22px; margin-top: 18px; }
  .ft-nav a { color: rgba(255,255,255,.78); font-size: .86rem; font-weight: 500; transition: color .2s ease; }
  .ft-nav a:hover { color: var(--ft-accent); }

  .ft-social { display: flex; justify-content: center; gap: 12px; margin-top: 18px; }
  .ft-social a {
    width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center;
    color: rgba(255,255,255,.7); background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.14);
    font-size: .9rem; transition: all .25s ease;
  }
  .ft-social a:hover { color: #fff; background: var(--ft-accent); border-color: var(--ft-accent); transform: translateY(-3px); }

  .ft-info { margin-top: 18px; color: rgba(255,255,255,.58); font-size: .82rem; line-height: 1.7; }
  .ft-info a { color: inherit; }
  .ft-info a:hover { color: #fff; }
  .ft-info .dot { margin: 0 10px; color: rgba(255,255,255,.28); }

  .ft-bottom { margin-top: 20px; border-top: 1px solid rgba(255,255,255,.10); padding: 14px 0; display: flex; justify-content: center; align-items: center; gap: 16px; flex-wrap: wrap; }
  .ft-copy { color: rgba(255,255,255,.42); font-size: .78rem; }
  .ft-admin { color: var(--ft-accent); font-size: .78rem; font-weight: 600; }
  .ft-admin:hover { text-decoration: underline; }

  .ft-credit { position: relative; z-index: 2; background: rgba(0,0,0,.50); padding: 10px 20px; text-align: center; font-size: .75rem; color: rgba(255,255,255,.45); line-height: 1.7; }
  .ft-credit a { color: var(--ft-accent); font-weight: 600; }
  .ft-credit a:hover { text-decoration: underline; }
  .ft-credit .sep { margin: 0 10px; color: rgba(255,255,255,.25); }
  .ft-credit svg { font-size: .7rem; margin-right: 4px; vertical-align: -1px; }

  @media (max-width: 600px) {
    .ft-body { padding-top: 32px; }
    .ft-info .dot { display: none; }
    .ft-info span { display: block; }
  }
`;

const socials = [
  { href: "https://www.facebook.com/tejprakash.rane/", icon: <FaFacebookF />, label: "Facebook" },
  { href: "https://x.com/tejprakashrane?s=11", icon: <FaTwitter />, label: "X (Twitter)" },
  { href: "https://www.linkedin.com/", icon: <FaLinkedin />, label: "LinkedIn" },
  { href: "https://www.instagram.com/raneandranessons/?igsh=YXg2aGh2dXBpaGRi#", icon: <FaInstagram />, label: "Instagram" },
];

const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="ft">
      <style>{FOOTER_STYLES}</style>

      {/* ── Lottie full-bleed background ── */}
      <div className="ft-lottie footer-lottie-bg" aria-hidden="true">
        <Lottie
          animationData={trainAnimation}
          loop
          style={{ width: "100%", height: "100%" }}
          rendererSettings={{
            preserveAspectRatio: "xMidYMax slice",
            progressiveLoad: true,
          }}
        />
      </div>

      {/* Dark overlay for text readability */}
      <div className="ft-overlay" />

      <div className="ft-body">
        <div className="ft-brand">
          <FaHardHat color="var(--primary-orange)" size={20} />
          <h2>RANE &amp; RANE&apos;S SONS</h2>
        </div>
        <p className="ft-tag">Building India&apos;s railway infrastructure with trust and excellence</p>

        <nav className="ft-nav">
          <Link to="/" onClick={scrollToTop}>Home</Link>
          <HashLink smooth to="/#pride-moment">Gallery</HashLink>
          <HashLink smooth to="/#documents">Documents</HashLink>
          <HashLink smooth to="/#contactus">Contact Us</HashLink>
        </nav>

        <div className="ft-social">
          {socials.map(({ href, icon, label }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
              {icon}
            </a>
          ))}
        </div>

        <p className="ft-info">
          <span>101, Ranipura Main Road, Opp. Bhaiyya Ji Pyao, Jagjivan Ram Mohalla, Indore, MP, India</span>
          <br />
          <span>Phone: <a href="tel:9425029680">9425029680</a></span>
          <span className="dot">·</span>
          <span><a href="mailto:ranendranesons@gmail.com">ranendranesons@gmail.com</a></span>
        </p>

        <div className="ft-bottom">
          <span className="ft-copy">&copy; {new Date().getFullYear()} Rane &amp; Rane&apos;s Sons. All rights reserved.</span>
          <Link to="/admin-login" className="ft-admin">Admin Login</Link>
        </div>
      </div>

      {/* ── Developer credit bar ── */}
      <div className="ft-credit">
        Designed &amp; Maintained by Mohit Soni
        <br />
        <a href="https://mohitsoni.vercel.app/" target="_blank" rel="noopener noreferrer">Contact Developer</a>
        <span className="sep">|</span>
        <FaPhoneAlt />+91 9589571577
      </div>
    </footer>
  );
};

export default Footer;
