import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, User, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { BookingService, Booking } from '@/services/bookingService';
import { SubscriptionService, Subscription } from '@/services/subscriptionService';
import { useToast } from '@/hooks/use-toast';


const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case 'COMPLETED':
      return 'bg-success text-success-foreground';
    case 'PENDING':
    case 'CONFIRMED':
    case 'ASSIGNED':
      return 'bg-primary text-primary-foreground';
    case 'IN_PROGRESS':
      return 'bg-warning text-warning-foreground';
    case 'CANCELLED':
      return 'bg-destructive text-destructive-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export default function BookingsPage() {
  const { user, isAuthenticated } = useUser();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    upcomingBookings: 0,
    nextUpcomingBooking: null as Booking | null
  });
  
  // User's preferred time slot from subscription
  const preferredTimeSlot = subscription?.plan?.service?.baseDuration ? 
    `${Math.floor(subscription.plan.service.baseDuration / 60)}:${(subscription.plan.service.baseDuration % 60).toString().padStart(2, '0')} Hours` : 
    '10:00 AM';
  const preferredDuration = subscription?.plan?.service?.baseDuration ? 
    `${subscription.plan.service.baseDuration} minutes` : 
    '3 hours';

  useEffect(() => {
    if (user && isAuthenticated) {
      fetchBookingData();
    }
  }, [user, isAuthenticated]);

  const fetchBookingData = async () => {
    setLoading(true);
    try {
      // Fetch bookings and subscription data in parallel
      const [bookingsResponse, subscriptionResponse] = await Promise.allSettled([
        BookingService.getUserBookings(),
        SubscriptionService.getUserSubscription()
      ]);

      // Handle bookings
      if (bookingsResponse.status === 'fulfilled' && bookingsResponse.value.success) {
        const bookingsData = Array.isArray(bookingsResponse.value.data) ? 
          bookingsResponse.value.data : 
          bookingsResponse.value.data?.bookings || 
          bookingsResponse.value.bookings || [];
        setBookings(bookingsData);
      }

      // Handle subscription
      if (subscriptionResponse.status === 'fulfilled' && subscriptionResponse.value.success) {
        const subscriptionData = subscriptionResponse.value.data || subscriptionResponse.value.subscription || null;
        setSubscription(subscriptionData);
      } else if (subscriptionResponse.status === 'rejected') {
        console.log('No active subscription found');
        setSubscription(null);
      }

      // Calculate stats after data is loaded
      calculateStats();

    } catch (error) {
      console.error('Error fetching booking data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load booking data. Please try refreshing.',
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
      b.status === 'PENDING' || b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS' || b.status === 'ASSIGNED'
    );
    const nextUpcomingBooking = upcomingBookings
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
    
    setStats({
      totalBookings,
      completedBookings,
      upcomingBookings: upcomingBookings.length,
      nextUpcomingBooking
    });
  };

  useEffect(() => {
    if (bookings.length > 0) {
      calculateStats();
    }
  }, [bookings]);

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
          <p className="text-muted-foreground">Please log in to view your bookings.</p>
        </div>
      </DashboardLayout>
    );
  }

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    // Map display filter values to API status values
    switch (filter) {
      case 'scheduled':
        return booking.status === 'PENDING' || booking.status === 'CONFIRMED' || booking.status === 'ASSIGNED';
      case 'completed':
        return booking.status === 'COMPLETED';
      case 'cancelled':
        return booking.status === 'CANCELLED';
      case 'in_progress':
        return booking.status === 'IN_PROGRESS';
      default:
        return booking.status.toLowerCase() === filter.toLowerCase();
    }
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
            <p className="text-muted-foreground mt-2">
              Your preferred time: {preferredTimeSlot} ({preferredDuration}) • Click below to book for tomorrow
            </p>
          </div>
          <Button className="btn-hero">
            <Plus className="h-4 w-4 mr-2" />
            Book Service for Tomorrow
          </Button>
        </div>

        {/* Filters */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <CardTitle>Filter Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['all', 'scheduled', 'completed', 'cancelled'].map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(status)}
                  className="capitalize"
                >
                  {status === 'all' ? 'All Bookings' : status}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <div className="space-y-4 slide-up">
          {filteredBookings.map((booking, index) => (
            <Card 
              key={booking.id} 
              className="dashboard-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                      {booking.maid?.name ? booking.maid.name.split(' ').map(n => n[0]).join('') : 'TBD'}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{booking.service?.name || 'Cleaning Service'}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {booking.maid?.name ? `Assigned to: ${booking.maid.name}` : 'Maid to be assigned'}
                      </p>
                      {booking.maid?.rating && (
                        <div className="flex items-center space-x-1 mt-1">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < Math.floor(booking.maid.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}>
                                ⭐
                              </span>
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">({booking.maid.rating})</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                    {booking.finalAmount && (
                      <span className="text-lg font-bold text-primary">
                        ₹{booking.finalAmount.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Booking Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm">{new Date(booking.scheduledAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      {new Date(booking.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                      {booking.estimatedDuration && ` (${booking.estimatedDuration} min)`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm">{booking.serviceAddress}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-sm">{booking.service?.name || 'Service'}</span>
                  </div>
                </div>

                {/* Service Details */}
                <div>
                  <h4 className="font-medium text-foreground mb-2">Service Details:</h4>
                  <div className="space-y-2">
                    <Badge variant="secondary" className="mr-2">
                      {booking.service?.name || 'Cleaning Service'}
                    </Badge>
                    {booking.service?.category && (
                      <Badge variant="outline" className="mr-2">
                        {booking.service.category}
                      </Badge>
                    )}
                    {booking.service?.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {booking.service.description}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Special Instructions */}
                {booking.specialInstructions && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Special Instructions:</h4>
                    <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded">
                      {booking.specialInstructions}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                  {(booking.status === 'PENDING' || booking.status === 'CONFIRMED' || booking.status === 'ASSIGNED') && (
                    <>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Reschedule
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  )}
                  {booking.status === 'COMPLETED' && (
                    <Button variant="outline" size="sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Rate & Review
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredBookings.length === 0 && (
          <Card className="dashboard-card text-center py-12">
            <CardContent>
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No bookings found</h3>
              <p className="text-muted-foreground mb-4">
                {filter === 'all' 
                  ? "You don't have any bookings yet. Schedule your first cleaning service!"
                  : `No ${filter} bookings found. Try adjusting your filter.`
                }
              </p>
              {filter === 'all' && (
                <Button className="btn-hero">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Your First Cleaning
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Booking History */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <CardTitle>Booking History</CardTitle>
            <CardDescription>
              Complete history of your cleaning services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Cleaner</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Duration</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(booking.scheduledAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground">
                        {booking.maid?.name || 'TBD'}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {booking.estimatedDuration ? `${booking.estimatedDuration} min` : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(booking.status)} variant="secondary">
                          {booking.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {booking.specialInstructions || (booking.status === 'COMPLETED' ? 'Service completed' : '-')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Booking Card */}
        <Card className="dashboard-card slide-up bg-gradient-feature">
          <CardHeader>
            <CardTitle>Quick Booking</CardTitle>
            <CardDescription>
              Your next service will be scheduled at {preferredTimeSlot} for {preferredDuration}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="btn-hero">
                <Plus className="h-4 w-4 mr-2" />
                Book for Tomorrow ({new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()})
              </Button>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule for Specific Date
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Need to change your preferred time slot? Contact support or update in subscription settings.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}