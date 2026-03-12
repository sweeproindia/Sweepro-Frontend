import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { apiRequest, HttpMethod, API_ENDPOINTS } from '@/services/api';
import { 
  User, 
  MapPin, 
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Clock,
  Calendar,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Eye
} from 'lucide-react';

interface CustomerAssignmentRequest {
  id: string;
  customerId: string;
  maidId: string;
  requestedBy: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
  requestedAt: string;
  respondedAt?: string;
  rejectionReason?: string;
  notes?: string;
  expiresAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
    timeSlot?: string;
  };
  admin: {
    name: string;
    email: string;
  };
}

interface MaidAssignmentRequestsSectionProps {
  onRefresh?: () => void;
}

export const MaidAssignmentRequestsSection: React.FC<MaidAssignmentRequestsSectionProps> = ({
  onRefresh
}) => {
  const [assignmentRequests, setAssignmentRequests] = useState<CustomerAssignmentRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<CustomerAssignmentRequest | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [processedRequestIds, setProcessedRequestIds] = useState<Set<string>>(new Set());
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

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
    try {
      console.log('🔄 Fetching assignment requests...');
      
      const response = await apiRequest(
        API_ENDPOINTS.CUSTOMER_ASSIGNMENTS.GET_MAID_REQUESTS,
        {
          method: HttpMethod.GET,
          requiresAuth: true
        }
      );

      console.log('📋 Raw API response:', response);
      
      // Filter out processed requests to prevent them from reappearing
      const filteredRequests = response.data.filter((request: CustomerAssignmentRequest) => 
        !processedRequestIds.has(request.id)
      );
      
      console.log('✅ Filtered requests:', filteredRequests.length);
      setAssignmentRequests(filteredRequests);
    } catch (error) {
      console.error('❌ Error fetching assignment requests:', error);
      toast.error('Failed to load assignment requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    setProcessing(requestId);
    
    // Optimistic update - immediately remove from list
    setProcessedRequestIds(prev => new Set([...prev, requestId]));
    setAssignmentRequests(prev => prev.filter(req => req.id !== requestId));

    try {
      const response = await apiRequest(
        API_ENDPOINTS.CUSTOMER_ASSIGNMENTS.ACCEPT_REQUEST.replace(':requestId', requestId),
        {
          method: HttpMethod.POST,
          requiresAuth: true
        }
      );

      toast.success('Assignment request accepted successfully!');
      
      // Refresh parent component if callback provided
      onRefresh?.();
      
    } catch (error) {
      console.error('Error accepting assignment request:', error);
      toast.error('Failed to accept assignment request');
      
      // Revert optimistic update on error
      setProcessedRequestIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
      fetchAssignmentRequests();
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setProcessing(selectedRequest.id);
    
    // Optimistic update - immediately remove from list
    setProcessedRequestIds(prev => new Set([...prev, selectedRequest.id]));
    setAssignmentRequests(prev => prev.filter(req => req.id !== selectedRequest.id));

    try {
      const response = await apiRequest(
        API_ENDPOINTS.CUSTOMER_ASSIGNMENTS.REJECT_REQUEST.replace(':requestId', selectedRequest.id),
        {
          method: HttpMethod.POST,
          requiresAuth: true,
          body: {
            rejectionReason: rejectionReason.trim()
          }
        }
      );

      toast.success('Assignment request rejected successfully');
      
      // Reset dialog state
      setRejectDialogOpen(false);
      setSelectedRequest(null);
      setRejectionReason('');
      
      // Refresh parent component if callback provided
      onRefresh?.();
      
    } catch (error) {
      console.error('Error rejecting assignment request:', error);
      toast.error('Failed to reject assignment request');
      
      // Revert optimistic update on error
      setProcessedRequestIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedRequest.id);
        return newSet;
      });
      fetchAssignmentRequests();
    } finally {
      setProcessing(null);
    }
  };

  const openRejectDialog = (request: CustomerAssignmentRequest) => {
    setSelectedRequest(request);
    setRejectDialogOpen(true);
    setRejectionReason('');
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

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) <= new Date();
  };

  if (loading) {
    return (
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <UserCheck className="h-5 w-5 text-primary" />
            Customer Assignment Requests
          </CardTitle>
          <CardDescription>Review and respond to customer assignment requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading assignment requests...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="dashboard-card">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <UserCheck className="h-5 w-5 text-primary" />
                Customer Assignment Requests
                {assignmentRequests.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {assignmentRequests.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-1">Review and respond to customer assignment requests</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAssignmentRequests}
              disabled={loading}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {assignmentRequests.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No Assignment Requests</h3>
              <p className="text-sm text-muted-foreground">
                You don't have any pending customer assignment requests at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignmentRequests.map((request) => {
                const isExpanded = expandedCards.has(request.id);
                return (
                <Card key={request.id} className="border border-gray-200 rounded-2xl transition-shadow hover:shadow-md">
                  <CardContent className="p-3 sm:p-5">
                    <div className="flex flex-col gap-3">
                      {/* Compact Header: Avatar + Name + Phone + Expiry */}
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full shrink-0">
                          <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">{request.customer.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3 shrink-0" />
                            <span>{request.customer.phone}</span>
                          </div>
                        </div>
                        <div className={`text-[10px] sm:text-xs px-2 py-1 rounded-full shrink-0 font-medium ${
                          isExpired(request.expiresAt)
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-600'
                            : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600'
                        }`}>
                          {getTimeRemaining(request.expiresAt)}
                        </div>
                      </div>

                      {/* View Details toggle (mobile only) */}
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
                      <div className={`space-y-2.5 ${isExpanded ? 'block' : 'hidden'} sm:block`}>
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1.5 min-w-0">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate">{request.customer.email}</span>
                          </span>
                          {request.customer.address && (
                            <span className="flex items-center gap-1.5 min-w-0">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">{request.customer.address}</span>
                            </span>
                          )}
                          {request.customer.timeSlot && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3 shrink-0" />
                              Preferred: {request.customer.timeSlot}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(request.requestedAt).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span>By: {request.admin.name}</span>
                        </div>

                        {request.notes && (
                          <div className="bg-gray-50 dark:bg-gray-800/30 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-700 dark:text-gray-300">
                              <strong>Notes:</strong> {request.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons - always visible */}
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptRequest(request.id)}
                          disabled={processing === request.id || isExpired(request.expiresAt)}
                          className="bg-green-600 text-white hover:bg-green-700 flex-1 h-9 text-xs sm:text-sm"
                        >
                          {processing === request.id ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
                          ) : (
                            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                          )}
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openRejectDialog(request)}
                          disabled={processing === request.id || isExpired(request.expiresAt)}
                          className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex-1 h-9 text-xs sm:text-sm"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1.5" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Reject Assignment Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this customer assignment request.
              This will help the admin understand your decision.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedRequest && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm">
                  <strong>Customer:</strong> {selectedRequest.customer.name}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedRequest.customer.email} • {selectedRequest.customer.phone}
                </p>
              </div>
            )}
            
            <div>
              <Label htmlFor="rejection-reason">Rejection Reason *</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Please explain why you're rejecting this assignment request..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setSelectedRequest(null);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectRequest}
              disabled={!rejectionReason.trim() || processing !== null}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {processing ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
