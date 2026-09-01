'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import ProfileMenu from './ProfileMenu';

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const onChatPage = pathname?.startsWith('/chat/') ?? false;
  const isLoggedIn = status === 'authenticated' && !!session?.user;

  useEffect(() => {
    if (onChatPage) setUnread(0);
  }, [onChatPage]);

  useEffect(() => {
    if (!session || !session.user || session.user.role === 'admin') return;
    const fetch_ = () => {
      if (onChatPage) {
        setUnread(0);
        return;
      }
      fetch('/api/conversations/unread')
        .then((r) => r.json())
        .then((d: { count?: number }) => setUnread(d.count ?? 0))
        .catch(() => {});
    };
    fetch_();
    const id = setInterval(fetch_, 15_000);
    return () => clearInterval(id);
  }, [session, onChatPage]);

  const isPortal =
    pathname === '/' ||
    pathname?.startsWith('/student/dashboard') ||
    pathname?.startsWith('/recruiter/dashboard') ||
    pathname?.startsWith('/admin/dashboard') ||
    pathname?.startsWith('/chat') ||
    pathname?.startsWith('/reviews') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/signup') ||
    pathname?.startsWith('/profile');

  if (isPortal) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 shadow-[0_1px_0_#E2E8F0] bg-white/95 backdrop-blur-sm transition-all duration-150 select-none">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Left - Logo */}
        <Link href="/" className="flex items-center select-none decoration-none">
          <span className="font-display font-extrabold text-ink-primary text-xl tracking-tight">Book</span>
          <span className="font-display font-extrabold text-brand-blue text-xl tracking-tight">My</span>
          <span className="font-display font-extrabold text-ink-primary text-xl tracking-tight">Intern</span>
        </Link>

        {/* Center - Links (Hidden on mobile) */}
        <div className="hidden md:flex items-center gap-7">
          <Link
            href="/jobs"
            className="text-sm font-medium text-ink-secondary hover:text-brand-blue transition-colors duration-200 decoration-none"
          >
            Browse Internships
          </Link>
          <Link
            href="/blog"
            className="text-sm font-medium text-ink-secondary hover:text-brand-blue transition-colors duration-200 decoration-none"
          >
            Career Guides
          </Link>
          <Link
            href="/community-reviews"
            className="text-sm font-medium text-ink-secondary hover:text-brand-blue transition-colors duration-200 decoration-none"
          >
            Reviews
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-ink-secondary hover:text-brand-blue transition-colors duration-200 decoration-none"
          >
            About Us
          </Link>
          <Link
            href="/help"
            className="text-sm font-medium text-ink-secondary hover:text-brand-blue transition-colors duration-200 decoration-none"
          >
            Help & FAQ
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <ProfileMenu />
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium px-4 py-2 rounded-[8px] border border-brand-blue text-brand-blue hover:bg-brand-bluelight transition-all duration-200 decoration-none"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="text-sm font-semibold px-4 py-2 rounded-[8px] bg-brand-blue text-white hover:bg-brand-bluedark shadow-blue transition-all duration-200 decoration-none"
              >
                Sign Up Free
              </Link>
            </div>
          )}

          {/* Mobile hamburger icon */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-ink-primary hover:text-brand-blue transition-colors duration-200 focus:outline-none bg-transparent border-none cursor-pointer flex items-center justify-center"
            aria-label="Toggle Menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lift border-t border-surface-mid flex flex-col p-6 gap-5 z-40">
          <Link
            href="/jobs"
            onClick={() => setMenuOpen(false)}
            className="text-base font-medium text-ink-secondary hover:text-brand-blue transition-colors decoration-none"
          >
            Browse Internships
          </Link>
          <Link
            href="/blog"
            onClick={() => setMenuOpen(false)}
            className="text-base font-medium text-ink-secondary hover:text-brand-blue transition-colors decoration-none"
          >
            Career Guides
          </Link>
          <Link
            href="/community-reviews"
            onClick={() => setMenuOpen(false)}
            className="text-base font-medium text-ink-secondary hover:text-brand-blue transition-colors decoration-none"
          >
            Reviews
          </Link>
          <Link
            href="/about"
            onClick={() => setMenuOpen(false)}
            className="text-base font-medium text-ink-secondary hover:text-brand-blue transition-colors decoration-none"
          >
            About Us
          </Link>
          <Link
            href="/help"
            onClick={() => setMenuOpen(false)}
            className="text-base font-medium text-ink-secondary hover:text-brand-blue transition-colors decoration-none"
          >
            Help & FAQ
          </Link>
          
          {isLoggedIn ? (
            <div className="pt-4 border-t border-surface-mid flex justify-center">
              <ProfileMenu />
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-4 border-t border-surface-mid">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="w-full text-center border border-brand-blue text-brand-blue text-sm font-medium py-3 rounded-[8px] hover:bg-brand-bluelight transition-all decoration-none"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="w-full text-center bg-brand-blue text-white text-sm font-semibold py-3 rounded-[8px] hover:bg-brand-bluedark transition-all shadow-blue decoration-none"
              >
                Sign Up Free
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
