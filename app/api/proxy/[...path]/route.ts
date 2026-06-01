// Generic backend proxy. Every /api/proxy/<path> from the browser is forwarded to
// ${VARYS_URL}/api/<path>. The real backend URL is never sent to the client.
//
// Requests under /api/proxy/auth/* are handled by the more-specific nested route
// (app/api/proxy/auth/[...path]/route.ts), which additionally manages the session
// cookie. This generic proxy never sets cookies — it only reads the session cookie
// and attaches it as a Bearer token.

import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE } from "../../../lib/session";

const VARYS_URL = process.env.VARYS_URL;

if (!VARYS_URL) {
  // Surface the misconfiguration loudly at boot rather than per-request.
  console.error("VARYS_URL is not set — proxy will fail.");
}

type RouteContext = { params: Promise<{ path: string[] }> };

async function forward(request: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  if (!VARYS_URL) {
    return NextResponse.json({ detail: "server_misconfigured" }, { status: 500 });
  }
  const { path } = await ctx.params;
  const subpath = path.join("/");
  const search = request.nextUrl.search;
  const target = `${VARYS_URL}/api/${subpath}${search}`;

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
  return new NextResponse(responseText, {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
  });
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const DELETE = forward;
