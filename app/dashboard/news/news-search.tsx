"use client";

import { useEffect, useState } from "react";

import { formatDate } from "../_components/date";
import type { Article } from "../_components/types";
import { Card, EmptyState } from "../_components/ui";

const DEBOUNCE_MS = 300;
const SNIPPET_LENGTH = 160;
const PAGE_SIZE = 30;
// Backend caps /me/news at limit=200.
const MAX_LIMIT = 200;

// Some sources store raw HTML in `content` — strip tags and decode the
// entities that actually appear in feeds before showing a snippet.
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function snippet(content: string | null): string | null {
  if (!content) return null;
  const text = stripHtml(content);
  if (!text) return null;
  if (text.length <= SNIPPET_LENGTH) return text;
  return `${text.slice(0, SNIPPET_LENGTH).trimEnd()}…`;
}

export default function NewsSearch({
  initialArticles,
}: {
  initialArticles: Article[];
}) {
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    const controller = new AbortController();
    // Guards stale setState after this effect run is torn down (abort), so a
    // newer request can't be clobbered by an in-flight older one.
    let cancelled = false;

    // First page without a query is the server-rendered list — done inside the
    // timer so the effect never calls setState synchronously (cascading-render
    // lint).
    const timer = setTimeout(async () => {
      if (!trimmed && limit === PAGE_SIZE) {
        if (!cancelled) {
          setArticles(initialArticles);
          setError(null);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setLoading(true);
        setError(null);
      }
      try {
        const params = new URLSearchParams({ limit: String(limit) });
        if (trimmed) params.set("q", trimmed);
        const res = await fetch(`/api/proxy/me/news?${params}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          if (!cancelled) setError("No pudimos cargar las noticias.");
          return;
        }
        const body = (await res.json()) as Article[];
        if (!cancelled) setArticles(body);
      } catch (err) {
        if ((err as Error).name === "AbortError") return; // stale request
        if (!cancelled) setError("No pudimos cargar las noticias.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, limit, initialArticles]);

  // A full page suggests there may be more; a short page means we hit the end.
  const canLoadMore = articles.length >= limit && limit < MAX_LIMIT;

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <label htmlFor="news-search" className="sr-only">
          Buscar noticias
        </label>
        <input
          id="news-search"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setLimit(PAGE_SIZE); // new search starts from the first page
          }}
          placeholder="Buscar términos, frases…"
          className="w-full rounded-md border border-impakt-border bg-white px-3 py-2 text-sm text-impakt-ink focus:border-impakt-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-impakt-yellow focus-visible:ring-offset-1"
        />
        {loading && <p className="text-xs text-impakt-muted">Buscando…</p>}
        {error && <p className="text-sm text-impakt-red">{error}</p>}
      </div>

      {!loading && !error && articles.length === 0 && (
        <EmptyState>Sin resultados para tu búsqueda.</EmptyState>
      )}

      {articles.length > 0 && (
        // Keep the previous results visible (dimmed) while a new request is in
        // flight — unmounting the list makes every keystroke flash a blank page.
        <ul
          aria-busy={loading}
          className={`space-y-3 transition-opacity duration-150 ${
            loading ? "pointer-events-none opacity-50" : ""
          }`}
        >
          {articles.map((article) => (
            <li key={article.id}>
              <ArticleCard article={article} />
            </li>
          ))}
        </ul>
      )}

      {canLoadMore && !error && (
        <button
          type="button"
          onClick={() => setLimit((l) => Math.min(l + PAGE_SIZE, MAX_LIMIT))}
          disabled={loading}
          className="w-full rounded-md border border-impakt-border bg-white px-3 py-2 text-sm font-medium text-impakt-ink hover:border-impakt-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-impakt-yellow focus-visible:ring-offset-1 disabled:opacity-50"
        >
          {loading ? "Cargando…" : "Cargar más"}
        </button>
      )}
    </div>
  );
}

function ArticleCard({ article }: { article: Article }) {
  const title = article.title ?? "(sin título)";
  const text = snippet(article.content);

  return (
    <Card>
      <div className="flex gap-3">
        {article.image_url && (
          // Plain <img> avoids next/image remote-domain config.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.image_url}
            alt=""
            className="h-16 w-16 shrink-0 rounded-md object-cover"
          />
        )}
        <div className="min-w-0">
          {article.url ? (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-impakt-ink underline-offset-2 hover:underline"
            >
              {title}
            </a>
          ) : (
            <p className="text-sm font-medium text-impakt-ink">{title}</p>
          )}
          <p className="mt-1 text-xs text-impakt-muted">
            {[article.source, formatDate(article.published_at)]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {text && <p className="mt-2 text-sm text-impakt-muted">{text}</p>}
        </div>
      </div>
    </Card>
  );
}
