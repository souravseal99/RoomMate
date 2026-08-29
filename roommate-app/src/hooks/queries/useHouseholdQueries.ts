import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import householdApi from '@/api/householdApi';
import householdMemberApi from '@/api/householdMemberApi';
import { eventBus } from '@/lib/eventBus';
import { APP_EVENTS } from '@/types/eventTypes';
import type { HouseholdMember, HouseholdResponse } from '@/types/householdTypes';

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
  });
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
