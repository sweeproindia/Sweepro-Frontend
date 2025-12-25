import { Button } from '@/components/ui/button';
import { Bell, ChevronDown, LogOut, Menu, MessageCircle, Shield, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/authService';

interface NavbarProps {
  isAuthenticated?: boolean;
  user?: any;
}

export const Navbar = ({ 
  isAuthenticated = false, 
  user
}: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleNotification = () => setIsNotificationOpen(!isNotificationOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  const handleLogout = () => {
    AuthService.logout();
    setIsUserMenuOpen(false);
    window.location.href = '/';
  };

  const handleDashboardClick = () => {
    if (user?.role === 'CUSTOMER') {
      navigate('/dashboard');
    } else if (user?.role === 'MAID') {
      navigate('/maid-dashboard');
    } else if (user?.role === 'ADMIN') {
      navigate('/admin-dashboard');
    }
  };

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isNotificationOpen || isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen, isUserMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const navLinks = [
    {
      href: '#services',
      label: 'Services',
    },
    {
      href: '#how-it-works',
      label: 'How It Works',
    },
    ...(
      !isAuthenticated
        ? [{ href: '#subscription-plans', label: 'Pricing' }]
        : []
    ),
    {
      href: '#testimonials',
      label: 'Testimonials',
    },
    {
      href: '#faq',
      label: 'FAQ',
    },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200'
          : 'bg-none'
      }`}
      style={!scrolled ? { background: 'none', boxShadow: 'none' } : {}}
    >
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
          scrolled ? 'text-black' : 'text-white'
        }`}
        style={!scrolled ? { background: 'none' } : {}}
      >
        <div className="flex justify-between items-center h-16 gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center group flex-shrink-0">
            <img
              src={scrolled ? "/assets/logo.png" : "/assets/logo-black.png"}
              alt="SweepPro Logo"
              className="h-12 w-auto md:h-60 md:w-60 object-contain transition-all duration-300 group-hover:scale-110"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 justify-center items-center ml-8">
            <div
              className={`flex gap-8 rounded-full px-8 py-2 transition-all duration-300 ${
                scrolled ? 'bg-gray-100' : ''
              }`}
              style={!scrolled ? { background: 'transparent', boxShadow: 'none' } : {}}
            >
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`font-semibold hover:text-blue-600 transition-colors ${
                    scrolled ? 'text-black' : 'text-white'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Login/Signup Buttons - right side */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleDashboardClick}
                  className={`rounded-full font-semibold px-6 py-2 transition-all duration-300 ${
                    scrolled
                      ? 'border-2 border-blue-900 bg-blue-900 text-white hover:bg-red-600'
                      : 'border-2 border-blue-900 bg-blue-900 text-white hover:bg-red-600'
                  }`}
                >
                  Dashboard
                </Button>
                
                <div className="relative" ref={userMenuRef}>
                  <Button
                    variant="outline"
                    onClick={toggleUserMenu}
                    className={`rounded-full font-semibold px-4 py-2 transition-all duration-300 flex items-center gap-2 ${
                      scrolled
                        ? 'border-2 border-blue-900 bg-white text-blue-900 hover:bg-blue-50'
                        : 'border-2 border-blue-900 bg-blue-50 text-blue-900 hover:bg-blue-50'
                    }`}
                  >
                    <User className="h-4 w-4" />
                    {user.name}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="outline"
                    className={`rounded-full font-semibold px-6 py-2 transition-all duration-300 ${
                      scrolled
                        ? 'border-2 border-blue-900 bg-white text-blue-900 hover:bg-blue-50'
                        : 'border-2 border-white/80 backdrop-blur-md bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button 
                    className="rounded-full bg-gradient-to-r from-blue-900 via-blue-900 to-red-600 text-white font-bold px-6 py-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    Signup
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && user && (
              <Button
                size="sm"
                variant={scrolled ? 'outline' : 'ghost'}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  scrolled
                    ? 'border-blue-900 text-blue-900 hover:bg-blue-50'
                    : 'text-white hover:bg-white/10'
                }`}
                onClick={() => {
                  toggleMenu();
                  handleDashboardClick();
                }}
              >
                Dashboard
              </Button>
            )}
            <Button
              variant={scrolled ? 'outline' : 'ghost'}
              size="sm"
              className={`${
                scrolled ? 'border-gray-300 text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
              }`}
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 rounded-3xl border border-white/20 bg-white/80 backdrop-blur-xl shadow-2xl">
            <div className="px-5 pt-5 pb-6 space-y-4">
              <div className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700 hover:shadow"
                    onClick={toggleMenu}
                  >
                    {link.label}
                    <ChevronDown className="h-4 w-4 rotate-[-90deg] text-slate-400" />
                  </a>
                ))}
              </div>

              <div className="space-y-3 border-t border-slate-200/70 pt-4">
                {isAuthenticated && user ? (
                  <>
                    <div className="rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-lg">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-slate-200">{user.email}</p>
                    </div>
                    <Button
                      className="w-full rounded-2xl bg-gradient-to-r from-blue-900 via-blue-900 to-red-600 text-white shadow-lg hover:shadow-xl"
                      onClick={() => {
                        toggleMenu();
                        handleDashboardClick();
                      }}
                    >
                      Go to Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full rounded-2xl border-red-500 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        handleLogout();
                        toggleMenu();
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link to="/login" onClick={toggleMenu}>
                      <Button
                        variant="outline"
                        className="w-full rounded-2xl border-slate-200 text-slate-700 hover:border-blue-200 hover:bg-blue-50"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={toggleMenu}>
                      <Button className="w-full rounded-2xl bg-gradient-to-r from-blue-900 via-blue-900 to-red-600 text-white shadow-lg hover:shadow-xl">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
