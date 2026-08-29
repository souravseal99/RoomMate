export type AppEvent =
  | { type: 'HOUSEHOLD_MUTATED'; payload?: { householdId?: string } }
  | { type: 'HOUSEHOLD_SWITCHED'; payload: { householdId: string } }
  | { type: 'ROSTER_UPDATED'; payload: { householdId: string } };

export type AppEventHandler = (event: AppEvent) => void;
