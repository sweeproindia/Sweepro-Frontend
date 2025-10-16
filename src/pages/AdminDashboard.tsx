import { useEffect, useState } from 'react';
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
  Pause
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
import { AdminBufferDaysSection } from '../components/dashboard/AdminBufferDaysSection';
import { AdminPendingAssignmentsSection } from '../components/dashboard/AdminPendingAssignmentsSection';
import { AdminAssignedBookingsSection } from '../components/dashboard/AdminAssignedBookingsSection';
import { AdminReassignmentSection } from '../components/dashboard/AdminReassignmentSection';


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

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useUser();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(() => {
    const hash = location.hash.replace('#', '');
    if (hash && ['overview', 'bookings', 'pending-bookings', 'pending-assignments', 'assigned-bookings', 'reassignments', 'users', 'maids', 'maid-verification', 'subscriptions', 'payments', 'plans', 'buffer-days', 'cors-test'].includes(hash)) {
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
  const notifications = [
    { id: 1, title: 'New Booking Pending', message: 'A new booking requires maid assignment', time: '5 minutes ago', unread: true },
    { id: 2, title: 'Payment Received', message: '₹1,200 payment received from customer', time: '1 hour ago', unread: true },
    { id: 3, title: 'Maid Registration', message: 'New maid registration awaiting approval', time: '2 hours ago', unread: false },
  ];

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && ['overview', 'bookings', 'pending-bookings', 'pending-assignments', 'assigned-bookings', 'reassignments', 'users', 'maids', 'maid-verification', 'subscriptions', 'payments', 'plans', 'buffer-days'].includes(hash)) {
      setActiveSection(hash);
    }
  }, [location.hash]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
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
      }

      // Handle bookings data
      if (bookingsResponse.status === 'fulfilled' && bookingsResponse.value.success) {
        const raw = bookingsResponse.value.data as any;
        const bookingsData = Array.isArray(raw) ? raw : (raw?.bookings || raw?.data || []);
        setBookings(bookingsData);
      }

      // Handle pending bookings data
      if (pendingBookingsResponse.status === 'fulfilled' && pendingBookingsResponse.value && (pendingBookingsResponse.value as any).success !== false) {
        const raw = (pendingBookingsResponse.value as any).data ?? (pendingBookingsResponse.value as any);
        const pendingBookingsData = Array.isArray(raw) ? raw : (raw?.bookings || raw?.data || []);
        setPendingBookings(pendingBookingsData);
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

  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Admin Panel</h2>
          <p className="text-sm text-muted-foreground mt-1">Management Console</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => handleSectionChange('overview')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeSection === 'overview'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Home className="h-4 w-4" />
            Overview
          </button>
          
          <button
            onClick={() => handleSectionChange('bookings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeSection === 'bookings'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Calendar className="h-4 w-4" />
            Bookings
          </button>
          
          <button
            onClick={() => handleSectionChange('pending-bookings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeSection === 'pending-bookings'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Clock className="h-4 w-4" />
            Pending
            {analyticsData.pendingBookings > 0 && (
              <Badge variant="destructive" className="ml-auto text-xs px-1.5 py-0.5">
                {analyticsData.pendingBookings}
              </Badge>
            )}
          </button>
          
          <button
            onClick={() => handleSectionChange('pending-assignments')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeSection === 'pending-assignments'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            Pending Assignments
          </button>
          
          <button
            onClick={() => handleSectionChange('assigned-bookings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeSection === 'assigned-bookings'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            Assigned Bookings
          </button>
          
          <button
            onClick={() => handleSectionChange('reassignments')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeSection === 'reassignments'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <AlertCircle className="h-4 w-4" />
            Reassignments
          </button>
          
          <button
            onClick={() => handleSectionChange('users')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeSection === 'users'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Users className="h-4 w-4" />
            Users
          </button>
          
          <button
            onClick={() => handleSectionChange('maids')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeSection === 'maids'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <UserCog className="h-4 w-4" />
            Maids
          </button>
          
          <button
            onClick={() => handleSectionChange('maid-verification')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeSection === 'maid-verification'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Shield className="h-4 w-4" />
            Maid Verification
          </button>
          
          <button
            onClick={() => handleSectionChange('subscriptions')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeSection === 'subscriptions'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Package className="h-4 w-4" />
            Subscriptions
          </button>
          
          <button
            onClick={() => handleSectionChange('payments')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeSection === 'payments'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            Payments
          </button>
          
          <button
            onClick={() => handleSectionChange('plans')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeSection === 'plans'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Settings className="h-4 w-4" />
            Plans
          </button>
          
          <button
            onClick={() => handleSectionChange('buffer-days')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeSection === 'buffer-days'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Pause className="h-4 w-4" />
            Buffer Days
          </button>
          
          <button
            onClick={() => handleSectionChange('cors-test')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeSection === 'cors-test'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Settings className="h-4 w-4" />
            CORS Test
          </button>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Admin Header */}
        <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="fade-in">
            <h1 className="text-2xl font-bold text-foreground">
              {activeSection === 'overview' && 'Dashboard Overview'}
              {activeSection === 'bookings' && 'All Bookings'}
              {activeSection === 'pending-bookings' && 'Pending Bookings'}
              {activeSection === 'pending-assignments' && 'Pending Assignments'}
              {activeSection === 'assigned-bookings' && 'Assigned Bookings'}
              {activeSection === 'reassignments' && 'Reassignment Management'}
              {activeSection === 'users' && 'User Management'}
              {activeSection === 'maids' && 'Maid Management'}
              {activeSection === 'maid-verification' && 'Maid Verification'}
              {activeSection === 'subscriptions' && 'Subscriptions'}
              {activeSection === 'payments' && 'Payment Management'}
              {activeSection === 'plans' && 'Subscription Plans'}
              {activeSection === 'buffer-days' && 'Buffer Days Management'}
              {activeSection === 'cors-test' && 'CORS Configuration Test'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {activeSection === 'overview' && 'Comprehensive platform management and analytics'}
              {activeSection === 'bookings' && 'Manage all customer bookings and assignments'}
              {activeSection === 'pending-bookings' && 'Assign maids to pending bookings'}
              {activeSection === 'pending-assignments' && 'Assign verified maids to customer bookings'}
              {activeSection === 'assigned-bookings' && 'Track bookings assigned to maids and their responses'}
              {activeSection === 'reassignments' && 'Manage bookings that need reassignment after rejection'}
              {activeSection === 'users' && 'Manage customer accounts and profiles'}
              {activeSection === 'maids' && 'Manage service providers and performance'}
              {activeSection === 'maid-verification' && 'Review and manage maid verification requests'}
              {activeSection === 'subscriptions' && 'Monitor subscription plans and billing'}
              {activeSection === 'payments' && 'Monitor all payment activities and revenue'}
              {activeSection === 'plans' && 'Manage available service plans and pricing'}
              {activeSection === 'buffer-days' && 'Manage customer buffer day requests and service pauses'}
              {activeSection === 'cors-test' && 'Test and debug CORS configuration between frontend and backend'}
            </p>
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchAdminData}
              className="mr-2"
            >
              Refresh
            </Button>
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)} 
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {notifications.filter(n => n.unread).length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.filter(n => n.unread).length}
                  </span>
                )}
              </Button>
              
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-card rounded-lg shadow-lg border border-border z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground">Admin Notifications</h3>
                    <p className="text-sm text-muted-foreground">{notifications.filter(n => n.unread).length} unread</p>
                  </div>
                  <div className="divide-y divide-border">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`p-4 hover:bg-muted transition-colors ${
                        notification.unread ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                      }`}>
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="h-4 w-4 text-orange-500 mt-1" />
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              notification.unread ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                          </div>
                          {notification.unread && <span className="h-2 w-2 bg-blue-500 rounded-full mt-2"></span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Profile Menu */}
            <div className="flex items-center space-x-2">
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span className="hidden md:block text-sm font-medium">
                    {user?.name || 'Admin'}
                  </span>
                </Button>
              </Link>
              <Link to="/">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:block text-sm">Logout</span>
              </Button>
                </Link>  
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
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
          
          {/* Updated Maid Section */}
          {activeSection === 'maids' && (
            <Card>
              <CardHeader>
                <CardTitle>Service Providers Management</CardTitle>
                <CardDescription>
                  Comprehensive maid profiles, performance metrics, and assignment management
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Maid Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Maids</p>
                          <p className="text-2xl font-bold">{analyticsData.totalMaids}</p>
                        </div>
                        <UserCog className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Available Now</p>
                          <p className="text-2xl font-bold text-green-600">{availableMaids.length}</p>
                        </div>
                        <UserCheck className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                          <p className="text-2xl font-bold text-yellow-600">4.8★</p>
                        </div>
                        <Star className="h-8 w-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Maid Info</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maids.slice(0, 10).map((maid) => (
                      <TableRow key={maid.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                              {maid.user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-medium">{maid.user.name}</p>
                              <p className="text-sm text-muted-foreground">ID: {maid.id.slice(-8)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{maid.user.email}</p>
                            <p className="text-sm text-muted-foreground">{maid.user.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{maid.rating.toFixed(1)}</span>
                              <span className="text-muted-foreground text-sm">({maid.totalRatings})</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{maid.completedBookings} jobs completed</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={availableMaids.some(am => am.id === maid.id) ? 'default' : 'outline'}>
                            {availableMaids.some(am => am.id === maid.id) ? 'Available' : 'Busy'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={maid.status === 'ACTIVE' ? 'default' : 'destructive'}>
                            {maid.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              View Profile
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateUserStatus(maid.userId, maid.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                            >
                              {maid.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {maids.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No service providers found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Pending Bookings Section */}
          {activeSection === 'pending-bookings' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Pending Bookings Assignment
                </CardTitle>
                <CardDescription>
                  Assign available maids to confirmed bookings waiting for assignment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingBookings.length > 0 ? (
                    pendingBookings.map((booking) => (
                      <Card key={booking.id} className="border-l-4 border-l-orange-500">
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Booking Details */}
                            <div className="lg:col-span-2">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="font-semibold text-lg">{booking.service?.name || 'Service'}</h3>
                                  <p className="text-muted-foreground">
                                    Booking ID: {booking.id}
                                  </p>
                                </div>
                                <Badge variant="outline" className="bg-orange-50 text-orange-700">
                                  Awaiting Assignment
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Customer</h4>
                                  <p className="font-medium">{booking.customer?.name || 'N/A'}</p>
                                  <p className="text-sm text-muted-foreground">{booking.customer?.email}</p>
                                  <p className="text-sm text-muted-foreground">{booking.customer?.phone}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Schedule</h4>
                                  <p className="font-medium">
                                    {new Date(booking.scheduledAt).toLocaleDateString()}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(booking.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </p>
                                  {booking.timeSlot && (
                                    <p className="text-sm text-muted-foreground">Slot: {booking.timeSlot}</p>
                                  )}
                                </div>
                              </div>
                              
                              {booking.serviceAddress && (
                                <div className="mb-4">
                                  <h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    Service Address
                                  </h4>
                                  <p className="text-sm">{booking.serviceAddress}</p>
                                </div>
                              )}
                            </div>
                            
                            {/* Maid Assignment */}
                            <div className="border-l lg:border-l-2 lg:pl-6">
                              <h4 className="font-medium mb-3">Assign Maid</h4>
                              <div className="space-y-3">
                                {availableMaids.length > 0 ? (
                                  <>
                                    <Select
                                      onValueChange={(maidId) => {
                                        if (maidId && !assigningBooking) {
                                          assignMaidToBooking(booking.id, maidId);
                                        }
                                      }}
                                      disabled={assigningBooking === booking.id}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a maid" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {availableMaids.map((maid) => (
                                          <SelectItem key={maid.id} value={maid.id}>
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium">{maid.user.name}</span>
                                              <span className="text-muted-foreground">•</span>
                                              <div className="flex items-center gap-1">
                                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm">{maid.rating || 0}</span>
                                              </div>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    {assigningBooking === booking.id && (
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                                        Assigning maid...
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="text-center p-4 border border-dashed rounded-lg">
                                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">No available maids</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">All bookings assigned!</h3>
                      <p className="text-muted-foreground">There are no pending bookings waiting for maid assignment.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bookings Section */}
          {activeSection === 'bookings' && (
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>Manage customer bookings and assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.slice(0, 10).map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{booking.customer?.name || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{booking.customer?.email || 'N/A'}</p>
                          </div>
                        </TableCell>
                        <TableCell>{booking.service?.name || 'N/A'}</TableCell>
                        <TableCell>
                          {new Date(booking.scheduledAt).toLocaleDateString()}
                          <br />
                          <span className="text-sm text-muted-foreground">
                            {new Date(booking.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={booking.status === 'COMPLETED' ? 'default' : 'outline'}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell>₹{booking.finalAmount?.toLocaleString() || 'N/A'}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {bookings.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No bookings found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Users Section - Only Customers */}
          {activeSection === 'users' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Customer Accounts</CardTitle>
                    <CardDescription>Manage customer accounts and profiles</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="Search by name, email or phone"
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="w-64"
                    />
                    <Badge variant="outline">
                      {users.filter(u => u.role === 'CUSTOMER').length} total
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Time Slot</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users
                      .filter(user => user.role === 'CUSTOMER')
                      .filter(u => {
                        const t = userFilter.trim().toLowerCase();
                        if (!t) return true;
                        return (
                          u.name?.toLowerCase().includes(t) ||
                          u.email?.toLowerCase().includes(t) ||
                          u.phone?.toLowerCase().includes(t)
                        );
                      })
                      .slice(0, 10)
                      .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell className="max-w-xs truncate">{user.address || 'Not provided'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {user.timeSlot || 'Not set'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'ACTIVE' ? 'default' : 'destructive'}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditUser(user)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateUserStatus(user.id, user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                            >
                              {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {users.filter(user => user.role === 'CUSTOMER').length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No customers found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}


          {/* Subscriptions Section */}
          {activeSection === 'subscriptions' && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Subscriptions</CardTitle>
                <CardDescription>Monitor subscription plans and billing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Filter by customer name or plan..."
                      value={subscriptionFilter}
                      onChange={(e) => setSubscriptionFilter(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <Badge variant="outline">
                    {filteredSubscriptions.length} of {subscriptions.length} subscriptions
                  </Badge>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Auto Renew</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscriptions.slice(0, 10).map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{subscription.customer?.user?.name || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{subscription.customer?.user?.email || 'N/A'}</p>
                          </div>
                        </TableCell>
                        <TableCell>{subscription.plan?.name || 'N/A'}</TableCell>
                        <TableCell>₹{subscription.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={subscription.status === 'ACTIVE' ? 'default' : 'outline'}>
                            {subscription.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(subscription.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(subscription.endDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={subscription.autoRenew ? 'default' : 'outline'}>
                            {subscription.autoRenew ? 'Yes' : 'No'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredSubscriptions.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      {subscriptionFilter ? 'No subscriptions match your filter' : 'No subscriptions found'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payments Section */}
          {activeSection === 'payments' && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Transactions</CardTitle>
                <CardDescription>Monitor all payment activities and revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Transaction ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.slice(0, 10).map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payment.customer?.name || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{payment.customer?.email || 'N/A'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {payment.paymentType}
                          </Badge>
                        </TableCell>
                        <TableCell>₹{payment.finalAmount.toLocaleString()}</TableCell>
                        <TableCell>{payment.paymentMethod}</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === 'COMPLETED' ? 'default' : 'outline'}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <code className="text-xs">{payment.transactionId || 'N/A'}</code>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {payments.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No payments found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Maid Verification Section */}
          {activeSection === 'maid-verification' && (
            <AdminMaidVerificationSection />
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

          {/* Pending Assignments Section */}
          {activeSection === 'pending-assignments' && (
            <AdminPendingAssignmentsSection onRefresh={fetchAdminData} />
          )}

          {/* Assigned Bookings Section */}
          {activeSection === 'assigned-bookings' && (
            <AdminAssignedBookingsSection onRefresh={fetchAdminData} />
          )}

          {/* Reassignments Section */}
          {activeSection === 'reassignments' && (
            <AdminReassignmentSection onRefresh={fetchAdminData} />
          )}

          {/* Buffer Days Section */}
          {activeSection === 'buffer-days' && (
            <AdminBufferDaysSection />
          )}

          {/* CORS Test Section */}
          {activeSection === 'cors-test' && (
            <div className="flex justify-center">
              <CorsTest />
            </div>
          )}
          </div>
        </div>
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
    </div>
  );
}
