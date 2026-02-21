/**
 * Notification Context
 * Provides global notification state and WebSocket integration
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { websocketService } from '../services/websocketService';
import { getAuthToken } from '../services/api';
import { toast } from 'sonner';
import { notificationsQueryKeys } from '@/features/notifications/queryKeys';
import type { NotificationsListResult, Notification } from '@/features/notifications/types';

interface NotificationContextType {
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState<boolean>(false);

  /**
   * Fetch notifications from API
   */
  const hasAuthToken = useCallback(() => {
    const token = getAuthToken();
    return typeof token === 'string' && token.length > 0;
  }, []);

  // True when the user has an active session — either via a localStorage token
  // (Firebase) or via an HttpOnly cookie (email/password). The presence of
  // the 'user' key in localStorage is the shared indicator for both.
  const isLoggedIn = useCallback(() => {
    return !!localStorage.getItem('user');
  }, []);

  const upsertToQueryCache = useCallback(
    (incoming: Notification) => {
      const matches = queryClient.getQueriesData({ queryKey: notificationsQueryKeys.all });
      for (const [key, data] of matches) {
        const prev = data as NotificationsListResult | undefined;
        if (!prev) continue;

        const exists = prev.notifications.some((n) => n.id === incoming.id);
        if (exists) continue;

        queryClient.setQueryData<NotificationsListResult>(key, {
          notifications: [incoming, ...prev.notifications],
          unreadCount: prev.unreadCount + (incoming.read ? 0 : 1)
        });
      }

      queryClient.setQueryData<number>(notificationsQueryKeys.unreadCount, (old) => {
        const base = typeof old === 'number' ? old : 0;
        return base + (incoming.read ? 0 : 1);
      });
    },
    [queryClient]
  );

  /**
   * Handle incoming WebSocket notification
   */
  const handleNewNotification = useCallback((notification: Notification) => {
    upsertToQueryCache(notification);

    toast.info(notification.title, {
      description: notification.message,
      duration: 5000,
    });

    // Play notification sound (optional)
    playNotificationSound();
  }, [upsertToQueryCache]);

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
    if (!isLoggedIn()) {
      console.log('No active session found, skipping WebSocket connection');
      return;
    }

    // Connect to WebSocket.
    // For Firebase/localStorage-token users: token is passed as the first
    //   auth message (M4 pattern, handled in websocketService.ts:handleOpen).
    // For email/password (HttpOnly-cookie) users: token is null/empty — the
    //   HttpOnly cookie is sent automatically on the upgrade request and the
    //   backend authenticates via cookie (M4 backend fix in index.js).
    const token = getAuthToken() ?? '';
    websocketService.connect(token);

    // Subscribe to connection events
    const unsubscribeConnect = websocketService.onConnect(() => {
      console.log('✅ Connected to notification service');
      setIsConnected(true);
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.unreadCount });
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
  }, [handleNewNotification, isLoggedIn, queryClient]);


  const value: NotificationContextType = {
    isConnected,
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
