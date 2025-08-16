import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Calendar, CreditCard, CheckCircle, ArrowUpRight, Settings, Package, AlertCircle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { SubscriptionService, Subscription, SubscriptionPlan } from '@/services/subscriptionService';
import { PaymentService } from '@/services/paymentService';
import { BookingService } from '@/services/bookingService';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';


export default function SubscriptionPage() {
  const { user, isAuthenticated } = useUser();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    completedVisits: 0,
    totalHours: 0,
    averageRating: 0,
    costPerVisit: 0
  });

  useEffect(() => {
    if (user && isAuthenticated) {
      fetchSubscriptionData();
    }
  }, [user, isAuthenticated]);

  const fetchSubscriptionData = async () => {
    setLoading(true);
    try {
      // Fetch subscription and plans data in parallel
      const [subscriptionResponse, plansResponse, bookingsResponse] = await Promise.allSettled([
        SubscriptionService.getUserSubscription(),
        SubscriptionService.getSubscriptionPlans(),
        BookingService.getUserBookings()
      ]);

      // Handle subscription data - backend returns subscription object directly
      if (subscriptionResponse.status === 'fulfilled' && subscriptionResponse.value.success) {
        // Backend returns subscription directly without wrapping
        const subscriptionData = subscriptionResponse.value.data || subscriptionResponse.value.subscription || null;
        setSubscription(subscriptionData);
      } else if (subscriptionResponse.status === 'rejected') {
        // No subscription found - normal for users without active subscription
        console.log('No active subscription found');
        setSubscription(null);
      }

      // Handle plans data - backend returns ServicePlan array
      if (plansResponse.status === 'fulfilled' && plansResponse.value.success) {
        // Backend returns ServicePlan array directly
        const plans = Array.isArray(plansResponse.value.data) ? 
          plansResponse.value.data : 
          plansResponse.value.data?.plans || 
          plansResponse.value.plans || [];
        
        // Filter out lower-tier plans (remove downgrade options) if user has subscription
        const currentPlanPrice = subscription?.amount || 0;
        const upgradeOnlyPlans = plans.filter(plan => 
          !subscription || plan.finalPrice >= currentPlanPrice
        );
        setAvailablePlans(upgradeOnlyPlans);
      }

      // Calculate stats from bookings
      if (bookingsResponse.status === 'fulfilled' && bookingsResponse.value.success) {
        // Backend returns bookings array directly or wrapped
        const bookings = Array.isArray(bookingsResponse.value.data) ? 
          bookingsResponse.value.data : 
          bookingsResponse.value.data?.bookings || 
          bookingsResponse.value.bookings || [];
          
        const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
        const completedVisits = completedBookings.length;
        // Convert minutes to hours for display
        const totalHours = Math.round(completedBookings.reduce((sum, b) => sum + (b.estimatedDuration || 180), 0) / 60);
        const totalCost = completedBookings.reduce((sum, b) => sum + (b.finalAmount || b.totalAmount || 0), 0);
        const costPerVisit = completedVisits > 0 ? totalCost / completedVisits : 0;
        
        setStats({
          completedVisits,
          totalHours,
          averageRating: 4.9, // This would come from a ratings API
          costPerVisit
        });
      }

    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription data. Please try refreshing.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoRenewal = async () => {
    if (!subscription) return;
    
    try {
      await SubscriptionService.updateSubscriptionSettings({
        autoRenewal: !subscription.autoRenew
      });
      
      setSubscription(prev => prev ? {
        ...prev,
        autoRenew: !prev.autoRenew
      } : null);
      
      toast({
        title: 'Success',
        description: `Auto-renewal ${!subscription.autoRenew ? 'enabled' : 'disabled'} successfully.`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update auto-renewal setting.',
        variant: 'destructive'
      });
    }
  };

  const handleUpgradePlan = async (planId: string) => {
    try {
      await SubscriptionService.subscribeToPlan({
        planId,
        paymentMethod: 'RAZORPAY',
        autoRenewal: subscription?.autoRenew || true
      });
      
      toast({
        title: 'Success',
        description: 'Plan upgrade initiated. You will be redirected to payment.'
      });
      
      // Refresh subscription data
      await fetchSubscriptionData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upgrade plan. Please try again.',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || !isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="text-center p-8">
          <p className="text-muted-foreground">Please log in to view your subscription details.</p>
        </div>
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="fade-in">
          <h1 className="text-3xl font-bold text-foreground">Subscription Details</h1>
          <p className="text-muted-foreground mt-2">
            Manage your cleaning service subscription and billing preferences
          </p>
        </div>

        {/* Current Plan Overview */}
        {subscription ? (
          <Card className="dashboard-card slide-up bg-gradient-feature">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Crown className="h-6 w-6 text-primary" />
                  <CardTitle className="text-xl uppercase font-semibold">
                    Current Plan: {subscription.plan?.id || 'Subscription Plan'}
                  </CardTitle>
                </div>
                <Badge variant={subscription.status === 'ACTIVE' ? 'default' : 'destructive'}>
                  {subscription.status}
                </Badge>
              </div>
              <CardDescription>
                {subscription.status === 'ACTIVE' 
                  ? 'Your subscription is active and running smoothly'
                  : `Your subscription is ${subscription.status.toLowerCase()}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    ₹{subscription.amount.toLocaleString()}
                  </div>
                  <div className="text-muted-foreground">/{subscription.plan?.duration || 1} month{(subscription.plan?.duration || 1) > 1 ? 's' : ''}</div>
                  {subscription.discount > 0 && (
                    <div className="text-xs text-success">-₹{subscription.discount.toLocaleString()} discount</div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {subscription.nextBillDate 
                      ? new Date(subscription.nextBillDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : new Date(subscription.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    }
                  </div>
                  <div className="text-muted-foreground">Next billing date</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-success">{stats.completedVisits}</div>
                  <div className="text-muted-foreground">Completed visits</div>
                  <div className="flex gap-2 justify-center mt-2">
                    <Link to="/payments">
                      <Button variant="outline" size="sm">View Bills</Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                      Download
                    </Button>
                  </div>
                </div>
              </div>

              {subscription.plan?.features && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Plan Features</h4>
                    <ul className="space-y-2">
                      {subscription.plan.features.slice(0, Math.ceil(subscription.plan.features.length / 2)).map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Additional Benefits</h4>
                    <ul className="space-y-2">
                      {subscription.plan.features.slice(Math.ceil(subscription.plan.features.length / 2)).map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Subscription Period Information */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Subscription Period</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Start Date:</p>
                    <p className="font-medium">{new Date(subscription.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">End Date:</p>
                    <p className="font-medium">{new Date(subscription.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-muted-foreground text-sm">Service Type:</p>
                  <p className="font-medium">{subscription.plan?.serviceId || 'Premium Cleaning Service'}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border">
                <Link to="/payments">
                  <Button variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Billing History
                  </Button>
                </Link>
                <Button variant="outline" onClick={() => {
                  toast({
                    title: 'Feature Coming Soon',
                    description: 'Subscription pause feature will be available soon.'
                  });
                }}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Pause Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="dashboard-card slide-up">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-6 w-6 text-warning" />
                <CardTitle className="text-xl">No Active Subscription</CardTitle>
              </div>
              <CardDescription>You don't have an active subscription plan</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Get Started with a Plan</h3>
              <p className="text-muted-foreground mb-6">
                Choose from our flexible subscription plans to start enjoying professional cleaning services.
              </p>
              <Link to="/">
                <Button className="btn-hero">
                  <Crown className="h-4 w-4 mr-2" />
                  View Available Plans
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Billing Information */}
        {subscription && (
          <Card className="dashboard-card slide-up">
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Payment method and billing preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Payment Method</p>
                    <p className="text-sm text-muted-foreground">Razorpay Gateway</p>
                  </div>
                </div>
                <Link to="/payments">
                  <Button variant="outline" size="sm">View History</Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Auto-Renewal</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {subscription.autoRenew ? 'Enabled' : 'Disabled'} 
                    {subscription.nextBillDate && (
                      <span> - Next renewal on {new Date(subscription.nextBillDate).toLocaleDateString()}</span>
                    )}
                  </p>
                  <Button variant="outline" size="sm" onClick={handleToggleAutoRenewal}>
                    {subscription.autoRenew ? 'Disable' : 'Enable'} Auto-Renewal
                  </Button>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Billing Address</h4>
                  <div className="text-sm text-muted-foreground mb-3">
                    {user?.address ? (
                      <p>{user.address}</p>
                    ) : (
                      <p>No billing address on file</p>
                    )}
                  </div>
                  <Link to="/profile">
                    <Button variant="outline" size="sm">Update Address</Button>
                  </Link>
                </div>
              </div>

              <div className="p-4 bg-gradient-feature rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Payment Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Payment Status:</p>
                    <Badge variant={subscription.status === 'ACTIVE' ? 'default' : 'destructive'}>
                      {subscription.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Amount:</p>
                    <p className="font-bold text-lg">₹{subscription.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Subscription ID:</p>
                    <p className="font-mono text-xs">{subscription.id}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Plans - Upgrade Only */}
        {availablePlans.length > 0 && (
          <Card className="dashboard-card slide-up">
            <CardHeader>
              <CardTitle>Upgrade Your Plan</CardTitle>
              <CardDescription>Enhance your cleaning service with a higher-tier plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {availablePlans.map((plan) => {
                  const isCurrent = subscription?.plan?.id === plan.id;
                  return (
                    <div
                      key={plan.id}
                      className={`relative p-6 rounded-xl border ${
                        isCurrent ? 'border-primary bg-primary/5' : 'border-border bg-card'
                      } transition-all hover:shadow-medium`}
                    >
                      {isCurrent && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-primary text-primary-foreground">Current Plan</Badge>
                        </div>
                      )}

                      <div className="text-center mb-4">
                        <h3 className="text-xl font-bold text-foreground uppercase">{plan.id}</h3>
                        <div className="flex items-baseline justify-center mt-2">
                          <span className="text-3xl font-bold text-foreground">₹{plan.finalPrice?.toLocaleString() || plan.basePrice?.toLocaleString() || '0'}</span>
                          <span className="text-muted-foreground ml-1">/{plan.duration} month{plan.duration > 1 ? 's' : ''}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                      </div>

                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-success mr-2 flex-shrink-0" />
                          <span className="text-muted-foreground">{plan.sessionsPerWeek} sessions per week</span>
                        </li>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-success mr-2 flex-shrink-0" />
                          <span className="text-muted-foreground">{plan.sessionsPerMonth} sessions per month</span>
                        </li>
                        {plan.discountPercent > 0 && (
                          <li className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-success mr-2 flex-shrink-0" />
                            <span className="text-muted-foreground">{plan.discountPercent}% discount applied</span>
                          </li>
                        )}
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-success mr-2 flex-shrink-0" />
                          <span className="text-muted-foreground">Professional cleaning service</span>
                        </li>
                      </ul>

                      <Button
                        className={`w-full ${isCurrent ? 'opacity-50 cursor-not-allowed' : ''}`}
                        variant={isCurrent ? 'outline' : 'default'}
                        disabled={isCurrent}
                        onClick={() => !isCurrent && handleUpgradePlan(plan.id)}
                      >
                        {isCurrent ? 'Current Plan' : (
                          <>
                            Upgrade <ArrowUpRight className="h-4 w-4 ml-1" />
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
              {availablePlans.length === 0 && subscription && (
                <div className="text-center py-8">
                  <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">You're on the highest plan!</h3>
                  <p className="text-muted-foreground">
                    You're already enjoying our premium service with the best available plan.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Usage Statistics */}
        {subscription && (
          <Card className="dashboard-card slide-up">
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
              <CardDescription>Your cleaning service usage and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.completedVisits}</div>
                  <div className="text-sm text-muted-foreground">Visits Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.totalHours}</div>
                  <div className="text-sm text-muted-foreground">Hours of Service</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.averageRating}</div>
                  <div className="text-sm text-muted-foreground">Average Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    ₹{stats.costPerVisit > 0 ? Math.round(stats.costPerVisit).toLocaleString() : '0'}
                  </div>
                  <div className="text-sm text-muted-foreground">Cost per Visit</div>
                </div>
              </div>
              
              {stats.completedVisits === 0 && (
                <div className="text-center mt-6 p-4 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground text-sm">
                    Statistics will appear here once you start using our services.
                  </p>
                  <Link to="/bookings">
                    <Button variant="outline" size="sm" className="mt-2">
                      Book Your First Service
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}