'use client';

import { useState, useEffect, useCallback, ChangeEvent, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthenticatedLayout from '@/components/ui/AuthenticatedLayout';
import KPICard from '@/components/ui/KPICard';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import VerificationModal from '@/components/VerificationModal';
import JobForm from '@/components/JobForm';
import type { IJob, IApplication, JobFormData, ApplicationStatus } from '@/types';

interface ApplicantStudent { _id: string; name: string; email: string }
interface ApplicantView { jobId: string; title: string; list: IApplication[] }

const ALL_STATUSES: { value: ApplicationStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'interview', label: 'Interview' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'selected', label: 'Selected' },
  { value: 'rejected', label: 'Rejected' },
];

const REVIEWABLE: ApplicationStatus[] = ['selected', 'rejected', 'on-hold', 'interview', 'reviewed'];

// Helper to resolve company logos or fallbacks
const getCompanyLogo = (companyName: string) => {
  const name = companyName.toLowerCase();
  if (name.includes('google')) {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdUB3QQkdUoKAZtKJJWJwdV8rc97vQ3mou8LZDMu04Q2pIMtuQ1jaQkoijPjXRMqUBkx0SPg3JG0nzIar32BmdD5ow7fm971NrkxerhqeyZOuQnPbRL-VS_slV1D84P8KWzga3JsSmwO6KKh-VBcdihTeot1HjdwZzchMg0Pjh_h2VCQK3TriWJzPNeS0ShN-FXeGezxy1Rx0eD3tpUnZUq1HFX8-VDb_Web2CV3v9B3KmXE278SFigoJdehaVViBhvAC47eD7bODU';
  }
  if (name.includes('spotify')) {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyS99Pm6i-rd7df9RZSE0G6HApIO_Bb6U_2LLtn96SRcAnQiqLL0SLL9Zl3Wcm8LNlusPyLsfUTD4WQUcF0uVTdJEDnWycf8wqTzdDiDaQNUFHL8gfim0iksnmRJGQlgnWZ5uev1LF_U9zl--fj7erESM9g9mFso5gyOvJgzLIVhSyGf4jAJWSCnqdF9VaZUrHpgFjE-a2soqimJMVG0a269JV6VtsIZZe7n7cFD01c-0XffBim2YXQE4F0RSqPyW7CVuApCQ6ye-h';
  }
  if (name.includes('amazon')) {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDivvapzqUEdxgFYIP8YcR_XdhaGBUiVhWUYlRWL1f7GTIEzCDTcrhslfuAOPpqTsPG9pnYliAhb1NJBH14wVaMU3flfOg7eG_0wTReK7MKhmDmrZkltywwS89eYFh9X7rfwHTJUkusA45WNEmThTRZzvwaXmAMhziJ8c7X4LaQ7QI35gl63_lno6HA4s9hkdXNJbnPo92LDGj1bmd9C5TS3MAT5G_lPowYWHddBBssM_m9JL08SYtcUvbvcnBCe__FD66m63-ea0E';
  }
  if (name.includes('apple')) {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVWH0z031mk5Hg6zkW_6dilHIceQ5R2_kluBguZTHUGwF3zlxaFTfddNXLCGU4fq-5HhQzERqLTSWppsH8P3gwkRcRomlY6G2HlHRH1-eSUFBwev1K72CwsYP29EMlso3-lMD5IIMaUufMmZgAL5ySYTm2dIenwUujgmZIxQMPoLiD8iOOVTq_fkunOEnQpF5hcezeFTXHj8suptVRK_v2eLM9gf4WyvYCjlF_qkPpvOUxtowe7JAiZhPlJhmvgIfhVCMWg678j0nX';
  }
  if (name.includes('microsoft')) {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUxE12iCs8OTnM0CZ1B7cKGvRESuFWNfHnRJimNV_wmPl7Yc4RyNj2hJzpfae0pdfMnf3MR_neeacZQMuHYO6c-oddxesvRHI9kHNM098CNyEiDOKcsFZTdQ31CpaKRwKbMEu-ywS3yCMCbZVXdWeFdXa904H53Xc_OaGRCeX21BashoRxbmeq8xihK20xwSG-kRC7z4KvyMkxZJE8naIi7k8TIXEFzhGDOX8nr15DZQPUNKguVSI1GNisodEfOQWP1cjT3eT2qWTU';
  }
  return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&auto=format&fit=crop&q=60';
};

// Helper to compute initials from company name safely
const getCompanyInitials = (companyName: string) => {
  if (!companyName) return 'CO';
  const parts = companyName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export default function RecruiterDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [submitted, setSubmitted] = useState<boolean | null>(null);
  const [adminVerified, setAdminVerified] = useState(false);
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editJob, setEditJob] = useState<IJob | null>(null);
  const [applicants, setApplicants] = useState<ApplicantView | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [statusSaving, setStatusSaving] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState('');

  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [duplicateJobData, setDuplicateJobData] = useState<Partial<JobFormData> | null>(null);

  const loadJobs = useCallback(async () => {
    setJobsLoading(true);
    const res = await fetch('/api/recruiter/jobs');
    const d = await res.json() as IJob[];
    setJobs(Array.isArray(d) ? d : []);
    setJobsLoading(false);
  }, []);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/recruiter/verify')
      .then((r) => r.json())
      .then((d: { submitted?: boolean; adminVerified?: boolean }) => {
        setSubmitted(!!d.submitted);
        setAdminVerified(!!d.adminVerified);
        if (d.adminVerified) void loadJobs();
      });
  }, [status, loadJobs]);

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 3500);
  };

  const toggleExpand = (id: string) =>
    setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const handleCreate = async (form: JobFormData) => {
    setFormLoading(true);
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      }),
    });
    const data = await res.json() as { error?: string };
    setFormLoading(false);
    if (!res.ok) {
      flash(data.error ?? 'Error posting job.');
      return;
    }
    setShowCreate(false);
    flash('Job opportunity posted successfully! 🚀');
    void loadJobs();
  };

  const handleEdit = async (form: JobFormData) => {
    if (!editJob) return;
    setFormLoading(true);
    const res = await fetch(`/api/jobs/${editJob._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      }),
    });
    const data = await res.json() as { error?: string };
    setFormLoading(false);
    if (!res.ok) {
      flash(data.error ?? 'Error updating job.');
      return;
    }
    setEditJob(null);
    flash('Job opportunity details updated.');
    void loadJobs();
  };

  const handleDelete = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this listing and all its applications? This action is irreversible.')) return;
    const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
    if (!res.ok) {
      flash('Error deleting job listing.');
      return;
    }
    flash('Job listing removed successfully.');
    void loadJobs();
  };

  const viewApplicants = async (job: IJob) => {
    const res = await fetch(`/api/recruiter/jobs/${job._id}/applicants`);
    const data = await res.json() as IApplication[];
    setApplicants({ jobId: job._id, title: job.title, list: Array.isArray(data) ? data : [] });
    setSelectedAppIds([]);
    setExpanded({});
  };

  const handleDuplicate = (job: IJob) => {
    setDuplicateJobData({
      companyName: job.companyName,
      title: `${job.title} (Copy)`,
      description: job.description,
      location: job.location,
      jobType: job.jobType,
      salary: job.salary,
      skills: Array.isArray(job.skills) ? job.skills.join(', ') : '',
      deadline: '',
      eligibility: job.eligibility,
      stipendAmount: job.stipendAmount,
      durationWeeks: job.durationWeeks,
      ppoPossibility: job.ppoPossibility,
      internCertificate: job.internCertificate,
    });
    setShowCreate(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const bulkUpdateStatus = async (newStatus: ApplicationStatus) => {
    if (selectedAppIds.length === 0) return;
    setStatusSaving('bulk');
    try {
      await Promise.all(
        selectedAppIds.map((appId) =>
          fetch(`/api/recruiter/jobs/${applicants!.jobId}/applicants/${appId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
          })
        )
      );
      setApplicants((prev) =>
        prev
          ? {
              ...prev,
              list: prev.list.map((a) =>
                selectedAppIds.includes(a._id) ? { ...a, status: newStatus } : a
              ),
            }
          : prev
      );
      setSelectedAppIds([]);
      flash(`Bulk updated ${selectedAppIds.length} candidate(s) to ${newStatus.toUpperCase()}.`);
    } catch (err) {
      flash('Failed bulk status update.');
    } finally {
      setStatusSaving(null);
    }
  };

  const exportCSV = () => {
    if (!applicants || applicants.list.length === 0) return;
    const listToExport = selectedAppIds.length > 0
      ? applicants.list.filter((a) => selectedAppIds.includes(a._id))
      : applicants.list;

    const headers = ['Name', 'Email', 'Phone', 'Experience', 'Education', 'Skills', 'Status', 'Applied Date'];
    const rows = listToExport.map((a) => {
      const student = a.studentId as ApplicantStudent | null;
      return [
        student?.name ?? '',
        student?.email ?? '',
        a.phone ?? '',
        a.yearsOfExperience ?? '',
        a.education ?? '',
        a.applicantSkills ?? '',
        a.status,
        new Date(a.createdAt).toLocaleDateString(),
      ].map((val) => `"${val.replace(/"/g, '""')}"`);
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${applicants.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_applicants.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateStatus = async (appId: string, newStatus: ApplicationStatus) => {
    if (!applicants) return;
    setStatusSaving(appId);
    const res = await fetch(`/api/recruiter/jobs/${applicants.jobId}/applicants/${appId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setStatusSaving(null);
    if (!res.ok) {
      flash('Failed to update status.');
      return;
    }
    setApplicants((prev) =>
      prev
        ? {
            ...prev,
            list: prev.list.map((a) => (a._id === appId ? { ...a, status: newStatus } : a)),
          }
        : prev
    );
  };

  const messageStudent = async (studentId: string, jobId: string) => {
    setChatLoading(studentId);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otherUserId: studentId, jobId }),
      });
      const data = await res.json() as { _id?: string };
      if (res.ok && data._id) router.push(`/chat/${data._id}`);
    } finally {
      setChatLoading(null);
    }
  };

  if (status === 'loading' || submitted === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface-light gap-3 select-none">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-text-muted text-xs font-semibold">Validating session credentials…</p>
      </div>
    );
  }

  // View state wrapper
  const wrap = (content: React.ReactNode) => {
    return <AuthenticatedLayout allowedRoles={['recruiter']}>{content}</AuthenticatedLayout>;
  };

  // State 1: Verification Form setup modal is blocking
  if (!submitted) {
    return wrap(
      <div className="flex items-center justify-center py-10">
        <VerificationModal onVerified={() => { setSubmitted(true); setAdminVerified(false); }} />
      </div>
    );
  }

  // State 2: Verified details submitted but pending admin review
  if (!adminVerified) {
    return wrap(
      <div className="min-h-[50vh] flex items-center justify-center py-12">
        <div className="w-full max-w-md bg-white border border-surface-mid rounded-card-lg shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-accent-amber/15 text-accent-amber rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="material-symbols-outlined text-[32px] animate-pulse">hourglass_top</span>
          </div>
          <h1 className="text-xl font-display font-extrabold text-text-primary tracking-tight mb-2">Verification Pending</h1>
          <p className="text-xs text-text-secondary leading-relaxed mb-6 font-semibold">
            Your recruiter organization details are currently undergoing admin verification.
            You will be unlocked to publish listings once the review completes.
          </p>
          <div className="border-t border-slate-100 pt-4 text-[10px] text-text-muted font-bold uppercase tracking-wider">
            Check back shortly or contact helpdesk.
          </div>
        </div>
      </div>
    );
  }

  // State 3: Viewing applicants for a selected job
  if (applicants) {
    return wrap(
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-mid pb-6">
          <div>
            <Button
              className="text-xs font-bold"
              variant="outline"
              size="sm"
              icon={<span className="material-symbols-outlined text-sm font-bold">arrow_back</span>}
              onClick={() => { setApplicants(null); setSelectedAppIds([]); }}
            >
              Back to Listings
            </Button>
            <h2 className="text-2xl font-display font-extrabold text-text-primary mt-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">group</span>
              Applicants &mdash; <span className="text-primary">{applicants.title}</span>
            </h2>
          </div>
          <span className="text-xs font-bold text-primary bg-primary/10 px-3.5 py-2 border border-primary/20 rounded-xl select-none">
            {applicants.list.length} Candidate{applicants.list.length !== 1 ? 's' : ''} Vetted
          </span>
        </div>

        {msg && (
          <div className="bg-accent-rose/10 text-accent-rose border border-accent-rose/20 text-xs font-semibold rounded-xl py-3 px-4 flex items-center gap-2 mb-4 animate-pulse">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{msg}</span>
          </div>
        )}

        {/* Bulk Actions & CSV Export Bar */}
        {applicants.list.length > 0 && (
          <div className="bg-white border border-surface-mid p-4 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 select-none">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="select-all"
                className="w-4 h-4 text-primary border-surface-mid rounded focus:ring-primary/20 cursor-pointer"
                checked={selectedAppIds.length === applicants.list.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedAppIds(applicants.list.map((a) => a._id));
                  } else {
                    setSelectedAppIds([]);
                  }
                }}
              />
              <label htmlFor="select-all" className="text-xs font-bold text-text-secondary cursor-pointer">
                {selectedAppIds.length > 0 ? `${selectedAppIds.length} selected` : 'Select All Candidates'}
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {selectedAppIds.length > 0 && (
                <>
                  <Button
                    disabled={statusSaving === 'bulk'}
                    onClick={() => void bulkUpdateStatus('interview')}
                    variant="outline"
                    size="sm"
                    className="text-xs font-bold text-accent-indigo border-accent-indigo/20 bg-accent-indigo/5 hover:bg-accent-indigo/10 shrink-0"
                    icon={<span className="material-symbols-outlined text-[14px]">calendar_month</span>}
                  >
                    Invite Interview
                  </Button>
                  <Button
                    disabled={statusSaving === 'bulk'}
                    onClick={() => void bulkUpdateStatus('selected')}
                    variant="outline"
                    size="sm"
                    className="text-xs font-bold text-accent-teal border-accent-teal/20 bg-accent-teal/5 hover:bg-accent-teal/10 shrink-0"
                    icon={<span className="material-symbols-outlined text-[14px]">check_circle</span>}
                  >
                    Shortlist
                  </Button>
                  <Button
                    disabled={statusSaving === 'bulk'}
                    onClick={() => void bulkUpdateStatus('rejected')}
                    variant="outline"
                    size="sm"
                    className="text-xs font-bold text-accent-rose border-accent-rose/25 bg-accent-rose/5 hover:bg-accent-rose/10 shrink-0"
                    icon={<span className="material-symbols-outlined text-[14px]">cancel</span>}
                  >
                    Reject
                  </Button>
                </>
              )}
              <Button
                onClick={exportCSV}
                variant="secondary"
                size="sm"
                className="text-xs font-bold border border-surface-mid hover:bg-slate-50 shadow-sm ml-auto"
                icon={<span className="material-symbols-outlined text-[14px]">download</span>}
              >
                Export CSV
              </Button>
            </div>
          </div>
        )}

        {applicants.list.length === 0 ? (
          <div className="text-center border border-dashed border-surface-mid rounded-xl py-16 px-5 bg-white shadow-sm max-w-lg mx-auto select-none">
            <span className="material-symbols-outlined text-4xl text-text-muted mb-2">assignment_ind</span>
            <p className="font-extrabold text-text-secondary text-sm">No applications yet</p>
            <span className="text-xs text-text-muted font-medium mt-1.5 max-w-xs mx-auto block leading-relaxed">
              We will notify you once students start submitting cover pitches for this role.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {applicants.list.map((a) => {
              const student = a.studentId as ApplicantStudent | null;
              const saving = statusSaving === a._id;
              const canReview = REVIEWABLE.includes(a.status);
              const isOpen = !!expanded[a._id];
              return (
                <div
                  className={`bg-white p-5 rounded-xl border transition-all duration-200 ${
                    selectedAppIds.includes(a._id)
                      ? 'border-primary shadow-blue pl-4 border-l-4'
                      : 'border-surface-mid hover:border-slate-300 hover:shadow-sm'
                  }`}
                  key={a._id}
                >
                  <div className="flex items-start gap-4">
                    <div className="pt-3.5 select-none shrink-0">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary border-surface-mid rounded focus:ring-primary/20 cursor-pointer"
                        checked={selectedAppIds.includes(a._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAppIds((prev) => [...prev, a._id]);
                          } else {
                            setSelectedAppIds((prev) => prev.filter((id) => id !== a._id));
                          }
                        }}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center font-extrabold text-sm shrink-0 border border-primary-light/50 select-none">
                            {student?.name ? student.name[0].toUpperCase() : 'A'}
                          </div>
                          <div className="min-w-0 select-none">
                            <div className="font-extrabold text-sm md:text-base text-text-primary leading-tight">{student?.name}</div>
                            <div className="text-xs text-text-secondary font-medium mt-0.5">{student?.email}</div>
                            <div className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-wide">
                              Applied: {new Date(a.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 lg:justify-end border-t border-slate-100 lg:border-none pt-3.5 lg:pt-0 select-none">
                          <StatusBadge status={a.status} />

                          <select
                            className="bg-white border border-surface-mid hover:border-slate-300 text-text-secondary font-bold text-xs px-2.5 py-1.5 rounded-lg transition-all focus:outline-none focus:border-primary cursor-pointer outline-none shadow-sm"
                            value={a.status}
                            disabled={saving}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                              void updateStatus(a._id, e.target.value as ApplicationStatus)
                            }
                          >
                            {ALL_STATUSES.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>

                          {saving && <span className="text-[10px] text-text-muted font-bold animate-pulse">saving…</span>}

                          {student && (
                            <Button
                              onClick={() => void messageStudent(student._id, applicants.jobId)}
                              disabled={chatLoading === student._id}
                              variant="ghost"
                              size="sm"
                              className="text-xs font-bold py-1.5"
                              icon={<span className="material-symbols-outlined text-[14px]">forum</span>}
                            >
                              {chatLoading === student._id ? '…' : 'Message'}
                            </Button>
                          )}

                          {student && canReview && (
                            <Link
                              href={`/reviews/write?studentId=${student._id}&jobId=${applicants.jobId}&studentName=${encodeURIComponent(student.name)}`}
                              className="decoration-none"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs font-bold text-accent-indigo border-accent-indigo/25 bg-accent-indigo/5 hover:bg-accent-indigo/10 py-1.5"
                                icon={<span className="material-symbols-outlined text-[14px]">stars</span>}
                              >
                                Review
                              </Button>
                            </Link>
                          )}

                          <button
                            onClick={() => toggleExpand(a._id)}
                            className="p-1.5 border border-surface-mid rounded-lg text-text-muted hover:text-text-primary bg-transparent hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px] flex items-center justify-center">
                              {isOpen ? 'expand_less' : 'expand_more'}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Expanded detail card logs */}
                      {isOpen && (
                        <div className="mt-5 pt-5 border-t border-dashed border-slate-100 space-y-4 animate-slideDown">
                          
                          {(a.phone || a.yearsOfExperience || a.education || a.applicantSkills) && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-surface-mid text-xs font-semibold text-text-secondary select-none">
                              {a.phone && (
                                <div>
                                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Phone contact</span>
                                  <p className="text-text-primary font-extrabold mt-0.5">{a.phone}</p>
                                </div>
                              )}
                              {a.yearsOfExperience && (
                                <div>
                                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Experience level</span>
                                  <p className="text-text-primary font-extrabold mt-0.5">{a.yearsOfExperience}</p>
                                </div>
                              )}
                              {a.education && (
                                <div>
                                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Submitted Education</span>
                                  <p className="text-text-primary font-extrabold mt-0.5 truncate">{a.education}</p>
                                </div>
                              )}
                              {a.applicantSkills && (
                                <div>
                                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Acquired Skills</span>
                                  <p className="text-text-primary font-extrabold mt-0.5 truncate">{a.applicantSkills}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {a.coverLetter && (
                            <div className="space-y-1">
                              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Cover Letter Pitch</span>
                              <p className="text-xs text-text-secondary font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-surface-mid whitespace-pre-wrap">
                                {a.coverLetter}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider select-none">Attached Resume:</span>
                            {a.resumePath ? (
                              <a
                                href={a.resumePath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-surface-mid rounded-lg text-xs font-bold text-text-primary decoration-none transition-colors shadow-sm"
                              >
                                <span className="material-symbols-outlined text-[16px] text-text-muted">description</span>
                                <span>{a.resumeFilename || 'View Resume Document'}</span>
                              </a>
                            ) : (
                              <span className="italic text-text-muted text-xs select-none">No file uploaded</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // State 4: Editing an existing job post
  if (editJob) {
    const initial: Partial<JobFormData> = {
      companyName: editJob.companyName,
      title: editJob.title,
      description: editJob.description,
      location: editJob.location,
      jobType: editJob.jobType,
      salary: editJob.salary,
      skills: Array.isArray(editJob.skills) ? editJob.skills.join(', ') : '',
      deadline: editJob.deadline ? new Date(editJob.deadline).toISOString().slice(0, 10) : '',
      eligibility: editJob.eligibility,
      stipendAmount: editJob.stipendAmount,
      durationWeeks: editJob.durationWeeks,
      ppoPossibility: editJob.ppoPossibility,
      internCertificate: editJob.internCertificate,
    };

    return wrap(
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center gap-3 border-b border-surface-mid pb-6">
          <Button
            className="text-xs font-bold"
            variant="outline"
            size="sm"
            icon={<span className="material-symbols-outlined text-sm font-bold">arrow_back</span>}
            onClick={() => setEditJob(null)}
          >
            Cancel
          </Button>
          <h2 className="text-2xl font-display font-extrabold text-text-primary tracking-tight">Edit Job Listing</h2>
        </div>

        {msg && (
          <div className="bg-accent-rose/10 text-accent-rose border border-accent-rose/20 text-xs font-semibold rounded-xl py-3 px-4 flex items-center gap-2 mb-4 animate-pulse select-none">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{msg}</span>
          </div>
        )}

        <div className="bg-white border border-surface-mid rounded-xl p-6 shadow-sm">
          <JobForm initial={initial} onSubmit={handleEdit} onCancel={() => setEditJob(null)} loading={formLoading} />
        </div>
      </div>
    );
  }

  // Default dashboard listings state
  const isSuccess = msg.includes('posted') || msg.includes('updated') || msg.includes('deleted');
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => new Date(j.deadline) >= new Date()).length;
  const closedJobs = totalJobs - activeJobs;

  return wrap(
    <div className="space-y-6">
      
      {/* Recruiter Workspace Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-mid pb-4 select-none">
        <div>
          <h1 className="text-xl font-display font-extrabold text-text-primary tracking-tight">Recruiter Dashboard</h1>
          <p className="text-[11px] text-text-muted font-bold uppercase tracking-wider mt-0.5">
            Employer portal &mdash; {session?.user?.name || 'Recruiter'}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Link href="/reviews" className="decoration-none">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-bold shadow-sm"
              icon={<span className="material-symbols-outlined text-sm">stars</span>}
            >
              Reviews
            </Button>
          </Link>
          <Link href="/chat" className="decoration-none">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-bold shadow-sm"
              icon={<span className="material-symbols-outlined text-sm">forum</span>}
            >
              Messages
            </Button>
          </Link>
          <Button
            onClick={() => {
              setShowCreate((s) => !s);
              setMsg('');
            }}
            variant="primary"
            size="sm"
            className="text-xs font-bold shadow-sm"
            icon={<span className="material-symbols-outlined text-sm font-bold">{showCreate ? 'close' : 'add'}</span>}
          >
            {showCreate ? 'Cancel' : 'Post New Job'}
          </Button>
        </div>
      </section>

      {msg && (
        <div
          className={`border text-xs font-semibold rounded-xl py-3.5 px-4 flex items-center gap-2 mb-4 select-none animate-pulse ${
            isSuccess ? 'bg-accent-teal/10 text-accent-teal border-accent-teal/20' : 'bg-accent-rose/10 text-accent-rose border-accent-rose/25'
          }`}
        >
          <span className="material-symbols-outlined text-sm">{isSuccess ? 'check_circle' : 'error'}</span>
          <span>{msg}</span>
        </div>
      )}

      {/* Slide down publish form */}
      {showCreate && (
        <div className="bg-white border border-surface-mid rounded-xl p-6 shadow-md animate-slideDown">
          <div className="text-sm font-display font-extrabold text-text-primary border-b border-slate-100 pb-3 mb-5 flex items-center gap-1.5 select-none uppercase tracking-wider">
            <span className="material-symbols-outlined text-primary">post_add</span>
            <span>Publish a New Opportunity</span>
          </div>
          
          <JobForm
            initial={duplicateJobData || undefined}
            onSubmit={(form) => {
              void handleCreate(form);
              setDuplicateJobData(null);
            }}
            onCancel={() => {
              setShowCreate(false);
              setDuplicateJobData(null);
            }}
            loading={formLoading}
          />
        </div>
      )}

      {/* Recruiter stats row */}
      <section className="grid grid-cols-3 gap-4">
        <KPICard
          title="Total Positions posted"
          value={totalJobs}
          icon={<span className="material-symbols-outlined text-[20px]">work</span>}
        />
        <KPICard
          title="Active Listings"
          value={activeJobs}
          icon={<span className="material-symbols-outlined text-[20px] text-accent-teal">check_circle</span>}
        />
        <KPICard
          title="Closed Openings"
          value={closedJobs}
          icon={<span className="material-symbols-outlined text-[20px] text-accent-rose">cancel</span>}
        />
      </section>

      {/* Listings details */}
      <section className="space-y-4 pt-4">
        <h3 className="text-base font-display font-extrabold text-text-primary uppercase tracking-wider flex items-center gap-1.5 select-none">
          <span className="material-symbols-outlined text-primary text-xl">list_alt</span>
          <span>Your Posted Listings ({jobs.length})</span>
        </h3>

        {jobsLoading ? (
          <div className="space-y-4">
            {[1, 2].map((s) => (
              <div key={s} className="bg-white border border-surface-mid p-6 rounded-xl animate-pulse space-y-3">
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center border border-dashed border-surface-mid rounded-xl py-16 px-5 bg-white shadow-sm max-w-lg mx-auto select-none">
            <span className="material-symbols-outlined text-4xl text-text-muted mb-2">work_outline</span>
            <p className="font-extrabold text-text-secondary text-sm">No jobs posted yet</p>
            <span className="text-xs text-text-muted font-medium mt-1.5 max-w-xs mx-auto block leading-relaxed">
              Create your first job post using the Action button at the top to start recruiting talent.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {jobs.map((job) => (
              <div
                className="bg-white p-5 border border-surface-mid rounded-xl shadow-sm hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                key={job._id}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Fallback image */}
                    <div className="w-12 h-12 rounded-xl bg-white border border-surface-mid shadow-sm flex items-center justify-center p-1.5 overflow-hidden shrink-0 select-none">
                      <img
                        alt={job.companyName}
                        className="w-8 h-8 object-contain"
                        src={getCompanyLogo(job.companyName)}
                      />
                    </div>
                    
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm md:text-base text-text-primary leading-tight">
                        {job.title}
                      </h4>
                      <p className="text-xs text-text-secondary font-semibold mt-1 flex items-center gap-1.5 select-none">
                        <span>{job.companyName}</span>
                        <span className="text-slate-300">&bull;</span>
                        <span>{job.location}</span>
                      </p>
                      
                      <div className="mt-3 flex flex-wrap gap-2 select-none">
                        <span className="px-2.5 py-0.5 bg-surface-light border border-surface-mid text-text-secondary text-[10px] rounded font-bold uppercase tracking-wider">
                          {job.jobType}
                        </span>
                        {job.salary && (
                          <span className="px-2.5 py-0.5 bg-accent-teal/10 text-accent-teal text-[10px] rounded font-bold uppercase tracking-wider">
                            {job.salary}
                          </span>
                        )}
                        {job.stipendAmount && job.stipendAmount > 0 && (
                          <span className="px-2.5 py-0.5 bg-accent-teal/10 text-accent-teal text-[10px] rounded font-bold uppercase tracking-wider font-mono">
                            ₹{job.stipendAmount.toLocaleString()}/mo
                          </span>
                        )}
                      </div>
                      
                      <p className="text-[10px] text-text-muted font-bold mt-3.5 flex items-center gap-1.5 select-none uppercase tracking-wide">
                        <span className="material-symbols-outlined text-xs">calendar_today</span>
                        <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                        <span className="text-slate-200">&bull;</span>
                        <span>Posted: {new Date(job.createdAt || '').toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex flex-wrap gap-2 items-center lg:self-end border-t border-slate-100 lg:border-none pt-3.5 lg:pt-0 select-none">
                    <Button
                      onClick={() => void viewApplicants(job)}
                      variant="primary"
                      size="sm"
                      className="text-xs font-bold"
                      icon={<span className="material-symbols-outlined text-[14px]">group</span>}
                    >
                      Applicants
                    </Button>
                    <Button
                      onClick={() => handleDuplicate(job)}
                      variant="secondary"
                      size="sm"
                      className="text-xs font-bold border border-surface-mid hover:bg-slate-50"
                      icon={<span className="material-symbols-outlined text-[14px]">content_copy</span>}
                    >
                      Duplicate
                    </Button>
                    <Button
                      onClick={() => {
                        setEditJob(job);
                        setMsg('');
                      }}
                      variant="secondary"
                      size="sm"
                      className="text-xs font-bold border border-surface-mid hover:bg-slate-50"
                      icon={<span className="material-symbols-outlined text-[14px]">edit</span>}
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => void handleDelete(job._id)}
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold text-accent-rose border-accent-rose/25 bg-accent-rose/5 hover:bg-accent-rose/10"
                      icon={<span className="material-symbols-outlined text-[14px]">delete</span>}
                    >
                      Delete
                    </Button>
                    <Link href={`/jobs/${job._id}`} className="decoration-none">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs font-bold border border-surface-mid hover:bg-slate-50"
                        icon={<span className="material-symbols-outlined text-[14px]">open_in_new</span>}
                      >
                        Preview
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
