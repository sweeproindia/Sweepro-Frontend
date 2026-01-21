import notificationAPI from '@/services/notificationService';
import type { NotificationsListResult, Notification } from './types';

export async function fetchNotifications(params: { limit: number }): Promise<NotificationsListResult> {
  const resp = await notificationAPI.getNotifications({ limit: params.limit });
  if (!resp.success) {
    throw new Error(resp.error || 'Failed to load notifications');
  }

  return {
    notifications: resp.data as Notification[],
    unreadCount: resp.unreadCount ?? (resp.data?.filter((n: any) => !n.read).length ?? 0)
  };
}

export async function fetchUnreadCount(): Promise<number> {
  return notificationAPI.getUnreadCount();
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await notificationAPI.markAsRead(notificationId);
}

export async function markAllNotificationsRead(): Promise<void> {
  await notificationAPI.markAllAsRead();
}

export async function deleteNotification(notificationId: string): Promise<void> {
  await notificationAPI.deleteNotification(notificationId);
}

export async function clearReadNotifications(): Promise<void> {
  await notificationAPI.clearReadNotifications();
}
