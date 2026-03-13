import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const DASHBOARD_PREFIX = '/';
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];
const PUBLIC_ROUTES = ['/', '/pricing', '/templates', '/about'];

// Routes that require authentication
const PROTECTED_PREFIXES = [
  '/resumes',
  '/cover-letters',
  '/settings',
  '/job-tracker',
  '/admin',
  '/out-of-credits',
  '/skill-gap',
  '/networking',
  '/interview',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuth = request.cookies.has('auth_present');

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'));

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !hasAuth) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect already-authenticated users away from auth pages
  if (isAuthRoute && hasAuth) {
    return NextResponse.redirect(new URL('/resumes', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, public files
     * - API routes (handled by backend)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
  ],
};
