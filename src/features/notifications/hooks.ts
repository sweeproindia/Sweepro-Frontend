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
    if (!typed || !typed.notifications) {
      console.warn('[updateAllNotificationCaches] Skipping invalid cache data:', { key, data });
      continue;
    }
    try {
      queryClient.setQueryData(key, updater(typed));
    } catch (error) {
      console.error('[updateAllNotificationCaches] Error updating cache:', error, { key, data });
    }
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
      console.log('[useMarkAsReadMutation] Marking notification as read:', notificationId);
      await queryClient.cancelQueries({ queryKey: notificationsQueryKeys.all });
      await queryClient.cancelQueries({ queryKey: notificationsQueryKeys.unreadCount });

      const previousLists = queryClient.getQueriesData({ queryKey: notificationsQueryKeys.all });
      const previousUnread = queryClient.getQueryData<number>(notificationsQueryKeys.unreadCount);

      updateAllNotificationCaches(queryClient, (prev) => {
        if (!prev || !prev.notifications) {
          console.warn('[useMarkAsReadMutation] Invalid prev data in updater:', prev);
          return prev || { notifications: [], unreadCount: 0 };
        }
        const wasUnread = prev.notifications.some((n) => n.id === notificationId && !n.read);
        console.log('[useMarkAsReadMutation] Was unread:', wasUnread);
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
    onError: (error, notificationId, ctx) => {
      console.error('[useMarkAsReadMutation] Error marking as read:', error, notificationId);
      if (!ctx) return;
      for (const [key, data] of ctx.previousLists) {
        queryClient.setQueryData(key, data);
      }
      queryClient.setQueryData(notificationsQueryKeys.unreadCount, ctx.previousUnread);
    },
    onSettled: () => {
      console.log('[useMarkAsReadMutation] Mutation settled, invalidating queries');
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
      console.log('[useDeleteNotificationMutation] Deleting notification:', notificationId);
      await queryClient.cancelQueries({ queryKey: notificationsQueryKeys.all });
      await queryClient.cancelQueries({ queryKey: notificationsQueryKeys.unreadCount });

      const previousLists = queryClient.getQueriesData({ queryKey: notificationsQueryKeys.all });
      const previousUnread = queryClient.getQueryData<number>(notificationsQueryKeys.unreadCount);

      console.log('[useDeleteNotificationMutation] Previous lists:', previousLists);

      // Find the deleted notification before updating cache
      let wasUnread = false;
      for (const [, data] of previousLists) {
        const typed = data as NotificationsListResult | undefined;
        console.log('[useDeleteNotificationMutation] Typed data:', typed);
        if (typed && typed.notifications && Array.isArray(typed.notifications)) {
          const deleted = typed.notifications.find((n) => n.id === notificationId);
          console.log('[useDeleteNotificationMutation] Deleted notification:', deleted);
          if (deleted && !deleted.read) {
            wasUnread = true;
            break;
          }
        }
      }

      console.log('[useDeleteNotificationMutation] Was unread:', wasUnread);

      updateAllNotificationCaches(queryClient, (prev) => {
        if (!prev || !prev.notifications) {
          console.warn('[useDeleteNotificationMutation] Invalid prev data in updater:', prev);
          return prev || { notifications: [], unreadCount: 0 };
        }
        return {
          notifications: prev.notifications.filter((n) => n.id !== notificationId),
          unreadCount: Math.max(0, prev.unreadCount - (wasUnread ? 1 : 0))
        };
      });

      // Update unread count query cache directly
      queryClient.setQueryData<number>(notificationsQueryKeys.unreadCount, (old) =>
        Math.max(0, (old || 0) - (wasUnread ? 1 : 0))
      );

      return { previousLists, previousUnread };
    },
    onError: (error, notificationId, ctx) => {
      console.error('[useDeleteNotificationMutation] Error:', error, notificationId);
      if (!ctx) return;
      for (const [key, data] of ctx.previousLists) {
        queryClient.setQueryData(key, data);
      }
      queryClient.setQueryData(notificationsQueryKeys.unreadCount, ctx.previousUnread);
    },
    onSettled: () => {
      console.log('[useDeleteNotificationMutation] Mutation settled');
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
      await queryClient.cancelQueries({ queryKey: notificationsQueryKeys.unreadCount });

      const previousLists = queryClient.getQueriesData({ queryKey: notificationsQueryKeys.all });
      const previousUnread = queryClient.getQueryData<number>(notificationsQueryKeys.unreadCount);

      updateAllNotificationCaches(queryClient, (prev) => ({
        notifications: prev.notifications.filter((n) => !n.read),
        unreadCount: prev.unreadCount
      }));

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
