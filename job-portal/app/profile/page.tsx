'use client';
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter }  from 'next/navigation';
import Link           from 'next/link';

interface UserInfo {
  name:          string;
  email:         string;
  role:          string;
  createdAt:     string;
  emailVerified: boolean;
}

interface RecruiterProfileInfo {
  firmName:      string;
  firmWebsite:   string;
  designation:   string;
  phone:         string;
  adminVerified: boolean;
}

type PwStep = 'idle' | 'sending' | 'otp-sent' | 'verifying' | 'direct' | 'done';

/* ── tiny helper ── */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500, marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: '0.9rem', color: '#111' }}>{value}</div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [user,    setUser]    = useState<UserInfo | null>(null);
  const [profile, setProfile] = useState<RecruiterProfileInfo | null>(null);
  const [loading, setLoading] = useState(true);

  /* name edit */
  const [editName,   setEditName]   = useState(false);
  const [nameVal,    setNameVal]    = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg,    setNameMsg]    = useState('');
  const [nameErr,    setNameErr]    = useState('');

  /* firm edit */
  const [editFirm,   setEditFirm]   = useState(false);
  const [firmForm,   setFirmForm]   = useState({ firmName:'', firmWebsite:'', designation:'', phone:'' });
  const [firmSaving, setFirmSaving] = useState(false);
  const [firmMsg,    setFirmMsg]    = useState('');
  const [firmErr,    setFirmErr]    = useState('');

  /* password */
  const [pwStep,        setPwStep]        = useState<PwStep>('idle');
  const [otp,           setOtp]           = useState('');
  const [newPw,         setNewPw]         = useState('');
  const [currPw,        setCurrPw]        = useState('');
  const [pwMsg,         setPwMsg]         = useState('');
  const [pwErr,         setPwErr]         = useState('');
  const [emailEnabled,  setEmailEnabled]  = useState(true);

  /* ── load ── */
  useEffect(() => {
    if (status === 'unauthenticated') { router.replace('/login'); return; }
    if (status !== 'authenticated') return;

    fetch('/api/profile')
      .then((r) => r.json())
      .then((d: { user?: UserInfo; recruiterProfile?: RecruiterProfileInfo | null }) => {
        if (d.user) { setUser(d.user); setNameVal(d.user.name); }
        if (d.recruiterProfile) {
          setProfile(d.recruiterProfile);
          setFirmForm({
            firmName:    d.recruiterProfile.firmName    ?? '',
            firmWebsite: d.recruiterProfile.firmWebsite ?? '',
            designation: d.recruiterProfile.designation ?? '',
            phone:       d.recruiterProfile.phone       ?? '',
          });
        }
        setLoading(false);
      });

    // Probe whether email is configured — GET only, no side effects
    fetch('/api/profile/change-password')
      .then((r) => r.json())
      .then((d) => {
        if (d.emailEnabled === false) setEmailEnabled(false);
      })
      .catch(() => {});
  }, [status, router]);

  /* ── save name ── */
  const saveName = async (e: FormEvent) => {
    e.preventDefault(); setNameErr('');
    if (!nameVal.trim()) { setNameErr('Name cannot be empty.'); return; }
    setNameSaving(true);
    const res  = await fetch('/api/profile', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nameVal }),
    });
    const data = await res.json() as { name?: string; error?: string };
    setNameSaving(false);
    if (!res.ok) { setNameErr(data.error ?? 'Error saving.'); return; }
    setUser((u) => u ? { ...u, name: data.name ?? u.name } : u);
    setEditName(false); setNameMsg('Name updated!');
    setTimeout(() => setNameMsg(''), 3000);
  };

  /* ── save firm ── */
  const saveFirm = async (e: FormEvent) => {
    e.preventDefault(); setFirmErr('');
    setFirmSaving(true);
    const res  = await fetch('/api/profile/recruiter', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(firmForm),
    });
    const data = await res.json() as { error?: string };
    setFirmSaving(false);
    if (!res.ok) { setFirmErr(data.error ?? 'Error saving.'); return; }
    setProfile((p) => p ? { ...p, ...firmForm } : p);
    setEditFirm(false); setFirmMsg('Firm details updated!');
    setTimeout(() => setFirmMsg(''), 3000);
  };

  /* ── password helpers ── */
  const sendOtp = async () => {
    setPwStep('sending'); setPwErr('');
    const res  = await fetch('/api/profile/change-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'otp' }),
    });
    const data = await res.json() as { ok?: boolean; error?: string };
    if (!res.ok) { setPwErr(data.error ?? 'Failed to send OTP.'); setPwStep('idle'); return; }
    setPwStep('otp-sent');
  };

  const verifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || !newPw.trim()) { setPwErr('Both fields are required.'); return; }
    setPwStep('verifying'); setPwErr('');
    const res  = await fetch('/api/profile/change-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'verify', otp, newPassword: newPw }),
    });
    const data = await res.json() as { ok?: boolean; error?: string };
    if (!res.ok) { setPwErr(data.error ?? 'Failed.'); setPwStep('otp-sent'); return; }
    setPwStep('done'); setPwMsg('Password changed successfully!');
    setOtp(''); setNewPw('');
  };

  const changeDirect = async (e: FormEvent) => {
    e.preventDefault(); setPwErr('');
    if (!currPw.trim() || !newPw.trim()) { setPwErr('Both fields are required.'); return; }
    const res  = await fetch('/api/profile/change-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'direct', currentPassword: currPw, newPassword: newPw }),
    });
    const data = await res.json() as { ok?: boolean; error?: string };
    if (!res.ok) { setPwErr(data.error ?? 'Failed.'); return; }
    setPwStep('done'); setPwMsg('Password changed successfully!');
    setCurrPw(''); setNewPw('');
  };

  /* ── render ── */
  if (status === 'loading' || loading)
    return <p style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading…</p>;

  const role       = session?.user?.role ?? '';
  const dashHref   = role === 'recruiter' ? '/recruiter/dashboard'
                   : role === 'admin'     ? '/admin/dashboard'
                   : '/student/dashboard';

  return (
    <div className="dashboard">

      {/* ── back ── */}
      <div style={{ marginBottom: 16 }}>
        <Link href={dashHref} style={{ fontSize: '0.85rem' }}>← Back to Dashboard</Link>
      </div>

      {/* ── avatar + header ── */}
      <div className="page-hd" style={{ alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: '#dbeafe', color: '#1d4ed8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 700, flexShrink: 0, userSelect: 'none',
          }}>
            {user?.name?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div>
            <h1>{user?.name}</h1>
            <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: 2, textTransform: 'capitalize' }}>
              {user?.role} account
            </p>
          </div>
        </div>
      </div>

      {/* ══ Account Info ══ */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div className="sec-title" style={{ margin: 0 }}>Account Details</div>
          {!editName && (
            <button className="btn btn-sm" onClick={() => { setEditName(true); setNameVal(user?.name ?? ''); }}>
              Edit Name
            </button>
          )}
        </div>

        {nameMsg && <div className="alert alert-success">{nameMsg}</div>}
        {nameErr && <div className="alert alert-error">{nameErr}</div>}

        {editName ? (
          <form onSubmit={saveName}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                value={nameVal}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNameVal(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={nameSaving}>
                {nameSaving ? 'Saving…' : 'Save'}
              </button>
              <button type="button" className="btn btn-sm" onClick={() => { setEditName(false); setNameErr(''); }}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <Row label="Full Name" value={user?.name ?? ''} />
        )}

        <Row label="Email"  value={user?.email ?? ''} />
        <Row label="Role"   value={user?.role  ?? ''} />
        <Row label="Member Since" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''} />

        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500, marginBottom: 4 }}>
            Email Verified
          </div>
          <span className={`tag ${user?.emailVerified ? 'tag-green' : 'tag-yellow'}`}>
            {user?.emailVerified ? '✓ Verified' : '⚠ Not Verified'}
          </span>
        </div>
      </div>

      {/* ══ Recruiter Firm Details ══ */}
      {role === 'recruiter' && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div className="sec-title" style={{ margin: 0 }}>Firm Details</div>
            {profile && !editFirm && (
              <button className="btn btn-sm" onClick={() => setEditFirm(true)}>Edit</button>
            )}
          </div>

          {firmMsg && <div className="alert alert-success">{firmMsg}</div>}
          {firmErr && <div className="alert alert-error">{firmErr}</div>}

          {!profile ? (
            <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
              No firm profile yet. Complete verification from the dashboard.
            </p>
          ) : editFirm ? (
            <form onSubmit={saveFirm}>
              <div className="form-group">
                <label>Firm Name *</label>
                <input value={firmForm.firmName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFirmForm((f) => ({ ...f, firmName: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input value={firmForm.firmWebsite} placeholder="https://…"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFirmForm((f) => ({ ...f, firmWebsite: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Designation *</label>
                <input value={firmForm.designation}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFirmForm((f) => ({ ...f, designation: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input value={firmForm.phone}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFirmForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={firmSaving}>
                  {firmSaving ? 'Saving…' : 'Save Changes'}
                </button>
                <button type="button" className="btn btn-sm" onClick={() => { setEditFirm(false); setFirmErr(''); }}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <Row label="Firm Name"   value={profile.firmName} />
              {profile.firmWebsite && <Row label="Website"    value={profile.firmWebsite} />}
              <Row label="Designation" value={profile.designation} />
              <Row label="Phone"       value={profile.phone} />
              <div style={{ marginTop: 4 }}>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500, marginBottom: 4 }}>
                  Admin Verified
                </div>
                <span className={`tag ${profile.adminVerified ? 'tag-green' : 'tag-yellow'}`}>
                  {profile.adminVerified ? '✓ Verified' : '⏳ Pending'}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══ Change Password ══ */}
      <div className="card">
        <div className="sec-title" style={{ marginTop: 0, marginBottom: 14 }}>Change Password</div>

        {pwMsg && <div className="alert alert-success">{pwMsg}</div>}
        {pwErr && <div className="alert alert-error">{pwErr}</div>}

        {pwStep === 'idle' && (
          emailEnabled ? (
            <button className="btn btn-primary" onClick={() => { setPwErr(''); void sendOtp(); }}>
              Send OTP to my email
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => { setPwErr(''); setPwStep('direct'); }}>
              Change Password
            </button>
          )
        )}

        {pwStep === 'sending' && (
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Sending OTP to your email…</p>
        )}

        {pwStep === 'otp-sent' && (
          <form onSubmit={verifyOtp}>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 12 }}>
              A 6-digit code was sent to <strong>{user?.email}</strong>.
            </p>
            <div className="form-group">
              <label>OTP Code</label>
              <input
                value={otp}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                style={{ letterSpacing: '8px', fontSize: '1.4rem', textAlign: 'center' }}
              />
            </div>
            <div className="form-group">
              <label>New Password <span style={{ fontWeight: 400, color: '#9ca3af' }}>(min. 6 chars)</span></label>
              <input type="password" value={newPw}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPw(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-primary btn-sm">Verify &amp; Change Password</button>
              <button type="button" className="btn btn-sm" onClick={() => void sendOtp()}>Resend OTP</button>
              <button type="button" className="btn btn-sm" onClick={() => { setPwStep('idle'); setPwErr(''); }}>Cancel</button>
            </div>
          </form>
        )}

        {pwStep === 'verifying' && (
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Verifying…</p>
        )}

        {pwStep === 'direct' && (
          <form onSubmit={changeDirect}>
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" value={currPw}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrPw(e.target.value)} />
            </div>
            <div className="form-group">
              <label>New Password <span style={{ fontWeight: 400, color: '#9ca3af' }}>(min. 6 chars)</span></label>
              <input type="password" value={newPw}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPw(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn-primary btn-sm">Change Password</button>
              <button type="button" className="btn btn-sm" onClick={() => { setPwStep('idle'); setPwErr(''); }}>Cancel</button>
            </div>
          </form>
        )}

        {pwStep === 'done' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '0.875rem', color: '#166534' }}>✓ {pwMsg}</span>
            <button className="btn btn-sm" onClick={() => { setPwStep('idle'); setPwMsg(''); }}>
              Change again
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
