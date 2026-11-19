import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/utils';

interface AnimatedBrandSplashProps {
  isReady: boolean;
  onBypass?: () => void;
  className?: string;
}

export function AnimatedBrandSplash({ isReady, onBypass, className }: AnimatedBrandSplashProps) {
  const [elapsed, setElapsed] = useState(0);
  const [isExited, setIsExited] = useState(isReady);

  useEffect(() => {
    if (isReady) {
      // Allow 500ms exit transition before removing from DOM
      const timer = setTimeout(() => setIsExited(true), 520);
      return () => clearTimeout(timer);
    }

    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isReady]);

  if (isExited && isReady) {
    return null;
  }

  const isColdStart = elapsed >= 3;
  const showBypass = elapsed >= 12;

  return (
    <div
      aria-live="polite"
      aria-label="Server warm-up status"
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-background transition-all duration-500 ease-out select-none',
        isReady ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100',
        className
      )}
    >
      {/* 1. Ambient Living Terracotta Aura */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-primary/20 blur-3xl pointer-events-none animate-aura-pulse" />

      {/* 2. Central Animated Brand Card */}
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center">
        {/* Floating Logo Badge with Reflective Sheen Sweep */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-card/80 backdrop-blur-xl border border-border/70 shadow-2xl overflow-hidden animate-brand-breathe">
          {/* Luminous Light Sweep Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none animate-sheen-sweep" />

          {/* RoomMate Logo */}
          <img
            src="/branding/logo-full.png"
            alt="RoomMate"
            className="w-48 sm:w-56 h-auto object-contain drop-shadow-sm select-none"
            loading="eager"
          />
        </div>

        {/* 3. Indeterminate Bento Progress Track */}
        <div className="mt-8 flex flex-col items-center gap-3 w-full">
          <div className="h-1.5 w-48 sm:w-56 rounded-full bg-border/60 overflow-hidden relative shadow-inner">
            <div className="h-full w-1/2 bg-gradient-to-r from-primary via-amber-500 to-primary rounded-full animate-shimmer-slide" />
          </div>

          {/* Dynamic Warm-Up Status Messaging */}
          <div className="space-y-1 min-h-[50px] flex flex-col items-center justify-center px-4">
            {!isColdStart ? (
              <p className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5 animate-in fade-in duration-300">
                <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                Connecting to household hub...
              </p>
            ) : (
              <div className="space-y-1 animate-in fade-in slide-in-from-bottom-1 duration-300">
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  Waking up household servers...
                </p>
                <p className="text-[11px] text-muted-foreground leading-tight max-w-[280px]">
                  Free-tier instances take ~30s to boot. Thank you for your patience!
                </p>
              </div>
            )}
          </div>

          {/* 4. Optional Escape Hatch / Bypass Button */}
          {showBypass && onBypass && (
            <button
              type="button"
              onClick={onBypass}
              className="mt-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-surface-container cursor-pointer active:scale-95 animate-in fade-in"
            >
              <span>Continue to sign in anyway</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Footer Branding Note */}
      <div className="absolute bottom-6 text-[10px] text-muted-foreground tracking-widest uppercase font-semibold">
        Shared Living Hub · Since 2026
      </div>
    </div>
  );
}
