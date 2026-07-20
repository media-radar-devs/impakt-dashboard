"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/proxy/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        setError(`Error ${res.status}`);
        return;
      }
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-impakt-ink">
          Si el correo existe, te enviamos un enlace para restablecer tu contraseña.
          Revisa tu bandeja de entrada.
        </p>
        <Link href="/login" className="text-sm text-impakt-muted underline hover:text-impakt-ink">
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="eyebrow block">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-impakt-border bg-white px-3 py-2 text-sm text-impakt-ink focus:border-impakt-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-impakt-yellow focus-visible:ring-offset-1"
        />
      </div>

      {error && <p className="text-sm text-impakt-red">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-impakt-ink px-4 py-2 text-sm font-medium text-impakt-paper hover:bg-impakt-yellow hover:text-impakt-ink disabled:opacity-50 disabled:hover:bg-impakt-ink disabled:hover:text-impakt-paper"
      >
        {submitting ? "Enviando…" : "Enviar enlace"}
      </button>

      <p className="text-sm text-impakt-muted">
        <Link href="/login" className="underline hover:text-impakt-ink">
          Volver a iniciar sesión
        </Link>
      </p>
    </form>
  );
}
