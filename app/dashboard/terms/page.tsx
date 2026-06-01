import { redirect } from "next/navigation";

import { fetchFromVarys, getSessionToken } from "../../lib/session";
import type { TermsResponse } from "../_components/types";
import { PageHeader } from "../_components/ui";
import TermsEditor from "./terms-editor";

export default async function TermsPage() {
  const token = await getSessionToken();
  if (!token) redirect("/login");

  const res = await fetchFromVarys("/api/me/terms");
  if (res.status === 401) redirect("/login");
  if (!res.ok) {
    return (
      <p className="text-sm text-impakt-red">
        No pudimos cargar tus términos ({res.status}).
      </p>
    );
  }

  const { terms } = (await res.json()) as TermsResponse;

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Términos de búsqueda"
        subtitle="Estos términos definen las alertas que recibes: cuando una noticia coincide, te avisamos por Telegram."
      />
      <TermsEditor initialTerms={terms} />
    </div>
  );
}
