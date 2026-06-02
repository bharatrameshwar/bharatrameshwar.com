/* Primitives.jsx — shared building blocks: Asanoha watermark, Reveal, Counter. */
import { useState, useEffect, useRef } from "react";

/* Asanoha hemp-leaf corner watermark. */
export const Asanoha = () => {
  const stars = [];
  const r = 58;
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 4; col++) {
      const cx = 30 + col * 88 + (row % 2 === 0 ? 0 : 44);
      const cy = 36 + row * 68;
      stars.push({ cx, cy });
    }
  }
  return (
    <svg className="r-asanoha" viewBox="0 0 360 720" preserveAspectRatio="xMaxYMin slice" aria-hidden="true">
      <g stroke="#8b5a2b" strokeWidth="0.8" fill="none" opacity="0.5">
        {stars.map(({ cx, cy }, i) => (
          <g key={i}>
            {Array.from({ length: 6 }).map((_, k) => {
              const a = (k * Math.PI) / 3;
              const b = ((k + 1) * Math.PI) / 3;
              const x1 = cx + Math.cos(a) * r, y1 = cy + Math.sin(a) * r;
              const x2 = cx + Math.cos(b) * r, y2 = cy + Math.sin(b) * r;
              return (
                <g key={k}>
                  <line x1={cx} y1={cy} x2={x1} y2={y1} />
                  <line x1={(cx + x1) / 2} y1={(cy + y1) / 2} x2={x2} y2={y2} />
                </g>
              );
            })}
          </g>
        ))}
      </g>
    </svg>
  );
};

/* IntersectionObserver-driven reveal wrapper. Base state is visible;
   the entrance is purely additive, so JS failure never hides content. */
export const Reveal = ({ children, className = "", as: Tag = "div", style, ...rest }) => {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) { setSeen(true); return; }
    const rect = el.getBoundingClientRect();
    if (rect.top < (window.innerHeight || 800) * 0.95) { setSeen(true); return; }
    let done = false;
    const reveal = () => { if (!done) { done = true; setSeen(true); } };
    let io;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => entries.forEach((e) => { if (e.isIntersecting) { reveal(); io.disconnect(); } }),
        { threshold: 0.12 }
      );
      io.observe(el);
    }
    const t = setTimeout(reveal, 1400);
    return () => { if (io) io.disconnect(); clearTimeout(t); };
  }, []);
  return (
    <Tag ref={ref} className={`r-reveal ${seen ? "is-in" : ""} ${className}`} style={style} {...rest}>
      {children}
    </Tag>
  );
};

/* Count-up number, runs once when scrolled into view. */
export const Counter = ({ value, prefix = "", suffix = "", decimals = 0 }) => {
  const ref = useRef(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) { setN(value); return; }
    let raf, done = false;
    const run = () => {
      if (done) return; done = true;
      const dur = 1400, t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setN(value * eased);
        if (p < 1) raf = requestAnimationFrame(tick);
        else setN(value);
      };
      raf = requestAnimationFrame(tick);
    };
    let io;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { io.disconnect(); run(); } });
      }, { threshold: 0.4 });
      io.observe(el);
    }
    const t = setTimeout(run, 1600);
    return () => { if (io) io.disconnect(); clearTimeout(t); if (raf) cancelAnimationFrame(raf); };
  }, [value]);
  const shown = n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <span ref={ref} className="r-metric__val">
      {prefix}{shown}<span className="u">{suffix}</span>
    </span>
  );
};
