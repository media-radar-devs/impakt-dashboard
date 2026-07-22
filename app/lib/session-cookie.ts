// Cookie names + builders shared by the auth proxy, the refresh middleware and
// logout. Kept free of `next/headers` (and any Node-only API) so it can be
// imported from Edge middleware as well as server route handlers.

import type { NextResponse } from "next/server";

export const SESSION_COOKIE = "impakt_session";
export const REFRESH_COOKIE = "impakt_refresh";

// The cookies live 7 days. The access token inside SESSION_COOKIE expires much
// sooner (Supabase JWT TTL); the middleware swaps it for a fresh one using the
// refresh token before it lapses, so the browser only re-authenticates once the
// refresh token itself is gone.
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

// The options-object overload of cookies.set (Extract drops the string-key overload).
type CookieOptions = Extract<Parameters<NextResponse["cookies"]["set"]>[0], object>;

/** Build a session/refresh cookie with the standard security attributes. */
export function sessionCookie(
  name: string,
  value: string,
  maxAge: number = SESSION_MAX_AGE,
): CookieOptions {
  return {
    name,
    value,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

/** Read a JWT's `exp` (seconds since epoch) without verifying its signature. */
export function getJwtExp(token: string): number | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    payload = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), "=");
    const data = JSON.parse(atob(payload)) as { exp?: unknown };
    return typeof data.exp === "number" ? data.exp : null;
  } catch {
    return null;
  }
}
