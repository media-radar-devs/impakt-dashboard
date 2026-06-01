import type { ReactNode } from "react";

import LogoutButton from "./_components/logout-button";
import SidebarNav from "./_components/sidebar-nav";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col bg-impakt-paper sm:flex-row">
      <aside
        aria-label="Barra lateral"
        className="flex shrink-0 flex-col gap-6 bg-impakt-ink p-4 text-impakt-paper sm:h-screen sm:w-56 sm:sticky sm:top-0"
      >
        <div className="font-display text-2xl leading-none tracking-tight">
          <span className="bg-impakt-yellow px-1.5 text-impakt-ink">
            Impakt
          </span>
        </div>

        <SidebarNav />

        <div className="mt-auto hidden sm:block">
          <LogoutButton />
        </div>
      </aside>

      <main
        aria-label="Contenido principal"
        className="flex-1 px-6 py-8 sm:px-10"
      >
        {children}
      </main>

      <div className="border-t border-impakt-border px-4 py-3 sm:hidden">
        <LogoutButton />
      </div>
    </div>
  );
}
