'use client';
import { useState, useEffect }     from 'react';
import { useSession }              from 'next-auth/react';
import { useRouter }               from 'next/navigation';
import JobCard                     from '@/components/JobCard';
import ApplyModal                  from '@/components/ApplyModal';
import type { IJob, IApplication } from '@/types';

export default function JobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [jobs,       setJobs]       = useState<IJob[]>([]);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [search,     setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading,    setLoading]    = useState(true);
  const [flashMsg,   setFlashMsg]   = useState('');
  const [applyJob,   setApplyJob]   = useState<IJob | null>(null);

  // Load jobs — no auth required (public page)
  useEffect(() => {
    fetch('/api/jobs')
      .then((r) => r.json())
      .then((d: IJob[]) => { setJobs(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Load applied IDs only for logged-in students
  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role !== 'student') return;
    fetch('/api/applications/student')
      .then((r) => r.json())
      .then((d: IApplication[]) => {
        if (Array.isArray(d))
          setAppliedIds(new Set(d.map((a) => (typeof a.jobId === 'object' ? a.jobId._id : a.jobId))));
      })
      .catch(() => { /* ignore */ });
  }, [status, session]);

  const handleApply = (job: IJob) => {
    if (!session) { router.push('/login?callbackUrl=/jobs'); return; }
    setApplyJob(job);
  };

  const handleApplySuccess = (jobId: string) => {
    setAppliedIds((prev) => new Set([...prev, jobId]));
    setApplyJob(null);
    setFlashMsg('Application submitted successfully! 🎉');
    setTimeout(() => setFlashMsg(''), 4000);
  };

  const displayed = jobs.filter((j) => {
    const q = search.toLowerCase();
    const ok = !q ||
      j.title.toLowerCase().includes(q) ||
      j.companyName.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q);
    return ok && (!typeFilter || j.jobType === typeFilter);
  });

  if (loading)
    return <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading jobs…</p>;

  return (
    <div className="dashboard">
      <div className="page-hd">
        <h1>
          Job Listings{' '}
          <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: '0.9rem' }}>
            ({displayed.length})
          </span>
        </h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            placeholder="Search title, company, location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '6px 10px', border: '1px solid #d1d5db',
              borderRadius: 5, fontSize: '0.85rem', width: 220,
            }}
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 5, fontSize: '0.85rem' }}
          >
            <option value="">All Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
            <option value="remote">Remote</option>
          </select>
        </div>
      </div>

      {!session && (
        <div className="alert" style={{
          background: '#eff6ff', color: '#1d4ed8',
          border: '1px solid #bfdbfe', fontSize: '0.875rem',
        }}>
          <a href="/login">Sign in</a> to apply for jobs, track applications, and message recruiters.
        </div>
      )}

      {flashMsg && <div className="alert alert-success">{flashMsg}</div>}

      {displayed.length === 0
        ? <div className="empty">No jobs found.</div>
        : displayed.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              applied={appliedIds.has(job._id)}
              onApply={handleApply}
              isRecruiter={session?.user?.role === 'recruiter'}
              isGuest={!session}
            />
          ))
      }

      {/* Modal at root level so it overlays the entire viewport */}
      {applyJob && (
        <ApplyModal
          job={applyJob}
          onClose={() => setApplyJob(null)}
          onSuccess={handleApplySuccess}
        />
      )}
    </div>
  );
}
