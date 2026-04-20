'use client';
import { useState, ChangeEvent, FormEvent } from 'react';

interface Props { onVerified: () => void }

interface FirmForm {
  firmName: string; firmWebsite: string; designation: string; phone: string;
}

export default function VerificationModal({ onVerified }: Props) {
  const [form,    setForm]    = useState<FirmForm>({ firmName: '', firmWebsite: '', designation: '', phone: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError('');
    if (!form.firmName || !form.designation || !form.phone) {
      setError('Firm name, designation and phone are required.'); return;
    }
    setLoading(true);
    try {
      const res  = await fetch('/api/recruiter/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? 'Submission failed.'); return; }
      onVerified();
    } catch { setError('Network error. Please try again.'); }
    finally   { setLoading(false); }
  };

  return (
    <div className="modal-bg">
      <div className="modal-box">
        <h2>Complete Firm Verification</h2>
        <p className="modal-sub">Provide your firm details to activate your recruiter account. One-time step.</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-group"><label>Firm / Company Name *</label>
            <input name="firmName" value={form.firmName} onChange={set} placeholder="Acme Corp" /></div>
          <div className="form-group"><label>Firm Website</label>
            <input name="firmWebsite" value={form.firmWebsite} onChange={set} placeholder="https://acme.com" /></div>
          <div className="form-group"><label>Your Designation *</label>
            <input name="designation" value={form.designation} onChange={set} placeholder="HR Manager" /></div>
          <div className="form-group"><label>Phone Number *</label>
            <input name="phone" value={form.phone} onChange={set} placeholder="+91 9000000000" /></div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Submitting…' : 'Submit Verification'}
          </button>
        </form>
      </div>
    </div>
  );
}
