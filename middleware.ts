import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  const { pathname } = request.nextUrl;
  console.log(`[MIDDLEWARE] Path: ${pathname}, Cookie: ${sessionCookie ? 'present' : 'absent'}`);

  // If there's no session cookie and the user is trying to access a protected route, redirect to login
  if (!sessionCookie && pathname.startsWith('/dashboard')) {
    console.log('[MIDDLEWARE] No cookie, redirecting to login.');
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If there is a cookie, verify it
  if (sessionCookie) {
    try {
      // We just need to check if the token is valid, we don't need the decoded payload here
      jwt.verify(sessionCookie.value, process.env.JWT_SECRET!);
      console.log('[MIDDLEWARE] JWT verification successful.');

      // If the user is authenticated and tries to access the login page, redirect to dashboard
      if (pathname === '/') {
        console.log('[MIDDLEWARE] Authenticated user on login page, redirecting to dashboard.');
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

    } catch (error) {
      // If token verification fails, redirect to login page and clear the invalid cookie
      console.error('[MIDDLEWARE_ERROR] JWT verification failed:', error);
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.set('session', '', { maxAge: 0 });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 