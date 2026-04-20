'use client';
import { useState, useEffect }         from 'react';
import { useSession }                  from 'next-auth/react';
import { useRouter }                   from 'next/navigation';
import JobCard                         from '@/components/JobCard';
import type { IJob, IApplication }     from '@/types';

export default function JobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs,       setJobs]       = useState<IJob[]>([]);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [search,     setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading,    setLoading]    = useState(true);
  const [msg,        setMsg]        = useState('');

  useEffect(() => { if (status === 'unauthenticated') router.replace('/login'); }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/jobs').then((r) => r.json()).then((d: IJob[]) => {
      setJobs(Array.isArray(d) ? d : []); setLoading(false);
    });
    if (session?.user?.role === 'student') {
      fetch('/api/applications/student').then((r) => r.json()).then((d: IApplication[]) => {
        if (Array.isArray(d))
          setAppliedIds(new Set(d.map((a) => (typeof a.jobId === 'object' ? a.jobId._id : a.jobId))));
      });
    }
  }, [status, session]);

  const handleApply = async (jobId: string) => {
    setMsg('');
    const res  = await fetch('/api/applications', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId }),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) { setMsg(data.error ?? 'Error applying.'); return; }
    setAppliedIds((prev) => new Set([...prev, jobId]));
    setMsg('Applied successfully!');
    setTimeout(() => setMsg(''), 3000);
  };

  const displayed = jobs.filter((j) => {
    const q = search.toLowerCase();
    const matchSearch = !q || j.title.toLowerCase().includes(q) ||
      j.companyName.toLowerCase().includes(q) || j.location.toLowerCase().includes(q);
    return matchSearch && (!typeFilter || j.jobType === typeFilter);
  });

  if (status === 'loading' || loading)
    return <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading jobs…</p>;

  return (
    <div className="dashboard">
      <div className="page-hd">
        <h1>Job Listings <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: '0.9rem' }}>({displayed.length})</span></h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input placeholder="Search title, company, location…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 5, fontSize: '0.85rem', width: 220 }} />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 5, fontSize: '0.85rem' }}>
            <option value="">All Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
            <option value="remote">Remote</option>
          </select>
        </div>
      </div>
      {msg && <div className={`alert ${msg.includes('success') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
      {displayed.length === 0 ? <div className="empty">No jobs found.</div> : displayed.map((job) => (
        <JobCard key={job._id} job={job} applied={appliedIds.has(job._id)}
          onApply={handleApply} isRecruiter={session?.user?.role === 'recruiter'} />
      ))}
    </div>
  );
}
