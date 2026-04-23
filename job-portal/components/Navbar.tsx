'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileMenu from './ProfileMenu';

export default function Navbar() {
  const { data: session } = useSession();
  const [unread, setUnread] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!session) return;

    const fetchUnread = () =>
      fetch('/api/conversations/unread')
        .then((r) => r.json())
        .then((d) => setUnread(d.count ?? 0))
        .catch(() => {});

    fetchUnread();
    const id = setInterval(fetchUnread, 10000);
    return () => clearInterval(id);
  }, [session]);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">

        {/* ✅ LOGO (Fixed like image) */}
        <Link href="/" className="flex items-center font-bold text-lg">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-l">
            Book
          </span>
          <span className="bg-[#0b1b2b] text-white px-3 py-1 rounded-r">
            My Intern
          </span>
        </Link>

        {/* ✅ CENTER MENU (Added) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
          
          <Link href="#">Jobs</Link>
          <Link href="#">Candidates</Link>
          <Link href="#">Employers</Link>
           
        </div>

        {/* ✅ RIGHT SIDE */}
        <div className="flex items-center gap-4">

          {session ? (
            <>
              <Link href="/jobs" className="text-sm hover:text-blue-600">
                Jobs
              </Link>

              {/* Messages with dot */}
              <Link href="/chat" className="relative">
                <svg className="h-6 w-6 text-gray-600 hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>

                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                    {unread}
                  </span>
                )}
              </Link>

              <ProfileMenu />
            </>
          ) : (
            <>
              {/* ✅ LOGIN (Styled like image) */}
              <Link
                href="/login"
                className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
              >
                🔒 Login
              </Link>

              {/* ✅ SIGNUP BUTTON */}
              <Link href="/signup">
                <button className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition">
                  Sign Up
                </button>
              </Link>
            </>
          )}

          {/* ✅ MOBILE MENU BUTTON */}
          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden p-2"
          >
            ☰
          </button>
        </div>
      </div>

      {/* ✅ MOBILE MENU */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="fixed right-0 top-0 h-full w-[280px] bg-white z-50 p-6 shadow-lg"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
            >
              <button
                onClick={() => setIsOpen(false)}
                className="mb-6"
              >
                ✕
              </button>

              <div className="flex flex-col gap-4 text-lg font-medium">
                 
                <Link href="#">Candidates</Link>
                <Link href="#">Employers</Link>
                <Link href="#">Contact</Link>

                {session && <Link href="/jobs">Jobs</Link>}
              </div>

              <div className="mt-8">
                {session ? (
                  <ProfileMenu />
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link href="/login" className="border py-2 text-center rounded">
                      Login
                    </Link>
                    <Link href="/signup" className="bg-blue-600 text-white py-2 text-center rounded">
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}