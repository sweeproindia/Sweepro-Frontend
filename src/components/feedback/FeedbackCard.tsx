import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, Calendar, User, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FeedbackForm } from './FeedbackForm';
import FeedbackService from '@/services/feedbackService';
import { useToast } from '@/hooks/use-toast';

interface AssignedMaid {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  rating: number;
  totalRatings: number;
}

interface EligibleBooking {
  id: string;
  scheduledAt: string;
  completedAt?: string;
  service?: {
    id: string;
    name: string;
    description: string;
  };
  maid?: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
}

interface FeedbackCardProps {
  onFeedbackSubmitted?: () => void;
}

export function FeedbackCard({ onFeedbackSubmitted }: FeedbackCardProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [eligibleBooking, setEligibleBooking] = useState<EligibleBooking | null>(null);
  const [assignedMaids, setAssignedMaids] = useState<AssignedMaid[]>([]);

  useEffect(() => {
    fetchEligibleBooking();
  }, []);

  // Refresh when feedback is submitted (via parent callback)
  useEffect(() => {
    if (onFeedbackSubmitted) {
      // This will be called after feedback submission
    }
  }, [onFeedbackSubmitted]);

  const fetchEligibleBooking = async () => {
    setLoading(true);
    try {
      console.log('📋 FeedbackCard - Fetching eligible bookings...');
      const response = await FeedbackService.getEligibleBookings();
      console.log('📋 FeedbackCard - Raw response:', response);
      console.log('📋 FeedbackCard - Response success:', response.success);
      console.log('📋 FeedbackCard - Response data:', response.data);
      
      if (response.success && response.data) {
        // Backend returns: { success: true, data: { bookings: [...], assignedMaids: [...] } }
        // api.ts returns it as-is since it has success field
        const responseData = response.data;
        
        console.log('📋 FeedbackCard - Response data type:', typeof responseData);
        console.log('📋 FeedbackCard - Response data keys:', responseData ? Object.keys(responseData) : 'null');
        
        // Extract bookings and assignedMaids
        let bookingsArray: any[] = [];
        let maidsArray: AssignedMaid[] = [];
        
        if (responseData && typeof responseData === 'object') {
          // Check for bookings property (most common case)
          if ('bookings' in responseData) {
            if (Array.isArray(responseData.bookings)) {
              bookingsArray = responseData.bookings;
              console.log('✅ Found bookings array:', bookingsArray.length);
            } else {
              console.warn('⚠️ bookings exists but is not an array:', typeof responseData.bookings);
            }
          }
          
          // Check for assignedMaids property
          if ('assignedMaids' in responseData) {
            if (Array.isArray(responseData.assignedMaids)) {
              maidsArray = responseData.assignedMaids;
              console.log('✅ Found assignedMaids array:', maidsArray.length);
            } else {
              console.warn('⚠️ assignedMaids exists but is not an array:', typeof responseData.assignedMaids);
            }
          }
          
          // Debug: log all keys in responseData
          console.log('📋 All keys in responseData:', Object.keys(responseData));
        } else {
          console.warn('⚠️ responseData is not an object:', typeof responseData);
        }
        
        // Get the most recent booking (first one)
        const booking = bookingsArray.length > 0 ? bookingsArray[0] : null;
        
        console.log('📋 FeedbackCard - Final result:');
        console.log('  - Eligible booking found:', !!booking);
        console.log('  - Bookings array length:', bookingsArray.length);
        console.log('  - Assigned maids count:', maidsArray.length);
        
        if (booking) {
          console.log('  - Booking ID:', booking.id);
          console.log('  - Booking status:', booking.status);
          console.log('  - Booking has maid:', !!booking.maid);
        }
        
        setEligibleBooking(booking);
        setAssignedMaids(maidsArray);
      } else {
        console.warn('⚠️ FeedbackCard - Response not successful or no data');
        console.warn('  - Success:', response.success);
        console.warn('  - Has data:', !!response.data);
        setEligibleBooking(null);
        setAssignedMaids([]);
      }
    } catch (error: any) {
      console.error('❌ FeedbackCard - Error fetching eligible booking:', error);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Error response:', error?.response);
      setEligibleBooking(null);
      setAssignedMaids([]);
    } finally {
      setLoading(false);
      console.log('📋 FeedbackCard - Loading complete');
    }
  };

  const handleFeedbackSubmitted = async () => {
    setIsDialogOpen(false);
    setEligibleBooking(null); // Clear the booking after feedback is submitted
    
    // Call parent callback first
    if (onFeedbackSubmitted) {
      await onFeedbackSubmitted();
    }
    
    // Refresh to check for new eligible bookings after a short delay
    setTimeout(() => {
      fetchEligibleBooking();
    }, 1000);
  };

  // Show loading state - return null to avoid flickering
  if (loading) {
    console.log('📋 FeedbackCard - Still loading...');
    return null;
  }

  // Don't show card if no eligible booking
  if (!eligibleBooking) {
    console.log('📋 FeedbackCard - No eligible booking found. Card will not be displayed.');
    console.log('📋 FeedbackCard - This means:');
    console.log('   1. No completed bookings exist, OR');
    console.log('   2. All completed bookings already have feedback, OR');
    console.log('   3. No bookings have been completed yet');
    return null;
  }

  console.log('✅ FeedbackCard - Rendering card for booking:', eligibleBooking.id);

  // Use assigned maid from booking or first assigned maid
  const defaultMaid = eligibleBooking.maid || (assignedMaids.length > 0 ? {
    id: assignedMaids[0].id,
    name: assignedMaids[0].name,
    email: assignedMaids[0].email,
    profileImage: assignedMaids[0].profileImage
  } : null);

  // Show card even if no maid is assigned (user can still provide feedback)
  // The form will handle maid selection

  return (
    <>
      <Card className="border-l-4 border-l-yellow-400 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Rate Your Recent Service</CardTitle>
                <CardDescription className="mt-1">
                  Share your feedback about your most recent completed service
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
              Completed
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {eligibleBooking.completedAt 
                    ? new Date(eligibleBooking.completedAt).toLocaleDateString()
                    : new Date(eligibleBooking.scheduledAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{eligibleBooking.service?.name || 'Service'}</span>
              </div>
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="w-full"
              variant="default"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Leave Feedback
              <ChevronRight className="h-4 w-4 ml-auto" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit Feedback</DialogTitle>
            <DialogDescription>
              Your feedback helps us improve our services and recognize excellent work
            </DialogDescription>
          </DialogHeader>
          <FeedbackForm
            booking={eligibleBooking}
            assignedMaids={assignedMaids}
            defaultMaidId={defaultMaid?.id}
            onSuccess={handleFeedbackSubmitted}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
