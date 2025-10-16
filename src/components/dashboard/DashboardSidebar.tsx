import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, CreditCard, Receipt, MessageCircle, LogOut, Users, Shield, BarChart3, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/aceternity-sidebar';
import { motion } from 'motion/react';

const customerNavigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: <Home className="text-neutral-700 dark:text-neutral-200 h-5 w-5" /> },
  { name: 'My Bookings', href: '/bookings', icon: <Calendar className="text-neutral-700 dark:text-neutral-200 h-5 w-5" /> },
  { name: 'Subscription', href: '/subscription', icon: <CreditCard className="text-neutral-700 dark:text-neutral-200 h-5 w-5" /> },
  { name: 'Monthly Buffer', href: '/monthly-subscription', icon: <Package className="text-neutral-700 dark:text-neutral-200 h-5 w-5" /> },
  { name: 'Payment History', href: '/payments', icon: <Receipt className="text-neutral-700 dark:text-neutral-200 h-5 w-5" /> },
  { name: 'Support', href: '/support', icon: <MessageCircle className="text-neutral-700 dark:text-neutral-200 h-5 w-5" /> },
];

const adminNavigationItems = [
  { name: 'Dashboard', href: '/admin', icon: <Home className="text-neutral-700 dark:text-neutral-200 h-5 w-5" /> },
  { name: 'Bookings', href: '/admin#bookings', icon: <Calendar className="text-neutral-700 dark:text-neutral-200 h-5 w-5" /> },
  { name: 'Subscriptions', href: '/admin#subscriptions', icon: <CreditCard className="text-neutral-700 dark:text-neutral-200 h-5 w-5" /> },
  { name: 'Payments', href: '/admin#payments', icon: <Receipt className="text-neutral-700 dark:text-neutral-200 h-5 w-5" /> },
  { name: 'Users', href: '/admin#users', icon: <Users className="text-neutral-700 dark:text-neutral-200 h-5 w-5" /> },
  { name: 'Maids', href: '/admin#maids', icon: <Shield className="text-neutral-700 dark:text-neutral-200 h-5 w-5" /> },
  { name: 'Analytics', href: '/admin#analytics', icon: <BarChart3 className="text-neutral-700 dark:text-neutral-200 h-5 w-5" /> },
];

interface DashboardSidebarProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  forceOpen?: boolean; // Force sidebar to be open (for mobile)
}

export const DashboardSidebar = ({ open, setOpen, forceOpen }: DashboardSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const { toast } = useToast();

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

  // If forceOpen is true, always pass true to the Sidebar component
  const sidebarOpen = forceOpen ? true : open;

  return (
    <Sidebar open={sidebarOpen} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Removed Logo */}
          <div className="mt-4 flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
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