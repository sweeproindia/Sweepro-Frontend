import React, { useState } from 'react';
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
  const [allBooksPage, setAllBooksPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedMaidId, setSelectedMaidId] = useState<string>('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const { toast } = useToast();
  const itemsPerPage = 5;

  // Display ALL bookings created till now
  const allBookings = bookings;

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
        description: 'Please select a homecare partner to assign',
        variant: 'destructive'
      });
      return;
    }

    setAssigning(true);
    try {
      await onAssignMaid(selectedBooking.id, selectedMaidId);

      toast({
        title: 'Assignment Successful',
        description: 'Homecare Partner has been assigned successfully. They will be notified to accept or reject.',
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
        description: 'Failed to assign homecare partner. Please try again.',
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
        {/* ALL BOOKINGS SECTION */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              All Bookings ({allBookings.length})
            </CardTitle>
            <CardDescription>Complete history of all bookings created in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getPaginatedData(allBookings, allBooksPage).map((booking, index) => (
                <div key={booking.id} className="border-2 border-slate-200 dark:border-slate-700 rounded-xl p-5 bg-white dark:bg-slate-900 hover:shadow-lg hover:border-primary/50 transition-all duration-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary">
                        {getSerialNumber(index, allBooksPage)}
                      </div>
                      <div className="flex-1 space-y-4">
                        {/* Service and Customer Info */}
                        <div className="space-y-2">
                          <div>
                            <p className="font-bold text-lg text-foreground">{booking.service.name}</p>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4 text-slate-500" />
                              <span className="font-medium">{booking.customer.name}</span>
                            </div>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-600">{booking.customer.phone}</span>
                          </div>
                        </div>

                        {/* Date & Time Info */}
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                            <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{new Date(booking.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                            <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{booking.timeSlot || new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>

                        {/* Assigned Maid */}
                        {booking.maid && (
                          <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">Assigned to</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="font-bold text-blue-900 dark:text-blue-100">{booking.maid.name}</span>
                              {booking.maid.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">{booking.maid.rating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Status and Actions */}
                        <div className="flex items-center gap-2 flex-wrap pt-2">
                          {getStatusBadge(booking)}
                          {booking.assignmentStatus === 'ASSIGNED_PENDING_RESPONSE' && (
                            <Badge variant="outline" className="text-orange-600 border-orange-600 animate-pulse">
                              <Bell className="h-3 w-3 mr-1" />
                              Awaiting
                            </Badge>
                          )}
                          {booking.status === 'PENDING' && (
                            <Button size="sm" className="ml-auto" onClick={() => handleAssignClick(booking)}>
                              Assign Homecare Partner
                            </Button>
                          )}
                          {booking.status === 'ASSIGNED' && booking.assignmentStatus === 'REJECTED' && (
                            <Button size="sm" className="ml-auto" onClick={() => handleAssignClick(booking)}>
                              Reassign
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {allBookings.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No Bookings</h3>
                  <p>No bookings have been created yet.</p>
                </div>
              )}

              {allBookings.length > 0 && getTotalPages(allBookings) > 1 && (
                <Pagination
                  currentPage={allBooksPage}
                  totalPages={getTotalPages(allBookings)}
                  onPageChange={setAllBooksPage}
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
                    <span className="font-medium">Time:</span> {selectedBooking.timeSlot || new Date(selectedBooking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                  Only active homecare partners are shown. The selected homecare partner will receive a notification to accept or reject this assignment.
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
              {assigning ? 'Assigning...' : 'Assign Homecare Partner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
