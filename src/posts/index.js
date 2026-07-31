/* ──────────────────────────────────────────────────────────────────────
 * posts/index.js
 * Loads every Markdown post in this folder, parses its frontmatter, and
 * exposes the collection sorted newest-first plus a by-slug lookup.
 *
 * Authoring a post = drop a new <slug>.md file in this folder with the
 * frontmatter block at the top. Nothing else to register.
 *
 * Frontmatter is a small YAML-ish block fenced by --- at the top of the
 * file. We parse only flat "key: value" pairs (no nesting, no lists), which
 * is all a post needs and avoids pulling a Node-only YAML parser into the
 * browser bundle.
 * ──────────────────────────────────────────────────────────────────── */

// Vite: eagerly import every .md in this folder as a raw string.
const FILES = import.meta.glob("./*.md", { query: "?raw", import: "default", eager: true });

// Split a raw file into its frontmatter object and the Markdown body.
function parse(raw) {
  const match = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/.exec(raw);
  if (!match) return { meta: {}, body: raw.trim() };

  const meta = {};
  for (const line of match[1].split("\n")) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();
    // strip surrounding quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key) meta[key] = value;
  }
  return { meta, body: match[2].trim() };
}

// Estimate reading time from the body if not given explicitly (200 wpm).
function readingTime(body) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// Derive a slug from the file path, e.g. "./what-is-ai.md" -> "what-is-ai".
function slugFromPath(path) {
  return path.replace(/^\.\//, "").replace(/\.md$/, "");
}

export const POSTS = Object.entries(FILES)
  .map(([path, raw]) => {
    const { meta, body } = parse(raw);
    const slug = meta.slug || slugFromPath(path);
    return {
      slug,
      title: meta.title || slug,
      date: meta.date || "",
      summary: meta.summary || "",
      readingTime: meta.readingTime ? Number(meta.readingTime) : readingTime(body),
      body,
    };
  })
  // newest first; ISO date strings sort lexicographically
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

export function getPost(slug) {
  return POSTS.find((p) => p.slug === slug) || null;
}

// Human-friendly date, e.g. "2026-06-12" -> "12 June 2026". UK/AU order.
export function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${d} ${months[m - 1]} ${y}`;
}
