'use client';

import { useState, FormEvent, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token || !email) {
      setError('Invalid reset link. Please request a new one.');
      return;
    }

    if (!password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password }),
      });
      const data = await res.json() as { ok?: boolean; error?: string; message?: string };
      setLoading(false);

      if (!res.ok) {
        setError(data.error ?? 'Failed to reset password.');
        return;
      }

      setMessage(data.message ?? 'Password updated successfully!');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setLoading(false);
      setError('An error occurred. Please try again.');
    }
  };

  // Password strength logic
  const getPasswordStrength = (pwd: string): number => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(password);

  const getStrengthMeta = (score: number) => {
    switch (score) {
      case 1:
        return { label: 'Weak', color: 'bg-accent-rose', text: 'text-accent-rose' };
      case 2:
        return { label: 'Fair', color: 'bg-accent-amber', text: 'text-accent-amber' };
      case 3:
        return { label: 'Good', color: 'bg-accent-teal', text: 'text-accent-teal' };
      case 4:
        return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500' };
      default:
        return { label: '', color: 'bg-surface-mid', text: 'text-text-muted' };
    }
  };

  const strengthMeta = getStrengthMeta(strength);
  const doPasswordsMatch = password && confirmPassword && password === confirmPassword;

  return (
    <div className="min-h-screen bg-surface-light flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Blurred background vectors */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-pulse delay-1000"></div>

      {/* Brand logo top link */}
      <div className="mb-8 select-none">
        <Link href="/" className="inline-flex items-center text-2xl font-display font-black tracking-tight text-text-primary hover:opacity-90 transition-opacity decoration-none">
          Book<span className="text-primary">My</span>Intern
        </Link>
      </div>

      {/* Centered form card */}
      <div className="w-full max-w-[440px] bg-white border border-surface-mid rounded-card-lg shadow-md p-10 relative z-10 transition-all duration-300 hover:shadow-lg">
        
        {message ? (
          // SUCCESS STATE CARD
          <div className="space-y-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-accent-teal/15 text-accent-teal flex items-center justify-center mb-5 select-none animate-bounce">
                <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <h2 className="text-2xl font-display font-extrabold text-text-primary tracking-tight">
                Password updated!
              </h2>
              <p className="text-xs text-text-secondary font-medium mt-3 leading-relaxed">
                Your credentials have been securely updated.
              </p>
              <p className="text-[11px] text-text-muted font-bold mt-2 leading-relaxed">
                Redirecting you to the sign-in portal shortly...
              </p>
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline decoration-none">
                Sign In Now &rarr;
              </Link>
            </div>
          </div>
        ) : !token || !email ? (
          // EXPIRED / INVALID TOKEN STATE CARD
          <div className="space-y-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-accent-amber/15 text-accent-amber flex items-center justify-center mb-5 select-none">
                <span className="material-symbols-outlined text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              </div>
              <h2 className="text-2xl font-display font-extrabold text-text-primary tracking-tight">
                Expired or Invalid Link
              </h2>
              <p className="text-xs text-text-secondary font-medium mt-3 leading-relaxed px-2">
                This password reset request has expired, has already been used, or contains invalid credentials.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
              <Link href="/forgot-password" className="w-full">
                <Button variant="primary" size="md" className="w-full font-bold">
                  Request a new link &rarr;
                </Button>
              </Link>
              <Link href="/login" className="text-xs font-bold text-text-secondary hover:text-primary transition-colors decoration-none">
                Return to login
              </Link>
            </div>
          </div>
        ) : (
          // RESET PASSWORD FORM
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
              {/* Lock icon in 56px blue circle */}
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-5 select-none">
                <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
              </div>
              <h2 className="text-2xl font-display font-extrabold text-text-primary tracking-tight">
                Set new password
              </h2>
              <p className="text-xs text-text-secondary font-medium mt-2 leading-relaxed">
                Enter your new dashboard passcode below.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-accent-rose/5 border border-accent-rose/20 text-accent-rose p-3 rounded-lg text-xs font-semibold animate-pulse">
                <span className="material-symbols-outlined text-base leading-none">error</span>
                <span className="leading-normal">{error}</span>
              </div>
            )}

            <form onSubmit={submit} className="space-y-5">
              
              {/* New Password with Strength Meter */}
              <div className="space-y-1.5 w-full">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  New Password <span className="font-normal text-text-muted lowercase">(min. 6 chars)</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-text-muted flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full py-2.5 pl-10 pr-12 border border-surface-mid rounded-lg bg-white text-sm text-text-primary transition-all duration-200 outline-none placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-text-muted hover:text-text-primary p-1 rounded transition-colors cursor-pointer flex items-center justify-center"
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>

                {/* Password Strength Meter */}
                {password && (
                  <div className="space-y-1.5 pt-1.5 animate-fadeIn">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-text-secondary uppercase">Password Strength</span>
                      <span className={`${strengthMeta.text} uppercase`}>{strengthMeta.label}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                      {[1, 2, 3, 4].map((stepVal) => (
                        <div
                          key={stepVal}
                          className={`h-full transition-all duration-200 rounded-full ${
                            strength >= stepVal ? strengthMeta.color : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password input with match checkmark when matched */}
              <div className="space-y-1.5 w-full relative">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-text-muted flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={`w-full py-2.5 pl-10 pr-12 border rounded-lg bg-white text-sm text-text-primary transition-all duration-200 outline-none placeholder:text-text-muted focus:ring-2 focus:ring-primary/10 ${
                      doPasswordsMatch
                        ? 'border-accent-teal focus:border-accent-teal focus:ring-accent-teal/10'
                        : 'border-surface-mid focus:border-primary'
                    }`}
                  />
                  
                  {/* Absolute visual icons: eye toggle AND check mark */}
                  <div className="absolute right-3 flex items-center gap-1 text-text-muted">
                    {doPasswordsMatch && (
                      <span className="material-symbols-outlined text-[18px] text-accent-teal select-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="hover:text-text-primary p-1 rounded transition-colors cursor-pointer flex items-center justify-center"
                      tabIndex={-1}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showConfirmPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Update Password Action Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full shadow-sm text-sm mt-3"
              >
                Update Password
              </Button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
