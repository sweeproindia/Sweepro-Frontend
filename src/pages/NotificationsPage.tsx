/**
 * Notifications Page
 * Full page view of all notifications with filters and actions
 */

import React, { useMemo, useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCheck, 
  Trash2, 
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { useClearReadNotificationsMutation, useDeleteNotificationMutation, useMarkAllAsReadMutation, useMarkAsReadMutation, useNotificationsListQuery, useUnreadCountQuery } from '@/features/notifications/hooks';
import { NotificationEmptyState } from '@/features/notifications/components/NotificationEmptyState';
import { NotificationSkeletonList } from '@/features/notifications/components/NotificationSkeletonList';
import { NotificationItem } from '@/features/notifications/components/NotificationItem';
import type { Notification } from '@/features/notifications/types';
import { getNotificationHref } from '@/features/notifications/utils';
import { useNavigate } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useNotifications();

  const listQuery = useNotificationsListQuery({ limit: 50 });
  const notifications = useMemo(() => listQuery.data?.notifications ?? [], [listQuery.data]);
  const { data: unreadCount = 0 } = useUnreadCountQuery();

  const markAllMutation = useMarkAllAsReadMutation();
  const markReadMutation = useMarkAsReadMutation();
  const deleteMutation = useDeleteNotificationMutation();
  const clearReadMutation = useClearReadNotificationsMutation();

  const [activeTab, setActiveTab] = useState<string>('all');

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === 'unread') return !notif.read;
    if (activeTab === 'read') return notif.read;
    return true;
  });

  const handleOpen = async (notification: Notification) => {
    if (!notification.read) {
      await markReadMutation.mutateAsync(notification.id);
    }

    const href = getNotificationHref(notification);
    if (href) {
      navigate(href);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Notifications</h1>
            <div title={isConnected ? "Connected" : "Disconnected"}>
              {isConnected ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => listQuery.refetch()}
            disabled={listQuery.isFetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${listQuery.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <p className="text-muted-foreground">
          {unreadCount > 0 
            ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
            : 'All caught up! No unread notifications'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-6">
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
        {notifications.some((n) => n.read) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => clearReadMutation.mutate()}
            disabled={clearReadMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="read">
            Read ({notifications.length - unreadCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-3">
          {listQuery.isLoading ? (
            <Card>
              <NotificationSkeletonList rows={8} />
            </Card>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <NotificationEmptyState
                title="No notifications"
                description={
                  activeTab === 'unread'
                    ? "You're all caught up."
                    : activeTab === 'read'
                    ? "No read notifications."
                    : "You don't have any notifications yet."
                }
              />
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div role="list" aria-label="Notifications">
                  {filteredNotifications.map((notification) => (
                    <div key={notification.id} role="listitem">
                      <NotificationItem
                        notification={notification}
                        onOpen={handleOpen}
                        onDelete={(id) => deleteMutation.mutate(id)}
                        showUnreadDot={activeTab !== 'read'}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsPage;
