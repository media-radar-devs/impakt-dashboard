import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSessionToken } from "../../lib/session";
import { PageHeader } from "../_components/ui";
import TelegramConnectCard from "./telegram-connect-card";

export const metadata: Metadata = { title: "Integraciones" };

export default async function IntegrationsPage() {
  const token = await getSessionToken();
  if (!token) redirect("/login");

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Integraciones"
        subtitle="Conecta tus canales para recibir alertas y gestionar tu cuenta."
      />
      <TelegramConnectCard />
    </div>
  );
}
