import { Button } from '@/components/ui/button';
import { Bell, Menu, MessageCircle, Shield, User, LogOut, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MaidDashboardSidebar } from './MaidDashboardSidebar';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

interface MaidDashboardLayoutProps {
  children: React.ReactNode;
}

interface Notification {
  id: number;
  type: 'admin' | 'user' | 'maid';
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

export const MaidDashboardLayout = ({ children }: MaidDashboardLayoutProps) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  const toggleNotification = () => setIsNotificationOpen(!isNotificationOpen);
  const openAllNotifications = () => {
    setShowAllNotifications(true);
    setIsNotificationOpen(false);
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate('/');
  };

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  // Sample notification data for maid
  const notifications: Notification[] = [
    {
      id: 1,
      type: 'maid',
      title: 'New Assignment',
      message: 'You have been assigned to clean apartment 4B tomorrow at 10 AM',
      time: '5 minutes ago',
      unread: true
    },
    {
      id: 2,
      type: 'admin',
      title: 'Schedule Update',
      message: 'Your cleaning schedule for this week has been updated',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 3,
      type: 'user',
      title: 'Special Instructions',
      message: 'Client requested extra attention to kitchen area',
      time: '2 hours ago',
      unread: false
    },
    {
      id: 4,
      type: 'maid',
      title: 'Payment Processed',
      message: 'Your payment of ₹2,500 has been processed for last week',
      time: '1 day ago',
      unread: false
    },
    {
      id: 5,
      type: 'admin',
      title: 'Training Reminder',
      message: 'Monthly safety training session scheduled for next week',
      time: '2 days ago',
      unread: false
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'user':
        return <User className="h-4 w-4 text-green-600" />;
      case 'maid':
        return <MessageCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'admin':
        return 'border-l-blue-500 bg-blue-50';
      case 'user':
        return 'border-l-green-500 bg-green-50';
      case 'maid':
        return 'border-l-orange-500 bg-orange-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Top Navigation - Consistent with Admin/Customer Design */}
      <div className="relative z-10 flex-shrink-0 flex h-16 bg-card border-b border-border shadow-sm">
        <div className="flex-1 px-4 flex justify-between items-center">
          {/* Left side: Logo and Mobile menu */}
          <div className="flex items-center space-x-4">
            {/* Hamburger Menu - Mobile Only */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo in Navbar */}
            <Link to="/maid-dashboard" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-2">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl">SweepPro Maid</span>
            </Link>
          </div>

          {/* Right side: Notifications and Profile */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <Button variant="ghost" size="sm" onClick={toggleNotification} className="relative">
                <Bell className="h-5 w-5" />
                {notifications.filter((n) => n.unread).length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.filter((n) => n.unread).length}
                  </span>
                )}
              </Button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    <p className="text-sm text-gray-600">{notifications.filter((n) => n.unread).length} unread messages</p>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${getNotificationColor(notification.type)} ${
                          notification.unread ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm font-medium ${notification.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </p>
                              {notification.unread && <span className="h-2 w-2 bg-blue-500 rounded-full"></span>}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t border-gray-200">
                    <button onClick={openAllNotifications} className="w-full text-sm text-primary hover:text-primary/80 font-medium">
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile - Desktop Only */}
            <div className="hidden md:flex items-center space-x-2">
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    {user?.name || 'Maid'}
                  </span>
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area with sidebar and page content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop (always visible) */}
        <div className="hidden md:block">
          <MaidDashboardSidebar />
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
              <MaidDashboardSidebar open={true} setOpen={setIsMobileSidebarOpen} forceOpen={true} />
            </div>
          </>
        )}

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* All Notifications Modal */}
      {showAllNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">All Notifications</h2>
              <button onClick={() => setShowAllNotifications(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-gray-50 transition-colors border-l-4 ${getNotificationColor(notification.type)} ${
                      notification.unread ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-lg font-medium ${notification.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </p>
                          {notification.unread && (
                            <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-gray-600 mt-2">{notification.message}</p>
                        <p className="text-sm text-gray-400 mt-3">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Showing {notifications.length} notifications</p>
                <button onClick={() => setShowAllNotifications(false)} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};