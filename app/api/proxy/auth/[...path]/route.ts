// Generic auth proxy. Every /api/proxy/auth/<path> from the browser is forwarded to
// ${VARYS_URL}/api/auth/<path>. The real backend URL is never sent to the client.
//
// On responses that return { access_token, refresh_token, ... } (signup, login),
// we extract both tokens and set them as httpOnly cookies: the access token so
// subsequent requests can attach it as a Bearer header, and the refresh token so
// the middleware can mint a new access token before it expires.

import { NextRequest, NextResponse } from "next/server";

import {
  REFRESH_COOKIE,
  SESSION_COOKIE,
  sessionCookie,
} from "../../../../lib/session-cookie";

const VARYS_URL = process.env.VARYS_URL;

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

  const existingSession = request.cookies.get(SESSION_COOKIE);
  if (existingSession) {
    headers["authorization"] = `Bearer ${existingSession.value}`;
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
  } catch (err: unknown) {
    console.error("[auth-proxy] upstream fetch failed:", err);
    return NextResponse.json({ detail: "upstream_unavailable" }, { status: 502 });
  }

  const responseText = await upstream.text();
  const response = new NextResponse(responseText, {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
  });

  // Auto-set the session cookies when the backend returned a fresh session.
  if (upstream.ok && (subpath === "signup" || subpath === "login")) {
    try {
      const parsed = JSON.parse(responseText) as {
        access_token?: string;
        refresh_token?: string;
      };
      if (parsed.access_token) {
        response.cookies.set(sessionCookie(SESSION_COOKIE, parsed.access_token));
      }
      if (parsed.refresh_token) {
        response.cookies.set(sessionCookie(REFRESH_COOKIE, parsed.refresh_token));
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
