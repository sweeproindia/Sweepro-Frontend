import { Button } from '@/components/ui/button';
import { Bell, Menu, User, LogOut, Shield, Settings, Lock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Badge } from '@/components/ui/badge';

interface DashboardNavbarProps {
  userType?: 'user' | 'admin' | 'maid';
  onMobileMenuToggle?: () => void;
}

export const DashboardNavbar = ({
  userType = 'user',
  onMobileMenuToggle
}: DashboardNavbarProps) => {
  const { user, logout } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate('/');
  };

  const getDashboardTitle = () => {
    switch (userType) {
      case 'admin':
        return 'Admin Dashboard';
      case 'maid':
        return 'Maid Dashboard';
      default:
        return 'Dashboard';
    }
  };

  return (
    <nav className={`relative z-10 flex-shrink-0 flex h-16 transition-all duration-300 ${userType === 'admin'
        ? isScrolled
          ? 'bg-[#1800ad]/30 backdrop-blur-xl border-b border-[#ca0013]/30 shadow-xl'
          : 'bg-gradient-to-r from-[#1800ad] to-[#1a1a2e] border-b-2 border-[#ca0013] shadow-sm'
        : isScrolled
          ? 'bg-white/70 backdrop-blur-xl border-b border-gray-200/30 shadow-xl'
          : 'bg-white border-b border-gray-200 shadow-sm'
      }`}>
      <div className="flex-1 px-4 flex items-center relative">
        {/* Left: Hamburger (mobile) + Logo (desktop) */}
        <div className="flex items-center gap-2">
          {onMobileMenuToggle && (
            <Button
              variant="ghost"
              size="sm"
              className={`md:hidden ${userType === 'admin' ? 'text-white hover:bg-[#1800ad]/50' : ''}`}
              onClick={onMobileMenuToggle}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          {/* Logo - desktop left aligned */}
          <Link to="/" className="hidden md:flex items-center group">
            <img
              src={userType === 'admin' ? '/assets/logo-black.png' : '/assets/logo.png'}
              alt="Sweepro Logo"
              className="h-32 w-32 object-contain transition-all duration-300 group-hover:scale-110"
            />
          </Link>
        </div>

        {/* Logo - mobile centered (absolute) */}
        <div className="absolute left-1/2 -translate-x-1/2 md:hidden">
          <Link to="/" className="flex items-center group">
            <img
              src={userType === 'admin' ? '/assets/logo-black.png' : '/assets/logo.png'}
              alt="Sweepro Logo"
              className="h-32 w-32 object-contain transition-all duration-300 group-hover:scale-110"
            />
          </Link>
        </div>

        {/* Center Admin Panel - Only for Admin on desktop */}
        {userType === 'admin' && (
          <div className="flex-1 hidden md:flex justify-center">
            <div className="bg-[#1800ad]/80 px-6 py-2 rounded-full backdrop-blur-sm">
              <span className="text-lg font-bold text-white">Admin Panel</span>
            </div>
          </div>
        )}

        {/* Right side */}
        <div className={`ml-auto flex items-center space-x-2 ${userType === 'admin' ? 'text-white' : ''}`}>
          <NotificationBell />

          {/* Profile avatar - mobile only */}
          <Link to="/profile" className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-1.5 ${userType === 'admin' ? 'text-white hover:bg-[#1800ad]/50' : ''}`}
            >
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                </span>
              </div>
              <span className="text-sm font-medium max-w-[80px] truncate">
                {user?.name?.split(' ')[0] || 'Profile'}
              </span>
            </Button>
          </Link>

          {/* Profile + Logout - desktop only */}
          <div className="hidden md:flex items-center space-x-2">
            <Link to="/profile">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center space-x-2 ${userType === 'admin' ? 'text-white hover:bg-[#1800ad]/50' : ''}`}
              >
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">Profile</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className={`flex items-center space-x-2 ${userType === 'admin' ? 'text-[#ca0013] hover:text-[#ca0013]/80 hover:bg-[#ca0013]/10' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}`}
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
