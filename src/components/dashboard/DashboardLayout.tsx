import { useState } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Menu, X, Bell, User, LogOut, Sparkles } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Determine if user is on admin dashboard
  const isAdmin = location.pathname.startsWith('/admin');
  
  // Navigation items based on user type
  const customerNavigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'My Bookings', href: '/bookings', icon: '📅' },
    { name: 'Subscription', href: '/subscription', icon: '💳' },
    { name: 'Payment History', href: '/payments', icon: '🧾' },
    { name: 'Support', href: '/support', icon: '💬' },
  ];

  const adminNavigationItems = [
    { name: 'Dashboard', href: '/admin', icon: '🏠' },
    { name: 'Bookings', href: '/admin#bookings', icon: '📅' },
    { name: 'Subscriptions', href: '/admin#subscriptions', icon: '💳' },
    { name: 'Payments', href: '/admin#payments', icon: '🧾' },
    { name: 'Users', href: '/admin#users', icon: '👥' },
    { name: 'Maids', href: '/admin#maids', icon: '🛡️' },
    { name: 'Analytics', href: '/admin#analytics', icon: '📊' },
  ];

  const navigationItems = isAdmin ? adminNavigationItems : customerNavigationItems;

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Mobile sidebar */}
      <div className={`lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 flex z-40">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)} />
          
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-card">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="text-white hover:text-white"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            {/* Mobile sidebar content */}
            <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-border">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-hero rounded-lg p-2">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">CleanEase</span>
                {isAdmin && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Admin
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `group flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`
                    }
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </NavLink>
                ))}
              </nav>
              
              {/* Logout Button */}
              <div className="p-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setSidebarOpen(false);
                    window.location.href = '/';
                  }}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <DashboardSidebar />

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden lg:ml-64">
        {/* Top navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-card border-b border-border shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-muted-foreground focus:outline-none lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1" />
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full text-xs text-primary-foreground flex items-center justify-center">
                  3
                </span>
              </Button>
              
              {/* Profile */}
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span className="hidden md:block text-sm font-medium">
                  {isAdmin ? 'Admin User' : 'John Doe'}
                </span>
              </Button>
            </div>
          </div>
        </div>

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