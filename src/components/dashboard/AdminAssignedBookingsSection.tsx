import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { assignmentService } from '@/services/assignmentService';
import { 
  Calendar, 
  Clock, 
  UserCheck, 
  User, 
  MapPin, 
  Star, 
  Bell,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle,
  AlertCircle
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
  assignedAt?: string;
  maidResponseAt?: string;
  expiresAt?: string;
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

interface AdminAssignedBookingsSectionProps {
  onRefresh?: () => void;
}

export const AdminAssignedBookingsSection: React.FC<AdminAssignedBookingsSectionProps> = ({
  onRefresh
}) => {
  const [assignedBookings, setAssignedBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAssignedBookings();
  }, []);

  const fetchAssignedBookings = async () => {
    setLoading(true);
    try {
      const response = await assignmentService.getAssignedBookings();

      if (response.success) {
        const bookingsData = Array.isArray(response.data) ? response.data : [];
        // Filter bookings that have been assigned to maids
        const filteredBookings = bookingsData.filter((booking: Booking) => 
          booking.maidId && (
            booking.assignmentStatus === 'ASSIGNED_PENDING_RESPONSE' ||
            booking.assignmentStatus === 'ACCEPTED' ||
            booking.status === 'CONFIRMED' ||
            booking.status === 'IN_PROGRESS'
          )
        );
        setAssignedBookings(filteredBookings);
      }
    } catch (error) {
      console.error('Error fetching assigned bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch assigned bookings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getPaginatedData = (data: Booking[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(assignedBookings.length / itemsPerPage);
  };

  const getSerialNumber = (index: number) => {
    return (currentPage - 1) * itemsPerPage + index + 1;
  };

  const handleRefresh = () => {
    fetchAssignedBookings();
    if (onRefresh) {
      onRefresh();
    }
  };

  const getStatusBadge = (booking: Booking) => {
    if (booking.assignmentStatus === 'ASSIGNED_PENDING_RESPONSE') {
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          Awaiting Maid Response
        </Badge>
      );
    }
    if (booking.assignmentStatus === 'ACCEPTED' || booking.status === 'CONFIRMED') {
      return (
        <Badge variant="default" className="bg-green-600">
          Accepted
        </Badge>
      );
    }
    if (booking.status === 'IN_PROGRESS') {
      return (
        <Badge variant="default" className="bg-blue-600">
          In Progress
        </Badge>
      );
    }
    return <Badge variant="outline">{booking.status}</Badge>;
  };

  const getTimeRemaining = (expiresAt?: string) => {
    if (!expiresAt) return null;
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
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
    <Card className="dashboard-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-success" />
              Assigned Bookings ({assignedBookings.length})
            </CardTitle>
            <CardDescription>Bookings assigned to maids - tracking responses and progress</CardDescription>
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
              <p className="text-muted-foreground">Loading assigned bookings...</p>
            </div>
          ) : (
            <>
              {getPaginatedData(assignedBookings).map((booking, index) => (
                <div key={booking.id} className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
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
                            {booking.maidResponseAt && (
                              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                Responded: {new Date(booking.maidResponseAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{booking.serviceAddress}</span>
                        </div>

                        {booking.specialInstructions && (
                          <div className="bg-gray-50 dark:bg-gray-950/20 p-2 rounded border border-gray-200 dark:border-gray-800">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              <strong>Instructions:</strong> {booking.specialInstructions}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-2 flex-wrap">
                          {getStatusBadge(booking)}
                          
                          {booking.assignmentStatus === 'ASSIGNED_PENDING_RESPONSE' && (
                            <>
                              <Badge variant="outline" className="text-orange-600 border-orange-600 animate-pulse">
                                <Bell className="h-3 w-3 mr-1" />
                                Awaiting Response
                              </Badge>
                              {booking.expiresAt && (
                                <Badge variant="outline" className="text-red-600 border-red-600">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {getTimeRemaining(booking.expiresAt)}
                                </Badge>
                              )}
                            </>
                          )}
                          
                          {booking.assignmentStatus === 'ACCEPTED' && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Confirmed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex flex-col gap-2">
                      {booking.assignmentStatus === 'ASSIGNED_PENDING_RESPONSE' && (
                        <Badge variant="secondary" className="text-xs">
                          Pending Response
                        </Badge>
                      )}
                      {booking.assignmentStatus === 'ACCEPTED' && (
                        <Badge variant="default" className="text-xs bg-green-600">
                          Ready to Start
                        </Badge>
                      )}
                      {booking.status === 'IN_PROGRESS' && (
                        <Badge variant="default" className="text-xs bg-blue-600">
                          Service Active
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {assignedBookings.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <UserCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No Assigned Bookings</h3>
                  <p>No bookings have been assigned to maids yet.</p>
                </div>
              )}
              
              {assignedBookings.length > 0 && getTotalPages() > 1 && <Pagination />}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
