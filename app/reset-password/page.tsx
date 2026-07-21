import type { Metadata } from "next";
import Link from "next/link";

import ResetPasswordForm from "./reset-password-form";

export const metadata: Metadata = { title: "Restablecer contraseña" };

type SearchParams = Promise<{ token?: string | string[] }>;

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { token } = await searchParams;
  const tokenValue = Array.isArray(token) ? token[0] : token;

  if (!tokenValue) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="max-w-md w-full space-y-4 text-center">
          <h1 className="text-4xl leading-none tracking-tight font-display">
            Enlace inválido
          </h1>
          <p className="text-sm text-impakt-muted">
            Falta el token de recuperación. Solicita un enlace nuevo.
          </p>
          <Link href="/forgot-password" className="text-sm underline hover:text-impakt-ink">
            Solicitar enlace
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <p className="eyebrow mb-2">Nueva contraseña</p>
        <h1 className="mb-1 text-4xl leading-none tracking-tight font-display">
          Crea tu contraseña
        </h1>
        <p className="mb-6 text-sm text-impakt-muted">
          Elige una contraseña de al menos 8 caracteres.
        </p>
        <ResetPasswordForm token={tokenValue} />
      </div>
    </main>
  );
}
