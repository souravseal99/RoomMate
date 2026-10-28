import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AuthFormInputData } from '@/types/authTypes';
import { loginSchema, registerSchema, AUTH_MODE_REGISTER } from '@/schemas/authSchemas';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Fingerprint,
  Pin,
  ArrowRight,
  ChevronRight,
  UserPlus,
  Wifi,
  Receipt,
  Sparkles,
  ShieldCheck,
  Loader2,
  KeyRound,
} from 'lucide-react';
import { toast } from 'sonner';

export function AuthForm({ mode, onSubmit, isLoading = false }: Readonly<AuthFormInputData>) {
  const isRegister = mode === AUTH_MODE_REGISTER;
  const schema = isRegister ? registerSchema : loginSchema;
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: isRegister ? { name: '', email: '', password: '' } : { email: '', password: '' },
  });

  const navigate = useNavigate();
  const isPending = isLoading || form.formState.isSubmitting;

  const handlePasskeyAuth = () => {
    toast.info('Passkey authentication simulated for demo environment', {
      description: 'Use your flatmate credentials below to complete standard sign in.',
    });
  };

  const handleSocialAuth = (provider: string) => {
    toast.info(`${provider} sign-in simulated`, {
      description: 'Please sign in with your email and passcode.',
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-surface text-foreground font-sans selection:bg-primary/20">
      {/* Top Glass Header */}
      <header className="sticky top-0 z-40 w-full bg-surface/90 backdrop-blur-xl border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs">
              <Home className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-foreground">RoomMate</span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold tracking-wider uppercase">
              Co-Living OS
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              type="button"
              onClick={() =>
                toast.info('Passkey Support', {
                  description: 'Passkeys link your TouchID/FaceID directly to your flat.',
                })
              }
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Help with Passkey
            </button>
            <button
              type="button"
              onClick={() =>
                toast.info('Support Desk', {
                  description: 'Contact your house admin for code resets.',
                })
              }
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Support
            </button>
            <div className="w-8 h-8 rounded-full bg-surface-container-high border border-border flex items-center justify-center text-muted-foreground">
              <KeyRound className="w-4 h-4 text-primary" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="w-full flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Heavy-Stock Resident Check-In Card (7 cols) */}
            <div className="lg:col-span-7 relative bg-card rounded-2xl p-6 sm:p-8 shadow-xl border border-border flex flex-col gap-6">
              {/* Washi Tape Accent at Top Center */}
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-primary/20 backdrop-blur-xs rounded shadow-xs rotate-[-1deg] border border-primary/30 pointer-events-none z-10"
                aria-hidden="true"
              />

              {/* Friendly Welcome Title */}
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {isRegister ? 'Join your household' : 'Welcome back home'}
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isRegister
                    ? 'Create your flatmate profile to manage rosters, splits, and supplies.'
                    : 'Sign in to check the chore roster, split grocery receipts, or unlock the flat doors.'}
                </p>
              </div>

              {/* 1-Tap Biometric / Keyholder Passkey Hero Button */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-border/60 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-inner">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">
                      Household Quick Passkey
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Instant unlock via TouchID, FaceID or Keychain
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handlePasskeyAuth}
                  className="px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs active:translate-y-0.5 transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Unlock with Passkey</span>
                </Button>
              </div>

              {/* Mode Switcher Tabs (Sign In / Register) */}
              <div className="flex items-center p-1 bg-surface-container-low rounded-xl self-start gap-1 border border-border/40">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    !isRegister
                      ? 'bg-foreground text-background shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isRegister
                      ? 'bg-foreground text-background shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  New Flatmate / Join Flat
                </button>
              </div>

              {/* Social Tactile Sign-in Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialAuth('Google')}
                  className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-border/60 transition-all text-xs font-semibold text-foreground active:scale-[0.98] shadow-xs cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Google Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialAuth('Apple')}
                  className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-border/60 transition-all text-xs font-semibold text-foreground active:scale-[0.98] shadow-xs cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.9.04-2.02.6-2.67 1.34-.56.64-1.06 1.7-0.93 2.74 1.01.08 2.05-.51 2.68-1.21z" />
                  </svg>
                  <span>Apple ID</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-1">
                <div className="w-full h-px bg-border" />
                <span className="absolute bg-card px-3 text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">
                  Or Use Flatmate Credentials
                </span>
              </div>

              {/* Primary Form */}
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                {isRegister && (
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-xs font-semibold text-foreground"
                      htmlFor="roommate-name"
                    >
                      Full Name
                    </label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <input
                        id="roommate-name"
                        {...form.register('name')}
                        type="text"
                        placeholder="Alex Chen"
                        className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-xl text-sm text-foreground border border-border/60 focus:outline-none focus:bg-card focus:ring-2 focus:ring-primary shadow-inner transition-all placeholder:text-muted-foreground/50"
                      />
                    </div>
                    {form.formState.errors.name && (
                      <p className="text-xs text-destructive font-medium mt-0.5">
                        {form.formState.errors.name?.message as string}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      className="text-xs font-semibold text-foreground"
                      htmlFor="roommate-email"
                    >
                      Flatmate Email or Handle
                    </label>
                    <span className="text-[11px] text-muted-foreground">e.g. sam@flat4b.house</span>
                  </div>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      id="roommate-email"
                      {...form.register('email')}
                      type="email"
                      placeholder="name@example.com or flat handle"
                      className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-xl text-sm text-foreground border border-border/60 focus:outline-none focus:bg-card focus:ring-2 focus:ring-primary shadow-inner transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive font-medium mt-0.5">
                      {form.formState.errors.email?.message as string}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      className="text-xs font-semibold text-foreground"
                      htmlFor="roommate-password"
                    >
                      Passcode / Keyphrase
                    </label>
                    {!isRegister && (
                      <button
                        type="button"
                        onClick={() =>
                          toast.info('Passcode Reset', {
                            description: 'Ask your flat admin to share the house keyphrase.',
                          })
                        }
                        className="text-[11px] text-primary hover:underline cursor-pointer"
                      >
                        Forgot passcode?
                      </button>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      id="roommate-password"
                      {...form.register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your secret flat passcode"
                      className="w-full pl-10 pr-10 py-2.5 bg-surface-container-low rounded-xl text-sm text-foreground border border-border/60 focus:outline-none focus:bg-card focus:ring-2 focus:ring-primary shadow-inner transition-all placeholder:text-muted-foreground/50"
                    />
                    <button
                      type="button"
                      aria-label="Toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-xs text-destructive font-medium mt-0.5">
                      {form.formState.errors.password?.message as string}
                    </p>
                  )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
                    />
                    <span className="text-xs text-foreground font-medium">
                      Keep my flatmate profile active on this device
                    </span>
                  </label>
                </div>

                {/* Submit Action */}
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full mt-2 py-3 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-md active:translate-y-0.5 transition-all cursor-pointer min-h-[44px]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating resident...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {isRegister ? 'Create Account & Join Flat' : 'Sign In to Account'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Got an Invite Code Card */}
              <div
                onClick={() => navigate(isRegister ? '/login' : '/register')}
                className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20 shadow-xs cursor-pointer group hover:bg-primary/15 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center text-primary shadow-xs">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-foreground">
                      {isRegister
                        ? 'Already registered for your flat?'
                        : 'Have an invite code from flatmates?'}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {isRegister
                        ? 'Sign in with your existing credentials'
                        : 'Create an account first to join your shared home'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-card text-primary font-semibold shadow-xs">
                    {isRegister ? 'Sign In' : 'Create Account'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Domestic Fridge & Pinboard Deck (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Physical Domestic Sticky Note pinned with tape */}
              <div className="relative bg-[#FEF9C3] dark:bg-amber-950/40 border border-[#FDE047] dark:border-amber-700/50 rounded-2xl p-6 shadow-lg rotate-[1deg] hover:rotate-0 transition-transform duration-300 text-amber-950 dark:text-amber-100">
                {/* Tape Accent */}
                <div
                  className="absolute -top-3 left-8 w-20 h-5 bg-[#FDE047]/80 dark:bg-amber-700/60 rounded-xs shadow-xs border border-amber-300/60 rotate-[-2deg] pointer-events-none"
                  aria-hidden="true"
                />
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-amber-900/80 dark:text-amber-200 uppercase tracking-widest">
                    Household Activity Sealed
                  </span>
                  <div className="flex items-center gap-1 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Protected</span>
                  </div>
                </div>
                <p className="text-sm font-normal leading-relaxed italic mb-4">
                  “Communal memos, morning grocery drops, and fridge notes are only accessible to
                  verified flatmates. Sign in to view and post updates for Flat 4B.”
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-amber-200/80 dark:border-amber-800/60">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-200 dark:bg-amber-800/80 flex items-center justify-center text-xs text-amber-900 dark:text-amber-100">
                      <Home className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-amber-900 dark:text-amber-100">
                      Resident Noticeboard
                    </span>
                  </div>
                  <Pin className="w-4 h-4 text-amber-700 dark:text-amber-300" />
                </div>
              </div>

              {/* Whiteboard / Magnetic Quick Essentials Slate */}
              <div className="bg-card rounded-2xl p-6 shadow-xs border border-border flex flex-col gap-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Domestic Preview Locked
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Requires Sign-in
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-border/40">
                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                      <Wifi className="w-4 h-4 text-primary" />
                      <span className="font-medium text-foreground">Communal Wi-Fi & Password</span>
                    </div>
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-border/40">
                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="font-medium text-foreground">
                        Today's Cleaning & Chore Wheel
                      </span>
                    </div>
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-border/40">
                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                      <Receipt className="w-4 h-4 text-primary" />
                      <span className="font-medium text-foreground">Flat Expenses & Ledger</span>
                    </div>
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {/* Cozy Domestic Guarantee Card (No corporate SaaS pitch) */}
              <div className="p-5 rounded-2xl bg-surface-container-low border border-border/60 shadow-xs flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-foreground">
                    Gentle Domestic Agreement
                  </span>
                  <span className="text-[11px] text-muted-foreground leading-relaxed">
                    All household ledgers, rosters, and door logs are strictly private to confirmed
                    flatmates. No uninvited guests, no public feeds.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Footer */}
      <footer className="w-full bg-surface-container-low/60 border-t border-border py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Home className="w-3.5 h-3.5 text-primary" />
            <span>RoomMate • Built for smart households</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() =>
                toast.info('Flat Terms', {
                  description: 'Household rules established by flatmates.',
                })
              }
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Flat Terms
            </button>
            <button
              type="button"
              onClick={() =>
                toast.info('Privacy & Keys', { description: 'Encrypted domestic data privacy.' })
              }
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Privacy & Keys
            </button>
            <button
              type="button"
              onClick={() =>
                toast.info('Resident Help Desk', {
                  description: 'Need flat onboarding assistance?',
                })
              }
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Resident Help Desk
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
