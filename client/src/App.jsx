import { useEffect, useMemo, useState } from "react";
import { articleTitle, getNews } from "./api";
import "./App.css";

const HERO_IMAGE = "/hero-nicaragua.jpg";

function uniqueSources(articles) {
  return [...new Set(articles.map((article) => article.source).filter(Boolean))].sort();
}

export default function App() {
  const [articles, setArticles] = useState([]);
  const [activeSource, setActiveSource] = useState("All");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  const load = async ({ refresh = false } = {}) => {
    setStatus((current) => (current === "ready" ? "refreshing" : "loading"));
    setError("");
    try {
      const data = await getNews({ refresh });
      setArticles(data);
      setUpdatedAt(new Date());
      setStatus("ready");
    } catch (err) {
      setError(err.message || "Could not load headlines.");
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sources = useMemo(() => ["All", ...uniqueSources(articles)], [articles]);

  const visibleArticles = useMemo(() => {
    const filtered =
      activeSource === "All"
        ? articles
        : articles.filter((article) => article.source === activeSource);
    return filtered;
  }, [articles, activeSource]);

  const featured = visibleArticles[0];
  const rest = visibleArticles.slice(1);

  return (
    <div className="page">
      <header className="hero">
        <div className="hero__media" aria-hidden="true">
          <img src={HERO_IMAGE} alt="" className="hero__image" />
          <div className="hero__veil" />
        </div>

        <div className="hero__content">
          <p className="hero__kicker">English-language headlines</p>
          <h1 className="hero__brand">Nicaragua News</h1>
          <p className="hero__lede">
            Global reporting on Nicaragua, gathered from major newsrooms into
            one calm reading room.
          </p>
          <div className="hero__actions">
            <a className="button button--primary" href="#headlines">
              Read today&apos;s headlines
            </a>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => load({ refresh: true })}
              disabled={status === "loading" || status === "refreshing"}
            >
              {status === "refreshing" ? "Refreshing…" : "Refresh feed"}
            </button>
          </div>
        </div>
      </header>

      <main className="shell" id="headlines">
        <section className="toolbar">
          <div>
            <h2>Headlines</h2>
            <p className="toolbar__meta">
              {status === "loading" && "Fetching sources…"}
              {status === "ready" &&
                `${visibleArticles.length} stories${
                  updatedAt
                    ? ` · updated ${updatedAt.toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}`
                    : ""
                }`}
              {status === "refreshing" && "Refreshing in the background…"}
              {status === "error" && "Could not reach the news API"}
            </p>
          </div>

          <div className="source-nav" role="tablist" aria-label="Filter by source">
            {sources.map((source) => (
              <button
                key={source}
                type="button"
                role="tab"
                aria-selected={activeSource === source}
                className={
                  activeSource === source
                    ? "source-nav__item is-active"
                    : "source-nav__item"
                }
                onClick={() => setActiveSource(source)}
              >
                {source}
              </button>
            ))}
          </div>
        </section>

        {error && (
          <div className="banner banner--error" role="alert">
            <p>{error}</p>
            <button type="button" className="button button--ghost" onClick={() => load()}>
              Try again
            </button>
          </div>
        )}

        {status === "loading" && (
          <div className="skeleton-stack" aria-hidden="true">
            <div className="skeleton skeleton--feature" />
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
          </div>
        )}

        {status !== "loading" && !error && visibleArticles.length === 0 && (
          <div className="empty">
            <h3>No headlines yet</h3>
            <p>Some sources may be blocked or empty. Try refreshing the feed.</p>
          </div>
        )}

        {featured && (
          <a
            className="feature"
            href={featured.url}
            target="_blank"
            rel="noreferrer"
          >
            <div className="feature__copy">
              <span className="eyebrow">{featured.source}</span>
              <h3>{articleTitle(featured)}</h3>
              <span className="feature__cta">Open article</span>
            </div>
          </a>
        )}

        <section className="feed" aria-live="polite">
          {rest.map((article, index) => (
            <a
              key={`${article.url}-${index}`}
              className="story"
              href={article.url}
              target="_blank"
              rel="noreferrer"
              style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
            >
              <span className="story__source">{article.source}</span>
              <span className="story__title">{articleTitle(article)}</span>
              <span className="story__arrow" aria-hidden="true">
                →
              </span>
            </a>
          ))}
        </section>
      </main>

      <footer className="footer">
        <p>
          Powered by the Nicaragua-en-English API · Sources across Al Jazeera,
          BBC, Independent, DW, and more.
        </p>
      </footer>
    </div>
  );
}
