// src/features/auth/RegisterPage.tsx
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '../../components/auth/AuthForm';
import { registerUser } from '../../api/authApi';
import useAuth from '@/hooks/useAuth';
import TokenStore from '@/lib/TokenStore';
import { AUTH_MODE_REGISTER } from '@/schemas/authSchemas';
import { useEffect, useState } from 'react';
import { pingHealth } from '@/api/healthApi';

export default function RegisterPage() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [isHealthChecking, setIsHealthChecking] = useState(true);

  const onSubmit = async (values: any) => {
    try {
      // Ensure session ID exists before register
      TokenStore.getSessionId();
      const res = await registerUser(values);
      const token = res.data?.accessToken;
      if (token) {
        login(token, res.data?.email ?? null, res.data?.name ?? null);
        nav('/dashboard');
      }
    } catch (e: any) {
      alert(e.response?.data?.message ?? 'Registration failed');
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
