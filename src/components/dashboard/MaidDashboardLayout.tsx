import { Button } from '@/components/ui/button';
import { Bell, Menu, MessageCircle, Shield, User, LogOut, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MaidDashboardSidebar } from './MaidDashboardSidebar';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface MaidDashboardLayoutProps {
  children: React.ReactNode;
}

export const MaidDashboardLayout = ({ children }: MaidDashboardLayoutProps) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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
            {/* Notifications - Using NotificationBell Component */}
            <NotificationBell />

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
    </div>
  );
};