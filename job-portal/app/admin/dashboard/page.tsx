'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession }  from 'next-auth/react';
import { useRouter }   from 'next/navigation';
import type { IRecruiterProfile, IReview, IJob, IApplication } from '@/types';

type Tab = 'recruiters' | 'reviews' | 'jobs' | 'applications';

async function adminDelete(url: string): Promise<{ ok: boolean; error?: string }> {
  const res  = await fetch(url, { method: 'DELETE' });
  const data = await res.json() as { ok?: boolean; error?: string };
  return { ok: res.ok, error: data.error };
}

function Stars({ rating }: { rating: number }) {
  return (
    <span>
      {[1,2,3,4,5].map((n) => (
        <span key={n} style={{ color: n <= rating ? '#f59e0b' : '#d1d5db', fontSize: '0.85rem' }}>★</span>
      ))}
    </span>
  );
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tab,          setTab]         = useState<Tab>('recruiters');
  const [recruiters,   setRecruiters]  = useState<IRecruiterProfile[]>([]);
  const [reviews,      setReviews]     = useState<IReview[]>([]);
  const [jobs,         setJobs]        = useState<IJob[]>([]);
  const [applications, setApplications]= useState<IApplication[]>([]);
  const [loading,      setLoading]     = useState(false);
  const [flash,        setFlash]       = useState('');

  const showFlash = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(''), 3000); };

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
    if (status === 'authenticated' && session.user.role !== 'admin') router.replace('/jobs');
  }, [status, session, router]);

  const loadTab = useCallback(async (t: Tab) => {
    setLoading(true);
    try {
      const urls: Record<Tab, string> = {
        recruiters:   '/api/admin/recruiters',
        reviews:      '/api/admin/reviews',
        jobs:         '/api/admin/jobs',
        applications: '/api/admin/applications',
      };
      const res  = await fetch(urls[t]);
      const data = await res.json();
      if (t === 'recruiters')   setRecruiters(Array.isArray(data) ? data : []);
      if (t === 'reviews')      setReviews(Array.isArray(data) ? data : []);
      if (t === 'jobs')         setJobs(Array.isArray(data) ? data : []);
      if (t === 'applications') setApplications(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') void loadTab(tab);
  }, [tab, status, loadTab]);

  if (status === 'loading')
    return <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading…</p>;

  const handleVerify = async (profileId: string, verify: boolean) => {
    const res = await fetch(`/api/admin/recruiters/${profileId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminVerified: verify }),
    });
    if (res.ok) {
      setRecruiters((prev) => prev.map((r) =>
        r._id === profileId ? { ...r, adminVerified: verify } : r
      ));
      showFlash(verify ? 'Recruiter verified ✓' : 'Recruiter unverified');
    } else { showFlash('Failed to update.'); }
  };

  const handleDelete = async <T extends { _id: string }>(
    id: string, endpoint: string, setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    if (!window.confirm('Delete this item permanently?')) return;
    const { ok, error } = await adminDelete(`${endpoint}/${id}`);
    if (ok) { setter((prev) => prev.filter((x) => x._id !== id)); showFlash('Deleted.'); }
    else showFlash(error ?? 'Delete failed.');
  };

  const tabBtn = (t: Tab, label: string, count: number) => (
    <button
      onClick={() => setTab(t)}
      style={{
        padding: '9px 18px', border: 'none', background: 'none', cursor: 'pointer',
        fontSize: '0.875rem', fontWeight: tab === t ? 700 : 400,
        color: tab === t ? '#2563eb' : '#6b7280',
        borderBottom: tab === t ? '2px solid #2563eb' : '2px solid transparent',
        marginBottom: -1,
      }}
    >
      {label} ({count})
    </button>
  );

  return (
    <div className="dashboard">
      <div className="page-hd">
        <div>
          <h1>Admin Dashboard</h1>
          <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: 3 }}>
            {session?.user?.email}
          </p>
        </div>
      </div>

      {flash && (
        <div className={`alert ${flash.includes('failed') || flash.includes('Failed') ? 'alert-error' : 'alert-success'}`}>
          {flash}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e4e4e7', marginBottom: 20, flexWrap: 'wrap' }}>
        {tabBtn('recruiters',   'Recruiters',   recruiters.length)}
        {tabBtn('reviews',      'Reviews',      reviews.length)}
        {tabBtn('jobs',         'Jobs',         jobs.length)}
        {tabBtn('applications', 'Applications', applications.length)}
      </div>

      {loading && <p style={{ color: '#9ca3af', fontSize: '0.88rem', padding: '20px 0' }}>Loading…</p>}

      {/* ══ RECRUITERS ══ */}
      {!loading && tab === 'recruiters' && (
        <div>
          <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: 14 }}>
            Recruiters who submitted firm details. Verify them to allow job posting.
          </p>
          {recruiters.length === 0 ? <div className="empty">No recruiter profiles yet.</div>
            : recruiters.map((r) => {
              const user = typeof r.userId === 'object' ? r.userId : null;
              return (
                <div className="card" key={r._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{r.firmName}</div>
                      <div style={{ fontSize: '0.82rem', color: '#6b7280', margin: '3px 0' }}>
                        {user && <>{user.name} &middot; {user.email}</>}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#374151' }}>
                        {r.designation}
                        {r.firmWebsite && <> &middot; <a href={r.firmWebsite} target="_blank" rel="noopener noreferrer">{r.firmWebsite}</a></>}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 3 }}>
                        Phone: {r.phone} &nbsp;|&nbsp; Submitted: {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                      <span className={`tag ${r.adminVerified ? 'tag-green' : 'tag-yellow'}`}>
                        {r.adminVerified ? '✓ Verified' : '⏳ Pending'}
                      </span>
                      {r.adminVerified
                        ? <button className="btn btn-sm btn-danger" onClick={() => void handleVerify(r._id, false)}>Unverify</button>
                        : <button className="btn btn-sm btn-primary" onClick={() => void handleVerify(r._id, true)}>Verify ✓</button>
                      }
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* ══ REVIEWS ══ */}
      {!loading && tab === 'reviews' && (
        <div>
          <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: 14 }}>All reviews. You can delete any.</p>
          {reviews.length === 0 ? <div className="empty">No reviews yet.</div>
            : reviews.map((r) => {
              const reviewer = typeof r.reviewerId === 'object' ? r.reviewerId : null;
              const reviewee = typeof r.revieweeId === 'object' ? r.revieweeId : null;
              const job      = typeof r.jobId === 'object' && r.jobId ? r.jobId : null;
              return (
                <div className="card" key={r._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{reviewer?.name}</span>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'capitalize' }}>({reviewer?.role})</span>
                        <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>→ reviewed</span>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{reviewee?.name}</span>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'capitalize' }}>({reviewee?.role})</span>
                      </div>
                      {job && (
                        <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: 5 }}>
                          re: {(job as { title?: string }).title} — {(job as { companyName?: string }).companyName}
                        </div>
                      )}
                      <Stars rating={r.rating} />
                      <p style={{ fontSize: '0.85rem', color: '#374151', marginTop: 6, lineHeight: 1.55 }}>{r.content}</p>
                      <div style={{ fontSize: '0.74rem', color: '#9ca3af', marginTop: 5 }}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button className="btn btn-sm btn-danger" style={{ flexShrink: 0 }}
                      onClick={() => void handleDelete(r._id, '/api/admin/reviews', setReviews)}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* ══ JOBS ══ */}
      {!loading && tab === 'jobs' && (
        <div>
          <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: 14 }}>
            All job posts. Deleting a job also removes all its applications.
          </p>
          {jobs.length === 0 ? <div className="empty">No jobs yet.</div>
            : jobs.map((j) => {
              const recruiter = (j as unknown as { recruiterId?: { name?: string; email?: string } }).recruiterId;
              return (
                <div className="card" key={j._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div className="card-title">{j.title}</div>
                      <div className="card-sub">{j.companyName} &mdash; {j.location}</div>
                      <div style={{ marginBottom: 6 }}>
                        <span className="tag">{j.jobType}</span>
                        {j.salary && <span className="tag tag-green">{j.salary}</span>}
                      </div>
                      {recruiter && <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>By: {recruiter.name} ({recruiter.email})</div>}
                      <div style={{ fontSize: '0.74rem', color: '#9ca3af', marginTop: 3 }}>
                        Deadline: {new Date(j.deadline).toLocaleDateString()} &nbsp;|&nbsp; Posted: {new Date(j.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button className="btn btn-sm btn-danger" style={{ flexShrink: 0 }}
                      onClick={() => void handleDelete(j._id, '/api/admin/jobs', setJobs)}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* ══ APPLICATIONS ══ */}
      {!loading && tab === 'applications' && (
        <div>
          <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: 14 }}>All student applications.</p>
          {applications.length === 0 ? <div className="empty">No applications yet.</div>
            : applications.map((a) => {
              const job     = typeof a.jobId     === 'object' ? a.jobId     as IJob : null;
              const student = typeof a.studentId === 'object' ? a.studentId as { _id: string; name: string; email: string } : null;
              return (
                <div className="card" key={a._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {student?.name}
                        <span style={{ fontSize: '0.78rem', color: '#9ca3af', marginLeft: 8 }}>{student?.email}</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#6b7280', margin: '3px 0' }}>
                        Applied to: <strong>{job?.title}</strong> at {job?.companyName}
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                        <span className={`tag s-${a.status}`}>{a.status}</span>
                        {a.resumePath && (
                          <a href={a.resumePath} target="_blank" rel="noopener noreferrer"
                            className="tag tag-green" style={{ textDecoration: 'none' }}>📄 Resume</a>
                        )}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#9ca3af', marginTop: 4 }}>
                        Applied: {new Date(a.createdAt).toLocaleDateString()}
                        {a.phone && <> &nbsp;|&nbsp; {a.phone}</>}
                      </div>
                    </div>
                    <button className="btn btn-sm btn-danger" style={{ flexShrink: 0 }}
                      onClick={() => void handleDelete(a._id, '/api/admin/applications', setApplications)}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
