import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, CreditCard, Receipt, Users, Shield, BarChart3, Package, LogOut, Sparkles, Clock, Settings, Pause, MessageSquare, TrendingUp, Lock, UserCog, FileCheck, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/aceternity-sidebar';
import { useState } from 'react';
import { motion } from 'motion/react';

interface AdminDashboardSidebarProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  forceOpen?: boolean;
  pendingBookingsCount?: number;
}

const iconClass = "text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0";

interface NavSection {
  label: string;
  items: {
    name: string;
    href: string;
    icon: React.ReactNode;
    showBadge?: boolean;
  }[];
}

const adminNavigationSections: NavSection[] = [
  {
    label: 'Main',
    items: [
      { name: 'Overview', href: '/admin#overview', icon: <Home className={iconClass} /> },
    ],
  },
  {
    label: 'Operations',
    items: [
      { name: 'Automatic Bookings', href: '/admin#bookings', icon: <Calendar className={iconClass} /> },
      { name: 'Pending Assignments', href: '/admin#pending-bookings', icon: <Clock className={iconClass} />, showBadge: true },
    ],
  },
  {
    label: 'People',
    items: [
      { name: 'Customers', href: '/admin#users', icon: <Users className={iconClass} /> },
      { name: 'Homecare Partners', href: '/admin#maids', icon: <Shield className={iconClass} /> },
      { name: 'Verification', href: '/admin#maid-verification', icon: <FileCheck className={iconClass} /> },
    ],
  },
  {
    label: 'Finance',
    items: [
      { name: 'Subscriptions', href: '/admin#subscriptions', icon: <Package className={iconClass} /> },
      { name: 'Payments', href: '/admin#payments', icon: <CreditCard className={iconClass} /> },
      { name: 'Plans', href: '/admin#plans', icon: <Settings className={iconClass} /> },
    ],
  },
  {
    label: 'Tools',
    items: [
      { name: 'Buffer Management', href: '/admin#buffer-management', icon: <Pause className={iconClass} /> },
      { name: 'Feedback', href: '/admin/feedback', icon: <MessageSquare className={iconClass} /> },
    ],
  },
];

export const AdminDashboardSidebar = ({ open, setOpen, forceOpen, pendingBookingsCount = 0 }: AdminDashboardSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const { toast } = useToast();

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate('/');
  };

  // If forceOpen is true, always pass true to the Sidebar component
  const sidebarOpen = forceOpen ? true : open;

  // Determine active link
  const currentHash = location.hash.replace('#', '');
  const currentPath = location.pathname;

  const isLinkActive = (href: string) => {
    if (href.includes('#')) {
      const hash = href.split('#')[1];
      return currentPath.startsWith('/admin') && currentHash === hash;
    }
    return currentPath === href;
  };

  return (
    <Sidebar open={sidebarOpen} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-6">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Admin Panel Header */}
          {(sidebarOpen || forceOpen) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-3 mb-2 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl border border-slate-700/50"
            >
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Lock className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-bold text-white tracking-wide">Sweepro Admin</span>
              </div>
              <p className="text-xs text-slate-400 ml-9">Management Console</p>
            </motion.div>
          )}

          {/* Grouped Navigation */}
          <div className="mt-2 flex flex-col gap-1">
            {adminNavigationSections.map((section, sIdx) => (
              <div key={sIdx}>
                {/* Section Label */}
                {(sidebarOpen || forceOpen) && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-4 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500"
                  >
                    {section.label}
                  </motion.p>
                )}
                {!sidebarOpen && !forceOpen && sIdx > 0 && (
                  <div className="mx-3 my-2 border-t border-neutral-200 dark:border-neutral-700" />
                )}
                {section.items.map((item, idx) => {
                  const active = isLinkActive(item.href);
                  return (
                    <div key={idx} className="relative">
                      <SidebarLink
                        link={{
                          label: item.name,
                          href: item.href,
                          icon: item.icon,
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          if (item.href.includes('#')) {
                            // Use window.location for hash navigation to ensure
                            // React Router detects the hash change reliably
                            window.location.href = item.href;
                          } else {
                            navigate(item.href);
                          }
                          if (forceOpen && setOpen) setOpen(false);
                        }}
                        className={active ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium rounded-lg' : ''}
                      />
                      {item.showBadge && pendingBookingsCount > 0 && sidebarOpen && (
                        <Badge
                          variant="destructive"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-1.5 py-0.5 min-w-[20px] flex items-center justify-center"
                        >
                          {pendingBookingsCount}
                        </Badge>
                      )}
                      {/* Active indicator bar */}
                      {active && (
                        <motion.div
                          layoutId="admin-sidebar-active"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* User Profile Section */}
        <div>
          {user && (
            <div className="flex flex-col">
              {(sidebarOpen || forceOpen) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 border-t border-neutral-200 dark:border-neutral-700"
                >
                  <Link to="/admin/profile" className="block group" onClick={() => {
                    if (forceOpen && setOpen) setOpen(false);
                  }}>
                    <div className="flex items-center space-x-3 mb-3 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center ring-2 ring-blue-100 dark:ring-blue-900/50">
                        <span className="text-white text-sm font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {user.name}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge
                      className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100"
                    >
                      {user.status === 'ACTIVE' ? 'Online' : user.status}
                    </Badge>
                    <Badge className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100">
                      Administrator
                    </Badge>
                  </div>
                </motion.div>
              )}
              <div onClick={handleLogout} className="cursor-pointer">
                <SidebarLink
                  link={{
                    label: "Logout",
                    href: "#",
                    icon: (
                      <LogOut className="text-red-500 h-5 w-5 flex-shrink-0" />
                    ),
                  }}
                  className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </SidebarBody>
    </Sidebar>
  );
};
