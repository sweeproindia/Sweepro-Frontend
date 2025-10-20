import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BookingService } from '@/services/bookingService';
import { Clock, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface TimeSlotSelectorProps {
  selectedDate: Date;
  selectedTimeSlot?: string;
  onTimeSlotSelect: (timeSlot: string) => void;
  showAllSlots?: boolean; // For admin view to show all slots with availability status
}

interface TimeSlotInfo {
  slot: string;
  isAvailable: boolean;
  isBooked: boolean;
  customerName?: string; // For admin view - show who has booked the slot
}

export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  selectedDate,
  selectedTimeSlot,
  onTimeSlotSelect,
  showAllSlots = false
}) => {
  const { toast } = useToast();
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [allSlots, setAllSlots] = useState<TimeSlotInfo[]>([]);
  const [loading, setLoading] = useState(false);

  // Standard time slots (this could come from a config or API)
  const standardSlots = [
    '08:00-11:00',
    '09:00-12:00',
    '10:00-13:00',
    '11:00-14:00',
    '12:00-15:00',
    '13:00-16:00',
    '14:00-17:00',
    '15:00-18:00',
    '16:00-19:00',
    '17:00-20:00',
  ];

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await BookingService.getAvailableSlots(dateStr);
      
      if (response.success) {
        const available = response.data.slots || [];
        setAvailableSlots(available);

        // Check if date is in buffer period
        if (response.data.isBufferPeriod) {
          toast({
            title: 'Buffer Period Active',
            description: response.data.message || 'No slots available during buffer period.',
            variant: 'destructive'
          });
        }

        if (showAllSlots) {
          // For admin view - show all slots with their status
          const slotsInfo = standardSlots.map(slot => ({
            slot,
            isAvailable: available.includes(slot),
            isBooked: !available.includes(slot),
            customerName: !available.includes(slot) ? 'Booked' : undefined
          }));
          setAllSlots(slotsInfo);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch available slots');
      }
    } catch (error: any) {
      console.error('Error fetching available slots:', error);
      
      // Handle buffer period specific errors
      if (error.isBufferPeriodError) {
        toast({
          title: 'Buffer Period Active',
          description: `Your services are paused until ${new Date(error.bufferEndDate).toLocaleDateString()}. Please choose a date after your buffer period ends.`,
          variant: 'destructive'
        });
        setAvailableSlots([]);
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load available time slots. Please try again.',
          variant: 'destructive'
        });
        // Fallback - show all standard slots as potentially available
        setAvailableSlots(standardSlots);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slot: string) => {
    if (!availableSlots.includes(slot) && !showAllSlots) {
      toast({
        title: 'Slot Unavailable',
        description: 'This time slot is not available. Please choose another slot.',
        variant: 'destructive'
      });
      return;
    }
    onTimeSlotSelect(slot);
  };

  const handleRefresh = () => {
    fetchAvailableSlots();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Available Time Slots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading available slots...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const slotsToShow = showAllSlots ? allSlots.map(s => s.slot) : availableSlots;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {showAllSlots ? 'Time Slot Overview' : 'Available Time Slots'}
          </CardTitle>
          <div className="flex items-center gap-2">
            {!showAllSlots && (
              <Badge variant="outline">
                {availableSlots.length} available
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {format(selectedDate, 'EEEE, MMMM do, yyyy')}
        </div>
      </CardHeader>
      <CardContent>
        {slotsToShow.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Available Slots</h3>
            <p className="text-muted-foreground text-sm">
              {showAllSlots 
                ? 'No time slots are configured for this date.'
                : 'All time slots are booked for this date. Please try another day.'
              }
            </p>
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              className="mt-4"
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {slotsToShow.map((slot) => {
              const isAvailable = availableSlots.includes(slot);
              const isSelected = selectedTimeSlot === slot;
              const slotInfo = showAllSlots ? allSlots.find(s => s.slot === slot) : null;
              
              return (
                <Button
                  key={slot}
                  variant={isSelected ? 'default' : isAvailable ? 'outline' : 'ghost'}
                  className={`
                    h-auto p-3 flex flex-col items-center justify-center text-center transition-all
                    ${isSelected ? 'ring-2 ring-primary' : ''}
                    ${!isAvailable && !showAllSlots ? 'opacity-50 cursor-not-allowed' : ''}
                    ${isAvailable ? 'hover:bg-primary hover:text-primary-foreground' : ''}
                  `}
                  onClick={() => handleSlotSelect(slot)}
                  disabled={!isAvailable && !showAllSlots}
                >
                  <div className="font-medium">
                    {slot}
                  </div>
                  <div className="text-xs mt-1">
                    {showAllSlots ? (
                      <Badge 
                        variant={isAvailable ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {isAvailable ? 'Available' : 'Booked'}
                      </Badge>
                    ) : isSelected ? (
                      <span className="text-primary-foreground">Selected</span>
                    ) : isAvailable ? (
                      <span className="text-green-600">Available</span>
                    ) : (
                      <span className="text-red-600">Booked</span>
                    )}
                  </div>
                  {showAllSlots && !isAvailable && slotInfo?.customerName && (
                    <div className="text-xs mt-1 opacity-75">
                      {slotInfo.customerName}
                    </div>
                  )}
                </Button>
              );
            })}
          </div>
        )}
        
        {!showAllSlots && availableSlots.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium">Booking Information</p>
                <p className="text-xs mt-1">
                  Select your preferred time slot above. Each slot is 3 hours long and includes professional cleaning service.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
