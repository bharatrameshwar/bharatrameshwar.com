/* Timeline.jsx — scrubbable career axis + expanding role detail. */
import { useState, useRef, useCallback, useEffect } from "react";

const TL_MIN = 2006;
const TL_MAX = 2026;
const TL_SPAN = TL_MAX - TL_MIN;
const pct = (yr) => ((yr - TL_MIN) / TL_SPAN) * 100;

export const Timeline = ({ roles }) => {
  const [year, setYear] = useState(TL_MAX - 0.5);
  const axisRef = useRef(null);
  const dragging = useRef(false);

  const activeRole = (() => {
    const found = roles.find((r) => year >= r.start && year <= (r.end ?? TL_MAX));
    return found || roles[0];
  })();

  const setFromClientX = useCallback((clientX) => {
    const el = axisRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pad = 18;
    const x = Math.max(pad, Math.min(rect.width - pad, clientX - rect.left));
    const ratio = (x - pad) / (rect.width - pad * 2);
    setYear(TL_MIN + ratio * TL_SPAN);
  }, []);

  useEffect(() => {
    const move = (e) => { if (dragging.current) { setFromClientX(e.touches ? e.touches[0].clientX : e.clientX); e.preventDefault(); } };
    const up = () => { dragging.current = false; };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, [setFromClientX]);

  const jumpToRole = (r) => {
    const end = r.end ?? TL_MAX;
    setYear((r.start + end) / 2);
  };

  const years = [];
  for (let y = TL_MIN; y <= TL_MAX; y += 2) years.push(y);

  return (
    <div className="r-tl__scrub">
      <div
        className="r-tl__axis"
        ref={axisRef}
        onMouseDown={(e) => { dragging.current = true; setFromClientX(e.clientX); }}
        onTouchStart={(e) => { dragging.current = true; setFromClientX(e.touches[0].clientX); }}
      >
        {roles.map((r) => {
          const start = r.start, end = r.end ?? TL_MAX;
          const left = pct(start), width = Math.max(pct(end) - pct(start), 3.5);
          const active = r.id === activeRole.id;
          const row = r.id === "fellow" ? 1 : 0;
          return (
            <div
              key={r.id}
              className="r-tl__bar"
              data-active={active}
              style={{
                left: `calc(${left}% )`,
                width: `calc(${width}% - 4px)`,
                top: 18 + row * 0,
                zIndex: active ? 3 : 1,
                opacity: row === 1 && !active ? 0.55 : 1,
              }}
              onClick={(e) => { e.stopPropagation(); jumpToRole(r); }}
              title={r.role}
            >
              <span>{(r.org === "SAP Australia" ? "SAP AU" : r.org === "SAP Labs India" ? "SAP Labs India" : r.org === "Infosys Technologies" ? "Infosys" : r.org)} · {r.range}</span>
            </div>
          );
        })}

        <div className="r-tl__head" style={{ left: `calc(${Math.max(0, Math.min(100, pct(year)))}% )` }}></div>

        <div className="r-tl__ticks">
          {years.map((y) => (
            <span key={y} className="r-tl__tick" style={{ left: `${pct(y)}%` }}>{`'${String(y).slice(2)}`}</span>
          ))}
        </div>
      </div>
      <div className="r-tl__hint">Drag the marker across the years, or tap a span. Showing {Math.round(year)}.</div>

      <div className="r-role r-anim-in" key={activeRole.id}>
        <div className="r-role__top">
          <div>
            <div className="r-role__org">{activeRole.org}</div>
            <div className="r-role__role">{activeRole.role}</div>
            {activeRole.sub && <div className="r-role__sub">{activeRole.sub}</div>}
          </div>
          <div className="r-role__range">{activeRole.range}</div>
        </div>
        <p className="r-role__summary">{activeRole.summary}</p>
        <ul className="r-role__points">
          {activeRole.points.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
        <div className="r-tags">
          {activeRole.tags.map((t) => <span key={t} className="r-tag">{t}</span>)}
        </div>
      </div>
    </div>
  );
};
