import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import {
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  Package,
  Shield,
  TrendingUp,
  Users,
  AlertCircle,
  Settings,
  Pause,
  ArrowRight
} from 'lucide-react';
import { Booking } from '../services/bookingService';
import { SubscriptionService, Subscription, SubscriptionPlan } from '../services/subscriptionService';
import { Payment } from '../services/paymentService';
import { apiRequest, HttpMethod } from '../services/api';
import { useUser } from '../contexts/UserContext';
import { Link } from 'react-router-dom';
import EditPlanDialog from '../components/admin/EditPlanDialog';
import EditUserDialog from '../components/admin/EditUserDialog';
import { AdminMaidVerificationSection } from '../components/dashboard/AdminMaidVerificationSection';
import { AdminBufferManagementSection } from '../components/dashboard/AdminBufferManagementSection';
import { AdminUsersSection } from '../components/dashboard/AdminUsersSection';
import { AdminMaidsSection } from '../components/dashboard/AdminMaidsSection';
import { AdminAutomaticAssignmentsSection } from '../components/dashboard/AdminAutomaticAssignmentsSection';
import { EnhancedAdminBookingsSection } from '../components/dashboard/AdminBookingsSection';
import { AdminSubscriptionsSection } from '../components/dashboard/AdminSubscriptionsSection';
import { AdminPaymentsSection } from '../components/dashboard/AdminPaymentsSection';
import { AdminAutomaticBookingsSection } from '../components/dashboard/AdminAutomaticBookingsSection';
import { AdminDashboardLayout } from '../components/dashboard/AdminDashboardLayout';

// User interface from backend
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'MAID' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BLACKLISTED';
  address?: string;
  timeSlot?: string;
  createdAt: string;
}

// Maid interface from backend
interface Maid {
  id: string;
  userId: string;
  skills: string[];
  languages: string[];
  rating: number;
  totalRatings: number;
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BLACKLISTED' | 'ON_LEAVE';
  completedBookings: number;
  weeklyOffDay?: string | null;
  availability?: Record<string, any> | null;
  user: User;
}

const WEEKDAY_ENUM = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const getTodayWeekday = (): string => {
  return WEEKDAY_ENUM[new Date().getDay()];
};

const computeMaidDisplayStatus = (maid: Maid): 'active' | 'inactive' | 'on_leave' => {
  const weeklyOffDay = maid.weeklyOffDay ? maid.weeklyOffDay.toUpperCase() : null;
  const today = getTodayWeekday();
  const availabilityObj = maid.availability && typeof maid.availability === 'object' ? maid.availability : {};
  const isUnavailable = availabilityObj && availabilityObj.isAvailable === false;
  const isWeeklyOffToday = weeklyOffDay ? weeklyOffDay === today : false;

  if (isWeeklyOffToday && isUnavailable) {
    return 'inactive';
  }

  if (isWeeklyOffToday || isUnavailable) {
    return 'on_leave';
  }

  return 'active';
};

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useUser();



  const [activeSection, setActiveSection] = useState(() => {
    const hash = location.hash.replace('#', '');
    if (hash && ['overview', 'bookings', 'pending-bookings', 'users', 'maids', 'maid-verification', 'subscriptions', 'buffer-management', 'automatic-assignments', 'payments', 'plans'].includes(hash)) {
      return hash;
    }
    return 'overview';
  });

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [availableMaids, setAvailableMaids] = useState<Maid[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [maids, setMaids] = useState<Maid[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [analyticsData, setAnalyticsData] = useState({
    totalBookings: 0,
    totalCustomers: 0,
    totalMaids: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    activeSubscriptions: 0,
    completedPayments: 0,
    pendingPayments: 0
  });
  const [subscriptionFilter, setSubscriptionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [assigningBooking, setAssigningBooking] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isEditPlanDialogOpen, setIsEditPlanDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);



  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && ['overview', 'bookings', 'pending-bookings', 'users', 'maids', 'maid-verification', 'subscriptions', 'buffer-management', 'automatic-assignments', 'payments', 'plans'].includes(hash)) {
      setActiveSection(hash);
    }
  }, [location.hash]);

  useEffect(() => {
    // Only fetch admin data if user is loaded and is an ADMIN
    if (user && user.role === 'ADMIN') {
      console.log('✅ Admin user verified, fetching admin data...');
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    // Additional safety check
    if (!user || user.role !== 'ADMIN') {
      console.error('🚨 CRITICAL: Non-admin user attempting to fetch admin data. Role:', user?.role);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('📊 Fetching admin dashboard data for:', user.email);
      // Fetch all admin data in parallel
      const [usersResponse, bookingsResponse, pendingBookingsResponse, subscriptionsResponse, paymentsResponse, plansResponse, statsResponse, availableMaidsResponse, maidsResponse] = await Promise.allSettled([
        apiRequest('/users', { method: HttpMethod.GET, requiresAuth: true }),
        apiRequest('/bookings', { method: HttpMethod.GET, requiresAuth: true }),
        apiRequest('/admin/pending-bookings', { method: HttpMethod.GET, requiresAuth: true }),
        apiRequest('/admin/subscriptions', { method: HttpMethod.GET, requiresAuth: true }),
        apiRequest('/admin/payments', { method: HttpMethod.GET, requiresAuth: true }),
        SubscriptionService.getSubscriptionPlans(),
        apiRequest('/admin/stats', { method: HttpMethod.GET, requiresAuth: true }),
        apiRequest('/admin/available-maids', { method: HttpMethod.GET, requiresAuth: true }),
        apiRequest('/maids', { method: HttpMethod.GET, requiresAuth: true })
      ]);

      // Handle users data
      if (usersResponse.status === 'fulfilled' && usersResponse.value.success) {
        const rawUsers = usersResponse.value.data as any;
        const usersData: User[] = Array.isArray(rawUsers) ? rawUsers : (rawUsers?.users || rawUsers?.data || []);
        setUsers(usersData);

        // Separate maids from users
        const maidsData: Maid[] = usersData
          .filter((u: User) => u.role === 'MAID')
          .map((u: User) => ({
            id: u.id,
            userId: u.id,
            user: u,
            skills: [],
            languages: ['English'],
            rating: 0,
            totalRatings: 0,
            status: 'ACTIVE',
            completedBookings: 0,
            availability: null,
            weeklyOffDay: null
          }));
        setMaids(maidsData);
      } else if (usersResponse.status === 'rejected') {
        console.error('Failed to fetch users');
        setUsers([]);
      }

      // Prefer full maid profiles from /maids
      if (maidsResponse.status === 'fulfilled' && (maidsResponse.value as any)?.success !== false) {
        const raw = (maidsResponse.value as any).data ?? (maidsResponse.value as any);
        const arr = Array.isArray(raw) ? raw : (raw?.maids || raw?.data || []);
        const mapped: Maid[] = arr.map((u: any) => ({
          id: u.id,
          userId: u.id,
          user: {
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            role: 'MAID',
            status: u.status || 'ACTIVE',
            address: u.address,
            timeSlot: u.timeSlot,
            createdAt: u.createdAt,
          } as User,
          skills: u.maidProfile?.skills || [],
          languages: u.maidProfile?.languages || ['English'],
          rating: u.maidProfile?.rating || 0,
          totalRatings: u.maidProfile?.totalRatings || 0,
          status: (u.maidProfile?.status || 'ACTIVE') as Maid['status'],
          completedBookings: u.maidProfile?.completedBookings || 0,
          weeklyOffDay: u.maidProfile?.weeklyOffDay ?? null,
          availability: (u.maidProfile?.availability && typeof u.maidProfile.availability === 'object') ? u.maidProfile.availability : null
        }));
        setMaids(mapped);
      }

      // Handle bookings data
      if (bookingsResponse.status === 'fulfilled' && bookingsResponse.value.success) {
        const raw = bookingsResponse.value.data as any;
        const bookingsData = Array.isArray(raw) ? raw : (raw?.bookings || raw?.data || []);
        setBookings(bookingsData);
      } else if (bookingsResponse.status === 'rejected') {
        console.error('Failed to fetch bookings');
        setBookings([]);
      }

      // Handle pending bookings data
      if (pendingBookingsResponse.status === 'fulfilled' && pendingBookingsResponse.value && (pendingBookingsResponse.value as any).success !== false) {
        const raw = (pendingBookingsResponse.value as any).data ?? (pendingBookingsResponse.value as any);
        const pendingBookingsData = Array.isArray(raw) ? raw : (raw?.bookings || raw?.data || []);
        setPendingBookings(pendingBookingsData);
      } else if (pendingBookingsResponse.status === 'rejected') {
        console.error('Failed to fetch pending bookings');
        setPendingBookings([]);
      }

      // Handle available maids data (map to Maid shape)
      if (availableMaidsResponse.status === 'fulfilled' && availableMaidsResponse.value && (availableMaidsResponse.value as any).success !== false) {
        const raw = (availableMaidsResponse.value as any).data ?? (availableMaidsResponse.value as any);
        const arr = Array.isArray(raw) ? raw : (raw?.maids || raw?.data || []);
        const mapped: Maid[] = arr.map((u: any) => ({
          id: u.id,
          userId: u.id,
          user: {
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            role: 'MAID',
            status: u.status || 'ACTIVE',
            address: u.address,
            timeSlot: u.timeSlot,
            createdAt: u.createdAt,
          } as User,
          skills: u.maidProfile?.skills || [],
          languages: u.maidProfile?.languages || ['English'],
          rating: u.maidProfile?.rating || 0,
          totalRatings: u.maidProfile?.totalRatings || 0,
          status: (u.maidProfile?.status || 'ACTIVE') as Maid['status'],
          completedBookings: u.maidProfile?.completedBookings || 0,
          weeklyOffDay: u.maidProfile?.weeklyOffDay ?? null,
          availability: (u.maidProfile?.availability && typeof u.maidProfile.availability === 'object') ? u.maidProfile.availability : null
        }));
        setAvailableMaids(mapped);
      }

      // Handle subscriptions
      if (subscriptionsResponse.status === 'fulfilled' && subscriptionsResponse.value.success) {
        const raw = subscriptionsResponse.value.data as any;
        const subscriptionsData = Array.isArray(raw) ? raw : (raw?.subscriptions || raw?.data || []);
        setSubscriptions(subscriptionsData);
      }

      // Handle payments
      if (paymentsResponse.status === 'fulfilled' && paymentsResponse.value.success) {
        const raw = paymentsResponse.value.data as any;
        const paymentsData = Array.isArray(raw) ? raw : (raw?.payments || raw?.data || []);
        setPayments(paymentsData);
      }

      // Handle subscription plans
      if (plansResponse.status === 'fulfilled' && plansResponse.value.success) {
        const raw = plansResponse.value.data as any;
        const plansData = Array.isArray(raw) ? raw : (raw?.plans || raw?.data || []);
        setSubscriptionPlans(plansData);
      }

      // Handle stats data
      if (statsResponse.status === 'fulfilled' && statsResponse.value.success) {
        const stats = (statsResponse.value.data as any).overview;
        setAnalyticsData({
          totalBookings: stats?.totalBookings || 0,
          totalCustomers: stats?.totalCustomers || 0,
          totalMaids: stats?.totalMaids || 0,
          totalRevenue: stats?.totalRevenue || 0,
          pendingBookings: stats?.pendingBookings || 0,
          activeSubscriptions: stats?.activeSubscriptions || 0,
          completedPayments: stats?.completedPayments || 0,
          pendingPayments: stats?.pendingPayments || 0,
        });
      } else {
        // Fallback to calculate analytics from loaded data
        calculateAnalytics();
      }

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = () => {
    const totalCustomers = users.filter(user => user.role === 'CUSTOMER').length;
    const totalMaids = users.filter(user => user.role === 'MAID').length;
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
    const activeSubscriptions = subscriptions.filter(s => s.status === 'ACTIVE').length;
    const completedPayments = payments.filter(p => p.status === 'COMPLETED').length;
    const pendingPayments = payments.filter(p => p.status === 'PENDING').length;
    const totalRevenue = payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.finalAmount, 0);

    setAnalyticsData({
      totalBookings,
      totalCustomers,
      totalMaids,
      totalRevenue,
      pendingBookings,
      activeSubscriptions,
      completedPayments,
      pendingPayments
    });
  };

  const handleSectionChange = (value: string) => {
    setActiveSection(value);
    navigate(`#${value}`);
  };

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      await apiRequest(`/users/${userId}/status`, {
        method: HttpMethod.PUT,
        body: { status },
        requiresAuth: true
      });

      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, status: status as any } : user
      ));

      toast({
        title: 'Success',
        description: 'User status updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive'
      });
    }
  };

  const assignMaidToBooking = async (bookingId: string, maidId: string) => {
    setAssigningBooking(bookingId);
    try {
      const response = await apiRequest('/admin/assign-maid', {
        method: HttpMethod.POST,
        body: { bookingId, maidId },
        requiresAuth: true
      });

      if (response.success) {
        // Remove from pending bookings
        setPendingBookings(prev => prev.filter(b => b.id !== bookingId));

        // Refresh bookings data
        const bookingsResponse = await apiRequest('/bookings', {
          method: HttpMethod.GET,
          requiresAuth: true
        });
        if (bookingsResponse.success) {
          const bookingsData = Array.isArray(bookingsResponse.data) ?
            bookingsResponse.data :
            bookingsResponse.data?.bookings || [];
          setBookings(bookingsData);
        }

        toast({
          title: 'Success',
          description: 'Homecare partner assigned to booking successfully'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign homecare partner to booking',
        variant: 'destructive'
      });
    } finally {
      setAssigningBooking(null);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (!subscriptionFilter) return true;
    return sub.plan?.name.toLowerCase().includes(subscriptionFilter.toLowerCase()) ||
      sub.customer?.user?.name.toLowerCase().includes(subscriptionFilter.toLowerCase());
  });

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setIsEditPlanDialogOpen(true);
  };

  const handleEditPlanSuccess = () => {
    fetchAdminData(); // Refresh data
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditUserDialogOpen(true);
  };

  const handleEditUserSuccess = () => {
    fetchAdminData(); // Refresh data
  };

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate('/');
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        {/* Page Header Skeleton */}
        <div className="mb-6">
          <div className="skeleton-glass h-10 w-64 rounded-lg"></div>
          <div className="skeleton-glass h-6 w-96 rounded-lg mt-2"></div>
        </div>

        {/* Analytics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-6 space-y-3">
              <div className="skeleton-glass h-4 w-24 rounded-lg"></div>
              <div className="skeleton-glass h-8 w-16 rounded-lg"></div>
              <div className="skeleton-glass h-3 w-32 rounded-lg"></div>
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="skeleton-glass h-6 w-48 rounded-lg mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-5 gap-4">
                <div className="skeleton-glass h-4 w-full rounded-lg"></div>
                <div className="skeleton-glass h-4 w-full rounded-lg"></div>
                <div className="skeleton-glass h-4 w-full rounded-lg"></div>
                <div className="skeleton-glass h-4 w-full rounded-lg"></div>
                <div className="skeleton-glass h-4 w-full rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div className="skeleton-glass h-6 w-32 rounded-lg"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <div className="skeleton-glass h-4 w-24 rounded-lg"></div>
                    <div className="skeleton-glass h-4 w-16 rounded-lg"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </AdminDashboardLayout>
    );
  }

  // Restrict access to ADMIN users only
  if (!user) {
    // Show loading while user context initializes
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminDashboardLayout>
    );
  }

  if (user.role !== 'ADMIN') {
    return (
      <AdminDashboardLayout>
        <div className="text-center p-8">
          <AlertCircle className="mx-auto mb-4 text-yellow-500" size={48} />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            This dashboard is only available for administrators. Please navigate to your appropriate dashboard.
          </p>
          <div className="space-x-4">
            {user.role === 'CUSTOMER' && (
              <Link to="/dashboard">
                <Button>Go to Customer Dashboard</Button>
              </Link>
            )}
            {user.role === 'MAID' && (
              <Link to="/maid-dashboard">
                <Button>Go to Homecare Partner Dashboard</Button>
              </Link>
            )}
            <Link to="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {activeSection === 'overview' && 'Dashboard Overview'}
          {activeSection === 'bookings' && 'All Bookings'}
          {activeSection === 'pending-bookings' && 'Automatic Booking Management'}
          {activeSection === 'users' && 'Customer Management'}
          {activeSection === 'maids' && 'Homecare Partner Management'}
          {activeSection === 'maid-verification' && 'Homecare Partner Verification'}
          {activeSection === 'subscriptions' && 'Subscriptions'}
          {activeSection === 'buffer-management' && 'Buffer Period Management'}
          {activeSection === 'automatic-assignments' && 'Automatic Assignment System'}
          {activeSection === 'payments' && 'Payment Management'}
          {activeSection === 'plans' && 'Subscription Plans'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {activeSection === 'overview' && 'Comprehensive platform management and analytics'}
          {activeSection === 'bookings' && 'Manage all customer bookings and assignments'}
          {activeSection === 'pending-bookings' && 'Assign homecare parers to pending bookings'}
          {activeSection === 'users' && 'Manage customer accounts and profiles'}
          {activeSection === 'maids' && 'Manage service providers and performance'}
          {activeSection === 'maid-verification' && 'Review and manage homecare partner verification requests'}
          {activeSection === 'subscriptions' && 'Monitor subscription plans and billing'}
          {activeSection === 'buffer-management' && 'Review buffer requests and manage service interruptions'}
          {activeSection === 'automatic-assignments' && 'Monitor and manage automatic assignment requests based on customer time slots'}
          {activeSection === 'payments' && 'Monitor all payment activities and revenue'}
          {activeSection === 'plans' && 'Manage available service plans and pricing'}
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Overview Section */}
        {activeSection === 'overview' && (
          <>
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="dashboard-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.totalBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    {analyticsData.pendingBookings} pending approval
                  </p>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.totalCustomers}</div>
                  <p className="text-xs text-muted-foreground">
                    {analyticsData.totalMaids} service providers
                  </p>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{analyticsData.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {analyticsData.completedPayments} completed payments
                  </p>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.activeSubscriptions}</div>
                  <p className="text-xs text-muted-foreground">
                    {subscriptions.length} total subscriptions
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Access Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button onClick={() => handleSectionChange('users')} className="group p-4 rounded-xl border bg-card hover:bg-blue-50 hover:border-blue-200 transition-all text-left">
                <Users className="h-6 w-6 text-blue-600 mb-2" />
                <p className="font-semibold text-sm">Customers</p>
                <p className="text-xs text-muted-foreground">{users.filter(u => u.role === 'CUSTOMER').length} total</p>
                <ArrowRight className="h-4 w-4 text-muted-foreground mt-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => handleSectionChange('maids')} className="group p-4 rounded-xl border bg-card hover:bg-green-50 hover:border-green-200 transition-all text-left">
                <Shield className="h-6 w-6 text-green-600 mb-2" />
                <p className="font-semibold text-sm">Homecare Partners</p>
                <p className="text-xs text-muted-foreground">{maids.length} total</p>
                <ArrowRight className="h-4 w-4 text-muted-foreground mt-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => handleSectionChange('bookings')} className="group p-4 rounded-xl border bg-card hover:bg-purple-50 hover:border-purple-200 transition-all text-left">
                <Calendar className="h-6 w-6 text-purple-600 mb-2" />
                <p className="font-semibold text-sm">All Bookings</p>
                <p className="text-xs text-muted-foreground">{bookings.length} total</p>
                <ArrowRight className="h-4 w-4 text-muted-foreground mt-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => handleSectionChange('payments')} className="group p-4 rounded-xl border bg-card hover:bg-amber-50 hover:border-amber-200 transition-all text-left">
                <CreditCard className="h-6 w-6 text-amber-600 mb-2" />
                <p className="font-semibold text-sm">Payments</p>
                <p className="text-xs text-muted-foreground">{payments.length} total</p>
                <ArrowRight className="h-4 w-4 text-muted-foreground mt-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Maid Status Summary + Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Maid Status Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="h-5 w-5" />
                    Partner Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-800">Active</span>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        {maids.filter(m => computeMaidDisplayStatus(m) === 'active').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <span className="text-sm font-medium text-yellow-800">On Leave</span>
                      <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                        {maids.filter(m => computeMaidDisplayStatus(m) === 'on_leave').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-800">Inactive</span>
                      <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                        {maids.filter(m => computeMaidDisplayStatus(m) === 'inactive').length}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => handleSectionChange('maids')}>
                      Manage Partners
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Latest Pending Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Pending Bookings
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleSectionChange('pending-bookings')}>
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingBookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{booking.service?.name || 'Service'}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {booking.customer?.name || 'Customer'}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="text-xs font-medium">
                            {new Date(booking.scheduledAt).toLocaleDateString()}
                          </p>
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 text-xs">
                            Pending
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {pendingBookings.length === 0 && (
                      <p className="text-center text-muted-foreground py-4 text-sm">No pending bookings</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Payments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-5 w-5" />
                    Recent Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {payments.slice(0, 4).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">₹{payment.finalAmount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {payment.paymentMethod} • {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={payment.status === 'COMPLETED' ? 'default' : 'outline'} className="text-xs">
                          {payment.status}
                        </Badge>
                      </div>
                    ))}
                    {payments.length === 0 && (
                      <p className="text-center text-muted-foreground py-4 text-sm">No recent payments</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Recently Joined Customers
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleSectionChange('users')}>
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {users
                    .filter(u => u.role === 'CUSTOMER')
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 3)
                    .map(customer => (
                      <div key={customer.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{customer.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(customer.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={customer.status === 'ACTIVE' ? 'default' : 'outline'} className="text-xs flex-shrink-0">
                          {customer.status}
                        </Badge>
                      </div>
                    ))}
                  {users.filter(u => u.role === 'CUSTOMER').length === 0 && (
                    <p className="text-center text-muted-foreground py-4 col-span-3 text-sm">No customers yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Maids Section */}
        {activeSection === 'maids' && (
          <AdminMaidsSection
            allMaids={maids.map(m => ({
              id: m.id,
              name: m.user.name,
              email: m.user.email,
              phone: m.user.phone,
              address: m.user.address || '',
              experience: `${m.completedBookings} bookings completed`,
              specializations: m.skills,
              rating: m.rating,
              status: computeMaidDisplayStatus(m),
              rawStatus: (m.status || 'INACTIVE') as any,
              availability: (m.availability && typeof m.availability === 'object') ? m.availability : null,
              totalBookings: m.completedBookings,
              joinDate: m.user.createdAt,
              weeklyOffDay: m.weeklyOffDay || null
            }))}
            onAddMaid={(maidData) => {
              toast({
                title: 'Homecare Partner Added',
                description: 'New homecare partner has been added successfully'
              });
            }}
            onVerifyMaid={(maidId) => updateUserStatus(maidId, 'ACTIVE')}
          />
        )}

        {/* Automatic Bookings Section (Pending) */}
        {activeSection === 'pending-bookings' && (
          <AdminAutomaticBookingsSection
            availableMaids={availableMaids.map(m => ({
              id: m.userId,
              name: m.user.name,
              email: m.user.email,
              phone: m.user.phone,
              rating: m.rating,
              skills: m.skills,
              completedBookings: m.completedBookings
            }))}
            pendingManualBookings={bookings.filter((b: any) => b.status === 'PENDING').map((b: any) => ({
              ...b,
              serviceAddress: b.serviceAddress || b.customer?.address || '',
              totalAmount: b.totalAmount ?? 0,
              finalAmount: b.finalAmount ?? b.totalAmount ?? 0,
              service: b.service || {
                id: b.serviceId,
                name: b.service?.name || 'Service',
                description: b.service?.description || '',
                basePrice: b.service?.basePrice || 0,
              },
              customer: b.customer || {
                id: b.customerId,
                name: b.customer?.name || 'Customer',
                email: b.customer?.email || '',
                phone: b.customer?.phone || '',
              },
            })) as any}
            onAssignManualMaid={assignMaidToBooking}
            onRefreshData={fetchAdminData}
          />
        )}

        {/* Bookings Section */}
        {activeSection === 'bookings' && (
          <EnhancedAdminBookingsSection
            bookings={bookings.map((b: any) => ({
              ...b,
              serviceAddress: b.serviceAddress || b.customer?.address || '',
              totalAmount: b.totalAmount ?? 0,
              finalAmount: b.finalAmount ?? b.totalAmount ?? 0,
              service: b.service || {
                id: b.serviceId,
                name: b.service?.name || 'Service',
                description: b.service?.description || '',
                basePrice: b.service?.basePrice || 0,
              },
              customer: b.customer || {
                id: b.customerId,
                name: b.customer?.name || 'Customer',
                email: b.customer?.email || '',
                phone: b.customer?.phone || '',
              },
            })) as any}
            availableMaids={availableMaids.map((m: any) => ({
              id: m.userId || m.id,
              name: m.user?.name || m.name,
              email: m.user?.email || m.email,
              phone: m.user?.phone || m.phone,
              rating: m.rating,
              status: m.status,
              completedBookings: m.completedBookings,
              skills: m.skills,
            })) as any}
            onAssignMaid={assignMaidToBooking}
            onRefreshBookings={fetchAdminData}
          />
        )}

        {/* Users Section */}
        {activeSection === 'users' && (
          <AdminUsersSection
            users={users.filter(u => u.role === 'CUSTOMER').map(u => ({
              id: u.id,
              name: u.name,
              email: u.email,
              phone: u.phone,
              address: (u as any).address,
              timeSlot: (u as any).timeSlot,
              createdAt: u.createdAt,
              joinDate: u.createdAt,
              status: u.status === 'ACTIVE' ? 'active' : u.status === 'INACTIVE' ? 'suspended' : 'pending',
              totalBookings: 0, // This would need to be calculated from bookings
              totalSpent: 0, // This would need to be calculated from payments
              lastActive: u.createdAt
            }))}
            availableMaids={availableMaids.map(m => ({
              id: m.userId,
              name: m.user.name,
              email: m.user.email,
              phone: m.user.phone,
              rating: m.rating,
              skills: m.skills,
              completedBookings: m.completedBookings
            }))}
            onVerifyUser={(userId) => updateUserStatus(userId, 'ACTIVE')}
            onRefreshData={fetchAdminData}
          />
        )}

        {/* Subscriptions Section */}
        {activeSection === 'subscriptions' && (
          <AdminSubscriptionsSection
            subscriptions={subscriptions.map(s => ({
              id: s.id,
              customerName: s.customer?.user?.name || 'N/A',
              customerEmail: s.customer?.user?.email || 'N/A',
              plan: s.plan?.name || 'N/A',
              status: s.status === 'ACTIVE' ? 'active' : s.status === 'EXPIRED' ? 'expired' : 'cancelled',
              startDate: s.startDate,
              endDate: s.endDate,
              price: s.amount,
              usage: 0, // This would need to be calculated
              limit: s.plan?.sessionsPerMonth || 0,
              nextBilling: s.endDate
            }))}
          />
        )}

        {/* Payments Section */}
        {activeSection === 'payments' && (
          <AdminPaymentsSection
            payments={payments.map(p => ({
              id: p.id,
              customerName: p.customer?.name || 'N/A',
              customerEmail: p.customer?.email || 'N/A',
              amount: p.finalAmount,
              method: p.paymentMethod,
              status: p.status === 'COMPLETED' ? 'completed' : p.status === 'PENDING' ? 'pending' : p.status === 'FAILED' ? 'failed' : 'refunded',
              date: p.createdAt,
              transactionId: p.transactionId || 'N/A',
              description: p.paymentType || 'Payment'
            }))}
          />
        )}

        {/* Maid Verification Section */}
        {activeSection === 'maid-verification' && (
          <AdminMaidVerificationSection />
        )}

        {/* Buffer Management Section */}
        {activeSection === 'buffer-management' && (
          <AdminBufferManagementSection />
        )}

        {/* Automatic Assignments Section */}
        {activeSection === 'automatic-assignments' && (
          <AdminAutomaticAssignmentsSection />
        )}

        {/* Plans Section */}
        {activeSection === 'plans' && (
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plans</CardTitle>
              <CardDescription>Manage available service plans and pricing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscriptionPlans.map((plan) => (
                  <Card key={plan.id} className={plan.isPopular ? 'border-primary' : ''}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {plan.name}
                        {plan.isPopular && <Badge>Popular</Badge>}
                      </CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-center">
                          <div className="text-3xl font-bold">₹{plan.finalPrice.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">/{plan.duration} month(s)</div>
                          {plan.discountPercent > 0 && (
                            <div className="text-xs text-success">
                              {plan.discountPercent}% off (₹{plan.basePrice.toLocaleString()} original)
                            </div>
                          )}
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>• {plan.sessionsPerWeek} sessions per week</div>
                          <div>• {plan.sessionsPerMonth} sessions per month</div>
                          <div>• {plan.service?.name || 'Service'} included</div>
                          <div>• Professional cleaning staff</div>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <Badge variant={plan.isActive ? 'default' : 'outline'}>
                            {plan.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPlan(plan)}
                          >
                            Edit Plan
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {subscriptionPlans.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No subscription plans found</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>


      {/* Edit Plan Dialog */}
      <EditPlanDialog
        plan={editingPlan}
        isOpen={isEditPlanDialogOpen}
        onClose={() => {
          setIsEditPlanDialogOpen(false);
          setEditingPlan(null);
        }}
        onSuccess={handleEditPlanSuccess}
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        user={editingUser}
        isOpen={isEditUserDialogOpen}
        onClose={() => {
          setIsEditUserDialogOpen(false);
          setEditingUser(null);
        }}
        onSuccess={handleEditUserSuccess}
      />
    </AdminDashboardLayout>
  );
}
