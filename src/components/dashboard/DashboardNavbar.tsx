import { Button } from '@/components/ui/button';
import { Bell, Menu, User, LogOut, Shield, Settings, Lock, ChevronDown, UserCog } from 'lucide-react';
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
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    await logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate('/');
  };

  const profilePath = userType === 'admin' ? '/admin/profile' : '/profile';

  return (
    <nav className={`relative z-10 flex-shrink-0 flex h-16 transition-all duration-300 ${userType === 'admin'
        ? isScrolled
          ? 'bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 shadow-xl'
          : 'bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700/30 shadow-sm'
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
              className={`md:hidden ${userType === 'admin' ? 'text-white hover:bg-white/10' : ''}`}
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
              className="h-32 w-32 object-contain transition-all duration-300 group-hover:scale-105"
            />
          </Link>
        </div>

        {/* Logo - mobile centered (absolute) */}
        <div className="absolute left-1/2 -translate-x-1/2 md:hidden">
          <Link to="/" className="flex items-center group">
            <img
              src={userType === 'admin' ? '/assets/logo-black.png' : '/assets/logo.png'}
              alt="Sweepro Logo"
              className="h-32 w-32 object-contain transition-all duration-300 group-hover:scale-105"
            />
          </Link>
        </div>

        {/* Center: Breadcrumb-style navigation label - Admin only */}
        {userType === 'admin' && (
          <div className="flex-1 hidden md:flex justify-center">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
              <Shield className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-white/90">Admin Console</span>
            </div>
          </div>
        )}

        {/* Right side */}
        <div className={`ml-auto flex items-center space-x-1 sm:space-x-2 ${userType === 'admin' ? 'text-white' : ''}`}>
          <NotificationBell />

          {/* Profile dropdown - responsive */}
          <div ref={profileMenuRef} className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg transition-colors ${
                userType === 'admin'
                  ? 'hover:bg-white/10 text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                userType === 'admin'
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white ring-2 ring-blue-400/30'
                  : 'bg-primary/10 text-primary'
              }`}>
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
              </div>
              <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">
                {user?.name?.split(' ')[0] || 'Profile'}
              </span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className={`absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl shadow-xl border overflow-hidden z-50 ${
                userType === 'admin'
                  ? 'bg-slate-800 border-slate-700'
                  : 'bg-white border-gray-200'
              }`}>
                {/* User info header */}
                <div className={`px-4 py-3 border-b ${
                  userType === 'admin' ? 'border-slate-700 bg-slate-800/80' : 'border-gray-100 bg-gray-50'
                }`}>
                  <p className={`text-sm font-semibold truncate ${
                    userType === 'admin' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {user?.name || 'Admin User'}
                  </p>
                  <p className={`text-xs truncate mt-0.5 ${
                    userType === 'admin' ? 'text-slate-400' : 'text-gray-500'
                  }`}>
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className={`text-xs ${
                      userType === 'admin' ? 'text-green-400' : 'text-green-600'
                    }`}>
                      Online
                    </span>
                    <Badge className="ml-auto text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100">
                      Admin
                    </Badge>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <Link
                    to={profilePath}
                    onClick={() => setIsProfileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      userType === 'admin'
                        ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </Link>
                  <Link
                    to="/admin#overview"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      userType === 'admin'
                        ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    Dashboard
                  </Link>
                </div>

                {/* Logout */}
                <div className={`border-t py-1 ${
                  userType === 'admin' ? 'border-slate-700' : 'border-gray-100'
                }`}>
                  <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm w-full transition-colors ${
                      userType === 'admin'
                        ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300'
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
