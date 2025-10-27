import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, MessageCircle, Shield, User, X, Sparkles, Menu, Check, Trash2, Wifi, WifiOff, CheckCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardSidebar } from './DashboardSidebar';
import { useNotifications } from '@/contexts/NotificationContext';
import { format } from 'date-fns';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Use notification context
  const {
    notifications,
    unreadCount,
    isConnected,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const toggleNotification = () => setIsNotificationOpen(!isNotificationOpen);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    // Navigate based on notification type
    if (notification.data?.bookingId) {
      navigate(`/bookings/${notification.data.bookingId}`);
      setIsNotificationOpen(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return format(date, 'MMM d');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationOpen]);

  const getNotificationIcon = (type: string) => {
    const iconClass = "h-5 w-5";
    
    if (type.includes('BOOKING')) return <Bell className={`${iconClass} text-blue-500`} />;
    if (type.includes('PAYMENT')) return <Shield className={`${iconClass} text-green-500`} />;
    if (type.includes('MAID') || type.includes('SERVICE')) return <User className={`${iconClass} text-purple-500`} />;
    if (type.includes('SUBSCRIPTION')) return <Sparkles className={`${iconClass} text-orange-500`} />;
    if (type.includes('BUFFER')) return <MessageCircle className={`${iconClass} text-yellow-500`} />;
    
    return <Bell className={`${iconClass} text-gray-500`} />;
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Top navigation */}
      <div className="relative z-10 flex-shrink-0 flex h-16 bg-card border-b border-border shadow-sm">
        <div className="flex-1 px-4 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-2">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl">SweepPro</span>
          </Link>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleNotification} 
                className="relative hover:bg-accent transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-semibold shadow-lg animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-card rounded-xl shadow-2xl border border-border z-50 overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white">Notifications</h3>
                        <div title={isConnected ? "Connected" : "Disconnected"}>
                          {isConnected ? (
                            <Wifi className="h-4 w-4 text-white" />
                          ) : (
                            <WifiOff className="h-4 w-4 text-white" />
                          )}
                        </div>
                      </div>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                          className="text-white hover:bg-white/20 text-xs h-7"
                        >
                          <CheckCheck className="h-3 w-3 mr-1" />
                          Mark all read
                        </Button>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <p className="text-sm text-white/90 mt-1">
                        {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-[400px] overflow-y-auto">
                    {loading ? (
                      <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-sm text-muted-foreground mt-2">Loading...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                        <p className="text-sm text-muted-foreground">No notifications yet</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {notifications.slice(0, 8).map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 hover:bg-accent/50 transition-all cursor-pointer group relative ${
                              !notification.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start gap-3">
                              {/* Icon */}
                              <div className="flex-shrink-0 mt-0.5">
                                <div className={`p-2 rounded-lg ${
                                  !notification.read ? 'bg-blue-100 dark:bg-blue-900' : 'bg-muted'
                                }`}>
                                  {getNotificationIcon(notification.type)}
                                </div>
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`text-sm font-semibold line-clamp-1 ${
                                    !notification.read ? 'text-foreground' : 'text-muted-foreground'
                                  }`}>
                                    {notification.title}
                                  </p>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                      {formatTime(notification.createdAt)}
                                    </span>
                                    {!notification.read && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    )}
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                              </div>

                              {/* Actions */}
                              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={(e) => handleDelete(e, notification.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-border bg-muted/30">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-sm font-medium hover:bg-accent"
                        onClick={() => {
                          navigate('/notifications');
                          setIsNotificationOpen(false);
                        }}
                      >
                        View All Notifications →
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile - Desktop Only */}
            <Link to="/profile" className="hidden md:block">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">John Doe</span>
              </Button>
            </Link>

            {/* Hamburger Menu - Mobile Only */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area with sidebar and page content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop (always visible) */}
        <div className="hidden md:block">
          <DashboardSidebar />
        </div>
        
        {/* Mobile Sidebar (controlled by navbar hamburger) */}
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 z-50 md:hidden">
              <DashboardSidebar open={true} setOpen={setIsMobileSidebarOpen} />
            </div>
          </>
        )}

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export { DashboardLayout };