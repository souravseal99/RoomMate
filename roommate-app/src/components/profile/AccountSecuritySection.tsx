import { Lock, Smartphone, Bell, ChevronRight } from 'lucide-react';

type Props = {
  onChangePassword: () => void;
  onOpenSessions: () => void;
  onOpenNotifications: () => void;
};

export default function AccountSecuritySection({
  onChangePassword,
  onOpenSessions,
  onOpenNotifications,
}: Props) {
  return (
    <section className="max-w-2xl mx-auto w-full space-y-3">
      <h3 className="text-sm sm:text-base font-extrabold text-foreground border-b border-border/60 pb-2">
        Account &amp; Security
      </h3>

      <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border/60 shadow-2xs">
        {/* 1. Change Password */}
        <button
          type="button"
          onClick={onChangePassword}
          className="w-full flex items-center justify-between p-4 hover:bg-surface-container/50 transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface-container text-foreground flex items-center justify-center group-hover:text-primary transition-colors">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Change Password</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Update your login credentials and security keys
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* 2. Active Sessions */}
        <button
          type="button"
          onClick={onOpenSessions}
          className="w-full flex items-center justify-between p-4 hover:bg-surface-container/50 transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface-container text-foreground flex items-center justify-center group-hover:text-primary transition-colors">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Active Sessions</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage devices and browsers logged into your account
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* 3. Notification Settings */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="w-full flex items-center justify-between p-4 hover:bg-surface-container/50 transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface-container text-foreground flex items-center justify-center group-hover:text-primary transition-colors">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Notification Preferences</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Chore reminders, expense alerts, and stock digests
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>
    </section>
  );
}
