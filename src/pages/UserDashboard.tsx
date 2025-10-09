import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { BookingService, Booking } from '@/services/bookingService';
import { SubscriptionService, Subscription, SubscriptionPlan, MonthlySubscriptionStatus } from '@/services/subscriptionService';
import { PaymentService, Payment } from '@/services/paymentService';
import { MonthlySubscriptionCard } from '@/components/dashboard/MonthlySubscriptionCard';
import { useToast } from '@/hooks/use-toast';
import { Calendar, CreditCard, Clock, CheckCircle, AlertTriangle, TrendingUp, DollarSign, Package, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QuickBookingForm } from '@/components/forms/QuickBookingForm';

export default function UserDashboard() {
  const { user, refreshUser, isAuthenticated } = useUser();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [monthlySubscriptionStatus, setMonthlySubscriptionStatus] = useState<MonthlySubscriptionStatus | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
    activeSubscription: false,
    upcomingBookings: 0
  });

  useEffect(() => {
    if (user && isAuthenticated) {
      console.log('UserDashboard - Current User Data:', user);
      fetchUserDashboardData();
    }
  }, [user, isAuthenticated]);

  const fetchUserDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [bookingsResponse, subscriptionResponse, monthlyStatusResponse, paymentsResponse, plansResponse] = await Promise.allSettled([
        BookingService.getUserBookings(),
        SubscriptionService.getUserSubscription(),
        SubscriptionService.getMonthlySubscriptionStatus(),
        PaymentService.getUserPayments(),
        SubscriptionService.getSubscriptionPlans()
      ]);

      // Handle bookings
      if (bookingsResponse.status === 'fulfilled' && bookingsResponse.value.success) {
        // Backend returns bookings directly in data field (wrapped by api.ts)
        const bookingsData = Array.isArray(bookingsResponse.value.data)
          ? bookingsResponse.value.data
          : (bookingsResponse.value.data && typeof bookingsResponse.value.data === 'object' && 'bookings' in bookingsResponse.value.data)
            ? (bookingsResponse.value.data as { bookings: Booking[] }).bookings
            : [];
        setBookings(bookingsData);
      }

      // Handle subscription
      if (subscriptionResponse.status === 'fulfilled' && subscriptionResponse.value.success) {
        console.log('Subscription response data:', subscriptionResponse.value.data);
        // Backend returns subscription in the 'subscription' property of the data
        const subscriptionData = subscriptionResponse.value.data?.subscription || null;
        setSubscription(subscriptionData);
      }

      // Handle monthly subscription status
      if (monthlyStatusResponse.status === 'fulfilled' && monthlyStatusResponse.value.success) {
        console.log('Monthly subscription status response data:', monthlyStatusResponse.value.data);
        // Backend returns status in the 'data' property
        const statusData = monthlyStatusResponse.value.data || null;
        setMonthlySubscriptionStatus(statusData);
      } else if (monthlyStatusResponse.status === 'rejected') {
        console.error('Error fetching monthly subscription status:', monthlyStatusResponse.reason);
      }

      // Handle payments
      if (paymentsResponse.status === 'fulfilled' && paymentsResponse.value.success) {
        // Backend returns payments directly in data field (wrapped by api.ts)
        const paymentsData = Array.isArray(paymentsResponse.value.data) ? 
          paymentsResponse.value.data : 
          paymentsResponse.value.data?.payments || [];
        setPayments(paymentsData);
      }

      // Handle subscription plans
      if (plansResponse.status === 'fulfilled' && plansResponse.value.success) {
        // Backend returns plans directly in data field (wrapped by api.ts)
        const plansData = Array.isArray(plansResponse.value.data) ? 
          plansResponse.value.data : 
          plansResponse.value.data?.plans || [];
        setSubscriptionPlans(plansData);
      }

      // Calculate stats after data is loaded
      calculateStats();

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data. Please try refreshing.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
    const upcomingBookings = bookings.filter(b => 
      b.status === 'PENDING' || b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS'
    ).length;
    const totalSpent = payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);
    const activeSubscription = subscription?.status === 'ACTIVE';

    setStats({
      totalBookings,
      completedBookings,
      totalSpent,
      activeSubscription,
      upcomingBookings
    });
  };

  useEffect(() => {
    if (bookings.length > 0 || payments.length > 0 || subscription) {
      calculateStats();
    }
  }, [bookings, payments, subscription]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || !isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="text-center p-8">
          <p className="text-muted-foreground">Please log in to view your dashboard.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <QuickBookingForm 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={() => {
          setIsBookingModalOpen(false);
          fetchUserDashboardData();
        }}
        userSubscription={subscription}
        user={user}
      />
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="fade-in">
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground mt-2">
            Here's your comprehensive dashboard with all your activity and details.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 slide-up">
          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Bookings
              </CardTitle>
              <Calendar className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.upcomingBookings} upcoming
              </p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed Services
              </CardTitle>
              <CheckCircle className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.completedBookings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalBookings > 0 ? Math.round((stats.completedBookings / stats.totalBookings) * 100) : 0}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Spent
              </CardTitle>
              <DollarSign className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₹{stats.totalSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {payments.filter(p => p.status === 'COMPLETED').length} payments
              </p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Subscription Status
              </CardTitle>
              <Package className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.activeSubscription ? 'Active' : 'Inactive'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {subscription ? subscription.plan?.name || 'Plan details' : 'No active plan'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Subscription Section */}
        <div className="slide-up">
          <MonthlySubscriptionCard
            subscriptionStatus={monthlySubscriptionStatus}
            onRefresh={fetchUserDashboardData}
            loading={loading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Profile Details */}
          <Card className="dashboard-card slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Your account details and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="font-medium">Name:</span>
                  <span className="text-foreground">{user.name}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="font-medium">Email:</span>
                  <span className="text-foreground text-sm">{user.email}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="font-medium">Phone:</span>
                  <span className="text-foreground">{user.phone}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="font-medium">Role:</span>
                  <Badge variant="secondary">{user.role}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="font-medium">Status:</span>
                  <Badge variant={user.status === 'ACTIVE' ? 'default' : 'destructive'}>
                    {user.status}
                  </Badge>
                </div>
                {user.address && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <span className="font-medium">Address:</span>
                    <p className="text-foreground mt-1">{user.address}</p>
                  </div>
                )}
              </div>
              <div className="pt-4">
                <Link to="/profile">
                  <Button className="w-full" variant="outline">
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Details */}
          <Card className="dashboard-card slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Subscription Plan
              </CardTitle>
              <CardDescription>Your current subscription details</CardDescription>
            </CardHeader>
            <CardContent>
              {subscription ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-feature rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lg">{subscription.plan?.name || 'Current Plan'}</h4>
                      <Badge variant={subscription.status === 'ACTIVE' ? 'default' : 'destructive'}>
                        {subscription.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">
                      {subscription.plan?.description || 'Premium cleaning services'}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Amount:</span>
                        <p className="text-lg font-bold text-primary">₹{subscription.amount.toLocaleString()}</p>
                        {subscription.discount > 0 && (
                          <p className="text-xs text-success">-₹{subscription.discount.toLocaleString()} discount</p>
                        )}
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span>
                        <p>{subscription.plan?.duration || 1} month{(subscription.plan?.duration || 1) > 1 ? 's' : ''}</p>
                        <p className="text-xs text-muted-foreground">{subscription.billingCycle.toLowerCase()} billing</p>
                      </div>
                      <div>
                        <span className="font-medium">Sessions:</span>
                        <p>{subscription.plan?.sessionsPerWeek || 0}/week</p>
                        <p className="text-xs text-muted-foreground">{subscription.plan?.sessionsPerMonth || 0}/month</p>
                      </div>
                      <div>
                        <span className="font-medium">Started:</span>
                        <p>{new Date(subscription.startDate).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">Expires: {new Date(subscription.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {subscription.nextBillDate && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Next Billing:</span>
                          <span className="text-sm font-bold">
                            {new Date(subscription.nextBillDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm font-medium">Auto Renewal:</span>
                          <Badge variant={subscription.autoRenew ? 'default' : 'outline'}>
                            {subscription.autoRenew ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/subscription">
                      <Button className="w-full" variant="outline">
                        Manage Plan
                      </Button>
                    </Link>
                    <Button className="w-full" variant="outline">
                      View History
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-semibold mb-2">No Active Subscription</h4>
                  <p className="text-muted-foreground text-sm mb-4">
                    Subscribe to a plan to start enjoying our services
                  </p>
                  <Link to="/subscription">
                    <Button className="btn-hero">
                      Choose a Plan
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Bookings
                </CardTitle>
                <CardDescription>Your recent and upcoming cleaning sessions</CardDescription>
              </div>
              <Link to="/bookings">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        booking.status === 'COMPLETED' ? 'bg-success' : 
                        booking.status === 'PENDING' || booking.status === 'CONFIRMED' ? 'bg-primary' :
                        booking.status === 'IN_PROGRESS' ? 'bg-warning' : 'bg-destructive'
                      }`} />
                      <div>
                        <p className="font-medium">{booking.service?.name || 'Service'}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(booking.scheduledAt).toLocaleDateString()} at {new Date(booking.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        {booking.serviceAddress && (
                          <p className="text-xs text-muted-foreground">{booking.serviceAddress}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        booking.status === 'COMPLETED' ? 'default' :
                        booking.status === 'PENDING' || booking.status === 'CONFIRMED' ? 'secondary' :
                        booking.status === 'IN_PROGRESS' ? 'outline' : 'destructive'
                      }>
                        {booking.status}
                      </Badge>
                      {booking.finalAmount && (
                        <p className="text-sm font-medium mt-1">
                          ₹{booking.finalAmount.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-semibold mb-2">No Bookings Yet</h4>
                <p className="text-muted-foreground text-sm mb-4">
                  Book your first cleaning service to get started
                </p>
                <Button className="btn-hero">
                  Book Now
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment History
                </CardTitle>
                <CardDescription>Your transaction history and payment details</CardDescription>
              </div>
              <Link to="/payments">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {payments.length > 0 ? (
              <div className="space-y-4">
                {payments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        payment.status === 'COMPLETED' ? 'bg-success' :
                        payment.status === 'PENDING' ? 'bg-warning' :
                        payment.status === 'FAILED' ? 'bg-destructive' : 'bg-muted-foreground'
                      }`} />
                      <div>
                        <p className="font-medium">
                          {payment.bookingId ? 'Booking Payment' : payment.subscriptionId ? 'Subscription Payment' : 'Payment'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleDateString()} • {payment.paymentMethod}
                        </p>
                        {payment.description && (
                          <p className="text-xs text-muted-foreground">{payment.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{payment.amount.toLocaleString()}</p>
                      <Badge variant={
                        payment.status === 'COMPLETED' ? 'default' :
                        payment.status === 'PENDING' ? 'outline' : 'destructive'
                      }>
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t border-border">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Paid</p>
                      <p className="text-lg font-bold text-success">
                        ₹{payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-lg font-bold text-warning">
                        ₹{payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Failed</p>
                      <p className="text-lg font-bold text-destructive">
                        ₹{payments.filter(p => p.status === 'FAILED').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-semibold mb-2">No Payment History</h4>
                <p className="text-muted-foreground text-sm">
                  Your payment transactions will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
