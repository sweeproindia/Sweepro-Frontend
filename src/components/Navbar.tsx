import { Button } from '@/components/ui/button';
import { Bell, Menu, MessageCircle, Shield, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  isAuthenticated?: boolean;
}

export const Navbar = ({ isAuthenticated = false }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleNotification = () => setIsNotificationOpen(!isNotificationOpen);

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
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <img
              src="/assets/logo.png"
              alt="SweepPro Logo"
              className="h-8 w-8 object-contain"
            />
            <span
              className={`text-xl font-bold transition-colors duration-300 ${
                scrolled ? 'text-black' : 'text-white'
              }`}
            >
              Sweepro
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 justify-center items-center">
            <div
              className={`flex gap-8 rounded-full px-8 py-2 transition-all duration-300 ${
                scrolled ? 'bg-gray-100' : ''
              }`}
              style={!scrolled ? { background: 'transparent', boxShadow: 'none' } : {}}
            >
              <a
                href="#services"
                className={`font-semibold hover:text-blue-600 transition-colors ${
                  scrolled ? 'text-black' : 'text-white'
                }`}
              >
                Services
              </a>
              <a
                href="#how-it-works"
                className={`font-semibold hover:text-blue-600 transition-colors ${
                  scrolled ? 'text-black' : 'text-white'
                }`}
              >
                How It Works
              </a>
              <a
                href="#subscription-plans"
                className={`font-semibold hover:text-blue-600 transition-colors ${
                  scrolled ? 'text-black' : 'text-white'
                }`}
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className={`font-semibold hover:text-blue-600 transition-colors ${
                  scrolled ? 'text-black' : 'text-white'
                }`}
              >
                Testimonials
              </a>
              <a
                href="#faq"
                className={`font-semibold hover:text-blue-600 transition-colors ${
                  scrolled ? 'text-black' : 'text-white'
                }`}
              >
                FAQ
              </a>
            </div>
          </div>

          {/* Login/Signup Buttons - right side */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login">
              <Button
                variant="outline"
                className={`rounded-full font-semibold px-6 py-2 transition-all duration-300 ${
                  scrolled
                    ? 'border-2 border-gray-300 bg-white text-black hover:bg-gray-50'
                    : 'border-2 border-white/80 backdrop-blur-md bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 text-white font-bold px-6 py-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                Signup
              </Button>
            </Link>
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
              href="#subscription-plans"
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

            {isAuthenticated ? (
              <Link to="/dashboard" onClick={toggleMenu}>
                <Button variant="default" className="w-full">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <div className="space-y-2 pt-2">
                <Link to="/login" onClick={toggleMenu}>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
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
