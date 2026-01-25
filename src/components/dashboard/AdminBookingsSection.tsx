import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { assignmentService } from '@/services/assignmentService';
import { Calendar, Clock, UserCheck, ChevronLeft, ChevronRight, User, MapPin, Star, Bell, AlertTriangle } from 'lucide-react';

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
  assignedAt?: string;
  maidResponseAt?: string;
  rejectionReason?: string;
  reassignmentCount?: number;
  // Buffer period related fields
  isBufferSkipped?: boolean;
  notes?: string;
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
}

interface Maid {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating?: number;
  totalRatings?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_VERIFICATION';
  completedBookings?: number;
  skills?: string[];
}

interface EnhancedAdminBookingsSectionProps {
  bookings: Booking[];
  availableMaids: Maid[];
  onAssignMaid: (bookingId: string, maidId: string) => Promise<void>;
  onRefreshBookings: () => Promise<void>;
}

export const EnhancedAdminBookingsSection: React.FC<EnhancedAdminBookingsSectionProps> = ({
  bookings,
  availableMaids,
  onAssignMaid,
  onRefreshBookings,
}) => {
  const [pendingPage, setPendingPage] = useState(1);
  const [assignedPage, setAssignedPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedMaidId, setSelectedMaidId] = useState<string>('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const { toast } = useToast();
  const itemsPerPage = 5;

  // Filter bookings by status
  const pendingBookings = bookings.filter(b => 
    b.status === 'PENDING' || 
    (b.status === 'ASSIGNED' && b.assignmentStatus === 'REJECTED')
  );
  
  const assignedBookings = bookings.filter(b => 
    (b.status === 'ASSIGNED' && b.assignmentStatus === 'ASSIGNED_PENDING_RESPONSE') ||
    (b.status === 'CONFIRMED' && b.assignmentStatus === 'ACCEPTED') ||
    b.status === 'IN_PROGRESS'
  );

  const getPaginatedData = (data: Booking[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (data: Booking[]) => {
    return Math.ceil(data.length / itemsPerPage);
  };

  const getSerialNumber = (index: number, page: number) => {
    return (page - 1) * itemsPerPage + index + 1;
  };

  const handleAssignClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setSelectedMaidId('');
    setAssignDialogOpen(true);
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
      await onAssignMaid(selectedBooking.id, selectedMaidId);
      
      toast({
        title: 'Assignment Successful',
        description: 'Maid has been assigned successfully. They will be notified to accept or reject.',
        variant: 'default'
      });
      
      setAssignDialogOpen(false);
      setSelectedBooking(null);
      setSelectedMaidId('');
      
      // Refresh bookings to show updated status
      await onRefreshBookings();
    } catch (error) {
      toast({
        title: 'Assignment Failed',
        description: 'Failed to assign maid. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setAssigning(false);
    }
  };

  const getStatusBadge = (booking: Booking) => {
    // Handle buffer period cancellations
    if (booking.status === 'CANCELLED' && booking.isBufferSkipped) {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-purple-600 border-purple-600">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Cancelled - Buffer Period
          </Badge>
        </div>
      );
    }
    
    if (booking.status === 'PENDING') {
      return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending Assignment</Badge>;
    }
    if (booking.status === 'ASSIGNED' && booking.assignmentStatus === 'ASSIGNED_PENDING_RESPONSE') {
      return <Badge variant="outline" className="text-blue-600 border-blue-600">Awaiting Homecare Partner Response</Badge>;
    }
    if (booking.status === 'ASSIGNED' && booking.assignmentStatus === 'REJECTED') {
      return <Badge variant="destructive">Rejected - Needs Reassignment</Badge>;
    }
    if (booking.status === 'CONFIRMED' && booking.assignmentStatus === 'ACCEPTED') {
      return <Badge variant="default" className="bg-green-600">Accepted</Badge>;
    }
    if (booking.status === 'CANCELLED') {
      return <Badge variant="destructive">Cancelled</Badge>;
    }
    return <Badge variant="outline">{booking.status}</Badge>;
  };

  const Pagination = ({ currentPage, totalPages, onPageChange }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        {/* Pending Bookings */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              Pending Bookings ({pendingBookings.length})
            </CardTitle>
            <CardDescription>Assign homecare partners to pending bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getPaginatedData(pendingBookings, pendingPage).map((booking, index) => (
                <div key={booking.id} className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                        {getSerialNumber(index, pendingPage)}
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

                        {booking.isBufferSkipped && (
                          <div className="bg-purple-50 dark:bg-purple-950/20 p-2 rounded border border-purple-200 dark:border-purple-800">
                            <p className="text-sm text-purple-700 dark:text-purple-300">
                              <strong>Buffer Period:</strong> This booking was automatically cancelled due to customer's approved buffer period.
                            </p>
                          </div>
                        )}

                        {booking.notes && booking.notes.includes('buffer period') && (
                          <div className="bg-orange-50 dark:bg-orange-950/20 p-2 rounded border border-orange-200 dark:border-orange-800">
                            <p className="text-sm text-orange-700 dark:text-orange-300">
                              <strong>Notes:</strong> {booking.notes}
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
                          {getStatusBadge(booking)}
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
                  <h3 className="text-lg font-medium mb-2">No Pending Bookings</h3>
                  <p>All bookings have been assigned to homecare partners.</p>
                </div>
              )}
              
              {pendingBookings.length > 0 && getTotalPages(pendingBookings) > 1 && (
                <Pagination
                  currentPage={pendingPage}
                  totalPages={getTotalPages(pendingBookings)}
                  onPageChange={setPendingPage}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Assigned Bookings */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-success" />
              Assigned Bookings ({assignedBookings.length})
            </CardTitle>
            <CardDescription>Bookings with assigned homecare partners</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getPaginatedData(assignedBookings, assignedPage).map((booking, index) => (
                <div key={booking.id} className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                        {getSerialNumber(index, assignedPage)}
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

                        {booking.maid && (
                          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-blue-700 dark:text-blue-300">Assigned to:</span>
                              <span className="font-semibold text-blue-800 dark:text-blue-200">{booking.maid.name}</span>
                              {booking.maid.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                  <span className="text-sm text-blue-600">{booking.maid.rating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{booking.maid.phone}</p>
                            {booking.assignedAt && (
                              <p className="text-xs text-blue-500 dark:text-blue-500 mt-1">
                                Assigned: {new Date(booking.assignedAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {getStatusBadge(booking)}
                          {booking.assignmentStatus === 'ASSIGNED_PENDING_RESPONSE' && (
                            <Badge variant="outline" className="text-orange-600 border-orange-600 animate-pulse">
                              <Bell className="h-3 w-3 mr-1" />
                              Awaiting Response
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {assignedBookings.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <UserCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No Assigned Bookings</h3>
                  <p>No bookings have been assigned to homecare partners yet.</p>
                </div>
              )}
              
              {assignedBookings.length > 0 && getTotalPages(assignedBookings) > 1 && (
                <Pagination
                  currentPage={assignedPage}
                  totalPages={getTotalPages(assignedBookings)}
                  onPageChange={setAssignedPage}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignment Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Homecare Partner to Booking</DialogTitle>
            <DialogDescription>
              Select a homecare partner to assign to this booking. The homecare partner will be notified and can accept or reject the assignment.
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
                <label className="text-sm font-medium mb-2 block">Select Homecare Partner</label>
                <Select value={selectedMaidId} onValueChange={setSelectedMaidId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a homecare partner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMaids.filter(maid => maid.status === 'ACTIVE').map((maid) => (
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
                  Only active maids are shown. The selected maid will receive a notification to accept or reject this assignment.
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
