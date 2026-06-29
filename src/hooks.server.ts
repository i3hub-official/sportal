// src/hooks.server.ts
import type { Handle, HandleServerError } from '@sveltejs/kit';
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

// ── Friendly Error Page HTML ─────────────────────────────────────────────────
function generateErrorPage(message: string, details: string, status: number): string {
  const isServerError = status >= 500;
  const isConnectionError = message.toLowerCase().includes('connection') || 
                             message.toLowerCase().includes('network') ||
                             message.toLowerCase().includes('fetch');
  
  const icon = isConnectionError ? '🌐' : (isServerError ? '⚠️' : '🔧');
  const title = isConnectionError ? 'Connection Error' : (isServerError ? 'Server Error' : 'Something Went Wrong');
  const bgGradient = isConnectionError ? 'from-orange-50 to-red-50' : 'from-red-50 to-orange-50';
  const buttonText = isConnectionError ? 'Try Again' : 'Refresh Page';
  const buttonAction = isConnectionError ? 'location.reload()' : 'location.reload()';
  
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - LSAI Portal</title>
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #1e293b;
        padding: 1rem;
      }
      .error-card {
        text-align: center;
        padding: 3rem 2rem;
        background: white;
        border-radius: 24px;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
        max-width: 500px;
        width: 100%;
        animation: slideUp 0.5s ease-out;
      }
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .error-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        animation: bounce 1s ease-in-out infinite;
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      h1 {
        font-size: 1.8rem;
        font-weight: 700;
        margin-bottom: 0.75rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .error-message {
        color: #64748b;
        font-size: 0.95rem;
        line-height: 1.6;
        margin-bottom: 1rem;
        padding: 0 1rem;
      }
      .error-details {
        background: #f8fafc;
        padding: 0.75rem;
        border-radius: 12px;
        font-family: 'Courier New', monospace;
        font-size: 0.75rem;
        color: #475569;
        margin: 1rem 0;
        overflow-x: auto;
        text-align: left;
        word-break: break-word;
      }
      .error-code {
        display: inline-block;
        background: #f1f5f9;
        padding: 0.25rem 0.75rem;
        border-radius: 999px;
        font-size: 0.7rem;
        font-weight: 600;
        color: #64748b;
        margin-bottom: 1rem;
      }
      .button-group {
        display: flex;
        gap: 0.75rem;
        justify-content: center;
        margin-top: 1.5rem;
        flex-wrap: wrap;
      }
      .btn-primary {
        padding: 0.6rem 1.5rem;
        background: #2563eb;
        color: white;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 500;
        transition: all 0.15s;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }
      .btn-primary:hover {
        background: #1d4ed8;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      }
      .btn-secondary {
        padding: 0.6rem 1.5rem;
        background: #f1f5f9;
        color: #475569;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 500;
        transition: all 0.15s;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }
      .btn-secondary:hover {
        background: #e2e8f0;
        transform: translateY(-2px);
      }
      .offline-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: #fee2e2;
        color: #dc2626;
        padding: 0.25rem 0.75rem;
        border-radius: 999px;
        font-size: 0.7rem;
        font-weight: 600;
        margin-bottom: 1rem;
      }
      @media (max-width: 640px) {
        .error-card { padding: 2rem 1rem; }
        h1 { font-size: 1.4rem; }
        .button-group { flex-direction: column; }
        .btn-primary, .btn-secondary { width: 100%; justify-content: center; }
      }
    </style>
  </head>
  <body>
    <div class="error-card">
      <div class="error-icon">${icon}</div>
      <div class="error-code">Error ${status}</div>
      <h1>${title}</h1>
      <p class="error-message">${message}</p>
      ${details ? `<div class="error-details">${escapeHtml(details)}</div>` : ''}
      <div class="button-group">
        <button onclick="${buttonAction}" class="btn-primary">
          🔄 ${buttonText}
        </button>
        <a href="/" class="btn-secondary">
          🏠 Go to Homepage
        </a>
      </div>
    </div>
    <script>
      // Check for actual connection status
      if (!navigator.onLine) {
        document.querySelector('.error-message').innerHTML = 'No internet connection detected. Please check your network and try again.';
      }
    </script>
  </body>
  </html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Global Error Handler ──────────────────────────────────────────────────────
export const handleError: HandleServerError = async ({ error, event, status, message }) => {
  console.error('Server error:', error);
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : '';
  
  // Log to your monitoring service if needed
  // await logToMonitoringService(error);
  
  return {
    message: errorMessage,
    stack: building ? undefined : errorStack,
    status: status
  };
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

  // ── Resolve request with error handling ─────────────────────────────────
  try {
    const response = await resolve(event);
    
    // Attach security headers
    const secureResponse = new Response(response.body, response);
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      if (!secureResponse.headers.has(key)) {
        secureResponse.headers.set(key, value);
      }
    }
    
    return secureResponse;
  } catch (error) {
    // Handle various error types
    const err = error instanceof Error ? error : new Error(String(error));
    const status = (err as any).status || 500;
    const isJson = event.request.headers.get('accept')?.includes('application/json');
    
    // Check for connection/network errors
    const isConnectionError = err.message.toLowerCase().includes('connect') ||
                              err.message.toLowerCase().includes('network') ||
                              err.message.toLowerCase().includes('fetch') ||
                              err.message.toLowerCase().includes('econnrefused') ||
                              err.message.toLowerCase().includes('econnreset') ||
                              err.message.toLowerCase().includes('timeout');
    
    const errorMessage = isConnectionError 
      ? 'Unable to connect to the server. Please check your internet connection.'
      : err.message || 'An unexpected error occurred.';
    
    console.error(`[hooks] Error ${status}:`, err);
    
    if (isJson) {
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          status,
          connectionError: isConnectionError
        }),
        {
          status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Return friendly HTML error page
    return new Response(
      generateErrorPage(errorMessage, err.stack || '', status),
      {
        status,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
};