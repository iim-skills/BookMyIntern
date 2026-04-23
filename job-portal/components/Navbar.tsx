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

  // If the user is currently inside a chat conversation, they're actively reading it
  // → zero out the dot immediately so it doesn't stay red while they're reading.
  const onChatPage = pathname?.startsWith('/chat/') ?? false;

  useEffect(() => {
    if (onChatPage) setUnread(0);
  }, [onChatPage]);

  // Poll for unread count every 15 s (only when not actively on a chat page)
  useEffect(() => {
    if (!session) return;

    const fetchUnread = () => {
      if (onChatPage) { setUnread(0); return; }
      fetch('/api/conversations/unread')
        .then((r) => r.json())
        .then((d: { count?: number }) => setUnread(d.count ?? 0))
        .catch(() => { /* ignore */ });
    };

    fetchUnread();
    const id = setInterval(fetchUnread, 15_000);
    return () => clearInterval(id);
  }, [session, onChatPage]);

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          <Link href="/" className="navbar-brand">BookMyIntern</Link>
          <div className="navbar-links">
            {session ? (
              <>
                <Link href="/jobs">Browse Jobs</Link>

                <Link href="/chat" className="nav-msg-wrap">
                  Messages
                  {unread > 0 && !onChatPage && (
                    <span className="nav-unread-dot" title={`${unread} unread`} />
                  )}
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
