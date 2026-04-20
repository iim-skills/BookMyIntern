'use client';
import { useState, ChangeEvent, FormEvent } from 'react';
import { signIn }    from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link          from 'next/link';

export default function LoginPage() {
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const set = (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError('');
    if (!form.email || !form.password) { setError('Both fields are required.'); return; }
    setLoading(true);
    const res = await signIn('credentials', { ...form, redirect: false });
    if (res?.error) { setError(res.error); setLoading(false); return; }
    const sess = await fetch('/api/auth/session').then((r) => r.json()) as { user?: { role?: string } };
    if (sess?.user?.role === 'recruiter') router.replace('/recruiter/dashboard');
    else router.replace('/jobs');
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>Sign In</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-group"><label>Email</label>
            <input type="email" name="email" value={form.email} onChange={set} autoComplete="email" /></div>
          <div className="form-group"><label>Password</label>
            <input type="password" name="password" value={form.password} onChange={set} autoComplete="current-password" /></div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="auth-footer">No account? <Link href="/signup">Sign Up</Link></p>
      </div>
    </div>
  );
}
