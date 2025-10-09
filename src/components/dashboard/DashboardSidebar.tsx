import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, CreditCard, Receipt, MessageCircle, LogOut, Sparkles, Users, Shield, BarChart3, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/aceternity-sidebar';
import { useState } from 'react';
import { motion } from 'motion/react';

const customerNavigationItems = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: <Home className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
  },
  { 
    name: 'My Bookings', 
    href: '/bookings', 
    icon: <Calendar className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
  },
  { 
    name: 'Subscription', 
    href: '/subscription', 
    icon: <CreditCard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
  },
  { 
    name: 'Monthly Buffer', 
    href: '/monthly-subscription', 
    icon: <Package className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
  },
  { 
    name: 'Payment History', 
    href: '/payments', 
    icon: <Receipt className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
  },
  { 
    name: 'Support', 
    href: '/support', 
    icon: <MessageCircle className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
  },
];

const adminNavigationItems = [
  { 
    name: 'Dashboard', 
    href: '/admin', 
    icon: <Home className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
  },
  { 
    name: 'Bookings', 
    href: '/admin#bookings', 
    icon: <Calendar className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
  },
  { 
    name: 'Subscriptions', 
    href: '/admin#subscriptions', 
    icon: <CreditCard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
  },
  { 
    name: 'Payments', 
    href: '/admin#payments', 
    icon: <Receipt className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
  },
  { 
    name: 'Users', 
    href: '/admin#users', 
    icon: <Users className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
  },
  { 
    name: 'Maids', 
    href: '/admin#maids', 
    icon: <Shield className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
  },
  { 
    name: 'Analytics', 
    href: '/admin#analytics', 
    icon: <BarChart3 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
  },
];

export const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
  // Determine if user is on admin dashboard
  const isAdmin = location.pathname.startsWith('/admin');
  const navigationItems = isAdmin ? adminNavigationItems : customerNavigationItems;
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate('/');
  };

  const links = navigationItems.map(item => ({
    label: item.name,
    href: item.href,
    icon: item.icon,
  }));

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {open ? <Logo /> : <LogoIcon />}
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
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
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
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </Badge>
                    {isAdmin && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Admin
                      </Badge>
                    )}
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

export const Logo = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-2">
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

export const LogoIcon = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-2">
        <Sparkles className="h-6 w-6 text-white" />
      </div>
    </Link>
  );
};