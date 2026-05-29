import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-semibold">Inicia sesión</h1>
        <p className="mb-6 text-sm text-zinc-600">
          Entra para revisar el estado de tu cuenta y tus términos de búsqueda.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
