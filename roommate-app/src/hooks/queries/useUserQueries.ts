import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userApi, { type UserProfile } from '@/api/userApi';
import { eventBus } from '@/lib/eventBus';
import { APP_EVENTS } from '@/types/eventTypes';
import { toast } from 'sonner';

export const userKeys = {
  all: ['user'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
};

export function useUserProfileQuery() {
  return useQuery<UserProfile>({
    queryKey: userKeys.profile(),
    queryFn: async () => {
      return await userApi().getProfile();
    },
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name?: string }) => {
      return await userApi().updateProfile(payload);
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(userKeys.profile(), updatedUser);
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
      eventBus.publish({
        type: APP_EVENTS.USER_PROFILE_UPDATED,
        payload: { user: updatedUser },
      });
      toast.success('Profile updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    },
  });
}
