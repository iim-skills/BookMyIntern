'use client';
import { useState, ChangeEvent, FormEvent } from 'react';
import { signIn }                            from 'next-auth/react';
import { useRouter, useSearchParams }        from 'next/navigation';
import Link                                  from 'next/link';
import { Suspense }                          from 'react';
import type { Role }                         from '@/types';

type SignupRole = 'student' | 'recruiter' | 'admin';

const ROLES: { value: SignupRole; icon: string; label: string; desc: string }[] = [
  { value: 'student',   icon: '🎓', label: 'Student',   desc: 'Browse & apply for jobs' },
  { value: 'recruiter', icon: '🏢', label: 'Recruiter', desc: 'Post jobs & hire talent'  },
  { value: 'admin',     icon: '🛡️', label: 'Admin',     desc: 'Manage the platform'      },
];

interface SignupForm {
  name: string; email: string; password: string;
  role: SignupRole; adminKey: string;
}

function SignupForm() {
  const params    = useSearchParams();
  const initRole  = (params.get('role') ?? 'student') as SignupRole;
  const router    = useRouter();

  const [form,       setForm]       = useState<SignupForm>({
    name: '', email: '', password: '', role: initRole, adminKey: '',
  });
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [step,       setStep]       = useState<'form' | 'verify'>('form');
  const [otp,        setOtp]        = useState('');
  const [verifyErr,  setVerifyErr]  = useState('');
  const [verifyLoad, setVerifyLoad] = useState(false);
  const [resending,  setResending]  = useState(false);
  const [resendMsg,  setResendMsg]  = useState('');

  const set = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const setRole = (r: SignupRole) => setForm((f) => ({ ...f, role: r, adminKey: '' }));

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError('');
    if (!form.name || !form.email || !form.password) { setError('All fields are required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.role === 'admin' && !form.adminKey.trim()) {
      setError('Admin secret key is required.'); return;
    }
    setLoading(true);
    const res  = await fetch('/api/auth/signup', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name, email: form.email, password: form.password,
        role: form.role, adminKey: form.adminKey || undefined,
      }),
    });
    const data = await res.json() as { ok?: boolean; error?: string; requiresVerification?: boolean };
    setLoading(false);
    if (!res.ok) { setError(data.error ?? 'Signup failed.'); return; }
    if (data.requiresVerification) { setStep('verify'); return; }
    // Auto sign-in
    const sr = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
    if (sr?.error) { setError('Account created. Please sign in.'); return; }
    if (form.role === 'admin')      router.replace('/admin/dashboard');
    else if (form.role === 'recruiter') router.replace('/recruiter/dashboard');
    else router.replace('/jobs');
  };

  const verifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setVerifyErr('');
    if (!otp.trim()) { setVerifyErr('Please enter the code from your email.'); return; }
    setVerifyLoad(true);
    const res  = await fetch('/api/auth/verify-email', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, otp }),
    });
    const data = await res.json() as { ok?: boolean; error?: string };
    setVerifyLoad(false);
    if (!res.ok) { setVerifyErr(data.error ?? 'Verification failed.'); return; }
    const sr = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
    if (sr?.error) { setVerifyErr('Verified! Please sign in manually.'); return; }
    if (form.role === 'recruiter') router.replace('/recruiter/dashboard');
    else router.replace('/jobs');
  };

  const resend = async () => {
    setResendMsg(''); setResending(true);
    const res = await fetch('/api/auth/verify-email', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email }),
    });
    setResending(false);
    setResendMsg(res.ok ? 'New code sent.' : 'Could not resend. Try again.');
  };

  if (step === 'verify') return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>Verify your email</h1>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 18 }}>
          We sent a 6-digit code to <strong>{form.email}</strong>.
        </p>
        {verifyErr && <div className="alert alert-error">{verifyErr}</div>}
        {resendMsg && <div className="alert alert-success">{resendMsg}</div>}
        <form onSubmit={verifyOtp}>
          <div className="form-group">
            <label>Verification Code</label>
            <input value={otp} onChange={(e) => setOtp(e.target.value)}
              placeholder="123456" maxLength={6}
              style={{ letterSpacing: '6px', fontSize: '1.4rem', textAlign: 'center' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={verifyLoad}>
            {verifyLoad ? 'Verifying…' : 'Verify & Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 14, fontSize: '0.82rem', color: '#6b7280' }}>
          Didn&apos;t get it?{' '}
          <button onClick={() => void resend()} disabled={resending}
            style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.82rem', padding: 0 }}>
            {resending ? 'Sending…' : 'Resend code'}
          </button>
        </p>
      </div>
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-box" style={{ maxWidth: 460 }}>
        <h1 style={{ marginBottom: 6 }}>Create Account</h1>
        <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: 18 }}>
          Choose your account type
        </p>

        {/* Role cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              style={{
                border: form.role === r.value ? '2px solid #2563eb' : '2px solid #e4e4e7',
                borderRadius: 8, padding: '10px 6px',
                background: form.role === r.value ? '#eff6ff' : '#fff',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.12s',
              }}
            >
              <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{r.icon}</div>
              <div style={{ fontWeight: 600, fontSize: '0.8rem', color: form.role === r.value ? '#1d4ed8' : '#111' }}>
                {r.label}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: 2, lineHeight: 1.3 }}>
                {r.desc}
              </div>
            </button>
          ))}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Full Name</label>
            <input name="name" value={form.name} onChange={set} autoComplete="name" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={set} autoComplete="email" />
          </div>
          <div className="form-group">
            <label>Password <span style={{ fontWeight: 400, color: '#9ca3af' }}>(min. 6 chars)</span></label>
            <input type="password" name="password" value={form.password} onChange={set} autoComplete="new-password" />
          </div>

          {/* Admin secret key — only shown when Admin card is selected */}
          {form.role === 'admin' && (
            <div className="form-group">
              <label>
                Admin Secret Key <span style={{ fontWeight: 400, color: '#9ca3af' }}>*</span>
              </label>
              <input
                type="password"
                name="adminKey"
                value={form.adminKey}
                onChange={set}
                placeholder="Enter the secret key provided by your platform operator"
              />
              <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 4 }}>
                This key is set in the server&apos;s environment variables (ADMIN_SIGNUP_KEY).
              </p>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating…' : `Create ${ROLES.find(r => r.value === form.role)?.label} Account`}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link href={`/login?role=${form.role}`}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="auth-page"><div className="auth-box">Loading…</div></div>}>
      <SignupForm />
    </Suspense>
  );
}
