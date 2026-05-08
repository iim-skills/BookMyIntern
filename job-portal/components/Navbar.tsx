'use client';
import { useEffect, useState } from 'react';
import Link                    from 'next/link';
import { useSession }          from 'next-auth/react';
import { usePathname }         from 'next/navigation';
import ProfileMenu             from './ProfileMenu';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname          = usePathname();
  const [unread, setUnread] = useState(0);
  const onChatPage = pathname?.startsWith('/chat/') ?? false;

  useEffect(() => { if (onChatPage) setUnread(0); }, [onChatPage]);

  useEffect(() => {
    if (!session || session.user.role === 'admin') return;
    const fetch_ = () => {
      if (onChatPage) { setUnread(0); return; }
      fetch('/api/conversations/unread')
        .then((r) => r.json())
        .then((d: { count?: number }) => setUnread(d.count ?? 0))
        .catch(() => {});
    };
    fetch_();
    const id = setInterval(fetch_, 15_000);
    return () => clearInterval(id);
  }, [session, onChatPage]);

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          <Link href="/" className="navbar-brand">BookMyIntern</Link>
          <div className="navbar-links">
            <Link href="/jobs">Browse Jobs</Link>
            <Link href="/community-reviews">Reviews</Link>

            {session?.user?.role === 'admin' ? (
              <>
                <Link href="/admin/dashboard" style={{ fontWeight: 700, color: '#dc2626' }}>
                  Admin Panel
                </Link>
                <ProfileMenu />
              </>
            ) : session ? (
              <>
                <Link href="/chat" className="nav-msg-wrap">
                  Messages
                  {unread > 0 && !onChatPage && (
                    <span className="nav-unread-dot" title={`${unread} unread`} />
                  )}
                </Link>
                <Link href="/reviews">My Reviews</Link>
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
