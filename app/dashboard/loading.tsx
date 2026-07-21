// Route-level Suspense fallback for every dashboard page. Shows instantly on
// navigation while the server component fetches from varys, so a click always
// gets visual feedback instead of a frozen page.

export default function DashboardLoading() {
  return (
    <div
      className="max-w-2xl animate-pulse"
      role="status"
      aria-label="Cargando contenido"
    >
      <div className="mb-6">
        <div className="h-9 w-44 rounded-md bg-impakt-border/70" />
        <div className="mt-2 h-4 w-72 rounded bg-impakt-border/50" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="rounded-md border border-impakt-border bg-white p-4"
          >
            <div className="h-4 w-3/4 rounded bg-impakt-border/60" />
            <div className="mt-3 h-3 w-1/3 rounded bg-impakt-border/40" />
          </div>
        ))}
      </div>
      <span className="sr-only">Cargando…</span>
    </div>
  );
}
