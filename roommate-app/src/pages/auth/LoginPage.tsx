// src/features/auth/LoginPage.tsx
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '../../components/auth/AuthForm';
import { loginUser } from '../../api/authApi';
import useAuth from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import TokenStore from '@/lib/TokenStore';
import { AUTH_MODE_LOGIN } from '@/schemas/authSchemas';
import { pingHealth } from '@/api/healthApi';

export default function LoginPage() {
  const nav = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [isHealthChecking, setIsHealthChecking] = useState(true);

  const onSubmit = async (values: any) => {
    try {
      // Ensure session ID exists before login
      TokenStore.getSessionId();
      const res = await loginUser(values);

      const token = res.data?.accessToken;
      console.log('Login response:', token, '\nisAuthenticated: ', isAuthenticated);
      if (token) {
        login(token, res.data?.email ?? null, res.data?.name ?? null);
      }
    } catch (e: any) {
      console.error('Login failed: ', e);
      alert(e.response?.data?.message ?? 'Login failed');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      nav('/dashboard');
    }
  }, [isAuthenticated, nav]);

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

  return <AuthForm mode={AUTH_MODE_LOGIN} onSubmit={onSubmit} isLoading={isHealthChecking} />;
}
