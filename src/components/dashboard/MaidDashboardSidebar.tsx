import { Button } from '@/components/ui/button';
import { Calendar, Home, LogOut, MessageCircle, Sparkles } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const navigationItems = [
  { name: 'Dashboard', href: '/maid-dashboard', icon: Home },
  { name: 'My Assignmants', href: '/maid-bookings', icon: Calendar },
  { name: 'Support', href: '/maid-support', icon: MessageCircle },
  
];

export const MaidDashboardSidebar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

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
          </div>
        </div>
        
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
              onClick={() => {
                // Handle logout
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
  );
}; 