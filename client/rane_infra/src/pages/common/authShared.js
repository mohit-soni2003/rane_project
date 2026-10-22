import { useEffect } from "react";

// Shared styles + font loader for the Sign In / Sign Up pages
export const AUTH_STYLES = `
  .su {
    --su-accent: var(--primary-orange, #f59e0b);
    --su-accent-hover: var(--primary-orange-hover, #d97706);
    --su-ink: #0b1220;
    --su-text: #475569;
    --su-muted: #64748b;
    --su-line: #e2e8f0;
    min-height: 100vh; width: 100%;
    display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
    background: #fff; color: var(--su-text);
    font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .su *, .su *::before, .su *::after { box-sizing: border-box; }
  .su h1, .su h2, .su p { margin: 0; }

  /* ═════════ BRAND PANEL ═════════ */
  .su-brand { position: relative; overflow: hidden; color: #fff; background: var(--su-ink); padding: 40px clamp(32px, 4.5vw, 72px); display: flex; flex-direction: column; justify-content: space-between; gap: 40px; }
  .su-brand-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; animation: suKen 26s ease-in-out infinite alternate; }
  @keyframes suKen { from { transform: scale(1); } to { transform: scale(1.08); } }
  .su-brand::before {
    content: ''; position: absolute; inset: 0; z-index: 1;
    background:
      radial-gradient(700px 420px at 10% 15%, color-mix(in srgb, var(--su-accent) 28%, transparent), transparent 62%),
      linear-gradient(160deg, rgba(7,12,24,.92) 10%, rgba(7,12,24,.72) 55%, rgba(7,12,24,.88) 100%);
  }
  .su-brand > *:not(.su-brand-img) { position: relative; z-index: 2; }
  .su-logo { display: inline-flex; align-items: center; gap: 12px; color: #fff; text-decoration: none; }
  .su-logo img { width: 46px; height: 46px; border-radius: 50%; background: #fff; padding: 2px; object-fit: cover; }
  .su-logo b { display: block; font-size: 1rem; font-weight: 800; letter-spacing: .01em; line-height: 1.2; }
  .su-logo span { display: block; font-size: .72rem; color: rgba(255,255,255,.7); letter-spacing: .06em; }

  .su-pill { display: inline-flex; align-items: center; gap: 9px; padding: 7px 14px 7px 11px; border-radius: 999px; background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.20); backdrop-filter: blur(10px); font-size: .72rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
  .su-pill i { width: 8px; height: 8px; border-radius: 50%; background: var(--su-accent); }
  .su-hero h1 { margin-top: 22px; font-size: clamp(2rem, 3.6vw, 3.1rem); font-weight: 800; letter-spacing: -.03em; line-height: 1.08; }
  .su-hero h1 span { color: var(--su-accent); }
  .su-hero p { margin-top: 16px; max-width: 460px; font-size: 1rem; line-height: 1.7; color: rgba(255,255,255,.78); }

  .su-feats { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
  .su-feats li { display: flex; align-items: center; gap: 14px; padding: 12px 16px; border-radius: 16px; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12); backdrop-filter: blur(8px); font-size: .9rem; font-weight: 500; color: rgba(255,255,255,.92); }
  .su-feats .ico { flex: none; width: 38px; height: 38px; border-radius: 11px; display: grid; place-items: center; background: var(--su-accent); color: #fff; font-size: 1rem; }

  /* ═════════ FORM PANEL ═════════ */
  .su-side { display: flex; flex-direction: column; padding: 28px clamp(24px, 5vw, 80px) 36px; background: #fff; }
  .su-back { align-self: flex-start; display: inline-flex; align-items: center; gap: 8px; font-size: .84rem; font-weight: 600; color: var(--su-muted); text-decoration: none; transition: color .2s ease; }
  .su-back:hover { color: var(--su-accent-hover); }
  .su-card { width: 100%; max-width: 440px; margin: auto; padding: 28px 0; }
  .su-eyebrow { display: inline-block; padding: 6px 14px; border-radius: 999px; font-size: .7rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--su-accent-hover); background: color-mix(in srgb, var(--su-accent) 13%, white); }
  .su-card h2 { margin-top: 16px; font-size: clamp(1.7rem, 3vw, 2.2rem); font-weight: 800; letter-spacing: -.025em; line-height: 1.15; color: var(--su-ink); }
  .su-sub { margin-top: 10px; font-size: .96rem; line-height: 1.6; color: var(--su-muted); }

  .su-form { margin-top: 28px; display: grid; gap: 18px; }
  .su-field label { display: block; margin-bottom: 7px; font-size: .8rem; font-weight: 600; color: #1e293b; }
  .su-input { position: relative; display: flex; align-items: center; gap: 12px; padding: 0 16px; height: 52px; background: #f6f8fb; border: 1.5px solid transparent; border-radius: 14px; transition: border-color .2s ease, background .2s ease, box-shadow .2s ease; }
  .su-input > svg { flex: none; color: #94a3b8; font-size: 1.05rem; transition: color .2s ease; }
  .su-input:focus-within { background: #fff; border-color: var(--su-accent); box-shadow: 0 0 0 4px color-mix(in srgb, var(--su-accent) 18%, transparent); }
  .su-input:focus-within > svg { color: var(--su-accent-hover); }
  .su-input input { flex: 1; min-width: 0; height: 100%; border: 0; outline: 0; background: transparent; font: inherit; font-size: .95rem; color: var(--su-ink); }
  .su-input input::placeholder { color: #94a3b8; }
  .su-eye { flex: none; display: grid; place-items: center; width: 34px; height: 34px; margin-right: -8px; border: 0; border-radius: 10px; background: transparent; color: #94a3b8; cursor: pointer; transition: background .2s ease, color .2s ease; }
  .su-eye:hover { background: #e8edf3; color: var(--su-ink); }
  .su-eye svg { font-size: 1.05rem; }

  .su-meter { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
  .su-meter i { height: 4px; border-radius: 99px; background: var(--su-line); transition: background .25s ease; }
  .su-meter-label { display: flex; justify-content: space-between; margin-top: 6px; font-size: .74rem; color: var(--su-muted); }
  .su-meter-label b { font-weight: 700; }

  .su-error { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: 12px; background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; font-size: .86rem; line-height: 1.5; }
  .su-error svg { flex: none; margin-top: 2px; }

  .su-submit { display: inline-flex; align-items: center; justify-content: center; gap: 10px; width: 100%; height: 54px; border: 0; border-radius: 999px; background: var(--su-accent); color: #fff; font: inherit; font-size: 1rem; font-weight: 700; cursor: pointer; box-shadow: 0 12px 28px -10px color-mix(in srgb, var(--su-accent) 85%, transparent); transition: transform .25s ease, background .25s ease, box-shadow .25s ease; }
  .su-submit:hover:not(:disabled) { transform: translateY(-2px); background: var(--su-accent-hover); box-shadow: 0 16px 32px -10px color-mix(in srgb, var(--su-accent) 90%, transparent); }
  .su-submit:disabled { opacity: .75; cursor: not-allowed; }
  .su-spin { width: 18px; height: 18px; border-radius: 50%; border: 2px solid rgba(255,255,255,.45); border-top-color: #fff; animation: suSpin .8s linear infinite; }
  @keyframes suSpin { to { transform: rotate(360deg); } }

  .su-alt { margin-top: 30px; text-align: center; font-size: .92rem; color: var(--su-muted); }
  .su-alt a { margin-left: 6px; font-weight: 700; color: var(--su-accent-hover); text-decoration: none; }
  .su-alt a:hover { text-decoration: underline; }
  .su-trust { margin-top: 22px; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: .78rem; color: var(--su-muted); }
  .su-trust svg { color: #16a34a; }

  .su-label-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 7px; }
  .su-label-row label { margin: 0; }
  .su-forgot { font-size: .8rem; font-weight: 600; color: var(--su-accent-hover); text-decoration: none; }
  .su-forgot:hover { text-decoration: underline; }

  .su-success { text-align: center; }
  .su-success-ico { width: 84px; height: 84px; margin: 0 auto 24px; border-radius: 50%; display: grid; place-items: center; font-size: 2rem; color: #16a34a; background: #dcfce7; box-shadow: 0 0 0 10px #f0fdf4; }
  .su-success h2 { margin-top: 0; }
  .su-success .su-sub b { color: var(--su-ink); word-break: break-all; }
  .su-tip { margin-top: 22px; padding: 14px 16px; border-radius: 14px; background: #f6f8fb; font-size: .84rem; line-height: 1.6; color: var(--su-muted); text-align: left; }
  .su-link-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; margin-top: 12px; padding: 0; border: 0; background: transparent; font: inherit; font-size: .92rem; font-weight: 700; color: var(--su-accent-hover); cursor: pointer; text-decoration: none; }
  .su-link-btn:hover { text-decoration: underline; }
  .su-success .su-submit { text-decoration: none; margin-top: 26px; }

  .su-otp { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 10px; }
  .su-otp input { width: 100%; height: 60px; padding: 0; text-align: center; font: inherit; font-size: 1.5rem; font-weight: 800; color: var(--su-ink); background: #f6f8fb; border: 1.5px solid transparent; border-radius: 14px; outline: 0; transition: border-color .2s ease, background .2s ease, box-shadow .2s ease, transform .2s ease; caret-color: var(--su-accent); }
  .su-otp input:focus { background: #fff; border-color: var(--su-accent); box-shadow: 0 0 0 4px color-mix(in srgb, var(--su-accent) 18%, transparent); transform: translateY(-2px); }
  .su-otp input.filled { background: #fff; border-color: color-mix(in srgb, var(--su-accent) 55%, white); }
  .su-code-hint { margin-top: 14px; text-align: center; font-size: .84rem; color: var(--su-muted); }
  .su-mail-chip { display: inline-flex; align-items: center; gap: 8px; max-width: 100%; margin-top: 14px; padding: 8px 14px; border-radius: 999px; background: #f6f8fb; border: 1px solid var(--su-line); font-size: .86rem; font-weight: 600; color: var(--su-ink); word-break: break-all; }
  .su-mail-chip svg { flex: none; color: var(--su-accent-hover); }

  /* ═════════ TABLET / MOBILE ═════════ */
  @media (max-width: 960px) {
    .su { grid-template-columns: minmax(0, 1fr); }
    .su-brand { padding: 26px 22px 56px; gap: 24px; }
    .su-hero p, .su-feats { display: none; }
    .su-hero h1 { margin-top: 16px; font-size: 1.7rem; }
    .su-side { position: relative; margin-top: -28px; padding: 22px 22px 32px; border-radius: 28px 28px 0 0; z-index: 3; }
    .su-back { display: none; }
    .su-card { padding: 8px 0; }
  }
  @media (max-width: 420px) {
    .su-otp { gap: 7px; }
    .su-otp input { height: 52px; font-size: 1.3rem; border-radius: 12px; }
    .su-input { height: 50px; }
    .su-submit { height: 52px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .su-brand-img, .su-spin { animation: none; }
  }
`;

export const useInterFont = () => {
  useEffect(() => {
    const font = document.createElement("link");
    font.rel = "stylesheet";
    font.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap";
    document.head.append(font);
    return () => font.remove();
  }, []);
};
