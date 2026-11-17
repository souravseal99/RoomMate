// src/features/auth/RegisterPage.tsx
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthForm } from '../../components/auth/AuthForm';
import { registerUser } from '../../api/authApi';
import useAuth from '@/hooks/useAuth';
import TokenStore from '@/lib/TokenStore';
import { AUTH_MODE_REGISTER } from '@/schemas/authSchemas';
import { useEffect, useState } from 'react';
import { pingHealth } from '@/api/healthApi';
import { toast } from 'sonner';

export default function RegisterPage() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [isHealthChecking, setIsHealthChecking] = useState(true);

  const inviteCode = (searchParams.get('code') || '').trim().toUpperCase();

  const onSubmit = async (values: any) => {
    try {
      // Ensure session ID exists before register
      TokenStore.getSessionId();
      const res = await registerUser(values);
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
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Registration failed. Please try again.');
    }
  };

  useEffect(() => {
    let isMounted = true;
    pingHealth().finally(() => {
      if (isMounted) {
        setIsHealthChecking(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return <AuthForm mode={AUTH_MODE_REGISTER} onSubmit={onSubmit} isLoading={isHealthChecking} />;
}
