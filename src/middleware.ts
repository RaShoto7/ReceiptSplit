import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip password check if no password is set
  const appPassword = process.env.APP_PASSWORD;
  if (!appPassword) {
    return NextResponse.next();
  }

  // Skip for the login page, API routes, and static assets
  if (
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const authCookie = request.cookies.get('receiptsplit-auth');

  if (authCookie?.value === appPassword) {
    return NextResponse.next();
  }

  // Redirect to login with the original URL preserved
  const loginUrl = new URL('/login', request.url);

  // Store the original path to redirect back after login
  if (request.nextUrl.pathname !== '/') {
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
  }

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png).*)'],
};
