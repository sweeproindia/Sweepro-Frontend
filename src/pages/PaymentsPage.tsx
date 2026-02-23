import { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  CreditCard, Download, Calendar, CheckCircle, X, Clock,
  FileText, Eye, RefreshCw, TrendingUp, AlertCircle, Receipt
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { PaymentService, Payment } from '@/services/paymentService';
import { SubscriptionService, Subscription } from '@/services/subscriptionService';
import { useToast } from '@/hooks/use-toast';
import PaymentsPageSkeleton from '@/components/payments/PaymentsPageSkeleton';

// ─── Status helpers ──────────────────────────────────────────────────────────
const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case 'COMPLETED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'PENDING':
    case 'PROCESSING': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'FAILED':
    case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
    case 'REFUNDED':
    case 'PARTIALLY_REFUNDED': return 'bg-blue-100 text-blue-700 border-blue-200';
    default: return 'bg-zinc-100 text-zinc-600 border-zinc-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toUpperCase()) {
    case 'COMPLETED': return <CheckCircle className="h-3.5 w-3.5" />;
    case 'PENDING':
    case 'PROCESSING': return <Clock className="h-3.5 w-3.5" />;
    case 'FAILED':
    case 'CANCELLED': return <X className="h-3.5 w-3.5" />;
    case 'REFUNDED':
    case 'PARTIALLY_REFUNDED': return <RefreshCw className="h-3.5 w-3.5" />;
    default: return <Clock className="h-3.5 w-3.5" />;
  }
};

const getPaymentLabel = (payment: Payment) => {
  if (payment.bookingId) return 'Booking Payment';
  if (payment.subscriptionId) return 'Subscription Payment';
  return payment.description || 'Payment';
};

const getPaymentMethodLabel = (method: string) =>
  method?.replace('_', ' ') || 'Online';

// ─── Invoice Modal ───────────────────────────────────────────────────────────
interface InvoiceModalProps {
  payment: Payment | null;
  open: boolean;
  onClose: () => void;
}

function InvoiceModal({ payment, open, onClose }: InvoiceModalProps) {
  const { toast } = useToast();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  // Load PDF blob when modal opens
  useEffect(() => {
    if (!open || !payment) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const url = await PaymentService.getInvoiceBlobUrl(payment.id);
        if (!cancelled) {
          setBlobUrl(url);
          blobUrlRef.current = url;
        } else {
          URL.revokeObjectURL(url);
        }
      } catch (err: any) {
        if (!cancelled) {
          toast({ title: 'Error', description: err.message || 'Failed to load invoice', variant: 'destructive' });
          onClose();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      setBlobUrl(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, payment?.id]);

  const handleDownload = async () => {
    if (!payment) return;
    setDownloading(true);
    try {
      await PaymentService.downloadInvoice(payment.id);
      toast({ title: 'Downloaded!', description: 'Invoice PDF saved to your downloads.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Download failed', variant: 'destructive' });
    } finally {
      setDownloading(false);
    }
  };

  const invoiceLabel = payment?.invoiceNumber || `INV-${payment?.id?.slice(0, 8).toUpperCase()}`;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-6 pt-5 pb-4 border-b flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Invoice Preview
            </DialogTitle>
            {payment && (
              <p className="text-sm text-muted-foreground mt-0.5 font-mono">{invoiceLabel}</p>
            )}
          </div>
          <div className="flex items-center gap-2 mr-8">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              disabled={downloading || loading}
              id="invoice-download-btn"
            >
              {downloading ? (
                <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-1.5" />
              )}
              {downloading ? 'Downloading…' : 'Download PDF'}
            </Button>
          </div>
        </DialogHeader>

        <div className="h-[70vh] bg-zinc-100 relative">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-100">
              <div className="w-10 h-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Generating invoice…</p>
            </div>
          )}
          {!loading && blobUrl && (
            <iframe
              src={blobUrl}
              title="Invoice Preview"
              className="w-full h-full border-0"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Payment Row ─────────────────────────────────────────────────────────────
interface PaymentRowProps {
  payment: Payment;
  onViewInvoice: (p: Payment) => void;
  onDownloadInvoice: (p: Payment) => void;
  downloadingId: string | null;
}

function PaymentRow({ payment, onViewInvoice, onDownloadInvoice, downloadingId }: PaymentRowProps) {
  const isDownloading = downloadingId === payment.id;
  const canInvoice = payment.status === 'COMPLETED';

  return (
    <div className="flex items-start justify-between p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors gap-4">
      {/* Left – icon + description */}
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${payment.status === 'COMPLETED'
            ? 'bg-emerald-100 text-emerald-600'
            : payment.status === 'PENDING' || payment.status === 'PROCESSING'
              ? 'bg-amber-100 text-amber-600'
              : payment.status === 'FAILED' || payment.status === 'CANCELLED'
                ? 'bg-red-100 text-red-600'
                : 'bg-zinc-100 text-zinc-500'
          }`}>
          {getStatusIcon(payment.status)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{getPaymentLabel(payment)}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <p className="text-xs text-muted-foreground">
              {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric'
              })}
            </p>
            <span className="text-muted-foreground/40">·</span>
            <p className="text-xs text-muted-foreground">{getPaymentMethodLabel(payment.paymentMethod)}</p>
            {payment.transactionId && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                  #{payment.transactionId.slice(-8)}
                </span>
              </>
            )}
            {payment.invoiceNumber && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="font-mono text-xs text-primary/70">{payment.invoiceNumber}</span>
              </>
            )}
          </div>
          {payment.discount > 0 && (
            <p className="text-xs text-emerald-600 mt-1">Saved ₹{payment.discount.toLocaleString()}</p>
          )}
        </div>
      </div>

      {/* Right – amount + actions */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <div className="text-right">
          <p className="font-bold text-foreground">₹{payment.finalAmount.toLocaleString()}</p>
          {payment.tax > 0 && (
            <p className="text-xs text-muted-foreground">incl. ₹{payment.tax.toFixed(2)} tax</p>
          )}
          <Badge variant="outline" className={`text-xs mt-1 inline-flex gap-1 ${getStatusColor(payment.status)}`}>
            {getStatusIcon(payment.status)}
            <span className="capitalize">{payment.status.toLowerCase().replace('_', ' ')}</span>
          </Badge>
        </div>

        {/* Invoice actions – only for COMPLETED payments */}
        {canInvoice && (
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs gap-1.5"
              onClick={() => onViewInvoice(payment)}
              id={`view-invoice-${payment.id}`}
            >
              <Eye className="h-3.5 w-3.5" />
              View
            </Button>
            <Button
              variant="default"
              size="sm"
              className="h-8 px-3 text-xs gap-1.5"
              onClick={() => onDownloadInvoice(payment)}
              disabled={isDownloading}
              id={`download-invoice-${payment.id}`}
            >
              {isDownloading
                ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                : <Download className="h-3.5 w-3.5" />}
              {isDownloading ? 'Saving…' : 'Invoice'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function PaymentsPage() {
  const { user, isAuthenticated } = useUser();
  const { toast } = useToast();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  // Invoice modal state
  const [invoicePayment, setInvoicePayment] = useState<Payment | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const [stats, setStats] = useState({
    totalPaid: 0,
    thisMonthPaid: 0,
    nextPaymentAmount: 0,
    nextPaymentDate: null as string | null,
    pendingCount: 0,
    completedCount: 0,
    failedCount: 0,
  });

  const fetchPaymentData = useCallback(async () => {
    setLoading(true);
    try {
      const [paymentsRes, subRes] = await Promise.allSettled([
        PaymentService.getUserPayments(),
        SubscriptionService.getUserSubscription(),
      ]);

      if (paymentsRes.status === 'fulfilled' && paymentsRes.value.success) {
        const v: any = paymentsRes.value;
        // Backend sends { data: payments[] } → apiRequest wraps →
        // { success, data: { data: payments[], pagination } }
        const inner = v?.data;
        const arr: Payment[] = Array.isArray(inner)
          ? inner
          : Array.isArray(inner?.data)
            ? inner.data
            : (inner?.payments || v?.payments || []);
        setPayments(arr);
      }

      if (subRes.status === 'fulfilled' && subRes.value.success) {
        const v: any = subRes.value;
        setSubscription(v?.subscription ?? v?.data?.subscription ?? v?.data ?? null);
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.error('Error fetching payment data:', err);
      toast({ title: 'Error', description: 'Failed to load payment data.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user && isAuthenticated && user.role === 'CUSTOMER') {
      fetchPaymentData();
    } else if (user && isAuthenticated) {
      setLoading(false);
    }
  }, [user, isAuthenticated, fetchPaymentData]);

  // Recalculate stats whenever data changes
  useEffect(() => {
    const completed = payments.filter(p => p.status === 'COMPLETED');
    const now = new Date();
    const thisMonth = completed.filter(p => {
      const d = new Date(p.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    setStats({
      totalPaid: completed.reduce((s, p) => s + p.finalAmount, 0),
      thisMonthPaid: thisMonth.reduce((s, p) => s + p.finalAmount, 0),
      nextPaymentAmount: subscription?.amount || 0,
      nextPaymentDate: subscription?.nextBillDate || null,
      completedCount: completed.length,
      pendingCount: payments.filter(p => p.status === 'PENDING' || p.status === 'PROCESSING').length,
      failedCount: payments.filter(p => p.status === 'FAILED' || p.status === 'CANCELLED').length,
    });
  }, [payments, subscription]);

  // ── Invoice actions ────────────────────────────────────────────────────────
  const handleViewInvoice = (payment: Payment) => {
    setInvoicePayment(payment);
    setInvoiceModalOpen(true);
  };

  const handleDownloadInvoice = async (payment: Payment) => {
    setDownloadingId(payment.id);
    try {
      await PaymentService.downloadInvoice(payment.id);
      toast({ title: '✅ Invoice Downloaded', description: `${payment.invoiceNumber || 'Invoice'} saved to your downloads.` });
    } catch (err: any) {
      toast({ title: 'Download Failed', description: err.message || 'Could not download invoice.', variant: 'destructive' });
    } finally {
      setDownloadingId(null);
    }
  };

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (loading) {
    return <DashboardLayout><PaymentsPageSkeleton /></DashboardLayout>;
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

  const completedPayments = payments.filter(p => p.status === 'COMPLETED');
  const pendingPayments = payments.filter(p => p.status === 'PENDING' || p.status === 'PROCESSING');
  const upcomingPayments = subscription?.nextBillDate
    ? [{
      id: subscription.id, date: subscription.nextBillDate, amount: subscription.amount,
      description: subscription.plan?.name ? `${subscription.plan.name} – Next Billing` : 'Subscription Payment'
    }]
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="fade-in">
          <h1 className="text-3xl font-bold text-foreground">Payment History</h1>
          <p className="text-muted-foreground mt-1">View billing history, invoices, and manage payments</p>
        </div>

        {/* ── Stats cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 slide-up">
          {[
            {
              label: 'Total Paid',
              value: `₹${stats.totalPaid.toLocaleString()}`,
              sub: `${stats.completedCount} completed`,
              icon: <TrendingUp className="h-5 w-5 text-emerald-500" />,
              color: 'bg-emerald-50 dark:bg-emerald-950/20'
            },
            {
              label: 'This Month',
              value: `₹${stats.thisMonthPaid.toLocaleString()}`,
              sub: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
              icon: <Calendar className="h-5 w-5 text-blue-500" />,
              color: 'bg-blue-50 dark:bg-blue-950/20'
            },
            {
              label: 'Next Payment',
              value: stats.nextPaymentAmount > 0 ? `₹${stats.nextPaymentAmount.toLocaleString()}` : 'N/A',
              sub: stats.nextPaymentDate
                ? `Due ${new Date(stats.nextPaymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`
                : 'No upcoming',
              icon: <Clock className="h-5 w-5 text-amber-500" />,
              color: 'bg-amber-50 dark:bg-amber-950/20'
            },
            {
              label: 'Invoices',
              value: completedPayments.length.toString(),
              sub: `${stats.failedCount} failed`,
              icon: <FileText className="h-5 w-5 text-violet-500" />,
              color: 'bg-violet-50 dark:bg-violet-950/20'
            },
          ].map(card => (
            <Card key={card.label} className="dashboard-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">{card.label}</span>
                  <div className={`w-9 h-9 rounded-lg ${card.color} flex items-center justify-center`}>
                    {card.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Upcoming Payments ── */}
        {(upcomingPayments.length > 0 || pendingPayments.length > 0) && (
          <Card className="dashboard-card slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Pending & Upcoming
              </CardTitle>
              <CardDescription>Payments awaiting processing or scheduled</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingPayments.map(up => (
                <div key={up.id} className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{up.description}</p>
                      <p className="text-xs text-muted-foreground">Due {new Date(up.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-foreground">₹{up.amount.toLocaleString()}</p>
                </div>
              ))}
              {pendingPayments.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{getPaymentLabel(p)}</p>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        {p.transactionId && ` · #${p.transactionId.slice(-6)}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">₹{p.finalAmount.toLocaleString()}</p>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(p.status)}`}>
                      {p.status.toLowerCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* ── Payment History with Invoices ── */}
        <Card className="dashboard-card slide-up">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                All Transactions
              </CardTitle>
              <CardDescription>Click "View" to preview or "Invoice" to download</CardDescription>
            </div>
            {payments.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {payments.length} transaction{payments.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map(payment => (
                  <PaymentRow
                    key={payment.id}
                    payment={payment}
                    onViewInvoice={handleViewInvoice}
                    onDownloadInvoice={handleDownloadInvoice}
                    downloadingId={downloadingId}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No payments yet</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Once you make a payment, your invoices and transaction history will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Billing Info (payment stats) ── */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
            <CardDescription>Overview of your billing activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-foreground mb-3">Billing Address</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">{user?.name || 'N/A'}</p>
                  <p>{user?.address || '—'}</p>
                  <p>{user?.phone || '—'}</p>
                  <p>{user?.email || '—'}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-3">Statistics</h4>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Completed Payments', value: stats.completedCount, cls: 'text-emerald-600' },
                    { label: 'Pending Payments', value: stats.pendingCount, cls: 'text-amber-600' },
                    { label: 'Failed Payments', value: stats.failedCount, cls: 'text-red-600' },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between items-center">
                      <span className="text-muted-foreground">{r.label}</span>
                      <span className={`font-semibold ${r.cls}`}>{r.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="text-muted-foreground">Success Rate</span>
                    <span className="font-semibold text-emerald-600">
                      {payments.length > 0
                        ? `${Math.round((stats.completedCount / payments.length) * 100)}%`
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Spent</span>
                    <span className="font-bold text-foreground">₹{stats.totalPaid.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Help card ── */}
        <Card className="dashboard-card slide-up bg-gradient-to-br from-primary/5 to-violet-500/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              Need Help with Payments?
            </CardTitle>
            <CardDescription>
              For billing queries, missing invoices, or refund requests, reach out to our support team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="btn-hero">Contact Billing Support</Button>
              <Button variant="outline">View FAQ</Button>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ── Invoice Preview Modal ── */}
      <InvoiceModal
        payment={invoicePayment}
        open={invoiceModalOpen}
        onClose={() => {
          setInvoiceModalOpen(false);
          setInvoicePayment(null);
        }}
      />
    </DashboardLayout>
  );
}