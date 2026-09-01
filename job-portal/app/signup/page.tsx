'use client';

import { useState, ChangeEvent, FormEvent, Suspense, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import OTPInput from '@/components/ui/OTPInput';

type SignupRole = 'student' | 'recruiter' | 'admin';

const ROLES: { value: SignupRole; icon: string; label: string; desc: string }[] = [
  { value: 'student', icon: 'school', label: 'Student', desc: "Looking for internships" },
  { value: 'recruiter', icon: 'business_center', label: 'Recruiter', desc: "Hiring top talent" },
  { value: 'admin', icon: 'shield', label: 'Admin', desc: "Moderate platform" },
];

interface SignupFormState {
  name: string;
  email: string;
  password: string;
  role: SignupRole;
  adminKey: string;
}

function SignupForm() {
  const params = useSearchParams();
  const initRole = (params.get('role') ?? 'student') as SignupRole;
  const callbackUrl = params.get('callbackUrl') || '/';
  const router = useRouter();

  const showAdmin = params.get('admin') === 'true' || initRole === 'admin';

  const [form, setForm] = useState<SignupFormState>({
    name: '',
    email: '',
    password: '',
    role: initRole,
    adminKey: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Verification states
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [otp, setOtp] = useState('');
  const [verifyErr, setVerifyErr] = useState('');
  const [verifyLoad, setVerifyLoad] = useState(false);
  
  // Timer state for resend code
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const set = (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const setRole = (r: SignupRole) => setForm((f) => ({ ...f, role: r, adminKey: '' }));

  // Password strength calculation (0 to 4)
  const getPasswordStrength = (pwd: string): number => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(form.password);

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
        return { label: '', color: 'bg-slate-200', text: 'text-text-muted' };
    }
  };

  const strengthMeta = getStrengthMeta(strength);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.role === 'admin' && !form.adminKey.trim()) {
      setError('Admin secret key is required.');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        adminKey: form.adminKey || undefined,
      }),
    });
    
    const data = await res.json() as { ok?: boolean; error?: string; requiresVerification?: boolean };
    setLoading(false);
    
    if (!res.ok) {
      setError(data.error ?? 'Signup failed.');
      return;
    }
    
    if (data.requiresVerification) {
      setStep('verify');
      setCountdown(60); // Start 60s timer for email verification
      return;
    }
    
    // Auto sign-in
    const sr = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
    if (sr?.error) {
      setError('Account created. Please sign in manually.');
      return;
    }
    
    if (form.role === 'admin') router.replace('/admin/dashboard');
    else if (form.role === 'recruiter') router.replace('/recruiter/dashboard');
    else router.replace(callbackUrl);
  };

  const verifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setVerifyErr('');
    if (otp.length < 6) {
      setVerifyErr('Please enter the complete 6-digit verification code.');
      return;
    }
    setVerifyLoad(true);
    const res = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, otp }),
    });
    const data = await res.json() as { ok?: boolean; error?: string };
    setVerifyLoad(false);
    
    if (!res.ok) {
      setVerifyErr(data.error ?? 'Verification failed.');
      return;
    }
    
    const sr = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
    if (sr?.error) {
      setVerifyErr('Email verified! Please sign in manually on the login page.');
      return;
    }
    if (form.role === 'recruiter') router.replace('/recruiter/dashboard');
    else router.replace(callbackUrl);
  };

  const resend = async () => {
    setCountdown(60);
    setVerifyErr('');
    await fetch('/api/auth/verify-email', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email }),
    });
  };

  // Filter roles based on showAdmin flag
  const displayedRoles = showAdmin ? ROLES : ROLES.filter(r => r.value !== 'admin');

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50">
      
      {/* LEFT PANEL: Branding & Visuals (Hidden on Mobile) */}
      <div 
        className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 text-white relative overflow-hidden select-none bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80")' }}
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
          
          {/* Main Handshake Card Shape - Glassmorphic design */}
          <div className="relative w-full max-w-[380px] h-[300px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl animate-float flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px] text-blue-200">handshake</span>
                </div>
                <div className="w-24 h-2.5 bg-white/40 rounded-full"></div>
              </div>
              <span className="px-2.5 py-0.5 bg-accent-amber/20 text-accent-amber border border-accent-amber/20 text-[10px] rounded-full font-bold uppercase tracking-wider">
                Matching Vows
              </span>
            </div>

            {/* Handshake details */}
            <div className="flex justify-center my-6 relative">
              <div className="flex items-center gap-8 z-10">
                <div className="flex flex-col items-center gap-2 bg-white/15 p-3 rounded-xl border border-white/10 text-center w-24">
                  <span className="material-symbols-outlined text-2xl text-blue-200">school</span>
                  <div className="w-12 h-1 bg-white/30 rounded-full mt-1.5"></div>
                </div>
                
                {/* Connecting node */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent-teal shadow-lg text-white">
                  <span className="material-symbols-outlined text-base">check</span>
                </div>

                <div className="flex flex-col items-center gap-2 bg-white/15 p-3 rounded-xl border border-white/10 text-center w-24">
                  <span className="material-symbols-outlined text-2xl text-blue-200">business_center</span>
                  <div className="w-12 h-1 bg-white/30 rounded-full mt-1.5"></div>
                </div>
              </div>

              {/* Connecting dot path */}
              <div className="absolute top-1/2 left-8 right-8 h-0.5 border-t border-dashed border-white/25 -translate-y-1/2 z-0"></div>
            </div>

            <div className="flex items-center justify-between border-t border-white/15 pt-4">
              <div className="w-20 h-2 bg-white/20 rounded-full"></div>
              <div className="w-14 h-4 bg-white/20 rounded-lg"></div>
            </div>
          </div>

          {/* Floating Category Card 1 (Top Left Overlay) */}
          <div className="absolute -top-2 -left-2 bg-white/10 backdrop-blur-lg border border-white/10 rounded-xl p-3 shadow-lg text-white flex items-center gap-2.5 animate-float [animation-delay:1.2s]">
            <span className="material-symbols-outlined text-blue-200 text-lg">code</span>
            <span className="text-xs font-semibold">Tech Roles &bull; 4k+ Live</span>
          </div>

          {/* Floating Category Card 2 (Bottom Right Overlay) */}
          <div className="absolute -bottom-2 -right-2 bg-white/10 backdrop-blur-lg border border-white/10 rounded-xl p-3 shadow-lg text-white flex items-center gap-2.5 animate-float [animation-delay:0.5s]">
            <span className="material-symbols-outlined text-accent-teal text-lg">palette</span>
            <span className="text-xs font-semibold">Design &bull; PPO Perks</span>
          </div>
        </div>

        {/* Footer Brand Quote */}
        <div className="relative z-10 border-t border-white/15 pt-6">
          <p className="text-xs font-medium text-white/80 leading-relaxed italic">
            "We match verified Indian startup recruiters with high-potential students who want to build real experience fast."
          </p>
        </div>
      </div>

      {/* RIGHT PANEL: Sign Up Form */}
      <div className="flex flex-col justify-center lg:col-span-7 px-6 py-12 lg:px-16 xl:px-24 bg-white relative">
        
        {/* Desktop Back to Home Exit Button */}
        <div className="absolute top-8 right-8 hidden lg:block select-none z-20">
          <Link href="/" className="text-xs font-bold text-text-secondary hover:text-primary transition-colors flex items-center gap-1.5 decoration-none">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Home
          </Link>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden absolute top-6 left-6 right-6 flex items-center justify-between z-10 select-none">
          <Link href="/" className="text-lg font-display font-black text-text-primary decoration-none">
            Book<span className="text-primary">My</span>Intern
          </Link>
          <div className="flex items-center gap-3 text-xs font-bold">
            <Link href="/" className="text-text-secondary hover:text-primary transition-colors decoration-none">
              Home
            </Link>
            <span className="text-slate-200 font-normal">|</span>
            <Link href={`/login?role=${form.role}`} className="text-primary hover:underline decoration-none">
              Sign In
            </Link>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto space-y-6">
          
          {/* STEP 1: FORM */}
          {step === 'form' && (
            <>
              {/* Form Heading */}
              <div className="space-y-1.5">
                <h2 className="text-3xl font-display font-extrabold text-text-primary tracking-tight">
                  Create your account
                </h2>
                <p className="text-sm text-text-secondary font-medium">
                  Already have an account?{' '}
                  <Link href={`/login?role=${form.role}`} className="text-primary font-bold hover:underline">
                    Sign in &rarr;
                  </Link>
                </p>
              </div>

              {/* Role selection Cards */}
              <div className="space-y-2 select-none">
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                  Join as
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {displayedRoles.map((r) => {
                    const isSelected = form.role === r.value;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={`flex flex-col items-center justify-center border rounded-xl p-3 cursor-pointer transition-all duration-200 outline-none w-full ${
                          isSelected
                            ? 'border-primary bg-primary/5 text-primary shadow-xs ring-1 ring-primary/20'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-text-secondary bg-white'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-[20px] mb-1.5 leading-none ${isSelected ? 'text-primary' : 'text-text-secondary'}`}>
                          {r.icon}
                        </span>
                        <span className="font-extrabold text-xs leading-none mb-1 text-text-primary">
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

              {/* Error container */}
              {error && (
                <div className="flex items-start gap-2.5 bg-accent-rose/5 border border-accent-rose/25 text-accent-rose p-3 rounded-xl text-xs font-semibold">
                  <span className="material-symbols-outlined text-base leading-none">error</span>
                  <span className="leading-normal">{error}</span>
                </div>
              )}

              {/* Form submit */}
              <form onSubmit={submit} className="space-y-4">
                
                {/* Full Name */}
                <Input
                  label="Full Name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={set}
                  autoComplete="name"
                  placeholder="John Doe"
                  required
                  icon={<span className="material-symbols-outlined text-[18px]">person</span>}
                />

                {/* Email Address */}
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

                {/* Password field with strength indicator */}
                <div className="space-y-1.5 w-full">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Password <span className="font-normal text-text-muted lowercase">(min. 6 chars)</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-text-muted flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">lock</span>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={set}
                      autoComplete="new-password"
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

                  {/* Password Strength Meter (4 segment bar) */}
                  {form.password && (
                    <div className="space-y-1.5 pt-1.5">
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

                {/* Admin Key - shown only when Admin card is selected */}
                {form.role === 'admin' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                      Admin Secret Key <span className="text-accent-rose font-normal">*</span>
                    </label>
                    <Input
                      type="password"
                      name="adminKey"
                      value={form.adminKey}
                      onChange={set}
                      placeholder="Enter admin secret key"
                      required
                      icon={<span className="material-symbols-outlined text-[18px]">key</span>}
                    />
                    <p className="text-[10px] text-text-muted font-medium leading-normal">
                      This key is set in the server's environment variables (ADMIN_SIGNUP_KEY).
                    </p>
                  </div>
                )}

                {/* Submit button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    className="w-full shadow-sm text-sm"
                  >
                    Create {ROLES.find((r) => r.value === form.role)?.label} Account
                  </Button>
                </div>
              </form>

              {/* Google OAuth Button */}
              <div className="relative flex items-center select-none py-1">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-text-muted text-[10px] font-bold uppercase tracking-wider">
                  Or register with
                </span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

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
                <span>Sign Up with Google</span>
              </button>

              {/* Terms and Privacy policy disclaimer */}
              <p className="text-[11px] text-text-muted text-center leading-relaxed">
                By signing up, you agree to our{' '}
                <a href="#" className="text-primary font-semibold hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary font-semibold hover:underline">
                  Privacy Policy
                </a>.
              </p>
            </>
          )}

          {/* STEP 2: VERIFICATION OTP SCREEN */}
          {step === 'verify' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-extrabold text-text-primary tracking-tight">
                  Verify your email
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

              <form onSubmit={verifyOtp} className="space-y-6">
                
                {/* OTP Input component */}
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
                    Verify & Sign In
                  </Button>

                  {/* Resend button */}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={resend}
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
                    Back to Form
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

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
