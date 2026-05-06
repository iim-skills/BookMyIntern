'use client';
import { useState, useEffect }     from 'react';
import { useSession }              from 'next-auth/react';
import { useRouter, useParams }    from 'next/navigation';
import Link                        from 'next/link';
import ApplyModal                  from '@/components/ApplyModal';
import type { IJob, IApplication } from '@/types';

export default function JobDetailPage() {
  const { data: session, status } = useSession();
  const router  = useRouter();
  const { id }  = useParams<{ id: string }>();

  const [job,       setJob]       = useState<IJob | null>(null);
  const [notFound,  setNotFound]  = useState(false);
  const [applied,   setApplied]   = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [flashMsg,  setFlashMsg]  = useState('');
  const [showModal, setShowModal] = useState(false);

  // Load job — public, no auth needed
  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then((r) => r.json())
      .then((d: IJob & { error?: string }) => {
        if (d.error) setNotFound(true); else setJob(d);
        setLoading(false);
      });
  }, [id]);

  // Check if student already applied
  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role !== 'student') return;
    fetch('/api/applications/student')
      .then((r) => r.json())
      .then((d: IApplication[]) => {
        if (Array.isArray(d))
          setApplied(d.some((a) => (typeof a.jobId === 'object' ? a.jobId._id : a.jobId) === id));
      });
  }, [status, session, id]);

  const handleApplyClick = () => {
    if (!session) { router.push(`/login?callbackUrl=/jobs/${id}`); return; }
    setShowModal(true);
  };

  const handleApplySuccess = () => {
    setApplied(true);
    setShowModal(false);
    setFlashMsg('Application submitted successfully! 🎉');
    setTimeout(() => setFlashMsg(''), 4000);
  };

  if (loading)
    return <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading…</p>;
  if (notFound || !job)
    return <p style={{ padding: 40 }}>Job not found. <Link href="/jobs">← Back to jobs</Link></p>;

  const expired   = new Date(job.deadline) < new Date();
  const isStudent = session?.user?.role === 'student';

  return (
    <div className="dashboard">
      <div style={{ marginBottom: 14 }}><Link href="/jobs">← Back to Jobs</Link></div>

      <div className="card">
        <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>{job.title}</div>
        <div style={{ fontSize: '1rem', color: '#6b7280', marginBottom: 12 }}>{job.companyName}</div>

        <div style={{ marginBottom: 14 }}>
          <span className="tag">{job.jobType}</span>
          {job.salary && <span className="tag tag-green">{job.salary}</span>}
          {expired    && <span className="tag tag-red">Deadline Passed</span>}
        </div>

        <table style={{ fontSize: '0.86rem', borderCollapse: 'collapse', marginBottom: 16, width: '100%' }}>
          <tbody>
            <tr>
              <td style={{ paddingRight: 20, paddingBottom: 6, color: '#6b7280', width: 110 }}>Location</td>
              <td style={{ paddingBottom: 6 }}>{job.location}</td>
            </tr>
            <tr>
              <td style={{ paddingRight: 20, paddingBottom: 6, color: '#6b7280' }}>Deadline</td>
              <td style={{ paddingBottom: 6 }}>{new Date(job.deadline).toLocaleDateString()}</td>
            </tr>
            {job.eligibility && (
              <tr>
                <td style={{ paddingRight: 20, paddingBottom: 6, color: '#6b7280' }}>Eligibility</td>
                <td style={{ paddingBottom: 6 }}>{job.eligibility}</td>
              </tr>
            )}
            {job.skills?.length > 0 && (
              <tr>
                <td style={{ paddingRight: 20, paddingBottom: 6, color: '#6b7280' }}>Skills</td>
                <td style={{ paddingBottom: 6 }}>{job.skills.join(', ')}</td>
              </tr>
            )}
          </tbody>
        </table>

        <h3 style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: 7 }}>Job Description</h3>
        <p style={{ fontSize: '0.875rem', lineHeight: 1.65, whiteSpace: 'pre-wrap', color: '#374151', marginBottom: 18 }}>
          {job.description}
        </p>

        {flashMsg && <div className="alert alert-success">{flashMsg}</div>}

        {!session && (
          <button className="btn btn-primary" onClick={handleApplyClick}>
            Sign in to Apply
          </button>
        )}

        {isStudent && (
          applied ? (
            <span className="tag tag-green" style={{ fontSize: '0.875rem', padding: '6px 14px' }}>
              ✓ Applied
            </span>
          ) : (
            <button className="btn btn-primary" onClick={handleApplyClick} disabled={expired}>
              {expired ? 'Applications Closed' : 'Apply Now'}
            </button>
          )
        )}
      </div>

      {showModal && job && (
        <ApplyModal
          job={job}
          onClose={() => setShowModal(false)}
          onSuccess={handleApplySuccess}
        />
      )}
    </div>
  );
}
