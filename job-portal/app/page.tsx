'use client';
import { useSession } from 'next-auth/react';
import { useRouter }  from 'next/navigation';
import { useEffect }  from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.replace('/login');
    else router.replace('/jobs');
  }, [session, status, router]);
  return <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Redirecting…</p>;
}
