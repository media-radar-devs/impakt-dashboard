// Generic auth proxy. Every /api/proxy/auth/<path> from the browser is forwarded to
// ${VARYS_URL}/api/auth/<path>. The real backend URL is never sent to the client.
//
// On responses that return { access_token, ... } (signup, login), we extract the
// token and set it as an httpOnly cookie so subsequent requests can attach it
// as a Bearer header automatically.

import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE } from "../../../../lib/session";

const VARYS_URL = process.env.VARYS_URL;
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days; refresh on login

if (!VARYS_URL) {
  // Surface the misconfiguration loudly at boot rather than per-request.
  console.error("VARYS_URL is not set — auth proxy will fail.");
}

type RouteContext = { params: Promise<{ path: string[] }> };

async function forward(request: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  if (!VARYS_URL) {
    return NextResponse.json({ detail: "server_misconfigured" }, { status: 500 });
  }
  const { path } = await ctx.params;
  const subpath = path.join("/");
  const search = request.nextUrl.search;
  const target = `${VARYS_URL}/api/auth/${subpath}${search}`;

  const headers: Record<string, string> = {};
  const contentType = request.headers.get("content-type");
  if (contentType) headers["content-type"] = contentType;

  const sessionCookie = request.cookies.get(SESSION_COOKIE);
  if (sessionCookie) {
    headers["authorization"] = `Bearer ${sessionCookie.value}`;
  }

  const body = request.method === "GET" || request.method === "HEAD"
    ? undefined
    : await request.text();

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });
  } catch (err) {
    return NextResponse.json(
      { detail: `proxy_fetch_failed: ${(err as Error).message}` },
      { status: 502 },
    );
  }

  const responseText = await upstream.text();
  const response = new NextResponse(responseText, {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
  });

  // Auto-set the session cookie when the backend returned a fresh access_token.
  if (upstream.ok && (subpath === "signup" || subpath === "login")) {
    try {
      const parsed = JSON.parse(responseText) as { access_token?: string };
      if (parsed.access_token) {
        response.cookies.set({
          name: SESSION_COOKIE,
          value: parsed.access_token,
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: SESSION_MAX_AGE,
        });
      }
    } catch {
      // Non-JSON success body is unexpected here but not fatal.
    }
  }

  return response;
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const DELETE = forward;
