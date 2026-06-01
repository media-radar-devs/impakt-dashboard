"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { label: string; href: string };

const NAV_ITEMS: NavItem[] = [
  { label: "Inicio", href: "/dashboard" },
  { label: "Términos", href: "/dashboard/terms" },
  { label: "Alertas", href: "/dashboard/notifications" },
  { label: "Noticias", href: "/dashboard/news" },
];

// `/dashboard` would prefix-match every sub-route, so it needs an exact check;
// sub-routes use startsWith to stay active on nested paths.
function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row gap-1 sm:flex-col">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const base =
          "rounded-md px-3 py-2 text-sm font-medium transition-colors";
        const state = active
          ? "bg-impakt-yellow text-impakt-ink"
          : "text-impakt-paper/80 hover:bg-impakt-paper/10 hover:text-impakt-paper";
        return (
          <Link key={item.href} href={item.href} className={`${base} ${state}`}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
