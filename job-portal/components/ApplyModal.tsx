'use client';
import { useState, useRef, ChangeEvent, FormEvent, useEffect } from 'react';
import type { IJob } from '@/types';

interface ApplyModalProps {
  job:       IJob;
  onClose:   () => void;
  onSuccess: (jobId: string) => void;
}

const EXP_OPTIONS = [
  'No experience (fresher)',
  'Less than 1 year',
  '1–2 years',
  '2–4 years',
  '4–7 years',
  '7–10 years',
  '10+ years',
];

const EDU_OPTIONS = [
  'High School / 12th',
  'Diploma',
  "Bachelor's Degree",
  "Master's Degree",
  'PhD / Doctorate',
  'Other',
];

const MAX_MB   = 5;
const MAX_SIZE = MAX_MB * 1024 * 1024;

export default function ApplyModal({ job, onClose, onSuccess }: ApplyModalProps) {
  const [step, setStep]       = useState<1 | 2>(1);
  const [phone,      setPhone]      = useState('');
  const [exp,        setExp]        = useState('');
  const [edu,        setEdu]        = useState('');
  const [skills,     setSkills]     = useState('');
  const [cover,      setCover]      = useState('');
  const [file,       setFile]       = useState<File | null>(null);
  const [fileErr,    setFileErr]    = useState('');
  const [dragOver,   setDragOver]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  const fileRef = useRef<HTMLInputElement>(null);
  const expired = new Date(job.deadline) < new Date();

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // ── File validation ──────────────────────────────────────────────────────
  const validateFile = (f: File): string => {
    if (f.type !== 'application/pdf') return 'Only PDF files are accepted.';
    if (f.size > MAX_SIZE) return `File is too large. Max size is ${MAX_MB} MB.`;
    return '';
  };
  const pickFile = (f: File | undefined) => {
    setFileErr('');
    if (!f) { setFile(null); return; }
    const err = validateFile(f);
    if (err) { setFileErr(err); setFile(null); return; }
    setFile(f);
  };

  // ── Step 1 validation ────────────────────────────────────────────────────
  const step1Valid = (): boolean => {
    if (!phone.trim()) { setError('Please enter your phone number.'); return false; }
    if (!exp)          { setError('Please select your experience level.'); return false; }
    if (!edu)          { setError('Please select your education level.'); return false; }
    return true;
  };

  // ── Final submit ─────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const data = new FormData();
    data.append('jobId',             job._id);
    data.append('phone',             phone);
    data.append('yearsOfExperience', exp);
    data.append('education',         edu);
    data.append('applicantSkills',   skills);
    data.append('coverLetter',       cover);
    if (file) data.append('resume',  file);

    setSubmitting(true);
    try {
      const res = await fetch('/api/applications', { method: 'POST', body: data });
      // Always parse as text first, then try JSON — prevents the crash when
      // the server accidentally returns HTML
      const text = await res.text();
      let json: { error?: string } = {};
      try { json = JSON.parse(text) as { error?: string }; }
      catch { json = { error: `Unexpected server response. (${res.status})` }; }

      if (!res.ok) { setError(json.error ?? 'Submission failed. Please try again.'); return; }
      onSuccess(job._id);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-bg" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="apply-modal-box" role="dialog" aria-modal="true" aria-labelledby="apply-title">

        {/* ── Sticky header ── */}
        <div className="apply-modal-header">
          <div>
            <div id="apply-title" className="apply-modal-title">Apply — {job.title}</div>
            <div className="apply-modal-sub">
              {job.companyName}&nbsp;·&nbsp;{job.location}&nbsp;·&nbsp;
              <span className="tag" style={{ fontSize: '0.7rem', padding: '1px 7px' }}>
                {job.jobType}
              </span>
            </div>
          </div>
          <button className="apply-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* ── Step indicator ── */}
        <div className="apply-steps">
          <div className={`apply-step ${step === 1 ? 'active' : 'done'}`}>
            <span className="apply-step-num">{step === 2 ? '✓' : '1'}</span>
            Your Details
          </div>
          <div className="apply-step-line" />
          <div className={`apply-step ${step === 2 ? 'active' : ''}`}>
            <span className="apply-step-num">2</span>
            Resume &amp; Submit
          </div>
        </div>

        {/* ── Body — ALL alerts and step content live here ── */}
        <div className="apply-modal-body">
          {expired && (
            <div className="alert alert-error">
              This job&apos;s application deadline has passed.
            </div>
          )}
          {error && (
            <div className="alert alert-error">{error}</div>
          )}

          {/* ══ STEP 1 ══ */}
          {step === 1 && (
            <div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel" value={phone} placeholder="+91 9000000000"
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Years of Experience *</label>
                  <select value={exp} onChange={(e) => setExp(e.target.value)}>
                    <option value="">Select…</option>
                    {EXP_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Highest Education *</label>
                <select value={edu} onChange={(e) => setEdu(e.target.value)}>
                  <option value="">Select…</option>
                  {EDU_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>
                  Your Skills&nbsp;
                  <span style={{ fontWeight: 400, color: '#9ca3af' }}>(comma-separated)</span>
                </label>
                <input
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, TypeScript, Node.js…"
                />
              </div>

              <div className="form-group">
                <label>Cover Letter / Note to Recruiter</label>
                <textarea
                  value={cover}
                  onChange={(e) => setCover(e.target.value)}
                  placeholder="Why are you a great fit for this role?"
                  rows={4}
                  maxLength={1500}
                />
                <div style={{ fontSize: '0.7rem', color: '#9ca3af', textAlign: 'right', marginTop: 2 }}>
                  {cover.length}/1500
                </div>
              </div>

              <div style={{ display: 'flex', gap: 9, justifyContent: 'flex-end' }}>
                <button type="button" className="btn" onClick={onClose}>Cancel</button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={expired}
                  onClick={() => { setError(''); if (step1Valid()) setStep(2); }}
                >
                  Next: Resume →
                </button>
              </div>
            </div>
          )}

          {/* ══ STEP 2 ══ */}
          {step === 2 && (
            <form onSubmit={handleSubmit}>
              {/* Drop zone */}
              <div
                className={`resume-dropzone${dragOver ? ' dragover' : ''}${file ? ' has-file' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault(); setDragOver(false);
                  pickFile(e.dataTransfer.files[0]);
                }}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef} type="file" accept="application/pdf"
                  style={{ display: 'none' }}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => pickFile(e.target.files?.[0])}
                />
                {file ? (
                  <div className="resume-file-info">
                    <span className="resume-file-icon">📄</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{file.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB&nbsp;·&nbsp;
                        <button
                          type="button"
                          style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.78rem', padding: 0 }}
                          onClick={(e) => {
                            e.stopPropagation(); setFile(null);
                            if (fileRef.current) fileRef.current.value = '';
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="resume-drop-icon">📁</span>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>
                      Drag &amp; drop your resume here
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                      or click to browse&nbsp;·&nbsp;PDF only&nbsp;·&nbsp;max {MAX_MB} MB
                    </div>
                  </div>
                )}
              </div>

              {fileErr && (
                <div style={{ color: '#dc2626', fontSize: '0.82rem', marginTop: 6 }}>{fileErr}</div>
              )}

              <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: '8px 0 16px' }}>
                Resume is optional but strongly recommended.
              </p>

              {/* Step 1 summary */}
              <div className="apply-summary">
                <div className="apply-summary-title">Application Summary</div>
                <div className="apply-summary-grid">
                  <span className="apply-summary-label">Phone</span><span>{phone}</span>
                  <span className="apply-summary-label">Experience</span><span>{exp}</span>
                  <span className="apply-summary-label">Education</span><span>{edu}</span>
                  {skills && (
                    <><span className="apply-summary-label">Skills</span><span>{skills}</span></>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 9, justifyContent: 'space-between', marginTop: 16 }}>
                <button
                  type="button" className="btn"
                  onClick={() => { setStep(1); setError(''); }}
                  disabled={submitting}
                >
                  ← Back
                </button>
                <button
                  type="submit" className="btn btn-primary"
                  disabled={submitting || expired || !!fileErr}
                >
                  {submitting ? 'Submitting…' : 'Submit Application'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
