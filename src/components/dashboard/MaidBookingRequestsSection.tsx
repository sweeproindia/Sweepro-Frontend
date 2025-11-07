import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { assignmentService, AssignmentRequest } from '@/services/assignmentService';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Bell,
  Timer
} from 'lucide-react';

interface MaidBookingRequestsSectionProps {
  onRefresh?: () => void;
}

export const MaidBookingRequestsSection: React.FC<MaidBookingRequestsSectionProps> = ({
  onRefresh
}) => {
  const [assignmentRequests, setAssignmentRequests] = useState<AssignmentRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<AssignmentRequest | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [processedRequestIds, setProcessedRequestIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAssignmentRequests();
    // Set up polling for real-time updates
    const interval = setInterval(fetchAssignmentRequests, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAssignmentRequests = async () => {
    setLoading(true);
    try {
      const response = await assignmentService.getPendingAssignments();

      if (response.success) {
        let requestsData: AssignmentRequest[] = [];
        if (Array.isArray(response.data)) {
          requestsData = response.data;
        } else if (response.data && Array.isArray((response.data as any).pendingOnly)) {
          requestsData = (response.data as any).pendingOnly;
        }
        // Filter out processed requests to prevent reappearing
        const filteredRequests = requestsData.filter((request: AssignmentRequest) =>
          !processedRequestIds.has(request.id) && request.status === 'pending'
        );
        setAssignmentRequests(filteredRequests);
      }
    } catch (error) {
      console.error('Error fetching assignment requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch assignment requests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    setProcessing(requestId);
    try {
      const response = await assignmentService.acceptAssignment(requestId);

      if (response.success) {
        // Optimistic UI update - immediately remove from pending list
        setAssignmentRequests(prev => prev.filter(req => req.id !== requestId));
        setProcessedRequestIds(prev => new Set([...prev, requestId]));

        toast({
          title: 'Assignment Accepted',
          description: 'You have successfully accepted this booking assignment',
          variant: 'default'
        });

        // Refresh parent component if callback provided
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to accept assignment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectClick = (request: AssignmentRequest) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for rejecting this assignment',
        variant: 'destructive'
      });
      return;
    }

    setProcessing(selectedRequest.id);
    try {
      const response = await assignmentService.rejectAssignment(selectedRequest.id, rejectionReason.trim());

      if (response.success) {
        // Optimistic UI update - immediately remove from pending list
        setAssignmentRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
        setProcessedRequestIds(prev => new Set([...prev, selectedRequest.id]));

        toast({
          title: 'Assignment Rejected',
          description: 'The assignment has been rejected and sent back for reassignment',
          variant: 'default'
        });

        setRejectDialogOpen(false);
        setSelectedRequest(null);
        setRejectionReason('');

        // Refresh parent component if callback provided
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject assignment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setProcessing(null);
    }
  };

  const getPaginatedData = (data: AssignmentRequest[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(assignmentRequests.length / itemsPerPage);
  };

  const getSerialNumber = (index: number) => {
    return (currentPage - 1) * itemsPerPage + index + 1;
  };

  const getTimeRemaining = (expiresAt: string) => {
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

  const isExpiringSoon = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const hoursRemaining = diff / (1000 * 60 * 60);
    return hoursRemaining <= 2; // Less than 2 hours remaining
  };

  const handleRefresh = () => {
    fetchAssignmentRequests();
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
                <Bell className="h-5 w-5 text-primary" />
                Booking Assignment Requests ({assignmentRequests.length})
              </CardTitle>
              <CardDescription>Accept or reject booking assignments from administrators</CardDescription>
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
                <p className="text-muted-foreground">Loading assignment requests...</p>
              </div>
            ) : (
              <>
                {getPaginatedData(assignmentRequests).map((request, index) => (
                  <div key={request.id} className={`border rounded-lg p-4 ${
                    isExpiringSoon(request.expiresAt) 
                      ? 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-800' 
                      : 'bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                          {getSerialNumber(index)}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-4 flex-wrap">
                            <div>
                              <p className="font-semibold text-foreground">{request.booking.service.name}</p>
                              <p className="text-sm text-muted-foreground">₹{request.booking.totalAmount.toLocaleString()}</p>
                            </div>
                            <div>
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{request.booking.customer.name}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{request.booking.customer.phone}</p>
                            </div>
                            <div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{new Date(request.booking.scheduledAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{request.booking.timeSlot || new Date(request.booking.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{request.booking.serviceAddress}</span>
                          </div>

                          {request.booking.specialInstructions && (
                            <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded border border-blue-200 dark:border-blue-800">
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                <strong>Special Instructions:</strong> {request.booking.specialInstructions}
                              </p>
                            </div>
                          )}

                          <div className="bg-gray-50 dark:bg-gray-950/20 p-3 rounded border border-gray-200 dark:border-gray-800">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Service Duration:</span> {request.booking.service.baseDuration} minutes
                              </div>
                              <div>
                                <span className="font-medium">Service Category:</span> {request.booking.service.category}
                              </div>
                              <div>
                                <span className="font-medium">Requested:</span> {new Date(request.requestedAt).toLocaleString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Timer className="h-3 w-3 text-orange-600" />
                                <span className={`text-sm ${isExpiringSoon(request.expiresAt) ? 'text-red-600 font-medium' : 'text-orange-600'}`}>
                                  {getTimeRemaining(request.expiresAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                              <Bell className="h-3 w-3 mr-1" />
                              New Assignment
                            </Badge>
                            {isExpiringSoon(request.expiresAt) && (
                              <Badge variant="destructive" className="animate-pulse">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Urgent - Expiring Soon
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex flex-col gap-2">
                        <Button
                          onClick={() => handleAcceptRequest(request.id)}
                          disabled={processing === request.id}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          {processing === request.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Accept
                        </Button>
                        <Button
                          onClick={() => handleRejectClick(request)}
                          disabled={processing === request.id}
                          variant="outline"
                          className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                          size="sm"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {assignmentRequests.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-medium mb-2">No Assignment Requests</h3>
                    <p>You don't have any pending booking assignment requests at the moment.</p>
                  </div>
                )}
                
                {assignmentRequests.length > 0 && getTotalPages() > 1 && <Pagination />}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Assignment Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this booking assignment. This will help the admin understand your concerns.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-muted/30 p-3 rounded-lg">
                <p className="font-medium">{selectedRequest.booking.service.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedRequest.booking.customer.name} • {new Date(selectedRequest.booking.scheduledAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Reason for Rejection</label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please explain why you cannot accept this assignment..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Common reasons: Schedule conflict, location too far, service type not suitable, etc.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={processing !== null}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReject}
              disabled={processing !== null || !rejectionReason.trim()}
              variant="destructive"
            >
              {processing ? 'Rejecting...' : 'Reject Assignment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
