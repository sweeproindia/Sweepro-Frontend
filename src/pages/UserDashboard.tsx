import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { useBufferPeriod } from '@/hooks/useBufferPeriod';
import { BookingService, Booking } from '@/services/bookingService';
import { SubscriptionService, Subscription, SubscriptionPlan, MonthlySubscriptionStatus } from '@/services/subscriptionService';
import { BufferService } from '@/services/bufferService';
import { PaymentService, Payment } from '@/services/paymentService';
import { MaidService, MaidAssignment } from '@/services/maidService';
import { MaidAssignmentCard } from '@/components/dashboard/MaidAssignmentCard';
import UserDashboardSkeleton from '@/components/dashboard/UserDashboardSkeleton';
import { useToast } from '@/hooks/use-toast';
import { Calendar, CreditCard, Clock, CheckCircle, AlertTriangle, TrendingUp, DollarSign, Package, Users, Pause, Play, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QuickBookingForm } from '@/components/forms/QuickBookingForm';
import { BufferPeriodAlert } from '@/components/ui/BufferPeriodAlert';
import { FeedbackCard } from '@/components/feedback/FeedbackCard';
import FeedbackService from '@/services/feedbackService';

export default function UserDashboard() {
  const { user, refreshUser, isAuthenticated } = useUser();
  const { toast } = useToast();
  
  // Use the buffer period hook for centralized buffer period management
  const {
    isInBufferPeriod,
    shouldDisableBooking,
    getBufferPeriodMessage,
    getFormattedEndDate,
    isLoading: bufferLoading
  } = useBufferPeriod();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [monthlySubscriptionStatus, setMonthlySubscriptionStatus] = useState<MonthlySubscriptionStatus | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [maidAssignment, setMaidAssignment] = useState<MaidAssignment | null>(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
    activeSubscription: false,
    upcomingBookings: 0
  });
  const [bufferInfo, setBufferInfo] = useState<any>(null);
  const [bufferHistory, setBufferHistory] = useState<any[]>([]);
  const [hasBufferAccess, setHasBufferAccess] = useState(false);
  const [bufferAccessLoading, setBufferAccessLoading] = useState(true);

  useEffect(() => {
    if (user && isAuthenticated) {
      console.log('UserDashboard - Current User Data:', user);
      console.log('UserDashboard - User Role:', user.role);
      
      // Only customers should access this dashboard
      if (user.role !== 'CUSTOMER') {
        console.warn('⚠️ Non-customer user attempted to access UserDashboard:', user.role);
        setLoading(false);
        return;
      }
      
      fetchUserDashboardData();
    }
  }, [user, isAuthenticated, subscription?.id]);

  const fetchUserDashboardData = async () => {
    // Double-check user role to prevent data leaks
    if (user?.role !== 'CUSTOMER') {
      console.warn('⚠️ Unauthorized access attempt to fetchUserDashboardData - User role:', user?.role);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Starting dashboard data fetch for CUSTOMER user...');
      
      // For CUSTOMER users, fetch all relevant data
      // Verify user is CUSTOMER before fetching role-specific endpoints
      if (user?.role !== 'CUSTOMER') {
        console.error('🚨 CRITICAL: Non-customer user attempting to fetch customer data. Role:', user?.role);
        setLoading(false);
        return;
      }

      // Only fetch maidAssignment for CUSTOMER users - other endpoints may return 403 for non-customers
      const promises = [
        BookingService.getUserBookings(),
        SubscriptionService.getUserSubscription(),
        SubscriptionService.getMonthlySubscriptionStatus(),
        PaymentService.getUserPayments(),
        SubscriptionService.getSubscriptionPlans(),
        MaidService.getCurrentMaidAssignment() // CUSTOMER-ONLY endpoint
      ] as const;

      const [
        bookingsResponse,
        subscriptionResponse,
        monthlyStatusResponse,
        paymentsResponse,
        plansResponse,
        maidAssignmentResponse
      ] = await Promise.allSettled(promises);

      // Handle bookings
      console.log('📚 Bookings Response:', bookingsResponse);
      if (bookingsResponse.status === 'fulfilled' && bookingsResponse.value.success) {
        // Backend returns bookings directly in data field (wrapped by api.ts)
        const bookingsData = Array.isArray(bookingsResponse.value.data)
          ? bookingsResponse.value.data
          : (bookingsResponse.value.data && typeof bookingsResponse.value.data === 'object' && 'bookings' in bookingsResponse.value.data)
            ? (bookingsResponse.value.data as { bookings: Booking[] }).bookings
            : [];
        setBookings(bookingsData);
        console.log('✅ Bookings loaded:', bookingsData.length);
      } else if (bookingsResponse.status === 'rejected') {
        console.error('❌ Bookings fetch failed:', bookingsResponse.reason);
      }

      // Handle subscription
      console.log('💳 Subscription Response:', subscriptionResponse);
      if (subscriptionResponse.status === 'fulfilled') {
        console.log('Subscription response:', subscriptionResponse.value);
        console.log('Subscription response success:', subscriptionResponse.value.success);
        // Backend returns subscription directly in the response (not wrapped in data)
        const subscriptionData = (subscriptionResponse.value as any).subscription || (subscriptionResponse.value as any).data?.subscription || null;
        setSubscription(subscriptionData);
        console.log('✅ Subscription loaded:', subscriptionData);
      } else if (subscriptionResponse.status === 'rejected') {
        console.error('❌ Subscription fetch failed:', subscriptionResponse.reason);
      }

      // Handle monthly subscription status
      if (monthlyStatusResponse.status === 'fulfilled' && monthlyStatusResponse.value.success) {
        console.log('Monthly subscription status response data:', monthlyStatusResponse.value.data);
        // Backend may return status either in data (wrapped) or at top-level (already has success)
        const statusData =
          (monthlyStatusResponse.value as any).data ||
          (monthlyStatusResponse.value as any) ||
          null;
        setMonthlySubscriptionStatus(statusData as MonthlySubscriptionStatus | null);
      } else if (monthlyStatusResponse.status === 'rejected') {
        console.error('Error fetching monthly subscription status:', monthlyStatusResponse.reason);
      }

      // Handle payments
      if (paymentsResponse.status === 'fulfilled' && paymentsResponse.value.success) {
        // Backend returns payments directly in data field (wrapped by api.ts)
        const paymentsDataRaw = (paymentsResponse.value as any).data;
        const paymentsData = Array.isArray(paymentsDataRaw) ? paymentsDataRaw : paymentsDataRaw?.payments || [];
        setPayments(paymentsData);
      }

      // Handle subscription plans
      if (plansResponse.status === 'fulfilled' && plansResponse.value.success) {
        // Backend returns plans directly in data field (wrapped by api.ts)
        const plansDataRaw = (plansResponse.value as any).data;
        const plansData = Array.isArray(plansDataRaw) ? plansDataRaw : plansDataRaw?.plans || [];
        setSubscriptionPlans(plansData as SubscriptionPlan[]);
      }

      // Handle maid assignment
      if (maidAssignmentResponse.status === 'fulfilled' && maidAssignmentResponse.value.success) {
        console.log('✅ Maid assignment loaded:', maidAssignmentResponse.value.data);
        setMaidAssignment(maidAssignmentResponse.value.data || null);
      } else if (maidAssignmentResponse.status === 'rejected') {
        console.warn('⚠️ Maid assignment fetch failed:', maidAssignmentResponse.reason);
        setMaidAssignment(null);
      }


      // Check buffer access after subscription is loaded
      if (subscriptionResponse.status === 'fulfilled' && subscriptionResponse.value.success) {
        const finalSubscription = (subscriptionResponse.value as any).subscription || subscriptionResponse.value.data?.subscription || null;
        if (finalSubscription && finalSubscription.plan) {
          setHasBufferAccess(finalSubscription.plan.hasBufferSystem || false);
          setBufferAccessLoading(false);
        } else {
          setHasBufferAccess(false);
          setBufferAccessLoading(false);
        }
      } else {
        setHasBufferAccess(false);
        setBufferAccessLoading(false);
      }

      // Fetch buffer data if subscription exists and has buffer access
      let currentSubscription: Subscription | null = subscription;
      if (subscriptionResponse.status === 'fulfilled' && subscriptionResponse.value.success) {
        const finalSubscription = (subscriptionResponse.value as any).subscription || subscriptionResponse.value.data?.subscription || null;
        currentSubscription = finalSubscription as Subscription | null;
      }

      if (currentSubscription && currentSubscription.plan?.hasBufferSystem) {
        try {
          const [bufferInfoResponse, bufferHistoryResponse] = await Promise.allSettled([
            BufferService.getRemainingBufferDays(currentSubscription.id),
            BufferService.getBufferHistory(currentSubscription.id, 1, 5)
          ]);

          if (bufferInfoResponse.status === 'fulfilled' && bufferInfoResponse.value.success) {
            setBufferInfo(bufferInfoResponse.value.data);
          }

          if (bufferHistoryResponse.status === 'fulfilled' && bufferHistoryResponse.value.success) {
            setBufferHistory(bufferHistoryResponse.value.data.history || []);
          }
        } catch (bufferError) {
          console.error('Error fetching buffer data:', bufferError);
        }
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
    // ✅ FIXED: Only consider subscription active if status is ACTIVE (not PENDING_PAYMENT)
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

  const handleBookNowClick = () => {
    console.log('🔍 HandleBookNowClick - Subscription Status:', {
      subscriptionExists: !!subscription,
      subscriptionStatus: subscription?.status,
      isInBufferPeriod,
      shouldDisableBooking: shouldDisableBooking(),
      bufferLoading
    });

    // ✅ FIXED: Check for ACTIVE subscription, not just existence
    if (!subscription || subscription.status !== 'ACTIVE') {
      if (!subscription) {
        toast({
          title: 'Subscription Required',
          description: 'You need an active subscription to book services.',
          variant: 'destructive'
        });
      } else if (subscription.status === 'PENDING_PAYMENT') {
        toast({
          title: 'Payment Pending',
          description: `Your subscription payment is pending. Please complete your payment to book services.`,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Subscription Inactive',
          description: `Your subscription is ${subscription.status}. Please renew to book services.`,
          variant: 'destructive'
        });
      }
      return;
    }

    // Check if customer is currently in buffer period using the hook
    if (shouldDisableBooking()) {
      console.log('🚫 Booking blocked due to buffer period');
      toast({
        title: '🚫 Booking Services Paused',
        description: getBufferPeriodMessage(),
        variant: 'destructive',
        duration: 10000, // Show for 10 seconds for better visibility
      });
      return;
    }

    console.log('✅ Opening booking modal - no buffer period detected');
    // Open booking modal if no buffer period conflict
    setIsBookingModalOpen(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <UserDashboardSkeleton />
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

  // Restrict access to CUSTOMER users only
  if (user.role !== 'CUSTOMER') {
    return (
      <DashboardLayout>
        <div className="text-center p-8">
          <AlertTriangle className="mx-auto mb-4 text-yellow-500" size={48} />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            This dashboard is only available for customers. Please navigate to your appropriate dashboard.
          </p>
          <div className="space-x-4">
            {user.role === 'MAID' && (
              <Link to="/maid-dashboard">
                <Button>Go to Homecare Partner Dashboard</Button>
              </Link>
            )}
            {user.role === 'ADMIN' && (
              <Link to="/admin-dashboard">
                <Button>Go to Admin Dashboard</Button>
              </Link>
            )}
            <Link to="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Buffer Period Alert - Show prominently at top */}
      <BufferPeriodAlert 
        isVisible={isInBufferPeriod}
        endDate={getFormattedEndDate()}
        className="mb-6"
      />
      
      {/* Personalized Welcome Message */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-lg text-gray-600">
          Here's your comprehensive dashboard with all your activity and details.
        </p>
      </div>
      
      <QuickBookingForm 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={() => {
          setIsBookingModalOpen(false);
          fetchUserDashboardData();
        }}
      />
      
      <div className="space-y-6">

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 slide-up">
          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Month's Bookings
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

          <Card className={`dashboard-card ${subscription?.status === 'PENDING_PAYMENT' ? 'border-orange-400 bg-orange-50' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {subscription?.status === 'PENDING_PAYMENT' ? 'Subscription Pending' : 'Active Subscription Plan'}
              </CardTitle>
              <Package className={`h-5 w-5 ${subscription?.status === 'PENDING_PAYMENT' ? 'text-orange-500' : 'text-primary'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${subscription?.status === 'PENDING_PAYMENT' ? 'text-orange-600' : 'text-foreground'}`}>
                {subscription ? subscription.plan?.name : 'No Active Plan'}
              </div>
              {subscription?.status === 'PENDING_PAYMENT' && (
                <div className="mt-3 space-y-3">
                  <div className="p-2 bg-orange-100 border border-orange-300 rounded text-sm text-orange-700">
                    ⚠️ Payment pending - Complete your payment to activate this plan
                  </div>
                  <Link to="/payment-options" state={{ fromDashboard: true, subscriptionId: subscription.id }}>
                    <Button className="w-full btn-hero">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Complete Payment
                    </Button>
                  </Link>
                </div>
              )}
              {subscription?.status === 'ACTIVE' && (
                <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded text-sm text-green-700">
                  ✓ Subscription Active
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Next Billing Date
              </CardTitle>
              <Calendar className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              {subscription && subscription.status === 'ACTIVE' ? (
                subscription.nextBillDate ? (
                  <div className="text-2xl font-bold text-foreground">
                    {new Date(subscription.nextBillDate).toLocaleDateString()}
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-foreground">Not available</div>
                )
              ) : subscription && subscription.status === 'PENDING_PAYMENT' ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground text-sm">
                    Complete payment to see billing details
                  </p>
                </div>
              ) : (
                <div className="text-center">
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

        {/* Maid Assignment & Plan Features Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Maid Assignment Card */}
          <div className="slide-up">
            <MaidAssignmentCard
              assignment={maidAssignment}
              onRefresh={fetchUserDashboardData}
              hasSubscription={!!subscription && subscription.status === 'ACTIVE'}
            />
          </div>

          {/* Plan Features Card */}
          <Card className="dashboard-card slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Plan Features
              </CardTitle>
              <CardDescription>What's included in your subscription</CardDescription>
            </CardHeader>
            <CardContent>
              {subscription && subscription.plan ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Sessions Per Week</p>
                      <p className="text-2xl font-bold text-primary">{subscription.plan.sessionsPerWeek || 0}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Sessions Per Month</p>
                      <p className="text-2xl font-bold text-primary">{subscription.plan.sessionsPerMonth || 0}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Included Features:</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">Professional cleaning services</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{subscription.plan.sessionsPerMonth || 0} sessions per month</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">Dedicated homecare partner assignment</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Plan Duration:</span>
                      <Badge variant="outline">{subscription.plan.duration || 1} month{(subscription.plan.duration || 1) > 1 ? 's' : ''}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Billing Cycle:</span>
                      <Badge variant="secondary">{subscription.billingCycle}</Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-semibold mb-2">No Active Plan</h4>
                  <p className="text-muted-foreground text-sm mb-4">
                    Subscribe to a plan to see available features
                  </p>
                  <Link to="/subscription">
                    <Button className="btn-hero">
                      View Plans
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Subscription Details - Full Width */}
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
                <Button 
                  className={`btn-hero ${shouldDisableBooking() ? 'border-orange-300 text-orange-600 bg-orange-50 hover:bg-orange-100' : ''}`}
                  onClick={handleBookNowClick}
                  disabled={shouldDisableBooking() || bufferLoading}
                >
                  {bufferLoading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : shouldDisableBooking() ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Services Paused (Until {getFormattedEndDate()})
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Now
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feedback Section - Show single feedback card for most recent completed service */}
        {user && isAuthenticated && (
          <div className="slide-up">
            <FeedbackCard onFeedbackSubmitted={fetchUserDashboardData} />
          </div>
        )}
        
        {/* Debug: Check if there are completed bookings */}
        {user && isAuthenticated && bookings.length > 0 && (
          <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
            <p>Debug: Total bookings: {bookings.length}</p>
            <p>Completed bookings: {bookings.filter(b => b.status === 'COMPLETED').length}</p>
            <p>Check browser console (F12) for FeedbackCard logs</p>
          </div>
        )}
      </div>

      {/* Floating Buffer Button for SweePro Lux Users */}
      {hasBufferAccess && !bufferAccessLoading && (
        <Link to="/buffer">
          <Button
            className={`
              fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg 
              flex items-center justify-center z-50 transition-all duration-200
              hover:shadow-xl hover:scale-105
              ${isInBufferPeriod 
                ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
              }
            `}
            size="lg"
            title={isInBufferPeriod ? "Resume Services - Click to manage" : "Pause Services - Click to manage"}
          >
            {isInBufferPeriod ? (
              <Play className="h-6 w-6" />
            ) : (
              <Pause className="h-6 w-6" />
            )}
            
            {/* Status indicator */}
            <span className={`
              absolute -top-1 -right-1 h-3 w-3 rounded-full
              ${isInBufferPeriod 
                ? 'bg-orange-300 animate-pulse' 
                : 'bg-green-400 animate-pulse'
              }
            `}></span>
          </Button>
        </Link>
      )}
    </DashboardLayout>
  );
}