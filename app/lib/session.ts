// Server-side helpers for the session cookie + authenticated backend calls.
// The proxy route owns *setting* the cookie; these helpers only *read* it.

import { cookies } from "next/headers";

import { SESSION_COOKIE } from "./session-cookie";

const VARYS_URL = process.env.VARYS_URL;

export { SESSION_COOKIE };

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function fetchFromVarys(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  if (!VARYS_URL) {
    throw new Error("VARYS_URL is not configured");
  }
  const token = await getSessionToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("authorization", `Bearer ${token}`);
  return fetch(`${VARYS_URL}${path}`, { ...init, headers, cache: "no-store" });
}
