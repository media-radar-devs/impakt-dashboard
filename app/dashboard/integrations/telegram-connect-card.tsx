import { Card } from "../_components/ui";
import TelegramConnectControls from "./telegram-connect-controls";

/** Shown when the account has no Telegram channel linked yet. */
export default function TelegramConnectCard() {
  return (
    <Card className="space-y-5">
      <div className="space-y-2">
        <p className="eyebrow">Telegram</p>
        <h2 className="font-display text-2xl tracking-tight text-impakt-ink">
          Bot de Impakt
        </h2>
        <p className="text-sm text-impakt-muted">
          Conecta Telegram para recibir alertas y gestionar tu cuenta desde el
          bot.
        </p>
        <p className="text-sm text-impakt-muted">
          Si ya conectaste Telegram antes, puedes generar un nuevo enlace para
          volver a conectar el bot.
        </p>
      </div>

      <TelegramConnectControls />
    </Card>
  );
}
