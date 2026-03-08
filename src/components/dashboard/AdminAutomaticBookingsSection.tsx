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
  RotateCcw,
  Phone,
  Home,
  Info,
  Mail,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { AutomaticBookingService, AutomaticBooking } from '@/services/automaticBookingService';
import { assignmentService } from '@/services/assignmentService';
import { BookingService } from '@/services/bookingService';
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
  pendingManualBookings?: any[];
  onAssignManualMaid?: (bookingId: string, maidId: string) => Promise<void>;
  onRefreshData?: () => void;
  mode?: 'all-only' | 'pending-only' | 'all';
}

export const AdminAutomaticBookingsSection: React.FC<AdminAutomaticBookingsSectionProps> = ({
  availableMaids,
  pendingManualBookings = [],
  onAssignManualMaid,
  onRefreshData,
  mode = 'all',
}) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(mode === 'all-only' ? 'all-bookings' : 'pending-assignment');

  // Data states
  const [pendingAssignmentBookings, setPendingAssignmentBookings] = useState<AutomaticBooking[]>([]);
  const [reassignmentBookings, setReassignmentBookings] = useState<AutomaticBooking[]>([]);
  const [allBookings, setAllBookings] = useState<AutomaticBooking[]>([]);

  // Pagination states for all bookings tab
  const [allBookingsPage, setAllBookingsPage] = useState(1);
  const [allBookingsTotalPages, setAllBookingsTotalPages] = useState(1);
  const [allBookingsTotalCount, setAllBookingsTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 10;

  // Action states
  const [sendingToMaid, setSendingToMaid] = useState<string | null>(null);
  const [reassignDialog, setReassignDialog] = useState<{
    open: boolean;
    booking: AutomaticBooking | null;
  }>({ open: false, booking: null });
  const [selectedMaidId, setSelectedMaidId] = useState<string>('');
  const [reassignReason, setReassignReason] = useState<string>('');
  const [reassigning, setReassigning] = useState(false);

  // Detail dialog state
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    bookingId: string | null;
  }>({ open: false, bookingId: null });
  const [detailLoading, setDetailLoading] = useState(false);
  const [bookingDetail, setBookingDetail] = useState<any>(null);

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

  const loadAllBookings = async (page: number = 1) => {
    try {
      const response = await AutomaticBookingService.getAutomaticBookings(page, ITEMS_PER_PAGE);
      if (response.success && response.data) {
        setAllBookings(response.data.bookings || []);
        if (response.data.pagination) {
          setAllBookingsTotalPages(response.data.pagination.totalPages || 1);
          setAllBookingsTotalCount(response.data.pagination.total || response.data.bookings?.length || 0);
        }
      }
    } catch (error) {
      console.error('Failed to load all bookings:', error);
    }
  };

  // Handle pagination change for all bookings
  const handleAllBookingsPageChange = (newPage: number) => {
    setAllBookingsPage(newPage);
    loadAllBookings(newPage);
  };

  const handleSendToMaid = async (bookingId: string, maidId?: string) => {
    setSendingToMaid(bookingId);
    try {
      await AutomaticBookingService.sendBookingToMaid(bookingId, maidId);
      toast.success('Booking sent to homecare partner successfully');
      await loadAllData();
    } catch (error) {
      toast.error('Failed to send booking to homecare partner');
      console.error('Send to maid error:', error);
    } finally {
      setSendingToMaid(null);
    }
  };

  const handleAssignManualBooking = async (bookingId: string) => {
    if (!selectedMaidId || !onAssignManualMaid) {
      toast.error('Please select a homecare partner');
      return;
    }

    setSendingToMaid(bookingId);
    try {
      await onAssignManualMaid(bookingId, selectedMaidId);
      toast.success('Manual Booking assigned successfully');
      setSelectedMaidId('');
      await loadAllData();
      onRefreshData?.();
    } catch (error) {
      toast.error('Failed to assign manual booking');
    } finally {
      setSendingToMaid(null);
    }
  };

  const handleReassignBooking = async () => {
    if (!reassignDialog.booking || !selectedMaidId) {
      toast.error('Please select a homecare partner');
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
        toast.success('Reassignment request sent to homecare partner successfully');
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

  const handleViewDetails = async (bookingId: string) => {
    setDetailDialog({ open: true, bookingId });
    setDetailLoading(true);
    setBookingDetail(null);
    try {
      const response = await BookingService.getBookingById(bookingId);
      const data = (response as any).data ?? response;
      setBookingDetail(data.booking ?? data);
    } catch (error) {
      console.error('Failed to load booking details:', error);
      toast.error('Failed to load booking details');
    } finally {
      setDetailLoading(false);
    }
  };

  const formatAddress = (customer: any) => {
    if (!customer) return null;
    const parts = [
      customer.addressLine,
      customer.locality,
      customer.landmark && `Near ${customer.landmark}`,
      customer.city,
      customer.state,
      customer.pincode,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : customer.address || null;
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col gap-3">
          {mode !== 'all-only' && (
            <div className="overflow-x-auto -mx-1 px-1">
              <TabsList className="w-full sm:w-auto inline-flex">
                <TabsTrigger value="pending-assignment" className="relative text-xs sm:text-sm whitespace-nowrap">
                  <span className="hidden sm:inline">Pending Assignment</span>
                  <span className="sm:hidden">Pending</span>
                  {(pendingAssignmentBookings.length + pendingManualBookings.length) > 0 && (
                    <Badge className="ml-1.5 px-1 py-0 text-xs" variant="destructive">
                      {pendingAssignmentBookings.length + pendingManualBookings.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="reassignment" className="relative text-xs sm:text-sm whitespace-nowrap">
                  <span className="hidden sm:inline">Reassignment Needed</span>
                  <span className="sm:hidden">Reassign</span>
                  {reassignmentBookings.length > 0 && (
                    <Badge className="ml-1.5 px-1 py-0 text-xs" variant="destructive">
                      {reassignmentBookings.length}
                    </Badge>
                  )}
                </TabsTrigger>
                {mode === 'all' && (
                  <TabsTrigger value="all-bookings" className="text-xs sm:text-sm whitespace-nowrap">
                    <span className="hidden sm:inline">All Automatic Bookings</span>
                    <span className="sm:hidden">All Bookings</span>
                  </TabsTrigger>
                )}
              </TabsList>
            </div>
          )}

          <Button onClick={refreshData} disabled={refreshing} variant="outline" size="sm" className="self-end">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {/* Pending Assignment Tab */}
        {mode !== 'all-only' && (
        <TabsContent value="pending-assignment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Bookings Awaiting Assignment ({pendingAssignmentBookings.length + pendingManualBookings.length})
              </CardTitle>
              <CardDescription>
                These bookings need to be sent to their assigned maids
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
                                <h3 className="font-semibold text-lg">{booking.service?.name ?? '(no service)'}</h3>
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
                                <p className="font-medium">{booking.customer?.name ?? '(no customer)'}</p>
                                <p className="text-sm text-muted-foreground">{booking.customer?.email ?? '-'}</p>
                                <p className="text-sm text-muted-foreground">{booking.customer?.phone ?? '-'}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">Assigned Homecare Partner</h4>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-green-600" />
                                  <span className="font-medium">{booking.maid?.name ?? '(no homecare partner)'}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Rating: {booking.maid?.rating?.toFixed(1) ?? 'N/A'}★
                                </p>
                                <p className="text-sm text-muted-foreground">{booking.maid?.phone ?? '-'}</p>
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

                            {booking.customer?.address && (
                              <div className="mb-4">
                                <h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  Service Address
                                </h4>
                                <p className="text-sm">{booking.customer?.address ?? '-'}</p>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="border-l lg:border-l-2 lg:pl-6">
                            <h4 className="font-medium mb-3">Send to Homecare Partner</h4>
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
                                    Send to {booking.maid?.name ?? '(no maid)'}
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

                  {/* Render Manual Bookings right below the automatic ones */}
                  {pendingManualBookings.map((booking) => (
                    <Card key={booking.id} className="border-l-4 border-l-yellow-400">
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Booking Details */}
                          <div className="lg:col-span-2">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="font-semibold text-lg">{booking.service?.name ?? '(no service)'}</h3>
                                <p className="text-muted-foreground">
                                  Booking ID: {booking.id.slice(-8)}
                                </p>
                                <Badge variant="outline" className="mt-1 border-yellow-400 text-yellow-600">
                                  Manual Booking
                                </Badge>
                              </div>
                              <Badge className={getAssignmentStatusColor("PENDING_ASSIGNMENT")}>
                                PENDING ASSIGNMENT
                              </Badge>
                            </div>

                            <div className="mb-4">
                              <h4 className="font-medium text-sm text-muted-foreground mb-1">Customer</h4>
                              <p className="font-medium">{booking.customer?.name ?? '(no customer)'}</p>
                              <p className="text-sm text-muted-foreground">{booking.customer?.email ?? '-'}</p>
                              <p className="text-sm text-muted-foreground">{booking.customer?.phone ?? '-'}</p>
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

                            {booking.serviceAddress && (
                              <div className="mb-4">
                                <h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  Service Address
                                </h4>
                                <p className="text-sm">{booking.serviceAddress ?? '-'}</p>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="border-l lg:border-l-2 lg:pl-6 flex flex-col justify-center">
                            <h4 className="font-medium mb-3">Assign to Homecare Partner</h4>
                            <div className="space-y-3">
                              <Select
                                value={sendingToMaid === booking.id ? selectedMaidId : ''}
                                onValueChange={(val) => {
                                  // When modifying the draft select, we need to bind the maid to this specific booking interaction
                                  if (sendingToMaid !== booking.id) {
                                    // Set focus to this booking
                                    setSelectedMaidId(val);
                                  } else {
                                    setSelectedMaidId(val);
                                  }
                                }}
                              >
                                <SelectTrigger className="w-full h-12">
                                  <SelectValue placeholder="Select partner..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableMaids.map((maid) => (
                                    <SelectItem key={maid.id} value={maid.id}>
                                      <div className="flex items-center justify-between w-full pr-4">
                                        <span>{maid.name}</span>
                                        <div className="flex items-center text-muted-foreground text-xs ml-2">
                                          <Star className="h-3 w-3 mr-1 fill-current text-yellow-500" />
                                          {maid.rating.toFixed(1)}
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Button
                                className="w-full h-12"
                                onClick={() => handleAssignManualBooking(booking.id)}
                                disabled={sendingToMaid === booking.id || !selectedMaidId}
                              >
                                {sendingToMaid === booking.id ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Assigning...
                                  </>
                                ) : (
                                  <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Confirm Assignment
                                  </>
                                )}
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
                    No bookings are waiting for assignment.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        )}

        {/* Reassignment Tab */}
        {mode !== 'all-only' && (
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
                                <h3 className="font-semibold text-lg">{booking.service?.name ?? '(no service)'}</h3>
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
                                <p className="font-medium">{booking.customer?.name ?? '(no customer)'}</p>
                                <p className="text-sm text-muted-foreground">{booking.customer?.email ?? '-'}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">Previous Homecare Partner</h4>
                                <p className="font-medium text-red-600">{booking.maid?.name ?? '(no homecare partner)'}</p>
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
                            <h4 className="font-medium mb-3">Reassign to New Homecare Partner</h4>
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
        )}

        {/* All Bookings Tab */}
        {mode !== 'pending-only' && (
        <TabsContent value="all-bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                All Automatic Bookings ({allBookingsTotalCount})
              </CardTitle>
              <CardDescription>
                Complete overview of all automatic bookings in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Homecare Partner</TableHead>
                    <TableHead className="hidden lg:table-cell">Service</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Assignment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.customer?.name ?? '(no customer)'}</p>
                          <p className="text-sm text-muted-foreground">{booking.customer?.email ?? '-'}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div>
                          <p className="font-medium">{booking.maid?.name ?? '(no homecare partner)'}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.maid?.rating?.toFixed(1) ?? 'N/A'}★
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <p className="font-medium">{booking.service?.name ?? '(no service)'}</p>
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
                      <TableCell className="hidden md:table-cell">
                        <Badge className={getAssignmentStatusColor(booking.assignmentStatus)}>
                          {booking.assignmentStatus.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(booking.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Details</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>

              {allBookings.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No automatic bookings found</p>
                </div>
              )}

              {/* Pagination Controls */}
              {allBookingsTotalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Page {allBookingsPage} of {allBookingsTotalPages} ({allBookingsTotalCount} total)
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAllBookingsPageChange(allBookingsPage - 1)}
                      disabled={allBookingsPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAllBookingsPageChange(allBookingsPage + 1)}
                      disabled={allBookingsPage === allBookingsTotalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        )}
      </Tabs>

      {/* Booking Detail Dialog */}
      <Dialog
        open={detailDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setDetailDialog({ open: false, bookingId: null });
            setBookingDetail(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Booking Details
            </DialogTitle>
            <DialogDescription>
              {bookingDetail ? `Booking ID: ${bookingDetail.id?.slice(-8)}` : 'Loading...'}
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : bookingDetail ? (
            <div className="space-y-5">
              {/* Status Bar */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getStatusColor(bookingDetail.status)}>
                  {bookingDetail.status}
                </Badge>
                {bookingDetail.assignmentStatus && (
                  <Badge className={getAssignmentStatusColor(bookingDetail.assignmentStatus)}>
                    {bookingDetail.assignmentStatus.replace(/_/g, ' ')}
                  </Badge>
                )}
                {bookingDetail.isAutomatic && (
                  <Badge variant="outline">Automatic</Badge>
                )}
                {bookingDetail.isSubscriptionBased && (
                  <Badge variant="outline" className="border-blue-300 text-blue-700">Subscription</Badge>
                )}
              </div>

              <Separator />

              {/* Customer Info */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Customer Information</h4>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium">{bookingDetail.customer?.name || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">{bookingDetail.customer?.email || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium">{bookingDetail.customer?.phone || 'Not provided'}</span>
                  </div>
                  {formatAddress(bookingDetail.customer) && (
                    <div className="flex items-start gap-2">
                      <Home className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{formatAddress(bookingDetail.customer)}</span>
                    </div>
                  )}
                  {bookingDetail.customer?.apartment_id && (
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">Apartment: {bookingDetail.customer.apartment_id}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Address (from Booking) */}
              {bookingDetail.serviceAddress && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Service Location</h4>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{bookingDetail.serviceAddress}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Service & Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Service</h4>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                    <p className="font-medium">{bookingDetail.service?.name || '-'}</p>
                    {bookingDetail.service?.description && (
                      <p className="text-sm text-muted-foreground">{bookingDetail.service.description}</p>
                    )}
                    {bookingDetail.service?.category && (
                      <Badge variant="secondary" className="mt-1">{bookingDetail.service.category}</Badge>
                    )}
                    {bookingDetail.estimatedDuration && (
                      <p className="text-sm text-muted-foreground">Duration: {bookingDetail.estimatedDuration} mins</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Schedule</h4>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {new Date(bookingDetail.scheduledAt).toLocaleDateString('en-IN', {
                          weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(bookingDetail.scheduledAt).toLocaleTimeString([], {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {bookingDetail.timeSlot && (
                      <p className="text-sm text-muted-foreground">Slot: {bookingDetail.timeSlot}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment / Pricing */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Payment</h4>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Amount</span>
                    <span className="font-medium">₹{bookingDetail.totalAmount?.toFixed(2) ?? '0.00'}</span>
                  </div>
                  {bookingDetail.discount > 0 && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-muted-foreground">Discount</span>
                      <span className="text-green-600">-₹{bookingDetail.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-1 pt-1 border-t">
                    <span className="text-sm font-medium">Final Amount</span>
                    <span className="font-bold text-lg">₹{bookingDetail.finalAmount?.toFixed(2) ?? '0.00'}</span>
                  </div>
                </div>
              </div>

              {/* Subscription Info */}
              {bookingDetail.customer?.customerProfile?.subscription && (() => {
                const sub = bookingDetail.customer.customerProfile.subscription;
                return (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Subscription Details</h4>
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{sub.plan?.name || 'Subscription Plan'}</span>
                        <Badge className={sub.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {sub.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Billing</span>
                          <span>{sub.billingCycle}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount</span>
                          <span>₹{sub.amount?.toFixed(2)}</span>
                        </div>
                        {sub.plan?.sessionsPerWeek && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Sessions/Week</span>
                            <span>{sub.plan.sessionsPerWeek}</span>
                          </div>
                        )}
                        {sub.plan?.sessionsPerMonth && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Sessions/Month</span>
                            <span>{sub.plan.sessionsPerMonth}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Valid: {new Date(sub.startDate).toLocaleDateString()} — {new Date(sub.endDate).toLocaleDateString()}
                      </div>
                      {sub.isInBufferPeriod && (
                        <Badge variant="outline" className="border-orange-300 text-orange-700 mt-1">
                          In Buffer Period ({sub.bufferDaysUsed}/{sub.bufferDaysCount} days used)
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Assigned Maid */}
              {bookingDetail.maid && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Assigned Homecare Partner</h4>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{bookingDetail.maid.name}</span>
                      {bookingDetail.maid.maidProfile?.rating && (
                        <Badge variant="secondary" className="ml-auto">
                          <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                          {bookingDetail.maid.maidProfile.rating.toFixed(1)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{bookingDetail.maid.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{bookingDetail.maid.email}</span>
                    </div>
                    {bookingDetail.maid.maidProfile?.completedBookings != null && (
                      <p className="text-sm text-muted-foreground">
                        {bookingDetail.maid.maidProfile.completedBookings} bookings completed
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Special Instructions */}
              {bookingDetail.specialInstructions && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Special Instructions</h4>
                  <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-4">
                    <p className="text-sm">{bookingDetail.specialInstructions}</p>
                  </div>
                </div>
              )}

              {/* Assignment History */}
              {bookingDetail.assignmentRequests?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Assignment History</h4>
                  <div className="space-y-2">
                    {bookingDetail.assignmentRequests.map((req: any) => (
                      <div key={req.id} className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-2 text-sm">
                        <div>
                          <span className="font-medium">{req.maid?.user?.name || 'Unknown'}</span>
                          <span className="text-muted-foreground ml-2">
                            {new Date(req.requestedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <Badge variant={req.status === 'ACCEPTED' ? 'default' : req.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                          {req.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Failed to load booking details</p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDetailDialog({ open: false, bookingId: null });
                setBookingDetail(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                <p className="font-medium">{reassignDialog.booking.service?.name ?? '(no service)'}</p>
                <p className="text-sm text-muted-foreground">
                  {reassignDialog.booking.customer?.name ?? '(no customer)'} • {new Date(reassignDialog.booking.scheduledAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <Label htmlFor="new-maid">Select New Homecare Partner</Label>
                <Select value={selectedMaidId} onValueChange={setSelectedMaidId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a homecare partner..." />
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
