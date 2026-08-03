/**
 * Notifications Page
 * Full page view of all notifications with filters and actions
 */

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { useClearReadNotificationsMutation, useDeleteNotificationMutation, useMarkAllAsReadMutation, useMarkAsReadMutation, useNotificationsListQuery, useUnreadCountQuery } from '@/features/notifications/hooks';
import { NotificationEmptyState } from '@/features/notifications/components/NotificationEmptyState';
import { NotificationSkeletonList } from '@/features/notifications/components/NotificationSkeletonList';
import { NotificationItem } from '@/features/notifications/components/NotificationItem';
import type { Notification } from '@/features/notifications/types';
import { getNotificationHref } from '@/features/notifications/utils';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const listQuery = useNotificationsListQuery({ limit: 50 });
  const notifications = useMemo(() => listQuery.data?.notifications ?? [], [listQuery.data]);
  const { data: unreadCount = 0 } = useUnreadCountQuery();

  const markAllMutation = useMarkAllAsReadMutation();
  const markReadMutation = useMarkAsReadMutation();
  const deleteMutation = useDeleteNotificationMutation();
  const clearReadMutation = useClearReadNotificationsMutation();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === 'unread') return !notif.read;
    if (activeTab === 'read') return notif.read;
    return true;
  });

  const handleOpen = (notification: Notification) => {
    // Navigate immediately
    const href = getNotificationHref(notification);
    if (href) {
      navigate(href);
    }

    // Mark as read in background (don't wait for it)
    if (!notification.read) {
      markReadMutation.mutate(notification.id);
    }
  };

  const handleClearRead = () => {
    setShowClearConfirm(true);
  };

  const confirmClearRead = () => {
    clearReadMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: 'Read notifications cleared',
          description: 'All read notifications have been removed.',
        });
        setShowClearConfirm(false);
      },
      onError: () => {
        toast({
          title: 'Failed to clear notifications',
          description: 'Please try again later.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      {/* Header with back button */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Notifications</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => listQuery.refetch()}
            disabled={listQuery.isFetching}
          >
            {listQuery.isFetching ? 'Refreshing...' : 'Refresh'}
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
            onClick={() => {
              markAllMutation.mutate(undefined, {
                onSuccess: () => {
                  toast({
                    title: 'All notifications marked as read',
                    description: 'You have no unread notifications.',
                  });
                },
                onError: () => {
                  toast({
                    title: 'Failed to mark as read',
                    description: 'Please try again later.',
                    variant: 'destructive',
                  });
                }
              });
            }}
            disabled={markAllMutation.isPending}
          >
            Mark all as read
          </Button>
        )}
        {notifications.some((n) => n.read) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearRead}
            disabled={clearReadMutation.isPending}
          >
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
                        onDelete={(id) => {
                          deleteMutation.mutate(id, {
                            onSuccess: () => {
                              toast({
                                title: 'Notification deleted',
                                description: 'The notification has been removed.',
                              });
                            },
                            onError: (error: any) => {
                              console.error('Delete notification error:', error);
                              toast({
                                title: 'Failed to delete',
                                description: error?.message || 'Please try again later.',
                                variant: 'destructive',
                              });
                            }
                          });
                        }}
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

      {/* Clear Read Confirmation Dialog */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all read notifications?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all read notifications. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClearRead}>Clear</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NotificationsPage;
