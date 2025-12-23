/**
 * Notification API Service
 * Handles REST API calls for notifications
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.DEV ? '/api' : 'https://sweep-pro-backend-testing.onrender.com/api';

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
  private getAuthHeader() {
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return { headers };
  }

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
      const response = await axios.get(
        `${API_BASE_URL}/notifications`,
        {
          ...this.getAuthHeader(),
          params,
        }
      );
      return response.data;
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
      const response = await axios.get(
        `${API_BASE_URL}/notifications/unread`,
        this.getAuthHeader()
      );
      return response.data;
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
      const response = await axios.get<UnreadCountResponse>(
        `${API_BASE_URL}/notifications/unread/count`,
        this.getAuthHeader()
      );
      return response.data.unreadCount;
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
      await axios.patch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {},
        this.getAuthHeader()
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
      await axios.patch(
        `${API_BASE_URL}/notifications/read-multiple`,
        { notificationIds },
        this.getAuthHeader()
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
      await axios.patch(
        `${API_BASE_URL}/notifications/read-all`,
        {},
        this.getAuthHeader()
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
      await axios.delete(
        `${API_BASE_URL}/notifications/${notificationId}`,
        this.getAuthHeader()
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
      await axios.delete(
        `${API_BASE_URL}/notifications/bulk/delete`,
        {
          ...this.getAuthHeader(),
          data: { notificationIds },
        }
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
      await axios.delete(
        `${API_BASE_URL}/notifications/bulk/clear-read`,
        this.getAuthHeader()
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
      const response = await axios.get(
        `${API_BASE_URL}/notifications/types`,
        this.getAuthHeader()
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to fetch notification types:', error);
      return [];
    }
  }
}

export const notificationAPI = new NotificationAPIService();
export default notificationAPI;
