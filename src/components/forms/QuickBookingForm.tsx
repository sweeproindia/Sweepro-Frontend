import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useBufferPeriod } from '@/hooks/useBufferPeriod';
import { BookingService } from '@/services/bookingService';
import { BufferService } from '@/services/bufferService';
import { SubscriptionService } from '@/services/subscriptionService';
import { Loader2, Calendar as CalendarIcon, Clock, AlertTriangle, Pause } from 'lucide-react';
import { format } from 'date-fns';
import { useUser } from '@/contexts/UserContext';
import { TimeSlotSelector } from '@/components/booking/TimeSlotSelector';
import { BufferPeriodAlert } from '@/components/ui/BufferPeriodAlert';

interface QuickBookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  prefilledDate?: Date;
}

export const QuickBookingForm: React.FC<QuickBookingFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  prefilledDate,
}) => {
  const { toast } = useToast();
  const { user } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  
  // Use buffer period hook for centralized buffer period management
  const {
    isInBufferPeriod,
    shouldDisableBooking,
    getBufferPeriodMessage,
    getFormattedEndDate,
    checkBufferPeriodWithFallback,
    isLoading: bufferLoading
  } = useBufferPeriod();

  // Auto-populate booking data from user profile
  const bookingDate = prefilledDate || new Date();
  const userAddress = user?.address || 'Address not set';
  
  // Initialize with user's preferred time slot if available
  useEffect(() => {
    if (user?.timeSlot && !selectedTimeSlot) {
      setSelectedTimeSlot(user.timeSlot);
    }
  }, [user?.timeSlot]);

  // Debug buffer period status when form opens and trigger fallback check
  useEffect(() => {
    if (isOpen) {
      console.log('🔍 QuickBookingForm opened - Buffer Status:', {
        isInBufferPeriod,
        shouldDisableBooking: shouldDisableBooking(),
        bufferLoading,
        getFormattedEndDate: getFormattedEndDate()
      });
      
      // Trigger fallback check when form opens to ensure we have the latest status
      setTimeout(() => {
        console.log('🔍 Triggering fallback buffer check from QuickBookingForm...');
        checkBufferPeriodWithFallback();
      }, 500);
    }
  }, [isOpen, isInBufferPeriod, shouldDisableBooking, bufferLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 QuickBookingForm handleSubmit called - Buffer Status:', {
      isInBufferPeriod,
      shouldDisableBooking: shouldDisableBooking(),
      bufferLoading
    });
    
    // Check buffer period status first using the hook
    if (shouldDisableBooking()) {
      console.log('🚫 Blocking booking submission due to buffer period');
      toast({
        title: '🚫 Booking Services Paused',
        description: getBufferPeriodMessage(),
        variant: 'destructive',
        duration: 10000,
      });
      return;
    }
    
    if (!selectedTimeSlot) {
      toast({
        title: 'Time Slot Required',
        description: 'Please select an available time slot for your booking.',
        variant: 'destructive'
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Double-check buffer period status with backend API as fallback
      console.log('🔍 Double-checking buffer status with backend API...');
      const subscriptionResponse = await SubscriptionService.getUserSubscription();
      
      if (subscriptionResponse.success && subscriptionResponse.data?.subscription) {
        const subscription = subscriptionResponse.data.subscription;
        const bufferStatusResponse = await BufferService.checkCurrentBufferStatus(subscription.id);
        
        if (bufferStatusResponse.success && bufferStatusResponse.data.isInBufferPeriod) {
          console.log('🚫 Backend API confirms buffer period is active - blocking booking');
          const bufferPeriod = bufferStatusResponse.data.activeBufferPeriod;
          const endDate = new Date(bufferPeriod.endDate).toLocaleDateString();
          
          toast({
            title: '🚫 Booking Services Paused',
            description: `Your services are currently paused due to an active buffer period until ${endDate}. Please wait until your buffer period ends to book new services.`,
            variant: 'destructive',
            duration: 10000,
          });
          setSubmitting(false);
          return;
        }
      }

      console.log('✅ No buffer period detected, proceeding with booking...');
      const bookingData = {
        scheduledDate: format(bookingDate, 'yyyy-MM-dd'),
        timeSlot: selectedTimeSlot,
        serviceAddress: userAddress,
      };

      const response = await BookingService.createBooking(bookingData);

      if (response.success) {
        toast({
          title: 'Success!',
          description: 'Your booking has been created successfully',
        });
        onSuccess();
        onClose();
      } else {
        throw new Error(response.message || 'Failed to create booking');
      }
    } catch (error: any) {
      console.error('Booking creation error:', error);
      
      // Handle buffer period specific errors
      if (error.isBufferPeriodError) {
        const endDate = new Date(error.bufferEndDate).toLocaleDateString();
        toast({
          title: 'Booking Blocked - Buffer Period',
          description: `Your services are paused until ${endDate}. Please choose a date after your buffer period ends.`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to create booking. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Quick Booking
          </DialogTitle>
          <DialogDescription>
            {prefilledDate 
              ? `Confirm your cleaning service for ${format(prefilledDate, 'EEEE, MMMM do, yyyy')}`
              : 'Confirm your cleaning service'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Buffer Period Alert - Show prominently in the form */}
        <BufferPeriodAlert 
          isVisible={isInBufferPeriod}
          endDate={getFormattedEndDate()}
          className="mb-4"
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Time Slot Selection */}
            <TimeSlotSelector
              selectedDate={bookingDate}
              selectedTimeSlot={selectedTimeSlot}
              onTimeSlotSelect={setSelectedTimeSlot}
            />
            
            {selectedTimeSlot && (
              <>
                {/* Booking Details */}
                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-foreground">Booking Summary</h4>
                  
                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>
                      {format(bookingDate, 'EEEE, MMMM do, yyyy')}
                    </span>
                  </div>
                  
                  {/* Time Slot */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Time: {selectedTimeSlot}</span>
                  </div>
                  
                  {/* Address */}
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <div className="h-4 w-4 mt-0.5">
                      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="flex-1">{userAddress}</span>
                  </div>
                </div>
                
                <DialogDescription className="text-center text-green-600 dark:text-green-400">
                  ✓ Your time slot is confirmed! Click the button below to complete your booking.
                </DialogDescription>
              </>
            )}
            
            {!selectedTimeSlot && (
              <DialogDescription className="text-center text-amber-600 dark:text-amber-400">
                Please select an available time slot above to continue with your booking.
              </DialogDescription>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !selectedTimeSlot || shouldDisableBooking() || bufferLoading}
              className={`flex-1 ${shouldDisableBooking() ? 'border-orange-300 text-orange-600 bg-orange-50 hover:bg-orange-100' : ''}`}
            >
              {bufferLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking Buffer Status...
                </>
              ) : submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Booking...
                </>
              ) : shouldDisableBooking() ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Services Paused (Until {getFormattedEndDate()})
                </>
              ) : !selectedTimeSlot ? (
                'Select Time Slot First'
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
