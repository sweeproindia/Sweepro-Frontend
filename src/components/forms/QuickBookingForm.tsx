import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BookingService } from '@/services/bookingService';
import { Loader2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useUser } from '@/contexts/UserContext';

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

  // Auto-populate booking data from user profile - now customer-corresponding timeslots
  const bookingDate = prefilledDate || new Date();
  const userTimeSlot = user?.timeSlot || '09:00-12:00'; // Customer's preferred timeslot
  const userAddress = user?.address || 'Address not set'; // Customer's preferred address

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const bookingData = {
        scheduledDate: format(bookingDate, 'yyyy-MM-dd'),
        timeSlot: userTimeSlot,
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
      toast({
        title: 'Error',
        description: error.message || 'Failed to create booking. Please try again.',
        variant: 'destructive',
      });
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Booking Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-gray-900">Booking Details</h4>
              
              {/* Date */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {format(bookingDate, 'EEEE, MMMM do, yyyy')}
                </span>
              </div>
              
              {/* Time Slot */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Time: {userTimeSlot}</span>
              </div>
              
              {/* Address */}
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <div className="h-4 w-4 mt-0.5">
                  <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="flex-1">{userAddress}</span>
              </div>
            </div>
            
            <DialogDescription className="text-center">
              Click confirm to book your cleaning service with the details above
            </DialogDescription>
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
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Booking...
                </>
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
