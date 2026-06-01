"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onLogout() {
    setPending(true);
    try {
      await fetch("/api/logout", { method: "POST" });
      router.replace("/login");
    } catch {
      // Even if the call fails, send the user to login; the cookie clears there.
      router.replace("/login");
    }
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={pending}
      className="w-full rounded-md border border-impakt-paper/20 px-3 py-2 text-sm font-medium text-impakt-paper/80 hover:bg-impakt-yellow hover:text-impakt-ink disabled:opacity-50"
    >
      {pending ? "Saliendo…" : "Salir"}
    </button>
  );
}
