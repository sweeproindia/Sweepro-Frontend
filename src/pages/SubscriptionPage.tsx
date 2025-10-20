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
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { SubscriptionService, Subscription, SubscriptionPlan } from '@/services/subscriptionService';
import { BookingService } from '@/services/bookingService';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookingButton } from '@/components/buttons/BookingButton';
import { useBookingForm, withBookingForm } from '@/contexts/BookingFormContext';

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
      'A premium silver plan for medium-sized homes. Enjoy enhanced cleaning and priority service.',
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
    gradient: 'from-[#C0C0C0] to-[#E0E0E0]', // EXACT SILVER GRADIENT
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
      'Ultimate cleaning experience for large homes and villas with luxury service.',
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
    gradient: 'from-yellow-400 to-yellow-700', // EXACT GOLD GRADIENT
    sessionsPerWeek: 4,
    sessionsPerMonth: 16,
    discountPercent: 20,
  },
];

function SubscriptionPage() {
  const { user, isAuthenticated } = useUser();
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

  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animateCounters, setAnimateCounters] = useState(false);
  const hasAnimated = useRef(false); // Track if counters have animated

  useEffect(() => {
    setIsVisible(true);
    // Only animate counters once when component first mounts
    if (!hasAnimated.current) {
      const timer = setTimeout(() => {
        setAnimateCounters(true);
        hasAnimated.current = true;
      }, 800);
      return () => clearTimeout(timer);
    }
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
          subscriptionResponse.value.data ||
          subscriptionResponse.value.subscription ||
          null;
        setSubscription(subscriptionData);
      } else {
        setSubscription(null);
      }

      if (plansResponse.status === 'fulfilled' && plansResponse.value.success) {
        const plans = Array.isArray(plansResponse.value.data)
          ? plansResponse.value.data
          : plansResponse.value.data?.plans ||
          plansResponse.value.plans ||
          [];
        setAvailablePlans(plans);
      }

      if (bookingsResponse.status === 'fulfilled' && bookingsResponse.value.success) {
        const bookings = Array.isArray(bookingsResponse.value.data)
          ? bookingsResponse.value.data
          : bookingsResponse.value.data?.bookings ||
          bookingsResponse.value.bookings ||
          [];

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
    navigate(`/subscription/${planId}`);
  };

  // Counter component that animates only once
  const Counter = ({
    end,
    duration = 2000,
  }: {
    end: string | number;
    duration?: number;
  }) => {
    const [count, setCount] = useState<string | number>(0);
    const hasCounterAnimated = useRef(false);

    useEffect(() => {
      // Only animate if counters are enabled and haven't animated before
      if (!animateCounters || hasCounterAnimated.current) return;

      hasCounterAnimated.current = true;
      let startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);

        if (typeof end === 'string') {
          if (progress === 1) setCount(end);
          else {
            const numericValue = parseFloat(end.replace(/[^0-9.]/g, ''));
            const currentValue = Math.floor(numericValue * easeOutQuart);
            setCount(end.includes('%') ? `${currentValue}%` : `${currentValue}K+`);
          }
        } else {
          setCount(Math.floor(end * easeOutQuart));
        }

        if (progress < 1) requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    }, [animateCounters, end, duration]);

    return <span>{count}</span>;
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
        <div className="fade-in">
          <h1 className="text-3xl font-bold text-foreground">Subscription Details</h1>
          <p className="text-muted-foreground mt-2">
            Manage your cleaning service subscription and billing preferences
          </p>
        </div>

        {/* Current Plan */}
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
                <Badge
                  variant={subscription.status === 'ACTIVE' ? 'default' : 'destructive'}
                >
                  {subscription.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center mt-4">
                <div className="text-3xl font-bold text-primary">
                  ₹{subscription.amount.toLocaleString()}
                </div>
                <div className="text-muted-foreground">
                  / {subscription.plan?.duration || 1} month
                </div>
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
                    <Card className={`relative group overflow-hidden border-0 rounded-3xl bg-gradient-to-br ${plan.gradient} backdrop-blur-2xl shadow-2xl transition-all duration-500 ring-2 ring-white/10 hover:ring-white/30 ${hoveredCard === plan.id ? 'scale-105 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]' : 'hover:scale-[1.02]'
                      } ${plan.popular ? 'shadow-[0_0_50px_rgba(168,85,247,0.4)]' : ''} ${isCurrent ? 'ring-yellow-400/50 shadow-[0_0_30px_rgba(255,215,0,0.3)]' : ''}`}>

                      {/* Current Plan Badge */}
                      {isCurrent && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                          <Badge className="bg-primary text-primary-foreground font-bold">
                            Current Plan
                          </Badge>
                        </div>
                      )}

                      <div className="relative">
                        {/* EXACT SHINE EFFECT FROM PRICING SECTION */}
                        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${hoveredCard === plan.id ? 'opacity-100' : 'opacity-0'} bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:-translate-x-1/2 transition-transform duration-1000 ease-out`}></div>

                        <CardHeader className="text-center pb-8 relative z-10">
                          <div className="flex justify-center mb-6">
                            {/* EXACT ICON WITH GLOW EFFECTS FROM PRICING SECTION */}
                            <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${plan.gradient} shadow-xl ring-4 ring-white/20 group-hover:scale-110 transition-transform duration-300`}
                              style={{
                                background: plan.id === 'standard' ? 'linear-gradient(135deg, #e5e7eb 60%, #f3f4f6 100%)' : undefined,
                                boxShadow: hoveredCard === plan.id ? '0 0 32px 8px #fff, 0 0 64px 16px #fff' : '0 4px 32px 0 #0003'
                              }}>
                              <IconComponent className={`h-8 w-8 ${plan.id === 'standard' ? 'text-slate-700' : 'text-white'} drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] ${hoveredCard === plan.id ? 'animate-shine' : 'animate-pulse'}`}
                                style={{ filter: 'brightness(1.5) drop-shadow(0 0 8px #fff)' }} />
                              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${plan.id === 'standard' ? 'from-slate-300 to-slate-100' : plan.gradient} blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300`}></div>
                              {/* Sharp shine effect on hover for icon - EXACT FROM PRICING */}
                              {hoveredCard === plan.id && (
                                <div className="absolute inset-0 rounded-2xl pointer-events-none animate-shine-effect" style={{ background: 'linear-gradient(120deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.0) 60%)', opacity: 0.8 }}></div>
                              )}
                            </div>
                          </div>
                          <CardTitle className={`text-3xl font-bold mb-3 group-hover:scale-105 transition-transform duration-300 ${plan.id === 'standard' ? 'text-black' : 'text-white'}`}>
                            {plan.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8 relative z-10">
                          <p className={`text-base text-center mb-2 ${plan.id === 'standard' ? 'text-black' : 'text-blue-100/90'}`}>
                            {plan.description}
                          </p>
                          <div className="flex justify-center mt-8">
                            <Button
                              variant="secondary"
                              className="px-6 py-2 rounded-full text-base font-semibold shadow-lg hover:bg-white/20 transition-colors duration-300"
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

            {/* Stats with EXACT Glow Effects from PricingSection */}
            <div
              className={`text-center transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                }`}
              style={{ transitionDelay: '600ms' }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {[
                  { value: '24/7', label: 'Customer Support', icon: Shield, gradient: 'from-sky-400 to-blue-500' },
                  { value: '10K+', label: 'Happy Customers', icon: Star, gradient: 'from-sky-400 to-blue-500' },
                  { value: '99.9%', label: 'Satisfaction Rate', icon: Zap, gradient: 'from-sky-400 to-blue-500' },
                ].map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div
                      key={index}
                      className="group relative bg-card/50 backdrop-blur-sm rounded-3xl shadow-lg py-10 px-8 border border-border hover:border-primary/30 transition-all duration-500 hover:scale-105 hover:shadow-xl"
                    >
                      {/* EXACT BACKGROUND GLOW FROM PRICING SECTION */}
                      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

                      <div className="relative z-10">
                        <div className="flex justify-center mb-4">
                          {/* EXACT ICON GLOW FROM PRICING SECTION */}
                          <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-xl ring-4 ring-white/20 group-hover:scale-110 transition-transform duration-300`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="text-4xl font-black text-foreground mb-3 group-hover:scale-110 transition-transform duration-300">
                          <Counter end={stat.value} duration={2000 + index * 200} />
                        </div>
                        <div className="text-muted-foreground text-sm font-medium">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
        @keyframes shine-effect {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        .animate-shine-effect {
          animation: shine-effect 1.2s linear;
        }
      `}</style>
    </DashboardLayout>
  );
}

export default withBookingForm(SubscriptionPage);