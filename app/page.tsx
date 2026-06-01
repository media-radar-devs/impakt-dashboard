import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <p className="eyebrow mb-4">Monitoreo de medios</p>
        <h1 className="text-6xl leading-none tracking-tight font-display">
          <span className="bg-impakt-yellow px-2 text-impakt-ink">Impakt</span>
        </h1>
        <p className="mt-4 text-sm text-impakt-muted">
          Monitoreo de medios chilenos con alertas en tiempo real.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="rounded-md border border-impakt-ink px-5 py-2 text-sm font-medium text-impakt-ink hover:bg-impakt-ink hover:text-impakt-paper"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-impakt-ink px-5 py-2 text-sm font-medium text-impakt-paper hover:bg-impakt-yellow hover:text-impakt-ink"
          >
            Registrarse
          </Link>
        </div>
        <p className="mt-6 text-xs text-impakt-muted">
          Para registrarte por primera vez, abre el enlace que te envió el bot de Telegram.
        </p>
      </div>
    </main>
  );
}
