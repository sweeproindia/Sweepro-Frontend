import { Button } from '@/components/ui/button';
import { Bell, ChevronDown, LogOut, Menu, MessageCircle, Shield, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();

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
      href: 'about-us',
      label: 'Services',
    },
    {
      href: 'how-it-works',
      label: 'How It Works',
    },
    ...(
      !isAuthenticated
        ? [{ href: 'subscription-plans', label: 'Plans' }]
        : []
    ),
    {
      href: 'testimonials',
      label: 'Testimonials',
    },
    {
      href: 'faq-section',
      label: 'FAQ',
    },
  ];

  const scrollToSection = (sectionId: string) => {
    if (sectionId === '') {
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleNavLinkClick = (sectionId: string) => {
    setIsMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
      return;
    }

    scrollToSection(sectionId);
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100'
          : 'bg-gradient-to-b from-black/20 to-transparent backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => handleNavLinkClick('')}
              className="flex items-center group"
            >
              <img
                src={scrolled ? "/assets/logo.png" : "/assets/logo-black.png"}
                alt="Sweepro Logo"
                className="h-12 w-auto md:h-16 lg:h-20 object-contain transition-all duration-300 group-hover:scale-105"
                style={{ 
                  maxWidth: '240px',
                  minWidth: '120px'
                }}
              />
            </button>
          </div>

          {/* Center - Desktop Navigation */}
          <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-10">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavLinkClick(link.href)}
                  className={`font-medium text-[15px] hover:text-blue-600 transition-all duration-200 relative group ${
                    scrolled ? 'text-gray-800' : 'text-white'
                  }`}
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                </button>
              ))}
            </div>
          </div>

          {/* Right side - Auth buttons */}
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleDashboardClick}
                  className="hidden md:inline-flex rounded-full font-semibold px-6 py-2.5 bg-blue-900 text-white hover:bg-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Dashboard
                </Button>
                
                <div className="relative" ref={userMenuRef}>
                  <Button
                    variant="outline"
                    onClick={toggleUserMenu}
                    className={`rounded-full font-semibold px-4 py-2.5 transition-all duration-300 flex items-center gap-2 ${
                      scrolled
                        ? 'border border-blue-900 text-blue-900 hover:bg-blue-50'
                        : 'border border-white text-white hover:bg-white/20'
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline">{user.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-3 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {user.role}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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
                <Link to="/login" className="hidden md:block">
                  <Button
                    variant="outline"
                    className={`rounded-full font-semibold px-6 py-2.5 transition-all duration-300 ${
                      scrolled
                        ? 'border border-blue-900 text-blue-900 hover:bg-blue-50 hover:text-blue-800'
                        : 'border-2 border-white bg-transparent text-white hover:bg-white/20 hover:border-white/90'
                    }`}
                  >
                    Login
                  </Button>
                </Link>
                {/* Hide Sign Up button on mobile - only show on desktop */}
                <Link to="/signup" className="hidden md:block">
                  <Button 
                    className={`rounded-full font-bold px-6 py-2.5 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ${
                      scrolled
                        ? 'bg-gradient-to-r from-blue-900 to-blue-700 text-white'
                        : 'bg-white text-blue-900 hover:bg-blue-50'
                    }`}
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden ml-2 p-2 rounded-lg transition-colors"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {isMenuOpen ? (
                <X className={`h-6 w-6 ${scrolled ? 'text-gray-700' : 'text-white'}`} />
              ) : (
                <Menu className={`h-6 w-6 ${scrolled ? 'text-gray-700' : 'text-white'}`} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 rounded-2xl border border-white/20 bg-white/95 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="px-4 pt-6 pb-8">
              {/* Mobile Navigation Links - Cleaner layout */}
              <div className="space-y-1 mb-6">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    type="button"
                    className="w-full text-left rounded-lg px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                    onClick={() => handleNavLinkClick(link.href)}
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              {/* Mobile Auth Section */}
              <div className="space-y-4 border-t border-gray-100 pt-6">
                {isAuthenticated && user ? (
                  <>
                    {/* User Info - More compact */}
                    <div className="rounded-xl bg-gradient-to-r from-blue-900 to-blue-700 px-4 py-3 text-white">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{user.name}</p>
                          <p className="text-xs text-white/80">{user.email}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-white/20 rounded-full">
                          {user.role}
                        </span>
                      </div>
                    </div>
                    
                    {/* Mobile Buttons */}
                    <div className="space-y-3">
                      <Button
                        className="w-full rounded-lg bg-blue-900 text-white py-3 text-sm font-semibold"
                        onClick={() => {
                          toggleMenu();
                          handleDashboardClick();
                        }}
                      >
                        Go to Dashboard
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full rounded-lg border-gray-200 text-gray-700 hover:bg-gray-50 py-3 text-sm"
                        onClick={() => {
                          handleLogout();
                          toggleMenu();
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Link to="/login" onClick={toggleMenu}>
                      <Button
                        variant="outline"
                        className="w-full rounded-lg border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-700 py-3 text-sm"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={toggleMenu}>
                      <Button className="w-full rounded-lg bg-gradient-to-r from-blue-900 to-blue-700 text-white py-3 text-sm font-semibold">
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