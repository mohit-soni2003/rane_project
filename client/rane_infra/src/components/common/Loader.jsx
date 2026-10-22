const LOADER_STYLES = `
  .tl {
    --tl-accent: var(--primary-orange, #f59e0b);
    --tl-ink: #0b1220;
    position: fixed; inset: 0; z-index: 9999;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 22px;
    background: radial-gradient(900px 500px at 50% 45%, #fff7ea, #ffffff 70%);
    font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  }
  .tl-scene { width: min(720px, 94vw); display: flex; flex-direction: column; align-items: center; -webkit-mask-image: linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent); mask-image: linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent); }
  .tl-train { width: min(520px, 80vw); height: auto; overflow: visible; animation: tlBob .5s ease-in-out infinite alternate; }
  @keyframes tlBob { to { transform: translateY(-1.5px); } }

  .tl-coach { fill: var(--tl-accent); }
  .tl-stripe { fill: var(--tl-ink); opacity: .85; }
  .tl-body { fill: var(--tl-ink); }
  .tl-glass { fill: #e0f2fe; }
  .tl-light { fill: #fde68a; }
  .tl-wheel circle { fill: #fff; stroke: var(--tl-ink); stroke-width: 2; }
  .tl-wheel line { stroke: var(--tl-ink); stroke-width: 1.5; }
  .tl-wheel { transform-box: fill-box; transform-origin: center; animation: tlSpin .7s linear infinite; }
  @keyframes tlSpin { to { transform: rotate(360deg); } }

  .tl-smoke { fill: #cbd5e1; opacity: 0; transform-box: fill-box; transform-origin: center; animation: tlSmoke 1.8s ease-out infinite; }
  @keyframes tlSmoke {
    0%   { opacity: 0; transform: translate(0, 0) scale(.4); }
    15%  { opacity: .75; }
    100% { opacity: 0; transform: translate(-34px, -34px) scale(1.7); }
  }

  .tl-rail { width: 100%; height: 3px; background: var(--tl-ink); border-radius: 2px; }
  .tl-sleepers { width: 100%; height: 9px; margin-top: 2px; background: repeating-linear-gradient(90deg, #94a3b8 0 7px, transparent 7px 24px); animation: tlGround .45s linear infinite; }
  @keyframes tlGround { to { background-position-x: -24px; } }

  .tl-text { margin: 0; font-size: .78rem; font-weight: 700; letter-spacing: .28em; text-transform: uppercase; color: var(--tl-ink); }
  .tl-dots span { animation: tlDot 1.2s infinite; opacity: .2; }
  .tl-dots span:nth-child(2) { animation-delay: .2s; }
  .tl-dots span:nth-child(3) { animation-delay: .4s; }
  @keyframes tlDot { 40% { opacity: 1; } }

  @media (prefers-reduced-motion: reduce) {
    .tl-train, .tl-wheel, .tl-smoke, .tl-sleepers { animation: none; }
    .tl-smoke { opacity: .5; }
  }
`;

const COACH_X = [10, 138];
const WHEEL_XS = [30, 50, 100, 120, 158, 178, 228, 248, 282, 306, 334, 358];

function Wheel({ cx }) {
  return (
    <g transform={`translate(${cx} 93)`}>
      <g className="tl-wheel">
        <circle r="7" />
        <line x1="-7" y1="0" x2="7" y2="0" />
        <line x1="0" y1="-7" x2="0" y2="7" />
      </g>
    </g>
  );
}

function Loader() {
  return (
    <div className="tl" role="status" aria-live="polite" aria-label="Loading">
      <style>{LOADER_STYLES}</style>

      <div className="tl-scene">
        <svg className="tl-train" viewBox="0 -30 400 130" aria-hidden="true">
          {/* coaches */}
          {COACH_X.map((x) => (
            <g key={x}>
              <rect className="tl-coach" x={x} y="38" width="120" height="52" rx="7" />
              <rect className="tl-stripe" x={x} y="76" width="120" height="6" />
              {[0, 1, 2, 3, 4].map((i) => (
                <rect key={i} className="tl-glass" x={x + 10 + i * 22} y="48" width="14" height="16" rx="3" />
              ))}
            </g>
          ))}

          {/* couplers */}
          <rect className="tl-body" x="130" y="80" width="8" height="3" />
          <rect className="tl-body" x="258" y="80" width="8" height="3" />

          {/* locomotive */}
          <rect className="tl-body" x="296" y="56" width="76" height="34" rx="5" />
          <rect className="tl-body" x="266" y="38" width="38" height="52" rx="4" />
          <rect className="tl-body" x="262" y="33" width="46" height="6" rx="2" />
          <rect className="tl-glass" x="274" y="46" width="20" height="16" rx="3" />
          <rect className="tl-body" x="346" y="42" width="10" height="14" />
          <rect className="tl-body" x="342" y="37" width="18" height="6" rx="2" />
          <rect className="tl-coach" x="296" y="72" width="76" height="5" />
          <circle className="tl-light" cx="368" cy="66" r="4" />
          <polygon className="tl-body" points="370,84 390,99 370,99" />

          {/* smoke */}
          {[0, 0.6, 1.2].map((d) => (
            <circle key={d} className="tl-smoke" cx="351" cy="32" r="7" style={{ animationDelay: `${d}s` }} />
          ))}

          {/* wheels */}
          {WHEEL_XS.map((cx) => <Wheel key={cx} cx={cx} />)}
        </svg>
        <div className="tl-rail" />
        <div className="tl-sleepers" />
      </div>

      <p className="tl-text">
        Loading<span className="tl-dots"><span>.</span><span>.</span><span>.</span></span>
      </p>
    </div>
  );
}

export default Loader;
