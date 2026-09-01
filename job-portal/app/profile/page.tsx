'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, Mail, Shield, ShieldCheck, Edit3, Lock, Eye, EyeOff,
  AlertTriangle, Trash2, LogOut, CheckCircle2, AlertCircle, Info,
  RefreshCw, ArrowLeft, Building, Globe, Phone, BookOpen, GraduationCap,
  Clock
} from 'lucide-react';
import AuthenticatedLayout from '@/components/ui/AuthenticatedLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import OTPInput from '@/components/ui/OTPInput';
import Modal from '@/components/ui/Modal';

interface UserInfo {
  name: string;
  email: string;
  role: string;
  createdAt: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  collegeName?: string;
  graduationYear?: string;
  currentYearOfStudy?: string;
}

interface RecruiterProfileInfo {
  firmName: string;
  firmWebsite: string;
  designation: string;
  phone: string;
  adminVerified: boolean;
}

type PwStep = 'idle' | 'sending' | 'otp-sent' | 'verifying' | 'direct' | 'done';

function getPasswordStrength(p: string): { score: number; label: string; color: string } {
  if (!p) return { score: 0, label: '', color: 'bg-slate-200' };
  let s = 0;
  if (p.length >= 6) s += 1;
  if (p.length >= 10) s += 1;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s += 1;
  if (/[0-9]/.test(p) || /[^A-Za-z0-9]/.test(p)) s += 1;

  const labels = ['', 'Weak', 'Fair', 'Strong', 'Excellent'];
  const colors = ['bg-slate-200', 'bg-accent-rose', 'bg-accent-amber', 'bg-primary', 'bg-accent-teal'];
  return { score: s, label: labels[s], color: colors[s] };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [user, setUser] = useState<UserInfo | null>(null);
  const [profile, setProfile] = useState<RecruiterProfileInfo | null>(null);
  const [loading, setLoading] = useState(true);

  /* name edit */
  const [editName, setEditName] = useState(false);
  const [nameVal, setNameVal] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg, setNameMsg] = useState('');
  const [nameErr, setNameErr] = useState('');

  /* student edit */
  const [editStudent, setEditStudent] = useState(false);
  const [collegeVal, setCollegeVal] = useState('');
  const [gradYearVal, setGradYearVal] = useState('');
  const [yearOfStudyVal, setYearOfStudyVal] = useState('');
  const [studentSaving, setStudentSaving] = useState(false);
  const [studentMsg, setStudentMsg] = useState('');
  const [studentErr, setStudentErr] = useState('');

  /* 2FA state */
  const [toggling2FA, setToggling2FA] = useState(false);

  /* Session revoking state */
  const [revoking, setRevoking] = useState(false);
  const [revokeMsg, setRevokeMsg] = useState('');

  /* firm edit */
  const [editFirm, setEditFirm] = useState(false);
  const [firmForm, setFirmForm] = useState({ firmName: '', firmWebsite: '', designation: '', phone: '' });
  const [firmSaving, setFirmSaving] = useState(false);
  const [firmMsg, setFirmMsg] = useState('');
  const [firmErr, setFirmErr] = useState('');

  /* password */
  const [pwStep, setPwStep] = useState<PwStep>('idle');
  const [otp, setOtp] = useState('');
  const [newPw, setNewPw] = useState('');
  const [currPw, setCurrPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showCurrPw, setShowCurrPw] = useState(false);

  /* Delete Account Modal state */
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteMsg, setDeleteMsg] = useState('');

  /* ── load ── */
  useEffect(() => {
    if (status === 'unauthenticated') { router.replace('/login'); return; }
    if (status !== 'authenticated') return;

    fetch('/api/profile')
      .then((r) => r.json())
      .then((d: { user?: UserInfo; recruiterProfile?: RecruiterProfileInfo | null }) => {
        if (d.user) {
          setUser(d.user);
          setNameVal(d.user.name);
          setCollegeVal(d.user.collegeName ?? '');
          setGradYearVal(d.user.graduationYear ?? '');
          setYearOfStudyVal(d.user.currentYearOfStudy ?? '');
        }
        if (d.recruiterProfile) {
          setProfile(d.recruiterProfile);
          setFirmForm({
            firmName: d.recruiterProfile.firmName ?? '',
            firmWebsite: d.recruiterProfile.firmWebsite ?? '',
            designation: d.recruiterProfile.designation ?? '',
            phone: d.recruiterProfile.phone ?? '',
          });
        }
        setLoading(false);
      });

    fetch('/api/profile/change-password')
      .then((r) => r.json())
      .then((d) => {
        if (d.emailEnabled === false) setEmailEnabled(false);
      })
      .catch(() => { });
  }, [status, router]);

  /* ── save name ── */
  const saveName = async (e: FormEvent) => {
    e.preventDefault();
    setNameErr('');
    if (!nameVal.trim()) { setNameErr('Name cannot be empty.'); return; }
    setNameSaving(true);
    const res = await fetch('/api/profile', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nameVal }),
    });
    const data = await res.json() as { name?: string; error?: string };
    setNameSaving(false);
    if (!res.ok) { setNameErr(data.error ?? 'Error saving.'); return; }
    setUser((u) => u ? { ...u, name: data.name ?? u.name } : u);
    setEditName(false);
    setNameMsg('Name updated successfully!');
    setTimeout(() => setNameMsg(''), 3000);
  };

  /* ── save firm ── */
  const saveFirm = async (e: FormEvent) => {
    e.preventDefault();
    setFirmErr('');
    setFirmSaving(true);
    const res = await fetch('/api/profile/recruiter', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(firmForm),
    });
    const data = await res.json() as { error?: string };
    setFirmSaving(false);
    if (!res.ok) { setFirmErr(data.error ?? 'Error saving.'); return; }
    setProfile((p) => p ? { ...p, ...firmForm } : p);
    setEditFirm(false);
    setFirmMsg('Firm details updated successfully!');
    setTimeout(() => setFirmMsg(''), 3000);
  };

  /* ── save student ── */
  const saveStudent = async (e: FormEvent) => {
    e.preventDefault();
    setStudentErr('');
    setStudentSaving(true);
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collegeName: collegeVal,
        graduationYear: gradYearVal,
        currentYearOfStudy: yearOfStudyVal,
      }),
    });
    const data = await res.json() as {
      collegeName?: string;
      graduationYear?: string;
      currentYearOfStudy?: string;
      error?: string;
    };
    setStudentSaving(false);
    if (!res.ok) { setStudentErr(data.error ?? 'Error saving.'); return; }
    setUser((u) => u ? {
      ...u,
      collegeName: data.collegeName ?? u.collegeName,
      graduationYear: data.graduationYear ?? u.graduationYear,
      currentYearOfStudy: data.currentYearOfStudy ?? u.currentYearOfStudy,
    } : u);
    setEditStudent(false);
    setStudentMsg('Academic profile updated successfully!');
    setTimeout(() => setStudentMsg(''), 3000);
  };

  /* ── toggle 2FA ── */
  const handleToggle2FA = async (enable: boolean) => {
    setToggling2FA(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twoFactorEnabled: enable }),
      });
      const data = await res.json() as { twoFactorEnabled?: boolean; error?: string };
      if (res.ok && data.twoFactorEnabled !== undefined) {
        setUser((u) => u ? { ...u, twoFactorEnabled: data.twoFactorEnabled ?? u.twoFactorEnabled } : u);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setToggling2FA(false);
    }
  };

  /* ── revoke sessions ── */
  const handleRevokeSessions = async () => {
    if (!window.confirm('Are you sure you want to invalidate all other active sessions? This will terminate your logins on all other devices.')) return;
    setRevoking(true);
    setRevokeMsg('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revokeSessions: true }),
      });
      if (res.ok) {
        setRevokeMsg('Sessions revoked! Signing out in a moment...');
        setTimeout(() => {
          signOut({ callbackUrl: '/login' });
        }, 1500);
      } else {
        setRevokeMsg('Failed to revoke sessions.');
        setRevoking(false);
      }
    } catch (err) {
      setRevokeMsg('Failed to revoke sessions.');
      setRevoking(false);
    }
  };

  /* ── password helpers ── */
  const sendOtp = async () => {
    setPwStep('sending');
    setPwErr('');
    const res = await fetch('/api/profile/change-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'otp' }),
    });
    const data = await res.json() as { ok?: boolean; error?: string };
    if (!res.ok) { setPwErr(data.error ?? 'Failed to send OTP.'); setPwStep('idle'); return; }
    setPwStep('otp-sent');
  };

  const verifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || !newPw.trim()) { setPwErr('Both verification code and new password are required.'); return; }
    setPwStep('verifying');
    setPwErr('');
    const res = await fetch('/api/profile/change-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'verify', otp, newPassword: newPw }),
    });
    const data = await res.json() as { ok?: boolean; error?: string };
    if (!res.ok) { setPwErr(data.error ?? 'Verification failed.'); setPwStep('otp-sent'); return; }
    setPwStep('done');
    setPwMsg('Password changed successfully!');
    setOtp('');
    setNewPw('');
  };

  const changeDirect = async (e: FormEvent) => {
    e.preventDefault();
    setPwErr('');
    if (!currPw.trim() || !newPw.trim()) { setPwErr('Both fields are required.'); return; }
    const res = await fetch('/api/profile/change-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'direct', currentPassword: currPw, newPassword: newPw }),
    });
    const data = await res.json() as { ok?: boolean; error?: string };
    if (!res.ok) { setPwErr(data.error ?? 'Failed to update password.'); return; }
    setPwStep('done');
    setPwMsg('Password changed successfully!');
    setCurrPw('');
    setNewPw('');
  };

  /* ── Delete Account visual handle ── */
  const handleDeleteAccount = (e: FormEvent) => {
    e.preventDefault();
    setDeleteMsg('');
    if (deleteConfirmText !== 'DELETE') {
      setDeleteMsg('Please type DELETE to confirm.');
      return;
    }
    // We display a gated mock notification because backend has no delete endpoint configured.
    setDeleteMsg('Account deletion is currently restricted. Please contact administrative support at support@bookmyintern.co to terminate your account.');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 select-none">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-text-muted text-xs font-semibold">Loading profile settings…</p>
      </div>
    );
  }

  const role = session?.user?.role ?? '';
  const dashHref = role === 'recruiter' ? '/recruiter/dashboard'
    : role === 'admin' ? '/admin/dashboard'
      : '/student/dashboard';

  const isVerified = role === 'recruiter' ? profile?.adminVerified : user?.emailVerified;
  const strengthInfo = getPasswordStrength(newPw);

  return (
    <AuthenticatedLayout allowedRoles={['student', 'recruiter', 'admin']}>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Back navigation */}
        <div className="select-none">
          <Link href={dashHref} className="inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-primary transition-colors decoration-none">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
        </div>

        {/* ── PROFILE OVERVIEW HEADER ── */}
        <div className="bg-white border border-surface-mid rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-5 relative overflow-hidden select-none">
          {/* Blue gradient left strip */}
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-primary to-accent-indigo" />

          <div className="w-16 h-16 rounded-full bg-accent-indigo/10 text-accent-indigo flex items-center justify-center text-2xl font-display font-extrabold border border-accent-indigo/20 shadow-inner flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? '?'}
          </div>

          <div className="text-center sm:text-left flex-1 space-y-1">
            <h1 className="text-xl font-display font-extrabold text-text-primary tracking-tight">
              {user?.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[9px] font-bold uppercase tracking-wider border border-surface-mid">
                <Shield className="w-3 h-3 text-slate-500" />
                {user?.role} Portal
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-mono ${isVerified
                  ? 'bg-accent-teal/10 text-accent-teal border border-accent-teal/20'
                  : 'bg-accent-amber/10 text-accent-amber border border-accent-amber/20'
                }`}>
                {isVerified ? '✓ Verified' : '⏳ Pending'}
              </span>
            </div>
            <p className="text-[10px] text-text-muted font-bold font-mono uppercase tracking-wider pt-0.5">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : ''}
            </p>
          </div>
        </div>

        {/* ── GENERAL DETAILS CARD ── */}
        <div className="bg-white border border-surface-mid rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3 select-none">
            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              General Information
            </h2>
            {!editName && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setEditName(true); setNameVal(user?.name ?? ''); }}
                className="text-xs font-bold px-2.5 py-1"
                icon={<Edit3 className="w-3.5 h-3.5" />}
              >
                Edit Name
              </Button>
            )}
          </div>

          {nameMsg && (
            <div className="p-3 bg-accent-teal/10 text-accent-teal border border-accent-teal/20 rounded-lg text-xs font-semibold flex items-center gap-2 select-none animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              {nameMsg}
            </div>
          )}
          {nameErr && (
            <div className="p-3 bg-accent-rose/10 text-accent-rose border border-accent-rose/20 rounded-lg text-xs font-semibold flex items-center gap-2 select-none animate-fadeIn">
              <AlertCircle className="w-4 h-4" />
              {nameErr}
            </div>
          )}

          {editName ? (
            <form onSubmit={saveName} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-surface-mid animate-fadeIn">
              <Input
                label="Full Name"
                value={nameVal}
                onChange={(e) => setNameVal(e.target.value)}
                placeholder="Name"
                className="h-10 font-semibold"
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" loading={nameSaving} className="text-xs font-bold">
                  Save Changes
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => { setEditName(false); setNameErr(''); }} className="text-xs font-bold">
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                <span className="text-text-muted font-bold uppercase tracking-wider select-none">Full Name</span>
                <span className="font-semibold text-text-primary">{user?.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                <span className="text-text-muted font-bold uppercase tracking-wider select-none">Email Address</span>
                <span className="font-semibold text-text-primary flex items-center gap-1">
                  {user?.email}
                  {user?.emailVerified && <ShieldCheck className="w-4 h-4 text-accent-teal" />}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-muted font-bold uppercase tracking-wider select-none">Account Role</span>
                <span className="font-semibold text-text-primary capitalize">{user?.role}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── ACADEMIC PROFILE (Student Only) ── */}
        {role === 'student' && (
          <div className="bg-white border border-surface-mid rounded-xl p-6 shadow-sm space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 select-none">
              <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Academic Details
              </h2>
              {!editStudent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditStudent(true)}
                  className="text-xs font-bold px-2.5 py-1"
                  icon={<Edit3 className="w-3.5 h-3.5" />}
                >
                  Edit Academic
                </Button>
              )}
            </div>

            {studentMsg && (
              <div className="p-3 bg-accent-teal/10 text-accent-teal border border-accent-teal/20 rounded-lg text-xs font-semibold flex items-center gap-2 select-none animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                {studentMsg}
              </div>
            )}
            {studentErr && (
              <div className="p-3 bg-accent-rose/10 text-accent-rose border border-accent-rose/20 rounded-lg text-xs font-semibold flex items-center gap-2 select-none animate-fadeIn">
                <AlertCircle className="w-4 h-4" />
                {studentErr}
              </div>
            )}

            {editStudent ? (
              <form onSubmit={saveStudent} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-surface-mid animate-fadeIn">
                <Input
                  label="College / University Name"
                  value={collegeVal}
                  onChange={(e) => setCollegeVal(e.target.value)}
                  placeholder="e.g. Indian Institute of Technology"
                  className="h-10 font-semibold"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Year of Study</label>
                    <select
                      value={yearOfStudyVal}
                      onChange={(e) => setYearOfStudyVal(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-surface-mid rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm font-semibold bg-white"
                    >
                      <option value="">Select study year...</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Postgraduate">Postgraduate</option>
                    </select>
                  </div>
                  <Input
                    label="Graduation Year"
                    value={gradYearVal}
                    onChange={(e) => setGradYearVal(e.target.value)}
                    placeholder="e.g. 2027"
                    className="h-10 font-semibold"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" size="sm" loading={studentSaving} className="text-xs font-bold">
                    Save Details
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={() => { setEditStudent(false); setStudentErr(''); }} className="text-xs font-bold">
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                  <span className="text-text-muted font-bold uppercase tracking-wider select-none flex items-center gap-1">
                    <Building className="w-3.5 h-3.5" />
                    College Name
                  </span>
                  <span className="font-semibold text-text-primary">{user?.collegeName || 'Not specified'}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                  <span className="text-text-muted font-bold uppercase tracking-wider select-none flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Year of Study
                  </span>
                  <span className="font-semibold text-text-primary">{user?.currentYearOfStudy || 'Not specified'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-muted font-bold uppercase tracking-wider select-none flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Graduation Year
                  </span>
                  <span className="font-semibold text-text-primary font-mono">{user?.graduationYear || 'Not specified'}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── FIRM DETAILS PROFILE (Recruiter Only) ── */}
        {role === 'recruiter' && (
          <div className="bg-white border border-surface-mid rounded-xl p-6 shadow-sm space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 select-none">
              <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4 text-primary" />
                Firm Details
              </h2>
              {profile && !editFirm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditFirm(true)}
                  className="text-xs font-bold px-2.5 py-1"
                  icon={<Edit3 className="w-3.5 h-3.5" />}
                >
                  Edit Firm
                </Button>
              )}
            </div>

            {firmMsg && (
              <div className="p-3 bg-accent-teal/10 text-accent-teal border border-accent-teal/20 rounded-lg text-xs font-semibold flex items-center gap-2 select-none animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                {firmMsg}
              </div>
            )}
            {firmErr && (
              <div className="p-3 bg-accent-rose/10 text-accent-rose border border-accent-rose/20 rounded-lg text-xs font-semibold flex items-center gap-2 select-none animate-fadeIn">
                <AlertCircle className="w-4 h-4" />
                {firmErr}
              </div>
            )}

            {!profile ? (
              <div className="text-center py-6 text-text-muted text-xs bg-slate-50 border border-dashed border-surface-mid rounded-xl select-none">
                No firm profile configured yet. Please complete verification.
              </div>
            ) : editFirm ? (
              <form onSubmit={saveFirm} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-surface-mid animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Firm Name *"
                    value={firmForm.firmName}
                    onChange={(e) => setFirmForm((f) => ({ ...f, firmName: e.target.value }))}
                    className="h-10 font-semibold"
                  />
                  <Input
                    label="Website Link"
                    placeholder="https://…"
                    value={firmForm.firmWebsite}
                    onChange={(e) => setFirmForm((f) => ({ ...f, firmWebsite: e.target.value }))}
                    className="h-10 font-semibold"
                  />
                  <Input
                    label="Designation *"
                    value={firmForm.designation}
                    onChange={(e) => setFirmForm((f) => ({ ...f, designation: e.target.value }))}
                    className="h-10 font-semibold"
                  />
                  <Input
                    label="Phone Contact *"
                    value={firmForm.phone}
                    onChange={(e) => setFirmForm((f) => ({ ...f, phone: e.target.value }))}
                    className="h-10 font-semibold"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" loading={firmSaving} className="text-xs font-bold">
                    Save Changes
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={() => { setEditFirm(false); setFirmErr(''); }} className="text-xs font-bold">
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                  <span className="text-text-muted font-bold uppercase tracking-wider select-none flex items-center gap-1">
                    <Building className="w-3.5 h-3.5" />
                    Firm Name
                  </span>
                  <span className="font-semibold text-text-primary">{profile.firmName}</span>
                </div>
                {profile.firmWebsite && (
                  <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                    <span className="text-text-muted font-bold uppercase tracking-wider select-none flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" />
                      Website
                    </span>
                    <a href={profile.firmWebsite} target="_blank" rel="noopener noreferrer" className="font-bold text-primary hover:underline">
                      {profile.firmWebsite}
                    </a>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                  <span className="text-text-muted font-bold uppercase tracking-wider select-none flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    Designation
                  </span>
                  <span className="font-semibold text-text-primary">{profile.designation}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                  <span className="text-text-muted font-bold uppercase tracking-wider select-none flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    Phone Contact
                  </span>
                  <span className="font-semibold text-text-primary font-mono">{profile.phone}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-muted font-bold uppercase tracking-wider select-none flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Admin Verification
                  </span>
                  <span className={`tag ${profile.adminVerified ? 'tag-green' : 'tag-yellow'} px-3 py-0.5 font-bold rounded-lg text-[10px]`}>
                    {profile.adminVerified ? '✓ Verified' : '⏳ Pending'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TWO FACTOR AUTH (2FA) CARD ── */}
        {(role === 'recruiter' || role === 'admin') && (
          <div className="bg-white border border-surface-mid rounded-xl p-6 shadow-sm space-y-4 animate-fadeIn select-none">
            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Two-Factor Authentication (2FA)
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed font-semibold">
              Add a layer of security to your recruiter account by requiring a verification OTP code sent to your registered email on every sign in attempt.
            </p>
            <div className="flex items-center justify-between py-2 border-t border-slate-50 pt-4">
              <div>
                <span className="text-xs font-extrabold text-text-primary block">Secure Email 2FA</span>
                <span className="text-[10px] text-text-muted font-semibold block mt-0.5">Dispatches 6-digit OTP codes via node mail server</span>
              </div>
              <Button
                variant={user?.twoFactorEnabled ? 'secondary' : 'primary'}
                onClick={() => void handleToggle2FA(!user?.twoFactorEnabled)}
                disabled={toggling2FA}
                className={`text-xs font-bold border ${user?.twoFactorEnabled
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 shadow-none'
                    : 'shadow-sm'
                  }`}
              >
                {toggling2FA ? 'Updating...' : user?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
              </Button>
            </div>
          </div>
        )}

        {/* ── ACTIVE SESSION MANAGEMENT CARD ── */}
        <div className="bg-white border border-surface-mid rounded-xl p-6 shadow-sm space-y-4 animate-fadeIn select-none">
          <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe className="w-4 h-4 text-primary" />
            Active Login Sessions
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed font-semibold">
            Manage your authenticated logins. If you suspect compromise or login activity from other sources, immediately terminate all concurrent sessions.
          </p>

          {revokeMsg && (
            <div className="p-3 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-semibold flex items-center gap-2 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin" />
              {revokeMsg}
            </div>
          )}

          <div className="flex items-center justify-between py-2 border-t border-slate-50 pt-4">
            <div>
              <span className="text-xs font-extrabold text-text-primary block">Current Session Status</span>
              <span className="text-[9px] bg-accent-teal/10 text-accent-teal font-bold px-2 py-0.5 border border-accent-teal/20 rounded uppercase tracking-wider mt-1 inline-block font-mono">
                ● Active Now
              </span>
            </div>
            <Button
              variant="danger"
              onClick={handleRevokeSessions}
              disabled={revoking}
              className="text-xs font-bold"
              icon={<LogOut className="w-3.5 h-3.5" />}
            >
              {revoking ? 'Invalidating...' : 'Log out everywhere else'}
            </Button>
          </div>
        </div>

        {/* ── CHANGE PASSWORD CARD ── */}
        <div className="bg-white border border-surface-mid rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3 select-none">
            <Lock className="w-4 h-4 text-primary" />
            Change Security Password
          </h2>

          {pwMsg && (
            <div className="p-3 bg-accent-teal/10 text-accent-teal border border-accent-teal/20 rounded-lg text-xs font-semibold flex items-center gap-2 select-none animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              {pwMsg}
            </div>
          )}
          {pwErr && (
            <div className="p-3 bg-accent-rose/10 text-accent-rose border border-accent-rose/20 rounded-lg text-xs font-semibold flex items-center gap-2 select-none animate-fadeIn">
              <AlertCircle className="w-4 h-4" />
              {pwErr}
            </div>
          )}

          {pwStep === 'idle' && (
            <div className="select-none pt-1">
              {emailEnabled ? (
                <Button
                  onClick={() => { setPwErr(''); void sendOtp(); }}
                  className="font-bold text-xs"
                  icon={<Lock className="w-3.5 h-3.5" />}
                >
                  Send OTP to Registered Email
                </Button>
              ) : (
                <Button
                  onClick={() => { setPwErr(''); setPwStep('direct'); }}
                  className="font-bold text-xs"
                  icon={<Lock className="w-3.5 h-3.5" />}
                >
                  Configure Password Directly
                </Button>
              )}
            </div>
          )}

          {pwStep === 'sending' && (
            <div className="flex items-center gap-2 py-2 text-text-secondary text-xs font-bold select-none animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-primary" />
              Dispatching secure verification OTP to your email inbox…
            </div>
          )}

          {pwStep === 'otp-sent' && (
            <form onSubmit={verifyOtp} className="space-y-4 max-w-md animate-fadeIn">
              <p className="text-xs text-text-secondary leading-relaxed font-semibold select-none">
                We've sent a 6-digit confirmation code to <span className="text-text-primary font-extrabold">{user?.email}</span>.
              </p>

              <div className="select-none py-2">
                <OTPInput
                  value={otp}
                  onChange={setOtp}
                  error={pwErr && pwErr.includes('code') ? pwErr : undefined}
                />
              </div>

              <div className="space-y-3">
                <div className="relative flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">New Security Password</label>
                  <div className="relative flex items-center">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={newPw}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPw(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full py-2.5 px-3.5 border rounded-lg bg-white border-surface-mid text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 text-text-muted hover:text-text-primary bg-transparent border-none p-0 cursor-pointer flex items-center"
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {newPw && (
                  <div className="space-y-1.5 select-none animate-fadeIn">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-text-muted uppercase tracking-wider">Strength Score:</span>
                      <span className="uppercase tracking-wider font-mono" style={{ color: `var(--color-${strengthInfo.color})` }}>
                        {strengthInfo.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 h-1">
                      {[1, 2, 3, 4].map((bar) => (
                        <div
                          key={bar}
                          className={`h-full rounded-full transition-all duration-300 ${bar <= strengthInfo.score ? strengthInfo.color : 'bg-slate-200'
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 select-none pt-2">
                <Button type="submit" size="sm" className="text-xs font-bold">
                  Verify &amp; Update Password
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => void sendOtp()} className="text-xs font-bold">
                  Resend Code
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => { setPwStep('idle'); setPwErr(''); }} className="text-xs font-bold">
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {pwStep === 'verifying' && (
            <div className="flex items-center gap-2 py-2 text-text-secondary text-xs font-bold select-none animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-primary" />
              Verifying code and hashing credentials…
            </div>
          )}

          {pwStep === 'direct' && (
            <form onSubmit={changeDirect} className="space-y-4 max-w-md animate-fadeIn">
              <div className="relative flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Current Password</label>
                <div className="relative flex items-center">
                  <input
                    type={showCurrPw ? 'text' : 'password'}
                    value={currPw}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrPw(e.target.value)}
                    className="w-full py-2.5 px-3.5 border rounded-lg bg-white border-surface-mid text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrPw(!showCurrPw)}
                    className="absolute right-3 text-text-muted hover:text-text-primary bg-transparent border-none p-0 cursor-pointer flex items-center"
                  >
                    {showCurrPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="relative flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">New Password</label>
                  <div className="relative flex items-center">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={newPw}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPw(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full py-2.5 px-3.5 border rounded-lg bg-white border-surface-mid text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 text-text-muted hover:text-text-primary bg-transparent border-none p-0 cursor-pointer flex items-center"
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {newPw && (
                  <div className="space-y-1.5 select-none animate-fadeIn">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-text-muted uppercase tracking-wider">Strength Score:</span>
                      <span className="uppercase tracking-wider font-mono" style={{ color: `var(--color-${strengthInfo.color})` }}>
                        {strengthInfo.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 h-1">
                      {[1, 2, 3, 4].map((bar) => (
                        <div
                          key={bar}
                          className={`h-full rounded-full transition-all duration-300 ${bar <= strengthInfo.score ? strengthInfo.color : 'bg-slate-200'
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 select-none pt-2">
                <Button type="submit" size="sm" className="text-xs font-bold">
                  Change Password
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => { setPwStep('idle'); setPwErr(''); }} className="text-xs font-bold">
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {pwStep === 'done' && (
            <div className="flex items-center gap-4 select-none pt-1">
              <span className="text-xs text-accent-teal font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                {pwMsg}
              </span>
              <Button variant="secondary" size="sm" onClick={() => { setPwStep('idle'); setPwMsg(''); }} className="text-xs font-bold">
                Change again
              </Button>
            </div>
          )}
        </div>

        {/* ── DANGER ZONE CARD ── */}
        <div className="bg-white border border-accent-rose rounded-xl p-6 shadow-sm space-y-4 relative overflow-hidden select-none">
          {/* Rose left strip */}
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-accent-rose" />

          <h2 className="text-xs font-bold text-accent-rose uppercase tracking-wider flex items-center gap-2 pl-2">
            <AlertTriangle className="w-4 h-4 text-accent-rose" />
            Danger Zone
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed font-semibold pl-2">
            Proceed with caution. Account deletion is permanent and will eliminate your credentials, profiles, jobs, resumes, and correspondence histories immediately.
          </p>
          <div className="pl-2 pt-2">
            <Button
              variant="danger"
              onClick={() => { setDeleteConfirmText(''); setDeleteMsg(''); setIsDeleteModalOpen(true); }}
              className="text-xs font-bold"
              icon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete Account
            </Button>
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Account Deletion"
        maxWidth="sm"
      >
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <div className="p-3.5 bg-accent-rose/10 text-accent-rose border border-accent-rose/20 rounded-xl text-xs flex gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div className="space-y-1 font-semibold leading-relaxed">
              <p className="font-extrabold text-text-primary">This action is irreversible.</p>
              <p>Deleting your account will erase all active applications, credentials, and portfolios.</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-text-secondary font-semibold">
              Type <strong className="text-text-primary font-mono select-all">DELETE</strong> below to confirm deletion.
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="h-10 text-center font-bold tracking-widest text-xs"
            />
          </div>

          {deleteMsg && (
            <div className={`p-3 rounded-lg text-xs font-semibold flex items-start gap-2 ${deleteMsg.includes('restricted')
                ? 'bg-primary/5 text-primary border border-primary/20'
                : 'bg-accent-rose/10 text-accent-rose border border-accent-rose/20'
              }`}>
              {deleteMsg.includes('restricted') ? (
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{deleteMsg}</span>
            </div>
          )}

          <div className="flex gap-2.5 pt-2">
            <Button
              type="submit"
              variant="danger"
              disabled={deleteConfirmText !== 'DELETE'}
              className="flex-1 font-bold text-xs"
              icon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Confirm Delete
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 font-bold text-xs"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

    </AuthenticatedLayout>
  );
}
