/**
 * Notification Context
 * Provides global notification state and WebSocket integration
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { websocketService } from '../services/websocketService';
import { notificationAPI, Notification } from '../services/notificationService';
import { toast } from 'sonner';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearReadNotifications: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * Fetch notifications from API
   */
  const hasAuthToken = useCallback(() => {
    const token = localStorage.getItem('authToken');
    return typeof token === 'string' && token.length > 0;
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!hasAuthToken()) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      const response = await notificationAPI.getNotifications({ limit: 50 });
      if (response.success) {
        setNotifications(response.data);
        if (response.unreadCount !== undefined) {
          setUnreadCount(response.unreadCount);
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [hasAuthToken]);

  /**
   * Refresh unread count
   */
  const refreshUnreadCount = useCallback(async () => {
    if (!hasAuthToken()) {
      setUnreadCount(0);
      return;
    }

    try {
      const count = await notificationAPI.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to refresh unread count:', error);
    }
  }, [hasAuthToken]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, read: true, readAt: new Date().toISOString() }
            : notif
        )
      );
      
      // Decrease unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationAPI.markAllAsRead();
      
      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true, readAt: new Date().toISOString() }))
      );
      
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read');
    }
  }, []);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      
      // Update local state
      const deletedNotif = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      // Decrease unread count if notification was unread
      if (deletedNotif && !deletedNotif.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  }, [notifications]);

  /**
   * Clear all read notifications
   */
  const clearReadNotifications = useCallback(async () => {
    try {
      await notificationAPI.clearReadNotifications();
      
      // Update local state - keep only unread
      setNotifications(prev => prev.filter(notif => !notif.read));
      
      toast.success('Read notifications cleared');
    } catch (error) {
      console.error('Failed to clear read notifications:', error);
      toast.error('Failed to clear read notifications');
    }
  }, []);

  /**
   * Handle incoming WebSocket notification
   */
  const handleNewNotification = useCallback((notification: Notification) => {
    // Add to notifications list
    setNotifications(prev => [notification, ...prev]);
    
    // Increment unread count
    setUnreadCount(prev => prev + 1);
    
    // Show toast notification
    toast.info(notification.title, {
      description: notification.message,
      duration: 5000,
    });
    
    // Play notification sound (optional)
    playNotificationSound();
  }, []);

  /**
   * Play notification sound
   */
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Could not play sound:', err));
    } catch (error) {
      // Ignore sound errors
    }
  };

  /**
   * Initialize WebSocket connection
   */
  useEffect(() => {
    if (!hasAuthToken()) {
      console.log('No token found, skipping WebSocket connection');
      return;
    }

    // Connect to WebSocket
    const token = localStorage.getItem('authToken');
    if (token) {
      websocketService.connect(token);
    }

    // Subscribe to connection events
    const unsubscribeConnect = websocketService.onConnect(() => {
      console.log('✅ Connected to notification service');
      setIsConnected(true);
      fetchNotifications();
      refreshUnreadCount();
    });

    const unsubscribeDisconnect = websocketService.onDisconnect(() => {
      console.log('❌ Disconnected from notification service');
      setIsConnected(false);
    });

    // Subscribe to incoming messages
    const unsubscribeMessage = websocketService.onMessage(handleNewNotification);

    // Cleanup on unmount
    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubscribeMessage();
      websocketService.disconnect();
    };
  }, [fetchNotifications, refreshUnreadCount, handleNewNotification, hasAuthToken]);

  /**
   * Fetch notifications on mount
   */
  useEffect(() => {
    fetchNotifications();
    refreshUnreadCount();
  }, [fetchNotifications, refreshUnreadCount]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
    refreshUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook to use notification context
 */
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export default NotificationContext;
