import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { BufferService, BufferPeriod, BufferStatistics } from '@/services/bufferService';
import { Pause, Play, Clock, CheckCircle, XCircle, AlertTriangle, Calendar, Users, TrendingUp } from 'lucide-react';

export function AdminBufferDaysSection() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useUser();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<BufferStatistics | null>(null);
  const [pendingRequests, setPendingRequests] = useState<BufferPeriod[]>([]);
  const [allBufferPeriods, setAllBufferPeriods] = useState<BufferPeriod[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<BufferPeriod | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [processedRequestIds, setProcessedRequestIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔐 User authenticated:', user);
      console.log('👤 User role:', user.role);
      fetchBufferData();
    } else {
      console.log('❌ User not authenticated or missing');
    }
  }, [isAuthenticated, user]);

  const fetchBufferData = async (skipLoading = false) => {
    console.log('🔄 Fetching buffer data...');
    if (!skipLoading) {
      setLoading(true);
    }
    try {
      const [statsResponse, pendingResponse, allPeriodsResponse] = await Promise.allSettled([
        BufferService.getBufferStatistics(),
        BufferService.getPendingBufferRequests(1, 50),
        BufferService.getAllBufferPeriods(1, 50)
      ]);

      console.log('📊 Stats response:', statsResponse);
      console.log('⏳ Pending response:', pendingResponse);
      console.log('📋 All periods response:', allPeriodsResponse);

      if (statsResponse.status === 'fulfilled' && statsResponse.value.success) {
        console.log('✅ Setting statistics:', statsResponse.value.data);
        setStatistics(statsResponse.value.data);
      } else {
        console.log('❌ Stats response failed:', statsResponse);
      }

      if (pendingResponse.status === 'fulfilled' && pendingResponse.value.success) {
        const pendingRequests = pendingResponse.value.data?.requests || [];
        // Filter out any requests that we've already processed locally
        const filteredPendingRequests = pendingRequests.filter(req => !processedRequestIds.has(req.id));
        console.log('✅ Setting pending requests (filtered):', filteredPendingRequests);
        setPendingRequests(filteredPendingRequests);
      } else {
        console.log('❌ Pending response failed:', pendingResponse);
      }

      if (allPeriodsResponse.status === 'fulfilled' && allPeriodsResponse.value.success) {
        const allPeriods = allPeriodsResponse.value.data?.bufferPeriods || [];
        console.log('✅ Setting all buffer periods:', allPeriods);
        setAllBufferPeriods(allPeriods);
      } else {
        console.log('❌ All periods response failed:', allPeriodsResponse);
      }
    } catch (error) {
      console.error('💥 Error fetching buffer data:', error);
      if (!skipLoading) {
        toast({
          title: 'Error',
          description: 'Failed to load buffer data',
          variant: 'destructive'
        });
      }
    } finally {
      if (!skipLoading) {
        setLoading(false);
      }
    }
  };

  const refreshStatisticsAndFilterPending = async (processedRequestId: string) => {
    try {
      // Only refresh statistics to update the counts
      const statsResponse = await BufferService.getBufferStatistics();
      if (statsResponse.success) {
        setStatistics(statsResponse.data);
      }
      
      // Ensure the processed request is not in the pending list
      setPendingRequests(prev => prev.filter(req => req.id !== processedRequestId));
      
      // Optionally refresh all buffer periods to get the latest from server
      const allPeriodsResponse = await BufferService.getAllBufferPeriods(1, 50);
      if (allPeriodsResponse.success) {
        const serverPeriods = allPeriodsResponse.data?.bufferPeriods || [];
        // Merge with our optimistic updates, removing duplicates
        setAllBufferPeriods(prev => {
          const optimisticIds = prev.map(p => p.id);
          const newServerPeriods = serverPeriods.filter(p => !optimisticIds.includes(p.id));
          return [...prev, ...newServerPeriods];
        });
      }
    } catch (error) {
      console.error('Error refreshing statistics:', error);
    }
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;

    console.log('🔄 Starting approval process for request:', selectedRequest.id);
    setProcessingRequest(selectedRequest.id);
    
    try {
      console.log('📤 Sending approval request with adminNotes:', adminNotes);
      const response = await BufferService.approveBufferRequest(selectedRequest.id, adminNotes);
      
      console.log('📥 Approval response received:', response);
      
      if (response.success) {
        console.log('✅ Approval successful');
        toast({
          title: 'Success',
          description: response.message || 'Buffer request approved successfully'
        });
        
        setIsApproveDialogOpen(false);
        setAdminNotes('');
        setSelectedRequest(null);
        
        // Track this request as processed to prevent it from reappearing in pending
        setProcessedRequestIds(prev => new Set([...prev, selectedRequest.id]));
        
        // Remove the approved request from pending list immediately
        setPendingRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
        
        // Create an updated version of the approved request with ACTIVE status
        const approvedRequest = {
          ...selectedRequest,
          status: 'ACTIVE' as const,
          adminNotes: adminNotes,
          updatedAt: new Date().toISOString()
        };
        
        // Add the approved request to the all buffer periods list immediately
        setAllBufferPeriods(prev => [approvedRequest, ...prev]);
        
        // Refresh statistics only, and manually filter out processed requests from pending
        await refreshStatisticsAndFilterPending(selectedRequest.id);
      } else {
        console.log('❌ Approval failed - response not successful:', response);
        toast({
          title: 'Error',
          description: response.message || 'Failed to approve buffer request - server response not successful',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('🔥 Approval error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve buffer request',
        variant: 'destructive'
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a rejection reason',
        variant: 'destructive'
      });
      return;
    }

    setProcessingRequest(selectedRequest.id);
    try {
      const response = await BufferService.rejectBufferRequest(selectedRequest.id, rejectionReason);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message || 'Buffer request rejected successfully'
        });
        
        setIsRejectDialogOpen(false);
        setRejectionReason('');
        setSelectedRequest(null);
        
        // Track this request as processed to prevent it from reappearing in pending
        setProcessedRequestIds(prev => new Set([...prev, selectedRequest.id]));
        
        // Remove the rejected request from pending list immediately
        setPendingRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
        
        // Create an updated version of the rejected request with REJECTED status
        const rejectedRequest = {
          ...selectedRequest,
          status: 'REJECTED' as const,
          rejectionReason: rejectionReason,
          updatedAt: new Date().toISOString()
        };
        
        // Add the rejected request to the all buffer periods list immediately
        setAllBufferPeriods(prev => [rejectedRequest, ...prev]);
        
        // Refresh statistics only, and manually filter out processed requests from pending
        await refreshStatisticsAndFilterPending(selectedRequest.id);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject buffer request',
        variant: 'destructive'
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  // Test API connection
  const testApiConnection = async () => {
    console.log('🧪 Testing API connection...');
    try {
      const response = await BufferService.getBufferStatistics();
      console.log('🧪 API Test Result:', response);
      toast({
        title: 'API Test',
        description: `API ${response.success ? 'working' : 'failed'}: ${response.message || 'No message'}`,
        variant: response.success ? 'default' : 'destructive'
      });
    } catch (error: any) {
      console.error('🧪 API Test Error:', error);
      toast({
        title: 'API Test Failed',
        description: error.message || 'Unknown error',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PENDING': return 'outline';
      case 'ACTIVE': return 'default';
      case 'COMPLETED': return 'secondary';
      case 'CANCELLED': return 'destructive';
      case 'REJECTED': return 'destructive';
      default: return 'outline';
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
          <h4 className="font-semibold mb-2">Authentication Required</h4>
          <p className="text-muted-foreground text-sm">
            Please log in as an admin to access buffer management
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Buffer Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Buffers</CardTitle>
              <Pause className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.activeBuffers}</div>
              <p className="text-xs text-muted-foreground">Currently paused</p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.thisMonthRequests}</div>
              <p className="text-xs text-muted-foreground">New requests</p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Buffer Days Used</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalBufferDaysUsed}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pending Buffer Requests */}
      <Card className="dashboard-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Buffer Requests
              </CardTitle>
              <CardDescription>Review and manage customer buffer day requests</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => fetchBufferData()} variant="outline" size="sm">
                Refresh
              </Button>
              <Button onClick={testApiConnection} variant="outline" size="sm">
                Test API
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {pendingRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request: any) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.subscription?.customer?.user?.name || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">{request.subscription?.customer?.user?.email || 'N/A'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {request.subscription?.plan?.name || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{request.daysCount} days</span>
                    </TableCell>
                    <TableCell>
                      {new Date(request.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{request.reason}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsApproveDialogOpen(true);
                          }}
                          disabled={processingRequest === request.id}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsRejectDialogOpen(true);
                          }}
                          disabled={processingRequest === request.id}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-semibold mb-2">No Pending Requests</h4>
              <p className="text-muted-foreground text-sm">
                All buffer requests have been processed
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Buffer Periods */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pause className="h-5 w-5" />
            All Buffer Periods
          </CardTitle>
          <CardDescription>Complete history of buffer periods</CardDescription>
        </CardHeader>
        <CardContent>
          {allBufferPeriods.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Services Skipped</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allBufferPeriods.slice(0, 10).map((period: any) => (
                  <TableRow key={period.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{period.subscription?.customer?.user?.name || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">{period.subscription?.customer?.user?.email || 'N/A'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{period.daysCount} days</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(period.startDate).toLocaleDateString()}</p>
                        <p className="text-muted-foreground">to {new Date(period.endDate).toLocaleDateString()}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(period.status)}>
                        {period.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{period.servicesSkipped || 0}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(period.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Pause className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-semibold mb-2">No Buffer Periods</h4>
              <p className="text-muted-foreground text-sm">
                No buffer periods have been created yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Buffer Request</DialogTitle>
            <DialogDescription>
              Approve the buffer period request from {selectedRequest?.subscription?.customer?.user?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-2">Request Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Days: <span className="font-medium">{selectedRequest?.daysCount}</span></div>
                <div>Start: <span className="font-medium">{selectedRequest ? new Date(selectedRequest.startDate).toLocaleDateString() : ''}</span></div>
                <div>End: <span className="font-medium">{selectedRequest ? new Date(selectedRequest.endDate).toLocaleDateString() : ''}</span></div>
                <div>Reason: <span className="font-medium">{selectedRequest?.reason}</span></div>
              </div>
              {selectedRequest?.notes && (
                <div className="mt-2">
                  <p className="text-sm"><strong>Notes:</strong> {selectedRequest.notes}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Notes (Optional)</label>
              <Textarea
                placeholder="Add any notes about this approval..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                maxLength={500}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApproveRequest} disabled={processingRequest === selectedRequest?.id}>
              {processingRequest === selectedRequest?.id ? 'Approving...' : 'Approve Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Buffer Request</DialogTitle>
            <DialogDescription>
              Reject the buffer period request from {selectedRequest?.subscription?.customer?.user?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-2">Request Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Days: <span className="font-medium">{selectedRequest?.daysCount}</span></div>
                <div>Start: <span className="font-medium">{selectedRequest ? new Date(selectedRequest.startDate).toLocaleDateString() : ''}</span></div>
                <div>Reason: <span className="font-medium">{selectedRequest?.reason}</span></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Rejection Reason *</label>
              <Textarea
                placeholder="Please provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                maxLength={300}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRejectRequest} 
              disabled={processingRequest === selectedRequest?.id || !rejectionReason.trim()}
            >
              {processingRequest === selectedRequest?.id ? 'Rejecting...' : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
