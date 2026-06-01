"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { email: string; linkToken: string };

export default function RegisterForm({ email, linkToken }: Props) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/proxy/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          link_token: linkToken,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.detail ?? `Error ${res.status}`);
        return;
      }
      router.replace("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="email-display" className="eyebrow block">
          Email
        </label>
        <div
          id="email-display"
          className="mt-1 rounded-md border border-impakt-border bg-white px-3 py-2 text-sm text-impakt-muted"
        >
          {email}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="first_name" className="eyebrow block">
            Nombre
          </label>
          <input
            id="first_name"
            type="text"
            required
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 w-full rounded-md border border-impakt-border bg-white px-3 py-2 text-sm text-impakt-ink focus:border-impakt-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-impakt-yellow focus-visible:ring-offset-1"
          />
        </div>
        <div>
          <label htmlFor="last_name" className="eyebrow block">
            Apellido
          </label>
          <input
            id="last_name"
            type="text"
            required
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 w-full rounded-md border border-impakt-border bg-white px-3 py-2 text-sm text-impakt-ink focus:border-impakt-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-impakt-yellow focus-visible:ring-offset-1"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="eyebrow block">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-impakt-border bg-white px-3 py-2 text-sm text-impakt-ink focus:border-impakt-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-impakt-yellow focus-visible:ring-offset-1"
        />
      </div>

      {error && (
        <p className="text-sm text-impakt-red">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-impakt-ink px-4 py-2 text-sm font-medium text-impakt-paper hover:bg-impakt-yellow hover:text-impakt-ink disabled:opacity-50 disabled:hover:bg-impakt-ink disabled:hover:text-impakt-paper"
      >
        {submitting ? "Creando…" : "Crear cuenta"}
      </button>
    </form>
  );
}
