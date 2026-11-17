import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProfile,
  updateProfile,
  changePassword,
  getSessions,
  revokeSession,
  revokeOtherSessions,
  deleteAccount,
  type UserProfileResponse,
  type UserSession,
} from '@/api/userApi';
import { toast } from 'sonner';
import eventBus from '@/lib/eventBus';
import { APP_EVENTS } from '@/types/eventTypes';
import TokenStore from '@/lib/TokenStore';

export const profileKeys = {
  all: ['user'] as const,
  profile: () => [...profileKeys.all, 'profile'] as const,
  sessions: () => [...profileKeys.all, 'sessions'] as const,
};

export function useProfileQuery() {
  return useQuery<UserProfileResponse>({
    queryKey: profileKeys.profile(),
    queryFn: getProfile,
    staleTime: 60 * 1000,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.profile(), data);
      queryClient.invalidateQueries({ queryKey: profileKeys.profile() });

      // Update TokenStore info if current user changed name
      TokenStore.setAuthInfo({ name: data.name });

      eventBus.publish({
        type: APP_EVENTS.USER_PROFILE_UPDATED,
        payload: { name: data.name },
      });

      toast.success('Profile updated successfully! ✨');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully. 🔒');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    },
  });
}

export function useSessionsQuery() {
  return useQuery<UserSession[]>({
    queryKey: profileKeys.sessions(),
    queryFn: getSessions,
  });
}

export function useRevokeSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.sessions() });
      toast.success('Device session signed out');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to revoke session');
    },
  });
}

export function useRevokeOtherSessionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeOtherSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.sessions() });
      toast.success('All other sessions signed out');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to revoke sessions');
    },
  });
}

export function useDeleteAccountMutation() {
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      TokenStore.setToken(null);
      window.location.href = '/login';
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete account');
    },
  });
}
