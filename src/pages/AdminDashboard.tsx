import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
  Filter
} from 'lucide-react';
import { BookingService, Booking } from '../services/bookingService';
import { SubscriptionService, Subscription, SubscriptionPlan } from '../services/subscriptionService';
import { PaymentService, Payment } from '../services/paymentService';
import { apiRequest, HttpMethod } from '../services/api';

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
  const [activeTab, setActiveTab] = useState(() => {
    const hash = location.hash.replace('#', '');
    if (hash && ['overview', 'bookings', 'pending-bookings', 'subscriptions', 'payments', 'customers', 'maids', 'plans'].includes(hash)) {
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
  const [assigningBooking, setAssigningBooking] = useState<string | null>(null);

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && ['overview', 'bookings', 'pending-bookings', 'subscriptions', 'payments', 'customers', 'maids', 'plans'].includes(hash)) {
      setActiveTab(hash);
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
        const usersData = Array.isArray(usersResponse.value.data) ? 
          usersResponse.value.data : 
          usersResponse.value.data?.users || [];
        setUsers(usersData);
        
        // Separate maids from users
        const maidsData = usersData
          .filter((user: User) => user.role === 'MAID')
          .map((user: User) => ({
            id: user.id,
            userId: user.id,
            user,
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
        const bookingsData = Array.isArray(bookingsResponse.value.data) ? 
          bookingsResponse.value.data : 
          bookingsResponse.value.data?.bookings || [];
        setBookings(bookingsData);
      }

      // Handle pending bookings data
      if (pendingBookingsResponse.status === 'fulfilled' && pendingBookingsResponse.value) {
        const pendingBookingsData = Array.isArray(pendingBookingsResponse.value) ? 
          pendingBookingsResponse.value : 
          pendingBookingsResponse.value?.data || [];
        setPendingBookings(pendingBookingsData);
      }

      // Handle available maids data
      if (availableMaidsResponse.status === 'fulfilled' && availableMaidsResponse.value) {
        const availableMaidsData = Array.isArray(availableMaidsResponse.value) ? 
          availableMaidsResponse.value : 
          availableMaidsResponse.value?.data || [];
        setAvailableMaids(availableMaidsData);
      }

      // Handle subscriptions
      if (subscriptionsResponse.status === 'fulfilled' && subscriptionsResponse.value.success) {
        const subscriptionsData = Array.isArray(subscriptionsResponse.value.data) ? 
          subscriptionsResponse.value.data : 
          subscriptionsResponse.value.data?.subscriptions || [];
        setSubscriptions(subscriptionsData);
      }

      // Handle payments
      if (paymentsResponse.status === 'fulfilled' && paymentsResponse.value.success) {
        const paymentsData = Array.isArray(paymentsResponse.value.data) ? 
          paymentsResponse.value.data : 
          paymentsResponse.value.data?.payments || [];
        setPayments(paymentsData);
      }

      // Handle subscription plans
      if (plansResponse.status === 'fulfilled' && plansResponse.value.success) {
        const plansData = Array.isArray(plansResponse.value.data) ? 
          plansResponse.value.data : 
          plansResponse.value.data?.plans || [];
        setSubscriptionPlans(plansData);
      }

      // Handle stats data
      if (statsResponse.status === 'fulfilled' && statsResponse.value.success) {
        const stats = statsResponse.value.data.overview;
        setAnalyticsData({
          totalBookings: stats.totalBookings || 0,
          totalCustomers: stats.totalCustomers || 0,
          totalMaids: stats.totalMaids || 0,
          totalRevenue: stats.totalRevenue || 0,
          pendingBookings: stats.pendingBookings || 0,
          activeSubscriptions: stats.activeSubscriptions || 0,
          completedPayments: stats.completedPayments || 0,
          pendingPayments: stats.pendingPayments || 0
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="fade-in">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive platform management and analytics
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="pending-bookings">Pending</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="maids">Maids</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
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
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Pending Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bookings.filter(b => b.status === 'PENDING').slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{booking.service?.name || 'Service'}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.customer?.name || 'Customer'}
                          </p>
                        </div>
                        <Badge variant="outline">{booking.status}</Badge>
                      </div>
                    ))}
                    {bookings.filter(b => b.status === 'PENDING').length === 0 && (
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
          </TabsContent>

          {/* Pending Bookings Tab */}
          <TabsContent value="pending-bookings" className="space-y-6">
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
                              
                              {booking.customer?.address && (
                                <div className="mb-4">
                                  <h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    Service Address
                                  </h4>
                                  <p className="text-sm">{booking.customer.address}</p>
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
                                              <span className="font-medium">{maid.name}</span>
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
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
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
          </TabsContent>

          {/* Users Tab - Only Customers */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Accounts</CardTitle>
                <CardDescription>Manage customer accounts and profiles</CardDescription>
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
                    {users.filter(user => user.role === 'CUSTOMER').slice(0, 10).map((user) => (
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
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateUserStatus(user.id, user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                          >
                            Toggle Status
                          </Button>
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
          </TabsContent>

          {/* Maids Tab */}
          <TabsContent value="maids" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Providers</CardTitle>
                <CardDescription>Manage maid profiles and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Completed Jobs</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maids.slice(0, 10).map((maid) => (
                      <TableRow key={maid.id}>
                        <TableCell className="font-medium">{maid.user.name}</TableCell>
                        <TableCell>
                          <div>
                            <p>{maid.user.email}</p>
                            <p className="text-sm text-muted-foreground">{maid.user.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{maid.rating.toFixed(1)}</span>
                            <span className="text-muted-foreground">({maid.totalRatings})</span>
                          </div>
                        </TableCell>
                        <TableCell>{maid.completedBookings}</TableCell>
                        <TableCell>
                          <Badge variant={maid.status === 'ACTIVE' ? 'default' : 'outline'}>
                            {maid.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
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
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-6">
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
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
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
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
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
                            <Button variant="outline" size="sm">
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
