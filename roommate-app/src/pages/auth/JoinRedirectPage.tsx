import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function JoinRedirectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, ready } = useAuth();

  const code = (searchParams.get('code') || '').trim().toUpperCase();

  useEffect(() => {
    if (!ready) return;

    if (isAuthenticated) {
      if (code) {
        navigate(`/households?code=${encodeURIComponent(code)}&action=join`, { replace: true });
      } else {
        navigate('/households', { replace: true });
      }
    } else {
      if (code) {
        navigate(`/register?code=${encodeURIComponent(code)}`, { replace: true });
      } else {
        navigate('/register', { replace: true });
      }
    }
  }, [ready, isAuthenticated, code, navigate]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground p-4 select-none">
      <div className="flex flex-col items-center gap-3 bg-card p-6 rounded-2xl border border-border shadow-xs">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="font-bold text-sm font-display text-foreground">
          Connecting to your living space...
        </span>
        <span className="text-xs text-muted-foreground font-mono">
          {code ? `Passkey: ${code}` : 'Preparing space onboarding'}
        </span>
      </div>
    </div>
  );
}
