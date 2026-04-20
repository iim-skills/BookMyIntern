'use client';
import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { useSession }                                     from 'next-auth/react';
import { useRouter }                                      from 'next/navigation';
import Link                                               from 'next/link';
import VerificationModal from '@/components/VerificationModal';
import JobForm           from '@/components/JobForm';
import type { IJob, IApplication, JobFormData, ApplicationStatus } from '@/types';

interface ApplicantStudent { _id: string; name: string; email: string }
interface ApplicantView    { jobId: string; title: string; list: IApplication[] }

const ALL_STATUSES: { value: ApplicationStatus; label: string }[] = [
  { value: 'pending',   label: 'Pending'   },
  { value: 'reviewed',  label: 'Reviewed'  },
  { value: 'interview', label: 'Interview' },
  { value: 'on-hold',   label: 'On Hold'   },
  { value: 'selected',  label: 'Selected'  },
  { value: 'rejected',  label: 'Rejected'  },
];

const STATUS_CLS: Record<ApplicationStatus, string> = {
  pending:   's-pending',
  reviewed:  's-reviewed',
  interview: 's-interview',
  'on-hold': 's-on-hold',
  selected:  's-selected',
  rejected:  's-rejected',
};

const REVIEWABLE: ApplicationStatus[] = ['selected', 'rejected', 'on-hold', 'interview', 'reviewed'];

export default function RecruiterDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [verified,     setVerified]     = useState<boolean | null>(null);
  const [jobs,         setJobs]         = useState<IJob[]>([]);
  const [showCreate,   setShowCreate]   = useState(false);
  const [editJob,      setEditJob]      = useState<IJob | null>(null);
  const [applicants,   setApplicants]   = useState<ApplicantView | null>(null);
  const [formLoading,  setFormLoading]  = useState(false);
  const [jobsLoading,  setJobsLoading]  = useState(false);
  const [statusSaving, setStatusSaving] = useState<string | null>(null);
  const [chatLoading,  setChatLoading]  = useState<string | null>(null);
  const [reviewLoading,setReviewLoading]= useState<string | null>(null);
  const [msg,          setMsg]          = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
    if (status === 'authenticated' && session.user.role !== 'recruiter') router.replace('/jobs');
  }, [status, session, router]);

  const loadJobs = useCallback(async () => {
    setJobsLoading(true);
    const res = await fetch('/api/recruiter/jobs');
    const d   = await res.json() as IJob[];
    setJobs(Array.isArray(d) ? d : []);
    setJobsLoading(false);
  }, []);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/recruiter/verify').then((r) => r.json()).then((d: { verified: boolean }) => {
      setVerified(d.verified);
      if (d.verified) void loadJobs();
    });
  }, [status, loadJobs]);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3500); };

  const handleCreate = async (form: JobFormData) => {
    setFormLoading(true);
    const res  = await fetch('/api/jobs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean) }),
    });
    const data = await res.json() as { error?: string };
    setFormLoading(false);
    if (!res.ok) { flash(data.error ?? 'Error.'); return; }
    setShowCreate(false); flash('Job posted!'); void loadJobs();
  };

  const handleEdit = async (form: JobFormData) => {
    if (!editJob) return;
    setFormLoading(true);
    const res  = await fetch(`/api/jobs/${editJob._id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean) }),
    });
    const data = await res.json() as { error?: string };
    setFormLoading(false);
    if (!res.ok) { flash(data.error ?? 'Error.'); return; }
    setEditJob(null); flash('Job updated.'); void loadJobs();
  };

  const handleDelete = async (jobId: string) => {
    if (!window.confirm('Delete this job and all its applications?')) return;
    const res  = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
    const data = await res.json() as { error?: string };
    if (!res.ok) { flash(data.error ?? 'Error.'); return; }
    flash('Job deleted.'); void loadJobs();
  };

  const viewApplicants = async (job: IJob) => {
    const res  = await fetch(`/api/recruiter/jobs/${job._id}/applicants`);
    const data = await res.json() as IApplication[];
    setApplicants({ jobId: job._id, title: job.title, list: Array.isArray(data) ? data : [] });
  };

  const updateStatus = async (appId: string, newStatus: ApplicationStatus) => {
    if (!applicants) return;
    setStatusSaving(appId);
    const res = await fetch(
      `/api/recruiter/jobs/${applicants.jobId}/applicants/${appId}`,
      { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) }
    );
    setStatusSaving(null);
    if (!res.ok) { flash('Failed to update status.'); return; }
    setApplicants((prev) => prev ? {
      ...prev,
      list: prev.list.map((a) => a._id === appId ? { ...a, status: newStatus } : a),
    } : prev);
  };

  const messageStudent = async (studentId: string, jobId: string) => {
    setChatLoading(studentId);
    try {
      const res  = await fetch('/api/conversations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otherUserId: studentId, jobId }),
      });
      const data = await res.json() as { _id?: string };
      if (res.ok && data._id) router.push(`/chat/${data._id}`);
    } finally { setChatLoading(null); }
  };

  const reviewStudent = async (studentId: string, jobId: string) => {
    setReviewLoading(studentId);
    try {
      const res  = await fetch('/api/reviews', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revieweeId: studentId, jobId, rating: 5, content: '' }),
      });
      // Pre-navigate to reviews page for the full form
      router.push(`/reviews/write?studentId=${studentId}&jobId=${jobId}`);
    } finally { setReviewLoading(null); }
  };

  if (status === 'loading' || verified === null)
    return <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading…</p>;
  if (!verified)
    return <VerificationModal onVerified={() => { setVerified(true); void loadJobs(); }} />;

  /* ── Applicants panel ── */
  if (applicants) return (
    <div className="dashboard">
      <div className="page-hd">
        <div>
          <button className="btn btn-sm" onClick={() => setApplicants(null)}>← Back</button>
          <h1 style={{ marginTop: 10 }}>Applicants — {applicants.title}</h1>
        </div>
        <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>
          {applicants.list.length} applicant{applicants.list.length !== 1 ? 's' : ''}
        </span>
      </div>
      {msg && <div className="alert alert-error">{msg}</div>}
      {applicants.list.length === 0 ? (
        <div className="empty">No applicants yet.</div>
      ) : (
        applicants.list.map((a) => {
          const student   = a.studentId as ApplicantStudent | null;
          const saving    = statusSaving === a._id;
          const canReview = REVIEWABLE.includes(a.status);
          return (
            <div className="card" key={a._id}>
              <div className="applicant-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{student?.name}</div>
                  <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>{student?.email}</div>
                  <div style={{ fontSize: '0.74rem', color: '#9ca3af', marginTop: 2 }}>
                    Applied: {new Date(a.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="applicant-actions">
                  <span className={`tag ${STATUS_CLS[a.status] ?? ''}`}>{a.status}</span>
                  <select
                    className="status-select"
                    value={a.status}
                    disabled={saving}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      void updateStatus(a._id, e.target.value as ApplicationStatus)
                    }
                    title="Change applicant status"
                  >
                    {ALL_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  {saving && <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>saving…</span>}
                  {student && (
                    <button
                      className="btn btn-sm btn-chat"
                      disabled={chatLoading === student._id}
                      onClick={() => void messageStudent(student._id, applicants.jobId)}
                    >
                      {chatLoading === student._id ? '…' : '💬 Message'}
                    </button>
                  )}
                  {student && canReview && (
                    <Link
                      href={`/reviews/write?studentId=${student._id}&jobId=${applicants.jobId}&studentName=${encodeURIComponent(student.name)}`}
                      className="btn btn-sm btn-review"
                    >
                      ⭐ Review
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  /* ── Edit sub-view ── */
  if (editJob) {
    const initial: Partial<JobFormData> = {
      companyName: editJob.companyName, title: editJob.title, description: editJob.description,
      location: editJob.location, jobType: editJob.jobType, salary: editJob.salary,
      skills:   Array.isArray(editJob.skills) ? editJob.skills.join(', ') : '',
      deadline: editJob.deadline ? new Date(editJob.deadline).toISOString().slice(0, 10) : '',
      eligibility: editJob.eligibility,
    };
    return (
      <div className="dashboard">
        <div className="page-hd"><h1>Edit Job</h1></div>
        {msg && <div className="alert alert-error">{msg}</div>}
        <div className="card">
          <JobForm initial={initial} onSubmit={handleEdit} onCancel={() => setEditJob(null)} loading={formLoading} />
        </div>
      </div>
    );
  }

  /* ── Main dashboard ── */
  const isSuccess = msg.includes('posted') || msg.includes('updated') || msg.includes('deleted');
  return (
    <div className="dashboard">
      <div className="page-hd">
        <div>
          <h1>Recruiter Dashboard</h1>
          <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: 3 }}>Welcome, {session?.user?.name}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link href="/reviews"  className="btn btn-sm btn-review">⭐ Reviews</Link>
          <Link href="/chat"     className="btn btn-sm btn-chat">Messages</Link>
          <button className="btn btn-primary" onClick={() => { setShowCreate((s) => !s); setMsg(''); }}>
            {showCreate ? 'Cancel' : '+ Post New Job'}
          </button>
        </div>
      </div>
      {msg && <div className={`alert ${isSuccess ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
      {showCreate && (
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="sec-title" style={{ marginTop: 0 }}>New Job Post</div>
          <JobForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} loading={formLoading} />
        </div>
      )}
      <div className="sec-title">Your Jobs ({jobs.length})</div>
      {jobsLoading ? (
        <p style={{ color: '#9ca3af', fontSize: '0.88rem' }}>Loading…</p>
      ) : jobs.length === 0 ? (
        <div className="empty">No jobs posted yet.</div>
      ) : (
        jobs.map((job) => (
          <div className="card" key={job._id}>
            <div style={{ flex: 1 }}>
              <div className="card-title">{job.title}</div>
              <div className="card-sub">{job.companyName} &mdash; {job.location}</div>
              <div style={{ marginBottom: 6 }}>
                <span className="tag">{job.jobType}</span>
                {job.salary && <span className="tag tag-green">{job.salary}</span>}
              </div>
              <p style={{ fontSize: '0.76rem', color: '#9ca3af' }}>
                Deadline: {new Date(job.deadline).toLocaleDateString()}
                &nbsp;|&nbsp;Posted: {new Date(job.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="job-actions">
              <button className="btn btn-sm" onClick={() => void viewApplicants(job)}>View Applicants</button>
              <button className="btn btn-sm" onClick={() => { setEditJob(job); setMsg(''); }}>Edit</button>
              <button className="btn btn-sm btn-danger" onClick={() => void handleDelete(job._id)}>Delete</button>
              <Link href={`/jobs/${job._id}`} className="btn btn-sm">Preview ↗</Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
