import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Users, ChevronLeft, ChevronRight, UserPlus, Pause, User, AlertTriangle, RefreshCw, Calendar, Search } from 'lucide-react';

import { CustomerAssignmentService, CustomerAssignmentStatus } from '@/services/customerAssignmentService';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status: 'active' | 'pending' | 'suspended';
  totalBookings: number;
  totalSpent: number;
  lastActive: string;
}

interface Maid {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  skills: string[];
  completedBookings: number;
}

interface AdminUsersSectionProps {
  users: User[];
  availableMaids: Maid[];
  onVerifyUser: (userId: string) => void;
  onRefreshData?: () => void;
}

export const AdminUsersSection: React.FC<AdminUsersSectionProps> = ({
  users,
  availableMaids,
  onVerifyUser,
  onRefreshData,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [customerStatuses, setCustomerStatuses] = useState<Record<string, CustomerAssignmentStatus>>({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Assignment dialog state
  const [assignDialog, setAssignDialog] = useState<{
    open: boolean;
    customer: User | null;
  }>({ open: false, customer: null });
  const [selectedMaidId, setSelectedMaidId] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [conflictWarnings, setConflictWarnings] = useState<Record<string, string>>({});

  // Load customer statuses
  useEffect(() => {
    loadCustomerStatuses();
  }, [users]);

  const loadCustomerStatuses = async () => {
    setLoading(true);
    console.log('🔄 Loading customer statuses for', users.length, 'users');

    try {
      const statusPromises = users.map(async (user) => {
        try {
          const response = await CustomerAssignmentService.getCustomerStatus(user.id);
          console.log(`✅ Status loaded for user ${user.name} (${user.id}):`, response.data);
          return { userId: user.id, status: response.data };
        } catch (error) {
          console.error(`❌ Failed to load status for user ${user.name} (${user.id}):`, error);
          return { userId: user.id, status: null };
        }
      });

      const results = await Promise.all(statusPromises);
      const statusMap: Record<string, CustomerAssignmentStatus> = {};
      results.forEach(({ userId, status }) => {
        if (status) {
          statusMap[userId] = status;
          console.log(`📝 Added status for user ${userId}:`, {
            hasAssignment: status.hasAssignment,
            maidName: status.assignment?.maid?.name,
          });
        }
      });

      setCustomerStatuses(statusMap);
      console.log('🎉 Customer statuses updated:', Object.keys(statusMap).length, 'customers with status');
    } catch (error) {
      console.error('Failed to load customer statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check for potential conflicts when maid is selected
  const checkMaidConflicts = async (maidId: string, customerId: string) => {
    try {
      // This is a preview check - we'll try to get customer status and see existing assignments
      const customer = users.find((u) => u.id === customerId);
      if (!customer) return;

      // Find if this maid is already assigned to other customers
      const otherCustomersWithSameMaid = Object.entries(customerStatuses).filter(([userId, status]) =>
        userId !== customerId && status.hasAssignment && status.assignment?.maid.id === maidId
      );

      if (otherCustomersWithSameMaid.length > 0) {
        const customerNames = otherCustomersWithSameMaid.map(([userId]) => {
          const user = users.find((u) => u.id === userId);
          return user?.name || 'Unknown';
        }).join(', ');

        setConflictWarnings((prev) => ({
          ...prev,
          [maidId]: `⚠️ This maid is already assigned to: ${customerNames}`,
        }));
      } else {
        setConflictWarnings((prev) => {
          const newWarnings = { ...prev };
          delete newWarnings[maidId];
          return newWarnings;
        });
      }
    } catch (error) {
      console.error('Error checking maid conflicts:', error);
    }
  };

  const handleAssignMaid = async () => {
    if (!assignDialog.customer || !selectedMaidId) {
      toast.error('Please select a homecare partner');
      return;
    }

    setAssigning(true);
    try {
      const response = await CustomerAssignmentService.assignMaidToCustomer({
        customerId: assignDialog.customer.id,
        maidId: selectedMaidId,
        notes: assignmentNotes,
      });

      console.log('Assignment response:', response);

      // Find the selected maid details for optimistic update
      const selectedMaid = availableMaids.find((m) => m.id === selectedMaidId);

      // Optimistic update - immediately update the customer status
      if (selectedMaid) {
        setCustomerStatuses((prev) => ({
          ...prev,
          [assignDialog.customer!.id]: {
            customerId: assignDialog.customer!.id,
            hasAssignment: true,
            hasSubscription: prev[assignDialog.customer!.id]?.hasSubscription || false,
            assignment: {
              id: 'temp-' + Date.now(),
              customerId: assignDialog.customer!.id,
              maidId: selectedMaidId,
              notes: assignmentNotes,
              assignedAt: new Date().toISOString(),
              isActive: true,
              customer: {
                id: assignDialog.customer!.id,
                name: assignDialog.customer!.name,
                email: assignDialog.customer!.email,
                phone: assignDialog.customer!.phone,
                address: '',
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
            isInBufferPeriod: prev[assignDialog.customer!.id]?.isInBufferPeriod || false,
            bufferPeriod: prev[assignDialog.customer!.id]?.bufferPeriod,
            nextBookingDate: prev[assignDialog.customer!.id]?.nextBookingDate,
            lastBookingDate: prev[assignDialog.customer!.id]?.lastBookingDate,
          },
        }));
      }

      toast.success('Assignment request sent to homecare partner successfully');
      setAssignDialog({ open: false, customer: null });
      setSelectedMaidId('');
      setAssignmentNotes('');
      setConflictWarnings({});

      // Refresh data in background
      setTimeout(async () => {
        await loadCustomerStatuses();
        onRefreshData?.();
      }, 500);
    } catch (error: any) {
      console.error('Assignment error:', error);

      // Handle specific conflict errors
      if (error.response?.status === 409) {
        const conflictType = error.response.data?.conflictType;
        const errorMessage = error.response.data?.error || 'Assignment conflict detected';

        if (conflictType === 'TIMESLOT_CONFLICT') {
          toast.error(`Timeslot Conflict: ${errorMessage}`, {
            duration: 6000,
            description: 'This homecare partner is already assigned to another customer with the same timeslot.',
          });
        } else if (conflictType === 'CAPACITY_EXCEEDED') {
          toast.error(`Capacity Exceeded: ${errorMessage}`, {
            duration: 6000,
            description: 'This homecare partner has reached their maximum daily booking capacity.',
          });
        } else {
          toast.error(`Assignment Conflict: ${errorMessage}`, {
            duration: 5000,
          });
        }
      } else {
        toast.error('Failed to assign maid');
      }
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveAssignment = async (customerId: string) => {
    try {
      // Optimistic update - immediately remove assignment
      setCustomerStatuses((prev) => ({
        ...prev,
        [customerId]: {
          ...prev[customerId],
          hasAssignment: false,
          assignment: undefined,
        },
      }));

      await CustomerAssignmentService.removeCustomerAssignment(customerId);
      toast.success('Homecare partner assignment removed');

      // Refresh data in background
      setTimeout(async () => {
        await loadCustomerStatuses();
        onRefreshData?.();
      }, 500);
    } catch (error) {
      toast.error('Failed to remove assignment');
      console.error('Remove assignment error:', error);
      // Revert optimistic update on error
      await loadCustomerStatuses();
    }
  };

  const getPaginatedData = (data: User[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (data: User[]) => {
    return Math.ceil(data.length / itemsPerPage);
  };

  const getSerialNumber = (index: number, page: number) => {
    return (page - 1) * itemsPerPage + index + 1;
  };

  const getStatusColor = (status: string) => {
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

  const Pagination = ({ currentPage, totalPages, onPageChange }: {
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

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) => {
      const name = user.name.toLowerCase();
      const email = user.email.toLowerCase();
      const phone = user.phone?.toLowerCase?.() ?? user.phone;
      return name.includes(term) || email.includes(term) || (typeof phone === 'string' && phone.toLowerCase().includes(term));
    });
  }, [users, searchTerm]);

  const totalPages = Math.max(1, getTotalPages(filteredUsers));
  const paginatedUsers = getPaginatedData(filteredUsers, currentPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    const updatedTotalPages = Math.max(1, getTotalPages(filteredUsers));
    if (currentPage > updatedTotalPages) {
      setCurrentPage(updatedTotalPages);
    }
  }, [filteredUsers, currentPage]);

  return (
    <Card className="dashboard-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Customer Management
            </CardTitle>
            <CardDescription>Manage customer accounts, verify new users, and monitor activity</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadCustomerStatuses}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Showing {paginatedUsers.length > 0 ? `${getSerialNumber(0, currentPage)}-
              ${getSerialNumber(paginatedUsers.length - 1, currentPage)}` : 0} of {filteredUsers.length} customers
            </p>
          </div>
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
                    {filteredUsers.length === 0
                      ? 'No customers match your search.'
                      : 'No customers on this page.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user, index) => {
                  const customerStatus = customerStatuses[user.id];
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
                        <p className="text-sm">{user.phone}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            <span className="text-xs text-muted-foreground">Loading...</span>
                          </div>
                        ) : customerStatus?.hasAssignment ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-sm">
                                {customerStatus.assignment?.maid.name || 'Unknown Maid'}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Rating: {customerStatus.assignment?.maid.rating?.toFixed(1) || 'N/A'}★
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Phone: {customerStatus.assignment?.maid.phone || 'N/A'}
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-xs"
                              onClick={() => handleRemoveAssignment(user.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Badge variant="outline" className="text-xs">
                              No Assignment
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-xs"
                              onClick={() => setAssignDialog({ open: true, customer: user })}
                            >
                              <UserPlus className="h-3 w-3 mr-1" />
                              Assign
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {!customerStatus?.hasSubscription ? (
                          <Badge variant="outline" className="text-xs">
                            No Subscription
                          </Badge>
                        ) : customerStatus?.isInBufferPeriod ? (
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
                        <div className="flex gap-1 flex-wrap">
                          <Button size="sm" variant="outline" className="h-7 text-xs">
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

        {filteredUsers.length > itemsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </CardContent>

      {/* Assign Maid Dialog */}
      <Dialog open={assignDialog.open} onOpenChange={(open) => setAssignDialog({ open, customer: assignDialog.customer })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Homecare Partner to Customer</DialogTitle>
            <DialogDescription>
              Select a maid to send an assignment request to for {assignDialog.customer?.name}. 
              The homecare partner will receive the request and can accept or reject it. If accepted, they will receive daily booking requests for this customer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="maid-select">Select Homecare Partner</Label>
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
                  <SelectValue placeholder="Choose a homecare partner..." />
                </SelectTrigger>
                <SelectContent>
                  {availableMaids.map((maid) => (
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
              
              {/* Show conflict warning if exists */}
              {selectedMaidId && conflictWarnings[selectedMaidId] && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    {conflictWarnings[selectedMaidId]}
                  </p>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="assignment-notes">Notes (Optional)</Label>
              <Textarea
                id="assignment-notes"
                placeholder="Add any notes about this assignment..."
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialog({ open: false, customer: null })}
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
    </Card>
  );
}; 