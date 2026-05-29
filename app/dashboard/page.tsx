import { redirect } from "next/navigation";

import { fetchFromVarys, getSessionToken } from "../lib/session";

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
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <p className="text-sm text-red-600">
          No pudimos cargar tu perfil ({res.status}).
        </p>
      </main>
    );
  }

  const user = (await res.json()) as UserProfile;
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || null;
  const greeting = fullName ?? user.email;

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Hola, {greeting}</h1>
          <p className="text-sm text-zinc-600">Tu cuenta de Impakt está conectada al bot.</p>
        </header>

        {!user.is_enabled && user.rejected_at && (
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
            <p className="font-medium">Tu solicitud fue rechazada.</p>
            {user.rejection_reason &&
              !user.rejection_reason.startsWith("(pending") && (
                <p className="mt-1">
                  Motivo: <span className="font-medium">{user.rejection_reason}</span>
                </p>
              )}
            <p className="mt-1">
              Si crees que es un error, envía <code className="rounded bg-red-100 px-1">/register</code>
              al bot de Telegram para volver a aplicar.
            </p>
          </div>
        )}

        {!user.is_enabled && !user.rejected_at && (
          <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-medium">Tu cuenta está pendiente de aprobación.</p>
            <p className="mt-1">
              Un admin tiene que revisar tu solicitud antes de que puedas recibir alertas.
              Te enviaremos un mensaje por Telegram en cuanto esté lista — puedes cerrar esta
              ventana mientras tanto.
            </p>
          </div>
        )}

        <dl className="rounded-md border border-zinc-200 divide-y divide-zinc-200">
          <Row label="Email" value={user.email} />
          <Row label="Rol" value={user.role} />
          <Row
            label="Estado"
            value={user.is_enabled ? "Activa" : "Pendiente de aprobación"}
          />
          <Row
            label="Términos"
            value={user.search_terms.length ? user.search_terms.join(", ") : "(ninguno)"}
          />
        </dl>

        {user.is_enabled && (
          <p className="text-sm text-zinc-600">
            Por ahora, usa el bot de Telegram para configurar tus términos de búsqueda
            (<code className="rounded bg-zinc-100 px-1">/add &lt;término&gt;</code>,
            <code className="ml-1 rounded bg-zinc-100 px-1">/remove &lt;término&gt;</code>).
            El panel completo llega pronto.
          </p>
        )}
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="font-medium text-zinc-900">{value}</dd>
    </div>
  );
}
