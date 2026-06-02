/* App.jsx — fixed-sidebar layout: left rail (identity + scroll-spy nav +
   contact) with the section components scrolling in the main column.
   Deep-links: /#estate, /#privacy, /#activity, /#notes scroll to and flash
   the matching experiment, so a LinkedIn post can link straight to one. */
import { useState, useEffect } from "react"; // useState used by useScrollSpy
import { RESUME as R } from "./resume-data.js";
import {
  Lead, Metrics, AIPortfolio, Journey, Projects, Skills, Credentials, Footer,
} from "./components/Sections.jsx";
import "./styles/tokens.css";
import "./styles/resume.css";
import "./styles/resume-sidebar.css";

const SIDE_NAV = [
  { id: "lead", label: "Intro" },
  { id: "ai", label: "AI work" },
  { id: "journey", label: "Journey" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "credentials", label: "Credentials" },
];

// anchors that live inside the AI section and should deep-link + flash
const EXPERIMENT_ANCHORS = new Set(["estate", "privacy", "activity", "notes"]);

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
      <Sidebar active={active} />
      <main className="r-main">
        <Lead />
        <Metrics />
        <AIPortfolio />
        <Journey />
        <Projects />
        <Skills />
        <Credentials />
        <Footer />
      </main>
    </div>
  );
}
