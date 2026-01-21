export type NotificationPriority = 'high' | 'medium' | 'low';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: unknown;
  read: boolean;
  readAt?: string;
  delivered: boolean;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsListResult {
  notifications: Notification[];
  unreadCount: number;
}
