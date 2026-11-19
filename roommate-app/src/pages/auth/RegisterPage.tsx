// src/features/auth/RegisterPage.tsx
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthForm } from '../../components/auth/AuthForm';
import { registerUser } from '../../api/authApi';
import useAuth from '@/hooks/useAuth';
import TokenStore from '@/lib/TokenStore';
import { AUTH_MODE_REGISTER } from '@/schemas/authSchemas';
import type { RegisterPayload, LoginPayload } from '@/types/authTypes';
import { useEffect, useState } from 'react';
import { pingHealth } from '@/api/healthApi';
import { AnimatedBrandSplash } from '@/components/common/AnimatedBrandSplash';
import { toast } from 'sonner';
import { cn } from '@/utils/utils';

export default function RegisterPage() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [isServerReady, setIsServerReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inviteCode = (searchParams.get('code') || '').trim().toUpperCase();

  const onSubmit = async (values: RegisterPayload | LoginPayload) => {
    setIsSubmitting(true);
    try {
      // Ensure session ID exists before register
      TokenStore.getSessionId();
      const res = await registerUser(values as RegisterPayload);
      const authData = res?.data?.data ?? res?.data;
      const token = authData?.accessToken;
      if (token) {
        login(token, authData?.email ?? null, authData?.name ?? null);
        if (inviteCode) {
          nav(`/households?code=${encodeURIComponent(inviteCode)}&action=join`);
        } else {
          nav('/dashboard');
        }
      }
    } catch (e: unknown) {
      const errorMsg =
        e && typeof e === 'object' && 'response' in e
          ? ((e as { response?: { data?: { message?: string } } }).response?.data?.message ??
            'Registration failed. Please try again.')
          : 'Registration failed. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <AuthForm mode={AUTH_MODE_REGISTER} onSubmit={onSubmit} isLoading={isSubmitting} />
      </div>
    </>
  );
}
