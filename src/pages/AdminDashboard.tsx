import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
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
  Users
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
    if (hash && ['overview', 'bookings', 'subscriptions', 'payments', 'users', 'maids', 'plans'].includes(hash)) {
      return hash;
    }
    return 'overview';
  });

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
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

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && ['overview', 'bookings', 'subscriptions', 'payments', 'users', 'maids', 'plans'].includes(hash)) {
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
      const [usersResponse, subscriptionsResponse, paymentsResponse, plansResponse] = await Promise.allSettled([
        apiRequest('/users', { method: HttpMethod.GET, requiresAuth: true }),
        apiRequest('/admin/subscriptions', { method: HttpMethod.GET, requiresAuth: true }),
        apiRequest('/admin/payments', { method: HttpMethod.GET, requiresAuth: true }),
        SubscriptionService.getSubscriptionPlans()
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

      // Calculate analytics
      calculateAnalytics();

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
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
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
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
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

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage customer accounts and profiles</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.slice(0, 10).map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'CUSTOMER' ? 'secondary' : 'outline'}>
                            {user.role}
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
                {users.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No users found</p>
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
                    {subscriptions.slice(0, 10).map((subscription) => (
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
                {subscriptions.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No subscriptions found</p>
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
