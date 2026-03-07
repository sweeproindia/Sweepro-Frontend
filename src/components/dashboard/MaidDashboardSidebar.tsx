import { useNavigate } from 'react-router-dom';
import { Home, Calendar, MessageCircle, LogOut, User, Clock, Shield } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/aceternity-sidebar';
import { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { apiRequest, ApiError, HttpMethod } from '@/services/api';

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
    name: 'Availability',
    href: '/maid-availability',
    icon: <Clock className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
  },
  {
    name: 'Support',
    href: '/maid-support',
    icon: <MessageCircle className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
  },
  {
    name: 'Verification',
    href: '/maid-verification',
    icon: <Shield className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
    conditionalShow: true // Will be shown based on verification status
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: <User className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
  },
];

export const MaidDashboardSidebar = ({ open, setOpen, forceOpen, upcomingBookingsCount = 0 }: MaidDashboardSidebarProps) => {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useUser();
  const { toast } = useToast();

  const pollIntervalRef = useRef<number | undefined>(undefined);
  const hasRefreshedAfterApprovalRef = useRef(false);

  const [verificationStatus, setVerificationStatus] = useState<string>('UNKNOWN');
  const [verificationStatusLoaded, setVerificationStatusLoaded] = useState(false);

  const isMaidVerifiedFromProfile = Boolean((user as any)?.profiles?.maid?.isVerified) || ((user as any)?.profiles?.maid?.status === 'ACTIVE');

  // Fetch verification status on mount
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        setVerificationStatusLoaded(false);
        const result = await apiRequest('/documents/maid-verification-status', {
          method: HttpMethod.GET,
          requiresAuth: true
        });
        if (result.success && (result as any).data) {
          const status = ((result as any).data as any).overallStatus || 'NOT_SUBMITTED';
          setVerificationStatus(status);

          // If approved, refresh user profile to reflect verified status without logout/login
          if (status === 'APPROVED') {
            if (!hasRefreshedAfterApprovalRef.current) {
              hasRefreshedAfterApprovalRef.current = true;
              await refreshUser();
            }

            if (pollIntervalRef.current) {
              window.clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = undefined;
            }
          }
        }
      } catch (error) {
        if (error instanceof ApiError && error.statusCode === 401) {
          navigate('/login');
          return;
        }
        if (error instanceof ApiError && error.statusCode === 403) {
          // Token is valid but not allowed for maid endpoint (likely logged in as non-maid)
          const redirect = user?.role === 'ADMIN' ? '/admin' : '/dashboard';
          navigate(redirect);
          return;
        }
        console.error('Error fetching verification status:', error);
      } finally {
        setVerificationStatusLoaded(true);
      }
    };

    fetchVerificationStatus();

    // Poll while not approved, so admin approval reflects without logout/login
    pollIntervalRef.current = window.setInterval(() => {
      fetchVerificationStatus();
    }, 15000);

    return () => {
      if (pollIntervalRef.current) {
        window.clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = undefined;
      }
    };
  }, [navigate, refreshUser, user?.role]);

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate('/');
  };

  // Filter navigation items based on verification status
  const shouldShowVerification = () => {
    // Show verification link only if:
    // 1. Not verified yet (NOT_SUBMITTED or REJECTED)
    if (isMaidVerifiedFromProfile) return false;
    if (!verificationStatusLoaded) return true;
    return verificationStatus !== 'APPROVED';
  };

  const links = maidNavigationItems
    .filter(item => !item.conditionalShow || shouldShowVerification())
    .map(item => ({
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
                      variant={user.status === 'ACTIVE' ? 'default' : user.status === 'PENDING' ? 'secondary' : 'outline'}
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