import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import {
  BarChart3,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  Package,
  Shield,
  Star,
  TrendingUp,
  Users,
  UserPlus,
  AlertCircle,
  UserCheck,
  MapPin,
  Filter,
  Home,
  BookOpen,
  UserCog,
  Settings,
  Bell,
  User,
  LogOut,
  MessageCircle,
  Pause,
  Menu,
  Sparkles,
  X
} from 'lucide-react';
import { BookingService, Booking } from '../services/bookingService';
import { SubscriptionService, Subscription, SubscriptionPlan } from '../services/subscriptionService';
import { PaymentService, Payment } from '../services/paymentService';
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
import { AdminDashboardSidebar } from './AdminDashboardSidebar';
import { NotificationBell } from '../components/notifications/NotificationBell';

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
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  completedBookings: number;
  user: User;
}

interface Notification {
  id: number;
  type: 'admin' | 'user' | 'maid';
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useUser();
  
  // State for mobile sidebar and notifications
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

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
  
  // Dummy maid verification data for testing - formatted to match component structure
  const [maidVerifications] = useState([
    {
      id: 'mv001',
      maidId: 'm001',
      maidName: 'Priya Sharma',
      maidEmail: 'priya.sharma@email.com',
      maidPhone: '+91 98765 43210',
      status: 'pending',
      submittedAt: '2024-01-15T10:30:00Z',
      documents: {
        aadharCard: { url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop', uploaded: true },
        panCard: { url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300&fit=crop', uploaded: true },
        electricityBill: { url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop', uploaded: true }
      },
      personalInfo: {
        fullName: 'Priya Sharma',
        address: '123 MG Road, Bangalore, Karnataka 560001',
        experience: '5 years',
        skills: ['Regular Cleaning', 'Deep Cleaning', 'Kitchen Cleaning']
      }
    },
    {
      id: 'mv002',
      maidId: 'm002',
      maidName: 'Sunita Devi',
      maidEmail: 'sunita.devi@email.com',
      maidPhone: '+91 87654 32109',
      status: 'pending',
      submittedAt: '2024-01-14T14:45:00Z',
      documents: {
        aadharCard: { url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop', uploaded: true },
        panCard: { url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300&fit=crop', uploaded: false },
        electricityBill: { url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop', uploaded: true }
      },
      personalInfo: {
        fullName: 'Sunita Devi',
        address: '456 HSR Layout, Bangalore, Karnataka 560102',
        experience: '3 years',
        skills: ['Regular Cleaning', 'Laundry', 'Cooking']
      }
    },
    {
      id: 'mv003',
      maidId: 'm003',
      maidName: 'Lakshmi Reddy',
      maidEmail: 'lakshmi.reddy@email.com',
      maidPhone: '+91 76543 21098',
      status: 'approved',
      submittedAt: '2024-01-10T09:15:00Z',
      reviewedAt: '2024-01-12T16:30:00Z',
      reviewedBy: 'Admin User',
      notes: 'All documents verified. Approved for regular and deep cleaning services.',
      documents: {
        aadharCard: { url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop', uploaded: true },
        panCard: { url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300&fit=crop', uploaded: true },
        electricityBill: { url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop', uploaded: true }
      },
      personalInfo: {
        fullName: 'Lakshmi Reddy',
        address: '789 Whitefield, Bangalore, Karnataka 560066',
        experience: '4 years',
        skills: ['Regular Cleaning', 'Deep Cleaning', 'Full House Cleaning']
      },
      assignedServices: ['Regular Cleaning', 'Deep Cleaning', 'Kitchen Cleaning']
    },
    {
      id: 'mv004',
      maidId: 'm004',
      maidName: 'Meera Khan',
      maidEmail: 'meera.khan@email.com',
      maidPhone: '+91 98765 43213',
      status: 'rejected',
      submittedAt: '2024-01-08T11:20:00Z',
      reviewedAt: '2024-01-09T13:45:00Z',
      reviewedBy: 'Admin User',
      rejectionReason: 'Incomplete documents',
      notes: 'Missing PAN Card and Police Verification Certificate. Please resubmit with all required documents.',
      documents: {
        aadharCard: { url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop', uploaded: true },
        panCard: { url: '', uploaded: false },
        electricityBill: { url: '', uploaded: false }
      },
      personalInfo: {
        fullName: 'Meera Khan',
        address: '321 Koramangala, Bangalore, Karnataka 560034',
        experience: '1 year',
        skills: ['Regular Cleaning']
      }
    },
    {
      id: 'mv005',
      maidId: 'm005',
      maidName: 'Kavitha Nair',
      maidEmail: 'kavitha.nair@email.com',
      maidPhone: '+91 87654 32109',
      status: 'pending',
      submittedAt: '2024-01-16T08:45:00Z',
      documents: {
        aadharCard: { url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop', uploaded: true },
        panCard: { url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300&fit=crop', uploaded: true },
        electricityBill: { url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop', uploaded: true }
      },
      personalInfo: {
        fullName: 'Kavitha Nair',
        address: '654 Electronic City, Bangalore, Karnataka 560100',
        experience: '10+ years',
        skills: ['Regular Cleaning', 'Elder Care', 'Cooking', 'Full House Cleaning']
      }
    },
    {
      id: 'mv006',
      maidId: 'm006',
      maidName: 'Rashida Begum',
      maidEmail: 'rashida.begum@email.com',
      maidPhone: '+91 76543 21098',
      status: 'pending',
      submittedAt: '2024-01-17T12:30:00Z',
      documents: {
        aadharCard: { url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop', uploaded: true },
        panCard: { url: '', uploaded: false },
        electricityBill: { url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop', uploaded: true }
      },
      personalInfo: {
        fullName: 'Rashida Begum',
        address: '987 Indiranagar, Bangalore, Karnataka 560038',
        experience: '6 years',
        skills: ['Deep Cleaning', 'Move-in/Move-out Cleaning', 'Commercial Cleaning']
      }
    }
  ]);
  
  // Admin notifications
  const notifications: Notification[] = [
    { id: 1, type: 'user', title: 'New Booking Pending', message: 'A new booking requires maid assignment', time: '5 minutes ago', unread: true },
    { id: 2, type: 'admin', title: 'Payment Received', message: '₹1,200 payment received from customer', time: '1 hour ago', unread: true },
    { id: 3, type: 'maid', title: 'Maid Registration', message: 'New maid registration awaiting approval', time: '2 hours ago', unread: false },
    { id: 4, type: 'user', title: 'Service Reminder', message: "Don't forget your scheduled cleaning service tomorrow", time: '1 day ago', unread: false },
    { id: 5, type: 'admin', title: 'System Update', message: 'System maintenance scheduled for tonight', time: '2 days ago', unread: false },
  ];

  const toggleNotification = () => setIsNotificationOpen(!isNotificationOpen);

  const openAllNotifications = () => {
    setShowAllNotifications(true);
    setIsNotificationOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationOpen]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'user':
        return <User className="h-4 w-4 text-green-600" />;
      case 'maid':
        return <MessageCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'admin':
        return 'border-l-blue-500 bg-blue-50';
      case 'user':
        return 'border-l-green-500 bg-green-50';
      case 'maid':
        return 'border-l-orange-500 bg-orange-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && ['overview', 'bookings', 'pending-bookings', 'users', 'maids', 'maid-verification', 'subscriptions', 'buffer-management', 'payments', 'plans'].includes(hash)) {
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
      const [usersResponse, bookingsResponse, pendingBookingsResponse, subscriptionsResponse, paymentsResponse, plansResponse, statsResponse, availableMaidsResponse] = await Promise.allSettled([
        apiRequest('/users', { method: HttpMethod.GET, requiresAuth: true }),
        apiRequest('/bookings', { method: HttpMethod.GET, requiresAuth: true }),
        apiRequest('/admin/pending-bookings', { method: HttpMethod.GET, requiresAuth: true }),
        apiRequest('/admin/subscriptions', { method: HttpMethod.GET, requiresAuth: true }),
        apiRequest('/admin/payments', { method: HttpMethod.GET, requiresAuth: true }),
        SubscriptionService.getSubscriptionPlans(),
        apiRequest('/admin/stats', { method: HttpMethod.GET, requiresAuth: true }),
        apiRequest('/admin/available-maids', { method: HttpMethod.GET, requiresAuth: true })
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
            completedBookings: 0
          }));
        setMaids(maidsData);
      } else if (usersResponse.status === 'rejected') {
        console.error('Failed to fetch users');
        setUsers([]);
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
          status: (u.maidProfile?.status || 'ACTIVE') as any,
          completedBookings: u.maidProfile?.completedBookings || 0,
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
          description: 'Maid assigned to booking successfully'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign maid to booking',
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

  const handleLogout = () => {
    logout();
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
                <Button>Go to Maid Dashboard</Button>
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
          {activeSection === 'pending-bookings' && 'Pending Bookings'}
          {activeSection === 'users' && 'User Management'}
          {activeSection === 'maids' && 'Maid Management'}
          {activeSection === 'maid-verification' && 'Maid Verification'}
          {activeSection === 'subscriptions' && 'Subscriptions'}
          {activeSection === 'buffer-management' && 'Buffer Period Management'}
          {activeSection === 'automatic-assignments' && 'Automatic Assignment System'}
          {activeSection === 'payments' && 'Payment Management'}
          {activeSection === 'plans' && 'Subscription Plans'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {activeSection === 'overview' && 'Comprehensive platform management and analytics'}
          {activeSection === 'bookings' && 'Manage all customer bookings and assignments'}
          {activeSection === 'pending-bookings' && 'Assign maids to pending bookings'}
          {activeSection === 'users' && 'Manage customer accounts and profiles'}
          {activeSection === 'maids' && 'Manage service providers and performance'}
          {activeSection === 'maid-verification' && 'Review and manage maid verification requests'}
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

                  {/* Recent Activities */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Latest Pending Bookings
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleSectionChange('pending-bookings')}
                          >
                            View All
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {pendingBookings.slice(0, 2).map((booking) => (
                            <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{booking.service?.name || 'Service'}</p>
                                <p className="text-sm text-muted-foreground">
                                  {booking.customer?.name || 'Customer'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  {new Date(booking.scheduledAt).toLocaleDateString()}
                                </p>
                                <Badge variant="outline" className="bg-orange-50 text-orange-700">
                                  Pending
                                </Badge>
                              </div>
                            </div>
                          ))}
                          {pendingBookings.length === 0 && (
                            <p className="text-center text-muted-foreground py-4">No pending bookings</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Recent Payments
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {payments.slice(0, 5).map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">₹{payment.finalAmount.toLocaleString()}</p>
                                <p className="text-sm text-muted-foreground">
                                  {payment.paymentMethod} • {new Date(payment.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant={payment.status === 'COMPLETED' ? 'default' : 'outline'}>
                                {payment.status}
                              </Badge>
                            </div>
                          ))}
                          {payments.length === 0 && (
                            <p className="text-center text-muted-foreground py-4">No recent payments</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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
                      status: m.status === 'ACTIVE' ? 'active' : 'pending',
                      totalBookings: m.completedBookings,
                      joinDate: m.user.createdAt
                    }))}
                    onAddMaid={(maidData) => {
                      toast({
                        title: 'Maid Added',
                        description: 'New maid has been added successfully'
                      });
                    }}
                    onVerifyMaid={(maidId) => updateUserStatus(maidId, 'ACTIVE')}
                  />
                )}

                {/* Automatic Bookings Section */}
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

      {/* All Notifications Modal */}
      {showAllNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">All Notifications</h2>
              <button onClick={() => setShowAllNotifications(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-gray-50 transition-colors border-l-4 ${getNotificationColor(notification.type)} ${
                      notification.unread ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-lg font-medium ${notification.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </p>
                          {notification.unread && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mt-2">{notification.message}</p>
                        <p className="text-sm text-gray-400 mt-3">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Showing {notifications.length} notifications</p>
                <button onClick={() => setShowAllNotifications(false)} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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