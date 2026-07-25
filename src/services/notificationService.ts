/**
 * Notification API Service
 * Handles REST API calls for notifications
 */

import { apiRequest, HttpMethod } from './api';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  readAt?: string;
  delivered: boolean;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount?: number;
  error?: string;
}

export interface UnreadCountResponse {
  success: boolean;
  unreadCount: number;
}

class NotificationAPIService {
  /**
   * Get all notifications with pagination and filters
   */
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    read?: boolean;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<NotificationResponse> {
    try {
      // Build query string from params
      const qs = params
        ? '?' + new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        ).toString()
        : '';

      const response = await apiRequest<any>(
        `/notifications${qs}`,
        { method: HttpMethod.GET, requiresAuth: true }
      );
      // Backend returns NotificationResponse structure directly
      return response as NotificationResponse;
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notifications
   */
  async getUnreadNotifications(): Promise<NotificationResponse> {
    try {
      const response = await apiRequest<NotificationResponse>(
        '/notifications/unread',
        { method: HttpMethod.GET, requiresAuth: true }
      );
      return response.data as NotificationResponse;
    } catch (error: any) {
      console.error('Failed to fetch unread notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiRequest<UnreadCountResponse>(
        '/notifications/unread/count',
        { method: HttpMethod.GET, requiresAuth: true }
      );
      // Handle both response formats: direct or wrapped in data
      const data = (response as any).data || response;
      return data?.unreadCount || 0;
    } catch (error: any) {
      console.error('Failed to fetch unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await apiRequest(
        `/notifications/${notificationId}/read`,
        { method: HttpMethod.PATCH, requiresAuth: true }
      );
    } catch (error: any) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(notificationIds: string[]): Promise<void> {
    try {
      await apiRequest(
        '/notifications/read-multiple',
        { method: HttpMethod.PATCH, body: { notificationIds }, requiresAuth: true }
      );
    } catch (error: any) {
      console.error('Failed to mark notifications as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      await apiRequest(
        '/notifications/read-all',
        { method: HttpMethod.PATCH, requiresAuth: true }
      );
    } catch (error: any) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await apiRequest(
        `/notifications/${notificationId}`,
        { method: HttpMethod.DELETE, requiresAuth: true }
      );
    } catch (error: any) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }

  /**
   * Delete multiple notifications
   */
  async deleteMultipleNotifications(notificationIds: string[]): Promise<void> {
    try {
      await apiRequest(
        '/notifications/bulk/delete',
        { method: HttpMethod.DELETE, body: { notificationIds }, requiresAuth: true }
      );
    } catch (error: any) {
      console.error('Failed to delete notifications:', error);
      throw error;
    }
  }

  /**
   * Clear all read notifications
   */
  async clearReadNotifications(): Promise<void> {
    try {
      await apiRequest(
        '/notifications/bulk/clear-read',
        { method: HttpMethod.DELETE, requiresAuth: true }
      );
    } catch (error: any) {
      console.error('Failed to clear read notifications:', error);
      throw error;
    }
  }

  /**
   * Get notification types
   */
  async getNotificationTypes(): Promise<any[]> {
    try {
      const response = await apiRequest<{ data: any[] }>(
        '/notifications/types',
        { method: HttpMethod.GET, requiresAuth: true }
      );
      return (response.data as any)?.data || [];
    } catch (error: any) {
      console.error('Failed to fetch notification types:', error);
      return [];
    }
  }
}

export const notificationAPI = new NotificationAPIService();
export default notificationAPI;
