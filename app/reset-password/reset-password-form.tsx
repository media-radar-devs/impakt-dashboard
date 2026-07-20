"use client";

import Link from "next/link";
import { useState } from "react";

const INPUT =
  "mt-1 w-full rounded-md border border-impakt-border bg-white px-3 py-2 text-sm text-impakt-ink focus:border-impakt-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-impakt-yellow focus-visible:ring-offset-1";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/proxy/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(typeof body.detail === "string" ? body.detail : `Error ${res.status}`);
        return;
      }
      setDone(true);
    } catch {
      setError("No pudimos conectar. Inténtalo nuevamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-impakt-ink">
          Tu contraseña quedó lista. Ya puedes iniciar sesión.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-md bg-impakt-ink px-4 py-2 text-sm font-medium text-impakt-paper hover:bg-impakt-yellow hover:text-impakt-ink"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="password" className="eyebrow block">
          Nueva contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={INPUT}
        />
      </div>

      <div>
        <label htmlFor="confirm" className="eyebrow block">
          Confirmar contraseña
        </label>
        <input
          id="confirm"
          type="password"
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={INPUT}
        />
      </div>

      {error && <p className="text-sm text-impakt-red">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-impakt-ink px-4 py-2 text-sm font-medium text-impakt-paper hover:bg-impakt-yellow hover:text-impakt-ink disabled:opacity-50 disabled:hover:bg-impakt-ink disabled:hover:text-impakt-paper"
      >
        {submitting ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
  );
}
