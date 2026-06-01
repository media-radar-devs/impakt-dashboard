// Logout endpoint. Clears the session cookie server-side and reports success.
// The browser is responsible for redirecting to /login afterwards.
// POST only — logout is a state change, so GET is intentionally not exposed.

import { NextResponse } from "next/server";

import { SESSION_COOKIE } from "../../lib/session";

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
