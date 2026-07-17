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
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Bell,
  Timer,
  Eye
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
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  
  const itemsPerPage = 5;

  const toggleCardExpanded = (id: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Bell className="h-5 w-5 text-primary" />
                Booking Assignment Requests
                {assignmentRequests.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {assignmentRequests.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-1">Accept or reject booking assignments from administrators</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="w-full sm:w-auto"
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
                {getPaginatedData(assignmentRequests).map((request, index) => {
                  const isExpanded = expandedCards.has(request.id);
                  return (
                  <div key={request.id} className={`border rounded-2xl p-3 sm:p-5 transition-shadow hover:shadow-md ${
                    isExpiringSoon(request.expiresAt) 
                      ? 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-800' 
                      : 'bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20'
                  }`}>
                    <div className="flex flex-col gap-3">
                      {/* Compact Header: Service + Amount + Urgent badge */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium text-primary shrink-0">
                            {getSerialNumber(index)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground text-sm sm:text-base truncate">{request.booking.service.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isExpiringSoon(request.expiresAt) && (
                            <Badge variant="destructive" className="animate-pulse text-[10px] px-1.5 py-0.5">
                              Urgent
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-blue-600 border-blue-600 text-[10px] px-1.5 py-0.5 hidden sm:inline-flex">
                            New
                          </Badge>
                        </div>
                      </div>

                      {/* Essential info row: Customer + Date */}
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <User className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                          <span className="font-medium truncate">{request.booking.customer.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(request.booking.scheduledAt).toLocaleDateString()}</span>
                          <span className="text-muted-foreground/60">•</span>
                          <span>{request.booking.timeSlot || new Date(request.booking.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      </div>

                      {/* Expiry timer - always visible */}
                      <div className="flex items-center gap-1.5">
                        <Timer className="h-3 w-3 text-orange-600 shrink-0" />
                        <span className={`text-xs ${isExpiringSoon(request.expiresAt) ? 'text-red-600 font-semibold' : 'text-orange-600'}`}>
                          {getTimeRemaining(request.expiresAt)}
                        </span>
                      </div>

                      {/* View Details toggle (mobile-friendly) */}
                      <button
                        type="button"
                        onClick={() => toggleCardExpanded(request.id)}
                        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium sm:hidden"
                      >
                        <Eye className="h-3 w-3" />
                        {isExpanded ? 'Hide Details' : 'View Details'}
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>

                      {/* Expanded details - always visible on sm+, toggle on mobile */}
                      <div className={`space-y-3 ${isExpanded ? 'block' : 'hidden'} sm:block`}>
                        {/* Customer details row */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{request.booking.serviceAddress}</span>
                          </span>
                          <span className="hidden sm:inline text-muted-foreground/40">•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 shrink-0" />
                            {request.booking.service.baseDuration} min • {request.booking.service.category}
                          </span>
                        </div>

                        {request.booking.specialInstructions && (
                          <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                              <strong>Note:</strong> {request.booking.specialInstructions}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons - always visible */}
                      <div className="flex gap-2 pt-1">
                        <Button
                          onClick={() => handleAcceptRequest(request.id)}
                          disabled={processing === request.id}
                          className="bg-green-600 hover:bg-green-700 text-white flex-1 h-9 text-xs sm:text-sm"
                          size="sm"
                        >
                          {processing === request.id ? (
                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-1.5"></div>
                          ) : (
                            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                          )}
                          Accept
                        </Button>
                        <Button
                          onClick={() => handleRejectClick(request)}
                          disabled={processing === request.id}
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex-1 h-9 text-xs sm:text-sm"
                          size="sm"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1.5" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                  );
                })}
                
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
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md mx-auto">
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
