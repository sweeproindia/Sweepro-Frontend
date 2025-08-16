import { Button } from '@/components/ui/button';
import { Bell, Menu, MessageCircle, Shield, Sparkles, User, X, LogOut, UserCircle, Settings } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useUser();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleNotification = () => setIsNotificationOpen(!isNotificationOpen);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getDashboardRoute = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'ADMIN':
        return '/admin-dashboard';
      case 'MAID':
        return '/maid-dashboard';
      default:
        return '/dashboard';
    }
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

  // Sample notification data
  const notifications = [
    {
      id: 1,
      type: 'admin',
      title: 'New User Registration',
      message: 'Sarah Johnson has registered as a new user',
      time: '2 minutes ago',
      unread: true
    },
    {
      id: 2,
      type: 'user',
      title: 'Booking Confirmed',
      message: 'Your cleaning appointment for tomorrow has been confirmed',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 3,
      type: 'maid',
      title: 'New Assignment',
      message: 'You have been assigned to clean apartment 4B',
      time: '3 hours ago',
      unread: false
    },
    {
      id: 4,
      type: 'admin',
      title: 'Payment Received',
      message: 'Payment of ₹3,499 received from Mike Rodriguez',
      time: '5 hours ago',
      unread: false
    },
    {
      id: 5,
      type: 'user',
      title: 'Service Completed',
      message: 'Your weekly cleaning service has been completed',
      time: '1 day ago',
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
    <nav className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-hero rounded-lg p-2 group-hover:scale-105 transition-transform">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">CleanEase</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#services" className="text-muted-foreground hover:text-primary transition-colors">
              Services
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">
              Pricing
            </a>
            <a href="#testimonials" className="text-muted-foreground hover:text-primary transition-colors">
              Testimonials
            </a>
            <a href="#faq" className="text-muted-foreground hover:text-primary transition-colors">
              FAQ
            </a>
            
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                {/* Notification Bell */}
                <div className="relative" ref={notificationRef}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={toggleNotification}
                    className="relative p-2"
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
                        <button className="w-full text-sm text-primary hover:text-primary/80 font-medium">
                          View All Notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getUserInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {user.role.toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={getDashboardRoute()} className="flex items-center">
                        <UserCircle className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600 focus:text-red-600 cursor-pointer"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  className="text-muted-foreground hover:text-primary transition-colors"
                  to="/login"
                  
                >
                  Login
                </Link>
                <Link
                  className="btn-hero px-4 py-2 rounded bg-blue-500 text-white font-semibold shadow hover:bg-blue-600 transition"
                  to="/register"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border">
            <a 
              href="#services" 
              className="block text-muted-foreground hover:text-primary transition-colors py-2"
              onClick={toggleMenu}
            >
              Services
            </a>
            <a 
              href="#how-it-works" 
              className="block text-muted-foreground hover:text-primary transition-colors py-2"
              onClick={toggleMenu}
            >
              How It Works
            </a>
            <a 
              href="#pricing" 
              className="block text-muted-foreground hover:text-primary transition-colors py-2"
              onClick={toggleMenu}
            >
              Pricing
            </a>
            <a 
              href="#testimonials" 
              className="block text-muted-foreground hover:text-primary transition-colors py-2"
              onClick={toggleMenu}
            >
              Testimonials
            </a>
            <a 
              href="#faq" 
              className="block text-muted-foreground hover:text-primary transition-colors py-2"
              onClick={toggleMenu}
            >
              FAQ
            </a>
            
            {isAuthenticated && user ? (
              <div className="space-y-2 pt-2">
                <div className="px-2 py-2 text-sm text-muted-foreground">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs">{user.email}</p>
                  <p className="text-xs capitalize">{user.role.toLowerCase()}</p>
                </div>
                <Link to={getDashboardRoute()} onClick={toggleMenu}>
                  <Button variant="default" className="w-full">Dashboard</Button>
                </Link>
                <Link to="/profile" onClick={toggleMenu}>
                  <Button variant="outline" className="w-full">Profile</Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full text-red-600 hover:text-red-600 hover:bg-red-50"
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <Link to="/login" onClick={toggleMenu}>
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link to="/signup" onClick={toggleMenu}>
                  <Button className="btn-hero w-full">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
