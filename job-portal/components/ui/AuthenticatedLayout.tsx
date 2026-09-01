'use client';
import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  allowedRoles?: ('student' | 'recruiter' | 'admin')[];
}

export default function AuthenticatedLayout({
  children,
  allowedRoles,
}: AuthenticatedLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    } else if (status === 'authenticated' && allowedRoles && session?.user?.role) {
      if (!allowedRoles.includes(session.user.role as any)) {
        router.replace('/');
      }
    }
  }, [status, session, allowedRoles, router]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface-light gap-3">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-text-secondary text-sm font-medium">Validating credentials…</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  // Redirect if role is invalid
  if (allowedRoles && session?.user?.role && !allowedRoles.includes(session.user.role as any)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface-light text-text-primary antialiased flex">
      {/* Dynamic Collapsible Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="ml-16 lg:ml-[240px] flex-1 flex flex-col min-h-screen overflow-x-hidden relative bg-surface-light">
        <div className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
