'use client';
import { useEffect, useState } from 'react';
import Link                    from 'next/link';
import { useSession }          from 'next-auth/react';
import ProfileMenu             from './ProfileMenu';

export default function Navbar() {
  const { data: session } = useSession();
  const [unread, setUnread] = useState(0);

  // Poll for unread messages every 10 seconds while logged in
  useEffect(() => {
    if (!session) return;

    const fetchUnread = () =>
      fetch('/api/conversations/unread')
        .then((r) => r.json())
        .then((d: { count?: number }) => setUnread(d.count ?? 0))
        .catch(() => { /* ignore network hiccups */ });

    void fetchUnread();
    const id = setInterval(() => { void fetchUnread(); }, 10_000);
    return () => clearInterval(id);
  }, [session]);

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          <Link href="/" className="navbar-brand">BookMyIntern</Link>
          <div className="navbar-links">
            {session ? (
              <>
                <Link href="/jobs">Browse Jobs</Link>

                {/* Messages link with red dot if there are unread messages */}
                <Link href="/chat" className="nav-msg-wrap">
                  Messages
                  {unread > 0 && <span className="nav-unread-dot" title={`${unread} unread`} />}
                </Link>

                <Link href="/reviews">Reviews</Link>
                <ProfileMenu />
              </>
            ) : (
              <>
                <Link href="/login">Login</Link>
                <Link href="/signup">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
