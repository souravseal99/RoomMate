import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { activityApi } from '@/api/activityApi';
import type { ActivityItem, ToggleReactionResponse } from '@/types/activityTypes';

export const activityKeys = {
  all: ['activities'] as const,
  feed: (householdId?: string, filter?: string) =>
    ['activities', householdId, filter || 'all'] as const,
};

export function useActivityFeedQuery(householdId?: string, filter = 'all') {
  return useQuery<ActivityItem[]>({
    queryKey: activityKeys.feed(householdId, filter),
    queryFn: async () => {
      if (!householdId) return [];
      return await activityApi.getActivities(householdId, filter);
    },
    enabled: Boolean(householdId),
    staleTime: 1000 * 20, // 20s
  });
}

export function useToggleReactionMutation(householdId?: string) {
  const queryClient = useQueryClient();

  return useMutation<ToggleReactionResponse, Error, { activityId: string; emoji: string }>({
    mutationFn: async ({ activityId, emoji }) => {
      if (!householdId) throw new Error('No active household');
      return await activityApi.toggleReaction(householdId, activityId, emoji);
    },
    onMutate: async ({ activityId, emoji }) => {
      if (!householdId) return;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: activityKeys.all });

      // Snapshot previous feed across all filters
      const previousData = queryClient.getQueriesData<ActivityItem[]>({
        queryKey: ['activities', householdId],
      });

      // Optimistically update
      queryClient.setQueriesData<ActivityItem[]>(
        { queryKey: ['activities', householdId] },
        (old = []) => {
          return old.map((item) => {
            if (item.id !== activityId) return item;

            const hadSame = item.userReactedEmoji === emoji;
            const hadDifferent = item.userReactedEmoji && item.userReactedEmoji !== emoji;

            let updatedTotal = item.totalReactionCount;
            let updatedUserReactedEmoji: string | null = emoji;
            let updatedUserReacted = true;

            const reactionsCopy = [...item.reactions];

            if (hadSame) {
              // Toggle off
              updatedTotal = Math.max(0, updatedTotal - 1);
              updatedUserReactedEmoji = null;
              updatedUserReacted = false;

              const existingIdx = reactionsCopy.findIndex((r) => r.emoji === emoji);
              if (existingIdx !== -1) {
                if (reactionsCopy[existingIdx].count <= 1) {
                  reactionsCopy.splice(existingIdx, 1);
                } else {
                  reactionsCopy[existingIdx] = {
                    ...reactionsCopy[existingIdx],
                    count: reactionsCopy[existingIdx].count - 1,
                  };
                }
              }
            } else if (hadDifferent) {
              // Replace emoji (count stays same)
              const oldEmoji = item.userReactedEmoji!;
              const oldIdx = reactionsCopy.findIndex((r) => r.emoji === oldEmoji);
              if (oldIdx !== -1) {
                if (reactionsCopy[oldIdx].count <= 1) {
                  reactionsCopy.splice(oldIdx, 1);
                } else {
                  reactionsCopy[oldIdx] = {
                    ...reactionsCopy[oldIdx],
                    count: reactionsCopy[oldIdx].count - 1,
                  };
                }
              }

              const newIdx = reactionsCopy.findIndex((r) => r.emoji === emoji);
              if (newIdx !== -1) {
                reactionsCopy[newIdx] = {
                  ...reactionsCopy[newIdx],
                  count: reactionsCopy[newIdx].count + 1,
                };
              } else {
                reactionsCopy.push({ emoji, count: 1 });
              }
            } else {
              // Brand new reaction
              updatedTotal += 1;
              const newIdx = reactionsCopy.findIndex((r) => r.emoji === emoji);
              if (newIdx !== -1) {
                reactionsCopy[newIdx] = {
                  ...reactionsCopy[newIdx],
                  count: reactionsCopy[newIdx].count + 1,
                };
              } else {
                reactionsCopy.push({ emoji, count: 1 });
              }
            }

            return {
              ...item,
              totalReactionCount: updatedTotal,
              userReacted: updatedUserReacted,
              userReactedEmoji: updatedUserReactedEmoji,
              dominantEmoji: updatedUserReactedEmoji || item.dominantEmoji || emoji,
              reactions: reactionsCopy,
            };
          });
        }
      );

      return { previousData };
    },
    onError: (_err, _vars, context: any) => {
      // Rollback
      if (context?.previousData) {
        for (const [queryKey, data] of context.previousData) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['activities', householdId],
      });
    },
  });
}
