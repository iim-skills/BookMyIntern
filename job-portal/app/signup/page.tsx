'use client';
import { useState, ChangeEvent, FormEvent } from 'react';
import { signIn }    from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link          from 'next/link';
import type { Role } from '@/types';

interface SignupForm { name: string; email: string; password: string; role: Role }

export default function SignupPage() {
  const [form,    setForm]    = useState<SignupForm>({ name: '', email: '', password: '', role: 'student' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const set = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value as Role }));

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError('');
    if (!form.name || !form.email || !form.password) { setError('All fields are required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    const res  = await fetch('/api/auth/signup', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) { setError(data.error ?? 'Signup failed.'); setLoading(false); return; }
    const signInRes = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
    setLoading(false);
    if (signInRes?.error) { setError('Account created. Please sign in manually.'); return; }
    if (form.role === 'recruiter') router.replace('/recruiter/dashboard');
    else router.replace('/jobs');
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>Create Account</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-group"><label>Full Name</label>
            <input name="name" value={form.name} onChange={set} autoComplete="name" /></div>
          <div className="form-group"><label>Email</label>
            <input type="email" name="email" value={form.email} onChange={set} autoComplete="email" /></div>
          <div className="form-group">
            <label>Password <span style={{ fontWeight: 400, color: '#9ca3af' }}>(min. 6 chars)</span></label>
            <input type="password" name="password" value={form.password} onChange={set} autoComplete="new-password" /></div>
          <div className="form-group"><label>I am a…</label>
            <select name="role" value={form.role} onChange={set}>
              <option value="student">Student / Job Seeker</option>
              <option value="recruiter">Recruiter / Employer</option>
            </select></div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">Already have an account? <Link href="/login">Sign In</Link></p>
      </div>
    </div>
  );
}
