"use client";

import { useMemo, useState } from "react";

import { formatDate } from "../_components/date";
import type { Match } from "../_components/types";
import { Badge, Card, EmptyState } from "../_components/ui";

// Client-side filter over the already-fetched feed: with ≤200 matches in
// memory there's no reason to round-trip to the server per chip click.
export default function MatchesList({ matches }: { matches: Match[] }) {
  const [activeTerm, setActiveTerm] = useState<string | null>(null);

  const terms = useMemo(() => {
    const seen = new Map<string, number>();
    for (const match of matches) {
      if (!match.matched_term) continue;
      seen.set(match.matched_term, (seen.get(match.matched_term) ?? 0) + 1);
    }
    // Most active terms first — that's what users scan for.
    return [...seen.entries()].sort((a, b) => b[1] - a[1]);
  }, [matches]);

  const visible = activeTerm
    ? matches.filter((m) => m.matched_term === activeTerm)
    : matches;

  return (
    <div className="space-y-4">
      {terms.length > 1 && (
        <div
          role="group"
          aria-label="Filtrar por término"
          className="flex flex-wrap gap-2"
        >
          <FilterChip
            label={`Todas (${matches.length})`}
            active={activeTerm === null}
            onClick={() => setActiveTerm(null)}
          />
          {terms.map(([term, count]) => (
            <FilterChip
              key={term}
              label={`${term} (${count})`}
              active={activeTerm === term}
              onClick={() => setActiveTerm(activeTerm === term ? null : term)}
            />
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState>No hay alertas para este término.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {visible.map((match) => (
            <li key={match.id}>
              <MatchCard match={match} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-impakt-yellow focus-visible:ring-offset-1 ${
        active
          ? "bg-impakt-ink text-impakt-paper"
          : "border border-impakt-border bg-white text-impakt-muted hover:border-impakt-ink hover:text-impakt-ink"
      }`}
    >
      {label}
    </button>
  );
}

function MatchCard({ match }: { match: Match }) {
  const article = match.articles;

  return (
    <Card>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {match.matched_term && <Badge>{match.matched_term}</Badge>}
        {match.notified_telegram && (
          <Badge tone="muted">Enviado a Telegram</Badge>
        )}
      </div>

      {article ? (
        <ArticleHeadline title={article.title} url={article.url} />
      ) : (
        <p className="text-sm text-impakt-muted">(artículo no disponible)</p>
      )}

      {/* Intl output can differ between Node's ICU and the browser's —
          keep the server text instead of failing hydration over spacing. */}
      <p className="mt-1 text-xs text-impakt-muted" suppressHydrationWarning>
        {[article?.source, formatDate(match.created_at)]
          .filter(Boolean)
          .join(" · ")}
      </p>
    </Card>
  );
}

function ArticleHeadline({
  title,
  url,
}: {
  title: string | null;
  url: string | null;
}) {
  const label = title ?? "(sin título)";
  if (!url) {
    return <p className="text-sm font-medium text-impakt-ink">{label}</p>;
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm font-medium text-impakt-ink underline-offset-2 hover:underline"
    >
      {label}
    </a>
  );
}
