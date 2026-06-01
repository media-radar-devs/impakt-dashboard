"use client";

import { useState } from "react";

import type { TermsResponse } from "../_components/types";

// Maps backend `detail` codes to Chilean-Spanish, user-facing messages.
const ERROR_MESSAGES: Record<string, string> = {
  empty_term: "Escribe un término.",
  term_too_long: "Ese término es muy largo.",
  too_many_terms: "Llegaste al máximo de términos.",
};

function messageFromDetail(detail: unknown): string {
  if (typeof detail === "string" && detail in ERROR_MESSAGES) {
    return ERROR_MESSAGES[detail];
  }
  return "No pudimos guardar el cambio. Intenta de nuevo.";
}

export default function TermsEditor({
  initialTerms,
}: {
  initialTerms: string[];
}) {
  const [terms, setTerms] = useState<string[]>(initialTerms);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function addTerm() {
    const term = value.trim();
    if (!term || pending) return;

    setError(null);
    setPending(true);
    const previous = terms;
    setTerms([...terms, term]); // optimistic
    setValue("");

    try {
      const res = await fetch("/api/proxy/me/terms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ term }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setTerms(previous); // roll back
        setValue(term);
        setError(messageFromDetail((body as { detail?: unknown }).detail));
        return;
      }
      const body = (await res.json()) as TermsResponse;
      setTerms(body.terms); // server is source of truth
    } catch {
      setTerms(previous);
      setValue(term);
      setError("No pudimos guardar el cambio. Intenta de nuevo.");
    } finally {
      setPending(false);
    }
  }

  async function removeTerm(term: string) {
    if (pending) return;
    setError(null);
    setPending(true);
    const previous = terms;
    setTerms(terms.filter((t) => t !== term)); // optimistic

    try {
      const res = await fetch("/api/proxy/me/terms", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ term }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setTerms(previous);
        setError(messageFromDetail((body as { detail?: unknown }).detail));
        return;
      }
      const body = (await res.json()) as TermsResponse;
      setTerms(body.terms);
    } catch {
      setTerms(previous);
      setError("No pudimos guardar el cambio. Intenta de nuevo.");
    } finally {
      setPending(false);
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void addTerm();
  }

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="flex gap-2">
        <label htmlFor="new-term" className="sr-only">
          Nuevo término
        </label>
        <input
          id="new-term"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={pending}
          placeholder="Ej: sostenibilidad"
          className="flex-1 rounded-md border border-impakt-border bg-white px-3 py-2 text-sm text-impakt-ink focus:border-impakt-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-impakt-yellow focus-visible:ring-offset-1 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-impakt-ink px-4 py-2 text-sm font-medium text-impakt-paper hover:bg-impakt-yellow hover:text-impakt-ink disabled:opacity-50"
        >
          Agregar
        </button>
      </form>

      {error && <p className="text-sm text-impakt-red">{error}</p>}

      {terms.length === 0 ? (
        <p className="text-sm text-impakt-muted">
          Todavía no tienes términos. Agrega uno para empezar a recibir alertas.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {terms.map((term) => (
            <li key={term}>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-impakt-yellow px-2.5 py-1 text-xs font-medium text-impakt-ink">
                {term}
                <button
                  type="button"
                  onClick={() => removeTerm(term)}
                  disabled={pending}
                  aria-label={`Eliminar ${term}`}
                  className="rounded-full leading-none hover:text-impakt-red disabled:opacity-50"
                >
                  ✕
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
