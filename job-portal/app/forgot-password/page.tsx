'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [mockLink, setMockLink] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setMockLink('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json() as { ok?: boolean; error?: string; message?: string; mockLink?: string };
      setLoading(false);

      if (!res.ok) {
        setError(data.error ?? 'Failed to send reset link.');
        return;
      }

      setMessage(data.message ?? 'Reset link sent successfully.');
      if (data.mockLink) {
        setMockLink(data.mockLink);
      }
    } catch (err) {
      setLoading(false);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-surface-light flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decorative blurred background blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-pulse delay-1000"></div>

      {/* Top logo */}
      <div className="mb-8 select-none">
        <Link href="/" className="inline-flex items-center text-2xl font-display font-black tracking-tight text-text-primary hover:opacity-90 transition-opacity decoration-none">
          Book<span className="text-primary">My</span>Intern
        </Link>
      </div>

      {/* Centered card */}
      <div className="w-full max-w-[440px] bg-white border border-surface-mid rounded-card-lg shadow-md p-10 relative z-10 transition-all duration-300 hover:shadow-lg">
        
        {!message ? (
          // FORM STATE
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
              {/* Envelope icon in 56px circle */}
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-5 select-none">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
              </div>
              <h2 className="text-2xl font-display font-extrabold text-text-primary tracking-tight">
                Reset your password
              </h2>
              <p className="text-xs text-text-secondary font-medium mt-2 leading-relaxed">
                Enter the email you signed up with and we'll send you a password reset link.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-accent-rose/5 border border-accent-rose/20 text-accent-rose p-3 rounded-lg text-xs font-semibold animate-pulse">
                <span className="material-symbols-outlined text-base leading-none">error</span>
                <span className="leading-normal">{error}</span>
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<span className="material-symbols-outlined text-[18px]">mail</span>}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full shadow-sm text-sm"
              >
                Send Reset Link
              </Button>
            </form>

            <div className="pt-2 text-center">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-primary transition-colors decoration-none">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          // SUCCESS STATE
          <div className="space-y-6 text-center">
            <div className="flex flex-col items-center">
              {/* Green checkmark in 56px circle */}
              <div className="w-14 h-14 rounded-full bg-accent-teal/15 text-accent-teal flex items-center justify-center mb-5 select-none">
                <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <h2 className="text-2xl font-display font-extrabold text-text-primary tracking-tight">
                Check your inbox
              </h2>
              <p className="text-xs text-text-secondary font-medium mt-3 leading-relaxed">
                We've sent password reset instructions to <strong className="text-text-primary">{email}</strong>.
              </p>
              <p className="text-[11px] text-text-muted font-medium mt-2 leading-relaxed">
                If it doesn't arrive within a few minutes, check your spam or junk folder.
              </p>
            </div>

            {mockLink && (
              <div className="bg-primary/5 border border-primary/20 text-text-primary p-4 rounded-xl text-left text-xs leading-normal space-y-2.5 animate-pulse">
                <div className="flex items-center gap-1.5 font-bold text-primary select-none">
                  <span className="material-symbols-outlined text-[16px]">bug_report</span>
                  <span>Debug Mode (SMTP Disabled)</span>
                </div>
                <p className="text-text-secondary font-medium">Click the link below to load the password reset key locally:</p>
                <a href={mockLink} className="block text-primary hover:underline font-extrabold break-all font-mono py-1 px-1.5 bg-white border border-surface-mid rounded">
                  {mockLink}
                </a>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline decoration-none">
                Return to Login
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
