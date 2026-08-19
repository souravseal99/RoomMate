import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AuthFormInputData } from '@/types/authTypes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home, Mail, Lock, User, CheckCircle2, ShieldCheck } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
});

const loginSchema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
});

export function AuthForm({ mode, onSubmit }: Readonly<AuthFormInputData>) {
  const schema = mode === 'register' ? registerSchema : loginSchema;
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues:
      mode === 'register' ? { name: '', email: '', password: '' } : { email: '', password: '' },
  });

  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-background text-foreground font-sans relative">
      {/* Brand Header Callout */}
      <div className="absolute top-8 left-8 hidden lg:flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
          <Home className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">RoomMate</h2>
          <p className="text-xs text-muted-foreground">Shared Living System</p>
        </div>
      </div>

      {/* Feature Badges Callout */}
      <div className="absolute bottom-8 left-8 hidden lg:flex flex-col gap-3 max-w-xs">
        <div className="bg-card rounded-lg p-4 border border-border shadow-xs flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">Track expenses and split household bills seamlessly</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border shadow-xs flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-tertiary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">Manage chores and shared inventory in real-time</p>
        </div>
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Mobile Header */}
        <div className="mb-6 text-center lg:hidden">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground shadow-xs mb-2">
            <Home className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">RoomMate</h1>
          <p className="text-xs text-muted-foreground">Shared Living System</p>
        </div>

        <Card className="rounded-lg shadow-xs bg-card border border-border">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-center text-foreground">
              {mode === 'register' ? 'Create an Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-center text-xs text-muted-foreground">
              Enter your details below to {mode === 'register' ? 'get started' : 'sign in'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground">Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      {...form.register('name')}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary bg-background text-foreground transition-colors"
                      placeholder="Your full name"
                    />
                  </div>
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive font-medium mt-1">
                      {form.formState.errors.name?.message as string}
                    </p>
                  )}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    {...form.register('email')}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary bg-background text-foreground transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive font-medium mt-1">
                    {form.formState.errors.email?.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    {...form.register('password')}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary bg-background text-foreground transition-colors"
                    placeholder="••••••••"
                  />
                </div>
                {form.formState.errors.password && (
                  <p className="text-xs text-destructive font-medium mt-1">
                    {form.formState.errors.password?.message as string}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg py-2 transition-colors cursor-pointer">
                {mode === 'register' ? 'Create Account' : 'Sign In'}
              </Button>
            </form>
            <div className="mt-5 text-center text-xs text-muted-foreground">
              {mode === 'register' ? (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="font-semibold text-primary hover:underline cursor-pointer ml-1"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => navigate('/register')}
                    className="font-semibold text-primary hover:underline cursor-pointer ml-1"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

