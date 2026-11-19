// src/features/auth/LoginPage.tsx
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthForm } from '../../components/auth/AuthForm';
import { loginUser } from '../../api/authApi';
import useAuth from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import TokenStore from '@/lib/TokenStore';
import { AUTH_MODE_LOGIN } from '@/schemas/authSchemas';
import type { LoginPayload, RegisterPayload } from '@/types/authTypes';
import { pingHealth } from '@/api/healthApi';
import { AnimatedBrandSplash } from '@/components/common/AnimatedBrandSplash';
import { toast } from 'sonner';
import { cn } from '@/utils/utils';

export default function LoginPage() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  const [isServerReady, setIsServerReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inviteCode = (searchParams.get('code') || '').trim().toUpperCase();
  const returnUrl = searchParams.get('returnUrl');

  const onSubmit = async (values: LoginPayload | RegisterPayload) => {
    setIsSubmitting(true);
    try {
      // Ensure session ID exists before login
      TokenStore.getSessionId();
      const res = await loginUser(values as LoginPayload);

      const authData = res?.data?.data ?? res?.data;
      const token = authData?.accessToken;
      if (token) {
        login(token, authData?.email ?? null, authData?.name ?? null);
      }
    } catch (e: unknown) {
      console.error('Login failed: ', e);
      const errorMsg =
        e && typeof e === 'object' && 'response' in e
          ? ((e as { response?: { data?: { message?: string } } }).response?.data?.message ??
            'Login failed. Please check your credentials.')
          : 'Login failed. Please check your credentials.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (inviteCode) {
        nav(`/households?code=${encodeURIComponent(inviteCode)}&action=join`);
      } else if (returnUrl) {
        nav(returnUrl);
      } else {
        nav('/dashboard');
      }
    }
  }, [isAuthenticated, inviteCode, returnUrl, nav]);

  useEffect(() => {
    let isMounted = true;
    pingHealth().finally(() => {
      if (isMounted) {
        setIsServerReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <AnimatedBrandSplash isReady={isServerReady} onBypass={() => setIsServerReady(true)} />
      <div
        className={cn(
          'transition-all duration-500 ease-out',
          isServerReady
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-2 pointer-events-none'
        )}
      >
        <AuthForm mode={AUTH_MODE_LOGIN} onSubmit={onSubmit} isLoading={isSubmitting} />
      </div>
    </>
  );
}
