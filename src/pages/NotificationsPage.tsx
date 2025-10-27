/**
 * Notifications Page
 * Full page view of all notifications with filters and actions
 */

import React, { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Filter,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isConnected,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
    fetchNotifications,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<string>('all');

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'unread') return !notif.read;
    if (activeTab === 'read') return notif.read;
    return true;
  });

  const getNotificationIcon = (type: string) => {
    const iconClass = "h-5 w-5";
    
    if (type.includes('BOOKING')) return <Bell className={`${iconClass} text-blue-500`} />;
    if (type.includes('PAYMENT')) return <Bell className={`${iconClass} text-green-500`} />;
    if (type.includes('MAID') || type.includes('SERVICE')) return <Bell className={`${iconClass} text-purple-500`} />;
    if (type.includes('SUBSCRIPTION')) return <Bell className={`${iconClass} text-orange-500`} />;
    if (type.includes('BUFFER')) return <Bell className={`${iconClass} text-yellow-500`} />;
    
    return <Bell className={`${iconClass} text-gray-500`} />;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy • h:mm a');
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
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
            onClick={fetchNotifications}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
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
            onClick={markAllAsRead}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
        {notifications.some(n => n.read) && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearReadNotifications}
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
          {loading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Loading notifications...</p>
              </CardContent>
            </Card>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">No notifications</p>
                <p className="text-sm text-muted-foreground">
                  {activeTab === 'unread' 
                    ? "You're all caught up!"
                    : activeTab === 'read'
                    ? "No read notifications"
                    : "You don't have any notifications yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/20' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-base">
                              {notification.title}
                            </CardTitle>
                            {!notification.read && (
                              <Badge variant="default" className="text-xs">New</Badge>
                            )}
                          </div>
                          <CardDescription className="text-sm">
                            {formatTime(notification.createdAt)}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{notification.message}</p>
                  {notification.data && Object.keys(notification.data).length > 0 && (
                    <div className="mt-3 p-3 bg-muted rounded-md">
                      <p className="text-xs font-medium mb-2">Additional Details:</p>
                      <div className="space-y-1">
                        {Object.entries(notification.data).map(([key, value]) => (
                          <div key={key} className="flex gap-2 text-xs">
                            <span className="font-medium capitalize">{key}:</span>
                            <span className="text-muted-foreground">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsPage;
