'use client';
import { useState, useRef, useEffect } from 'react';
import { useSession, signOut }         from 'next-auth/react';
import Link                            from 'next/link';

export default function ProfileMenu() {
  const { data: session } = useSession();
  const [open, setOpen]   = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  if (!session) return null;
  return (
    <div className="pm-wrap" ref={ref}>
      <button className="pm-btn" onClick={() => setOpen((o) => !o)}>
        {session.user.name} ▾
      </button>
      {open && (
        <div className="pm-dropdown">
          <div className="pm-header">
            {session.user.email}<br />
            <strong style={{ textTransform: 'capitalize' }}>{session.user.role}</strong>
          </div>

          {/* Role-specific dashboard links */}
          {session.user.role === 'admin' && (
            <Link href="/admin/dashboard" onClick={() => setOpen(false)}>Admin Dashboard</Link>
          )}
          {session.user.role === 'student' && (
            <Link href="/student/dashboard" onClick={() => setOpen(false)}>My Applications</Link>
          )}
          {session.user.role === 'recruiter' && (
            <Link href="/recruiter/dashboard" onClick={() => setOpen(false)}>Recruiter Dashboard</Link>
          )}

          {/* My Profile — for student and recruiter */}
          {session.user.role !== 'admin' && (
            <Link href="/profile" onClick={() => setOpen(false)}>My Profile</Link>
          )}

          {/* Shared links */}
          {session.user.role !== 'admin' && (
            <>
              <Link href="/chat"    onClick={() => setOpen(false)}>Messages</Link>
              <Link href="/reviews" onClick={() => setOpen(false)}>My Reviews</Link>
            </>
          )}

          <button onClick={() => signOut({ callbackUrl: '/login' })}>Sign Out</button>
        </div>
      )}
    </div>
  );
}
