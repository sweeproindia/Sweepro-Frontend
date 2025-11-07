import { useState, useEffect, useRef, useMemo } from 'react';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Download, Calendar, CheckCircle, X, Clock } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { PaymentService, Payment } from '@/services/paymentService';
import { SubscriptionService, Subscription } from '@/services/subscriptionService';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/Skeleton';
import { InstagramSkeleton, PaymentSkeleton, DashboardStatsSkeleton } from '@/components/ui/InstagramSkeleton';
import { 
  PaymentListSkeleton, 
  DashboardStatsSkeleton as OptimizedStatsSkeleton,
  IncrementalLoadingSkeleton,
  LoadingSpinner
} from '@/components/ui/OptimizedSkeletons';
import { useInfinitePayments } from '@/hooks/useInfinitePayments';

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case 'COMPLETED':
      return 'bg-success text-success-foreground';
    case 'PENDING':
    case 'PROCESSING':
      return 'bg-warning text-warning-foreground';
    case 'FAILED':
    case 'CANCELLED':
      return 'bg-destructive text-destructive-foreground';
    case 'REFUNDED':
    case 'PARTIALLY_REFUNDED':
      return 'bg-secondary text-secondary-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toUpperCase()) {
    case 'COMPLETED':
      return <CheckCircle className="h-4 w-4" />;
    case 'PENDING':
    case 'PROCESSING':
      return <Clock className="h-4 w-4" />;
    case 'FAILED':
    case 'CANCELLED':
      return <X className="h-4 w-4" />;
    case 'REFUNDED':
    case 'PARTIALLY_REFUNDED':
      return <Download className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

export default function PaymentsPage() {
  const { user, isAuthenticated } = useUser();
  const { toast } = useToast();
  const { items: payments, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } = useInfinitePayments(10);
  const [subLoading, setSubLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const loading = isLoading || subLoading;

  const [stats, setStats] = useState({
    totalPaid: 0,
    thisMonthPaid: 0,
    nextPaymentAmount: 0,
    nextPaymentDate: null as string | null,
    pendingPayments: 0,
    completedPayments: 0,
    failedPayments: 0
  });

  useEffect(() => {
    let active = true;
    const loadSubscription = async () => {
      setSubLoading(true);
      try {
        const subscriptionResponse = await SubscriptionService.getUserSubscription();
        if (!active) return;
        if (subscriptionResponse.success) {
          const subscriptionData = (subscriptionResponse.data as any)?.subscription ?? subscriptionResponse.data ?? null;
          setSubscription(subscriptionData);
        } else {
          setSubscription(null);
        }
      } catch (e) {
        setSubscription(null);
      } finally {
        if (active) setSubLoading(false);
      }
    };
    if (user && isAuthenticated) loadSubscription();
    return () => { active = false; };
  }, [user, isAuthenticated]);

  const calculateStats = () => {
    const completedPayments = payments.filter(p => p.status === 'COMPLETED');
    const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    const now = new Date();
    const thisMonthPaid = completedPayments
      .filter(p => {
        const d = new Date(p.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, p) => sum + p.amount, 0);
    const pendingPayments = payments.filter(p => p.status === 'PENDING' || p.status === 'PROCESSING').length;
    const failedPayments = payments.filter(p => p.status === 'FAILED' || p.status === 'CANCELLED').length;
    const nextPaymentAmount = subscription?.amount || 0;
    const nextPaymentDate = subscription?.nextBillDate || null;
    setStats({ totalPaid, thisMonthPaid, nextPaymentAmount, nextPaymentDate, pendingPayments, completedPayments: completedPayments.length, failedPayments });
  };

  useEffect(() => {
    calculateStats();
  }, [payments, subscription]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, { root: null, rootMargin: '200px', threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={`hsk-${i}`} className="dashboard-card">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-28" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-7 w-32" />
                  <Skeleton className="h-3 w-24 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="dashboard-card">
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-64 mt-2" />
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <PaymentListSkeleton count={8} />
              ) : payments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No payments found.</p>
                </div>
              ) : (
                payments.map((payment, index) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-muted/20 rounded-full flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium text-foreground">{payment.description}</p>
                        <p className="text-sm text-muted-foreground">
                          Created on {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="font-semibold text-foreground">₹{payment.amount.toLocaleString()}</p>
                      <Badge className={getStatusColor(payment.status)}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1 capitalize">{payment.status.toLowerCase()}</span>
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || !isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="text-center p-8">
          <p className="text-muted-foreground">Please log in to view your payment history.</p>
        </div>
      </DashboardLayout>
    );
  }

  const upcomingPayments = subscription && subscription.nextBillDate ? [{
    id: subscription.id,
    date: subscription.nextBillDate,
    amount: subscription.amount,
    description: subscription.plan?.name ? `${subscription.plan.name} - Next Billing` : 'Subscription Payment',
    status: 'PENDING'
  }] : [];

  const pendingPayments = payments.filter(p => p.status === 'PENDING' || p.status === 'PROCESSING');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="fade-in">
          <h1 className="text-3xl font-bold text-foreground">Payment History</h1>
          <p className="text-muted-foreground mt-2">
            View your billing history and manage payment methods
          </p>
        </div>

        {/* Instagram-style Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="dashboard-card hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                ₹{stats.totalPaid.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                From {stats.completedPayments} transactions
              </p>
            </CardContent>
          </Card>

          <Card className="dashboard-card hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                ₹{stats.pendingPayments.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingPayments} pending payments
              </p>
            </CardContent>
          </Card>

          <Card className="dashboard-card hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <X className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                ₹{stats.failedPayments.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.failedPayments} failed payments
              </p>
            </CardContent>
          </Card>

          <Card className="dashboard-card hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{stats.thisMonthPaid.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.completedPayments} transactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Payments */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <CardTitle>Upcoming Payments</CardTitle>
            <CardDescription>Your scheduled payments and billing dates</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingPayments.length > 0 ? (
              <div className="space-y-3">
                {upcomingPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-warning/10 rounded-lg border border-warning/20">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-warning/20 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{payment.description}</p>
                        <p className="text-sm text-muted-foreground">
                          Due on {new Date(payment.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">₹{payment.amount.toLocaleString()}</p>
                      <Badge className={getStatusColor(payment.status)}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1 capitalize">{payment.status.toLowerCase()}</span>
                      </Badge>
                    </div>
                  </div>
                ))}
                {/* Show pending payments */}
                {pendingPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-warning/10 rounded-lg border border-warning/20">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-warning/20 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {payment.bookingId ? 'Booking Payment' : 
                           payment.subscriptionId ? 'Subscription Payment' : 
                           payment.description || 'Payment'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Created on {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">₹{payment.amount.toLocaleString()}</p>
                      <Badge className={getStatusColor(payment.status)}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1 capitalize">{payment.status.toLowerCase()}</span>
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No upcoming payments scheduled</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Manage your default payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium text-foreground">•••• •••• •••• 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/27 • Visa</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Update</Button>
                <Button variant="outline" size="sm">Add New</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>All your past transactions and invoices</CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length > 0 ? (
              <div className="space-y-4">
                {payments.map((payment, index) => (
                  <div 
                    key={payment.id} 
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        payment.status === 'COMPLETED' ? 'bg-success/20' : 
                        payment.status === 'PENDING' || payment.status === 'PROCESSING' ? 'bg-warning/20' :
                        payment.status === 'FAILED' || payment.status === 'CANCELLED' ? 'bg-destructive/20' :
                        'bg-muted/20'
                      }`}>
                        {getStatusIcon(payment.status)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {payment.bookingId ? 'Booking Payment' : 
                           payment.subscriptionId ? 'Subscription Payment' : 
                           payment.description || 'Payment'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleDateString()} • {payment.paymentMethod || 'Online'}
                          {payment.transactionId && (
                            <span className="ml-2 font-mono text-xs bg-muted px-1 rounded">
                              #{payment.transactionId.slice(-8)}
                            </span>
                          )}
                        </p>
                        {payment.discount && payment.discount > 0 && (
                          <p className="text-xs text-success mt-1">
                            Saved ₹{payment.discount.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          ₹{payment.amount.toLocaleString()}
                        </p>
                        {payment.tax && payment.tax > 0 && (
                          <p className="text-xs text-muted-foreground">
                            +₹{payment.tax.toLocaleString()} tax
                          </p>
                        )}
                        <Badge className={getStatusColor(payment.status)}>
                          {getStatusIcon(payment.status)}
                          <span className="ml-1 capitalize">{payment.status.toLowerCase()}</span>
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Receipt
                        </Button>
                        {payment.status === 'COMPLETED' && payment.refundAmount === 0 && (
                          <Button variant="ghost" size="sm" className="text-xs">
                            Request Refund
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isFetchingNextPage && (
                  <IncrementalLoadingSkeleton type="payments" count={3} />
                )}
                <div ref={sentinelRef} />
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Payment History</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                  Your payment transactions will appear here once you start using our services. All payments are secure and processed through encrypted channels.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button className="btn-hero">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Make First Payment
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Billing Information */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
            <CardDescription>Your billing address and tax information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-3">Billing Address</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{user?.name || 'User Name'}</p>
                  <p>{user?.address || '123 Main Street'}</p>
                  <p>{user?.phone || '+91 98765 43210'}</p>
                  <p>{user?.email || 'user@example.com'}</p>
                </div>
                <Button variant="outline" size="sm" className="mt-3">
                  Update Address
                </Button>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-3">Payment Statistics</h4>
                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="flex justify-between">
                    <span>Completed Payments:</span>
                    <span className="text-foreground font-medium">{stats.completedPayments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Payments:</span>
                    <span className="text-warning font-medium">{stats.pendingPayments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed Payments:</span>
                    <span className="text-destructive font-medium">{stats.failedPayments}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span>Success Rate:</span>
                    <span className="text-success font-medium">
                      {payments.length > 0 ? 
                        Math.round((stats.completedPayments / payments.length) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mt-3">
                  Download Statement
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="dashboard-card slide-up bg-gradient-feature">
          <CardHeader>
            <CardTitle>Need Help with Payments?</CardTitle>
            <CardDescription>
              Contact our billing support team for any payment-related queries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="btn-hero">
                Contact Billing Support
              </Button>
              <Button variant="outline">
                View FAQ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}