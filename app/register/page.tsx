import RegisterForm from "./register-form";

type SearchParams = Promise<{ token?: string; email?: string }>;

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { token, email } = await searchParams;

  if (!token || !email) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="max-w-md w-full space-y-4 text-center">
          <h1 className="text-4xl leading-none tracking-tight font-[family-name:var(--font-display)]">
            Falta el enlace de registro
          </h1>
          <p className="text-sm text-impakt-muted">
            Abre el enlace que el bot de Telegram te envió. Debe contener un
            <code className="mx-1 rounded bg-impakt-ink px-1 text-impakt-paper">token</code>
            y un
            <code className="mx-1 rounded bg-impakt-ink px-1 text-impakt-paper">email</code>.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <p className="eyebrow mb-2">Registro</p>
        <h1 className="mb-1 text-4xl leading-none tracking-tight font-[family-name:var(--font-display)]">
          Crea tu cuenta
        </h1>
        <p className="mb-6 text-sm text-impakt-muted">
          Solo necesitas elegir una contraseña para terminar de vincular tu Telegram.
        </p>
        <RegisterForm email={email} linkToken={token} />
      </div>
    </main>
  );
}
