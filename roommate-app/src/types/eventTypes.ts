export const APP_EVENTS = {
  HOUSEHOLD_MUTATED: 'HOUSEHOLD_MUTATED',
  HOUSEHOLD_SWITCHED: 'HOUSEHOLD_SWITCHED',
  ROSTER_UPDATED: 'ROSTER_UPDATED',
  EXPENSE_MUTATED: 'EXPENSE_MUTATED',
  SETTLEMENT_RECORDED: 'SETTLEMENT_RECORDED',
} as const;

export type AppEventType = (typeof APP_EVENTS)[keyof typeof APP_EVENTS];

export type AppEvent =
  | { type: typeof APP_EVENTS.HOUSEHOLD_MUTATED; payload?: { householdId?: string } }
  | { type: typeof APP_EVENTS.HOUSEHOLD_SWITCHED; payload: { householdId: string } }
  | { type: typeof APP_EVENTS.ROSTER_UPDATED; payload: { householdId: string } }
  | { type: typeof APP_EVENTS.EXPENSE_MUTATED; payload?: { householdId?: string } }
  | { type: typeof APP_EVENTS.SETTLEMENT_RECORDED; payload?: { householdId?: string } };

export type AppEventHandler = (event: AppEvent) => void;
