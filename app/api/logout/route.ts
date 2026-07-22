// Logout endpoint. Clears the session + refresh cookies server-side and reports
// success. The browser is responsible for redirecting to /login afterwards.
// POST only — logout is a state change, so GET is intentionally not exposed.

import { NextResponse } from "next/server";

import {
  REFRESH_COOKIE,
  SESSION_COOKIE,
  sessionCookie,
} from "../../lib/session-cookie";

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookie(SESSION_COOKIE, "", 0));
  response.cookies.set(sessionCookie(REFRESH_COOKIE, "", 0));
  return response;
}
