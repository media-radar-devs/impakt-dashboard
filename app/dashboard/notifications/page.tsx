import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { fetchFromVarys, getSessionToken } from "../../lib/session";
import type { Match } from "../_components/types";
import { EmptyState, PageHeader } from "../_components/ui";
import MatchesList from "./matches-list";

export const metadata: Metadata = { title: "Alertas" };

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
        <MatchesList matches={matches} />
      )}
    </div>
  );
}
