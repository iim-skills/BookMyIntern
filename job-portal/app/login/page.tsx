'use client';

import { useState, ChangeEvent, FormEvent, Suspense, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import OTPInput from '@/components/ui/OTPInput';

type RoleHint = 'student' | 'recruiter' | 'admin';

const ROLES: { value: RoleHint; label: string; icon: string; desc: string }[] = [
  { value: 'student', icon: 'school', label: 'Student', desc: 'Find internships' },
  { value: 'recruiter', icon: 'business', label: 'Recruiter', desc: 'Post & recruit' },
  { value: 'admin', icon: 'shield', label: 'Admin', desc: 'Moderate app' },
];

function LoginForm() {
  const [roleHint, setRoleHint] = useState<RoleHint>('student');
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 2FA states
  const [step, setStep] = useState<'form' | '2fa'>('form');
  const [otp, setOtp] = useState('');
  const [verifyErr, setVerifyErr] = useState('');
  const [verifyLoad, setVerifyLoad] = useState(false);
  
  // 2FA Resend Timer state
  const [countdown, setCountdown] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  // Handle countdown tick
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const set = (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Both fields are required.');
      return;
    }
    setLoading(true);
    const res = await signIn('credentials', { ...form, redirect: false });
    
    if (res?.error) {
      if (res.error === '2FA_REQUIRED') {
        setStep('2fa');
        setCountdown(60); // Start 60s resend timer
        setLoading(false);
        return;
      }
      setError(res.error);
      setLoading(false);
      return;
    }

    const sess = await fetch('/api/auth/session').then((r) => r.json()) as { user?: { role?: string } };
    const role = sess?.user?.role;
    if (role === 'admin') router.replace('/admin/dashboard');
    else if (role === 'recruiter') router.replace('/recruiter/dashboard');
    else router.replace(callbackUrl);
  };

  const submit2FA = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setVerifyErr('');
    if (otp.length < 6) {
      setVerifyErr('Please enter the complete 6-digit code.');
      return;
    }
    setVerifyLoad(true);

    const res = await signIn('credentials', { ...form, otp, redirect: false });
    setVerifyLoad(false);

    if (res?.error) {
      setVerifyErr(res.error);
      return;
    }

    const sess = await fetch('/api/auth/session').then((r) => r.json()) as { user?: { role?: string } };
    const role = sess?.user?.role;
    if (role === 'admin') router.replace('/admin/dashboard');
    else if (role === 'recruiter') router.replace('/recruiter/dashboard');
    else router.replace(callbackUrl);
  };

  const handleResendOTP = async () => {
    setCountdown(60);
    setVerifyErr('');
    // Resend triggers a silent sign-in to dispatch a new OTP code
    await signIn('credentials', { ...form, redirect: false });
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50">
      
      {/* LEFT PANEL: Branding & Visuals (Hidden on Mobile) */}
      <div 
        className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 text-white relative overflow-hidden select-none bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80")' }}
      >
        {/* Brand-Blue Gradient overlay over the Unsplash image */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/95 via-primary-dark/80 to-primary/45 z-0" />
        
        {/* Logo Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center text-xl font-display font-black tracking-tight text-white hover:opacity-90 transition-opacity decoration-none">
            Book<span className="text-blue-200">My</span>Intern
          </Link>
        </div>

        {/* Dynamic Graphic Mockup Container */}
        <div className="relative flex flex-col items-center justify-center flex-grow py-12 z-10">
          
          {/* Main Card Shape - Glassmorphic design */}
          <div className="relative w-full max-w-[380px] h-[300px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl animate-float flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px] text-blue-200">dashboard</span>
                  </div>
                  <div>
                    <div className="w-20 h-2.5 bg-white/40 rounded-full"></div>
                    <div className="w-12 h-1.5 bg-white/25 rounded-full mt-1.5"></div>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-[10px] rounded-full font-bold uppercase tracking-wider">
                  Live Status
                </span>
              </div>

              {/* Simulated Content Bars */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-blue-200">check_circle</span>
                  <div className="h-3 bg-white/30 rounded-lg w-3/4"></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-blue-200">check_circle</span>
                  <div className="h-3 bg-white/30 rounded-lg w-5/6"></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-blue-200">check_circle</span>
                  <div className="h-3 bg-white/30 rounded-lg w-1/2"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/15 pt-4 mt-4">
              <div className="flex -space-x-2.5">
                {[
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80'
                ].map((src, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-[#1E3A8A] overflow-hidden">
                    <img src={src} className="w-full h-full object-cover" alt="User Avatar" />
                  </div>
                ))}
              </div>
              <div className="w-20 h-2 bg-white/20 rounded-full"></div>
            </div>
          </div>

          {/* Floating Card 1 (Top Right Overlay) */}
          <div className="absolute -top-2 -right-2 bg-white/10 backdrop-blur-lg border border-white/10 rounded-xl p-3.5 shadow-lg max-w-[200px] text-white flex items-center gap-3 animate-float [animation-delay:1.5s]">
            <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[18px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>work</span>
            </div>
            <div>
              <p className="text-xs font-extrabold text-blue-200 font-mono leading-none">+280 listings</p>
              <p className="text-[9px] text-white/80 font-medium mt-1">added today in India</p>
            </div>
          </div>

          {/* Floating Card 2 (Bottom Left Overlay) */}
          <div className="absolute -bottom-2 -left-2 bg-white/10 backdrop-blur-lg border border-white/10 rounded-xl p-3.5 shadow-lg max-w-[210px] text-white flex items-center gap-3 animate-float [animation-delay:0.7s]">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[20px] text-emerald-300" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
            </div>
            <div>
              <p className="text-xs font-extrabold text-white leading-none">3 Interview Invites</p>
              <p className="text-[9px] text-white/85 font-medium mt-1">from top startup firms</p>
            </div>
          </div>
        </div>

        {/* Footer Brand Quote */}
        <div className="relative z-10 border-t border-white/15 pt-6">
          <p className="text-xs font-medium text-white/80 leading-relaxed italic">
            "BookMyIntern connects high-impact students with forward-thinking employers to build the future of Indian startups."
          </p>
        </div>
      </div>

      {/* RIGHT PANEL: Authentication Form */}
      <div className="flex flex-col justify-center lg:col-span-7 px-6 py-12 lg:px-16 xl:px-24 bg-white relative">
        
        {/* Desktop Back to Home Exit Button */}
        <div className="absolute top-8 right-8 hidden lg:block select-none z-20">
          <Link href="/" className="text-xs font-bold text-text-secondary hover:text-primary transition-colors flex items-center gap-1.5 decoration-none">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Home
          </Link>
        </div>

        {/* Mobile Header (Shown only on small/medium screens) */}
        <div className="lg:hidden absolute top-6 left-6 right-6 flex items-center justify-between z-10 select-none">
          <Link href="/" className="text-lg font-display font-black text-text-primary decoration-none">
            Book<span className="text-primary">My</span>Intern
          </Link>
          <div className="flex items-center gap-3 text-xs font-bold">
            <Link href="/" className="text-text-secondary hover:text-primary transition-colors decoration-none">
              Home
            </Link>
            <span className="text-slate-200 font-normal">|</span>
            <Link href={`/signup?role=${roleHint}`} className="text-primary hover:underline decoration-none">
              Register
            </Link>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto space-y-8">
          
          {/* STEP 1: FORM */}
          {step === 'form' && (
            <>
              {/* Form Heading */}
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-extrabold text-text-primary tracking-tight">
                  Welcome back
                </h2>
                <p className="text-sm text-text-secondary font-medium">
                  New to BookMyIntern?{' '}
                  <Link href={`/signup?role=${roleHint}`} className="text-primary font-bold hover:underline">
                    Sign up free &rarr;
                  </Link>
                </p>
              </div>

              {/* Role hint pills selector */}
              <div className="space-y-3 select-none">
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                  Sign in as
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {ROLES.map((r) => {
                    const isActive = roleHint === r.value;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRoleHint(r.value)}
                        className={`flex flex-col items-center justify-center border rounded-xl p-3 cursor-pointer transition-all duration-200 outline-none w-full ${
                          isActive
                            ? 'border-primary bg-primary/5 text-primary shadow-xs ring-1 ring-primary/20'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-text-secondary bg-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px] mb-1.5 leading-none">
                          {r.icon}
                        </span>
                        <span className="font-extrabold text-xs leading-none mb-1">
                          {r.label}
                        </span>
                        <span className="text-[9px] text-text-muted font-bold tracking-wide uppercase leading-tight text-center">
                          {r.value === 'admin' ? 'App System' : r.value}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Display errors if any */}
              {error && (
                <div className="flex items-start gap-2.5 bg-accent-rose/5 border border-accent-rose/25 text-accent-rose p-3 rounded-xl text-xs font-semibold">
                  <span className="material-symbols-outlined text-base leading-none">error</span>
                  <span className="leading-normal">{error}</span>
                </div>
              )}

              {/* LoginForm Submit */}
              <form onSubmit={submit} className="space-y-5">
                
                {/* Email Input */}
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={set}
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  icon={<span className="material-symbols-outlined text-[18px]">mail</span>}
                />

                {/* Password Input with Show/Hide button */}
                <div className="space-y-1.5 relative w-full">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                      Password
                    </label>
                    <Link href="/forgot-password" className="text-[11px] font-bold text-primary hover:underline">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-text-muted flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">lock</span>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={set}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      required
                      className="w-full py-2.5 pl-10 pr-12 border border-slate-200 rounded-lg bg-white text-sm text-text-primary transition-all duration-200 outline-none placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-text-muted hover:text-text-primary p-1 rounded transition-colors cursor-pointer flex items-center justify-center bg-transparent border-none"
                      tabIndex={-1}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Submit button wrapper */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    className="w-full shadow-sm text-sm"
                  >
                    Sign In as {ROLES.find((r) => r.value === roleHint)?.label}
                  </Button>
                </div>
              </form>

              {/* Divider */}
              <div className="relative flex items-center select-none py-2">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-text-muted text-[10px] font-bold uppercase tracking-wider">
                  Or continue with
                </span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              {/* Google OAuth Login Button */}
              <button
                onClick={() => void signIn('google')}
                className="w-full py-2.5 px-4 border border-slate-200 rounded-lg font-bold text-text-primary bg-white hover:bg-slate-50 transition-all flex items-center justify-center gap-2.5 text-xs shadow-sm cursor-pointer outline-none active:scale-[0.99] border-solid"
              >
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.72 0 3.28.59 4.49 1.76l3.36-3.36C17.8 1.64 15.11 1 12 1 7.37 1 3.4 3.64 1.48 7.48l3.96 3.07C6.38 7.33 8.97 5.04 12 5.04z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.46-1.1 2.69-2.34 3.52l3.65 2.83c2.14-1.97 3.38-4.88 3.38-8.45z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.44 14.77C5.17 13.97 5.02 13.11 5.02 12s.15-1.97.42-2.77L1.48 6.16C.54 8.04 0 10.14 0 12s.54 3.96 1.48 5.84l3.96-3.07z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.65-2.83c-1.01.68-2.31 1.08-4.31 1.08-3.03 0-5.62-2.29-6.56-5.51L1.48 15.93C3.4 19.76 7.37 23 12 23z"
                  />
                </svg>
                <span>Sign In with Google</span>
              </button>
            </>
          )}

          {/* STEP 2: 2FA OVERLAY */}
          {step === '2fa' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-extrabold text-text-primary tracking-tight">
                  Enter verification code
                </h3>
                <p className="text-sm text-text-secondary font-medium">
                  We sent a 6-digit verification code to <strong className="text-text-primary">{form.email}</strong>
                </p>
              </div>

              {verifyErr && (
                <div className="flex items-start gap-2.5 bg-accent-rose/5 border border-accent-rose/25 text-accent-rose p-3 rounded-xl text-xs font-semibold">
                  <span className="material-symbols-outlined text-base leading-none">error</span>
                  <span className="leading-normal">{verifyErr}</span>
                </div>
              )}

              <form onSubmit={submit2FA} className="space-y-6">
                
                {/* Reusable OTP primitive component */}
                <OTPInput
                  value={otp}
                  onChange={setOtp}
                  error={verifyErr}
                />

                <div className="space-y-3">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={verifyLoad}
                    className="w-full shadow-sm text-sm"
                  >
                    Verify Code
                  </Button>

                  {/* Resend with 60s countdown timer */}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendOTP}
                    disabled={countdown > 0}
                    className="w-full font-bold text-xs"
                  >
                    {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setStep('form');
                      setError('');
                      setOtp('');
                      setVerifyErr('');
                    }}
                    className="w-full font-bold text-xs border border-slate-200"
                  >
                    Back to Sign In
                  </Button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
