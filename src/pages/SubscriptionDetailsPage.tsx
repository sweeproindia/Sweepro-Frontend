import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PiBagSimple } from "react-icons/pi";
import { ArrowLeft, Check, Crown, Zap, Star, Shield, Calendar, Clock, Users, MapPin, CheckCircle, ArrowRight, Package, Headphones, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const PALETTE = {
  primary: '#1800ad',
  primaryBright: '#3a1dda',
  primaryGlow: '#6150ff',
  primaryDark: '#0f006f',
  mist: '#f4f5ff',
  ink: '#1f2140',
  slate: '#5d6185'
} as const;

const INDIGO_THEME = {
  heroGradient: `linear-gradient(135deg, ${PALETTE.primary} 0%, ${PALETTE.primaryBright} 55%, ${PALETTE.primaryGlow} 100%)`,
  heroGlow: '0 40px 140px -60px rgba(24,0,173,0.55)',
  heroAura: `radial-gradient(circle at 18% 8%, rgba(97,80,255,0.28) 0%, transparent 60%)`,
  heroOverlayLight: 'rgba(97,80,255,0.32)',
  heroOverlayDeep: 'rgba(24,0,173,0.28)',
  heroIconBackground: 'rgba(255,255,255,0.18)',
  heroIconRing: 'rgba(255,255,255,0.28)',
  headingColor: '#ffffff',
  labelBg: 'rgba(255,255,255,0.18)',
  labelText: '#ffffff',
  heroDescription: 'rgba(236,238,255,0.88)',
  accentBorder: 'rgba(24,0,173,0.18)',
  accentSurface: 'linear-gradient(135deg, rgba(24,0,173,0.08) 0%, rgba(24,0,173,0.02) 100%)',
  accentSurfaceBold: 'linear-gradient(135deg, rgba(24,0,173,0.12) 0%, rgba(24,0,173,0.04) 100%)',
  iconTint: '#ffffff',
  textStrong: '#1f2140',
  textMuted: 'rgba(31,33,64,0.68)',
  textSoft: 'rgba(31,33,64,0.55)',
  surface: 'rgba(255,255,255,0.94)',
  highlight: 'rgba(24,0,173,0.12)',
  glow: '0 25px 80px -40px rgba(24,0,173,0.55)',
  chipBg: 'rgba(24,0,173,0.12)',
  chipBorder: 'rgba(24,0,173,0.28)',
  chipText: '#1800ad',
  surfaceMuted: 'rgba(244,245,255,0.9)',
  ctaGradient: `linear-gradient(135deg, ${PALETTE.primary} 0%, ${PALETTE.primaryGlow} 100%)`
} as const;

const LIGHT_THEME = {
  heroGradient: 'linear-gradient(135deg, #bcdcff 0%, #a9cfff 100%)',
  heroGlow: '0 40px 140px -70px rgba(80,140,255,0.45)',
  heroAura: 'radial-gradient(circle at 18% 8%, rgba(255,255,255,0.65) 0%, transparent 60%)',
  heroOverlayLight: 'rgba(255,255,255,0.18)',
  heroOverlayDeep: 'rgba(255,255,255,0.06)',
  heroIconBackground: 'rgba(255,255,255,0.7)',
  heroIconRing: 'rgba(255,255,255,0.8)',
  headingColor: '#000000',
  labelBg: 'rgba(255,255,255,0.65)',
  labelText: '#1f2140',
  heroDescription: 'rgba(31,33,64,0.8)',
  accentBorder: 'rgba(80,140,255,0.28)',
  accentSurface: 'linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.42) 100%)',
  accentSurfaceBold: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.5) 100%)',
  iconTint: '#1f2140',
  textStrong: '#1f2140',
  textMuted: 'rgba(31,33,64,0.68)',
  textSoft: 'rgba(31,33,64,0.55)',
  surface: 'rgba(255,255,255,0.94)',
  highlight: 'rgba(80,140,255,0.15)',
  glow: '0 25px 80px -45px rgba(80,140,255,0.45)',
  chipBg: 'rgba(255,255,255,0.55)',
  chipBorder: 'rgba(255,255,255,0.8)',
  chipText: '#1f2140',
  surfaceMuted: 'rgba(255,255,255,0.75)',
  ctaGradient: 'linear-gradient(135deg, #1800ad 0%, #6150ff 100%)'
} as const;

const PLAN_THEME = {
  standard: LIGHT_THEME,
  premium: INDIGO_THEME
} as const;

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
    gradient: 'from-[#1800ad] via-[#3a1dda] to-[#6150ff]',
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
    gradient: 'from-[#1800ad] via-[#3a1dda] to-[#6150ff]',
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
  const [isVisible, setIsVisible] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Get plan from URL params or default to standard
  const plan = subscriptionPlans[planId || 'standard'] || subscriptionPlans.standard;
  const themeKey = (plan.id as keyof typeof PLAN_THEME) ?? 'standard';
  const theme = PLAN_THEME[themeKey] ?? PLAN_THEME.standard;
  const isPremium = themeKey === 'premium';

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
      navigate('/', { replace: false });
    } catch (error) {
      console.error('Error navigating home:', error);
      window.location.href = '/';
    }
  };

  const IconComponent = plan.icon;

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 text-primary hover:text-primary/80 hover:bg-primary/10"
          onClick={handleGoBack}
          disabled={isNavigating}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back

        </Button>

        {/* Plan Selection Toggle */}
        <div className="mb-12">
          <div className="flex justify-center">
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

        {/* Main Hero Section */}
        <div
          className={`relative mb-12 overflow-hidden rounded-[32px] border transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
          style={{
            borderColor: theme.accentBorder,
            background: theme.heroGradient,
            boxShadow: theme.heroGlow
          }}
        >
          <div
            className="absolute inset-0 opacity-70"
            style={{ background: theme.heroOverlayDeep }}
          />
          <div className="absolute -top-24 -left-20 h-64 w-64 rounded-full blur-[120px] opacity-60"
            style={{ background: theme.heroOverlayDeep }}
          />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full blur-[140px] opacity-60"
            style={{ background: theme.heroOverlayLight }}
          />

          <div className="relative px-6 py-14 text-center md:px-14 md:py-16">
            <div className="mx-auto mb-7 inline-flex h-20 w-20 items-center justify-center rounded-full ring-4 ring-white/25 shadow-xl"
              style={{
                background: theme.heroIconBackground,
                boxShadow: '0 24px 55px -35px rgba(24,0,173,0.65)'
              }}
            >
              <IconComponent
                className="h-10 w-10 drop-shadow-[0_0_18px_rgba(255,255,255,0.6)]"
                style={{ color: theme.iconTint }}
              />
            </div>

            <h1 className="text-4xl font-black tracking-tight md:text-6xl" style={{ color: theme.headingColor }}>
              {plan.name}
            </h1>

            <div
              className="mx-auto mt-4 w-max rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.45em]"
              style={{ background: theme.labelBg, color: theme.labelText }}
            >
              {plan.id === 'standard' ? 'Essential care' : 'Premium care'}
            </div>

            <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed" style={{ color: theme.heroDescription }}>
              {plan.description}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {plan.popular && (
                <Badge className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] backdrop-blur" style={{ background: theme.labelBg, color: theme.labelText }}>
                  Most loved tier
                </Badge>
              )}
              <Badge className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] backdrop-blur" style={{ background: theme.labelBg, color: theme.labelText }}>
                Trusted housekeeping
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Features Card */}
          <div className="lg:col-span-2">
            <Card
              className="h-full border bg-white/95 shadow-xl backdrop-blur-sm"
              style={{ borderColor: theme.accentBorder }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl font-semibold"
                  style={{ color: PALETTE.primary }}
                >
                  <CheckCircle className="h-6 w-6" style={{ color: PALETTE.primary }} />
                  Key Features & Benefits
                </CardTitle>
                <p className="text-sm" style={{ color: 'rgba(32,30,69,0.65)' }}>
                  Everything included in your {plan.name} subscription
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {plan.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-2xl border px-4 py-3 transition-colors duration-200"
                      style={{
                        borderColor: theme.accentBorder,
                        background: theme.accentSurface
                      }}
                    >
                      <div
                        className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90"
                        style={{ color: PALETTE.primary }}
                      >
                        <Check className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-800">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Service Details Card */}
          <div>
            <Card
              className="h-full border bg-white/95 shadow-xl backdrop-blur"
              style={{ borderColor: theme.accentBorder }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl font-semibold"
                  style={{ color: PALETTE.primary }}
                >
                  <Star className="h-6 w-6" style={{ color: PALETTE.primary }} />
                  Sweepro Care Promise
                </CardTitle>
                <p className="text-sm" style={{ color: 'rgba(32,30,69,0.65)' }}>
                  Professional standards and specifications
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    icon: PiBagSimple,
                    label: 'Sweepro kit',
                    copy: plan.serviceHours
                  },
                  {
                    icon: MapPin,
                    label: 'Coverage area',
                    copy: plan.coverage
                  },
                  {
                    icon: Users,
                    label: 'Team size',
                    copy: plan.teamSize
                  },
                  {
                    icon: Calendar,
                    label: 'Cancellation',
                    copy: plan.cancellation
                  }
                ].map(({ icon: Icon, label, copy }) => (
                  <div
                    key={label}
                    className="rounded-2xl border px-4 py-4"
                    style={{
                      borderColor: theme.accentBorder,
                      background: theme.surface,
                      boxShadow: theme.glow
                    }}
                  >
                    <div className="mb-1 flex items-center gap-3">
                      <Icon className="h-5 w-5" style={{ color: PALETTE.primary }} />
                      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-700">{label}</p>
                    </div>
                    <p className="text-sm text-slate-600">{copy}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <Card
          className="relative overflow-hidden border bg-white/95 text-center shadow-[0_35px_120px_-60px_rgba(24,0,173,0.6)]"
          style={{ borderColor: theme.accentBorder }}
        >
          <div className="absolute inset-0 opacity-90"
            style={{ background: 'radial-gradient(circle at 15% 20%, rgba(97,80,255,0.25) 0%, transparent 55%), rgba(24,0,173,0.14)' }}
          />
          <CardContent className="relative p-10">
            <h3 className="text-2xl font-bold" style={{ color: PALETTE.primary }}>
              Ready to shape your Sweep Pro experience?
            </h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 md:text-base">
              Discover flexible payment plans, seasonal perks and concierge-level scheduling crafted around your home.
            </p>

            <Button
              className={`mt-8 w-full max-w-md rounded-full px-10 py-6 text-lg font-semibold text-white shadow-xl transition duration-300 ${
                isNavigating ? 'cursor-not-allowed opacity-70' : 'hover:scale-[1.02]'
              }`}
              style={{ background: theme.ctaGradient }}
              onClick={handleProceedToPayment}
              disabled={isNavigating}
            >
              {isNavigating ? (
                <>
                  <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                  Redirecting…
                </>
              ) : (
                <>
                  View payment options
                  <ArrowRight className="ml-3 h-5 w-5" />
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