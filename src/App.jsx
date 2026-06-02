/* App.jsx — fixed-sidebar layout: left rail (identity + scroll-spy nav +
   contact) with the section components scrolling in the main column.
   Deep-links: /#data, /#privacy, /#activity, /#notes scroll to and flash
   the matching experiment, so a LinkedIn post can link straight to one. */
import { useState, useEffect } from "react"; // useState used by useScrollSpy
import { RESUME as R } from "./resume-data.js";
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

// Mobile-only sticky top bar with a hamburger that opens a slide-down nav panel.
const MobileBar = ({ active }) => {
  const [open, setOpen] = useState(false);

  // lock body scroll while the menu is open; close on Escape
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <header className="r-mbar" data-open={open}>
      <div className="r-mbar__top">
        <a href="#lead" className="r-mbar__brand" onClick={() => setOpen(false)}>
          <span className="r-monogram">{R.person.monogram}</span>
          <span className="r-mbar__name">{R.person.shortName}</span>
        </a>
        <button
          type="button"
          className="r-mbar__toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="r-mbar__bars" aria-hidden="true"><i></i><i></i><i></i></span>
        </button>
      </div>
      <nav className="r-mbar__panel" aria-hidden={!open}>
        {SIDE_NAV.map((s) => (
          <a
            key={s.id}
            href={"#" + s.id}
            className="r-mbar__link"
            data-active={active === s.id}
            onClick={() => setOpen(false)}
          >
            {s.label}
          </a>
        ))}
      </nav>
      <button
        type="button"
        className="r-mbar__scrim"
        aria-hidden="true"
        tabIndex={-1}
        onClick={() => setOpen(false)}
      ></button>
    </header>
  );
};

export default function App() {
  const active = useScrollSpy(SIDE_NAV.map((s) => s.id));

  // deep-link handling: scroll to the targeted experiment and flash it.
  // The flash is applied imperatively (add class, remove on animationend) so
  // it replays reliably on every navigation, independent of React batching.
  useEffect(() => {
    const go = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash) return;
      const el = document.getElementById(hash);
      if (!el) return;
      // let layout settle (fonts, reveals) before scrolling
      window.requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      if (EXPERIMENT_ANCHORS.has(hash)) {
        // restart the animation: drop the attribute, force reflow, re-add it
        el.removeAttribute("data-flash");
        void el.offsetWidth; // reflow so the animation can replay
        el.setAttribute("data-flash", "true");
        const clear = () => el.removeAttribute("data-flash");
        el.addEventListener("animationend", clear, { once: true });
        // failsafe in case animationend doesn't fire (reduced-motion, etc.)
        window.setTimeout(clear, 2200);
      }
    };
    // initial load (after a tick so the DOM exists)
    const t = window.setTimeout(go, 200);
    window.addEventListener("hashchange", go);
    return () => { window.clearTimeout(t); window.removeEventListener("hashchange", go); };
  }, []);

  return (
    <div className="r-shell">
      <MobileBar active={active} />
      <Sidebar active={active} />
      <main className="r-main">
        <Lead />
        <Metrics />
        <AIPortfolio />
        <Experience />
        <Projects />
        <Community />
        <Skills />
        <Credentials />
        <Footer />
      </main>
    </div>
  );
}
