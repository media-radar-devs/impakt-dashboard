"use client";

import { useState } from "react";

import { Card } from "../_components/ui";
import TelegramConnectControls from "./telegram-connect-controls";

/** Shown when the account already has a Telegram channel linked. */
export default function TelegramLinkedCard() {
  const [reconnecting, setReconnecting] = useState(false);

  return (
    <Card className="space-y-5">
      <div className="space-y-2">
        <p className="eyebrow">Telegram</p>
        <h2 className="font-display text-2xl tracking-tight text-impakt-ink">
          Bot de Impakt
        </h2>
        <div className="flex items-center gap-2 text-sm font-medium text-impakt-ink">
          <span
            aria-hidden
            className="flex h-5 w-5 items-center justify-center rounded-full bg-impakt-ink text-xs text-impakt-paper"
          >
            ✓
          </span>
          Telegram conectado
        </div>
        <p className="text-sm text-impakt-muted">
          Recibes alertas y puedes gestionar tu cuenta desde el bot de Impakt.
        </p>
      </div>

      <div className="border-t border-impakt-border pt-5">
        <button
          type="button"
          onClick={() => setReconnecting((open) => !open)}
          aria-expanded={reconnecting}
          className="text-sm font-medium text-impakt-muted underline-offset-2 transition-colors hover:text-impakt-ink hover:underline"
        >
          ¿Cambiaste de cuenta? Volver a conectar {reconnecting ? "▾" : "▸"}
        </button>

        {reconnecting && (
          <div className="mt-4 space-y-5">
            <p className="text-sm text-impakt-muted">
              Genera un nuevo enlace para vincular otra cuenta de Telegram. Esto
              reemplazará la conexión actual.
            </p>
            <TelegramConnectControls />
          </div>
        )}
      </div>
    </Card>
  );
}
