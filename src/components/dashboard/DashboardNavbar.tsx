import { Button } from '@/components/ui/button';
import { Bell, Menu, User, LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { NotificationBell } from '@/components/notifications/NotificationBell';

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

  const handleLogout = () => {
    logout();
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
    <nav className="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex-1 px-4 flex justify-between items-center">
        {/* Logo and Mobile menu */}
        <div className="flex items-center space-x-4">
          {/* Hamburger Menu - Mobile Only */}
          {onMobileMenuToggle && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={onMobileMenuToggle}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src="/assets/logo.png"
              alt="SweepPro Logo"
              className="h-32 w-32 object-contain transition-all duration-300 group-hover:scale-110"
            />
          </Link>
        </div>

        {/* Right side: Notifications and Profile */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <NotificationBell />

          {/* Profile - Desktop Only */}
          <div className="hidden md:flex items-center space-x-2">
            <Link to="/profile">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Profile
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
    </nav>
  );
};
