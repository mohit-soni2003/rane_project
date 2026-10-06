import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaFilePdf, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaClock,
  FaArrowRight, FaChevronLeft, FaChevronRight, FaDownload, FaCheck,
} from 'react-icons/fa';
import Navpannel from '../assets/components/unique_component/Navpannel';
import Footer from '../assets/components/unique_component/Footer';

/* ─────────────────────────────────────────────
   Scoped styles — everything is prefixed `lp-`
───────────────────────────────────────────── */
const LP_STYLES = `
  .lp {
    --lp-accent: var(--primary-orange, #f59e0b);
    --lp-accent-hover: var(--primary-orange-hover, #d97706);
    --lp-ink: #0b1220;
    --lp-ink-soft: #1e293b;
    --lp-text: #475569;
    --lp-muted: #64748b;
    --lp-line: #e8edf3;
    --lp-bg: #ffffff;
    --lp-bg-alt: #f6f8fb;
    --lp-radius: 20px;
    --lp-shadow: 0 1px 2px rgba(15,23,42,.04), 0 12px 32px -8px rgba(15,23,42,.10);
    --lp-shadow-lg: 0 2px 4px rgba(15,23,42,.05), 0 28px 60px -16px rgba(15,23,42,.22);
    font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    color: var(--lp-text);
    background: var(--lp-bg);
    -webkit-font-smoothing: antialiased;
    overflow-x: clip;
  }
  :where(.lp) *, :where(.lp) *::before, :where(.lp) *::after { box-sizing: border-box; }
  :where(.lp) :is(h1, h2, h3, h4, p) { margin: 0; }
  :where(.lp) a { text-decoration: none; }
  :where(.lp) img { display: block; max-width: 100%; }
  .lp-wrap { width: 100%; max-width: 1180px; margin: 0 auto; padding: 0 24px; }
  .lp-section { padding: clamp(72px, 9vw, 120px) 0; position: relative; }
  .lp-section.alt { background: var(--lp-bg-alt); }

  /* ── Reveal on scroll ── */
  .lp-reveal { opacity: 0; transform: translateY(28px); transition: opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1); transition-delay: var(--d, 0ms); }
  .lp-reveal.in { opacity: 1; transform: none; }
  @media (prefers-reduced-motion: reduce) {
    .lp-reveal { opacity: 1; transform: none; transition: none; }
    .lp-hero-bg, .lp-dot, .lp-cursor { animation: none !important; }
  }

  /* ── Section heading ── */
  .lp-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: .74rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
    color: var(--lp-accent-hover);
    background: color-mix(in srgb, var(--lp-accent) 12%, white);
    padding: 7px 14px; border-radius: 999px;
  }
  .lp-title { font-size: clamp(1.9rem, 3.6vw, 2.8rem); font-weight: 800; letter-spacing: -.02em; line-height: 1.12; color: var(--lp-ink); margin-top: 16px; }
  .lp-lead { font-size: 1.05rem; line-height: 1.75; color: var(--lp-text); margin-top: 18px; }
  .lp-head-center { text-align: center; max-width: 720px; margin: 0 auto clamp(40px, 5vw, 64px); }

  /* ── Buttons ── */
  .lp-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 10px;
    padding: 14px 26px; border-radius: 999px; border: 1px solid transparent;
    font: inherit; font-size: .95rem; font-weight: 600; cursor: pointer;
    transition: transform .25s ease, box-shadow .25s ease, background .25s ease, border-color .25s ease;
  }
  .lp-btn:hover { transform: translateY(-2px); }
  .lp-btn-primary { background: var(--lp-accent); color: #fff; box-shadow: 0 10px 28px -8px color-mix(in srgb, var(--lp-accent) 80%, transparent); }
  .lp-btn-primary:hover { background: var(--lp-accent-hover); color: #fff; box-shadow: 0 14px 32px -8px color-mix(in srgb, var(--lp-accent) 90%, transparent); }
  .lp-btn-ghost { background: rgba(255,255,255,.08); color: #fff; border-color: rgba(255,255,255,.28); backdrop-filter: blur(8px); }
  .lp-btn-ghost:hover { background: rgba(255,255,255,.16); color: #fff; }
  .lp-btn-dark { background: var(--lp-ink); color: #fff; }
  .lp-btn-dark:hover { background: #1b2740; color: #fff; }
  .lp-btn-sm { padding: 10px 20px; font-size: .85rem; }
  .lp-btn-block { width: 100%; }

  /* ═════════ HERO ═════════ */
  .lp-hero { position: relative; min-height: 100vh; display: flex; align-items: center; color: #fff; background: var(--lp-ink); padding: 150px 0 190px; overflow: hidden; }
  .lp-hero-media { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .lp-hero-bg { animation: lpKen 26s ease-in-out infinite alternate; }
  @keyframes lpKen { from { transform: scale(1); } to { transform: scale(1.09); } }
  .lp-hero::before {
    content: ''; position: absolute; inset: 0; z-index: 1;
    background:
      radial-gradient(900px 520px at 12% 30%, color-mix(in srgb, var(--lp-accent) 24%, transparent), transparent 62%),
      linear-gradient(105deg, rgba(7,12,24,.94) 8%, rgba(7,12,24,.66) 48%, rgba(7,12,24,.30) 100%);
  }
  .lp-hero::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 160px; z-index: 1; background: linear-gradient(180deg, transparent, rgba(7,12,24,.65)); }
  .lp-hero-inner { position: relative; z-index: 2; }
  .lp-pill {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 8px 16px 8px 12px; border-radius: 999px;
    background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.20); backdrop-filter: blur(10px);
    font-size: .78rem; font-weight: 600; letter-spacing: .12em; text-transform: uppercase;
  }
  .lp-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--lp-accent); box-shadow: 0 0 0 0 var(--lp-accent); animation: lpPulse 2s infinite; }
  @keyframes lpPulse { 70% { box-shadow: 0 0 0 10px transparent; } 100% { box-shadow: 0 0 0 0 transparent; } }
  .lp-h1 { font-size: clamp(2.6rem, 7vw, 5.2rem); font-weight: 800; letter-spacing: -.035em; line-height: 1.02; margin-top: 26px; text-transform: uppercase; }
  .lp-h1 span { display: block; background: linear-gradient(90deg, #fff 10%, color-mix(in srgb, var(--lp-accent) 80%, white)); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .lp-type { margin-top: 22px; font-size: clamp(1.1rem, 2vw, 1.5rem); font-weight: 500; min-height: 1.7em; color: rgba(255,255,255,.92); }
  .lp-type b { color: var(--lp-accent); font-weight: 600; }
  .lp-cursor { display: inline-block; width: 2px; height: 1.1em; background: var(--lp-accent); margin-left: 4px; vertical-align: text-bottom; animation: lpBlink .9s step-end infinite; }
  @keyframes lpBlink { 50% { opacity: 0; } }
  .lp-hero p.lp-sub { margin-top: 18px; max-width: 540px; font-size: 1.08rem; line-height: 1.75; color: rgba(255,255,255,.78); }
  .lp-actions { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 36px; }

  /* Floating stats */
  .lp-stats-float { position: relative; z-index: 5; margin-top: -92px; }
  .lp-stats {
    display: grid; grid-template-columns: repeat(4, 1fr);
    background: rgba(255,255,255,.92); backdrop-filter: blur(18px);
    border: 1px solid rgba(255,255,255,.6); border-radius: 28px; box-shadow: var(--lp-shadow-lg); overflow: hidden;
  }
  .lp-stat { padding: 34px 20px; text-align: center; position: relative; }
  .lp-stat + .lp-stat::before { content: ''; position: absolute; left: 0; top: 24%; bottom: 24%; width: 1px; background: var(--lp-line); }
  .lp-stat-num { font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; letter-spacing: -.03em; color: var(--lp-ink); line-height: 1; font-variant-numeric: tabular-nums; }
  .lp-stat-num em { font-style: normal; color: var(--lp-accent); }
  .lp-stat-label { margin-top: 10px; font-size: .86rem; font-weight: 500; color: var(--lp-muted); }

  /* ═════════ SPLIT (about / expertise) ═════════ */
  .lp-split { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(36px, 6vw, 88px); align-items: center; }
  .lp-split.flip .lp-split-media { order: -1; }
  .lp-media { position: relative; }
  .lp-media > img { width: 100%; height: auto; border-radius: 28px; box-shadow: var(--lp-shadow-lg); transition: transform .8s cubic-bezier(.16,1,.3,1); }
  .lp-media:hover > img { transform: scale(1.015); }
  .lp-media::before {
    content: ''; position: absolute; inset: 18px -18px -18px 18px; border-radius: 28px; z-index: -1;
    background: linear-gradient(135deg, color-mix(in srgb, var(--lp-accent) 40%, white), color-mix(in srgb, var(--lp-accent) 8%, white));
  }
  .flip .lp-media::before { inset: 18px 18px -18px -18px; }
  .lp-badge {
    position: absolute; left: -20px; bottom: 36px; display: flex; align-items: center; gap: 14px;
    background: #fff; padding: 16px 22px 16px 16px; border-radius: 18px; box-shadow: var(--lp-shadow-lg);
  }
  .flip .lp-badge { left: auto; right: -20px; }
  .lp-badge-ico { width: 46px; height: 46px; border-radius: 14px; background: var(--lp-accent); color: #fff; display: grid; place-items: center; font-weight: 800; font-size: 1.1rem; }
  .lp-badge strong { display: block; color: var(--lp-ink); font-size: 1.05rem; line-height: 1.2; }
  .lp-badge span { font-size: .78rem; color: var(--lp-muted); }
  .lp-chips { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 26px; }
  .lp-chip { display: inline-flex; align-items: center; gap: 8px; padding: 9px 16px; border: 1px solid var(--lp-line); border-radius: 999px; background: #fff; font-size: .85rem; font-weight: 600; color: var(--lp-ink-soft); }
  .lp-chip svg { color: var(--lp-accent); font-size: .7rem; }

  /* ═════════ DIRECTORS ═════════ */
  .lp-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 28px; max-width: 920px; margin: 0 auto; }
  .lp-person {
    background: #fff; border: 1px solid var(--lp-line); border-radius: 28px; padding: 44px 36px 38px; text-align: center;
    box-shadow: var(--lp-shadow); transition: transform .4s cubic-bezier(.16,1,.3,1), box-shadow .4s ease;
  }
  .lp-person:hover { transform: translateY(-8px); box-shadow: var(--lp-shadow-lg); }
  .lp-avatar { width: 132px; height: 132px; margin: 0 auto 24px; padding: 5px; border-radius: 50%; background: conic-gradient(from 180deg, var(--lp-accent), #fde68a, var(--lp-accent)); }
  .lp-avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 4px solid #fff; }
  .lp-person h3 { font-size: 1.4rem; font-weight: 700; color: var(--lp-ink); letter-spacing: -.01em; }
  .lp-role { display: inline-block; margin-top: 10px; padding: 5px 14px; border-radius: 999px; font-size: .78rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--lp-accent-hover); background: color-mix(in srgb, var(--lp-accent) 12%, white); }
  .lp-co { margin-top: 12px; font-size: .84rem; font-weight: 600; color: var(--lp-ink-soft); }
  .lp-person ul { list-style: none; padding: 0; margin: 20px 0 28px; display: grid; gap: 10px; text-align: left; }
  .lp-person li { position: relative; padding-left: 22px; font-size: .9rem; line-height: 1.6; color: var(--lp-text); }
  .lp-person li::before { content: ''; position: absolute; left: 0; top: .6em; width: 8px; height: 8px; border-radius: 50%; background: var(--lp-accent); }

  /* ═════════ SLIDER ═════════ */
  .lp-slider { position: relative; border-radius: 32px; overflow: hidden; background: var(--lp-ink); box-shadow: var(--lp-shadow-lg); aspect-ratio: 16 / 9; }
  .lp-slide { position: absolute; inset: 0; opacity: 0; transition: opacity .9s ease; }
  .lp-slide.on { opacity: 1; }
  .lp-slide .bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: blur(34px) brightness(.55); transform: scale(1.25); }
  .lp-slide .fg { position: relative; width: 100%; height: 100%; object-fit: contain; }
  .lp-caption { position: absolute; left: 0; right: 0; bottom: 0; padding: 80px 28px 28px; color: #fff; background: linear-gradient(0deg, rgba(7,12,24,.88), transparent); }
  .lp-caption small { display: block; font-size: .72rem; letter-spacing: .16em; text-transform: uppercase; color: var(--lp-accent); font-weight: 700; margin-bottom: 6px; }
  .lp-caption div { font-size: clamp(1rem, 2vw, 1.35rem); font-weight: 600; }
  .lp-arrow {
    position: absolute; top: 50%; transform: translateY(-50%); width: 50px; height: 50px; border-radius: 50%;
    border: 1px solid rgba(255,255,255,.3); background: rgba(255,255,255,.14); backdrop-filter: blur(10px); color: #fff;
    display: grid; place-items: center; cursor: pointer; transition: background .2s ease, transform .2s ease; z-index: 3;
  }
  .lp-arrow:hover { background: rgba(255,255,255,.3); transform: translateY(-50%) scale(1.06); }
  .lp-arrow.l { left: 18px; } .lp-arrow.r { right: 18px; }
  .lp-dots { display: flex; justify-content: center; gap: 8px; margin-top: 22px; }
  .lp-dots button { height: 8px; width: 8px; padding: 0; border: 0; border-radius: 99px; background: #cbd5e1; cursor: pointer; transition: all .3s ease; }
  .lp-dots button.on { width: 28px; background: var(--lp-accent); }

  /* ═════════ CONTACT ═════════ */
  .lp-contact { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 6fr); background: #fff; border-radius: 32px; box-shadow: var(--lp-shadow-lg); overflow: hidden; border: 1px solid var(--lp-line); }
  .lp-contact-info { position: relative; padding: clamp(32px, 4vw, 56px); color: #fff; background: var(--lp-ink); overflow: hidden; }
  .lp-contact-info::before { content: ''; position: absolute; width: 380px; height: 380px; right: -140px; top: -140px; border-radius: 50%; background: radial-gradient(circle, color-mix(in srgb, var(--lp-accent) 55%, transparent), transparent 68%); }
  .lp-contact-info::after { content: ''; position: absolute; width: 300px; height: 300px; left: -120px; bottom: -120px; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,.10), transparent 68%); }
  .lp-contact-info > * { position: relative; z-index: 1; }
  .lp-contact-info h3 { font-size: 1.7rem; font-weight: 800; letter-spacing: -.02em; line-height: 1.2; }
  .lp-contact-info > p { margin-top: 14px; color: rgba(255,255,255,.72); line-height: 1.7; font-size: .96rem; }
  .lp-info-list { list-style: none; padding: 0; margin: 34px 0 0; display: grid; gap: 22px; }
  .lp-info-list li { display: flex; gap: 16px; align-items: flex-start; min-width: 0; }
  .lp-info-list li > div { min-width: 0; flex: 1; }
  .lp-info-ico { flex: none; width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.14); color: var(--lp-accent); font-size: 1rem; transition: background .25s ease, transform .25s ease; }
  .lp-info-list li:hover .lp-info-ico { background: var(--lp-accent); color: #fff; transform: scale(1.06); }
  .lp-info-list small { display: block; font-size: .72rem; text-transform: uppercase; letter-spacing: .12em; color: rgba(255,255,255,.5); margin-bottom: 3px; font-weight: 600; }
  .lp-info-list span, .lp-info-list a { color: #fff; font-size: .95rem; line-height: 1.55; overflow-wrap: anywhere; }
  .lp-info-list a:hover { color: var(--lp-accent); }
  .lp-form-wrap { padding: clamp(32px, 4vw, 56px); }
  .lp-form-wrap h3 { font-size: 1.35rem; font-weight: 700; color: var(--lp-ink); letter-spacing: -.01em; }
  .lp-form { display: grid; gap: 18px; margin-top: 26px; }
  .lp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .lp-field label { display: block; margin-bottom: 7px; font-size: .8rem; font-weight: 600; color: var(--lp-ink-soft); }
  .lp-field label i { color: var(--lp-accent); font-style: normal; }
  .lp-input {
    width: 100%; padding: 13px 16px; font: inherit; font-size: .92rem; color: var(--lp-ink);
    background: var(--lp-bg-alt); border: 1.5px solid transparent; border-radius: 14px; outline: none;
    transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
  }
  .lp-input::placeholder { color: #94a3b8; }
  .lp-input:focus { background: #fff; border-color: var(--lp-accent); box-shadow: 0 0 0 4px color-mix(in srgb, var(--lp-accent) 18%, transparent); }
  select.lp-input { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1 1.5l5 5 5-5'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 16px center; padding-right: 40px; }
  textarea.lp-input { resize: vertical; min-height: 120px; }
  .lp-success { text-align: center; padding: 48px 8px; }
  .lp-success-ico { width: 72px; height: 72px; margin: 0 auto 22px; border-radius: 50%; display: grid; place-items: center; background: #dcfce7; color: #16a34a; font-size: 1.6rem; }
  .lp-success p { color: var(--lp-muted); margin: 10px 0 26px; }

  /* ═════════ DOCUMENTS ═════════ */
  .lp-docs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
  .lp-docs > .lp-reveal, .lp-grid-2 > .lp-reveal, .lp-person { height: 100%; }
  .lp-doc {
    height: 100%;
    display: flex; flex-direction: column; gap: 22px; justify-content: space-between;
    background: #fff; border: 1px solid var(--lp-line); border-radius: 22px; padding: 28px;
    transition: transform .35s cubic-bezier(.16,1,.3,1), box-shadow .35s ease, border-color .35s ease;
  }
  .lp-doc:hover { transform: translateY(-6px); box-shadow: var(--lp-shadow-lg); border-color: color-mix(in srgb, var(--lp-accent) 45%, white); }
  .lp-doc-top { display: flex; gap: 16px; align-items: flex-start; }
  .lp-doc-ico { flex: none; width: 52px; height: 52px; border-radius: 16px; background: #fef2f2; color: #dc2626; display: grid; place-items: center; font-size: 1.3rem; }
  .lp-doc-name { font-weight: 600; color: var(--lp-ink); line-height: 1.45; font-size: .98rem; padding-top: 2px; }
  .lp-doc-name small { display: block; margin-top: 4px; font-size: .75rem; font-weight: 500; color: var(--lp-muted); letter-spacing: .06em; text-transform: uppercase; }
  .lp-doc-link { display: inline-flex; align-items: center; gap: 10px; font-size: .88rem; font-weight: 600; color: var(--lp-accent-hover); }
  .lp-doc-link svg { transition: transform .25s ease; }
  .lp-doc:hover .lp-doc-link svg { transform: translateY(2px); }

  /* ═════════ RESPONSIVE ═════════ */
  @media (max-width: 991px) {
    .lp-split, .lp-contact { grid-template-columns: minmax(0, 1fr); }
    .lp-split.flip .lp-split-media { order: 0; }
    .lp-docs { grid-template-columns: repeat(2, 1fr); }
    .lp-stats { grid-template-columns: repeat(2, 1fr); }
    .lp-stat:nth-child(3)::before { display: none; }
    .lp-stat:nth-child(n+3) { border-top: 1px solid var(--lp-line); }
    .lp-badge, .flip .lp-badge { left: 14px; right: auto; bottom: 14px; }
    .lp-media::before, .flip .lp-media::before { inset: 14px -10px -10px 14px; }
  }
  @media (max-width: 640px) {
    .lp-wrap { padding: 0 18px; }
    .lp-hero { padding: 124px 0 170px; min-height: auto; }
    .lp-grid-2, .lp-docs, .lp-row { grid-template-columns: 1fr; }
    .lp-actions .lp-btn { flex: 1 1 100%; }
    .lp-stat { padding: 26px 12px; }
    .lp-slider { aspect-ratio: 4 / 3; border-radius: 22px; }
    .lp-arrow { width: 40px; height: 40px; }
    .lp-contact, .lp-person { border-radius: 24px; }
  }
`;

const TYPE_WORDS = [
  'Railway Contractors',
  'Infrastructure Builders',
  'Trusted since 2019',
  "Building India's Future",
];

const stats = [
  { value: 5, suffix: '+', label: 'Years of Experience' },
  { value: 120, suffix: '+', label: 'Projects Completed' },
  { value: 4, suffix: '', label: 'States Covered' },
  { value: 98, suffix: '%', label: 'Client Satisfaction' },
];

const recognitionImages = [
  { src: '/hero/mohan_yadav.jpeg', title: "With Hon'ble Chief Minister Dr. Mohan Yadav" },
  { src: '/hero/kamal_nath.jpeg', title: 'With Shri Kamal Nath' },
  { src: '/hero/umang_singhar.jpeg', title: 'With Shri Umang Singhar' },
  { src: '/hero/jitu.jpeg', title: 'With Shri Jitu Patwari' },
];

const documents = [
  { name: 'Rane GST Certificate', file: '/documents/Rane GST Certificate.pdf' },
  { name: 'Drugs Sale Licence', file: '/documents/Drugs Sale Licence_.pdf' },
  { name: 'Udyam Registration Certificate', file: '/documents/Udyam_Registration_Certificate.pdf' },
  { name: 'Business Conditions for Labor Contractors', file: '/documents/Business Conditions for Labor Contractors.pdf' },
  { name: 'GUMASTA', file: '/documents/GUMASTA.pdf' },
  { name: 'Business Terms and Conditions for Goods Supply', file: '/documents/Business Terms and Conditions for Goods Supply.pdf' },
];

const WHATSAPP_MESSAGE = 'Hello Rane Infra, I visited your website and would like to know more about your services. Please get in touch with me.';

const contactItems = [
  {
    icon: <FaWhatsapp />,
    label: 'WhatsApp',
    text: '+91 62646 05007',
    href: `https://wa.me/916264605007?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`,
  },
  { icon: <FaEnvelope />, label: 'Email', text: 'ranendranesons@gmail.com', href: 'mailto:ranendranesons@gmail.com' },
  {
    icon: <FaMapMarkerAlt />,
    label: 'Office',
    text: '101, Ranipura Main Road, Opp. Bhaiyya Ji Pyao, Jagjivan Ram Mohalla, Indore, MP, India',
    href: 'https://www.google.com/maps/search/?api=1&query=Ranipura+Main+Road+Indore',
  },
  { icon: <FaClock />, label: 'Hours', text: 'Open today 11:45 am – 05:00 pm' },
];

const expertiseAreas = ['Track Laying', 'Station Infrastructure', 'Railway Construction', 'Project Execution'];
const aboutAreas = ['Planning & Design', 'Execution', 'Maintenance'];

const EMPTY_FORM = { name: '', email: '', phone: '', subject: '', description: '' };

/* ─── Hooks ─── */
function useTypewriter(words, speed = 70, pause = 1500) {
  const [text, setText] = useState('');
  const [word, setWord] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = words[word];
    const done = !deleting && text === full;
    const empty = deleting && text === '';
    const delay = done ? pause : deleting ? speed / 2 : speed;

    const t = setTimeout(() => {
      if (done) setDeleting(true);
      else if (empty) { setDeleting(false); setWord((w) => (w + 1) % words.length); }
      else setText(full.slice(0, text.length + (deleting ? -1 : 1)));
    }, delay);
    return () => clearTimeout(t);
  }, [text, deleting, word, words, speed, pause]);

  return text;
}

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setSeen(true); return; }
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setSeen(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, seen];
}

/* ─── Building blocks ─── */
function Reveal({ children, delay = 0, className = '' }) {
  const [ref, seen] = useInView();
  return (
    <div
      ref={ref}
      className={`lp-reveal${seen ? ' in' : ''} ${className}`}
      style={{ '--d': `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function SectionHead({ eyebrow, title, lead, center = true }) {
  return (
    <Reveal className={center ? 'lp-head-center' : ''}>
      <span className="lp-eyebrow">{eyebrow}</span>
      <h2 className="lp-title">{title}</h2>
      {lead && <p className="lp-lead">{lead}</p>}
    </Reveal>
  );
}

function StatCounter({ target, suffix, label, active }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    const duration = 1600;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setCount(Math.round(target * (1 - Math.pow(1 - p, 4))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target]);

  return (
    <div className="lp-stat">
      <div className="lp-stat-num">{count}<em>{suffix}</em></div>
      <div className="lp-stat-label">{label}</div>
    </div>
  );
}

function RecognitionSlider({ images }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = images.length;

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), 4000);
    return () => clearInterval(timer);
  }, [paused, count]);

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="lp-slider">
        {images.map((img, i) => (
          <div key={img.src} className={`lp-slide${i === index ? ' on' : ''}`} aria-hidden={i !== index}>
            <img className="bg" src={img.src} alt="" />
            <img className="fg" src={img.src} alt={img.title} loading="lazy" />
          </div>
        ))}
        <div className="lp-caption">
          <small>{String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</small>
          <div>{images[index].title}</div>
        </div>
        <button className="lp-arrow l" onClick={() => setIndex((i) => (i - 1 + count) % count)} aria-label="Previous"><FaChevronLeft /></button>
        <button className="lp-arrow r" onClick={() => setIndex((i) => (i + 1) % count)} aria-label="Next"><FaChevronRight /></button>
      </div>
      <div className="lp-dots">
        {images.map((img, i) => (
          <button key={img.src} className={i === index ? 'on' : ''} onClick={() => setIndex(i)} aria-label={`Go to slide ${i + 1}`} />
        ))}
      </div>
    </div>
  );
}

function SplitSection({ flip, alt, eyebrow, title, paragraphs, chips, image, imageAlt, badge, id }) {
  return (
    <section className={`lp-section${alt ? ' alt' : ''}`} id={id}>
      <div className="lp-wrap">
        <div className={`lp-split${flip ? ' flip' : ''}`}>
          <Reveal>
            <span className="lp-eyebrow">{eyebrow}</span>
            <h2 className="lp-title">{title}</h2>
            {paragraphs.map((p) => <p className="lp-lead" key={p}>{p}</p>)}
            <div className="lp-chips">
              {chips.map((c) => <span className="lp-chip" key={c}><FaCheck />{c}</span>)}
            </div>
          </Reveal>
          <Reveal className="lp-split-media" delay={120}>
            <div className="lp-media">
              <img src={image} alt={imageAlt} loading="lazy" />
              {badge && (
                <div className="lp-badge">
                  <div className="lp-badge-ico">{badge.icon}</div>
                  <div><strong>{badge.title}</strong><span>{badge.sub}</span></div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function DirectorCard({ photo, name, role, points, delay }) {
  return (
    <Reveal delay={delay}>
      <div className="lp-person">
        <div className="lp-avatar"><img src={photo} alt={name} loading="lazy" /></div>
        <h3>{name}</h3>
        <span className="lp-role">{role}</span>
        <p className="lp-co">RANE AND SON&apos;S PRIVATE LIMITED</p>
        <ul>{points.map((p) => <li key={p}>{p}</li>)}</ul>
        <a href="#contactus" className="lp-btn lp-btn-dark lp-btn-sm">Get in Touch <FaArrowRight /></a>
      </div>
    </Reveal>
  );
}

/* ─── Page ─── */
export default function LandingPage() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = LP_STYLES;
    const font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
    document.head.append(font, style);
    const prevBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      style.remove();
      font.remove();
      document.documentElement.style.scrollBehavior = prevBehavior;
    };
  }, []);

  const typeText = useTypewriter(TYPE_WORDS);
  const [statRef, statSeen] = useInView(0.3);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => { e.preventDefault(); setSubmitted(true); };
  const handleReset = () => { setForm(EMPTY_FORM); setSubmitted(false); };

  return (
    <div className="lp">
      <Navpannel />

      {/* ════════ HERO ════════ */}
      <section className="lp-hero">
        <img className="lp-hero-media lp-hero-bg" src="/images/train1.jpg" alt="" />
        <video
          className="lp-hero-media"
          autoPlay muted loop playsInline
          poster="/images/train1.jpg"
        >
          <source src="/videos/train_hero.webm" type="video/webm" />
        </video>

        <div className="lp-wrap lp-hero-inner">
          <div style={{ maxWidth: 760 }}>
            <span className="lp-pill"><i className="lp-dot" />Indian Railway Contractors</span>
            <h1 className="lp-h1">
              Rane and Sons
              <span>Private Limited</span>
            </h1>
            <div className="lp-type" aria-live="off">
              <b>{typeText}</b><i className="lp-cursor" />
            </div>
            <p className="lp-sub">
              Building India&apos;s railway infrastructure with precision, quality, and trust.
              Your reliable partner for all construction and infrastructure projects.
            </p>
            <div className="lp-actions">
              <Link to="/signin" className="lp-btn lp-btn-primary">Get Started <FaArrowRight /></Link>
              <a href="#contactus" className="lp-btn lp-btn-ghost">Contact Us</a>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ STATS ════════ */}
      <div className="lp-stats-float" ref={statRef}>
        <div className="lp-wrap">
          <Reveal className="lp-stats">
            {stats.map((s) => (
              <StatCounter key={s.label} target={s.value} suffix={s.suffix} label={s.label} active={statSeen} />
            ))}
          </Reveal>
        </div>
      </div>

      {/* ════════ ABOUT ════════ */}
      <SplitSection
        eyebrow="Who We Are"
        title="About Our Company"
        paragraphs={[
          'Rane Infrastructure is a leading construction company specialising in railway and infrastructure projects for state governments. With years of experience and a team of skilled professionals, we provide reliable and high-quality construction services to meet the growing infrastructure needs of our clients.',
          'From planning and design to execution and maintenance, we handle every aspect of the construction process with utmost efficiency and attention to detail.',
        ]}
        chips={aboutAreas}
        image="/images/trainphoto.jpg"
        imageAlt="About Our Company"
        badge={{ icon: '5+', title: 'Years of Experience', sub: 'Railway & infrastructure' }}
      />

      {/* ════════ EXPERTISE ════════ */}
      <SplitSection
        flip
        alt
        eyebrow="What We Do"
        title="Our Expertise"
        paragraphs={[
          "With over 5 years of experience in Railway construction, RANE AND SON'S PRIVATE LIMITED has become a trusted name in the field of construction. Our team of experts has the knowledge, skills, and expertise to handle any project, big or small.",
          'We have completed numerous projects ranging from track laying to station infrastructure, and our clients can attest to our commitment to quality and excellence.',
        ]}
        chips={expertiseAreas}
        image="/images/trainphoto2.jpg"
        imageAlt="Our Expertise"
        badge={{ icon: '120+', title: 'Projects Completed', sub: 'Across 4 states' }}
      />

      {/* ════════ DIRECTORS ════════ */}
      <section className="lp-section">
        <div className="lp-wrap">
          <SectionHead eyebrow="Leadership" title="Meet Our Directors" />
          <div className="lp-grid-2">
            <DirectorCard
              photo="/images/rane.webp"
              name="Tejprakash Rane"
              role="Director"
              delay={0}
              points={[
                'Former District Coordinator, National Commission for Scheduled Castes',
                'Former Executive Council Member, Maharishi Panini Sanskrit Evam Vaidik Vishwavidyalaya, Ujjain',
              ]}
            />
            <DirectorCard
              photo="/hero/harsh_rane.jpeg"
              name="Harshwardhan Rane"
              role="Co-Director"
              delay={120}
              points={[
                "Second-generation leadership carrying forward the family's railway construction legacy",
                'Oversees day-to-day project execution, site operations, and client relationships',
              ]}
            />
          </div>
        </div>
      </section>

      {/* ════════ RECOGNITION ════════ */}
      <section className="lp-section alt" id="pride-moment">
        <div className="lp-wrap">
          <SectionHead
            eyebrow="Recognition"
            title="A Moment of Pride"
            lead="Our Directors have had the honour of meeting with prominent leaders of Madhya Pradesh — moments that reflect our continued commitment to the state's infrastructure development and our growing presence in the sector."
          />
          <Reveal delay={100}>
            <RecognitionSlider images={recognitionImages} />
          </Reveal>
        </div>
      </section>

      {/* ════════ CONTACT ════════ */}
      <section className="lp-section" id="contactus">
        <div className="lp-wrap">
          <SectionHead eyebrow="Get In Touch" title="Contact Us" />
          <Reveal className="lp-contact" delay={100}>
            <div className="lp-contact-info">
              <h3>Better yet, see us in person!</h3>
              <p>
                We stay in constant communication with our customers until the job is done.
                To get a free quote, or if you have questions or special requests, just drop us a line.
              </p>
              <ul className="lp-info-list">
                {contactItems.map((item) => (
                  <li key={item.label}>
                    <span className="lp-info-ico">{item.icon}</span>
                    <div>
                      <small>{item.label}</small>
                      {item.href
                        ? <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{item.text}</a>
                        : <span>{item.text}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lp-form-wrap">
              {submitted ? (
                <div className="lp-success">
                  <div className="lp-success-ico"><FaCheck /></div>
                  <h3>Message Sent!</h3>
                  <p>Thank you for reaching out. We&apos;ll get back to you shortly.</p>
                  <button type="button" className="lp-btn lp-btn-primary lp-btn-sm" onClick={handleReset}>Send Another</button>
                </div>
              ) : (
                <>
                  <h3>Send us a message</h3>
                  <form className="lp-form" onSubmit={handleSubmit}>
                    <div className="lp-row">
                      <div className="lp-field">
                        <label htmlFor="lp-name">Full Name <i>*</i></label>
                        <input id="lp-name" className="lp-input" type="text" name="name" value={form.name} onChange={handleChange} placeholder="Rajesh Kumar" required />
                      </div>
                      <div className="lp-field">
                        <label htmlFor="lp-phone">Phone <i>*</i></label>
                        <input id="lp-phone" className="lp-input" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" required />
                      </div>
                    </div>
                    <div className="lp-field">
                      <label htmlFor="lp-email">Email Address <i>*</i></label>
                      <input id="lp-email" className="lp-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
                    </div>
                    <div className="lp-field">
                      <label htmlFor="lp-subject">Subject <i>*</i></label>
                      <select id="lp-subject" className="lp-input" name="subject" value={form.subject} onChange={handleChange} required style={{ color: form.subject ? undefined : '#94a3b8' }}>
                        <option value="" disabled>Select a subject</option>
                        <option value="Tender Enquiry">Tender Enquiry</option>
                        <option value="Project Quote">Project Quote</option>
                        <option value="Partnership">Partnership</option>
                        <option value="General Enquiry">General Enquiry</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="lp-field">
                      <label htmlFor="lp-message">Message <i>*</i></label>
                      <textarea id="lp-message" className="lp-input" name="description" value={form.description} onChange={handleChange} placeholder="Tell us about your project or requirement..." rows={4} required />
                    </div>
                    <button type="submit" className="lp-btn lp-btn-primary lp-btn-block">Send Message <FaArrowRight /></button>
                  </form>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════ DOCUMENTS ════════ */}
      <section className="lp-section alt" id="documents">
        <div className="lp-wrap">
          <SectionHead
            eyebrow="Transparency"
            title="Important Documents"
            lead="Our registrations, licences and business terms — available to download at any time."
          />
          <div className="lp-docs">
            {documents.map((doc, i) => (
              <Reveal key={doc.file} delay={(i % 3) * 90}>
                <a className="lp-doc" href={doc.file} target="_blank" rel="noopener noreferrer">
                  <div className="lp-doc-top">
                    <span className="lp-doc-ico"><FaFilePdf /></span>
                    <div className="lp-doc-name">{doc.name}<small>PDF Document</small></div>
                  </div>
                  <span className="lp-doc-link"><FaDownload /> Download PDF</span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
