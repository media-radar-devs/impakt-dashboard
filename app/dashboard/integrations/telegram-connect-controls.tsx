"use client";

import Link from "next/link";
import { useState } from "react";

type LinkCodeResponse = {
  pin: string;
  expires_at: string;
};

type TelegramLinkError = "session" | "recoverable";

async function requestTelegramLinkUrl(): Promise<string> {
  const res = await fetch("/api/proxy/auth/telegram-link-url", {
    method: "POST",
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("telegram_link_url_unauthorized");
    }
    throw new Error("telegram_link_url_failed");
  }

  const data = (await res.json()) as { url?: unknown };

  if (typeof data.url !== "string" || !data.url) {
    throw new Error("telegram_link_url_invalid_response");
  }

  return data.url;
}

async function requestTelegramPin(): Promise<LinkCodeResponse> {
  const res = await fetch("/api/proxy/auth/request-link-code", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ channel_type: "telegram" }),
  });

  if (!res.ok) {
    throw new Error("telegram_pin_failed");
  }

  const data = (await res.json()) as { pin?: unknown; expires_at?: unknown };

  if (typeof data.pin !== "string" || typeof data.expires_at !== "string") {
    throw new Error("telegram_pin_invalid_response");
  }

  return { pin: data.pin, expires_at: data.expires_at };
}

function formatExpiration(expiresAt: string): string {
  return new Date(expiresAt).toLocaleString("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

/**
 * The connect-to-Telegram + PIN fallback controls. Shared by the unlinked card
 * (TelegramConnectCard) and the linked card's "reconnect" disclosure so the link
 * flow stays defined in exactly one place.
 */
export default function TelegramConnectControls() {
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState<TelegramLinkError | null>(null);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [linkCode, setLinkCode] = useState<LinkCodeResponse | null>(null);

  async function handleTelegramConnect() {
    setLinkLoading(true);
    setLinkError(null);

    try {
      const url = await requestTelegramLinkUrl();
      window.location.href = url;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "telegram_link_url_unauthorized"
      ) {
        setLinkError("session");
      } else {
        setLinkError("recoverable");
      }
    } finally {
      setLinkLoading(false);
    }
  }

  async function handleGeneratePin() {
    setPinLoading(true);
    setPinError(null);
    setLinkCode(null);

    try {
      const code = await requestTelegramPin();
      setLinkCode(code);
    } catch {
      setPinError("No pudimos generar el PIN. Inténtalo nuevamente.");
    } finally {
      setPinLoading(false);
    }
  }

  return (
    <>
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleTelegramConnect}
          disabled={linkLoading}
          className="rounded-md bg-impakt-ink px-4 py-2 text-sm font-medium text-impakt-paper transition-colors hover:bg-impakt-yellow hover:text-impakt-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          {linkLoading ? "Abriendo Telegram…" : "Conectar a Telegram"}
        </button>
        <p className="text-sm text-impakt-muted">
          Se abrirá Telegram. Presiona Start en el bot para completar la
          conexión.
        </p>
        <p className="rounded-md bg-impakt-paper px-3 py-2 text-xs text-impakt-muted">
          El enlace es temporal y de un solo uso. Si expira, vuelve a generar
          uno desde aquí.
        </p>
        {linkError === "session" && (
          <p className="text-sm text-impakt-red">
            Tu sesión expiró.{" "}
            <Link href="/login" className="font-medium underline">
              Vuelve a iniciar sesión.
            </Link>
          </p>
        )}
        {linkError === "recoverable" && (
          <p className="text-sm text-impakt-red">
            No pudimos generar el enlace de Telegram. Inténtalo nuevamente.
          </p>
        )}
      </div>

      <div className="border-t border-impakt-border pt-5">
        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-impakt-ink">
              ¿No puedes abrir Telegram? Usa un PIN.
            </h3>
            <p className="text-sm text-impakt-muted">
              Copia este PIN y envíalo al bot de Telegram de Impakt. El código
              expira en 15 minutos.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGeneratePin}
            disabled={pinLoading}
            className="rounded-md border border-impakt-border bg-white px-4 py-2 text-sm font-medium text-impakt-ink transition-colors hover:border-impakt-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pinLoading ? "Generando PIN…" : "Generar PIN"}
          </button>

          {pinError && <p className="text-sm text-impakt-red">{pinError}</p>}

          {linkCode && (
            <div className="rounded-md border border-impakt-border bg-impakt-paper p-4">
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-impakt-muted">
                PIN
              </p>
              <p className="mt-2 select-all font-mono text-3xl font-semibold tracking-[0.2em] text-impakt-ink">
                {linkCode.pin}
              </p>
              <p className="mt-2 text-sm text-impakt-muted">
                Expira: {formatExpiration(linkCode.expires_at)}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
