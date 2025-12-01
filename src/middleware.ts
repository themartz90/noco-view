import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Public routes
  const publicPaths = [
    '/auth',
    '/api/auth',
    '/api/health',
    '/api/mood',
    '/api/analyze',
    '/api/ai-analysis',
  ];

  const isPublicPath = publicPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  const isStaticAsset =
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname === '/favicon.ico' ||
    request.nextUrl.pathname === '/logo.png';

  if (isPublicPath || isStaticAsset) {
    const response = NextResponse.next();

    // Security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    return response;
  }

  // Check authentication
  const authCookie = request.cookies.get('auth');

  if (!authCookie || authCookie.value !== 'authenticated') {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  const response = NextResponse.next();

  // Security headers pro authenticated pages
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
