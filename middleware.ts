// Keeps dashboard sessions alive. The access token stored in the session cookie
// is a short-lived Supabase JWT; on its own it would expire after a couple of
// hours and force a re-login. This middleware runs before every dashboard page
// (SSR) and proxied API call, and — when the access token is missing or about to
// expire — exchanges the refresh token for a fresh session, persisting the
// rotated tokens back to the browser. Server Component render can't set cookies,
// so middleware is the one place that can renew the session for both SSR pages
// and client `/api/proxy` calls.

import { NextRequest, NextResponse } from "next/server";

import {
  REFRESH_COOKIE,
  SESSION_COOKIE,
  getJwtExp,
  sessionCookie,
} from "@/app/lib/session-cookie";

// Renew a bit before the token actually lapses so an in-flight request never
// races the expiry boundary.
const EXPIRY_BUFFER_SECONDS = 60;

const VARYS_URL = process.env.VARYS_URL;

type RefreshResult = { access_token?: string; refresh_token?: string };

function accessTokenIsFresh(access: string | undefined): boolean {
  if (!access) return false;
  const exp = getJwtExp(access);
  if (exp === null) return false;
  const now = Math.floor(Date.now() / 1000);
  return exp - now > EXPIRY_BUFFER_SECONDS;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const access = request.cookies.get(SESSION_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;

  // No refresh token, or the access token is still fresh → nothing to do.
  // (Unauthenticated requests fall here too; the target page redirects to /login.)
  if (!refresh || accessTokenIsFresh(access)) {
    return NextResponse.next();
  }

  if (!VARYS_URL) {
    return NextResponse.next();
  }

  let refreshed: RefreshResult | null = null;
  try {
    const res = await fetch(`${VARYS_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
      cache: "no-store",
    });
    if (res.ok) {
      refreshed = (await res.json()) as RefreshResult;
    } else if (res.status === 401) {
      // Refresh token is invalid/expired/rotated-away → clear the session so the
      // user gets a clean login instead of silent, repeated 401s.
      const response = NextResponse.next();
      response.cookies.set(sessionCookie(SESSION_COOKIE, "", 0));
      response.cookies.set(sessionCookie(REFRESH_COOKIE, "", 0));
      return response;
    }
  } catch {
    // Backend unreachable — keep existing cookies and let the request proceed;
    // the page/proxy handles the resulting auth state on its own.
    return NextResponse.next();
  }

  if (!refreshed?.access_token || !refreshed?.refresh_token) {
    return NextResponse.next();
  }

  // Make the fresh access token visible to downstream handlers (SSR pages and
  // the proxy) within THIS request, then persist both rotated tokens.
  request.cookies.set(SESSION_COOKIE, refreshed.access_token);
  request.cookies.set(REFRESH_COOKIE, refreshed.refresh_token);
  const response = NextResponse.next({ request });
  response.cookies.set(sessionCookie(SESSION_COOKIE, refreshed.access_token));
  response.cookies.set(sessionCookie(REFRESH_COOKIE, refreshed.refresh_token));
  return response;
}

export const config = {
  // Only the authenticated surfaces: dashboard pages (SSR) and the data proxy.
  // Auth endpoints (login/signup) live under /api/proxy/auth/* and are covered,
  // but have no refresh cookie yet, so they short-circuit above.
  matcher: ["/dashboard/:path*", "/api/proxy/:path*"],
};
