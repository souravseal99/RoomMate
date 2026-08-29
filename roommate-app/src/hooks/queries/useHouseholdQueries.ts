import { useState, useEffect, useMemo, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import householdApi from '@/api/householdApi';
import householdMemberApi from '@/api/householdMemberApi';
import { eventBus } from '@/lib/eventBus';
import { APP_EVENTS } from '@/types/eventTypes';
import type {
  HouseholdMember,
  HouseholdResponse,
  HouseholdOptions,
} from '@/types/householdTypes';
import { toast } from 'sonner';

const ACTIVE_HOUSEHOLD_STORAGE_KEY = 'roommate_active_household_id';

export const householdKeys = {
  all: ['households'] as const,
  members: (householdId?: string) => ['household-members', householdId] as const,
};

export function useHouseholdsQuery() {
  return useQuery<HouseholdResponse[]>({
    queryKey: householdKeys.all,
    queryFn: async () => {
      const records = await householdApi().fetchAll();
      return records || [];
    },
    staleTime: 1000 * 30, // 30s
  });
}

export function useHouseholdMembersQuery(householdId?: string) {
  return useQuery<HouseholdMember[]>({
    queryKey: householdKeys.members(householdId),
    queryFn: async () => {
      if (!householdId) return [];
      const members = await householdMemberApi().getAllHouseholdMembers(householdId);
      return members || [];
    },
    enabled: !!householdId,
    staleTime: 1000 * 30, // 30s
  });
}

export function useActiveHousehold() {
  const { data: households = [], isLoading, isError, refetch } = useHouseholdsQuery();

  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ACTIVE_HOUSEHOLD_STORAGE_KEY);
    }
    return null;
  });

  // Multi-tab sync on household switch
  useEffect(() => {
    const unsub = eventBus.subscribe((event) => {
      if (event.type === APP_EVENTS.HOUSEHOLD_SWITCHED && event.payload?.householdId) {
        setSelectedId(event.payload.householdId);
        localStorage.setItem(ACTIVE_HOUSEHOLD_STORAGE_KEY, event.payload.householdId);
      }
    });
    return () => unsub();
  }, []);

  // Ensure selectedId is valid if households change
  useEffect(() => {
    if (households.length === 0) {
      setSelectedId(null);
      localStorage.removeItem(ACTIVE_HOUSEHOLD_STORAGE_KEY);
      return;
    }
    const exists = households.some((h) => h.householdId === selectedId);
    if (!selectedId || !exists) {
      const defaultId = households[0].householdId;
      setSelectedId(defaultId);
      localStorage.setItem(ACTIVE_HOUSEHOLD_STORAGE_KEY, defaultId);
    }
  }, [households, selectedId]);

  const activeHousehold = useMemo(() => {
    if (households.length === 0) return null;
    return households.find((h) => h.householdId === selectedId) || households[0] || null;
  }, [households, selectedId]);

  const selectedHousehold: HouseholdOptions | null = useMemo(() => {
    if (!activeHousehold) return null;
    return {
      key: activeHousehold.householdId,
      value: activeHousehold.name,
      memberCount: activeHousehold.members?.length || 0,
    };
  }, [activeHousehold]);

  const { data: fetchedMembers = [] } = useHouseholdMembersQuery(activeHousehold?.householdId);

  const householdMembers = useMemo(() => {
    return fetchedMembers.length > 0 ? fetchedMembers : activeHousehold?.members || [];
  }, [fetchedMembers, activeHousehold]);

  const switchActiveHousehold = useCallback(
    (householdId: string) => {
      const target = households.find((h) => h.householdId === householdId);
      if (!target) return;
      setSelectedId(householdId);
      localStorage.setItem(ACTIVE_HOUSEHOLD_STORAGE_KEY, householdId);
      eventBus.publish({
        type: APP_EVENTS.HOUSEHOLD_SWITCHED,
        payload: { householdId },
      });
      toast.success(`Switched workspace to ${target.name}`);
    },
    [households]
  );

  const hasActiveHousehold = households.length > 0 && !!activeHousehold;

  return {
    households,
    activeHousehold,
    selectedHousehold,
    householdMembers,
    hasActiveHousehold,
    isLoading,
    isError,
    refetch,
    switchActiveHousehold,
    setHouseholds: () => {},
    setHouseholdMembers: () => {},
    setSelectedHousehold: (opt: any) => {
      const id = typeof opt === 'string' ? opt : opt?.key;
      if (id) switchActiveHousehold(id);
    },
    fetchAllHouseholds: refetch,
  };
}

export function useCreateHouseholdMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name: string }) => {
      const res = await householdApi().create(payload);
      return res.data;
    },
    onSuccess: (data) => {
      const createdHousehold = data?.data?.household;
      queryClient.invalidateQueries({ queryKey: householdKeys.all });
      if (createdHousehold?.householdId) {
        localStorage.setItem(ACTIVE_HOUSEHOLD_STORAGE_KEY, createdHousehold.householdId);
      }
      eventBus.publish({
        type: APP_EVENTS.HOUSEHOLD_MUTATED,
        payload: { householdId: createdHousehold?.householdId },
      });
    },
  });
}

export function useJoinHouseholdMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteCode: string) => {
      const res = await householdApi().join(inviteCode);
      return res.data;
    },
    onSuccess: (data) => {
      const joinedHousehold = data?.data?.household;
      queryClient.invalidateQueries({ queryKey: householdKeys.all });
      if (joinedHousehold?.householdId) {
        localStorage.setItem(ACTIVE_HOUSEHOLD_STORAGE_KEY, joinedHousehold.householdId);
      }
      eventBus.publish({
        type: APP_EVENTS.HOUSEHOLD_MUTATED,
        payload: { householdId: joinedHousehold?.householdId },
      });
    },
  });
}

export function useUpdateHouseholdMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ householdId, name }: { householdId: string; name: string }) => {
      const res = await householdApi().update(householdId, { name });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: householdKeys.all });
      eventBus.publish({
        type: APP_EVENTS.HOUSEHOLD_MUTATED,
        payload: { householdId: variables.householdId },
      });
    },
  });
}

export function useLeaveHouseholdMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (householdId: string) => {
      const res = await householdMemberApi().leaveHousehold(householdId);
      return res.data;
    },
    onSuccess: (_, householdId) => {
      queryClient.invalidateQueries({ queryKey: householdKeys.all });
      queryClient.invalidateQueries({ queryKey: householdKeys.members(householdId) });
      eventBus.publish({
        type: APP_EVENTS.HOUSEHOLD_MUTATED,
        payload: { householdId },
      });
    },
  });
}

export function useDeleteHouseholdMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (householdId: string) => {
      const res = await householdApi().deleteCascated(householdId);
      return res.data;
    },
    onSuccess: (_, householdId) => {
      queryClient.invalidateQueries({ queryKey: householdKeys.all });
      queryClient.invalidateQueries({ queryKey: householdKeys.members(householdId) });
      eventBus.publish({
        type: APP_EVENTS.HOUSEHOLD_MUTATED,
        payload: { householdId },
      });
    },
  });
}
