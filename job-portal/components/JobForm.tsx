'use client';
import { useState, ChangeEvent, FormEvent } from 'react';
import type { JobFormData, JobType } from '@/types';

const BLANK: JobFormData = {
  companyName: '', title: '', description: '', location: '',
  jobType: '', salary: '', skills: '', deadline: '', eligibility: '',
};
const REQUIRED: (keyof JobFormData)[] = ['companyName', 'title', 'description', 'location', 'jobType', 'deadline'];

interface Props {
  initial?:  Partial<JobFormData>;
  onSubmit:  (d: JobFormData) => void;
  onCancel?: () => void;
  loading:   boolean;
}

export default function JobForm({ initial, onSubmit, onCancel, loading }: Props) {
  const [form, setForm] = useState<JobFormData>({ ...BLANK, ...initial });
  const [err,  setErr]  = useState('');

  const set = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setErr('');
    for (const k of REQUIRED) { if (!form[k]) { setErr(`"${k}" is required.`); return; } }
    onSubmit(form);
  };

  return (
    <form onSubmit={submit}>
      {err && <div className="alert alert-error">{err}</div>}
      <div className="form-row">
        <div className="form-group"><label>Company Name *</label>
          <input name="companyName" value={form.companyName} onChange={set} /></div>
        <div className="form-group"><label>Job Title *</label>
          <input name="title" value={form.title} onChange={set} /></div>
        <div className="form-group"><label>Location *</label>
          <input name="location" value={form.location} onChange={set} /></div>
        <div className="form-group"><label>Job Type *</label>
          <select name="jobType" value={form.jobType} onChange={set}>
            <option value="">Select type…</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
            <option value="remote">Remote</option>
          </select></div>
        <div className="form-group"><label>Salary / Stipend</label>
          <input name="salary" value={form.salary} onChange={set} placeholder="e.g. ₹5 LPA" /></div>
        <div className="form-group"><label>Application Deadline *</label>
          <input type="date" name="deadline" value={form.deadline} onChange={set} /></div>
      </div>
      <div className="form-group">
        <label>Required Skills <span style={{ fontWeight: 400, color: '#9ca3af' }}>(comma-separated)</span></label>
        <input name="skills" value={form.skills} onChange={set} placeholder="React, Node.js, MongoDB" />
      </div>
      <div className="form-group"><label>Eligibility / Experience Level</label>
        <input name="eligibility" value={form.eligibility} onChange={set} placeholder="0–2 yrs, B.Tech preferred" /></div>
      <div className="form-group"><label>Job Description *</label>
        <textarea name="description" value={form.description} onChange={set} rows={5} /></div>
      <div style={{ display: 'flex', gap: 9 }}>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Save Job'}
        </button>
        {onCancel && <button type="button" className="btn" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
