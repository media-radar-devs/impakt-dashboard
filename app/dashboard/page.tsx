import { redirect } from "next/navigation";

import { fetchFromVarys, getSessionToken } from "../lib/session";
import { Card, PageHeader } from "./_components/ui";

type UserProfile = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  is_enabled: boolean;
  rejected_at: string | null;
  rejection_reason: string | null;
  search_terms: string[];
};

export default async function DashboardPage() {
  const token = await getSessionToken();
  if (!token) redirect("/login");

  const res = await fetchFromVarys("/api/auth/me");
  if (res.status === 401) redirect("/login");
  if (!res.ok) {
    return (
      <p className="text-sm text-impakt-red">
        No pudimos cargar tu perfil ({res.status}).
      </p>
    );
  }

  const user = (await res.json()) as UserProfile;
  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") || null;
  const greeting = user.first_name ?? fullName ?? user.email;

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title={`Hola, ${greeting}`}
        subtitle="Tu cuenta de Impakt está conectada al bot."
      />

      {!user.is_enabled && user.rejected_at && (
        <div className="rounded-md border border-impakt-red bg-impakt-red/10 px-4 py-3 text-sm text-impakt-ink">
          <p className="font-medium text-impakt-red">
            Tu solicitud fue rechazada.
          </p>
          {user.rejection_reason &&
            !user.rejection_reason.startsWith("(pending") && (
              <p className="mt-1">
                Motivo:{" "}
                <span className="font-medium">{user.rejection_reason}</span>
              </p>
            )}
          <p className="mt-1 text-impakt-muted">
            Si crees que es un error, envía{" "}
            <code className="rounded bg-impakt-paper px-1">/register</code> al
            bot de Telegram para volver a aplicar.
          </p>
        </div>
      )}

      {!user.is_enabled && !user.rejected_at && (
        <div className="rounded-md border border-impakt-yellow bg-impakt-yellow/10 px-4 py-3 text-sm text-impakt-ink">
          <p className="font-medium">Tu cuenta está pendiente de aprobación.</p>
          <p className="mt-1 text-impakt-muted">
            Un admin tiene que revisar tu solicitud antes de que puedas recibir
            alertas. Te enviaremos un mensaje por Telegram en cuanto esté lista —
            puedes cerrar esta ventana mientras tanto.
          </p>
        </div>
      )}

      <Card className="divide-y divide-impakt-border p-0">
        <Row label="Email" value={user.email} />
        <Row label="Rol" value={user.role} />
        <Row
          label="Estado"
          value={user.is_enabled ? "Activa" : "Pendiente de aprobación"}
        />
        <Row
          label="Términos"
          value={
            user.search_terms.length
              ? user.search_terms.join(", ")
              : "(ninguno)"
          }
        />
      </Card>

      {user.is_enabled && (
        <p className="text-sm text-impakt-muted">
          También puedes configurar tus términos desde el bot de Telegram
          (<code className="rounded bg-white px-1">/add &lt;término&gt;</code>,
          <code className="ml-1 rounded bg-white px-1">
            /remove &lt;término&gt;
          </code>
          ) o en la sección Términos.
        </p>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <dt className="text-impakt-muted">{label}</dt>
      <dd className="font-medium text-impakt-ink">{value}</dd>
    </div>
  );
}
