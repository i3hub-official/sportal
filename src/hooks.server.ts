// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { getSession, cleanExpiredSessions } from '$lib/server/auth';
import { building } from '$app/environment';

// ── Rate Limiting Store (in-memory) ──────────────────────────────────────────
// Tracks failed login attempts per IP
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_MAX     = 10;
const RATE_LIMIT_WINDOW  = 15 * 60 * 1000; // 15 minutes

// ── Background Tasks ──────────────────────────────────────────────────────────
if (!building) {
  // Clean expired sessions every hour
  setInterval(() => {
    cleanExpiredSessions().catch(console.error);
  }, 1000 * 60 * 60);

  // Clean stale rate-limit entries every hour
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of loginAttempts.entries()) {
      if (val.resetAt < now) loginAttempts.delete(key);
    }
  }, 1000 * 60 * 60);
}

// ── Rate Limiter ──────────────────────────────────────────────────────────────
function getRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();

  // Prune map if it grows too large (memory safety)
  if (loginAttempts.size > 1000) {
    for (const [key, val] of loginAttempts.entries()) {
      if (val.resetAt < now) loginAttempts.delete(key);
    }
  }

  const entry = loginAttempts.get(ip);

  if (!entry || entry.resetAt < now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetAt: now + RATE_LIMIT_WINDOW };
  }

  entry.count++;
  loginAttempts.set(ip, entry);

  return {
    allowed: entry.count <= RATE_LIMIT_MAX,
    remaining: Math.max(0, RATE_LIMIT_MAX - entry.count),
    resetAt: entry.resetAt
  };
}

// ── Rate Limit Response ───────────────────────────────────────────────────────
function rateLimitResponse(
  isJson: boolean,
  retryAfter: number,
  remaining: number,
  resetAt: number
): Response {
  const headers = {
    'Retry-After': retryAfter.toString(),
    'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetAt / 1000).toString()
  };

  const message = 'Too many login attempts. Try again in 15 minutes.';

  if (isJson) {
    return new Response(
      JSON.stringify({ success: false, message, retryAfter }),
      { status: 429, headers: { 'Content-Type': 'application/json', ...headers } }
    );
  }

  return new Response(
    `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Too Many Attempts</title>
      <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: system-ui, -apple-system, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: #f8fafc;
          color: #1e293b;
        }
        .card {
          text-align: center;
          padding: 2.5rem 2rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          max-width: 420px;
          width: 90%;
        }
        .icon { font-size: 3rem; margin-bottom: 1rem; }
        h1 { font-size: 1.4rem; color: #dc2626; margin-bottom: 0.75rem; }
        p { color: #475569; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem; }
        .timer { font-weight: 600; color: #1e293b; }
        button {
          padding: 0.6rem 1.5rem;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 500;
          transition: background 0.15s;
        }
        button:hover { background: #1d4ed8; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">🔒</div>
        <h1>Too Many Attempts</h1>
        <p>${message}<br><span class="timer">Please wait ${retryAfter} seconds.</span></p>
        <button onclick="history.back()">Go Back</button>
      </div>
    </body>
    </html>`,
    { status: 429, headers: { 'Content-Type': 'text/html', ...headers } }
  );
}

// ── Security Headers ──────────────────────────────────────────────────────────
const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};

// ── Main Handle ───────────────────────────────────────────────────────────────
export const handle: Handle = async ({ event, resolve }) => {
  const { pathname } = event.url;
  const isPost = event.request.method === 'POST';

  // ── Rate limit login endpoints ──────────────────────────────────────────
  const isLoginEndpoint =
    pathname === '/login' ||
    pathname === '/api/auth/login';

  if (isLoginEndpoint && isPost) {
    const forwardedFor = event.request.headers.get('x-forwarded-for');
    const realIp       = event.request.headers.get('x-real-ip');
    const ip           = forwardedFor?.split(',')[0].trim() ?? realIp ?? event.getClientAddress();

    const { allowed, remaining, resetAt } = getRateLimit(ip);

    if (!allowed) {
      const isJson =
        event.request.headers.get('accept')?.includes('application/json') ||
        event.request.headers.get('content-type')?.includes('application/json') ||
        pathname.startsWith('/api/');

      const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
      return rateLimitResponse(!!isJson, retryAfter, remaining, resetAt);
    }
  }

  // ── Load session into locals ────────────────────────────────────────────
  if (!building) {
    try {
      const session = await getSession(event);
      if (session) {
        event.locals.user    = session.user;
        event.locals.session = {
          id:        session.id,
          userId:    session.userId,
          expiresAt: session.expiresAt
        };
      } else {
        event.locals.user    = null;
        event.locals.session = null;
      }
    } catch (err) {
      console.error('[hooks] Failed to load session:', err);
      event.locals.user    = null;
      event.locals.session = null;
    }
  }

  // ── Resolve request ─────────────────────────────────────────────────────
  const response = await resolve(event);

  // ── Attach security headers ─────────────────────────────────────────────
  const secureResponse = new Response(response.body, response);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    if (!secureResponse.headers.has(key)) {
      secureResponse.headers.set(key, value);
    }
  }

  return secureResponse;
};
