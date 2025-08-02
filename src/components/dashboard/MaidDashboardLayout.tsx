import { Button } from '@/components/ui/button';
import { Bell, Check, Clock, Menu, MessageCircle, Shield, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MaidDashboardSidebar } from './MaidDashboardSidebar';

interface MaidDashboardLayoutProps {
  children: React.ReactNode;
}

export const MaidDashboardLayout = ({ children }: MaidDashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const toggleNotification = () => setIsNotificationOpen(!isNotificationOpen);
  const openAllNotifications = () => {
    setShowAllNotifications(true);
    setIsNotificationOpen(false);
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
  const notifications = [
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
    },
    {
      id: 6,
      type: 'maid',
      title: 'Equipment Maintenance',
      message: 'Your cleaning equipment needs maintenance check',
      time: '3 days ago',
      unread: false
    },
    {
      id: 7,
      type: 'user',
      title: 'Client Feedback',
      message: 'Excellent service! Client left 5-star rating',
      time: '4 days ago',
      unread: false
    },
    {
      id: 8,
      type: 'admin',
      title: 'Performance Review',
      message: 'Your monthly performance review is available',
      time: '1 week ago',
      unread: false
    },
    {
      id: 9,
      type: 'maid',
      title: 'Holiday Schedule',
      message: 'Updated holiday schedule for next month',
      time: '1 week ago',
      unread: false
    },
    {
      id: 10,
      type: 'user',
      title: 'Special Request',
      message: 'Client requested deep cleaning for living room',
      time: '2 weeks ago',
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
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Mobile sidebar */}
      <div className={`lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 flex z-40">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)} />
          
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-card">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="text-white hover:text-white"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            {/* Mobile sidebar content would go here */}
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <MaidDashboardSidebar />

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden lg:ml-64">
        {/* Top navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-card border-b border-border shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-muted-foreground focus:outline-none lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1" />
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleNotification}
                  className="relative"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.filter(n => n.unread).length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.filter(n => n.unread).length}
                    </span>
                  )}
                </Button>

                {/* Notification Dropdown */}
                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                      <p className="text-sm text-gray-600">
                        {notifications.filter(n => n.unread).length} unread messages
                      </p>
                    </div>
                    
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${getNotificationColor(notification.type)} ${notification.unread ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className={`text-sm font-medium ${notification.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {notification.title}
                                </p>
                                {notification.unread && (
                                  <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="p-4 border-t border-gray-200">
                      <button 
                        onClick={openAllNotifications}
                        className="w-full text-sm text-primary hover:text-primary/80 font-medium"
                      >
                        View All Notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Profile */}
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span className="hidden md:block text-sm font-medium">Sarah Johnson</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">All Notifications</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {notifications.length} total notifications • {notifications.filter(n => n.unread).length} unread
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllNotifications(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[60vh]">
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${getNotificationColor(notification.type)} ${notification.unread ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className={`text-lg font-semibold ${notification.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-2">
                            {notification.unread && (
                              <span className="h-3 w-3 bg-blue-500 rounded-full"></span>
                            )}
                            <span className="text-sm text-gray-400 flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {notification.time}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            notification.type === 'admin' ? 'bg-blue-100 text-blue-800' :
                            notification.type === 'user' ? 'bg-green-100 text-green-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                          </span>
                          {notification.unread && (
                            <button className="text-sm text-primary hover:text-primary/80 font-medium flex items-center">
                              <Check className="h-4 w-4 mr-1" />
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-4">
                <button className="text-sm text-primary hover:text-primary/80 font-medium">
                  Mark all as read
                </button>
                <button className="text-sm text-gray-600 hover:text-gray-800 font-medium">
                  Clear all notifications
                </button>
              </div>
              <Button
                onClick={() => setShowAllNotifications(false)}
                className="bg-primary text-white hover:bg-primary/90"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 