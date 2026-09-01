'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function ProfileMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  if (!session || !session.user) return null;

  // Generate name initials for a neat avatar circle
  const initials = session.user.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <div className="relative inline-block text-left" ref={ref}>
      {/* Profile Trigger Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-surface-mid hover:border-brand-blue bg-white hover:bg-brand-bluelight text-ink-primary hover:text-brand-blue text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm focus:outline-none"
      >
        <div className="w-6 h-6 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center text-[10px] font-extrabold">
          {initials}
        </div>
        <span className="max-w-[100px] truncate">{session.user.name}</span>
        <span className="text-ink-muted text-xs">▼</span>
      </button>

      {/* Profile Dropdown Panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-surface-mid rounded-[12px] shadow-lift p-1.5 z-50 flex flex-col gap-0.5 origin-top-right focus:outline-none animate-fadeIn">
          {/* Header block */}
          <div className="px-3 py-2.5 border-b border-surface-mid mb-1 flex flex-col">
            <span className="text-xs text-ink-secondary truncate font-medium">
              {session.user.email}
            </span>
            <span className="text-[9px] font-extrabold text-brand-blue uppercase tracking-widest mt-0.5">
              {session.user.role}
            </span>
          </div>

          {/* Role-specific dashboard links */}
          {session.user.role === 'admin' && (
            <Link
              href="/admin/dashboard"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-[8px] text-sm text-ink-secondary hover:text-brand-blue hover:bg-brand-bluelight font-medium transition-colors duration-150 decoration-none"
            >
              Admin Dashboard
            </Link>
          )}
          {session.user.role === 'student' && (
            <Link
              href="/student/dashboard"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-[8px] text-sm text-ink-secondary hover:text-brand-blue hover:bg-brand-bluelight font-medium transition-colors duration-150 decoration-none"
            >
              My Applications
            </Link>
          )}
          {session.user.role === 'recruiter' && (
            <Link
              href="/recruiter/dashboard"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-[8px] text-sm text-ink-secondary hover:text-brand-blue hover:bg-brand-bluelight font-medium transition-colors duration-150 decoration-none"
            >
              Recruiter Dashboard
            </Link>
          )}

          {/* My Profile */}
          {session.user.role !== 'admin' && (
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-[8px] text-sm text-ink-secondary hover:text-brand-blue hover:bg-brand-bluelight font-medium transition-colors duration-150 decoration-none"
            >
              My Profile
            </Link>
          )}

          {/* Chat and Reviews */}
          {session.user.role !== 'admin' && (
            <>
              <Link
                href="/chat"
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-[8px] text-sm text-ink-secondary hover:text-brand-blue hover:bg-brand-bluelight font-medium transition-colors duration-150 decoration-none"
              >
                Messages
              </Link>
              <Link
                href="/reviews"
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-[8px] text-sm text-ink-secondary hover:text-brand-blue hover:bg-brand-bluelight font-medium transition-colors duration-150 decoration-none"
              >
                My Reviews
              </Link>
            </>
          )}

          {/* Divider */}
          <div className="border-t border-surface-mid my-1" />

          {/* Sign Out Trigger */}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full text-left px-3 py-2 rounded-[8px] text-sm text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold transition-colors duration-150 border-none bg-transparent cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
