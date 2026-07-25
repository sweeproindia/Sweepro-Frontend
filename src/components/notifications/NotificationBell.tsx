import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotificationsListQuery, useUnreadCountQuery, useDeleteNotificationMutation, useMarkAllAsReadMutation, useMarkAsReadMutation } from '@/features/notifications/hooks';
import { NotificationEmptyState } from '@/features/notifications/components/NotificationEmptyState';
import { NotificationItem } from '@/features/notifications/components/NotificationItem';
import { NotificationSkeletonList } from '@/features/notifications/components/NotificationSkeletonList';
import type { Notification } from '@/features/notifications/types';
import { getNotificationHref } from '@/features/notifications/utils';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const { data: unreadCount = 0 } = useUnreadCountQuery();
  const listQuery = useNotificationsListQuery({ limit: 10 });
  const notifications = useMemo(() => listQuery.data?.notifications ?? [], [listQuery.data]);

  const markAllMutation = useMarkAllAsReadMutation();
  const markReadMutation = useMarkAsReadMutation();
  const deleteMutation = useDeleteNotificationMutation();

  const handleOpen = (notification: Notification) => {
    // Navigate immediately
    const href = getNotificationHref(notification);
    if (href) {
      navigate(href);
      setIsOpen(false);
    }

    // Mark as read in background (don't wait for it)
    if (!notification.read) {
      markReadMutation.mutate(notification.id);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          aria-label="Notifications"
          aria-haspopup="menu"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllMutation.mutate()}
                  className="text-xs"
                  disabled={markAllMutation.isPending}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
            {unreadCount > 0 && (
              <CardDescription>
                You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {listQuery.isLoading ? (
              <NotificationSkeletonList rows={6} />
            ) : notifications.length === 0 ? (
              <NotificationEmptyState title="No notifications" description="You're all caught up." />
            ) : (
              <div className="max-h-96 overflow-y-auto" role="menu" aria-label="Notification list">
                {notifications.map((notification) => (
                  <div key={notification.id} role="menuitem">
                    <NotificationItem
                      notification={notification}
                      onOpen={handleOpen}
                      onDelete={(id) => deleteMutation.mutate(id)}
                      showUnreadDot
                    />
                  </div>
                ))}
              </div>
            )}

            {notifications.length > 0 && (
              <div className="p-3 border-t border-border">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={() => {
                    navigate('/notifications');
                    setIsOpen(false);
                  }}
                >
                  View all notifications
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};
