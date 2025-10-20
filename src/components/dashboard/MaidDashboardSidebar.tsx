import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, CreditCard, MessageCircle, LogOut, User, Settings, Clock, Star, Shield, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/aceternity-sidebar';
import { useState } from 'react';
import { motion } from 'motion/react';

interface MaidDashboardSidebarProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  forceOpen?: boolean;
  upcomingBookingsCount?: number;
}

const maidNavigationItems = [
  { 
    name: 'Dashboard', 
    href: '/maid-dashboard', 
    icon: <Home className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
  },
  { 
    name: 'My Assignments', 
    href: '/maid-bookings', 
    icon: <Calendar className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
    showBadge: true
  },
  { 
    name: 'Auto Requests', 
    href: '/maid-auto-requests', 
    icon: <Zap className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
  },
  { 
    name: 'Availability', 
    href: '/maid-availability', 
    icon: <Clock className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
  },
  { 
    name: 'Earnings', 
    href: '/maid-earnings', 
    icon: <CreditCard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
  },
  { 
    name: 'Ratings', 
    href: '/maid-ratings', 
    icon: <Star className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
  },
  { 
    name: 'Support', 
    href: '/maid-support', 
    icon: <MessageCircle className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
  },
  { 
    name: 'Verification', 
    href: '/maid-verification', 
    icon: <Shield className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
  },
  { 
    name: 'Profile', 
    href: '/profile', 
    icon: <User className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
  },
];

export const MaidDashboardSidebar = ({ open, setOpen, forceOpen, upcomingBookingsCount = 0 }: MaidDashboardSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const { toast } = useToast();
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate('/');
  };

  const links = maidNavigationItems.map(item => ({
    label: item.name,
    href: item.href,
    icon: item.icon,
    badge: item.showBadge && upcomingBookingsCount > 0 ? upcomingBookingsCount : undefined,
  }));

  // If forceOpen is true, always pass true to the Sidebar component
  const sidebarOpen = forceOpen ? true : open;

  return (
    <Sidebar open={sidebarOpen} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Removed Logo from sidebar since it's now in navbar */}
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <div key={idx} className="relative">
                <SidebarLink link={link} />
                {link.badge && sidebarOpen && (
                  <Badge 
                    variant="default" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-1.5 py-0.5 bg-green-500"
                  >
                    {link.badge}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          {user && (
            <div className="flex flex-col">
              {(sidebarOpen || forceOpen) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 border-t border-neutral-200 dark:border-neutral-700"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="mb-3">
                    <Badge
                      variant={user.status === 'active' ? 'default' : user.status === 'pending' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {user.status?.charAt(0).toUpperCase() + user.status?.slice(1)}
                    </Badge>
                    <Badge variant="secondary" className="ml-2 text-xs bg-green-500">
                      Maid
                    </Badge>
                  </div>
                </motion.div>
              )}
              <SidebarLink
                link={{
                  label: "Logout",
                  href: "#",
                  icon: (
                    <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                  ),
                }}
                className="cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              />
            </div>
          )}
        </div>
      </SidebarBody>
    </Sidebar>
  );
};