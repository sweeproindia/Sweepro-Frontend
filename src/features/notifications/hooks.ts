import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsQueryKeys } from './queryKeys';
import {
  clearReadNotifications as clearReadNotificationsApi,
  deleteNotification as deleteNotificationApi,
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead
} from './api';
import type { NotificationsListResult } from './types';

function updateAllNotificationCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (prev: NotificationsListResult) => NotificationsListResult
) {
  const matches = queryClient.getQueriesData({ queryKey: notificationsQueryKeys.all });
  for (const [key, data] of matches) {
    const typed = data as NotificationsListResult | undefined;
    if (!typed) continue;
    queryClient.setQueryData(key, updater(typed));
  }
}

export function useNotificationsListQuery(params: { limit: number }) {
  return useQuery({
    queryKey: notificationsQueryKeys.list(params),
    queryFn: () => fetchNotifications(params),
    staleTime: 10_000,
    refetchOnWindowFocus: false
  });
}

export function useUnreadCountQuery() {
  return useQuery({
    queryKey: notificationsQueryKeys.unreadCount,
    queryFn: fetchUnreadCount,
    staleTime: 10_000,
    refetchOnWindowFocus: false
  });
}

export function useMarkAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: notificationsQueryKeys.all });
      await queryClient.cancelQueries({ queryKey: notificationsQueryKeys.unreadCount });

      const previousLists = queryClient.getQueriesData({ queryKey: notificationsQueryKeys.all });
      const previousUnread = queryClient.getQueryData<number>(notificationsQueryKeys.unreadCount);

      updateAllNotificationCaches(queryClient, (prev) => {
        const wasUnread = prev.notifications.some((n) => n.id === notificationId && !n.read);
        return {
          notifications: prev.notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true, readAt: new Date().toISOString() } : n
          ),
          unreadCount: Math.max(0, prev.unreadCount - (wasUnread ? 1 : 0))
        };
      });

      if (typeof previousUnread === 'number') {
        queryClient.setQueryData<number>(notificationsQueryKeys.unreadCount, (old) => Math.max(0, (old || 0) - 1));
      }

      return { previousLists, previousUnread };
    },
    onError: (_err, _notificationId, ctx) => {
      if (!ctx) return;
      for (const [key, data] of ctx.previousLists) {
        queryClient.setQueryData(key, data);
      }
      queryClient.setQueryData(notificationsQueryKeys.unreadCount, ctx.previousUnread);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.unreadCount });
    }
  });
}

export function useMarkAllAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationsQueryKeys.all });
      await queryClient.cancelQueries({ queryKey: notificationsQueryKeys.unreadCount });

      const previousLists = queryClient.getQueriesData({ queryKey: notificationsQueryKeys.all });
      const previousUnread = queryClient.getQueryData<number>(notificationsQueryKeys.unreadCount);

      updateAllNotificationCaches(queryClient, (prev) => ({
        notifications: prev.notifications.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() })),
        unreadCount: 0
      }));

      queryClient.setQueryData(notificationsQueryKeys.unreadCount, 0);

      return { previousLists, previousUnread };
    },
    onError: (_err, _vars, ctx) => {
      if (!ctx) return;
      for (const [key, data] of ctx.previousLists) {
        queryClient.setQueryData(key, data);
      }
      queryClient.setQueryData(notificationsQueryKeys.unreadCount, ctx.previousUnread);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.unreadCount });
    }
  });
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => deleteNotificationApi(notificationId),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: notificationsQueryKeys.all });

      const previousLists = queryClient.getQueriesData({ queryKey: notificationsQueryKeys.all });

      updateAllNotificationCaches(queryClient, (prev) => {
        const deleted = prev.notifications.find((n) => n.id === notificationId);
        const wasUnread = !!deleted && !deleted.read;
        return {
          notifications: prev.notifications.filter((n) => n.id !== notificationId),
          unreadCount: Math.max(0, prev.unreadCount - (wasUnread ? 1 : 0))
        };
      });

      return { previousLists };
    },
    onError: (_err, _vars, ctx) => {
      if (!ctx) return;
      for (const [key, data] of ctx.previousLists) {
        queryClient.setQueryData(key, data);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.unreadCount });
    }
  });
}

export function useClearReadNotificationsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => clearReadNotificationsApi(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationsQueryKeys.all });

      const previousLists = queryClient.getQueriesData({ queryKey: notificationsQueryKeys.all });

      updateAllNotificationCaches(queryClient, (prev) => ({
        notifications: prev.notifications.filter((n) => !n.read),
        unreadCount: prev.unreadCount
      }));

      return { previousLists };
    },
    onError: (_err, _vars, ctx) => {
      if (!ctx) return;
      for (const [key, data] of ctx.previousLists) {
        queryClient.setQueryData(key, data);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.all });
    }
  });
}
