import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { assignmentService } from '@/services/assignmentService';
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
  RefreshCw
} from 'lucide-react';

interface Booking {
  id: string;
  customerId: string;
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

interface AdminPendingAssignmentsSectionProps {
  onRefresh?: () => void;
}

export const AdminPendingAssignmentsSection: React.FC<AdminPendingAssignmentsSectionProps> = ({
  onRefresh
}) => {
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [availableMaids, setAvailableMaids] = useState<Maid[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedMaidId, setSelectedMaidId] = useState<string>('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [processedBookingIds, setProcessedBookingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  
  const itemsPerPage = 5;

  useEffect(() => {
    fetchPendingBookings();
    fetchAvailableMaids();
  }, []);

  const fetchPendingBookings = async () => {
    setLoading(true);
    try {
      const response = await assignmentService.getPendingAssignmentBookings();

      if (response.success) {
        const bookingsData = Array.isArray(response.data) ? response.data : [];
        // Filter out processed bookings to prevent reappearing
        const filteredBookings = bookingsData.filter((booking: Booking) => !processedBookingIds.has(booking.id));
        setPendingBookings(filteredBookings);
      }
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch pending assignments',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableMaids = async (bookingId?: string) => {
    try {
      // If we have a selected booking, get maids specific to that booking
      if (bookingId) {
        const response = await assignmentService.getAvailableMaids(bookingId);
        if (response.success) {
          const maidsData = Array.isArray(response.data) ? response.data : [];
          setAvailableMaids(maidsData);
        }
      } else {
        // Fallback to general available maids endpoint
        const response = await apiRequest('/admin/available-maids', {
          method: HttpMethod.GET,
          requiresAuth: true
        });

        if (response.success) {
          const maidsData = Array.isArray(response.data) ? response.data : [];
          // Only show verified maids
          const verifiedMaids = maidsData.filter((maid: any) => 
            maid.status === 'ACTIVE' && maid.isVerified !== false
          );
          setAvailableMaids(verifiedMaids);
        }
      }
    } catch (error) {
      console.error('Error fetching available maids:', error);
    }
  };

  const handleAssignClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setSelectedMaidId('');
    setAssignDialogOpen(true);
    // Fetch available maids for this specific booking
    fetchAvailableMaids(booking.id);
  };

  const handleConfirmAssignment = async () => {
    if (!selectedBooking || !selectedMaidId) {
      toast({
        title: 'Selection Required',
        description: 'Please select a maid to assign',
        variant: 'destructive'
      });
      return;
    }

    setAssigning(true);
    try {
      // Send assignment request to maid
      const response = await assignmentService.sendAssignmentRequest({
        bookingId: selectedBooking.id,
        maidId: selectedMaidId,
        expiresIn: 24 // 24 hours to respond
      });

      if (response.success) {
        // Optimistic UI update - immediately remove from pending list
        setPendingBookings(prev => prev.filter(b => b.id !== selectedBooking.id));
        setProcessedBookingIds(prev => new Set([...prev, selectedBooking.id]));

        toast({
          title: 'Assignment Request Sent',
          description: 'Maid has been notified and has 24 hours to accept or reject this assignment',
          variant: 'default'
        });

        setAssignDialogOpen(false);
        setSelectedBooking(null);
        setSelectedMaidId('');

        // Refresh parent component if callback provided
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (error) {
      toast({
        title: 'Assignment Failed',
        description: 'Failed to send assignment request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setAssigning(false);
    }
  };

  const getPaginatedData = (data: Booking[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(pendingBookings.length / itemsPerPage);
  };

  const getSerialNumber = (index: number) => {
    return (currentPage - 1) * itemsPerPage + index + 1;
  };

  const handleRefresh = () => {
    fetchPendingBookings();
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
                <Clock className="h-5 w-5 text-warning" />
                Pending Assignments ({pendingBookings.length})
              </CardTitle>
              <CardDescription>Assign verified maids to customer bookings</CardDescription>
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
                <p className="text-muted-foreground">Loading pending assignments...</p>
              </div>
            ) : (
              <>
                {getPaginatedData(pendingBookings).map((booking, index) => (
                  <div key={booking.id} className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
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

                          {booking.rejectionReason && (
                            <div className="bg-red-50 dark:bg-red-950/20 p-2 rounded border border-red-200 dark:border-red-800">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm text-red-700 dark:text-red-300">
                                    <strong>Previous Rejection:</strong> {booking.rejectionReason}
                                  </p>
                                  {booking.reassignmentCount && booking.reassignmentCount > 0 && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                      Reassignment attempt #{booking.reassignmentCount + 1}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                              Pending Assignment
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <Button
                          onClick={() => handleAssignClick(booking)}
                          className="bg-primary hover:bg-primary/90"
                          size="sm"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          {booking.rejectionReason ? 'Reassign Maid' : 'Assign Maid'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {pendingBookings.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-medium mb-2">No Pending Assignments</h3>
                    <p>All bookings have been assigned to maids.</p>
                  </div>
                )}
                
                {pendingBookings.length > 0 && getTotalPages() > 1 && <Pagination />}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Maid to Booking</DialogTitle>
            <DialogDescription>
              Select a verified maid to assign to this booking. The maid will be notified and has 24 hours to respond.
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
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Select Verified Maid</label>
                <Select value={selectedMaidId} onValueChange={setSelectedMaidId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a verified maid..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMaids.map((maid) => (
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
                  Only verified maids with document approval are shown. The selected maid will receive a notification to accept or reject this assignment within 24 hours.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
              disabled={assigning}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAssignment}
              disabled={assigning || !selectedMaidId}
            >
              {assigning ? 'Assigning...' : 'Assign Maid'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
