import { Button } from '@/components/ui/button';
import { Bell, Menu, MessageCircle, Shield, Sparkles, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  isAuthenticated?: boolean;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
}

export const Navbar = ({ isAuthenticated = false }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // check token on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  }, []);

  // handle scroll effects
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // close notification when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    if (isNotificationOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // navigate handlers
  const handleLogin = () => navigate('/login');
  const handleSignup = () => navigate('/signup');
  const handleDashboard = () => navigate('/dashboard');

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200' : 'bg-none'}`}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${scrolled ? 'text-black' : 'text-white'}`}>
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className={`rounded-lg p-2 group-hover:scale-105 transition-all duration-300 ${scrolled ? 'bg-gradient-to-r from-blue-600 to-blue-400' : 'bg-white/20 backdrop-blur-sm'}`}>
              <Sparkles className={`h-6 w-6 ${scrolled ? 'text-white' : 'text-white'}`} />
            </div>
            <span className={`text-xl font-bold ${scrolled ? 'text-black' : 'text-white'}`}>Sweepro</span>
          </Link>

          {/* Center nav links */}
          <div className="hidden md:flex flex-1 justify-center items-center">
            <div className={`flex gap-8 rounded-full px-8 py-2 ${scrolled ? 'bg-gray-100' : ''}`}>
              <a href="#services" className={`font-semibold hover:text-blue-600 ${scrolled ? 'text-black' : 'text-white'}`}>Services</a>
              <a href="#how-it-works" className={`font-semibold hover:text-blue-600 ${scrolled ? 'text-black' : 'text-white'}`}>How It Works</a>
              <a href="#subscription-plans" className={`font-semibold hover:text-blue-600 ${scrolled ? 'text-black' : 'text-white'}`}>Pricing</a>
              <a href="#testimonials" className={`font-semibold hover:text-blue-600 ${scrolled ? 'text-black' : 'text-white'}`}>Testimonials</a>
              <a href="#faq" className={`font-semibold hover:text-blue-600 ${scrolled ? 'text-black' : 'text-white'}`}>FAQ</a>
            </div>
          </div>

          {/* Right-side buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <Button 
                onClick={handleDashboard} 
                className="rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold px-6 py-2 shadow-lg hover:scale-105 transition-all"
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleLogin}
                  className={`rounded-full font-semibold px-6 py-2 ${scrolled ? 'border-2 border-gray-300 bg-white text-black' : 'border-2 border-white/80 bg-white/10 text-white'}`}
                >
                  Login
                </Button>
                <Button 
                  onClick={handleSignup}
                  className="rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold px-6 py-2 shadow-lg hover:scale-105 transition-all"
                >
                  Signup
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu icon */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border">
            <a href="#services" className="block text-muted-foreground hover:text-primary py-2" onClick={toggleMenu}>Services</a>
            <a href="#how-it-works" className="block text-muted-foreground hover:text-primary py-2" onClick={toggleMenu}>How It Works</a>
            <a href="#subscription-plans" className="block text-muted-foreground hover:text-primary py-2" onClick={toggleMenu}>Pricing</a>
            <a href="#testimonials" className="block text-muted-foreground hover:text-primary py-2" onClick={toggleMenu}>Testimonials</a>
            <a href="#faq" className="block text-muted-foreground hover:text-primary py-2" onClick={toggleMenu}>FAQ</a>

            {isLoggedIn ? (
              <Button onClick={() => { handleDashboard(); toggleMenu(); }} className="w-full">Dashboard</Button>
            ) : (
              <div className="space-y-2 pt-2">
                <Button variant="outline" onClick={() => { handleLogin(); toggleMenu(); }} className="w-full">Login</Button>
                <Button onClick={() => { handleSignup(); toggleMenu(); }} className="w-full">Get Started</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
