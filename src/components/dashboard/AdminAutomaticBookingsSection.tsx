import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Calendar,
  User,
  MapPin,
  Star,
  Send,
  RotateCcw
} from 'lucide-react';
import { AutomaticBookingService, AutomaticBooking } from '@/services/automaticBookingService';
import { assignmentService } from '@/services/assignmentService';
import { toast } from 'sonner';

interface Maid {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  skills: string[];
  completedBookings: number;
}

interface AdminAutomaticBookingsSectionProps {
  availableMaids: Maid[];
  onRefreshData?: () => void;
}

export const AdminAutomaticBookingsSection: React.FC<AdminAutomaticBookingsSectionProps> = ({
  availableMaids,
  onRefreshData,
}) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending-assignment');
  
  // Data states
  const [pendingAssignmentBookings, setPendingAssignmentBookings] = useState<AutomaticBooking[]>([]);
  const [reassignmentBookings, setReassignmentBookings] = useState<AutomaticBooking[]>([]);
  const [allBookings, setAllBookings] = useState<AutomaticBooking[]>([]);
  
  // Action states
  const [sendingToMaid, setSendingToMaid] = useState<string | null>(null);
  const [reassignDialog, setReassignDialog] = useState<{
    open: boolean;
    booking: AutomaticBooking | null;
  }>({ open: false, booking: null });
  const [selectedMaidId, setSelectedMaidId] = useState<string>('');
  const [reassignReason, setReassignReason] = useState<string>('');
  const [reassigning, setReassigning] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPendingAssignmentBookings(),
        loadReassignmentBookings(),
        loadAllBookings()
      ]);
    } catch (error) {
      console.error('Failed to load automatic bookings data:', error);
      toast.error('Failed to load bookings data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await loadAllData();
      onRefreshData?.();
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const loadPendingAssignmentBookings = async () => {
    try {
      const response = await AutomaticBookingService.getPendingAssignmentBookings();
      if (response.success && response.data) {
        setPendingAssignmentBookings(response.data);
      }
    } catch (error) {
      console.error('Failed to load pending assignment bookings:', error);
    }
  };

  const loadReassignmentBookings = async () => {
    try {
      console.log('🔄 Loading reassignment bookings...');
      const response = await AutomaticBookingService.getReassignmentBookings();
      console.log('📋 Reassignment bookings response:', response);
      
      if (response.success && response.data) {
        console.log(`✅ Found ${response.data.length} reassignment bookings`);
        setReassignmentBookings(response.data);
      } else {
        console.log('❌ No reassignment bookings data or unsuccessful response');
        setReassignmentBookings([]);
      }
    } catch (error) {
      console.error('❌ Failed to load reassignment bookings:', error);
      setReassignmentBookings([]);
    }
  };

  const loadAllBookings = async () => {
    try {
      const response = await AutomaticBookingService.getAutomaticBookings(1, 50);
      if (response.success && response.data) {
        setAllBookings(response.data.bookings || []);
      }
    } catch (error) {
      console.error('Failed to load all bookings:', error);
    }
  };

  const handleSendToMaid = async (bookingId: string, maidId?: string) => {
    setSendingToMaid(bookingId);
    try {
      await AutomaticBookingService.sendBookingToMaid(bookingId, maidId);
      toast.success('Booking sent to maid successfully');
      await loadAllData();
    } catch (error) {
      toast.error('Failed to send booking to maid');
      console.error('Send to maid error:', error);
    } finally {
      setSendingToMaid(null);
    }
  };

  const handleReassignBooking = async () => {
    if (!reassignDialog.booking || !selectedMaidId) {
      toast.error('Please select a maid');
      return;
    }

    setReassigning(true);
    try {
      // Use the assignments service for reassignment
      const response = await assignmentService.sendAssignmentRequest({
        bookingId: reassignDialog.booking.id,
        maidId: selectedMaidId,
        expiresIn: 24
      });

      if (response.success) {
        toast.success('Reassignment request sent to maid successfully');
        setReassignDialog({ open: false, booking: null });
        setSelectedMaidId('');
        setReassignReason('');
        await loadAllData();
      } else {
        throw new Error(response.message || 'Failed to send reassignment request');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reassign booking');
      console.error('Reassign error:', error);
    } finally {
      setReassigning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'SENT_TO_MAID':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAssignmentStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_ASSIGNMENT':
        return 'bg-orange-100 text-orange-800';
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'REASSIGNMENT_NEEDED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Loading automatic bookings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Automatic Booking Management</h2>
          <p className="text-muted-foreground">
            Manage daily automatic bookings and maid assignments
          </p>
        </div>
        <Button onClick={refreshData} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending-assignment" className="relative">
            Pending Assignment
            {pendingAssignmentBookings.length > 0 && (
              <Badge className="ml-2 px-1 py-0 text-xs" variant="destructive">
                {pendingAssignmentBookings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reassignment" className="relative">
            Reassignment Needed
            {reassignmentBookings.length > 0 && (
              <Badge className="ml-2 px-1 py-0 text-xs" variant="destructive">
                {reassignmentBookings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all-bookings">All Automatic Bookings</TabsTrigger>
        </TabsList>

        {/* Pending Assignment Tab */}
        <TabsContent value="pending-assignment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Bookings Awaiting Assignment ({pendingAssignmentBookings.length})
              </CardTitle>
              <CardDescription>
                These automatic bookings need to be sent to their assigned maids
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingAssignmentBookings.length > 0 ? (
                <div className="space-y-4">
                  {pendingAssignmentBookings.map((booking) => (
                    <Card key={booking.id} className="border-l-4 border-l-orange-500">
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Booking Details */}
                          <div className="lg:col-span-2">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="font-semibold text-lg">{booking.service.name}</h3>
                                <p className="text-muted-foreground">
                                  Booking ID: {booking.id.slice(-8)}
                                </p>
                                <Badge variant="outline" className="mt-1">
                                  Automatic Booking
                                </Badge>
                              </div>
                              <Badge className={getAssignmentStatusColor(booking.assignmentStatus)}>
                                {booking.assignmentStatus.replace('_', ' ')}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">Customer</h4>
                                <p className="font-medium">{booking.customer.name}</p>
                                <p className="text-sm text-muted-foreground">{booking.customer.email}</p>
                                <p className="text-sm text-muted-foreground">{booking.customer.phone}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">Assigned Maid</h4>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-green-600" />
                                  <span className="font-medium">{booking.maid.name}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Rating: {booking.maid.rating.toFixed(1)}★
                                </p>
                                <p className="text-sm text-muted-foreground">{booking.maid.phone}</p>
                              </div>
                            </div>

                            <div className="mb-4">
                              <h4 className="font-medium text-sm text-muted-foreground mb-1">Schedule</h4>
                              <p className="font-medium">
                                {new Date(booking.scheduledAt).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(booking.scheduledAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>

                            {booking.customer.address && (
                              <div className="mb-4">
                                <h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  Service Address
                                </h4>
                                <p className="text-sm">{booking.customer.address}</p>
                              </div>
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className="border-l lg:border-l-2 lg:pl-6">
                            <h4 className="font-medium mb-3">Send to Maid</h4>
                            <div className="space-y-3">
                              <Button
                                className="w-full"
                                onClick={() => handleSendToMaid(booking.id)}
                                disabled={sendingToMaid === booking.id}
                              >
                                {sendingToMaid === booking.id ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send to {booking.maid.name}
                                  </>
                                )}
                              </Button>
                              
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setReassignDialog({ open: true, booking })}
                                disabled={sendingToMaid === booking.id}
                              >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reassign to Different Maid
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">All bookings assigned!</h3>
                  <p className="text-muted-foreground">
                    No automatic bookings are waiting for assignment.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reassignment Tab */}
        <TabsContent value="reassignment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-purple-500" />
                Bookings Needing Reassignment ({reassignmentBookings.length})
              </CardTitle>
              <CardDescription>
                These bookings were rejected by maids and need new assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reassignmentBookings.length > 0 ? (
                <div className="space-y-4">
                  {reassignmentBookings.map((booking) => (
                    <Card key={booking.id} className="border-l-4 border-l-purple-500">
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Booking Details */}
                          <div className="lg:col-span-2">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="font-semibold text-lg">{booking.service.name}</h3>
                                <p className="text-muted-foreground">
                                  Booking ID: {booking.id.slice(-8)}
                                </p>
                                <Badge variant="destructive" className="mt-1">
                                  Rejected by Maid
                                </Badge>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline">
                                  Attempt #{booking.reassignmentCount + 1}
                                </Badge>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">Customer</h4>
                                <p className="font-medium">{booking.customer.name}</p>
                                <p className="text-sm text-muted-foreground">{booking.customer.email}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">Previous Maid</h4>
                                <p className="font-medium text-red-600">{booking.maid.name}</p>
                                <p className="text-sm text-muted-foreground">Rejected this booking</p>
                              </div>
                            </div>

                            {booking.rejectionReason && (
                              <div className="mb-4 p-3 bg-red-50 rounded-lg">
                                <h4 className="font-medium text-sm text-red-800 mb-1">Rejection Reason</h4>
                                <p className="text-sm text-red-700">{booking.rejectionReason}</p>
                              </div>
                            )}

                            <div className="mb-4">
                              <h4 className="font-medium text-sm text-muted-foreground mb-1">Schedule</h4>
                              <p className="font-medium">
                                {new Date(booking.scheduledAt).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(booking.scheduledAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          
                          {/* Reassignment Actions */}
                          <div className="border-l lg:border-l-2 lg:pl-6">
                            <h4 className="font-medium mb-3">Reassign to New Maid</h4>
                            <Button
                              className="w-full"
                              onClick={() => setReassignDialog({ open: true, booking })}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Choose New Maid
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No reassignments needed!</h3>
                  <p className="text-muted-foreground">
                    All bookings have been successfully assigned and accepted.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Bookings Tab */}
        <TabsContent value="all-bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                All Automatic Bookings ({allBookings.length})
              </CardTitle>
              <CardDescription>
                Complete overview of all automatic bookings in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Maid</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allBookings.slice(0, 20).map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.customer.name}</p>
                          <p className="text-sm text-muted-foreground">{booking.customer.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.maid.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.maid.rating.toFixed(1)}★
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{booking.service.name}</p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {new Date(booking.scheduledAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.scheduledAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getAssignmentStatusColor(booking.assignmentStatus)}>
                          {booking.assignmentStatus.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {allBookings.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No automatic bookings found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reassignment Dialog */}
      <Dialog 
        open={reassignDialog.open} 
        onOpenChange={(open) => setReassignDialog({ open, booking: reassignDialog.booking })}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reassign Booking</DialogTitle>
            <DialogDescription>
              Select a new maid for this booking. The previous maid will no longer receive this assignment.
            </DialogDescription>
          </DialogHeader>

          {reassignDialog.booking && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{reassignDialog.booking.service.name}</p>
                <p className="text-sm text-muted-foreground">
                  {reassignDialog.booking.customer.name} • {new Date(reassignDialog.booking.scheduledAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <Label htmlFor="new-maid">Select New Maid</Label>
                <Select value={selectedMaidId} onValueChange={setSelectedMaidId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a maid..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMaids
                      .filter(maid => maid.id !== reassignDialog.booking?.maidId)
                      .map((maid) => (
                        <SelectItem key={maid.id} value={maid.id}>
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <p className="font-medium">{maid.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {maid.rating.toFixed(1)}★ • {maid.completedBookings} bookings
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reassign-reason">Reason for Reassignment</Label>
                <Textarea
                  id="reassign-reason"
                  placeholder="Why is this booking being reassigned?"
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReassignDialog({ open: false, booking: null })}
              disabled={reassigning}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReassignBooking} 
              disabled={reassigning || !selectedMaidId}
            >
              {reassigning ? 'Reassigning...' : 'Reassign Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
