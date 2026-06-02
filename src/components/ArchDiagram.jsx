/* ArchDiagram.jsx — interactive layered architecture diagram.
   Desktop: SVG edges + spatially positioned node cards.
   Mobile (<820px): the same nodes as a vertical stacked flow grouped by lane,
   each tappable for the same detail. No horizontal scroll. */
import { useState } from "react";
import { useIsMobile } from "./Primitives.jsx";

const KIND_LABEL = {
  ingest: "Source / ingest",
  guard: "Guard",
  process: "Transform",
  data: "Structured data",
  store: "Store",
  cloud: "Cloud / external",
  output: "Output",
};

export const ArchDiagram = ({ diagram }) => {
  const [active, setActive] = useState(diagram.nodes[0].id);
  const isMobile = useIsMobile();
  const W = diagram.w, H = diagram.h;
  const byId = {};
  diagram.nodes.forEach((n) => { byId[n.id] = n; });
  // active can be null on mobile (collapsed); the desktop detail panel always
  // needs a node, so fall back to the first.
  const node = byId[active] || diagram.nodes[0];

  const usedKinds = Array.from(new Set(diagram.nodes.map((n) => n.kind)));

  // shared detail panel (identical for both layouts)
  const detail = (
    <div className="r-diagram__detail" key={node.id}>
      <div className="r-anim-in">
        <div className="r-dnode__kind-row">
          <span className={`r-dnode__kind k-${node.kind}`}></span>
          <h4>{node.label}</h4>
        </div>
        <div className="r-detail-eyebrow is-keep">{diagram.detailLabels.a}</div>
        <p>{node.a}</p>
      </div>
      <div className="r-anim-in">
        <div className="r-detail-eyebrow is-rej">{diagram.detailLabels.b}</div>
        <p style={{ marginTop: 0 }}>{node.b}</p>
      </div>
      {node.tech && (
        <div className="r-diagram__tech r-anim-in">
          <span className="r-tech-label">How</span>
          <code>{node.tech}</code>
        </div>
      )}
    </div>
  );

  const legend = (
    <div className="r-legend">
      {usedKinds.map((k) => (
        <span key={k}><i className={`k-${k}`}></i>{KIND_LABEL[k] || k}</span>
      ))}
    </div>
  );

  // ── mobile: vertical stacked flow, nodes grouped by lane ──────────────
  if (isMobile) {
    const lanes = (diagram.lanes && diagram.lanes.length)
      ? diagram.lanes
      : [{ label: "", x: 0, w: W }];
    // assign each node to the lane whose horizontal band contains its centre
    const laneOf = (n) => {
      const cx = n.x + n.w / 2;
      let best = 0, bestDist = Infinity;
      lanes.forEach((ln, i) => {
        const lcx = ln.x + ln.w / 2;
        const d = Math.abs(cx - lcx);
        if (cx >= ln.x && cx <= ln.x + ln.w) { if (d < bestDist) { bestDist = d; best = i; } }
        else if (d < bestDist && bestDist === Infinity) { best = i; }
      });
      // fallback: nearest lane centre if it fell outside all bands
      if (bestDist === Infinity) {
        lanes.forEach((ln, i) => {
          const d = Math.abs(cx - (ln.x + ln.w / 2));
          if (d < bestDist) { bestDist = d; best = i; }
        });
      }
      return best;
    };
    const grouped = lanes.map(() => []);
    diagram.nodes.forEach((n) => { grouped[laneOf(n)].push(n); });
    // sort nodes within a lane by vertical position (top to bottom)
    grouped.forEach((g) => g.sort((a, b) => a.y - b.y));

    // detail shown INLINE under the tapped node (so the change is where the
    // finger is, not at the bottom of a long list)
    const inlineDetail = (n) => (
      <div className="r-stack__detail" key={`d-${n.id}`}>
        <div className="r-detail-eyebrow is-keep">{diagram.detailLabels.a}</div>
        <p>{n.a}</p>
        <div className="r-detail-eyebrow is-rej" style={{ marginTop: 14 }}>{diagram.detailLabels.b}</div>
        <p style={{ marginTop: 0 }}>{n.b}</p>
        {n.tech && (
          <div className="r-stack__tech">
            <span className="r-tech-label">How</span>
            <code>{n.tech}</code>
          </div>
        )}
      </div>
    );
    const toggle = (id) => setActive((cur) => (cur === id ? null : id));

    return (
      <div className="r-diagram r-diagram--stack">
        <div className="r-stack">
          {lanes.map((ln, i) => (
            grouped[i].length > 0 && (
              <div key={i} className="r-stack__lane">
                {ln.label && <div className="r-stack__lanelabel">{ln.label}</div>}
                <div className="r-stack__nodes">
                  {grouped[i].map((n) => {
                    const open = n.id === active;
                    return (
                      <div key={n.id} className="r-stack__item" data-open={open}>
                        <button
                          type="button"
                          className={`r-stack__node k-border-${n.kind}`}
                          data-active={open}
                          aria-expanded={open}
                          onClick={() => toggle(n.id)}
                        >
                          <span className={`r-dnode__kind k-${n.kind}`}></span>
                          <span className="r-stack__node-text">
                            <span className="r-dnode__label">{n.label}</span>
                            <span className="r-dnode__short">{n.short}</span>
                          </span>
                          <span className="r-stack__caret" data-open={open} aria-hidden="true">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6l4 4 4-4" /></svg>
                          </span>
                        </button>
                        {open && inlineDetail(n)}
                      </div>
                    );
                  })}
                </div>
                {i < lanes.length - 1 && grouped.slice(i + 1).some((g) => g.length) && (
                  <div className="r-stack__arrow" aria-hidden="true">
                    <svg width="14" height="18" viewBox="0 0 14 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 1v14M2 10l5 5 5-5" /></svg>
                  </div>
                )}
              </div>
            )
          ))}
        </div>
        {legend}
      </div>
    );
  }

  const anchor = (n, side) => {
    switch (side) {
      case "l": return { x: n.x, y: n.y + n.h / 2 };
      case "r": return { x: n.x + n.w, y: n.y + n.h / 2 };
      case "t": return { x: n.x + n.w / 2, y: n.y };
      case "b": return { x: n.x + n.w / 2, y: n.y + n.h };
      default:  return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
    }
  };
  const ctrl = (p, side, k = 58) => {
    switch (side) {
      case "l": return { x: p.x - k, y: p.y };
      case "r": return { x: p.x + k, y: p.y };
      case "t": return { x: p.x, y: p.y - k };
      case "b": return { x: p.x, y: p.y + k };
      default:  return p;
    }
  };

  // ── desktop: spatial SVG graph ────────────────────────────────────────
  return (
    <div className="r-diagram">
      <div className="r-diagram__scroll">
        <div className="r-diagram__canvas" style={{ aspectRatio: `${W} / ${H}` }}>
          {(diagram.lanes || []).map((ln, i) => (
            <div key={i} className="r-lane" data-alt={i % 2 === 0}
              style={{ left: `${(ln.x / W) * 100}%`, width: `${(ln.w / W) * 100}%` }}>
              <span className="r-lane__label">{ln.label}</span>
            </div>
          ))}
          <svg className="r-diagram__edges" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
            <defs>
              <marker id="arr" markerWidth="8" markerHeight="8" refX="6.5" refY="3.5" orient="auto" markerUnits="userSpaceOnUse">
                <path d="M0 0 L7 3.5 L0 7 Z" fill="var(--ink-4)" />
              </marker>
              <marker id="arrA" markerWidth="9" markerHeight="9" refX="6.5" refY="3.5" orient="auto" markerUnits="userSpaceOnUse">
                <path d="M0 0 L7 3.5 L0 7 Z" fill="var(--accent)" />
              </marker>
            </defs>
            {diagram.edges.map((e, i) => {
              const f = byId[e.from], t = byId[e.to];
              if (!f || !t) return null;
              const fs = e.fromSide || "r", ts = e.toSide || "l";
              const p1 = anchor(f, fs), p2 = anchor(t, ts);
              const c1 = ctrl(p1, fs), c2 = ctrl(p2, ts);
              const d = `M${p1.x} ${p1.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
              const on = e.from === active || e.to === active;
              return (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  stroke={on ? "var(--accent)" : "var(--ink-5)"}
                  strokeWidth={on ? 2 : 1.4}
                  strokeDasharray={e.dash ? "5 5" : "none"}
                  markerEnd={on ? "url(#arrA)" : "url(#arr)"}
                  vectorEffect="non-scaling-stroke"
                  style={{ transition: "stroke 140ms var(--ease-out)" }}
                />
              );
            })}
          </svg>

          {diagram.nodes.map((n) => (
            <button
              key={n.id}
              className={`r-dnode k-border-${n.kind}`}
              data-active={n.id === active}
              style={{ left: `${(n.x / W) * 100}%`, top: `${(n.y / H) * 100}%`, width: `${(n.w / W) * 100}%`, height: `${(n.h / H) * 100}%` }}
              onClick={() => setActive(n.id)}
            >
              <span className={`r-dnode__kind k-${n.kind}`}></span>
              <span className="r-dnode__label">{n.label}</span>
              <span className="r-dnode__short">{n.short}</span>
            </button>
          ))}
        </div>
      </div>

      {legend}
      {detail}
    </div>
  );
};
