import { useEffect, useRef, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { useBufferPeriod } from '@/hooks/useBufferPeriod';
import { BookingService, Booking } from '@/services/bookingService';
import { SubscriptionService, Subscription, SubscriptionPlan, MonthlySubscriptionStatus } from '@/services/subscriptionService';
import { PaymentService, Payment } from '@/services/paymentService';
import { MonthlySubscriptionCard } from '@/components/dashboard/MonthlySubscriptionCard';
import { BufferService, BufferInfo, BufferPeriod } from '@/services/bufferService';
import { useToast } from '@/hooks/use-toast';
import { Calendar, CreditCard, Clock, CheckCircle, AlertTriangle, TrendingUp, DollarSign, Package, Users, Pause, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QuickBookingForm } from '@/components/forms/QuickBookingForm';
import { BufferDaysRequestDialog } from '@/components/forms/BufferDaysRequestDialog';
import { BufferPeriodAlert } from '@/components/ui/BufferPeriodAlert';
import { Skeleton } from '@/components/ui/Skeleton';
import { InstagramSkeleton, DashboardStatsSkeleton, BookingSkeleton } from '@/components/ui/InstagramSkeleton';
import { 
  DashboardStatsSkeleton as OptimizedStatsSkeleton, 
  BookingListSkeleton, 
  PageLoadingSkeleton,
  IncrementalLoadingSkeleton,
  LoadingSpinner
} from '@/components/ui/OptimizedSkeletons';
import { useDashboardRecentBookings } from '@/hooks/useDashboardRecentBookings';

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
  const [bufferInfo, setBufferInfo] = useState<BufferInfo | null>(null);
  const [bufferHistory, setBufferHistory] = useState<BufferPeriod[]>([]);
  const [isBufferRequestDialogOpen, setIsBufferRequestDialogOpen] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
    activeSubscription: false,
    upcomingBookings: 0
  });

  // Recent bookings for dashboard (cursor-based minimal projection)
  const {
    items: recentBookings,
    isLoading: recentBookingsLoading,
    isFetchingNextPage: recentBookingsFetchingNext,
    hasNextPage: recentBookingsHasNext,
    fetchNextPage: fetchNextRecentBookings,
  } = useDashboardRecentBookings(5);
  const bookingsSentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = bookingsSentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && recentBookingsHasNext && !recentBookingsFetchingNext) {
        fetchNextRecentBookings();
      }
    }, { root: null, rootMargin: '200px', threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [fetchNextRecentBookings, recentBookingsHasNext, recentBookingsFetchingNext]);

  useEffect(() => {
    if (user && isAuthenticated) {
      console.log('UserDashboard - Current User Data:', user);
      fetchUserDashboardData();
      
      // Set up periodic refresh for buffer data (every 30 seconds)
      const interval = setInterval(() => {
        if (subscription) {
          refreshBufferData();
        }
      }, 30000);
      
      setRefreshInterval(interval);
      
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }
  }, [user, isAuthenticated, subscription?.id]);

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
        // Backend returns { subscription: Subscription } wrapped by api.ts in data
        const subscriptionData = subscriptionResponse.value.data?.subscription || null;
        setSubscription(subscriptionData);

        // If monthly-status is missing or not active, but we have an ACTIVE subscription,
        // derive a minimal MonthlySubscriptionStatus so the UI reflects the active state.
        if (subscriptionData && subscriptionData.status === 'ACTIVE') {
          setMonthlySubscriptionStatus((prev) => {
            if (prev?.hasActiveSubscription) return prev;
            return {
              success: true,
              hasActiveSubscription: true,
              subscription: subscriptionData as any,
              currentCycle: subscriptionData.currentCycleStart && subscriptionData.currentCycleEnd ? {
                id: subscriptionData.id,
                subscriptionId: subscriptionData.id,
                cycleNumber: subscriptionData.completedCycles ? subscriptionData.completedCycles + 1 : 1,
                startDate: subscriptionData.currentCycleStart,
                endDate: subscriptionData.currentCycleEnd || subscriptionData.endDate,
                status: subscriptionData.isInBufferPeriod ? 'IN_BUFFER' : 'ACTIVE',
                totalServices: subscriptionData.plan?.sessionsPerMonth || 0,
                completedServices: 0,
                skippedServices: 0,
                bufferDaysUsed: subscriptionData.bufferDaysUsed || 0,
                isBufferActive: !!subscriptionData.isInBufferPeriod,
                paymentStatus: 'COMPLETED',
                amount: subscriptionData.amount,
                createdAt: subscriptionData.startDate,
                updatedAt: subscriptionData.updatedAt,
              } : undefined,
              activeBuffer: subscriptionData.isInBufferPeriod ? {
                id: `${subscriptionData.id}-buffer` as any,
                subscriptionId: subscriptionData.id,
                startDate: subscriptionData.bufferStartDate || subscriptionData.currentCycleStart || subscriptionData.startDate,
                endDate: subscriptionData.bufferEndDate || subscriptionData.currentCycleEnd || subscriptionData.endDate,
                status: 'ACTIVE',
                reason: 'CUSTOMER_REQUEST',
                daysCount: (subscriptionData.bufferDaysCount || 0),
                servicesSkipped: 0,
                autoResumeDate: subscriptionData.bufferEndDate || subscriptionData.currentCycleEnd || subscriptionData.endDate,
                isAutomatic: false,
                createdAt: subscriptionData.createdAt,
                updatedAt: subscriptionData.updatedAt,
              } : undefined,
              daysUntilBuffer: subscriptionData.isInBufferPeriod ? 0 : undefined,
              summary: {
                servicesThisMonth: subscriptionData.plan?.sessionsPerMonth || 0,
                bufferPeriodActive: !!subscriptionData.isInBufferPeriod,
                cycleProgress: 0,
              },
            } as any;
          });
        }
      }

      // Handle monthly subscription status
      if (monthlyStatusResponse.status === 'fulfilled' && monthlyStatusResponse.value.success) {
        console.log('Monthly subscription status response data:', monthlyStatusResponse.value.data);
        // Backend returns status in the 'data' property
        const statusData = monthlyStatusResponse.value.data || null;
        // Only overwrite if API indicates an active subscription, otherwise keep any derived active state
        setMonthlySubscriptionStatus((prev) => {
          if (statusData?.hasActiveSubscription) return statusData;
          return prev ?? statusData;
        });
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

      // Fetch buffer data if subscription exists
      let currentSubscription: Subscription | null = subscription;
      if (subscriptionResponse.status === 'fulfilled' && subscriptionResponse.value.success) {
        // Backend returns { subscription: Subscription } wrapped by api.ts
        currentSubscription = subscriptionResponse.value.data?.subscription || null;
      }

      if (currentSubscription) {
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
    // Sum completed payments
    let totalSpent = payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);
    const activeSubscription = subscription?.status === 'ACTIVE';
    // Frontend dummy fallback for display only: if no payments yet but active subscription exists
    if (totalSpent === 0 && activeSubscription && subscription?.amount) {
      totalSpent = subscription.amount;
    }

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

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  const refreshBufferData = async () => {
    if (!subscription) return;
    
    try {
      const [bufferInfoResponse, bufferHistoryResponse] = await Promise.allSettled([
        BufferService.getRemainingBufferDays(subscription.id),
        BufferService.getBufferHistory(subscription.id, 1, 5)
      ]);

      if (bufferInfoResponse.status === 'fulfilled' && bufferInfoResponse.value.success) {
        setBufferInfo(bufferInfoResponse.value.data || null);
      }

      if (bufferHistoryResponse.status === 'fulfilled' && bufferHistoryResponse.value.success) {
        setBufferHistory(bufferHistoryResponse.value.data?.history || []);
      }
    } catch (error) {
      console.error('Error refreshing buffer data:', error);
    }
  };

  const handleBookNowClick = () => {
    console.log('🔍 HandleBookNowClick - Buffer Status:', {
      isInBufferPeriod,
      shouldDisableBooking: shouldDisableBooking(),
      bufferLoading,
      subscription: !!subscription
    });

    if (!subscription) {
      toast({
        title: 'Subscription Required',
        description: 'You need an active subscription to book services.',
        variant: 'destructive'
      });
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
        <PageLoadingSkeleton type="dashboard" />
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
      {/* Buffer Period Alert - Show prominently at the top */}
      <BufferPeriodAlert 
        isVisible={isInBufferPeriod}
        endDate={getFormattedEndDate()}
        className="mb-6"
      />
      
      <QuickBookingForm 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={() => {
          setIsBookingModalOpen(false);
          fetchUserDashboardData();
        }}
      />
      
      {subscription && bufferInfo && (
        <BufferDaysRequestDialog
          isOpen={isBufferRequestDialogOpen}
          onClose={() => setIsBufferRequestDialogOpen(false)}
          onSuccess={() => {
            setIsBufferRequestDialogOpen(false);
            // Refresh buffer data immediately after request
            refreshBufferData();
            // Also refresh full dashboard data to update stats
            fetchUserDashboardData();
          }}
          subscriptionId={subscription.id}
          remainingBufferDays={bufferInfo.remaining}
        />
      )}
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
          {/* Buffer Days Management */}
          <Card className="dashboard-card slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pause className="h-5 w-5" />
                Buffer Days
              </CardTitle>
              <CardDescription>Pause your cleaning services when needed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {bufferInfo ? (
                <>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{bufferInfo.total}</div>
                      <p className="text-xs text-muted-foreground">Total Days</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-warning">{bufferInfo.used}</div>
                      <p className="text-xs text-muted-foreground">Used Days</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-success">{bufferInfo.remaining}</div>
                      <p className="text-xs text-muted-foreground">Remaining</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gradient-feature rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Next Reset:</span>
                      <span className="text-sm">{new Date(bufferInfo.resetDate).toLocaleDateString()}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${((bufferInfo.total - bufferInfo.remaining) / bufferInfo.total) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(((bufferInfo.total - bufferInfo.remaining) / bufferInfo.total) * 100)}% used
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      className="w-full" 
                      onClick={() => setIsBufferRequestDialogOpen(true)}
                      disabled={bufferInfo.remaining === 0}
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Request Buffer Days
                    </Button>
                    
                    {bufferHistory.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Recent Buffer Periods</h4>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={refreshBufferData}
                            className="h-6 px-2 text-xs"
                          >
                            Refresh
                          </Button>
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {bufferHistory.slice(0, 3).map((period) => (
                            <div key={period.id} className="flex items-center justify-between p-2 bg-muted/20 rounded text-sm">
                              <div>
                                <span className="font-medium">{period.daysCount} days</span>
                                <span className="text-muted-foreground ml-2">
                                  {new Date(period.startDate).toLocaleDateString()}
                                </span>
                                {period.status === 'PENDING' && (
                                  <span className="text-xs text-muted-foreground block">
                                    Awaiting approval
                                  </span>
                                )}
                                {period.status === 'CANCELLED' && period.rejectionReason && (
                                  <span className="text-xs text-destructive block">
                                    Rejected: {period.rejectionReason}
                                  </span>
                                )}
                              </div>
                              <Badge variant={
                                period.status === 'PENDING' ? 'outline' :
                                period.status === 'ACTIVE' ? 'default' :
                                period.status === 'COMPLETED' ? 'secondary' : 'destructive'
                              } className="text-xs">
                                {period.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Pause className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-semibold mb-2">Buffer Days Not Available</h4>
                  <p className="text-muted-foreground text-sm">
                    Buffer days are available with active subscriptions
                  </p>
                </div>
              )}
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

        {/* Recent Bookings (infinite) */}
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
            {recentBookingsLoading ? (
              <BookingListSkeleton count={5} />
            ) : recentBookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-semibold mb-2">No Bookings Yet</h4>
                <p className="text-muted-foreground text-sm">Your recent bookings will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
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
                {recentBookingsFetchingNext && (
                  <IncrementalLoadingSkeleton type="bookings" count={2} />
                )}
                <div ref={bookingsSentinelRef} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        {/* <Card className="dashboard-card slide-up">
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
        </Card> */}
      </div>
    </DashboardLayout>
  );
}
