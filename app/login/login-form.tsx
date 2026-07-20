"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/proxy/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
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

      <div>
        <label htmlFor="password" className="eyebrow block">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-impakt-border bg-white px-3 py-2 text-sm text-impakt-ink focus:border-impakt-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-impakt-yellow focus-visible:ring-offset-1"
        />
      </div>

      {error && <p className="text-sm text-impakt-red">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-impakt-ink px-4 py-2 text-sm font-medium text-impakt-paper hover:bg-impakt-yellow hover:text-impakt-ink disabled:opacity-50 disabled:hover:bg-impakt-ink disabled:hover:text-impakt-paper"
      >
        {submitting ? "Entrando…" : "Iniciar sesión"}
      </button>

      <p className="text-sm text-impakt-muted">
        <Link href="/forgot-password" className="underline hover:text-impakt-ink">
          ¿Olvidaste tu contraseña?
        </Link>
      </p>
    </form>
  );
}
