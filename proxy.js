import { NextResponse } from 'next/server';

// Proxy to check authentication for protected routes
export async function proxy(request) {
  // Get the pathname
  const { pathname } = request.nextUrl;
  
  // Define protected routes that require authentication
  const protectedRoutes = [
    '/profile',
    '/chats',
    '/api/user',
    '/api/chat',
    // Add more protected routes as needed
  ];
  
  // Define auth routes that authenticated users shouldn't access
  const authRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/verify-mfa' // Add this
  ];
  
  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Get session cookie value properly
  const sessionToken = request.cookies.get('kdsm-session')?.value;
  
  if (isProtectedRoute && !sessionToken) {
    // Redirect to login if trying to access protected route without session
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Redirect authenticated users away from auth pages
  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL('/profile', request.url)); // Redirect to profile instead of /
  }
  
  return NextResponse.next();
}

// Configure which routes this proxy runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
