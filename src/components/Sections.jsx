/* Sections.jsx — section components for the fixed-sidebar layout. */
import { useState } from "react";
import { RESUME as R } from "../resume-data.js";
import { BADGE_IMG } from "../badges.js";
import { Reveal, Counter } from "./Primitives.jsx";
import { ArchDiagram } from "./ArchDiagram.jsx";
import { Timeline } from "./Timeline.jsx";

export const SectionHead = ({ eyebrow, title, lede }) => (
  <Reveal>
    {eyebrow && <p className="r-eyebrow">{eyebrow}</p>}
    <h2 className="r-h2">{title}</h2>
    {lede && <p className="r-lede">{lede}</p>}
  </Reveal>
);

export const Lead = () => (
  <section className="r-section r-lead" id="lead" data-screen-label="Intro">
    <div className="r-wrap">
      <Reveal>
        {R.intro.map((p, i) => <p key={i} className="r-lead__p">{p}</p>)}
      </Reveal>
    </div>
  </section>
);

export const Metrics = () => (
  <section className="r-metrics">
    <div className="r-metrics__grid">
      {R.metrics.map((m, i) => (
        <Reveal key={i} className="r-metric">
          <Counter value={m.value} prefix={m.prefix || ""} suffix={m.suffix || ""} decimals={m.decimals || 0} />
          <div className="r-metric__label">{m.label}</div>
        </Reveal>
      ))}
    </div>
  </section>
);

const SITE_ORIGIN = "https://bharatrameshwar.com";

// Copy-link button for an experiment's deep-link. Shows a brief "Copied" state.
const CopyLink = ({ anchor }) => {
  const [copied, setCopied] = useState(false);
  const url = `${SITE_ORIGIN}/#${anchor}`;
  const legacyCopy = () => {
    try {
      const ta = document.createElement("textarea");
      ta.value = url; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.focus(); ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  };
  const flash = () => { setCopied(true); window.setTimeout(() => setCopied(false), 1600); };
  const copy = async () => {
    // Prefer the async Clipboard API; fall back to execCommand if it rejects
    // (older browsers, or contexts without clipboard permission).
    if (navigator.clipboard?.writeText) {
      try { await navigator.clipboard.writeText(url); flash(); return; }
      catch { /* fall through to legacy */ }
    }
    if (legacyCopy()) flash();
  };
  return (
    <button
      type="button"
      className="r-copylink"
      data-copied={copied}
      onClick={copy}
      title={`Copy link to this experiment (${url})`}
      aria-label={`Copy link to this experiment: ${url}`}
    >
      {copied ? (
        <>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" /></svg>
          Copied
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6.5 9.5a2.6 2.6 0 0 0 3.8.2l2-2a2.6 2.6 0 0 0-3.7-3.7l-1 1" /><path d="M9.5 6.5a2.6 2.6 0 0 0-3.8-.2l-2 2a2.6 2.6 0 0 0 3.7 3.7l1-1" /></svg>
          Copy link
        </>
      )}
    </button>
  );
};

const Experiment = ({ e, idx }) => (
  <Reveal
    className="r-expb"
    id={e.anchor}
    style={{ borderTop: idx > 0 ? "1px solid var(--line-1)" : "none" }}
  >
    <div className="r-expb__head">
      <div className="r-exp__tag">{e.tag}</div>
      <CopyLink anchor={e.anchor} />
      <h3 className="r-expb__name">{e.name}</h3>
      {e.link && <a className="r-expb__repo" href={e.link} target="_blank" rel="noopener">View the repository ↗</a>}
    </div>
    <div className="r-expb__intro">
      <div>
        <div className="r-exp__role">The problem</div>
        <p>{e.problem}</p>
      </div>
      <div>
        <div className="r-exp__role">The approach</div>
        <p>{e.approach}</p>
      </div>
    </div>
    <div className="r-expb__tech">
      {e.techniques.map((t) => <span key={t} className="r-techchip">{t}</span>)}
    </div>
    <div className="r-expb__diagram">
      <div className="r-expb__diagram-cap">The architecture · select any node</div>
      <ArchDiagram diagram={e.diagram} />
    </div>
    <p className="r-exp__lesson">{e.lesson}</p>
  </Reveal>
);

export const AIPortfolio = () => {
  const a = R.aiPortfolio;
  return (
    <section className="r-section" id="ai" data-screen-label="AI portfolio">
      <div className="r-wrap r-wrap--wide">
        <SectionHead eyebrow={a.eyebrow} title={a.title} lede={a.lede} />
        <div className="r-expb-list">
          {a.experiments.map((e, i) => (
            <Experiment key={e.id} e={e} idx={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export const Experience = () => (
  <section className="r-section" id="experience" data-screen-label="Career timeline">
    <div className="r-wrap r-wrap--wide">
      <SectionHead eyebrow="The long arc" title="Twenty years, one continuous thread." lede="From load-testing scripts to AI architecture. Drag through the years to follow the work." />
      <Reveal><Timeline roles={R.timeline} /></Reveal>
    </div>
  </section>
);

const ProjectCard = ({ p }) => {
  const [open, setOpen] = useState(false);
  return (
    <Reveal className="r-proj" as="div">
      <div data-open={open} onClick={() => setOpen((v) => !v)} style={{ position: "relative" }}>
        <span className="r-proj__toggle">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="8" y1="3" x2="8" y2="13" /><line x1="3" y1="8" x2="13" y2="8" /></svg>
        </span>
        <div className="r-proj__industry">{p.industry}</div>
        <div className="r-proj__name">{p.name}</div>
        <div className="r-proj__meta">{p.span} · {p.role}</div>
        <div className="r-proj__blurb" style={{ maxHeight: open ? 320 : 0, opacity: open ? 1 : 0, marginTop: open ? 14 : 0 }}>
          {p.blurb}
          <div className="r-proj__stack">
            {p.stack.map((s) => <span key={s}>{s}</span>)}
          </div>
          {p.link && (
            <a className="r-proj__link" href={p.link} target="_blank" rel="noopener" onClick={(ev) => ev.stopPropagation()}>
              View the repository ↗
            </a>
          )}
        </div>
      </div>
    </Reveal>
  );
};

export const Projects = () => (
  <section className="r-section" id="projects" data-screen-label="Projects">
    <div className="r-wrap r-wrap--wide">
      <SectionHead eyebrow="Selected delivery" title="Shipped, across industries." lede="A sample of custom solutions delivered end to end. Client names withheld; the shape of the work is the point. Tap a card to open it." />
      <div className="r-proj-grid">
        {R.projects.map((p) => <ProjectCard key={p.id} p={p} />)}
      </div>
    </div>
  </section>
);

export const Community = () => (
  <section className="r-section" id="community" data-screen-label="Community">
    <div className="r-wrap r-wrap--wide">
      <SectionHead eyebrow="Outside the day job" title="Built for the community." lede="A few things made for people rather than for a client, and the personal tooling that doubles as a proving ground." />
      <div className="r-comm-grid">
        {R.community.map((c) => (
          <Reveal key={c.id} className="r-comm" as="div">
            <div className="r-comm__name">{c.name}</div>
            <p className="r-comm__blurb">{c.blurb}</p>
            <div className="r-comm__stack">
              {c.stack.map((s) => <span key={s}>{s}</span>)}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export const Skills = () => (
  <section className="r-section r-pipe" id="skills" data-screen-label="Skills">
    <div className="r-wrap r-wrap--wide">
      <SectionHead eyebrow="Capabilities" title="Where I go deep." />
      <div className="r-skills-grid">
        {R.skillGroups.map((g) => (
          <Reveal key={g.id} className="r-skillcol">
            <h4>{g.name}</h4>
            <ul>{g.items.map((s) => <li key={s}>{s}</li>)}</ul>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export const Credentials = () => (
  <section className="r-section" id="credentials" data-screen-label="Credentials">
    <div className="r-wrap r-wrap--wide">
      <SectionHead eyebrow="Certified" title="Credentials and foundations." lede="Verified badges across SAP, Solace, and Google, backed by the wider certification track." />
      <div className="r-badges">
        {R.badges.map((b) => (
          <Reveal key={b.img} className="r-badge" as="div">
            <div className="r-badge__img"><img src={BADGE_IMG[b.img]} alt={b.name} loading="lazy" /></div>
            <div className="r-badge__name">{b.name}</div>
            <div className="r-badge__issuer">{b.issuer}</div>
          </Reveal>
        ))}
      </div>
      <div className="r-cert-grid">
        {R.certifications.map((c) => (
          <Reveal key={c.group} className="r-cert">
            <h4>{c.group}</h4>
            <ul>{c.items.map((i) => <li key={i}>{i}</li>)}</ul>
          </Reveal>
        ))}
      </div>
      <Reveal className="r-edu">
        <div>
          <div className="r-edu__deg">{R.education.degree}</div>
          <div className="r-edu__school">{R.education.school}</div>
        </div>
        <div className="r-edu__span">{R.education.span}</div>
      </Reveal>
    </div>
  </section>
);

export const Footer = () => (
  <footer className="r-foot" data-screen-label="Footer">
    <div className="r-foot__inner">
      <p className="r-foot__quote">{R.closing}</p>
      <div className="r-foot__contact">
        <a href={"mailto:" + R.person.email}>{R.person.email}</a>
        <a href={"https://" + R.person.linkedin} target="_blank" rel="noopener">{R.person.linkedin}</a>
        <span>{R.person.location}</span>
      </div>
      <div className="r-foot__rule"></div>
      <div className="r-foot__fine">{R.person.name} · {R.person.title}</div>
    </div>
  </footer>
);
