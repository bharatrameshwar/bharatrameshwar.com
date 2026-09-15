/* ──────────────────────────────────────────────────────────────────────
 * Blog.jsx
 * The writing section: an index of posts at /blog and a reading page at
 * /blog/:slug. Inherits the site's paper / ink / olive language; styles
 * live in styles/blog.css. Posts are Markdown files in src/posts/.
 * ──────────────────────────────────────────────────────────────────── */
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { RESUME as R } from "../resume-data.js";
import { POSTS, getPost, formatDate } from "../posts/index.js";

const SITE_TITLE = "Bharat Rameshwar";

// Set the document title and meta description for a blog page, restoring
// the site defaults on unmount so the resume route is unaffected.
function usePageMeta(title, description) {
  useEffect(() => {
    const prevTitle = document.title;
    const tag = document.querySelector('meta[name="description"]');
    const prevDesc = tag ? tag.getAttribute("content") : null;
    if (title) document.title = title;
    if (tag && description) tag.setAttribute("content", description);
    window.scrollTo(0, 0);
    return () => {
      document.title = prevTitle;
      if (tag && prevDesc != null) tag.setAttribute("content", prevDesc);
    };
  }, [title, description]);
}

// Shared top bar across the writing section: name links home, plus a quiet
// label for where you are.
const Masthead = ({ crumb }) => (
  <header className="b-top">
    <Link to="/" className="b-top__home">
      <span className="b-monogram">{R.person.monogram}</span>
      <span className="b-top__name">{SITE_TITLE}</span>
    </Link>
    <nav className="b-top__nav">
      <Link to="/" className="b-top__link">Home</Link>
      <Link to="/blog" className="b-top__link" data-here={crumb === "blog"}>Writing</Link>
    </nav>
  </header>
);

const PostCard = ({ post }) => (
  <Link to={`/blog/${post.slug}`} className="b-card">
    <div className="b-card__meta">
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      <span className="b-card__dot" aria-hidden="true">·</span>
      <span>{post.readingTime} min read</span>
    </div>
    <h2 className="b-card__title">{post.title}</h2>
    <p className="b-card__summary">{post.summary}</p>
    <span className="b-card__more">Read<span aria-hidden="true"> →</span></span>
  </Link>
);

export function BlogIndex() {
  usePageMeta(
    `Writing · ${SITE_TITLE}`,
    "Plain-English writing on AI for everyone: what it is, how to use it, and how it can quietly make ordinary life easier."
  );
  return (
    <div className="b-shell">
      <Masthead crumb="blog" />
      <main className="b-main">
        <div className="b-intro">
          <p className="r-eyebrow">Writing</p>
          <h1 className="b-intro__title">AI, in plain English</h1>
          <p className="b-intro__lede">
            Most writing about AI is aimed at people who already work in technology. This is not.
            These are short, jargon-free pieces for everyone else: what these tools actually are,
            how to use them well, how to move past the one everybody has heard of, and the small
            everyday ways they can make life a little easier.
          </p>
        </div>
        <ul className="b-list">
          {POSTS.map((post) => (
            <li key={post.slug}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      </main>
      <footer className="b-foot">
        <Link to="/" className="b-foot__back"><span aria-hidden="true">← </span>Back to {SITE_TITLE}</Link>
      </footer>
    </div>
  );
}

export function BlogPost() {
  const { slug } = useParams();
  const post = getPost(slug);

  usePageMeta(
    post ? `${post.title} · ${SITE_TITLE}` : `Not found · ${SITE_TITLE}`,
    post ? post.summary : ""
  );

  if (!post) {
    return (
      <div className="b-shell">
        <Masthead />
        <main className="b-main b-main--narrow">
          <div className="b-missing">
            <h1 className="b-missing__title">That post does not exist</h1>
            <p>The link may be wrong, or the piece may have moved.</p>
            <Link to="/blog" className="b-foot__back">See all writing</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="b-shell">
      <Masthead />
      <main className="b-main b-main--narrow">
        <article className="b-article">
          <div className="b-article__meta">
            <Link to="/blog" className="b-article__crumb"><span aria-hidden="true">← </span>Writing</Link>
            <span className="b-card__dot" aria-hidden="true">·</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span className="b-card__dot" aria-hidden="true">·</span>
            <span>{post.readingTime} min read</span>
          </div>
          <h1 className="b-article__title">{post.title}</h1>
          <div className="b-prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
          </div>
        </article>
        <div className="b-article__end">
          <Link to="/blog" className="b-foot__back"><span aria-hidden="true">← </span>All writing</Link>
        </div>
      </main>
    </div>
  );
}
