import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Home } from 'lucide-react';
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
      // Allow 600ms graceful exit transition before unmounting
      const timer = setTimeout(() => setIsExited(true), 600);
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
        'fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-background transition-all duration-700 ease-out select-none overflow-hidden',
        isReady ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100',
        className
      )}
    >
      {/* 1. Ambient Concentric Hearth Glows */}
      <div className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-primary/20 blur-3xl pointer-events-none animate-hearth-radiance" />
      <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-secondary/15 blur-2xl pointer-events-none animate-hearth-radiance [animation-delay:1.8s]" />

      {/* 2. Free-Floating Organic Brand Stage (No Boxed Card) */}
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center">
        {/* Animated Concentric Pulse Rings radiating from beneath the emblem */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-primary/25 animate-hearth-ripple pointer-events-none" />
          <div className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-secondary/25 animate-hearth-ripple [animation-delay:1.2s] pointer-events-none" />

          {/* Organic Floating Logo Mark */}
          <div className="relative animate-brand-float-organic cursor-default select-none my-2">
            <img
              src="/branding/logo-mark.png"
              alt="RoomMate Emblem"
              className="w-24 sm:w-32 h-auto object-contain select-none"
              loading="eager"
            />
          </div>
        </div>

        {/* 3. RoomMate Brand Typography */}
        <div className="mt-5 space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-display">
              RoomMate
            </h1>
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
          </div>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
            Household Hub
          </p>
        </div>

        {/* 4. Fluid Progress & Interactive Status */}
        <div className="mt-8 flex flex-col items-center gap-3.5 w-full">
          {/* Slender Fluid Track */}
          <div className="h-1 w-44 sm:w-52 rounded-full bg-border/60 overflow-hidden relative shadow-xs">
            <div className="h-full w-1/3 bg-gradient-to-r from-primary via-amber-500 to-primary rounded-full animate-fluid-track" />
          </div>

          {/* Dynamic Living Status Pill */}
          <div className="min-h-[48px] flex flex-col items-center justify-center">
            {!isColdStart ? (
              <div className="px-3.5 py-1.5 rounded-full bg-surface-container-low border border-border/60 text-xs font-semibold text-foreground flex items-center gap-2 shadow-2xs animate-in fade-in duration-300">
                <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                <span>Connecting to household hub...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 animate-in fade-in slide-in-from-bottom-1 duration-300">
                <div className="px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-xs font-bold text-primary flex items-center gap-2 shadow-2xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  <span>Waking up household servers...</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight max-w-[270px] mt-0.5">
                  Free-tier instances take ~30s to boot • Thanks for your patience!
                </p>
              </div>
            )}
          </div>

          {/* 5. Optional Escape Hatch / Bypass Button */}
          {showBypass && onBypass && (
            <button
              type="button"
              onClick={onBypass}
              className="mt-1 text-xs font-semibold text-primary hover:text-primary/80 transition-all inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-surface-container border border-border/50 cursor-pointer active:scale-95 animate-in fade-in"
            >
              <span>Continue to sign in anyway</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Footer Branding Note */}
      <div className="absolute bottom-6 flex items-center gap-1.5 text-[10px] text-muted-foreground tracking-widest uppercase font-semibold">
        <Home className="w-3 h-3 text-primary/70" />
        <span>Shared Living · Since 2026</span>
      </div>
    </div>
  );
}
