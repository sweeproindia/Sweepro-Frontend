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
  UserCheck
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
          <CardTitle className="flex items-center gap-2">
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
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Customer Assignment Requests
                {assignmentRequests.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {assignmentRequests.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Review and respond to customer assignment requests</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAssignmentRequests}
              disabled={loading}
              className="flex items-center gap-2 w-full md:w-auto"
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
            <div className="space-y-4">
              {assignmentRequests.map((request) => (
                <Card key={request.id} className="border border-gray-200 rounded-2xl">
                  <CardContent className="space-y-4 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1 space-y-3">
                        {/* Customer Info */}
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{request.customer.name}</h4>
                            <p className="text-sm text-gray-500">New customer assignment request</p>
                          </div>
                        </div>

                        {/* Customer Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span>{request.customer.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{request.customer.phone}</span>
                          </div>
                          {request.customer.address && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span className="truncate">{request.customer.address}</span>
                            </div>
                          )}
                          {request.customer.timeSlot && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>Preferred time: {request.customer.timeSlot}</span>
                            </div>
                          )}
                        </div>

                        {/* Request Details */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Requested: {new Date(request.requestedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            <span className={isExpired(request.expiresAt) ? 'text-red-500' : 'text-orange-500'}>
                              {getTimeRemaining(request.expiresAt)}
                            </span>
                          </div>
                        </div>

                        {/* Admin Info */}
                        <div className="text-xs text-gray-400">
                          Requested by: {request.admin.name} ({request.admin.email})
                        </div>

                        {/* Notes */}
                        {request.notes && (
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm text-gray-700">
                              <strong>Notes:</strong> {request.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex w-full flex-col gap-2 lg:ml-4 lg:w-auto">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptRequest(request.id)}
                          disabled={processing === request.id || isExpired(request.expiresAt)}
                          className="w-full bg-green-600 text-white hover:bg-green-700"
                        >
                          {processing === request.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openRejectDialog(request)}
                          disabled={processing === request.id || isExpired(request.expiresAt)}
                          className="w-full border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
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
