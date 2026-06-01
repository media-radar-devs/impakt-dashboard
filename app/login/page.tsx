import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <p className="eyebrow mb-2">Acceso</p>
        <h1 className="mb-1 text-4xl leading-none tracking-tight font-[family-name:var(--font-display)]">
          Inicia sesión
        </h1>
        <p className="mb-6 text-sm text-impakt-muted">
          Entra para revisar el estado de tu cuenta y tus términos de búsqueda.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
