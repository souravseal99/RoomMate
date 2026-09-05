import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type {
  HouseholdMember,
  HouseholdOptions,
  HouseholdResponse,
} from '@/types/householdTypes';
import { useHouseholdsQuery, useHouseholdMembersQuery } from '@/hooks/queries/useHouseholdQueries';
import { useToast } from '@/hooks/use-toast';
import { eventBus } from '@/lib/eventBus';
import { APP_EVENTS } from '@/types/eventTypes';

const ACTIVE_HOUSEHOLD_STORAGE_KEY = 'roommate_active_household_id';

export type HouseholdContextType = {
export type HouseholdContextType = {
  households: HouseholdResponse[];
  setHouseholds: (households: HouseholdResponse[]) => void;
  fetchAllHouseholds: () => void;
  selectedHousehold: HouseholdOptions | null;
  setSelectedHousehold: (selectedOption: HouseholdOptions | string | null) => void;
  activeHousehold: HouseholdResponse | null;
  hasActiveHousehold: boolean;
  switchActiveHousehold: (householdId: string) => void;
  householdMembers: HouseholdMember[];
  setHouseholdMembers: (members: HouseholdMember[]) => void;
  isLoading: boolean;
  isError: boolean;
};

export const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);

export default function HouseholdProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { data: households = [], isLoading, isError, refetch } = useHouseholdsQuery();
  const { toast } = useToast();

  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ACTIVE_HOUSEHOLD_STORAGE_KEY);
    }
    return null;
  });

  const [legacyMembers, setLegacyMembers] = useState<HouseholdMember[]>([]);

  // Sync selected household when households list loads or changes
  useEffect(() => {
    if (households.length === 0) {
      setSelectedHouseholdId(null);
      localStorage.removeItem(ACTIVE_HOUSEHOLD_STORAGE_KEY);
      return;
    }

    const exists = households.some((h) => h.householdId === selectedHouseholdId);
    if (!selectedHouseholdId || !exists) {
      const defaultId = households[0].householdId;
      setSelectedHouseholdId(defaultId);
      localStorage.setItem(ACTIVE_HOUSEHOLD_STORAGE_KEY, defaultId);
    }
  }, [households, selectedHouseholdId]);

  const activeHousehold = useMemo(() => {
    if (!selectedHouseholdId) return households[0] || null;
    return households.find((h) => h.householdId === selectedHouseholdId) || households[0] || null;
  }, [households, selectedHouseholdId]);

  const hasActiveHousehold = households.length > 0 && !!activeHousehold;

  const selectedHousehold: HouseholdOptions | null = useMemo(() => {
    if (!activeHousehold) return null;
    return {
      key: activeHousehold.householdId,
      value: activeHousehold.name,
      memberCount: activeHousehold.members?.length || 0,
    };
  }, [activeHousehold]);

  // Fetch live members for active household
  const { data: fetchedMembers = [] } = useHouseholdMembersQuery(activeHousehold?.householdId);

  const householdMembers = useMemo(() => {
    return fetchedMembers.length > 0 ? fetchedMembers : activeHousehold?.members || legacyMembers;
  }, [fetchedMembers, activeHousehold, legacyMembers]);

  const setSelectedHousehold = useCallback(
    (option: HouseholdOptions | string | null) => {
      if (!option) {
        setSelectedHouseholdId(null);
        localStorage.removeItem(ACTIVE_HOUSEHOLD_STORAGE_KEY);
        return;
      }
      const id = typeof option === 'string' ? option : option.key;
      setSelectedHouseholdId(id);
      localStorage.setItem(ACTIVE_HOUSEHOLD_STORAGE_KEY, id);
    },
    []
  );

  const switchActiveHousehold = useCallback(
    (householdId: string) => {
      const target = households.find((h) => h.householdId === householdId);
      if (!target) return;

      setSelectedHouseholdId(householdId);
      localStorage.setItem(ACTIVE_HOUSEHOLD_STORAGE_KEY, householdId);
      eventBus.publish({ type: APP_EVENTS.HOUSEHOLD_SWITCHED, payload: { householdId } });
      toast({
        title: 'Household Switched',
        description: `Active space is now "${target.name}".`,
      });
    },
    [households, toast]
  );

  const fetchAllHouseholds = useCallback(() => {
    refetch();
  }, [refetch]);

  const setHouseholds = useCallback((_newHouseholds: HouseholdResponse[]) => {
    // Managed reactively by TanStack query; no-op or trigger refetch
    refetch();
  }, [refetch]);

  const providerValues = useMemo(
    () => ({
      households,
      setHouseholds,
      fetchAllHouseholds,
      selectedHousehold,
      setSelectedHousehold,
      activeHousehold,
      hasActiveHousehold,
      switchActiveHousehold,
      householdMembers,
      setHouseholdMembers: setLegacyMembers,
      setHouseholdMembers: setLegacyMembers,
      isLoading,
      isError,
      isError,
    }),
    [
      households,
      setHouseholds,
      fetchAllHouseholds,
      selectedHousehold,
      setSelectedHousehold,
      activeHousehold,
      hasActiveHousehold,
      switchActiveHousehold,
      householdMembers,
      isLoading,
      isError,
    ]
  );

  return (
    <HouseholdContext.Provider value={providerValues}>
      <HouseholdContext.Provider value={providerValues}>
        {children}
      </HouseholdContext.Provider>
      );
}
