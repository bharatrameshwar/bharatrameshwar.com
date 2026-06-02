/* App.jsx — fixed-sidebar layout on desktop; tabbed single-section view on
   mobile (identity header + dropdown, one section shown at a time).
   Deep-links: /#data, /#privacy, /#activity, /#notes scroll to and flash
   the matching experiment, and on mobile open the section that contains it. */
import { useState, useEffect } from "react";
import { RESUME as R } from "./resume-data.js";
import { useIsMobile } from "./components/Primitives.jsx";
import {
  Lead, Metrics, AIPortfolio, Experience, Projects, Community, Skills, Credentials, Footer,
} from "./components/Sections.jsx";
import "./styles/tokens.css";
import "./styles/resume.css";
import "./styles/resume-sidebar.css";
import "./styles/mobile.css";

const SIDE_NAV = [
  { id: "lead", label: "Intro" },
  { id: "ai", label: "AI Experiments" },
  { id: "experience", label: "Work Experience" },
  { id: "projects", label: "Projects" },
  { id: "community", label: "Community" },
  { id: "skills", label: "Skills" },
  { id: "credentials", label: "Credentials" },
];

// anchors that live inside the AI section and should deep-link + flash
const EXPERIMENT_ANCHORS = new Set(["data", "privacy", "activity", "notes"]);

// every deep-link / section id maps to the mobile tab that contains it
const TAB_FOR_HASH = {
  lead: "lead", top: "lead",
  ai: "ai", data: "ai", privacy: "ai", activity: "ai", notes: "ai",
  experience: "experience",
  projects: "projects",
  community: "community",
  skills: "skills",
  credentials: "credentials",
};

function useScrollSpy(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [ids]);
  return active;
}

const Sidebar = ({ active }) => (
  <aside className="r-side">
    <div>
      <span className="r-monogram r-monogram--lg">{R.person.monogram}</span>
      <p className="r-eyebrow" style={{ marginTop: 22 }}>SAP BTP · Data · Applied AI</p>
      <h1 className="r-side__name">{R.person.name}</h1>
      <p className="r-side__tag">{R.person.tagline}</p>
    </div>
    <nav className="r-side__nav">
      {SIDE_NAV.map((s) => (
        <a key={s.id} href={"#" + s.id} className="r-side__link" data-active={active === s.id}>
          <span className="r-side__tick"></span>{s.label}
        </a>
      ))}
    </nav>
    <div className="r-side__foot">
      <a href={"mailto:" + R.person.email}>{R.person.email}</a>
      <a href={"https://" + R.person.linkedin} target="_blank" rel="noopener">LinkedIn</a>
      <span className="r-side__loc">{R.person.location}</span>
    </div>
  </aside>
);

// Mobile-only sticky header: identity (monogram + name) + a custom dropdown
// that selects which single section is shown.
const MobileNav = ({ section, onSelect }) => {
  const [open, setOpen] = useState(false);
  const current = SIDE_NAV.find((s) => s.id === section) || SIDE_NAV[0];

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const pick = (id) => { setOpen(false); onSelect(id); };

  return (
    <header className="r-mnav">
      <div className="r-mnav__top">
        <button type="button" className="r-mnav__brand" onClick={() => pick("lead")} aria-label="Go to intro">
          <span className="r-monogram">{R.person.monogram}</span>
          <span className="r-mnav__name">{R.person.shortName}</span>
        </button>
      </div>
      <div className="r-mnav__select" data-open={open}>
        <button
          type="button"
          className="r-mnav__current"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span>{current.label}</span>
          <svg className="r-mnav__chev" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 6l4 4 4-4" /></svg>
        </button>
        {open && (
          <ul className="r-mnav__menu" role="listbox">
            {SIDE_NAV.map((s) => (
              <li key={s.id} role="option" aria-selected={s.id === section}>
                <button type="button" className="r-mnav__opt" data-active={s.id === section} onClick={() => pick(s.id)}>
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {open && <button type="button" className="r-mnav__scrim" aria-hidden="true" tabIndex={-1} onClick={() => setOpen(false)}></button>}
    </header>
  );
};

// Tab wrapper: invisible on desktop (display:contents), shows only when its
// id matches the active mobile section.
const Tab = ({ id, current, children }) => (
  <div className="r-tabwrap" data-tab={id} data-active={id === current}>
    {children}
  </div>
);

// Mobile-only floating "back to top" button; appears after scrolling down.
const BackToTop = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      type="button"
      className="r-totop"
      data-show={show}
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 16V5M5 10l5-5 5 5" /></svg>
    </button>
  );
};

export default function App() {
  const active = useScrollSpy(SIDE_NAV.map((s) => s.id));
  const isMobile = useIsMobile();
  const [mobileSection, setMobileSection] = useState("lead");

  // mobile: switch the visible section, scroll to top, clear any stale hash
  const selectSection = (id) => {
    setMobileSection(id);
    if (window.location.hash) history.replaceState(null, "", window.location.pathname + window.location.search);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
  };

  // deep-link handling: on mobile, open the section containing the target
  // first, then scroll to + flash the element. On desktop, just scroll + flash.
  useEffect(() => {
    const go = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash) return;
      const tab = TAB_FOR_HASH[hash];
      // ensure the right section is visible on mobile before measuring/scrolling
      if (tab) setMobileSection(tab);
      // wait a frame so the section is rendered/visible, then scroll to target
      window.setTimeout(() => {
        const el = document.getElementById(hash);
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        if (EXPERIMENT_ANCHORS.has(hash)) {
          el.removeAttribute("data-flash");
          void el.offsetWidth; // reflow so the animation can replay
          el.setAttribute("data-flash", "true");
          const clear = () => el.removeAttribute("data-flash");
          el.addEventListener("animationend", clear, { once: true });
          window.setTimeout(clear, 2200);
        }
      }, 80);
    };
    const t = window.setTimeout(go, 200);
    window.addEventListener("hashchange", go);
    return () => { window.clearTimeout(t); window.removeEventListener("hashchange", go); };
  }, []);

  // active tab follows scroll-spy on desktop, explicit selection on mobile
  const current = isMobile ? mobileSection : active;

  return (
    <div className="r-shell" data-mobile-tabs={isMobile ? "true" : "false"}>
      <MobileNav section={mobileSection} onSelect={selectSection} />
      <Sidebar active={active} />
      <main className="r-main">
        <Tab id="lead" current={current}>
          <Lead />
          <Metrics />
        </Tab>
        <Tab id="ai" current={current}><AIPortfolio /></Tab>
        <Tab id="experience" current={current}><Experience /></Tab>
        <Tab id="projects" current={current}><Projects /></Tab>
        <Tab id="community" current={current}><Community /></Tab>
        <Tab id="skills" current={current}><Skills /></Tab>
        <Tab id="credentials" current={current}>
          <Credentials />
          <Footer />
        </Tab>
      </main>
      <BackToTop />
    </div>
  );
}
