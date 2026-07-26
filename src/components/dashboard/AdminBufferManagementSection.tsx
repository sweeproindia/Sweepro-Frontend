import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Pause, 
  Play, 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  RefreshCw,
  Eye,
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { BufferService, BufferStatistics, BufferPeriod } from '@/services/bufferService';
import { toast } from 'sonner';
import { format, isAfter, isValid, parseISO } from 'date-fns';

interface AdminBufferManagementSectionProps {}

interface PendingBufferRequest {
  id: string;
  subscriptionId: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  daysCount: number;
  startDate: string;
  endDate: string;
  reason: string;
  notes?: string;
  requestedAt: string;
  status: 'PENDING';
  customer: any;
  subscription: any;
  servicePlan: any;
}

const safeFormatDate = (
  value: unknown,
  dateFormat: string,
  fallback = 'N/A'
) => {
  if (!value) return fallback;

  let date: Date;

  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'string') {
    date = parseISO(value);
  } else if (typeof value === 'number') {
    date = new Date(value);
  } else {
    return fallback;
  }

  if (!isValid(date)) return fallback;
  return format(date, dateFormat);
};

export const AdminBufferManagementSection: React.FC<AdminBufferManagementSectionProps> = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState<BufferStatistics | null>(null);
  const [pendingRequests, setPendingRequests] = useState<PendingBufferRequest[]>([]);
  const [allBufferPeriods, setAllBufferPeriods] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<'approve' | 'reject' | null>(null);
  
  // Pagination states
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingTotalPages, setPendingTotalPages] = useState(1);
  const [buffersPage, setBuffersPage] = useState(1);
  const [buffersTotalPages, setBuffersTotalPages] = useState(1);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [customerFilter, setCustomerFilter] = useState<string>('');
  
  // Dialog states
  const [reviewDialog, setReviewDialog] = useState<{ open: boolean; request: PendingBufferRequest | null }>({
    open: false,
    request: null
  });
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; period: any | null }>({
    open: false,
    period: null
  });
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    loadPendingRequests();
  }, [pendingPage]);

  useEffect(() => {
    loadAllBufferPeriods();
  }, [buffersPage, statusFilter, customerFilter]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStatistics(),
        loadPendingRequests(),
        loadAllBufferPeriods()
      ]);
    } catch (error) {
      console.error('Failed to load buffer management data:', error);
      toast.error('Failed to load buffer management data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await loadAllData();
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await BufferService.getBufferStatistics();
      if (response.success && response.data) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Failed to load buffer statistics:', error);
    }
  };

  const loadPendingRequests = async () => {
    try {
      const response = await BufferService.getPendingBufferRequests(pendingPage, 10);
      if (response.success && response.data) {
        // Normalize nested API response → flat PendingBufferRequest shape.
        // The backend returns: request.subscription.customer.user.{name,email}
        // and request.subscription.plan.name — but the UI reads flat fields.
        const normalized: PendingBufferRequest[] = (response.data.requests || []).map((req: any) => ({
          ...req,
          customerName:
            req.customerName ||
            req.subscription?.customer?.user?.name ||
            req.customer?.user?.name ||
            req.customer?.name ||
            'Unknown Customer',
          customerEmail:
            req.customerEmail ||
            req.subscription?.customer?.user?.email ||
            req.customer?.user?.email ||
            req.customer?.email ||
            '',
          planName:
            req.planName ||
            req.subscription?.plan?.name ||
            req.servicePlan?.name ||
            'Unknown Plan',
          requestedAt:
            req.requestedAt || req.createdAt,
        }));
        setPendingRequests(normalized);
        setPendingTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to load pending requests:', error);
    }
  };

  const loadAllBufferPeriods = async () => {
    try {
      const response = await BufferService.getAllBufferPeriods(
        buffersPage, 
        20, 
        statusFilter || undefined,
        customerFilter || undefined
      );
      if (response.success && response.data) {
        setAllBufferPeriods(response.data.bufferPeriods || []);
        setBuffersTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to load buffer periods:', error);
    }
  };

  const handleApprove = async (request: PendingBufferRequest) => {
    try {
      setProcessingRequestId(request.id);
      setProcessingAction('approve');
      const response = await BufferService.approveBufferRequest(request.id, adminNotes);
      if (response.success) {
        toast.success('Buffer request approved successfully');
        setReviewDialog({ open: false, request: null });
        setAdminNotes('');
        await loadPendingRequests();
        await loadStatistics();
      } else {
        toast.error(response.error || 'Failed to approve request');
      }
    } catch (error) {
      toast.error('Failed to approve buffer request');
      console.error('Approve error:', error);
    } finally {
      setProcessingRequestId(null);
      setProcessingAction(null);
    }
  };

  const handleReject = async (request: PendingBufferRequest) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setProcessingRequestId(request.id);
      setProcessingAction('reject');
      const response = await BufferService.rejectBufferRequest(request.id, rejectionReason);
      if (response.success) {
        toast.success('Buffer request rejected');
        setReviewDialog({ open: false, request: null });
        setRejectionReason('');
        await loadPendingRequests();
        await loadStatistics();
      } else {
        toast.error(response.error || 'Failed to reject request');
      }
    } catch (error) {
      toast.error('Failed to reject buffer request');
      console.error('Reject error:', error);
    } finally {
      setProcessingRequestId(null);
      setProcessingAction(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'active':
        return <Pause className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const Pagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange 
  }: {
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

  if (loading) {
    return (
      <Card className="dashboard-card">
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Loading buffer management data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        
        <Button onClick={refreshData} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            Pending Requests
            {statistics && statistics.pendingRequests > 0 && (
              <Badge className="ml-2 px-1 py-0 text-xs" variant="destructive">
                {statistics.pendingRequests}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all-buffers">All Buffer Periods</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                    <p className="text-2xl font-bold">{statistics?.pendingRequests || 0}</p>
                  </div>
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Buffers</p>
                    <p className="text-2xl font-bold">{statistics?.activeBuffers || 0}</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-full">
                    <Pause className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold">{statistics?.thisMonthRequests || 0}</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Buffer Days</p>
                    <p className="text-2xl font-bold">{statistics?.totalBufferDaysUsed || 0}</p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-full">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Buffer User */}
          {statistics?.mostBufferUsage && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Highest Buffer Usage This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{statistics.mostBufferUsage.customerName}</p>
                      <p className="text-sm text-muted-foreground">{statistics.mostBufferUsage.planName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {statistics.mostBufferUsage.bufferDaysUsed} / {statistics.mostBufferUsage.bufferDaysTotal}
                      </p>
                      <p className="text-sm text-muted-foreground">buffer days used</p>
                    </div>
                  </div>
                  <Progress 
                    value={(statistics.mostBufferUsage.bufferDaysUsed / statistics.mostBufferUsage.bufferDaysTotal) * 100}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity Alert */}
          {statistics && statistics.pendingRequests > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Action Required</AlertTitle>
              <AlertDescription>
                You have {statistics.pendingRequests} pending buffer requests that need review.
                <Button 
                  variant="link" 
                  className="p-0 ml-2 h-auto"
                  onClick={() => setActiveTab('pending')}
                >
                  Review now
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Pending Requests Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                Pending Buffer Requests ({pendingRequests.length})
              </CardTitle>
              <CardDescription>
                Review and approve/reject customer buffer period requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Plan</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="hidden md:table-cell">Days</TableHead>
                    <TableHead className="hidden lg:table-cell">Reason</TableHead>
                    <TableHead className="hidden lg:table-cell">Requested</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.customerName}</p>
                          <p className="text-sm text-muted-foreground">{request.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{request.planName}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{safeFormatDate(request.startDate, 'MMM dd')}</p>
                          <p className="text-muted-foreground">
                            to {safeFormatDate(request.endDate, 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary">{request.daysCount} days</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <p className="text-sm max-w-32 truncate" title={request.reason}>
                          {request.reason}
                        </p>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <p className="text-sm">
                          {safeFormatDate((request as any).requestedAt || (request as any).createdAt, 'MMM dd, yyyy')}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => setReviewDialog({ open: true, request })}
                          >
                            Review
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>

              {pendingRequests.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p>No pending buffer requests</p>
                </div>
              )}

              {pendingRequests.length > 0 && (
                <Pagination
                  currentPage={pendingPage}
                  totalPages={pendingTotalPages}
                  onPageChange={setPendingPage}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Buffer Periods Tab */}
        <TabsContent value="all-buffers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Pause className="h-5 w-5" />
                    All Buffer Periods
                  </CardTitle>
                  <CardDescription>View and manage all buffer periods</CardDescription>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Select value={statusFilter || "all"} onValueChange={(val) => setStatusFilter(val === "all" ? "" : val)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Filter by customer..."
                    value={customerFilter}
                    onChange={(e) => setCustomerFilter(e.target.value)}
                    className="w-48"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="hidden md:table-cell">Days</TableHead>
                    <TableHead className="hidden lg:table-cell">Reason</TableHead>
                    <TableHead className="hidden lg:table-cell">Services Skipped</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allBufferPeriods.map((period) => (
                    <TableRow key={period.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {period.subscription?.customer?.user?.name ||
                             period.customer?.user?.name ||
                             period.customer?.name ||
                             'Unknown Customer'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {period.subscription?.customer?.user?.email ||
                             period.customer?.user?.email ||
                             period.customer?.email ||
                             ''}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(period.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(period.status)}
                            {period.status}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{safeFormatDate(period.startDate, 'MMM dd')}</p>
                          <p className="text-muted-foreground">
                            to {safeFormatDate(period.endDate, 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary">{period.daysCount} days</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <p className="text-sm max-w-32 truncate" title={period.reason}>
                          {period.reason}
                        </p>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="text-sm">
                          <p>{period.servicesSkipped || 0} services</p>
                          {period.servicesSkipped > 0 && (
                            <p className="text-muted-foreground">skipped</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDetailDialog({ open: true, period })}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>

              {allBufferPeriods.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Pause className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p>No buffer periods found</p>
                </div>
              )}

              {allBufferPeriods.length > 0 && (
                <Pagination
                  currentPage={buffersPage}
                  totalPages={buffersTotalPages}
                  onPageChange={setBuffersPage}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialog.open}
        onOpenChange={(open) => setReviewDialog({ open, request: reviewDialog.request })}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Buffer Request</DialogTitle>
            <DialogDescription>
              Review and approve or reject this buffer period request.
            </DialogDescription>
          </DialogHeader>

          {reviewDialog.request && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Customer</Label>
                  <p className="text-sm">{reviewDialog.request.customerName}</p>
                  <p className="text-xs text-muted-foreground">{reviewDialog.request.customerEmail}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Plan</Label>
                  <p className="text-sm">{reviewDialog.request.planName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Buffer Period</Label>
                  <p className="text-sm">
                    {safeFormatDate(reviewDialog.request.startDate, 'MMM dd')} - {safeFormatDate(reviewDialog.request.endDate, 'MMM dd, yyyy')}
                  </p>
                  <p className="text-xs text-muted-foreground">{reviewDialog.request.daysCount} days</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Requested</Label>
                  <p className="text-sm">
                    {safeFormatDate((reviewDialog.request as any).requestedAt || (reviewDialog.request as any).createdAt, 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Reason</Label>
                <p className="text-sm mt-1 p-3 bg-muted rounded">{reviewDialog.request.reason}</p>
              </div>

              {reviewDialog.request.notes && (() => {
                // Strip internal STATUS markers — show only the customer's human-readable notes
                const rawNotes = reviewDialog.request.notes || '';
                const cleanNotes = rawNotes
                  .replace(/\.?\s*STATUS:\s*(PENDING_APPROVAL|APPROVED|REJECTED)\b/gi, '')
                  .replace(/^Customer request:\s*/i, '')
                  .trim()
                  .replace(/^[.\s]+|[.\s]+$/g, '')
                  .trim();
                return cleanNotes ? (
                  <div>
                    <Label className="text-sm font-medium">Customer Notes</Label>
                    <p className="text-sm mt-1 p-3 bg-muted rounded">{cleanNotes}</p>
                  </div>
                ) : null;
              })()}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="admin-notes">Admin Notes (Optional)</Label>
                  <Textarea
                    id="admin-notes"
                    placeholder="Add any notes for approval..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="rejection-reason">Rejection Reason (if rejecting)</Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Provide a reason if rejecting this request..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setReviewDialog({ open: false, request: null })}
              disabled={processingRequestId === reviewDialog.request?.id}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => reviewDialog.request && handleReject(reviewDialog.request)}
              disabled={
                processingRequestId === reviewDialog.request?.id ||
                processingAction === 'approve'
              }
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => reviewDialog.request && handleApprove(reviewDialog.request)}
              disabled={
                processingRequestId === reviewDialog.request?.id ||
                processingAction === 'reject'
              }
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog
        open={detailDialog.open}
        onOpenChange={(open) => setDetailDialog({ open, period: detailDialog.period })}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Buffer Period Details</DialogTitle>
            <DialogDescription>
              Complete information about this buffer period.
            </DialogDescription>
          </DialogHeader>

          {detailDialog.period && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(detailDialog.period.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(detailDialog.period.status)}
                      {detailDialog.period.status}
                    </div>
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Duration</Label>
                  <p className="text-sm">{detailDialog.period.daysCount} days</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Period</Label>
                  <p className="text-sm">
                    {safeFormatDate(detailDialog.period.startDate, 'MMM dd')} - {safeFormatDate(detailDialog.period.endDate, 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Services Skipped</Label>
                  <p className="text-sm">{detailDialog.period.servicesSkipped || 0}</p>
                </div>
                {detailDialog.period.resumedAt && (
                  <div>
                    <Label className="text-sm font-medium">Resumed At</Label>
                    <p className="text-sm">{safeFormatDate(detailDialog.period.resumedAt, 'MMM dd, yyyy')}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm">{detailDialog.period.isAutomatic ? 'Automatic' : 'Manual Request'}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Reason</Label>
                <p className="text-sm mt-1 p-3 bg-muted rounded">{detailDialog.period.reason}</p>
              </div>

              {detailDialog.period.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded">{detailDialog.period.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p>{safeFormatDate(detailDialog.period.createdAt, 'MMM dd, yyyy h:mm a')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p>{safeFormatDate(detailDialog.period.updatedAt, 'MMM dd, yyyy h:mm a')}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailDialog({ open: false, period: null })}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
