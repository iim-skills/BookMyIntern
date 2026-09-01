'use client';
import { useState, ChangeEvent, FormEvent } from 'react';
import type { JobFormData, JobType } from '@/types';

const BLANK: JobFormData = {
  companyName: '', title: '', description: '', location: '',
  jobType: '', salary: '', skills: '', deadline: '', eligibility: '',
  stipendAmount: 0, durationWeeks: 0, ppoPossibility: false, internCertificate: false,
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

  const set = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, type } = e.target;
    const val = type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : e.target.value;
    setForm((f) => ({ ...f, [name]: val }));
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setErr('');
    for (const k of REQUIRED) { if (!form[k]) { setErr(`"${k}" is required.`); return; } }
    onSubmit(form);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {err && (
        <div className="alert alert-error mb-4 flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg text-sm animate-pulse">
          <span className="material-symbols-outlined text-base">error</span>
          {err}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="block text-xs font-bold text-brand-text-primary uppercase tracking-wider mb-1">Company Name <span className="text-brand-danger">*</span></label>
          <input
            name="companyName"
            value={form.companyName}
            onChange={set}
            placeholder="e.g. Acme Corp"
            className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary-light/50 transition-all text-sm"
          />
        </div>
        <div className="form-group">
          <label className="block text-xs font-bold text-brand-text-primary uppercase tracking-wider mb-1">Job Title <span className="text-brand-danger">*</span></label>
          <input
            name="title"
            value={form.title}
            onChange={set}
            placeholder="e.g. Frontend Engineer"
            className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary-light/50 transition-all text-sm"
          />
        </div>
        <div className="form-group">
          <label className="block text-xs font-bold text-brand-text-primary uppercase tracking-wider mb-1">Location <span className="text-brand-danger">*</span></label>
          <input
            name="location"
            value={form.location}
            onChange={set}
            placeholder="e.g. Bangalore, India (Remote)"
            className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary-light/50 transition-all text-sm"
          />
        </div>
        <div className="form-group">
          <label className="block text-xs font-bold text-brand-text-primary uppercase tracking-wider mb-1">Job Type <span className="text-brand-danger">*</span></label>
          <select
            name="jobType"
            value={form.jobType}
            onChange={set}
            className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary-light/50 transition-all text-sm bg-white cursor-pointer"
          >
            <option value="">Select type…</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
            <option value="remote">Remote</option>
          </select>
        </div>

        {form.jobType === 'internship' ? (
          <>
            <div className="form-group">
              <label className="block text-xs font-bold text-brand-text-primary uppercase tracking-wider mb-1">Stipend Amount (per month) <span className="font-normal text-slate-400 capitalize">(0 for unpaid)</span></label>
              <input
                type="number"
                name="stipendAmount"
                value={form.stipendAmount ?? 0}
                onChange={set}
                placeholder="e.g. 15000"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary-light/50 transition-all text-sm"
              />
            </div>
            <div className="form-group">
              <label className="block text-xs font-bold text-brand-text-primary uppercase tracking-wider mb-1">Duration (in weeks) <span className="text-brand-danger">*</span></label>
              <input
                type="number"
                name="durationWeeks"
                value={form.durationWeeks ?? 0}
                onChange={set}
                placeholder="e.g. 8"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary-light/50 transition-all text-sm"
              />
            </div>
            <div className="form-group flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="ppoPossibility"
                name="ppoPossibility"
                checked={!!form.ppoPossibility}
                onChange={set}
                className="h-4 w-4 text-brand-primary border-slate-300 rounded focus:ring-brand-primary cursor-pointer"
              />
              <label htmlFor="ppoPossibility" className="text-xs font-bold text-brand-text-primary cursor-pointer">PPO Possibility (Pre-Placement Offer)</label>
            </div>
            <div className="form-group flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="internCertificate"
                name="internCertificate"
                checked={!!form.internCertificate}
                onChange={set}
                className="h-4 w-4 text-brand-primary border-slate-300 rounded focus:ring-brand-primary cursor-pointer"
              />
              <label htmlFor="internCertificate" className="text-xs font-bold text-brand-text-primary cursor-pointer">Internship Certificate Provided</label>
            </div>
          </>
        ) : (
          <div className="form-group">
            <label className="block text-xs font-bold text-brand-text-primary uppercase tracking-wider mb-1">Salary Range</label>
            <input
              name="salary"
              value={form.salary}
              onChange={set}
              placeholder="e.g. ₹5 LPA or ₹25,000 / month"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary-light/50 transition-all text-sm"
            />
          </div>
        )}

        <div className="form-group">
          <label className="block text-xs font-bold text-brand-text-primary uppercase tracking-wider mb-1">Application Deadline <span className="text-brand-danger">*</span></label>
          <input
            type="date"
            name="deadline"
            value={form.deadline}
            onChange={set}
            className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary-light/50 transition-all text-sm cursor-pointer"
          />
        </div>
      </div>
      <div className="form-group">
        <label className="block text-xs font-bold text-brand-text-primary uppercase tracking-wider mb-1">
          Required Skills <span className="font-normal text-slate-400 capitalize">(comma-separated)</span>
        </label>
        <input
          name="skills"
          value={form.skills}
          onChange={set}
          placeholder="e.g. React, Node.js, MongoDB"
          className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary-light/50 transition-all text-sm"
        />
      </div>
      <div className="form-group">
        <label className="block text-xs font-bold text-brand-text-primary uppercase tracking-wider mb-1">Eligibility / Experience Level</label>
        <input
          name="eligibility"
          value={form.eligibility}
          onChange={set}
          placeholder="e.g. 0–2 yrs, B.Tech preferred"
          className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary-light/50 transition-all text-sm"
        />
      </div>
      <div className="form-group">
        <label className="block text-xs font-bold text-brand-text-primary uppercase tracking-wider mb-1">Job Description <span className="text-brand-danger">*</span></label>
        <textarea
          name="description"
          value={form.description}
          onChange={set}
          rows={5}
          placeholder="Write detailed responsibilities, benefits, and requirements..."
          className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary-light/50 transition-all text-sm font-sans"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="btn btn-primary px-5 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 text-white bg-brand-primary hover:bg-brand-primary-hover shadow-md shadow-brand-primary-light transition-all border-none"
          disabled={loading}
        >
          {loading ? (
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
          ) : (
            'Save Job'
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            className="btn font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-all"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
