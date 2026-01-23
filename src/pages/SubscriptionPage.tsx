import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Crown,
  Calendar,
  CreditCard,
  AlertCircle,
  Package,
  Zap,
  Shield,
  Star,
  CheckCircle,
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { SubscriptionService, Subscription, SubscriptionPlan } from '@/services/subscriptionService';
import { BookingService } from '@/services/bookingService';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookingButton } from '@/components/buttons/BookingButton';
import { useBookingForm, withBookingForm } from '@/contexts/BookingFormContext';
import SubscriptionSkeleton from '@/components/subscription/SubscriptionSkeleton';

// Enhanced Plan Interface
interface EnhancedSubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  features: string[];
  popular?: boolean;
  discount?: number;
  originalPrice?: number;
  icon: any;
  gradient: string;
  finalPrice?: number;
  sessionsPerWeek?: number;
  sessionsPerMonth?: number;
  discountPercent?: number;
}

// Beautiful animated subscription plans with exact gradients from PricingSection
const enhancedPlans: EnhancedSubscriptionPlan[] = [
  {
    id: 'standard',
    name: 'Sweepro Touch',
    price: 1499,
    finalPrice: 1499,
    duration: 'month',
    description:
      'A thoughtfully designed premium cleaning plan that offers reliable, efficient service for a smooth and hassle-free experience.',
    features: [
      'Bi-weekly deep cleaning',
      'Premium cleaning supplies',
      '3-hour comprehensive service',
      'All rooms included',
      'Appliance cleaning',
      'Window cleaning',
      'Priority scheduling',
    ],
    popular: true,
    icon: Zap,
    gradient: 'from-[#bcdcff] to-[#a9cfff]',
    sessionsPerWeek: 2,
    sessionsPerMonth: 8,
    discountPercent: 0,
  },
  {
    id: 'premium',
    name: 'Sweepro Lux',
    price: 2499,
    finalPrice: 1999,
    originalPrice: 2499,
    duration: 'month',
    description:
      'A premium upgrade that delivers superior care, greater attention to detail, and a more personalized cleaning experience.',
    features: [
      'Weekly premium cleaning',
      'Luxury cleaning supplies',
      '4-hour detailed service',
      'All rooms + outdoor areas',
      'Deep carpet cleaning',
      'Furniture polishing',
      '24/7 support',
      'Free cancellation',
    ],
    discount: 20,
    icon: Crown,
    gradient: 'from-[#1800ad] to-[#1800ad]',
    sessionsPerWeek: 4,
    sessionsPerMonth: 16,
    discountPercent: 20,
  },
];

function SubscriptionPage() {
  const { user, isAuthenticated } = useUser();
  const location = useLocation() as { state?: any };
  const { toast } = useToast();
  const { openBookingForm } = useBookingForm();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    completedVisits: 0,
    totalHours: 0,
    averageRating: 0,
    costPerVisit: 0,
  });

  const lastPaymentFromNav = (location.state?.payment as any) || null;
  const propertyConfigFromNav = (location.state?.propertyConfig as any) || null;

  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (user && isAuthenticated) {
      fetchSubscriptionData();
    }
  }, [user, isAuthenticated]);

  const fetchSubscriptionData = async () => {
    setLoading(true);
    try {
      const [subscriptionResponse, plansResponse, bookingsResponse] = await Promise.allSettled([
        SubscriptionService.getUserSubscription(),
        SubscriptionService.getSubscriptionPlans(),
        BookingService.getUserBookings(),
      ]);

      if (subscriptionResponse.status === 'fulfilled' && subscriptionResponse.value.success) {
        const subscriptionData =
          (subscriptionResponse.value as any).subscription ||
          (subscriptionResponse.value as any).data?.subscription ||
          null;
        setSubscription(subscriptionData as Subscription | null);
      } else {
        setSubscription(null);
      }

      if (plansResponse.status === 'fulfilled' && plansResponse.value.success) {
        const plansData = (plansResponse.value as any).data;
        const plans = Array.isArray(plansData) ? plansData : plansData?.plans || [];
        setAvailablePlans(plans as SubscriptionPlan[]);
      }

      if (bookingsResponse.status === 'fulfilled' && bookingsResponse.value.success) {
        const bookingsData = (bookingsResponse.value as any).data;
        const bookings = Array.isArray(bookingsData) ? bookingsData : bookingsData?.bookings || [];

        const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');
        const completedVisits = completedBookings.length;
        const totalHours = Math.round(
          completedBookings.reduce((sum, b) => sum + (b.estimatedDuration || 180), 0) / 60
        );
        const totalCost = completedBookings.reduce(
          (sum, b) => sum + (b.finalAmount || b.totalAmount || 0),
          0
        );
        const costPerVisit = completedVisits > 0 ? totalCost / completedVisits : 0;

        setStats({
          completedVisits,
          totalHours,
          averageRating: 4.9,
          costPerVisit,
        });
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription data. Please try refreshing.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (planId: string) => {
    const slug = planId === 'standard' ? 'sweeprotouch' : planId === 'premium' ? 'sweeprolux' : planId;
    navigate(`/subscription/${slug}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <SubscriptionSkeleton />
      </DashboardLayout>
    );
  }

  if (!user || !isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="text-center p-8">
          <p className="text-muted-foreground">
            Please log in to view your subscription details.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {location.state?.fromPayment && (
          <Card className="border border-green-200 bg-green-50/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                Subscription Payment Successful
              </CardTitle>
              <CardDescription className="text-green-700">
                Your subscription has been updated. Amount paid: ₹
                {Number(location.state.amount || 0).toFixed(0)}
                {location.state.razorpayOrderId && (
                  <span className="block text-xs text-green-700 mt-1">
                    Razorpay Order ID: {location.state.razorpayOrderId}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
          </Card>
        )}
        <div className="fade-in">
          <h1 className="text-3xl font-bold text-foreground">Subscription Details</h1>
          <p className="text-muted-foreground mt-2">
            Manage your cleaning service subscription and billing preferences
          </p>
        </div>

        {/* Current Subscription Details - Full Width */}
        {subscription ? (
          <>
            <Card className="dashboard-card slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Subscription Plan
                </CardTitle>
                <CardDescription>Your current subscription details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-feature rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lg">{subscription.plan?.name || 'Current Plan'}</h4>
                      <Badge variant={subscription.status === 'ACTIVE' ? 'default' : 'destructive'}>
                        {subscription.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">
                      {subscription.plan?.description || 'Premium cleaning services'}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Amount:</span>
                        <p className="text-lg font-bold text-primary">₹{subscription.amount.toLocaleString()}</p>
                        {subscription.discount > 0 && (
                          <p className="text-xs text-success">-₹{subscription.discount.toLocaleString()} discount</p>
                        )}
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span>
                        <p>{subscription.plan?.duration || 1} month{(subscription.plan?.duration || 1) > 1 ? 's' : ''}</p>
                        <p className="text-xs text-muted-foreground">{subscription.billingCycle.toLowerCase()} billing</p>
                      </div>
                      <div>
                        <span className="font-medium">Sessions:</span>
                        <p>{subscription.plan?.sessionsPerWeek || 0}/week</p>
                        <p className="text-xs text-muted-foreground">{subscription.plan?.sessionsPerMonth || 0}/month</p>
                      </div>
                      <div>
                        <span className="font-medium">Started:</span>
                        <p>{new Date(subscription.startDate).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">Expires: {new Date(subscription.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {subscription.nextBillDate && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Next Billing:</span>
                          <span className="text-sm font-bold">
                            {new Date(subscription.nextBillDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm font-medium">Auto Renewal:</span>
                          <Badge variant={subscription.autoRenew ? 'default' : 'outline'}>
                            {subscription.autoRenew ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button className="w-full" variant="outline">
                      Manage Plan
                    </Button>
                    <Button className="w-full" variant="outline">
                      View History
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Payment card when redirected from payment */}
            {location.state?.fromPayment && lastPaymentFromNav && (
              <Card className="dashboard-card slide-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Recent Subscription Payment
                  </CardTitle>
                  <CardDescription>
                    Details of your latest subscription payment via Razorpay
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Amount Paid</p>
                      <p className="text-xl font-bold text-primary">
                        ₹
                        {(
                          lastPaymentFromNav.finalAmount ??
                          lastPaymentFromNav.amount ??
                          location.state.amount ?? 0
                        )
                          .toFixed?.(0) ??
                          Number(
                            lastPaymentFromNav.finalAmount ||
                              lastPaymentFromNav.amount ||
                              location.state.amount ||
                              0
                          ).toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      <Badge
                        variant={
                          lastPaymentFromNav.status === 'COMPLETED'
                            ? 'default'
                            : 'outline'
                        }
                        className={
                          lastPaymentFromNav.status === 'COMPLETED'
                            ? 'bg-green-600 text-white'
                            : ''
                        }
                      >
                        {lastPaymentFromNav.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Razorpay Payment ID</p>
                      <p className="font-mono text-xs break-all">
                        {lastPaymentFromNav.gatewayResponse?.id || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Razorpay Order ID</p>
                      <p className="font-mono text-xs break-all">
                        {location.state.razorpayOrderId ||
                          lastPaymentFromNav.transactionId ||
                          'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Plan Features Card */}
            <Card className="dashboard-card slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Plan Features
                </CardTitle>
                <CardDescription>What's included in your subscription</CardDescription>
              </CardHeader>
              <CardContent>
                {subscription && subscription.plan ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Sessions Per Week</p>
                        <p className="text-2xl font-bold text-primary">{subscription.plan.sessionsPerWeek || 0}</p>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Sessions Per Month</p>
                        <p className="text-2xl font-bold text-primary">{subscription.plan.sessionsPerMonth || 0}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Included Features:</h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-foreground">Professional cleaning services</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-foreground">{subscription.plan.sessionsPerMonth || 0} sessions per month</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-foreground">Dedicated maid assignment</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-foreground">Priority customer support</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-foreground">Flexible scheduling</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Plan Duration:</span>
                        <Badge variant="outline">{subscription.plan.duration || 1} month{(subscription.plan.duration || 1) > 1 ? 's' : ''}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Billing Cycle:</span>
                        <Badge variant="secondary">{subscription.billingCycle}</Badge>
                      </div>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Property configuration used for pricing (from Review Payment) */}
            {location.state?.fromPayment && propertyConfigFromNav && (
              <Card className="dashboard-card slide-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Property Configuration Used for Pricing
                  </CardTitle>
                  <CardDescription>
                    These details were used to calculate your subscription amount.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Property Type</p>
                      <p className="font-medium capitalize">
                        {propertyConfigFromNav.propertyType || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Configuration</p>
                      <p className="font-medium">
                        {propertyConfigFromNav.bhkType?.toUpperCase() || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Approx. Size</p>
                      <p className="font-medium">
                        {propertyConfigFromNav.squareFeet || 0} sq ft
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Service Start Date</p>
                      <p className="font-medium">
                        {propertyConfigFromNav.startDate
                          ? new Date(
                              propertyConfigFromNav.startDate
                            ).toLocaleDateString()
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Preferred Time Slot</p>
                      <p className="font-medium">
                        {propertyConfigFromNav.timeSlot || '—'}
                      </p>
                    </div>
                  </div>

                  <div className="text-sm mb-4">
                    <p className="text-xs text-muted-foreground mb-1">Service Address</p>
                    <p className="font-medium break-words">
                      {[
                        propertyConfigFromNav.addressLine,
                        propertyConfigFromNav.locality,
                        propertyConfigFromNav.city,
                        propertyConfigFromNav.state,
                        propertyConfigFromNav.pincode,
                      ]
                        .filter(Boolean)
                        .join(', ') ||
                        propertyConfigFromNav.address ||
                        '—'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Base Plan Amount (before GST)</p>
                      <p className="font-semibold">
                        ₹
                        {Number(
                          propertyConfigFromNav.finalTotalPrice || 0
                        ).toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Paid Amount (with GST)</p>
                      <p className="font-semibold text-primary">
                        ₹{Number(location.state.amount || 0).toFixed(0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card className="dashboard-card slide-up">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-6 w-6 text-warning" />
                <CardTitle className="text-xl">No Active Subscription</CardTitle>
              </div>
              <CardDescription>
                You don't have an active subscription plan
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Get Started with a Plan
              </h3>
              <p className="text-muted-foreground mb-6">
                Choose from our flexible subscription plans to start enjoying professional
                cleaning services.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Plans Section with EXACT PricingSection Glow Effects */}
        <div className="relative py-16 bg-gradient-to-br from-background via-muted/30 to-background rounded-3xl border border-border/50 shadow-sm overflow-hidden">
          <div className="relative z-10 px-8">
            <div
              className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
            >
              <h2 className="text-5xl font-black bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-4 tracking-tight">
                {subscription ? 'Upgrade Your Plan' : 'Choose Your Cleaning Plan'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
              {enhancedPlans.map((plan, index) => {
                const IconComponent = plan.icon;
                const isCurrent = subscription?.plan?.id === plan.id;

                return (
                  <div
                    key={plan.id}
                    className={`transform transition-all duration-700 ${isVisible
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-20 opacity-0'
                      }`}
                    style={{ transitionDelay: `${index * 200}ms` }}
                    onMouseEnter={() => setHoveredCard(plan.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {/* EXACT CARD DESIGN WITH GLOW EFFECTS FROM PRICING SECTION */}
                    <Card
                      className={`relative overflow-hidden rounded-3xl border-0 bg-gradient-to-br ${
                        plan.gradient
                      } shadow-2xl ring-2 ring-white/10 transition-all duration-700 will-change-transform h-[420px] ${
                        hoveredCard === plan.id
                          ? `scale-[1.06] -translate-y-2 ring-white/40 ${
                              plan.id === 'standard'
                                ? 'shadow-[0_35px_90px_-30px_rgba(80,140,255,0.65)]'
                                : 'shadow-[0_35px_90px_-30px_rgba(24,0,173,0.55)]'
                            }`
                          : `${
                              plan.id === 'standard'
                                ? 'hover:shadow-[0_30px_80px_-35px_rgba(80,140,255,0.55)]'
                                : 'hover:shadow-[0_30px_80px_-35px_rgba(24,0,173,0.5)]'
                            } hover:scale-[1.03] hover:-translate-y-1`
                      } ${isCurrent ? 'ring-yellow-400/50' : ''}`}
                    >
                                           {/* Current Plan Badge */}
                      {isCurrent && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                          <Badge className="bg-primary text-primary-foreground font-bold">
                            Current Plan
                          </Badge>
                        </div>
                      )}

                      <div className="relative h-full flex flex-col">
                        {/* EXACT SHINE EFFECT FROM PRICING SECTION */}
                        <div
                          className={`absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-500 ${
                            hoveredCard === plan.id ? 'opacity-100' : ''
                          } bg-[radial-gradient(900px_circle_at_25%_0%,rgba(255,255,255,0.55),transparent_55%)]`}
                        />

                        <div
                          className={`absolute -inset-y-16 -left-1/2 w-[200%] pointer-events-none bg-gradient-to-r from-transparent via-white/55 to-transparent blur-md mix-blend-overlay opacity-0 ${
                            hoveredCard === plan.id ? 'animate-card-shine' : ''
                          }`}
                        />

                        <CardHeader className="text-center pt-12 relative z-10">
                          <div className="flex justify-center mb-6">
                            {/* EXACT ICON WITH GLOW EFFECTS FROM PRICING SECTION */}
                            <div
                              className="relative p-4 rounded-2xl ring-4 ring-white/20 shadow-xl transition-transform duration-300 group-hover:scale-110"
                              style={{
                                background:
                                  plan.id === 'standard'
                                    ? 'linear-gradient(135deg,#ffffff,#eaf3ff)'
                                    : 'linear-gradient(135deg,#1800ad,#1800ad)',
                              }}
                            >
                              <IconComponent
                                className={`h-8 w-8 ${
                                  plan.id === 'standard' ? 'text-slate-700' : 'text-white'
                                } drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]`}
                              />
                            </div>
                          </div>

                          <CardTitle
                            className={`text-3xl font-bold mb-3 group-hover:scale-105 transition-transform duration-300 ${
                              plan.id === 'standard' ? 'text-black' : 'text-white'
                            }`}
                          >
                            {plan.name}
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="px-8 pb-12 space-y-6 relative z-10 flex-1 flex flex-col justify-between">
                          <p
                            className={`text-lg text-center ${
                              plan.id === 'standard' ? 'text-black' : 'text-white/90'
                            }`}
                          >
                            {plan.description}
                          </p>

                          <div className="flex justify-center gap-4">
                            <Button
                              className={`rounded-full px-6 !bg-white hover:!bg-[#eeebe3] ${
                                plan.id === 'premium' ? 'text-[#1800ad]' : 'text-slate-900'
                              }`}
                              onClick={() => handlePlanSelect(plan.id)}
                            >
                              Learn More
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Usage Statistics */}
        {subscription && (
          <Card className="dashboard-card slide-up">
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
              <CardDescription>
                Your cleaning service usage and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {stats.completedVisits}
                  </div>
                  <div className="text-sm text-muted-foreground">Visits Completed</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {stats.totalHours}
                  </div>
                  <div className="text-sm text-muted-foreground">Hours of Service</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {stats.averageRating}
                  </div>
                  <div className="text-sm text-muted-foreground">Average Rating</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    ₹
                    {stats.costPerVisit > 0
                      ? Math.round(stats.costPerVisit).toLocaleString()
                      : '0'}
                  </div>
                  <div className="text-sm text-muted-foreground">Cost per Visit</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* EXACT CSS FROM PRICING SECTION */}
      <style>{`
        @keyframes card-shine {
          0% {
            transform: translateX(-120%) skewX(-12deg);
            opacity: 0;
          }
          15% {
            opacity: 0.95;
          }
          55% {
            opacity: 0.95;
          }
          100% {
            transform: translateX(120%) skewX(-12deg);
            opacity: 0;
          }
        }
        .animate-card-shine {
          animation: card-shine 1.8s ease-in-out infinite;
        }
      `}</style>
    </DashboardLayout>
  );
}

export default withBookingForm(SubscriptionPage);