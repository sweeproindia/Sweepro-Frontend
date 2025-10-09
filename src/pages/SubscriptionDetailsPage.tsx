import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PiBagSimple } from "react-icons/pi";
import { ArrowLeft, Check, Crown, Zap, Star, Shield, Calendar, Clock, Users, MapPin, CheckCircle, ArrowRight, Package, Headphones, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface SubscriptionPlan {
  id: string;
  name: string;
  duration: string;
  description: string;
  features: string[];
  serviceBreakdown: {
    utensilCleaning: string;
    floorCleaning: string;
    bathroomCleaning: string;
    homeDusting: string;
    kitProvided: string;
    timings: string;
    backupGuarantee: string;
    customerCare: string;
    bufferDays: string;
  };
  popular?: boolean;
  icon: any;
  gradient: string;
  serviceHours: string;
  coverage: string;
  teamSize: string;
  cancellation: string;
  sessionsPerWeek: number;
  sessionsPerMonth: number;
}

// Updated subscription plans with detailed service breakdown from the image
const subscriptionPlans: Record<string, SubscriptionPlan> = {
  standard: {
    id: 'standard',
    name: 'Sweepro Touch',
    duration: 'month',
    description: 'Essential care plan for medium-sized homes with consistent daily cleaning support.',
    features: [
      'Utensil cleaning 3 days/week',
      'Floor sweeping & mopping 3 days/week', 
      'Bathroom cleaning 2 times/month',
      'Professional cleaning kit provided once',
      'Fixed time slots for consistency',
      'Basic backup maid guarantee',
      'Standard customer support',
      '2 days free trial'
    ],
    serviceBreakdown: {
      utensilCleaning: '3 days/week',
      floorCleaning: '3 days/week (Sweeping & Mopping)',
      bathroomCleaning: '2 times/month',
      homeDusting: 'Not included',
      kitProvided: 'Professional kit provided once only',
      timings: 'Fixed slots',
      backupGuarantee: 'Basic backup maid guarantee',
      customerCare: 'Standard support included',
      bufferDays: 'No buffer days'
    },
    popular: true,
    icon: Zap,
    gradient: 'from-[#C0C0C0] to-[#E0E0E0]',
    serviceHours: 'We provide Sweepro kit once for the subscription period',
    coverage: 'Kitchen, Bathroom, All floor areas',
    teamSize: '1 professional cleaner',
    cancellation: '2 days cancellation period',
    sessionsPerWeek: 3,
    sessionsPerMonth: 12
  },
  premium: {
    id: 'premium',
    name: 'Sweepro Lux',
    duration: 'month',
    description: 'Premium care plan with comprehensive daily cleaning and priority support for luxury homes.',
    features: [
      'Utensil cleaning 6 days/week',
      'Floor sweeping & mopping 6 days/week',
      'Bathroom cleaning 4 times/month',
      'Home dusting 1 time/month',
      'Professional kit provided monthly',
      'Fixed time slots with flexibility',
      'Priority backup maid guarantee',
      'Priority customer care 24/7',
      'Buffer days included for flexibility',
      '2 days free trial'
    ],
    serviceBreakdown: {
      utensilCleaning: '6 days/week',
      floorCleaning: '6 days/week (Sweeping & Mopping)',
      bathroomCleaning: '4 times/month',
      homeDusting: '1 time/month',
      kitProvided: 'Professional kit provided every month',
      timings: 'Fixed slots with priority flexibility',
      backupGuarantee: 'Priority backup maid guarantee',
      customerCare: 'Priority customer care 24/7',
      bufferDays: 'Buffer days included'
    },
    icon: Crown,
    gradient: 'from-yellow-400 to-yellow-700',
    serviceHours: 'We provide Sweepro kit every month',
    coverage: 'Complete home + comprehensive cleaning',
    teamSize: '1 professional cleaner',
    cancellation: '2 days cancellation period',
    sessionsPerWeek: 6,
    sessionsPerMonth: 24
  }
};

export default function SubscriptionDetailsPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(planId || 'standard');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Get plan from URL params or default to standard
  const plan = subscriptionPlans[planId || 'standard'] || subscriptionPlans.standard;

  useEffect(() => {
    setIsVisible(true);
    // Update selected plan when URL changes
    if (planId && subscriptionPlans[planId]) {
      setSelectedPlan(planId);
    }
  }, [planId]);

  const handleProceedToPayment = async () => {
    try {
      setIsNavigating(true);
      console.log('Navigating to payment options with plan:', plan);

      // Enhanced navigation with multiple fallback approaches
      const planData = {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        features: plan.features,
        serviceHours: plan.serviceHours,
        coverage: plan.coverage,
        teamSize: plan.teamSize,
        cancellation: plan.cancellation,
        sessionsPerWeek: plan.sessionsPerWeek,
        sessionsPerMonth: plan.sessionsPerMonth,
        popular: plan.popular,
        duration: plan.duration,
        serviceBreakdown: plan.serviceBreakdown
      };

      // Method 1: Try navigation with state
      try {
        navigate('/payment-options', {
          state: {
            selectedPlan: planData
          },
          replace: false
        });
        return;
      } catch (error) {
        console.warn('Navigation with state failed:', error);
      }

      // Method 2: Try navigation with URL params
      try {
        const params = new URLSearchParams({
          planId: plan.id,
          planName: plan.name
        });
        navigate(`/payment-options?${params.toString()}`, { replace: false });
        return;
      } catch (error) {
        console.warn('Navigation with params failed:', error);
      }

      // Method 3: Simple navigation
      try {
        navigate('/payment-options');
        return;
      } catch (error) {
        console.warn('Simple navigation failed:', error);
      }

      // Method 4: Window location fallback
      try {
        window.location.href = '/payment-options';
        return;
      } catch (error) {
        console.error('All navigation methods failed:', error);
        alert('Navigation failed. Please try again or contact support.');
      }

    } catch (error) {
      console.error('Error in handleProceedToPayment:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsNavigating(false);
    }
  };

  const handlePlanChange = (newPlanId: string) => {
    try {
      setSelectedPlan(newPlanId);
      // Update URL to reflect the new plan
      navigate(`/subscription/${newPlanId}`, { replace: true });
    } catch (error) {
      console.error('Error changing plan:', error);
      // Fallback: just update state
      setSelectedPlan(newPlanId);
    }
  };

  const handleGoBack = () => {
    try {
      navigate(-1);
    } catch (error) {
      console.error('Error going back:', error);
      // Fallback navigation
      try {
        navigate('/subscription');
      } catch (fallbackError) {
        console.error('Fallback navigation failed:', fallbackError);
        window.history.back();
      }
    }
  };

  const IconComponent = plan.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 text-primary hover:text-primary/80 hover:bg-primary/10"
          onClick={handleGoBack}
          disabled={isNavigating}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plans
        </Button>

        {/* Plan Selection Toggle */}
        <div className="mb-12">
          <div className="flex justify-center">
            <div className="inline-flex p-1 bg-muted rounded-2xl border border-border">
              {Object.entries(subscriptionPlans).map(([id, planData]) => {
                const PlanIcon = planData.icon;
                return (
                  <button
                    key={id}
                    onClick={() => handlePlanChange(id)}
                    disabled={isNavigating}
                    className={`relative px-8 py-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                      selectedPlan === id
                        ? 'bg-primary text-primary-foreground shadow-lg transform scale-105'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    } ${isNavigating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <PlanIcon className="h-4 w-4" />
                    {planData.name}
                    {planData.popular && selectedPlan !== id && (
                      <Badge variant="secondary" className="text-xs">Popular</Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Hero Section */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex justify-center mb-6">
            <div className={`relative p-6 rounded-3xl bg-gradient-to-br ${plan.gradient} shadow-2xl ring-4 ring-white/20 transform hover:scale-110 transition-transform duration-300`}
              style={{
                background: plan.id === 'standard' ? 'linear-gradient(135deg, #e5e7eb 60%, #f3f4f6 100%)' : undefined,
                boxShadow: '0 0 40px 12px rgba(255,255,255,0.3)'
              }}>
              <IconComponent className={`h-12 w-12 ${plan.id === 'standard' ? 'text-slate-700' : 'text-white'} drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]`}
                style={{ filter: 'brightness(1.5) drop-shadow(0 0 12px #fff)' }} />
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${plan.id === 'standard' ? 'from-slate-300 to-slate-100' : plan.gradient} blur-2xl opacity-50`}></div>
            </div>
          </div>

          <h1 className={`text-5xl md:text-6xl font-black mb-4 ${plan.id === 'standard' ? 'text-slate-700' : 'bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent'}`}>
            {plan.name}
          </h1>

          <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4 ${
            plan.id === 'standard' ? 'bg-slate-200 text-slate-700' : 'bg-yellow-200 text-yellow-800'
          }`}>
            {plan.id === 'standard' ? 'ESSENTIAL CARE' : 'PREMIUM CARE'}
          </div>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            {plan.description}
          </p>

          {/* Badges */}
          <div className="flex justify-center gap-3 mb-8">
            {plan.popular && (
              <Badge className="bg-purple-600 text-white font-bold px-4 py-2">Most Popular Choice</Badge>
            )}
            <Badge className="bg-blue-600 text-white font-bold px-4 py-2">Professional Service</Badge>
          </div>
        </div>

      

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Features Card */}
          <div className="lg:col-span-2">
            <Card className="h-full shadow-xl border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  Key Features & Benefits
                </CardTitle>
                <p className="text-muted-foreground">Everything included in your {plan.name} subscription</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                      <div className="bg-green-100 p-1.5 rounded-full mt-0.5 flex-shrink-0">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Service Details Card */}
          <div>
            <Card className="h-full shadow-xl border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Star className="h-6 w-6 text-yellow-500" />
                  Sweepro Care
                </CardTitle>
                <p className="text-muted-foreground text-sm">Professional standards and specifications</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <PiBagSimple className="h-5 w-5 text-blue-600"/>
                    <p className="font-bold text-blue-900">Sweepro Kit</p>
                  </div>
                  <p className="text-blue-700">{plan.serviceHours}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    <p className="font-bold text-green-900">Coverage Area</p>
                  </div>
                  <p className="text-green-700">{plan.coverage}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-100 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <p className="font-bold text-purple-900">Team Size</p>
                  </div>
                  <p className="text-purple-700">{plan.teamSize}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-orange-50 to-red-100 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    <p className="font-bold text-orange-900">Cancellation</p>
                  </div>
                  <p className="text-orange-700">{plan.cancellation}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">Ready to See Pricing Options?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Discover flexible payment plans and special offers tailored to fit your budget.
              View transparent pricing with no hidden fees.
            </p>

            <Button
              className={`w-full max-w-md py-6 text-xl font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-2xl shadow-2xl hover:shadow-xl transition-all duration-300 ${
                isNavigating ? 'opacity-50 cursor-not-allowed transform-none' : 'transform hover:scale-105'
              }`}
              onClick={handleProceedToPayment}
              disabled={isNavigating}
            >
              {isNavigating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Loading...
                </>
              ) : (
                <>
                  View Pricing & Book Now
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>

          </CardContent>
        </Card>
      </div>

      {/* CSS for animations */}
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
    </div>
  );
}