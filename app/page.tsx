import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Impakt</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Monitoreo de medios chilenos con alertas en tiempo real.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="rounded-md border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Registrarse
          </Link>
        </div>
        <p className="mt-6 text-xs text-zinc-500">
          Para registrarte por primera vez, abre el enlace que te envió el bot de Telegram.
        </p>
      </div>
    </main>
  );
}
