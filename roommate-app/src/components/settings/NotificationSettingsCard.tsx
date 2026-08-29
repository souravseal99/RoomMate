import { Bell, CheckSquare, Receipt, Package, Clock } from 'lucide-react';
import type { NotificationSettings, DigestFrequency } from '@/hooks/useSettings';

type Props = {
  notifications: NotificationSettings;
  onUpdate: (partial: Partial<NotificationSettings>) => void;
};

export default function NotificationSettingsCard({
  notifications,
  onUpdate,
}: Props) {
  return (
    <section className="bg-card rounded-2xl border border-border p-5 sm:p-6 space-y-5 shadow-2xs">
      <div className="flex items-center gap-3 border-b border-border/60 pb-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-foreground">Notification Preferences</h3>
          <p className="text-xs text-muted-foreground">
            Control alert channels, push triggers, and roommate reminders
          </p>
        </div>
      </div>

      {/* Toggles List */}
      <div className="divide-y divide-border/60">
        {/* 1. Chore Due Alerts */}
        <div className="py-3 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-container text-foreground flex items-center justify-center shrink-0 mt-0.5">
              <CheckSquare className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-foreground">
                Chore Deadlines &amp; Reminders
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Receive notifications 24 hours and 2 hours prior to scheduled chores
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={notifications.choreDue}
            onChange={(e) => onUpdate({ choreDue: e.target.checked })}
            className="w-4 h-4 rounded accent-primary cursor-pointer shrink-0"
          />
        </div>

        {/* 2. Chore Assignment */}
        <div className="py-3 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-container text-foreground flex items-center justify-center shrink-0 mt-0.5">
              <CheckSquare className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-foreground">
                New Chore Assignments
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Alert when a flatmate assigns you a chore or completes a shared task
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={notifications.choreAssigned}
            onChange={(e) => onUpdate({ choreAssigned: e.target.checked })}
            className="w-4 h-4 rounded accent-primary cursor-pointer shrink-0"
          />
        </div>

        {/* 3. Expense Splits */}
        <div className="py-3 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-container text-foreground flex items-center justify-center shrink-0 mt-0.5">
              <Receipt className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-foreground">
                Expense Splits &amp; Settlements
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Instant notification when a roommate adds an expense or marks a debt as settled
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={notifications.expenseSplits}
            onChange={(e) => onUpdate({ expenseSplits: e.target.checked })}
            className="w-4 h-4 rounded accent-primary cursor-pointer shrink-0"
          />
        </div>

        {/* 4. Low Stock Pantry */}
        <div className="py-3 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-container text-foreground flex items-center justify-center shrink-0 mt-0.5">
              <Package className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-foreground">
                Low Pantry Stock Warnings
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Alerts when communal groceries or supplies drop below minimum stock threshold
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={notifications.lowStock}
            onChange={(e) => onUpdate({ lowStock: e.target.checked })}
            className="w-4 h-4 rounded accent-primary cursor-pointer shrink-0"
          />
        </div>
      </div>

      {/* Frequency Segmented Control */}
      <div className="pt-2">
        <label className="text-xs font-extrabold text-foreground flex items-center gap-1.5 mb-2">
          <Clock className="w-3.5 h-3.5 text-primary" />
          Digest Delivery Frequency
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'instant', label: 'Instant Alerts' },
            { id: 'daily', label: 'Daily Evening (8 PM)' },
            { id: 'muted', label: 'Muted' },
          ].map((freq) => {
            const isSelected = notifications.frequency === freq.id;
            return (
              <button
                key={freq.id}
                type="button"
                onClick={() => onUpdate({ frequency: freq.id as DigestFrequency })}
                className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-surface-container/40 text-foreground border-border hover:bg-surface-container'
                }`}
              >
                {freq.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
