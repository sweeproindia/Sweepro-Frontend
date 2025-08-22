import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, CreditCard, Receipt, MessageCircle, LogOut, Sparkles, Users, Shield, BarChart3, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

const customerNavigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'My Bookings', href: '/bookings', icon: Calendar },
  { name: 'Subscription', href: '/subscription', icon: CreditCard },
  { name: 'Payment History', href: '/payments', icon: Receipt },
  { name: 'Support', href: '/support', icon: MessageCircle },
];

const adminNavigationItems = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Bookings', href: '/admin#bookings', icon: Calendar },
  { name: 'Subscriptions', href: '/admin#subscriptions', icon: CreditCard },
  { name: 'Payments', href: '/admin#payments', icon: Receipt },
  { name: 'Users', href: '/admin#users', icon: Users },
  { name: 'Maids', href: '/admin#maids', icon: Shield },
  { name: 'Analytics', href: '/admin#analytics', icon: BarChart3 },
];

export const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const { toast } = useToast();
  
  // Determine if user is on admin dashboard
  const isAdmin = location.pathname.startsWith('/admin');
  const navigationItems = isAdmin ? adminNavigationItems : customerNavigationItems;
  
  const isActive = (path: string) => {
    if (path.includes('#')) {
      // Handle hash-based navigation for admin tabs
      const [basePath, hash] = path.split('#');
      if (location.pathname === basePath) {
        // If no hash is set, default to first tab (bookings)
        if (!location.hash && hash === 'bookings') {
          return true;
        }
        return location.hash === `#${hash}`;
      }
      return false;
    }
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate('/');
  };

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex min-h-0 flex-1 flex-col bg-card border-r border-border">
        {/* Logo */}
        <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-hero rounded-lg p-2">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">SweepPro</span>
            {isAdmin && (
              <Badge variant="secondary" className="ml-2 text-xs">
                Admin
              </Badge>
            )}
          </div>
        </div>
        
        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="mt-2">
              <Badge 
                variant={user.status === 'active' ? 'default' : user.status === 'pending' ? 'secondary' : 'outline'}
                className="text-xs"
              >
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </Badge>
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigationItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                <item.icon
                  className="mr-3 h-5 w-5 flex-shrink-0"
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
            ))}
          </nav>
          
          {/* Logout Button */}
          <div className="p-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};