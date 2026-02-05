import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User, Plus, Edit, Trash2, CheckCircle, Loader2, RefreshCw, Settings, Pause, ScanLine } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useBookings } from '@/hooks/useBookings';
import { useBookingForm } from '@/contexts/BookingFormContext';
import { useBufferPeriod } from '@/hooks/useBufferPeriod';
import { BookingButton } from '@/components/buttons/BookingButton';
import { BufferPeriodAlert } from '@/components/ui/BufferPeriodAlert';
import BookingsSkeleton from '@/components/bookings/BookingsSkeleton';
import { useToast } from '@/hooks/use-toast';
import { FeedbackCard } from '@/components/feedback/FeedbackCard';
import FeedbackService from '@/services/feedbackService';
import QrScannerDialog from '@/components/qr/QrScannerDialog';
import { completeBookingWithQRForCustomer } from '@/services/qrService';

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    case 'confirmed':
    case 'assigned':
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
  }
};

const getStatusLabel = (status: string) => {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return 'Confirmed';
    case 'assigned':
      return 'Assigned';
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'pending':
      return 'Pending';
    default:
      return status;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function BookingsPage() {
  const { toast } = useToast();
  const { openBookingForm } = useBookingForm();
  const { user } = useUser();
  const [scanOpen, setScanOpen] = useState(false);
  const [scanBookingId, setScanBookingId] = useState<string | null>(null);
  const [completingWithQr, setCompletingWithQr] = useState(false);

  // Use the buffer period hook
  const {
    isInBufferPeriod,
    bufferEndDate,
    shouldDisableBooking,
    getBufferPeriodMessage,
    getFormattedEndDate,
    isLoading: checkingBuffer
  } = useBufferPeriod();
  
  // Use the custom hook for managing bookings state
  const {
    bookings,
    stats,
    loading,
    error,
    filter,
    setFilter,
    refreshBookings,
    cancelBooking: handleCancelBooking,
  } = useBookings('CUSTOMER');

  // User's preferred time slot from user profile
  const preferredTimeSlot = user?.timeSlot || 'Not set';
  const preferredDuration = '3 hours'; // Standard duration for cleaning slots
  const hasPreferredSlot = user?.timeSlot && user.timeSlot !== 'Not set';

  // Handle booking cancellation with confirmation
  const onCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await handleCancelBooking(bookingId, 'Cancelled by customer');
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  // Handle quick booking for tomorrow
  const handleQuickBooking = () => {
    if (shouldDisableBooking()) {
      toast({
        title: '🚫 Booking Services Paused',
        description: getBufferPeriodMessage(),
        variant: 'destructive',
        duration: 10000, // Show for 10 seconds for better visibility
      });
      return;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    openBookingForm(tomorrow);
  };
  
  const handleBookingSuccess = async () => {
    // Refresh bookings after successful booking
    await refreshBookings();
  };

  const openQrScannerForBooking = (bookingId: string) => {
    setScanBookingId(bookingId);
    setScanOpen(true);
  };

  const handleQrScan = async (text: string) => {
    const bookingId = scanBookingId;
    if (!bookingId) return;

    try {
      setCompletingWithQr(true);
      const res = await completeBookingWithQRForCustomer(bookingId, text);

      if (res.success) {
        toast({
          title: 'Success',
          description: 'Booking completed successfully',
        });
        await refreshBookings();
      } else {
        toast({
          title: 'Error',
          description: res.message || 'Failed to complete booking',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to complete booking',
        variant: 'destructive',
      });
    } finally {
      setCompletingWithQr(false);
      setScanBookingId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <BookingsSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Buffer Period Alert - Show prominently at the top */}
        <BufferPeriodAlert 
          isVisible={isInBufferPeriod}
          endDate={getFormattedEndDate()}
        />
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
            <p className="text-muted-foreground mt-2">
              {isInBufferPeriod ? (
                <span className="text-orange-600 font-medium">
                  <Pause className="h-4 w-4 inline mr-1" />
                  {`Buffer period active until ${getFormattedEndDate()} • All booking services are paused during this time`}
                </span>
              ) : hasPreferredSlot ? (
                <>Your preferred time: <span className="font-medium text-primary">{preferredTimeSlot}</span> ({preferredDuration}) • Ready for quick booking!</>
              ) : (
                <>Set your preferred time slot in your profile to enable quick booking • <span className="text-amber-600">Profile setup recommended</span></>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshBookings}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 slide-up">
            <Card className="dashboard-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
                    <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                  </div>
                  <Trash2 className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <CardTitle>Filter Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(['all', 'scheduled', 'completed', 'cancelled'] as const).map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(status)}
                  className="capitalize"
                >
                  {status === 'all' ? 'All Bookings' : status}
                  {stats && (
                    <span className="ml-1">
                      ({status === 'all' ? stats.total : 
                        status === 'scheduled' ? stats.scheduled :
                        status === 'completed' ? stats.completed :
                        stats.cancelled})
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="dashboard-card border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-600">
                <span className="font-medium">Error:</span>
                <span>{error}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refreshBookings()}
                  className="ml-auto"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bookings List */}
        <div className="space-y-4 slide-up">
          {bookings.map((booking, index) => (
            <Card 
              key={booking.id} 
              className="dashboard-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {booking.maid ? 
                        booking.maid.name.split(' ').map(n => n[0]).join('') : 
                        'TBD'
                      }
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {booking.maid?.name || 'Homecare Partner to be assigned'}
                      </CardTitle>
                      <div className="flex items-center space-x-1 mt-1">
                        {booking.maid?.rating && (
                          <>
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < Math.floor(booking.maid!.rating!) ? 'text-yellow-400' : 'text-gray-300'}>
                                  ⭐
                                </span>
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">({booking.maid.rating})</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(booking.status)}>
                    {getStatusLabel(booking.status)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Booking Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm">{formatDate(booking.scheduledAt)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      {booking.timeSlot || formatTime(booking.scheduledAt)}
                      {booking.estimatedDuration && ` (${Math.round(booking.estimatedDuration / 60)}h ${booking.estimatedDuration % 60}m)`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm truncate" title={booking.serviceAddress}>
                      {booking.serviceAddress}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      {booking.service?.name || 'Service'}
                    </span>
                  </div>
                </div>

                {/* Service Details */}
                {booking.service && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Service Details:</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {booking.service.name}
                      </Badge>
                      {booking.service.category && (
                        <Badge variant="outline">
                          {booking.service.category}
                        </Badge>
                      )}
                    </div>
                    {booking.service.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {booking.service.description}
                      </p>
                    )}
                  </div>
                )}

                {/* Special Instructions */}
                {booking.specialInstructions && (
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Special Instructions:</h4>
                    <p className="text-sm text-muted-foreground">
                      {booking.specialInstructions}
                    </p>
                  </div>
                )}

                {/* Pricing Info */}
                {(booking.totalAmount > 0 || booking.finalAmount > 0) && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Amount:</span>
                    <div className="flex items-center space-x-2">
                      {booking.discount && booking.discount > 0 && (
                        <span className="line-through text-muted-foreground">
                          ₹{booking.totalAmount}
                        </span>
                      )}
                      <span className="font-medium">
                        {booking.finalAmount > 0 ? `₹${booking.finalAmount}` : 'Free (Subscription)'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                  {['CONFIRMED', 'ASSIGNED', 'PENDING'].includes(booking.status) && (
                    <>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Reschedule
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onCancelBooking(booking.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  )}
                  {['CONFIRMED', 'IN_PROGRESS'].includes(booking.status) && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => openQrScannerForBooking(booking.id)}
                      disabled={completingWithQr}
                    >
                      <ScanLine className={`h-4 w-4 mr-2 ${completingWithQr ? 'animate-pulse' : ''}`} />
                      Scan Homecare Partner QR
                    </Button>
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
        {!loading && bookings.length === 0 && (
          <Card className="dashboard-card text-center py-12">
            <CardContent>
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No bookings found</h3>
              <p className="text-muted-foreground mb-4">
                {filter === 'all' 
                  ? "You don't have any bookings yet. Schedule your first cleaning service!"
                  : `No ${filter} bookings found. Try adjusting your filter.`}
              </p>
              {/* {filter === 'all' && (
                <Button className="btn-hero" onClick={handleQuickBooking}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Your First Cleaning
                </Button>
              )} */}
            </CardContent>
          </Card>
        )}

        {/* Feedback Section - Single card for most recent completed service */}
        <div className="slide-up mt-6">
          <FeedbackCard
            onFeedbackSubmitted={async () => {
              await refreshBookings();
            }}
          />
        </div>

        {/* Enhanced Quick Booking Card */}
        {/* <Card className="dashboard-card slide-up bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Quick Booking</span>
              {hasPreferredSlot && (
                <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  ✓ Time Slot Set
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {hasPreferredSlot ? (
                <>Your next service will be scheduled at <span className="font-medium text-primary">{preferredTimeSlot}</span> for {preferredDuration}</>
              ) : (
                <>Set up your preferred time slot to enable one-click booking for faster service scheduling</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              {hasPreferredSlot ? (
                <>
                  <Button className="btn-hero" onClick={handleQuickBooking}>
                    <Plus className="h-4 w-4 mr-2" />
                    Book for Tomorrow ({new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()})
                  </Button>
                  <Button variant="outline" onClick={() => openBookingForm()}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Choose Different Time
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => openBookingForm()}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Select Time & Book Now
                  </Button>
                  <Button variant="ghost" className="text-amber-600">
                    <Settings className="h-4 w-4 mr-2" />
                    Set Preferred Time
                  </Button>
                </>
              )}
            </div>
            <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium">Available Time Slots</p>
                  <p className="text-xs mt-1">
                    We offer flexible 3-hour cleaning slots from 8:00 AM to 8:00 PM. 
                    {hasPreferredSlot 
                      ? 'Your preferred slot will be automatically selected for quick bookings.' 
                      : 'Set a preferred slot to enable instant booking.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card> */}
        <QrScannerDialog
          open={scanOpen}
          onOpenChange={(open) => {
            setScanOpen(open);
            if (!open) setScanBookingId(null);
          }}
          onScan={handleQrScan}
        />
      </div>
    </DashboardLayout>
  );
}