import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Users, ChevronLeft, ChevronRight, UserPlus, Pause, User, AlertTriangle, RefreshCw, Search } from 'lucide-react';
import { CustomerAssignmentService, CustomerAssignmentStatus, CustomerAssignmentRequest } from '@/services/customerAssignmentService';
import { toast } from 'sonner';

interface UserSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status: 'active' | 'pending' | 'suspended';
  totalBookings: number;
  totalSpent: number;
  lastActive: string;
  timeSlot?: string;
}

interface MaidSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  skills: string[];
  completedBookings: number;
}

interface AdminUsersSectionProps {
  users: UserSummary[];
  availableMaids: MaidSummary[];
  onVerifyUser: (userId: string) => void;
  onRefreshData?: () => void;
}

const ITEMS_PER_PAGE = 10;

const statusBadgeClass = (status: UserSummary['status']) => {
  switch (status) {
    case 'active':
      return 'bg-success/20 text-success';
    case 'pending':
      return 'bg-warning/20 text-warning';
    case 'suspended':
      return 'bg-destructive/20 text-destructive';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : '—');

const formatTime = (value?: string) =>
  value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

const formatCurrency = (value?: number) => {
  if (typeof value !== 'number') return '—';
  try {
    return value.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    });
  } catch {
    return `₹${value.toLocaleString()}`;
  }
};

const getPaginatedData = (data: UserSummary[], page: number) => {
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
};

const getTotalPages = (data: UserSummary[]) => Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE));

const getSerialNumber = (index: number, page: number) => (page - 1) * ITEMS_PER_PAGE + index + 1;

export const AdminUsersSection: React.FC<AdminUsersSectionProps> = ({
  users,
  availableMaids,
  onVerifyUser,
  onRefreshData,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [customerStatuses, setCustomerStatuses] = useState<Record<string, CustomerAssignmentStatus>>({});
  const [loading, setLoading] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignDialog, setAssignDialog] = useState<{ open: boolean; customer: UserSummary | null }>({
    open: false,
    customer: null,
  });
  const [selectedMaidId, setSelectedMaidId] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [conflictWarnings, setConflictWarnings] = useState<Record<string, string>>({});
  const [requestMap, setRequestMap] = useState<Record<string, CustomerAssignmentRequest>>({});
  const [detailsDialog, setDetailsDialog] = useState<{ open: boolean; customer: UserSummary | null }>({
    open: false,
    customer: null,
  });

  const loadCustomerStatuses = useCallback(async () => {
    setLoading(true);
    try {
      const statusPromises = users.map(async (user) => {
        try {
          const response = await CustomerAssignmentService.getCustomerStatus(user.id);
          return { userId: user.id, status: response.data };
        } catch (err) {
          console.error(`Failed to load status for user ${user.id}`, err);
          return { userId: user.id, status: null };
        }
      });

      const results = await Promise.all(statusPromises);
      const nextStatuses: Record<string, CustomerAssignmentStatus> = {};
      results.forEach(({ userId, status }) => {
        if (status) {
          nextStatuses[userId] = status;
        }
      });
      setCustomerStatuses(nextStatuses);
    } catch (err) {
      console.error('Failed to load customer statuses:', err);
      toast.error('Unable to load customer assignments');
    } finally {
      setLoading(false);
    }
  }, [users]);

  const loadAssignmentRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const response = await CustomerAssignmentService.getAssignmentRequests({
        status: ['pending', 'rejected'],
        limit: 200,
      });

      if (response.success) {
        const map: Record<string, CustomerAssignmentRequest> = {};
        response.data.requests.forEach((request) => {
          map[request.customerId] = request;
        });
        setRequestMap(map);
      }
    } catch (err) {
      console.error('Failed to load assignment requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    loadCustomerStatuses();
  }, [loadCustomerStatuses]);

  useEffect(() => {
    loadAssignmentRequests();
  }, [loadAssignmentRequests, users]);

  const checkMaidConflicts = (maidId: string, customerId: string) => {
    const conflicts = Object.entries(customerStatuses).filter(
      ([otherCustomerId, status]) =>
        otherCustomerId !== customerId && status.hasAssignment && status.assignment?.maid.id === maidId,
    );

    if (conflicts.length > 0) {
      const names = conflicts
        .map(([id]) => users.find((user) => user.id === id)?.name || 'Unknown')
        .join(', ');
      setConflictWarnings((prev) => ({
        ...prev,
        [maidId]: `⚠️ This maid is already assigned to: ${names}`,
      }));
    } else {
      setConflictWarnings((prev) => {
        const next = { ...prev };
        delete next[maidId];
        return next;
      });
    }
  };

  const handleAssignMaid = async () => {
    if (!assignDialog.customer || !selectedMaidId) {
      toast.error('Please select a maid');
      return;
    }

    const customerId = assignDialog.customer.id;
    setAssigning(true);

    try {
      const response = await CustomerAssignmentService.assignMaidToCustomer({
        customerId,
        maidId: selectedMaidId,
        notes: assignmentNotes,
      });

      const selectedMaid = availableMaids.find((maid) => maid.id === selectedMaidId);

      if (selectedMaid) {
        setCustomerStatuses((prev) => ({
          ...prev,
          [customerId]: {
            customerId,
            hasAssignment: true,
            hasSubscription: prev[customerId]?.hasSubscription ?? false,
            assignment: {
              id: prev[customerId]?.assignment?.id ?? `temp-${Date.now()}`,
              customerId,
              maidId: selectedMaidId,
              assignedAt: new Date().toISOString(),
              isActive: true,
              notes: assignmentNotes,
              customer: {
                id: customerId,
                name: assignDialog.customer!.name,
                email: assignDialog.customer!.email,
                phone: assignDialog.customer!.phone,
              },
              maid: {
                id: selectedMaidId,
                name: selectedMaid.name,
                email: selectedMaid.email,
                phone: selectedMaid.phone,
                rating: selectedMaid.rating,
                skills: selectedMaid.skills,
                completedBookings: selectedMaid.completedBookings,
              },
            },
            isInBufferPeriod: prev[customerId]?.isInBufferPeriod ?? false,
            bufferPeriod: prev[customerId]?.bufferPeriod,
            nextBookingDate: prev[customerId]?.nextBookingDate,
            lastBookingDate: prev[customerId]?.lastBookingDate,
          },
        }));
      }

      toast.success('Assignment request sent to maid');

      if (response.data) {
        setRequestMap((prev) => ({
          ...prev,
          [customerId]: response.data,
        }));
      }

      setAssignDialog({ open: false, customer: null });
      setSelectedMaidId('');
      setAssignmentNotes('');
      setConflictWarnings({});

      await loadCustomerStatuses();
      await loadAssignmentRequests();
      onRefreshData?.();
    } catch (err) {
      console.error('Assignment error:', err);
      const axiosError = err as { response?: { status?: number; data?: { conflictType?: string; error?: string } } };

      if (axiosError.response?.status === 409) {
        const conflictType = axiosError.response.data?.conflictType;
        const message = axiosError.response.data?.error || 'Assignment conflict detected';

        if (conflictType === 'TIMESLOT_CONFLICT') {
          toast.error(`Timeslot conflict: ${message}`, {
            duration: 6000,
            description: 'This maid is already assigned during the same time slot.',
          });
        } else if (conflictType === 'CAPACITY_EXCEEDED') {
          toast.error(`Capacity exceeded: ${message}`, {
            duration: 6000,
            description: 'This maid has reached their daily booking capacity.',
          });
        } else {
          toast.error(`Assignment conflict: ${message}`);
        }
      } else {
        toast.error('Failed to assign maid');
      }
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveAssignment = async (customerId: string) => {
    setCustomerStatuses((prev) => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        hasAssignment: false,
        assignment: undefined,
      },
    }));
    setRequestMap((prev) => {
      if (!prev[customerId]) return prev;
      const next = { ...prev };
      delete next[customerId];
      return next;
    });

    try {
      await CustomerAssignmentService.removeCustomerAssignment(customerId);
      toast.success('Maid assignment removed');

      await loadCustomerStatuses();
      await loadAssignmentRequests();
      onRefreshData?.();
    } catch (err) {
      console.error('Remove assignment error:', err);
      toast.error('Failed to remove assignment');
      await loadCustomerStatuses();
      await loadAssignmentRequests();
    }
  };

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;

    return users.filter((user) => {
      const name = user.name.toLowerCase();
      const email = user.email.toLowerCase();
      const phone = user.phone?.toLowerCase?.() ?? user.phone;
      return (
        name.includes(term) ||
        email.includes(term) ||
        (typeof phone === 'string' && phone.toLowerCase().includes(term))
      );
    });
  }, [users, searchTerm]);

  const totalPages = getTotalPages(filteredUsers);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedUsers = useMemo(
    () => getPaginatedData(filteredUsers, currentPage),
    [filteredUsers, currentPage],
  );

  const selectedCustomerStatus = detailsDialog.customer
    ? customerStatuses[detailsDialog.customer.id]
    : undefined;

  const customerPreferredTimeSlot =
    ((selectedCustomerStatus?.assignment as any)?.customer?.timeSlot as string | undefined) ??
    (detailsDialog.customer as any)?.timeSlot;

  const getAssignmentBadge = (customerId: string) => {
    const request = requestMap[customerId];
    if (!request) return null;

    if (request.status === 'pending') {
      return (
        <Badge variant="outline" className="text-xs text-blue-600 border-blue-300 bg-blue-50">
          Awaiting maid response
        </Badge>
      );
    }

    if (request.status === 'rejected') {
      return (
        <Badge variant="destructive" className="text-xs">
          Assignment rejected
        </Badge>
      );
    }

    return null;
  };

  const getRequestContext = (customerId: string) => {
    const request = requestMap[customerId];
    if (!request) return null;

    if (request.status === 'pending') {
      const maidName = request.maid?.user?.name ?? 'selected maid';
      return { message: `Awaiting ${maidName}'s response`, tone: 'pending' as const };
    }

    if (request.status === 'rejected') {
      const reason = request.rejectionReason ? `Reason: ${request.rejectionReason}` : 'Request was rejected by maid';
      return { message: reason, tone: 'rejected' as const };
    }

    return null;
  };

  const renderRequestContext = (customerId: string) => {
    const context = getRequestContext(customerId);
    if (!context) return null;

    const toneClass = context.tone === 'pending' ? 'text-blue-600' : 'text-destructive';

    return <p className={`text-xs ${toneClass}`}>{context.message}</p>;
  };

  const canAssignMaid = (customerId: string) => {
    const request = requestMap[customerId];
    if (!request) return true;
    return request.status !== 'pending';
  };

  const getAssignButtonLabel = (customerId: string, hasAssignment: boolean) => {
    const request = requestMap[customerId];
    if (request?.status === 'pending') {
      return 'Awaiting response';
    }
    return hasAssignment ? 'Reassign Maid' : 'Assign Maid';
  };

  const handleRefresh = async () => {
    await loadCustomerStatuses();
    await loadAssignmentRequests();
    onRefreshData?.();
  };

  const Pagination = ({
    currentPage: page,
    totalPages: total,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => (
    <div className="mt-4 flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Page {page} of {total}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === total}
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
              <Users className="h-5 w-5 text-primary" />
              Customer Management
            </CardTitle>
            <CardDescription>Manage customer assignments, buffers, and subscriptions.</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || loadingRequests}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading || loadingRequests ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{' '}
            {paginatedUsers.length > 0
              ? `${getSerialNumber(0, currentPage)}-${getSerialNumber(paginatedUsers.length - 1, currentPage)}`
              : 0}{' '}
            of {filteredUsers.length} customers
          </p>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, email, or phone"
              className="pl-9"
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">S.No</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Maid</TableHead>
                <TableHead>Buffer Status</TableHead>
                <TableHead>Next Booking</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Loading customer assignments...
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                    {filteredUsers.length === 0 ? 'No customers match your search.' : 'No customers on this page.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user, index) => {
                  const customerStatus = customerStatuses[user.id];
                  const assignmentRequest = requestMap[user.id];
                  const pendingAssignment = assignmentRequest?.status === 'pending';
                  const rejectedAssignment = assignmentRequest?.status === 'rejected';
                  const hasActiveAssignment = Boolean(customerStatus?.hasAssignment && customerStatus.assignment);
                  const activeAssignment = customerStatus?.assignment;
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {getSerialNumber(index, currentPage)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{user.phone || '—'}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusBadgeClass(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {pendingAssignment ? (
                          <div className="space-y-2 rounded-md border border-blue-200 bg-blue-50 p-3">
                            <div className="flex items-center gap-2 text-blue-700">
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              <span className="text-sm font-medium">Awaiting maid confirmation</span>
                            </div>
                            {assignmentRequest?.maid?.user?.name && (
                              <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-blue-600" />
                                <span className="font-medium text-blue-700">{assignmentRequest.maid.user.name}</span>
                              </div>
                            )}
                            {assignmentRequest?.maid?.user?.phone && (
                              <p className="text-xs text-blue-600">Phone: {assignmentRequest.maid.user.phone}</p>
                            )}
                            {renderRequestContext(user.id)}
                          </div>
                        ) : hasActiveAssignment ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-sm">
                                {activeAssignment?.maid.name || 'Unknown Maid'}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Rating: {activeAssignment?.maid.rating?.toFixed(1) || 'N/A'}★
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Phone: {activeAssignment?.maid.phone || 'N/A'}
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-xs"
                              onClick={() => handleRemoveAssignment(user.id)}
                              disabled={assigning}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Badge variant="outline" className="text-xs">
                              No Assignment
                            </Badge>
                            {rejectedAssignment && getAssignmentBadge(user.id)}
                            {rejectedAssignment && renderRequestContext(user.id)}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-xs"
                              disabled={!canAssignMaid(user.id) || loadingRequests || assigning}
                              onClick={() => {
                                setAssignDialog({ open: true, customer: user });
                                setSelectedMaidId('');
                                setAssignmentNotes('');
                                setConflictWarnings({});
                              }}
                            >
                              <UserPlus className="h-3 w-3 mr-1" />
                              {getAssignButtonLabel(user.id, hasActiveAssignment)}
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {!customerStatus?.hasSubscription ? (
                          <Badge variant="outline" className="text-xs">
                            No Subscription
                          </Badge>
                        ) : customerStatus.isInBufferPeriod ? (
                          <div className="space-y-1">
                            <Badge variant="destructive" className="text-xs">
                              <Pause className="h-3 w-3 mr-1" />
                              In Buffer
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              Until: {customerStatus.bufferPeriod?.endDate
                                ? new Date(customerStatus.bufferPeriod.endDate).toLocaleDateString()
                                : 'N/A'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Reason: {customerStatus.bufferPeriod?.reason || 'N/A'}
                            </p>
                          </div>
                        ) : (
                          <Badge variant="default" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {customerStatus?.nextBookingDate ? (
                          <div className="text-sm">
                            <p className="font-medium">
                              {new Date(customerStatus.nextBookingDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(customerStatus.nextBookingDate).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {customerStatus?.isInBufferPeriod ? 'Paused' : 'Not scheduled'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => setDetailsDialog({ open: true, customer: user })}
                          >
                            View Details
                          </Button>
                          {user.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => onVerifyUser(user.id)}
                            >
                              Verify
                            </Button>
                          )}
                          {customerStatus?.isInBufferPeriod && (
                            <Badge variant="outline" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Buffer Active
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {filteredUsers.length > ITEMS_PER_PAGE && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        )}
      </CardContent>

      <Dialog
        open={assignDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setAssignDialog({ open: false, customer: null });
            setSelectedMaidId('');
            setAssignmentNotes('');
            setConflictWarnings({});
            return;
          }
          setAssignDialog((prev) => ({ ...prev, open }));
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Maid to Customer</DialogTitle>
            <DialogDescription>
              Select a maid to send an assignment request to. The maid will receive the request and can accept or reject it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="maid-select">Select Maid</Label>
              <Select
                value={selectedMaidId}
                onValueChange={(value) => {
                  setSelectedMaidId(value);
                  if (assignDialog.customer) {
                    checkMaidConflicts(value, assignDialog.customer.id);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a maid..." />
                </SelectTrigger>
                <SelectContent>
                  {availableMaids.map((maid) => (
                    <SelectItem key={maid.id} value={maid.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{maid.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {maid.rating.toFixed(1)}★ • {maid.completedBookings} bookings
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedMaidId && conflictWarnings[selectedMaidId] && (
                <div className="mt-2 rounded-md border border-yellow-200 bg-yellow-50 p-2 text-sm text-yellow-800">
                  {conflictWarnings[selectedMaidId]}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="assignment-notes">Notes (Optional)</Label>
              <Textarea
                id="assignment-notes"
                placeholder="Add any notes about this assignment..."
                value={assignmentNotes}
                onChange={(event) => setAssignmentNotes(event.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAssignDialog({ open: false, customer: null });
                setSelectedMaidId('');
                setAssignmentNotes('');
                setConflictWarnings({});
              }}
              disabled={assigning}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignMaid} disabled={assigning || !selectedMaidId}>
              {assigning ? 'Assigning...' : 'Assign Maid'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={detailsDialog.open}
        onOpenChange={(open) =>
          setDetailsDialog(open ? { open, customer: detailsDialog.customer } : { open, customer: null })
        }
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>Comprehensive profile and assignment overview.</DialogDescription>
          </DialogHeader>

          {detailsDialog.customer && (
            <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
              <div className="grid gap-4 lg:grid-cols-2">
                <section className="h-full rounded-lg border border-border bg-muted/30 p-4">
                  <h4 className="mb-3 text-sm font-semibold">Profile Information</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Name</p>
                      <p className="font-medium text-foreground">{detailsDialog.customer.name}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Status</p>
                      <Badge className={statusBadgeClass(detailsDialog.customer.status)}>
                        {detailsDialog.customer.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Email</p>
                      <p className="break-all text-sm text-foreground">{detailsDialog.customer.email}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Phone</p>
                      <p className="text-sm text-foreground">{detailsDialog.customer.phone || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Joined On</p>
                      <p className="text-sm text-foreground">{formatDate(detailsDialog.customer.joinDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Last Active</p>
                      <p className="text-sm text-foreground">{formatDate(detailsDialog.customer.lastActive)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Total Bookings</p>
                      <p className="text-sm text-foreground">{detailsDialog.customer.totalBookings}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Lifetime Spend</p>
                      <p className="text-sm text-foreground">{formatCurrency(detailsDialog.customer.totalSpent)}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs uppercase text-muted-foreground">Preferred Time Slot</p>
                      <p className="text-sm text-foreground">{customerPreferredTimeSlot || 'Not set'}</p>
                    </div>
                  </div>
                </section>

                <section className="h-full rounded-lg border border-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Assignment Status</h4>
                    <Badge variant="outline">
                      {selectedCustomerStatus?.hasAssignment ? 'Assigned' : 'Not Assigned'}
                    </Badge>
                  </div>

                  {selectedCustomerStatus?.hasAssignment && selectedCustomerStatus.assignment ? (
                    <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase text-muted-foreground">Assigned Maid</p>
                          <p className="font-medium text-foreground">
                            {selectedCustomerStatus.assignment.maid?.name || 'Unknown Maid'}
                          </p>
                          {selectedCustomerStatus.assignment.maid?.rating && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Rating: {selectedCustomerStatus.assignment.maid.rating.toFixed(1)} ★
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs uppercase text-muted-foreground">Maid Contact</p>
                          <p className="text-sm text-foreground">
                            {selectedCustomerStatus.assignment.maid?.phone || '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-muted-foreground">Assigned On</p>
                          <p className="text-sm text-foreground">
                            {formatDate(selectedCustomerStatus.assignment.assignedAt)}
                          </p>
                        </div>
                      </div>
                      {selectedCustomerStatus.assignment.notes && (
                        <div className="rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Notes:</span>{' '}
                          {selectedCustomerStatus.assignment.notes}
                        </div>
                      )}
                      {renderRequestContext(detailsDialog.customer.id)}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No maid assignment is linked to this customer yet.
                    </p>
                  )}
                </section>
              </div>

              <section className="rounded-lg border border-border p-4">
                <h4 className="mb-3 text-sm font-semibold">Subscription & Scheduling</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Subscription</p>
                    <p className="text-sm text-foreground">
                      {selectedCustomerStatus?.hasSubscription ? 'Active' : 'Not enrolled'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Next Booking</p>
                    <p className="text-sm text-foreground">
                      {selectedCustomerStatus?.nextBookingDate
                        ? `${formatDate(selectedCustomerStatus.nextBookingDate)} • ${formatTime(selectedCustomerStatus.nextBookingDate)}`
                        : selectedCustomerStatus?.isInBufferPeriod
                        ? 'Paused (Buffer Active)'
                        : 'Not scheduled'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Last Booking</p>
                    <p className="text-sm text-foreground">
                      {selectedCustomerStatus?.lastBookingDate
                        ? `${formatDate(selectedCustomerStatus.lastBookingDate)} • ${formatTime(selectedCustomerStatus.lastBookingDate)}`
                        : 'No bookings yet'}
                    </p>
                  </div>
                  {selectedCustomerStatus?.bufferPeriod && (
                    <div className="sm:col-span-2 rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Buffer:</span>{' '}
                      {formatDate(selectedCustomerStatus.bufferPeriod.startDate)} →{' '}
                      {formatDate(selectedCustomerStatus.bufferPeriod.endDate)} (
                      {selectedCustomerStatus.bufferPeriod.reason || 'No reason provided'})
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialog({ open: false, customer: null })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};