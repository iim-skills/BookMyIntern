'use client';
import { useState, ChangeEvent, FormEvent } from 'react';
import { signIn }    from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link          from 'next/link';

type RoleHint = 'student' | 'recruiter' | 'admin';

const ROLES: { value: RoleHint; label: string; icon: string; desc: string }[] = [
  { value: 'student',   icon: '🎓', label: 'Student',   desc: 'Browse & apply for jobs' },
  { value: 'recruiter', icon: '🏢', label: 'Recruiter', desc: 'Post jobs & hire talent'  },
  { value: 'admin',     icon: '🛡️', label: 'Admin',     desc: 'Manage the platform'      },
];

export default function LoginPage() {
  const [roleHint, setRoleHint] = useState<RoleHint>('student');
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const set = (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Both fields are required.'); return; }
    setLoading(true);
    const res = await signIn('credentials', { ...form, redirect: false });
    if (res?.error) { setError(res.error); setLoading(false); return; }
    const sess = await fetch('/api/auth/session').then((r) => r.json()) as { user?: { role?: string } };
    const role = sess?.user?.role;
    if (role === 'admin')      router.replace('/admin/dashboard');
    else if (role === 'recruiter') router.replace('/recruiter/dashboard');
    else router.replace('/jobs');
  };

  return (
    <div className="auth-page">
      <div className="auth-box" style={{ maxWidth: 460 }}>
        <h1 style={{ marginBottom: 6 }}>Sign In</h1>
        <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: 18 }}>
          Choose your account type
        </p>

        {/* Role selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRoleHint(r.value)}
              style={{
                border: roleHint === r.value ? '2px solid #2563eb' : '2px solid #e4e4e7',
                borderRadius: 8, padding: '10px 6px', background: roleHint === r.value ? '#eff6ff' : '#fff',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.12s',
              }}
            >
              <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{r.icon}</div>
              <div style={{ fontWeight: 600, fontSize: '0.8rem', color: roleHint === r.value ? '#1d4ed8' : '#111' }}>
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
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={set} autoComplete="email" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={set} autoComplete="current-password" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in…' : `Sign In as ${ROLES.find(r => r.value === roleHint)?.label}`}
          </button>
        </form>

        <p className="auth-footer">
          No account?{' '}
          <Link href={`/signup?role=${roleHint}`}>Sign Up as {ROLES.find(r => r.value === roleHint)?.label}</Link>
        </p>
      </div>
    </div>
  );
}
