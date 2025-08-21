import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { BookingService, Booking } from '@/services/bookingService';
import { SubscriptionService, Subscription, SubscriptionPlan } from '@/services/subscriptionService';
import { PaymentService, Payment } from '@/services/paymentService';
import { useToast } from '@/hooks/use-toast';
import { Calendar, CreditCard, Clock, CheckCircle, AlertTriangle, TrendingUp, DollarSign, Package, Users, Settings, Bell, Star, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QuickBookingForm } from '@/components/forms/QuickBookingForm';

// Service interface to match backend
interface Service {
  id: string;
  name: string;
  description: string;
  category: 'CLEANING' | 'DEEP_CLEANING' | 'MAINTENANCE' | 'SPECIAL_EVENT';
  baseDuration: number;
  basePrice: number;
  isActive: boolean;
  bufferTime?: number;
  maxDailyBookings?: number;
  isSubscriptionService: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function UserDashboard() {
  const { user, refreshUser, isAuthenticated } = useUser();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
    activeSubscription: false,
    upcomingBookings: 0,
    nextUpcomingBooking: null as Booking | null
  });

  // Booking form state
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingFormDate, setBookingFormDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (user && isAuthenticated) {
      fetchUserDashboardData();
    }
  }, [user, isAuthenticated]);

  const fetchUserDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [bookingsResponse, subscriptionResponse, paymentsResponse, plansResponse] = await Promise.allSettled([
        BookingService.getUserBookings(),
        SubscriptionService.getUserSubscription(),
        PaymentService.getUserPayments(),
        SubscriptionService.getSubscriptionPlans()
      ]);

      // Handle bookings
      if (bookingsResponse.status === 'fulfilled' && bookingsResponse.value.success) {
        // Backend returns array directly or wrapped in data field
        const bookingsData = Array.isArray(bookingsResponse.value.data) ? 
          bookingsResponse.value.data : 
          bookingsResponse.value.data?.bookings || 
          bookingsResponse.value.bookings || [];
        setBookings(bookingsData);
      }

      // Handle subscription - backend returns subscription object directly
      if (subscriptionResponse.status === 'fulfilled' && subscriptionResponse.value.success) {
        // Backend controller returns subscription directly without wrapping
        const subscriptionData = subscriptionResponse.value.data || subscriptionResponse.value.subscription || null;
        setSubscription(subscriptionData);
      } else if (subscriptionResponse.status === 'rejected') {
        // No subscription found - this is normal for new users
        console.log('No active subscription found');
        setSubscription(null);
      }

      // Handle payments
      if (paymentsResponse.status === 'fulfilled' && paymentsResponse.value.success) {
        // Backend returns array directly or wrapped
        const paymentsData = Array.isArray(paymentsResponse.value.data) ? 
          paymentsResponse.value.data : 
          paymentsResponse.value.data?.payments || 
          paymentsResponse.value.payments || [];
        setPayments(paymentsData);
      }

      // Handle subscription plans - backend returns ServicePlan array
      if (plansResponse.status === 'fulfilled' && plansResponse.value.success) {
        // Backend returns ServicePlan array directly
        const plansData = Array.isArray(plansResponse.value.data) ? 
          plansResponse.value.data : 
          plansResponse.value.data?.plans || 
          plansResponse.value.plans || [];
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
    );
    const nextUpcomingBooking = upcomingBookings
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
    
    const totalSpent = payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);
    const activeSubscription = subscription?.status === 'ACTIVE';

    setStats({
      totalBookings,
      completedBookings,
      totalSpent,
      activeSubscription,
      upcomingBookings: upcomingBookings.length,
      nextUpcomingBooking
    });
  };

  useEffect(() => {
    if (bookings.length > 0 || payments.length > 0 || subscription) {
      calculateStats();
    }
  }, [bookings, payments, subscription]);

  // Booking form handlers
  const handleOpenBookingForm = (date?: Date) => {
    setBookingFormDate(date);
    setShowBookingForm(true);
  };

  const handleCloseBookingForm = () => {
    setShowBookingForm(false);
    setBookingFormDate(undefined);
  };

  const handleBookingSuccess = async () => {
    // Refresh dashboard data after successful booking
    await fetchUserDashboardData();
    toast({
      title: 'Booking Created!',
      description: 'Your booking has been successfully created and is now visible in your dashboard.',
    });
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
          
          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming Booking
              </CardTitle>
              <Calendar className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              {stats.nextUpcomingBooking ? (
                <>
                  <div className="text-lg font-bold text-foreground">
                    {new Date(stats.nextUpcomingBooking.scheduledAt).toLocaleDateString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(stats.nextUpcomingBooking.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                  <p className="text-xs text-primary mt-1 font-medium">
                    {stats.nextUpcomingBooking.service?.name || 'Service'}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">None</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    No upcoming bookings
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Visits
              </CardTitle>
              <CheckCircle className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.completedBookings} completed visits
              </p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Next Payment
              </CardTitle>
              <DollarSign className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              {subscription && subscription.nextBillDate ? (
                <>
                  <div className="text-lg font-bold text-foreground">
                    {new Date(subscription.nextBillDate).toLocaleDateString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    ₹{subscription.amount?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-primary mt-1 font-medium">
                    {subscription.plan?.name || 'Subscription'}
                  </p>
                </>
              ) : subscription && subscription.endDate ? (
                <>
                  <div className="text-lg font-bold text-foreground">
                    {new Date(subscription.endDate).toLocaleDateString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Expiry Date
                  </p>
                  <p className="text-xs text-warning mt-1 font-medium">
                    {subscription.plan?.name || 'Plan expires'}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">None</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    No active subscription
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Statistics */}
          <Card className="dashboard-card slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Booking Analytics
              </CardTitle>
              <CardDescription>Your booking statistics and performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-feature rounded-lg border">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{stats.totalBookings}</div>
                    <div className="text-sm text-muted-foreground mt-1">Total Bookings</div>
                  </div>
                </div>
                <div className="p-4 bg-gradient-feature rounded-lg border">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-success">{stats.completedBookings}</div>
                    <div className="text-sm text-muted-foreground mt-1">Completed</div>
                  </div>
                </div>
                <div className="p-4 bg-gradient-feature rounded-lg border">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-warning">{stats.upcomingBookings}</div>
                    <div className="text-sm text-muted-foreground mt-1">Upcoming</div>
                  </div>
                </div>
                <div className="p-4 bg-gradient-feature rounded-lg border">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {stats.totalBookings > 0 ? Math.round((stats.completedBookings / stats.totalBookings) * 100) : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Success Rate</div>
                  </div>
                </div>
              </div>
              
              {/* Recent Booking Info */}
              {stats.nextUpcomingBooking && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Next Booking Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Service:</span>
                      <span className="text-foreground">{stats.nextUpcomingBooking.service?.name || 'Service'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Date:</span>
                      <span className="text-foreground">{new Date(stats.nextUpcomingBooking.scheduledAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Time:</span>
                      <span className="text-foreground">{new Date(stats.nextUpcomingBooking.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Status:</span>
                      <Badge variant="secondary">{stats.nextUpcomingBooking.status}</Badge>
                    </div>
                    {stats.nextUpcomingBooking.maid?.name && (
                      <div className="flex items-center gap-2 md:col-span-2">
                        <span className="font-medium">Assigned Maid:</span>
                        <span className="text-foreground">{stats.nextUpcomingBooking.maid.name}</span>
                      </div>
                    )}
                    {stats.nextUpcomingBooking.serviceAddress && (
                      <div className="flex items-start gap-2 md:col-span-2">
                        <span className="font-medium">Address:</span>
                        <span className="text-foreground">{stats.nextUpcomingBooking.serviceAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-2 pt-4">
                <Link to="/bookings">
                  <Button className="w-full" variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    View All Bookings
                  </Button>
                </Link>
               
              </div>
            </CardContent>
          </Card>

        {/* Quick Booking Section */}
          <Card className="dashboard-card slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Quick Booking
              </CardTitle>
              <CardDescription>Book your maid services with your subscription plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Today Booking */}
              <div className="p-4 bg-gradient-feature rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-foreground">Book for Today</h4>
                  <Badge className="bg-success text-success-foreground">Available</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Schedule cleaning service for today based on your active plan
                </p>
                <Button 
                  className="btn-hero w-full"
                  onClick={() => handleOpenBookingForm(new Date())}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Book for Today
                </Button>
              </div>

              {/* Tomorrow Booking */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-foreground">Book for Tomorrow</h4>
                  {stats.nextUpcomingBooking && 
                   new Date(stats.nextUpcomingBooking.scheduledAt).toDateString() === new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString() ? (
                    <Badge variant="outline">Already Booked</Badge>
                  ) : (
                    <Badge className="bg-success text-success-foreground">Available</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {stats.nextUpcomingBooking && 
                   new Date(stats.nextUpcomingBooking.scheduledAt).toDateString() === new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString() ? (
                    `${new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()} - ${stats.nextUpcomingBooking.service?.name || 'Service'}`
                  ) : (
                    `Schedule for ${new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()}`
                  )}
                </p>
                {stats.nextUpcomingBooking && 
                 new Date(stats.nextUpcomingBooking.scheduledAt).toDateString() === new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString() ? (
                  <Button variant="outline" disabled className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Booking Confirmed
                  </Button>
                ) : (
                  <Button 
                    className="btn-hero w-full"
                    onClick={() => handleOpenBookingForm(new Date(Date.now() + 24 * 60 * 60 * 1000))}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Book for Tomorrow
                  </Button>
                )}
              </div>
              
              <div className="space-y-2 gap-4 ">
                <Link to="/bookings ">
                  <Button className="w-full justify-start mt-4" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    View All Bookings
                  </Button>
                </Link>
                
                <Link to="/subscription ">
                  <Button className="w-full justify-start mt-4" variant="outline">
                    <Package className="h-4 w-4 mr-2" />
                    Manage Subscription
                  </Button>
                </Link>
              </div>
              
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Recent Bookings */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Total Bookings Overview
                </CardTitle>
                <CardDescription>Comprehensive view of all your cleaning sessions with detailed information</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs px-2 py-1">
                  {stats.totalBookings} Total
                </Badge>
                <Link to="/bookings">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {/* Booking Statistics */}
                <div className="grid grid-cols-4 gap-4 p-4 bg-gradient-feature rounded-lg border">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stats.totalBookings}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Total Bookings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">{stats.completedBookings}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning">{stats.upcomingBookings}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Upcoming</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {stats.totalBookings > 0 ? Math.round((stats.completedBookings / stats.totalBookings) * 100) : 0}%
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Success Rate</div>
                  </div>
                </div>

                {/* Recent Bookings List */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recent Activity
                  </h4>
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`w-4 h-4 rounded-full mt-1 flex-shrink-0 ${
                            booking.status === 'COMPLETED' ? 'bg-success' : 
                            booking.status === 'PENDING' || booking.status === 'CONFIRMED' ? 'bg-primary' :
                            booking.status === 'IN_PROGRESS' ? 'bg-warning' : 'bg-destructive'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-foreground">{booking.service?.name || 'Service'}</p>
                              <Badge variant={
                                booking.status === 'COMPLETED' ? 'default' :
                                booking.status === 'PENDING' || booking.status === 'CONFIRMED' ? 'secondary' :
                                booking.status === 'IN_PROGRESS' ? 'outline' : 'destructive'
                              } size="sm">
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(booking.scheduledAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{new Date(booking.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                            </div>
                            {booking.serviceAddress && (
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full"></span>
                                {booking.serviceAddress}
                              </p>
                            )}
                            {booking.service?.description && (
                              <p className="text-xs text-muted-foreground mt-2 italic">
                                {booking.service.description}
                              </p>
                            )}
                            {booking.specialInstructions && (
                              <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
                                <span className="font-medium">Special Instructions: </span>
                                <span className="text-muted-foreground">{booking.specialInstructions}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          {booking.finalAmount && (
                            <p className="font-bold text-lg text-primary">
                              ₹{booking.finalAmount.toLocaleString()}
                            </p>
                          )}
                          {booking.estimatedDuration && (
                            <p className="text-xs text-muted-foreground mt-1">
                              ~{booking.estimatedDuration} mins
                            </p>
                          )}
                          {booking.maid?.name && (
                            <p className="text-xs text-muted-foreground mt-1">
                              by {booking.maid.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button className="flex-1" variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Cleaning
                  </Button>
                  <Button className="flex-1" variant="outline" size="sm">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Report Issue
                  </Button>
                  <Link to="/bookings" className="flex-1">
                    <Button className="w-full" size="sm">
                      View All Bookings
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-semibold text-lg mb-2">No Bookings Yet</h4>
                <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                  Start your cleaning journey today! Book your first professional cleaning service and experience the SweepPro difference.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button className="btn-hero">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Now
                  </Button>
                  <Link to="/subscription">
                    <Button variant="outline">
                      <Package className="h-4 w-4 mr-2" />
                      View Plans
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Payment History */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Details Overview
                </CardTitle>
                <CardDescription>Complete transaction history with comprehensive payment information from API responses</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs px-2 py-1">
                  {payments.length} Transactions
                </Badge>
                <Link to="/payments">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {payments.length > 0 ? (
              <div className="space-y-6">
                {/* Payment Analytics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-feature rounded-lg border">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">
                      ₹{payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Total Paid</div>
                    <div className="text-xs text-success mt-1">{payments.filter(p => p.status === 'COMPLETED').length} payments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning">
                      ₹{payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Pending</div>
                    <div className="text-xs text-warning mt-1">{payments.filter(p => p.status === 'PENDING').length} pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-destructive">
                      ₹{payments.filter(p => p.status === 'FAILED').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Failed</div>
                    <div className="text-xs text-destructive mt-1">{payments.filter(p => p.status === 'FAILED').length} failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {payments.length > 0 ? Math.round((payments.filter(p => p.status === 'COMPLETED').length / payments.length) * 100) : 0}%
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Success Rate</div>
                    <div className="text-xs text-primary mt-1">payment success</div>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Recent Transactions
                  </h4>
                  {payments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`w-4 h-4 rounded-full mt-1 flex-shrink-0 ${
                            payment.status === 'COMPLETED' ? 'bg-success' :
                            payment.status === 'PENDING' ? 'bg-warning' :
                            payment.status === 'FAILED' ? 'bg-destructive' : 'bg-muted-foreground'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-semibold text-foreground">
                                {payment.bookingId ? 'Booking Payment' : 
                                 payment.subscriptionId ? 'Subscription Payment' : 
                                 payment.type || 'Payment'}
                              </p>
                              <Badge variant={
                                payment.status === 'COMPLETED' ? 'default' :
                                payment.status === 'PENDING' ? 'outline' : 'destructive'
                              } size="sm">
                                {payment.status}
                              </Badge>
                            </div>
                            
                            {/* Payment Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <CreditCard className="h-4 w-4" />
                                <span>{payment.paymentMethod || 'Card'}</span>
                              </div>
                              {payment.transactionId && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                    ID: {payment.transactionId.slice(-8)}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {payment.description && (
                              <p className="text-xs text-muted-foreground mt-2 italic">
                                {payment.description}
                              </p>
                            )}
                            
                            {/* Additional payment details from API */}
                            {(payment.gatewayResponse || payment.failureReason) && (
                              <div className="mt-3 p-2 bg-muted/30 rounded text-xs">
                                {payment.status === 'FAILED' && payment.failureReason && (
                                  <div className="text-destructive">
                                    <span className="font-medium">Failure Reason: </span>
                                    <span>{payment.failureReason}</span>
                                  </div>
                                )}
                                {payment.gatewayResponse && (
                                  <div className="text-muted-foreground">
                                    <span className="font-medium">Gateway: </span>
                                    <span>{payment.gatewayResponse}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right ml-4">
                          <p className="font-bold text-xl text-primary mb-1">
                            ₹{payment.amount.toLocaleString()}
                          </p>
                          {payment.tax && (
                            <p className="text-xs text-muted-foreground">
                              +₹{payment.tax.toLocaleString()} tax
                            </p>
                          )}
                          {payment.discount && payment.discount > 0 && (
                            <p className="text-xs text-success">
                              -₹{payment.discount.toLocaleString()} saved
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(payment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                      
                      {/* Payment Actions */}
                      {payment.status === 'PENDING' && (
                        <div className="mt-3 pt-3 border-t flex gap-2">
                          <Button size="sm" variant="outline" className="text-xs">
                            Retry Payment
                          </Button>
                          <Button size="sm" variant="ghost" className="text-xs">
                            Cancel
                          </Button>
                        </div>
                      )}
                      {payment.status === 'COMPLETED' && (
                        <div className="mt-3 pt-3 border-t flex gap-2">
                          <Button size="sm" variant="outline" className="text-xs">
                            Download Receipt
                          </Button>
                          {payment.refundable && (
                            <Button size="sm" variant="ghost" className="text-xs text-destructive">
                              Request Refund
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Payment Summary & Actions */}
                <div className="pt-4 border-t">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Showing {Math.min(5, payments.length)} of {payments.length} transactions
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Download Statement
                      </Button>
                      <Link to="/payments">
                        <Button size="sm">
                          View All Payments
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-semibold text-lg mb-2">No Payment History</h4>
                <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                  Your payment transactions will appear here once you start using our services. All payments are secure and processed through encrypted channels.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button className="btn-hero">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Make First Payment
                  </Button>
                  <Link to="/subscription">
                    <Button variant="outline">
                      <Package className="h-4 w-4 mr-2" />
                      Choose Plan
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Booking Form Modal */}
        <QuickBookingForm
          isOpen={showBookingForm}
          onClose={handleCloseBookingForm}
          onSuccess={handleBookingSuccess}
          prefilledDate={bookingFormDate}
          userSubscription={subscription || undefined}
        />
      </div>
    </DashboardLayout>
  );
}
