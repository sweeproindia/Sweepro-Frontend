import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Download, Calendar, CheckCircle, X, Clock } from 'lucide-react';

const paymentHistory = [
  {
    id: 'inv_001',
    date: '2024-11-15',
    amount: '₹3,499',
    description: 'Standard Plan - November 2024',
    status: 'paid',
    method: 'Credit Card (••4242)',
    invoiceUrl: '#'
  },
  {
    id: 'inv_002',
    date: '2024-10-15',
    amount: '₹3,499',
    description: 'Standard Plan - October 2024',
    status: 'paid',
    method: 'Credit Card (••4242)',
    invoiceUrl: '#'
  },
  {
    id: 'inv_003',
    date: '2024-09-15',
    amount: '₹3,499',
    description: 'Standard Plan - September 2024',
    status: 'paid',
    method: 'Credit Card (••4242)',
    invoiceUrl: '#'
  },
  {
    id: 'inv_004',
    date: '2024-08-15',
    amount: '₹1,999',
    description: 'Basic Plan - August 2024',
    status: 'paid',
    method: 'UPI',
    invoiceUrl: '#'
  }
];

const upcomingPayments = [
  {
    id: 'upcoming_001',
    date: '2024-12-15',
    amount: '₹3,499',
    description: 'Standard Plan - December 2024',
    status: 'pending'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-success text-success-foreground';
    case 'pending':
      return 'bg-warning text-warning-foreground';
    case 'failed':
      return 'bg-destructive text-destructive-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'paid':
      return <CheckCircle className="h-4 w-4" />;
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'failed':
      return <X className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

export default function PaymentsPage() {
  const totalPaid = paymentHistory.reduce((sum, payment) => {
    return sum + parseInt(payment.amount.replace('₹', '').replace(',', ''));
  }, 0);

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

        {/* Payment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 slide-up">
          <Card className="dashboard-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₹{totalPaid.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₹3,499</div>
              <p className="text-xs text-muted-foreground mt-1">November 2024</p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Next Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₹3,499</div>
              <p className="text-xs text-muted-foreground mt-1">Due Dec 15, 2024</p>
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
                  <p className="font-semibold text-foreground">{payment.amount}</p>
                  <Badge className={getStatusColor(payment.status)}>
                    {getStatusIcon(payment.status)}
                    <span className="ml-1 capitalize">{payment.status}</span>
                  </Badge>
                </div>
              </div>
            ))}
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
            <div className="space-y-4">
              {paymentHistory.map((payment, index) => (
                <div 
                  key={payment.id} 
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{payment.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.date).toLocaleDateString()} • {payment.method}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{payment.amount}</p>
                      <Badge className={getStatusColor(payment.status)}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1 capitalize">{payment.status}</span>
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Invoice
                    </Button>
                  </div>
                </div>
              ))}
            </div>
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
                  <p>John Doe</p>
                  <p>123 Main Street</p>
                  <p>Apartment 4B</p>
                  <p>Mumbai, Maharashtra 400001</p>
                  <p>India</p>
                </div>
                <Button variant="outline" size="sm" className="mt-3">
                  Update Address
                </Button>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-3">Tax Information</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>GST Number: 27XXXXX1234X1Z5</p>
                  <p>PAN: ABCDE1234F</p>
                </div>
                <Button variant="outline" size="sm" className="mt-3">
                  Update Tax Info
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