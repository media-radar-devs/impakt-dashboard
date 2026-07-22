import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { fetchFromVarys, getSessionToken } from "../../lib/session";
import { PageHeader } from "../_components/ui";
import TelegramConnectCard from "./telegram-connect-card";
import TelegramLinkedCard from "./telegram-linked-card";

export const metadata: Metadata = { title: "Integraciones" };

type UserProfile = {
  telegram_linked: boolean;
};

export default async function IntegrationsPage() {
  const token = await getSessionToken();
  if (!token) redirect("/login");

  const res = await fetchFromVarys("/api/auth/me");
  if (res.status === 401) redirect("/login");
  if (!res.ok) {
    return (
      <p className="text-sm text-impakt-red">
        No pudimos cargar tus integraciones ({res.status}).
      </p>
    );
  }

  const user = (await res.json()) as UserProfile;

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Integraciones"
        subtitle="Conecta tus canales para recibir alertas y gestionar tu cuenta."
      />
      {user.telegram_linked ? <TelegramLinkedCard /> : <TelegramConnectCard />}
    </div>
  );
}
