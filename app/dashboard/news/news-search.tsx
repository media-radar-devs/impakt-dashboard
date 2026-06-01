"use client";

import { useEffect, useState } from "react";

import { formatDate } from "../_components/date";
import type { Article } from "../_components/types";
import { Card, EmptyState } from "../_components/ui";

const DEBOUNCE_MS = 300;
const SNIPPET_LENGTH = 160;

function snippet(content: string | null): string | null {
  if (!content) return null;
  const trimmed = content.trim();
  if (trimmed.length <= SNIPPET_LENGTH) return trimmed;
  return `${trimmed.slice(0, SNIPPET_LENGTH).trimEnd()}…`;
}

export default function NewsSearch({
  initialArticles,
}: {
  initialArticles: Article[];
}) {
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    const controller = new AbortController();

    // Empty query resets to the server-rendered list — done inside the timer so
    // the effect never calls setState synchronously (cascading-render lint).
    const timer = setTimeout(async () => {
      if (!trimmed) {
        setArticles(initialArticles);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/proxy/me/news?q=${encodeURIComponent(trimmed)}&limit=30`,
          { signal: controller.signal },
        );
        if (!res.ok) {
          setError("No pudimos cargar las noticias.");
          return;
        }
        const body = (await res.json()) as Article[];
        setArticles(body);
      } catch (err) {
        if ((err as Error).name === "AbortError") return; // stale request
        setError("No pudimos cargar las noticias.");
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, initialArticles]);

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
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar términos, frases…"
          className="w-full rounded-md border border-impakt-border bg-white px-3 py-2 text-sm text-impakt-ink focus:border-impakt-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-impakt-yellow focus-visible:ring-offset-1"
        />
        {loading && <p className="text-xs text-impakt-muted">Buscando…</p>}
        {error && <p className="text-sm text-impakt-red">{error}</p>}
      </div>

      {!error && articles.length === 0 ? (
        <EmptyState>Sin resultados para tu búsqueda.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {articles.map((article) => (
            <li key={article.id}>
              <ArticleCard article={article} />
            </li>
          ))}
        </ul>
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
