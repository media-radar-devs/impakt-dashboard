// Shared, server-safe presentational primitives for the dashboard pages.
// No "use client" — these render on the server and keep page files short.

import type { ReactNode } from "react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-6">
      <h1 className="font-display text-3xl tracking-tight text-impakt-ink">
        {title}
      </h1>
      {subtitle && <p className="mt-1 text-sm text-impakt-muted">{subtitle}</p>}
    </header>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-md border border-impakt-border bg-white p-4 ${className}`}
    >
      {children}
    </div>
  );
}

type BadgeTone = "yellow" | "muted";

export function Badge({
  children,
  tone = "yellow",
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  const tones: Record<BadgeTone, string> = {
    yellow: "bg-impakt-yellow text-impakt-ink",
    muted: "bg-impakt-paper text-impakt-muted border border-impakt-border",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-impakt-border px-6 py-12 text-center text-sm text-impakt-muted">
      {children}
    </div>
  );
}
