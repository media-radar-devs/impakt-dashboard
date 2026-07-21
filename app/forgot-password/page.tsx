import type { Metadata } from "next";

import ForgotPasswordForm from "./forgot-password-form";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function ForgotPasswordPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <p className="eyebrow mb-2">Recuperar acceso</p>
        <h1 className="mb-1 text-4xl leading-none tracking-tight font-display">
          ¿Olvidaste tu contraseña?
        </h1>
        <p className="mb-6 text-sm text-impakt-muted">
          Ingresa tu email y te enviaremos un enlace para restablecerla.
        </p>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
