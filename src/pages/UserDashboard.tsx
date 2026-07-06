import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { useUserSubscription, useSubscriptionPlans, useMonthlySubscriptionStatus } from '@/hooks/queries/useSubscriptionQueries';
import { useUserBookings } from '@/hooks/queries/useBookingQueries';
import { useAllUserPayments } from '@/hooks/queries/usePaymentQueries';
import { useCurrentMaidAssignment } from '@/hooks/queries/useMaidAssignmentQuery';
import { useBufferStatus, useBufferInfo, useBufferHistory } from '@/hooks/queries/useBufferQueries';
import { bookingKeys } from '@/lib/queryKeys';
import { maidAssignmentKeys } from '@/lib/queryKeys';
import { MaidAssignmentCard } from '@/components/dashboard/MaidAssignmentCard';
import UserDashboardSkeleton from '@/components/dashboard/UserDashboardSkeleton';
import { useToast } from '@/hooks/use-toast';
import { Calendar, CreditCard, Clock, CheckCircle, AlertTriangle, TrendingUp, DollarSign, Package, Users, Pause, Play, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QuickBookingForm } from '@/components/forms/QuickBookingForm';
import { BufferPeriodAlert } from '@/components/ui/BufferPeriodAlert';
import { FeedbackCard } from '@/components/feedback/FeedbackCard';

export default function UserDashboard() {
  const { user, isAuthenticated } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isCustomer = user?.role === 'CUSTOMER';

  // ── React Query hooks ─────────────────────────────────────────────────────
  const { data: subscription, isLoading: subLoading } = useUserSubscription(isCustomer);
  const { data: _plans } = useSubscriptionPlans();
  const { data: monthlySubscriptionStatus } = useMonthlySubscriptionStatus(isCustomer);
  const { data: bookings = [], isLoading: bookingsLoading } = useUserBookings('CUSTOMER', 'all');
  const { data: payments = [] } = useAllUserPayments();
  const { data: maidAssignment } = useCurrentMaidAssignment(isCustomer);
  const { data: bufferInfo } = useBufferInfo(subscription?.id);
  const { data: bufferHistory = [] } = useBufferHistory(subscription?.id);

  // Buffer status derived from cached subscription — no extra API call
  const {
    isInBufferPeriod,
    hasBufferAccess,
    shouldDisableBooking,
    getBufferPeriodMessage,
    getFormattedEndDate,
    isLoading: bufferLoading,
  } = useBufferStatus();

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // ── Derived stats (replaces calculateStats + useEffect) ───────────────────
  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
    const upcomingBookings = bookings.filter(b =>
      b.status === 'PENDING' || b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS'
    ).length;
    const totalSpent = payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);
    const activeSubscription = subscription?.status === 'ACTIVE';
    return { totalBookings, completedBookings, totalSpent, activeSubscription, upcomingBookings };
  }, [bookings, payments, subscription]);

  // ── Refresh helper (used by QuickBookingForm.onSuccess, FeedbackCard, MaidAssignmentCard) ─
  const refreshDashboard = () => {
    queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    queryClient.invalidateQueries({ queryKey: maidAssignmentKeys.all });
  };

  const handleBookNowClick = () => {
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

    if (shouldDisableBooking()) {
      toast({
        title: 'Booking Services Paused',
        description: getBufferPeriodMessage(),
        variant: 'destructive',
        duration: 10000,
      });
      return;
    }

    setIsBookingModalOpen(true);
  };

  // ── Loading / Auth guards ─────────────────────────────────────────────────
  // Show skeleton while ANY critical data is still doing its initial load
  // (isLoading in React Query v5 = isPending && isFetching, so it's only true
  // when there is NO cached data and a fetch is in progress — return visits
  // with valid cache will have isLoading=false and skip this guard entirely.)
  const isInitialLoad = subLoading || bookingsLoading;
  if (isInitialLoad) {
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
              <Link to="/admin">
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
      <div className="mb-6 text-center px-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-sm sm:text-lg text-gray-600">
          Here's your comprehensive dashboard with all your activity and details.
        </p>
      </div>

      <QuickBookingForm
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={() => {
          setIsBookingModalOpen(false);
          refreshDashboard();
        }}
      />

      <div className="space-y-6">

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 slide-up">
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
                    Payment pending - Complete your payment to activate this plan
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
                  Subscription Active
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
              assignment={maidAssignment ?? null}
              onRefresh={refreshDashboard}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div>
                      <span className="font-medium">Amount:</span>
                      <p className="text-lg font-bold text-primary">{subscription.amount.toLocaleString()}</p>
                      {subscription.discount > 0 && (
                        <p className="text-xs text-success">-{subscription.discount.toLocaleString()} discount</p>
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
                  <Link to="/payments">
                    <Button className="w-full" variant="outline">
                      View History
                    </Button>
                  </Link>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Calendar className="h-5 w-5" />
                  Recent Bookings
                </CardTitle>
                <CardDescription className="text-sm">Your recent and upcoming cleaning sessions</CardDescription>
              </div>
              <Link to="/bookings">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3">
                    <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 sm:mt-0 ${
                        booking.status === 'COMPLETED' ? 'bg-success' :
                        booking.status === 'PENDING' || booking.status === 'CONFIRMED' ? 'bg-primary' :
                        booking.status === 'IN_PROGRESS' ? 'bg-warning' : 'bg-destructive'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">{booking.service?.name || 'Service'}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {new Date(booking.scheduledAt).toLocaleDateString()} at {new Date(booking.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        {booking.serviceAddress && (
                          <p className="text-xs text-muted-foreground truncate">{booking.serviceAddress}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end gap-2 sm:gap-1 pl-6 sm:pl-0">
                      <Badge variant={
                        booking.status === 'COMPLETED' ? 'default' :
                        booking.status === 'PENDING' || booking.status === 'CONFIRMED' ? 'secondary' :
                        booking.status === 'IN_PROGRESS' ? 'outline' : 'destructive'
                      } className="text-xs">
                        {booking.status}
                      </Badge>
                      {booking.finalAmount && (
                        <p className="text-sm font-medium">
                          {booking.finalAmount.toLocaleString()}
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feedback Section */}
        {user && isAuthenticated && (
          <div className="slide-up">
            <FeedbackCard onFeedbackSubmitted={refreshDashboard} />
          </div>
        )}
      </div>

      {/* Floating Buffer Button for Sweepro Lux Users */}
      {hasBufferAccess && !bufferLoading && (
        <Link to="/buffer">
          <Button
            className={`
              fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg
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
              <Play className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <Pause className="h-5 w-5 sm:h-6 sm:w-6" />
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
