import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { assignmentService, BookingForAssignment } from '@/services/assignmentService';
import { apiRequest, HttpMethod } from '@/services/api';
import { 
  Calendar, 
  Clock, 
  UserCheck, 
  User, 
  MapPin, 
  Star, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  RotateCcw,
  XCircle
} from 'lucide-react';

interface Booking {
  id: string;
  customerId: string;
  maidId?: string;
  serviceId: string;
  status: 'PENDING' | 'CONFIRMED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignmentStatus?: 'PENDING_ASSIGNMENT' | 'ASSIGNED_PENDING_RESPONSE' | 'ACCEPTED' | 'REJECTED' | 'REASSIGNED';
  scheduledAt: string;
  timeSlot?: string;
  serviceAddress: string;
  totalAmount: number;
  finalAmount: number;
  specialInstructions?: string;
  rejectionReason?: string;
  reassignmentCount?: number;
  assignedAt?: string;
  maidResponseAt?: string;
  service: {
    id: string;
    name: string;
    description: string;
    basePrice: number;
  };
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  maid?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    rating?: number;
  };
  lastAttempt?: {
    maidProfileId?: string;
    maidUserId?: string;
    maidName?: string;
    status?: string;
    reason?: string;
    respondedAt?: string;
  };
}

interface Maid {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating?: number;
  totalRatings?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING_VERIFICATION';
  completedBookings?: number;
  skills?: string[];
  isVerified?: boolean;
  isAvailable?: boolean;
  currentAssignments?: number;
  maxDailyBookings?: number;
}

interface AdminReassignmentSectionProps {
  onRefresh?: () => void;
}

export const AdminReassignmentSection: React.FC<AdminReassignmentSectionProps> = ({
  onRefresh
}) => {
  const [reassignmentBookings, setReassignmentBookings] = useState<BookingForAssignment[]>([]);
  const [availableMaids, setAvailableMaids] = useState<Maid[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingForAssignment | null>(null);
  const [selectedMaidId, setSelectedMaidId] = useState<string>('');
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [reassigning, setReassigning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [processedBookingIds, setProcessedBookingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  
  const itemsPerPage = 5;

  useEffect(() => {
    fetchReassignmentBookings();
    fetchAvailableMaids();
  }, []);

  const fetchReassignmentBookings = async () => {
    setLoading(true);
    try {
      const response = await assignmentService.getReassignmentBookings();

      if (response.success) {
        const bookingsData = Array.isArray(response.data) ? response.data : [];
        // Filter bookings that need reassignment (rejected by maids or expired)
        const now = new Date();
        const filteredBookings = bookingsData.filter((booking: BookingForAssignment) => 
          !processedBookingIds.has(booking.id) && 
          booking.assignmentStatus === 'REJECTED' && booking.status != "CONFIRMED" && booking.status != "ACCEPTED" &&
          new Date(booking.scheduledAt) > now // Only future bookings get in list
        ).map(booking => {
          // Mark as expired if past
          if (new Date(booking.scheduledAt) < now) {
            return { ...booking, status: 'expired' };
          }
          return booking;
        });
        
        console.log('🔍 AdminReassignmentSection - Raw bookings:', bookingsData.length);
        console.log('🔍 AdminReassignmentSection - Filtered bookings:', filteredBookings.length);
        console.log('🔍 AdminReassignmentSection - Processed booking IDs:', Array.from(processedBookingIds));
        setReassignmentBookings(filteredBookings);
      }
    } catch (error) {
      console.error('Error fetching reassignment bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch reassignment bookings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableMaids = async (bookingId?: string) => {
    if (!bookingId && reassignmentBookings.length === 0) return;
    
    try {
      // Use the first booking ID if none specified
      const targetBookingId = bookingId || reassignmentBookings[0]?.id;
      if (!targetBookingId) return;

      const response = await assignmentService.getAvailableMaids(targetBookingId);

      if (response.success) {
        const maidsData = Array.isArray(response.data) ? response.data : [];
        // Only show available maids
        const availableMaidsData = maidsData.filter((maid: any) => 
          maid.isAvailable !== false
        );
        setAvailableMaids(availableMaidsData);
      }
    } catch (error) {
      console.error('Error fetching available maids:', error);
    }
  };

  const fetchAvailableMaidsForBooking = async (bookingId: string) => {
    try {
      const response = await assignmentService.getAvailableMaids(bookingId);
      if (response.success) {
        const maidsData = Array.isArray(response.data) ? response.data : [];
        setAvailableMaids(maidsData);
      }
    } catch (error) {
      console.error('Error fetching available maids for booking:', error);
    }
  };

  const handleReassignClick = (booking: BookingForAssignment) => {
    setSelectedBooking(booking);
    setSelectedMaidId('');
    setReassignDialogOpen(true);
    // Fetch available maids for this specific booking
    fetchAvailableMaidsForBooking(booking.id);
  };

  const handleConfirmReassignment = async () => {
    if (!selectedBooking || !selectedMaidId) {
      toast({
        title: 'Selection Required',
        description: 'Please select a maid for reassignment',
        variant: 'destructive'
      });
      return;
    }

    setReassigning(true);
    try {
      // Send new assignment request to different maid
      const response = await assignmentService.sendAssignmentRequest({
        bookingId: selectedBooking.id,
        maidId: selectedMaidId,
        expiresIn: 24 // 24 hours to respond
      });

      if (response.success) {
        // Optimistic UI update - immediately remove from reassignment list
        setReassignmentBookings(prev => prev.filter(b => b.id !== selectedBooking.id));
        setProcessedBookingIds(prev => new Set([...prev, selectedBooking.id]));

        toast({
          title: 'Reassignment Request Sent',
          description: 'New maid has been notified and has 24 hours to accept or reject this assignment',
          variant: 'default'
        });

        setReassignDialogOpen(false);
        setSelectedBooking(null);
        setSelectedMaidId('');

        // Refresh parent component if callback provided
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (error) {
      toast({
        title: 'Reassignment Failed',
        description: 'Failed to send reassignment request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setReassigning(false);
    }
  };

  const getPaginatedData = (data: BookingForAssignment[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(reassignmentBookings.length / itemsPerPage);
  };

  const getSerialNumber = (index: number) => {
    return (currentPage - 1) * itemsPerPage + index + 1;
  };

  const handleRefresh = () => {
    fetchReassignmentBookings();
    fetchAvailableMaids();
    if (onRefresh) {
      onRefresh();
    }
  };

  const Pagination = () => (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {getTotalPages()}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === getTotalPages()}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Card className="dashboard-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-destructive" />
                Reassignment Required ({reassignmentBookings.length})
              </CardTitle>
              <CardDescription>Bookings needing reassignment due to rejection, expiry, or maid weekly leave</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading reassignment bookings...</p>
              </div>
            ) : (
              <>
                {getPaginatedData(reassignmentBookings).map((booking, index) => (
                  <div key={booking.id} className="border rounded-lg p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-800">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-sm font-medium text-red-700 dark:text-red-300">
                          {getSerialNumber(index)}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-4 flex-wrap">
                            <div>
                              <p className="font-semibold text-foreground">{booking.service.name}</p>
                              <p className="text-sm text-muted-foreground">₹{booking.finalAmount.toLocaleString()}</p>
                            </div>
                            <div>
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{booking.customer.name}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{booking.customer.phone}</p>
                            </div>
                            <div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{new Date(booking.scheduledAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{booking.timeSlot || new Date(booking.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{booking.serviceAddress}</span>
                          </div>

                          {booking.specialInstructions && (
                            <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded border border-blue-200 dark:border-blue-800">
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                <strong>Instructions:</strong> {booking.specialInstructions}
                              </p>
                            </div>
                          )}

                          {/* Previous Maid Info */}
                          {(booking.lastAttempt?.maidName || booking.maid) && (
                            <div className="bg-gray-50 dark:bg-gray-950/20 p-3 rounded border border-gray-200 dark:border-gray-800">
                              <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-gray-600" />
                                <span className="font-medium text-gray-700 dark:text-gray-300">Previously assigned to:</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">{booking.lastAttempt?.maidName || booking.maid?.name}</span>
                              </div>
                              {booking.maid?.phone && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{booking.maid.phone}</p>
                              )}
                              {(booking.lastAttempt?.respondedAt || booking.maidResponseAt) && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  {booking.lastAttempt?.status === 'expired' ? 'Expired' : 'Rejected'}: {new Date(booking.lastAttempt?.respondedAt || booking.maidResponseAt!).toLocaleString()}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Reason */}
                          <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded border border-red-200 dark:border-red-800">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <div>
                                {((booking.lastAttempt?.reason || booking.rejectionReason) === 'MAID_ON_LEAVE') ? (
                                  <p className="text-sm text-red-700 dark:text-red-300">
                                    <strong>Reason:</strong> Maid on weekly leave
                                  </p>
                                ) : (
                                <p className="text-sm text-red-700 dark:text-red-300">
                                  <strong>Reason:</strong> {booking.lastAttempt?.reason || booking.rejectionReason || 'Maid declined the assignment'}
                                </p>
                                )}
                                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                  Reassignment attempt #{(booking.reassignmentCount || 0) + 1}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant="destructive">
                              Needs Reassignment
                            </Badge>
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              High Priority
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <Button
                          onClick={() => handleReassignClick(booking)}
                          className="bg-orange-600 hover:bg-orange-700"
                          size="sm"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reassign Maid
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {reassignmentBookings.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <RotateCcw className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-medium mb-2">No Reassignments Needed</h3>
                    <p>All assigned bookings are progressing smoothly.</p>
                  </div>
                )}
                
                {reassignmentBookings.length > 0 && getTotalPages() > 1 && <Pagination />}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reassignment Dialog */}
      <Dialog open={reassignDialogOpen} onOpenChange={setReassignDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reassign Booking to New Maid</DialogTitle>
            <DialogDescription>
              Select a different verified maid for this rejected booking. The new maid will be notified and has 24 hours to respond.
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">{selectedBooking.service.name}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Customer:</span> {selectedBooking.customer.name}
                  </div>
                  <div>
                    <span className="font-medium">Date:</span> {new Date(selectedBooking.scheduledAt).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Time:</span> {selectedBooking.timeSlot || new Date(selectedBooking.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  <div>
                    <span className="font-medium">Amount:</span> ₹{selectedBooking.finalAmount.toLocaleString()}
                  </div>
                </div>
                <div className="mt-2">
                  <span className="font-medium">Address:</span> {selectedBooking.serviceAddress}
                </div>
                
                {selectedBooking.rejectionReason && (
                  <div className="mt-3 p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      <strong>Previous Rejection:</strong> {selectedBooking.rejectionReason}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Select New Verified Maid</label>
                <Select value={selectedMaidId} onValueChange={setSelectedMaidId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a different verified maid..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMaids
                      .filter(maid => maid.id !== (selectedBooking.lastAttempt?.maidUserId || selectedBooking.maidId))
                      .map((maid) => (
                        <SelectItem key={maid.id} value={maid.id}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{maid.name}</span>
                              {maid.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                  <span className="text-sm">{maid.rating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {maid.completedBookings || 0} jobs
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  Only verified maids (excluding the one who rejected) are shown. The selected maid will receive a notification to accept or reject this assignment within 24 hours.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReassignDialogOpen(false)}
              disabled={reassigning}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReassignment}
              disabled={reassigning || !selectedMaidId}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {reassigning ? 'Reassigning...' : 'Reassign Maid'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
