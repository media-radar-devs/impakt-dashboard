import { redirect } from "next/navigation";

import { fetchFromVarys, getSessionToken } from "../../lib/session";
import { formatDate } from "../_components/date";
import type { Match } from "../_components/types";
import { Badge, Card, EmptyState, PageHeader } from "../_components/ui";

export default async function NotificationsPage() {
  const token = await getSessionToken();
  if (!token) redirect("/login");

  const res = await fetchFromVarys("/api/me/matches?limit=50");
  if (res.status === 401) redirect("/login");
  if (!res.ok) {
    return (
      <p className="text-sm text-impakt-red">
        No pudimos cargar tus alertas ({res.status}).
      </p>
    );
  }

  const matches = (await res.json()) as Match[];

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Alertas"
        subtitle="Coincidencias enviadas a tu Telegram."
      />

      {matches.length === 0 ? (
        <EmptyState>
          Todavía no hay alertas. Cuando una noticia coincida con tus términos,
          aparecerá aquí.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {matches.map((match) => (
            <li key={match.id}>
              <MatchCard match={match} />
            </li>
          ))}
        </ul>
      )}
    </div>
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

      <p className="mt-1 text-xs text-impakt-muted">
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
