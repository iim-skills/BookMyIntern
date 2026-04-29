import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token       = req.nextauth.token;
    const { pathname } = req.nextUrl;

    if (pathname.startsWith('/student')   && token?.role !== 'student')
      return NextResponse.redirect(new URL('/jobs', req.url));
    if (pathname.startsWith('/recruiter') && token?.role !== 'recruiter')
      return NextResponse.redirect(new URL('/jobs', req.url));

    return NextResponse.next();
  },
  {
    callbacks: { authorized: ({ token }) => !!token },
  }
);

export const config = {
  matcher: [
    // Authenticated-only areas
    '/student/:path*',
    '/recruiter/:path*',
    '/chat/:path*',
    '/reviews/:path*',
    // NOTE: /jobs, /community-reviews and /company are intentionally
    //       NOT listed here so they are publicly accessible without sign-in.
    //       Individual job-detail pages handle their own auth redirect.
  ],
};
