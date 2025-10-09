import { Button } from '@/components/ui/button';
import { Calendar, Home, LogOut, MessageCircle, Sparkles, Shield } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/aceternity-sidebar';
import { useState } from 'react';
import { motion } from 'motion/react';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const navigationItems = [
  { 
    name: 'Dashboard', 
    href: '/maid-dashboard', 
    icon: <Home className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
  },
  { 
    name: 'My Assignments', 
    href: '/maid-bookings', 
    icon: <Calendar className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
  },
  { 
    name: 'Verification', 
    href: '/maid-verification', 
    icon: <Shield className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
  },
  { 
    name: 'Support', 
    href: '/maid-support', 
    icon: <MessageCircle className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
  },
];

export const MaidDashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    if (logout) {
      logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    }
    navigate('/');
  };

  const links = navigationItems.map(item => ({
    label: item.name,
    href: item.href,
    icon: item.icon,
  }));

  return (
    <div className="rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 max-w-7xl mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden h-screen">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <MaidLogo /> : <MaidLogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            {user && (
              <div className="flex flex-col">
                {open && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 border-t border-neutral-200 dark:border-neutral-700"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-600 rounded-full flex items-center justify-center">
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
                      <Badge variant="secondary" className="ml-2 text-xs">
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
    </div>
  );
};

export const MaidLogo = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="bg-gradient-to-r from-orange-500 to-pink-600 rounded-lg p-2">
        <Sparkles className="h-6 w-6 text-white" />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-bold text-black dark:text-white whitespace-pre"
      >
        SweepPro
      </motion.span>
    </Link>
  );
};

export const MaidLogoIcon = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="bg-gradient-to-r from-orange-500 to-pink-600 rounded-lg p-2">
        <Sparkles className="h-6 w-6 text-white" />
      </div>
    </Link>
  );
};