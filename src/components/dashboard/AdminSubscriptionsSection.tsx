import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  CreditCard, ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  User, Mail, Package, TrendingUp, Search, Eye, Phone,
  Home, MapPin, Clock, Info, Loader2,
  AlertCircle, Pause, Star
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { apiRequest, HttpMethod } from '@/services/api';
import { toast } from 'sonner';

interface Subscription {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  plan: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending_payment';
  startDate: string;
  endDate: string;
  price: number;
  usage: number;
  limit: number;
  nextBilling: string;
  billingCycle?: string;
  isInBufferPeriod?: boolean;
  bufferDaysUsed?: number;
  bufferDaysCount?: number;
  autoRenew?: boolean;
}

interface AdminSubscriptionsSectionProps {
  subscriptions: Subscription[];
  onRefreshData?: () => void;
}

export const AdminSubscriptionsSection: React.FC<AdminSubscriptionsSectionProps> = ({
  subscriptions,
  onRefreshData,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [searchTerm, setSearchTerm] = useState('');

  // Detail dialog
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; subscriptionId: string | null }>({ open: false, subscriptionId: null });
  const [detailLoading, setDetailLoading] = useState(false);
  const [subscriptionDetail, setSubscriptionDetail] = useState<any>(null);

  const getPaginatedData = (data: Subscription[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (data: Subscription[]) => {
    return Math.ceil(data.length / itemsPerPage);
  };

  const getSerialNumber = (index: number, page: number) => {
    return (page - 1) * itemsPerPage + index + 1;
  };

  const getUsagePercentage = (usage: number, limit: number) => {
    if (!limit) return 0;
    return Math.min(100, Math.round((usage / limit) * 100));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'expired':
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      case 'pending_payment':
      case 'PENDING_PAYMENT':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatAddress = (user: any) => {
    if (!user) return null;
    const parts = [
      user.addressLine,
      user.locality,
      user.landmark && `Near ${user.landmark}`,
      user.city,
      user.state,
      user.pincode,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : user.address || null;
  };

  // Fetch subscription detail
  const handleViewDetails = async (subscriptionId: string) => {
    setDetailDialog({ open: true, subscriptionId });
    setDetailLoading(true);
    setSubscriptionDetail(null);
    try {
      const response = await apiRequest(`/subscriptions/admin/${subscriptionId}`, {
        method: HttpMethod.GET,
        requiresAuth: true,
      });
      const data = (response as any).data ?? response;
      setSubscriptionDetail(data);
    } catch (error) {
      console.error('Failed to load subscription details:', error);
      toast.error('Failed to load subscription details');
    } finally {
      setDetailLoading(false);
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

  const filteredSubscriptions = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return subscriptions;
    return subscriptions.filter((subscription) => {
      const name = subscription.customerName.toLowerCase();
      const email = subscription.customerEmail.toLowerCase();
      const plan = subscription.plan.toLowerCase();
      const status = subscription.status.toLowerCase();
      return (
        name.includes(term) ||
        email.includes(term) ||
        plan.includes(term) ||
        status.includes(term)
      );
    });
  }, [subscriptions, searchTerm]);

  const totalPages = Math.max(1, getTotalPages(filteredSubscriptions));
  const paginatedSubscriptions = getPaginatedData(filteredSubscriptions, currentPage);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  React.useEffect(() => {
    const updatedTotal = Math.max(1, getTotalPages(filteredSubscriptions));
    if (currentPage > updatedTotal) {
      setCurrentPage(updatedTotal);
    }
  }, [filteredSubscriptions, currentPage]);

  return (
    <>
    <Card className="dashboard-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Customer Subscriptions
        </CardTitle>
        <CardDescription>Manage customer subscription plans and usage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Showing {paginatedSubscriptions.length > 0 ? `${getSerialNumber(0, currentPage)}-${getSerialNumber(paginatedSubscriptions.length - 1, currentPage)}` : 0} of {filteredSubscriptions.length} subscriptions
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by customer, email, plan, or status"
              className="pl-9"
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">S.No</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Usage</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="hidden lg:table-cell">Next Billing</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSubscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {searchTerm ? 'No results found' : 'No subscriptions yet'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {searchTerm
                            ? 'No subscriptions match your search. Try a different term.'
                            : 'Active subscriptions will appear here.'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSubscriptions.map((subscription, index) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">
                      {getSerialNumber(index, currentPage)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          <span className="font-medium">{subscription.customerName}</span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{subscription.customerEmail}</span>
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {subscription.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(subscription.status)}>
                        {subscription.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{subscription.usage} / {subscription.limit}</span>
                          <span>{getUsagePercentage(subscription.usage, subscription.limit)}%</span>
                        </div>
                        <Progress
                          value={getUsagePercentage(subscription.usage, subscription.limit)}
                          className="h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span>₹{subscription.price.toLocaleString('en-IN')}/month</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{formatDate(subscription.nextBilling)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(subscription.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Details</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filteredSubscriptions.length > itemsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </CardContent>
    </Card>

    {/* ============ VIEW DETAILS DIALOG ============ */}
    <Dialog
      open={detailDialog.open}
      onOpenChange={(open) => {
        if (!open) {
          setDetailDialog({ open: false, subscriptionId: null });
          setSubscriptionDetail(null);
        }
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Subscription Details
          </DialogTitle>
          <DialogDescription>
            {subscriptionDetail ? `ID: ${subscriptionDetail.id?.slice(-8)}` : 'Loading...'}
          </DialogDescription>
        </DialogHeader>

        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : subscriptionDetail ? (
          <div className="space-y-5">
            {/* Status Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getStatusColor(subscriptionDetail.status)}>
                {subscriptionDetail.status}
              </Badge>
              {subscriptionDetail.autoRenew && (
                <Badge variant="outline" className="border-blue-300 text-blue-700">Auto Renew</Badge>
              )}
              {subscriptionDetail.isInBufferPeriod && (
                <Badge variant="outline" className="border-orange-300 text-orange-700">
                  <Pause className="h-3 w-3 mr-1" />
                  In Buffer Period
                </Badge>
              )}
              {subscriptionDetail.isPaused && (
                <Badge variant="outline" className="border-yellow-300 text-yellow-700">Paused</Badge>
              )}
            </div>

            <Separator />

            {/* Customer Info */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Customer Information</h4>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium">{subscriptionDetail.customer?.user?.name || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm">{subscriptionDetail.customer?.user?.email || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-medium">{subscriptionDetail.customer?.user?.phone || 'Not provided'}</span>
                </div>
                {formatAddress(subscriptionDetail.customer?.user) && (
                  <div className="flex items-start gap-2">
                    <Home className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{formatAddress(subscriptionDetail.customer?.user)}</span>
                  </div>
                )}
                {subscriptionDetail.customer?.user?.apartment_id && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">Apartment: {subscriptionDetail.customer.user.apartment_id}</span>
                  </div>
                )}
                {subscriptionDetail.customer?.user?.timeSlot && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">Preferred Slot: {subscriptionDetail.customer.user.timeSlot}</span>
                  </div>
                )}
                {subscriptionDetail.customer?.user?.createdAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Customer since: {formatDate(subscriptionDetail.customer.user.createdAt)}
                  </p>
                )}
              </div>
            </div>

            {/* Plan Details */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Plan Details</h4>
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-lg">{subscriptionDetail.plan?.name || '-'}</span>
                  {subscriptionDetail.plan?.isPopular && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </div>
                {subscriptionDetail.plan?.service?.name && (
                  <p className="text-sm text-muted-foreground">Service: {subscriptionDetail.plan.service.name}</p>
                )}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mt-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sessions/Week</span>
                    <span>{subscriptionDetail.plan?.sessionsPerWeek || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sessions/Month</span>
                    <span>{subscriptionDetail.plan?.sessionsPerMonth || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span>{subscriptionDetail.plan?.duration || '-'} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan Price</span>
                    <span>₹{subscriptionDetail.plan?.finalPrice?.toFixed(2) || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Period & Billing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Subscription Period</h4>
                <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Start: <span className="font-medium">{formatDate(subscriptionDetail.startDate)}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">End: <span className="font-medium">{formatDate(subscriptionDetail.endDate)}</span></span>
                  </div>
                  {subscriptionDetail.nextBillDate && (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Next Bill: <span className="font-medium">{formatDate(subscriptionDetail.nextBillDate)}</span></span>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">Billing: {subscriptionDetail.billingCycle || '-'}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Billing Amount</h4>
                <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <span className="font-bold text-lg">₹{subscriptionDetail.amount?.toFixed(2) ?? '0.00'}</span>
                  </div>
                  {subscriptionDetail.discount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Discount</span>
                      <span className="text-green-600">₹{subscriptionDetail.discount?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cycles</span>
                    <span>{subscriptionDetail.completedCycles ?? 0} / {subscriptionDetail.totalCycles ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Buffer Info */}
            {(subscriptionDetail.bufferDaysCount > 0 || subscriptionDetail.isInBufferPeriod) && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Buffer Period</h4>
                <div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Buffer Days Used</span>
                    <span className="font-medium">{subscriptionDetail.bufferDaysUsed ?? 0} / {subscriptionDetail.bufferDaysCount ?? 0}</span>
                  </div>
                  <Progress
                    value={subscriptionDetail.bufferDaysCount ? (subscriptionDetail.bufferDaysUsed / subscriptionDetail.bufferDaysCount) * 100 : 0}
                    className="h-2"
                  />
                  {subscriptionDetail.isInBufferPeriod && (
                    <>
                      {subscriptionDetail.bufferStartDate && (
                        <p className="text-xs text-muted-foreground">
                          Buffer started: {formatDate(subscriptionDetail.bufferStartDate)}
                        </p>
                      )}
                      {subscriptionDetail.bufferEndDate && (
                        <p className="text-xs text-muted-foreground">
                          Buffer ends: {formatDate(subscriptionDetail.bufferEndDate)}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Buffer Periods History */}
            {subscriptionDetail.bufferPeriods?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Buffer History</h4>
                <div className="space-y-2">
                  {subscriptionDetail.bufferPeriods.map((bp: any) => (
                    <div key={bp.id} className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-2 text-sm">
                      <div>
                        <span>{formatDate(bp.startDate)} — {formatDate(bp.endDate)}</span>
                        <span className="text-muted-foreground ml-2">({bp.daysCount} days)</span>
                      </div>
                      <Badge variant={bp.status === 'ACTIVE' ? 'default' : 'secondary'}>{bp.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Payments */}
            {subscriptionDetail.payments?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Recent Payments</h4>
                <div className="space-y-2">
                  {subscriptionDetail.payments.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-2 text-sm">
                      <div>
                        <span className="font-medium">₹{p.finalAmount?.toFixed(2) ?? p.amount?.toFixed(2)}</span>
                        <span className="text-muted-foreground ml-2">{formatDate(p.createdAt)}</span>
                        {p.paymentMethod && <span className="text-muted-foreground ml-2">via {p.paymentMethod}</span>}
                      </div>
                      <Badge variant={p.status === 'COMPLETED' ? 'default' : p.status === 'FAILED' ? 'destructive' : 'secondary'}>
                        {p.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Bookings */}
            {subscriptionDetail.recentBookings?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Recent Bookings</h4>
                <div className="space-y-2">
                  {subscriptionDetail.recentBookings.map((b: any) => (
                    <div key={b.id} className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-2 text-sm">
                      <div>
                        <span className="font-medium">{b.service?.name || 'Service'}</span>
                        <span className="text-muted-foreground ml-2">{formatDate(b.scheduledAt)}</span>
                        {b.maid?.name && <span className="text-muted-foreground ml-1">({b.maid.name})</span>}
                      </div>
                      <Badge variant={b.status === 'COMPLETED' ? 'default' : b.status === 'CANCELLED' ? 'destructive' : 'secondary'}>
                        {b.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subscription Cycles */}
            {subscriptionDetail.cycles?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Cycle History</h4>
                <div className="space-y-2">
                  {subscriptionDetail.cycles.map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-2 text-sm">
                      <div>
                        <span className="font-medium">Cycle #{c.cycleNumber}</span>
                        <span className="text-muted-foreground ml-2">{formatDate(c.startDate)} — {formatDate(c.endDate)}</span>
                      </div>
                      <Badge variant={c.status === 'ACTIVE' ? 'default' : 'secondary'}>{c.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load subscription details</p>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDetailDialog({ open: false, subscriptionId: null });
              setSubscriptionDetail(null);
            }}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    </>
  );
};