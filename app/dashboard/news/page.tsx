import { redirect } from "next/navigation";

import { fetchFromVarys, getSessionToken } from "../../lib/session";
import type { Article } from "../_components/types";
import { PageHeader } from "../_components/ui";
import NewsSearch from "./news-search";

export default async function NewsPage() {
  const token = await getSessionToken();
  if (!token) redirect("/login");

  const res = await fetchFromVarys("/api/me/news?limit=30");
  if (res.status === 401) redirect("/login");
  if (!res.ok) {
    return (
      <p className="text-sm text-impakt-red">
        No pudimos cargar las noticias ({res.status}).
      </p>
    );
  }

  const initialArticles = (await res.json()) as Article[];

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Noticias"
        subtitle="Busca en los medios monitoreados."
      />
      <NewsSearch initialArticles={initialArticles} />
    </div>
  );
}
