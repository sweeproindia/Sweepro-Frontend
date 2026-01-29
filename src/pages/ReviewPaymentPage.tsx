import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { ArrowLeft, Calendar, Check, Clock, CreditCard, Shield, Sparkles, Home, MapPin, CheckCircle, Users, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PaymentService } from '@/services/paymentService';
import { SubscriptionService } from '@/services/subscriptionService';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

const BRAND = {
  indigo: '#1800ad',
  // keep all indigo shades derived from the single brand hex
  indigoTint: '#1800ad1f'
} as const;

const INDIGO_STYLES = {
  gradient: BRAND.indigo,
  softGradient: `linear-gradient(135deg, ${BRAND.indigo}1f 0%, ${BRAND.indigo}0d 100%)`,
  subtleSurface: `linear-gradient(135deg, ${BRAND.indigo}14 0%, ${BRAND.indigo}05 100%)`,
  border: `${BRAND.indigo}26`
} as const;

// Updated interface to match the detailed subscription plan structure
interface SubscriptionPlan {
  id: string;
  name: string;
  price?: number;
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
  discount?: number;
  originalPrice?: number;
  serviceHours: string;
  coverage: string;
  teamSize: string;
  cancellation: string;
  icon?: any;
  gradient?: string;
  sessionsPerWeek: number;
  sessionsPerMonth: number;
}

interface ServiceOptions {
  timeSlot: string;
  startDate: string;
  frequency: string;
  address: string;
  latitude?: number;
  longitude?: number;
  pincode: string;
  locality: string;
  addressLine: string;
  city: string;
  state: string;
  landmark: string;
  propertyType: 'apartment' | 'bungalow';
  bhkType: '2bhk' | '3bhk' | '4bhk' | null;
  squareFeet: number;
  selectedPlanDuration: '1month' | '3month' | '6month' | null;
  finalTotalPrice: number;
}

// Fixed frequency configuration
const DAILY_FREQUENCY = { id: 'daily', name: 'Daily', description: 'Service every day', price: 0 } as const;

// Property type configurations (for display purposes only)
const PROPERTY_TYPES = [
  {
    id: 'apartment' as const,
    name: 'Apartment',
    description: 'Flats, Condos, Multi-story units',
    icon: '🏢'
  },
  {
    id: 'bungalow' as const,
    name: 'Bungalow',
    description: 'Independent Houses, Villas',
    icon: '🏡'
  }
];

// BHK configurations for display
const BHK_CONFIGS = [
  { id: '2bhk' as const, label: '2 BHK' },
  { id: '3bhk' as const, label: '3 BHK' },
  { id: '4bhk' as const, label: '4 BHK' },
];

// Plan duration options for display
const PLAN_DURATIONS = [
  { id: '1month' as const, label: '1 Month', description: 'Monthly billing' },
  { id: '3month' as const, label: '3 Months', description: 'Quarterly plan with 5% savings' },
  { id: '6month' as const, label: '6 Months', description: 'Semi-annual plan with 10% savings' },
];

// LocalStorage keys
const STORAGE_KEYS = {
  SELECTED_PLAN: 'sweep_pro_selected_plan',
  SERVICE_OPTIONS: 'sweep_pro_service_options'
};

// Utility functions for localStorage
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

const getFromStorage = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn('Failed to read from localStorage:', error);
    return null;
  }
};

const clearStorage = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
};

export default function ReviewPaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { toast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<ServiceOptions | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from multiple sources with fallback priority
  useEffect(() => {
    let plan: SubscriptionPlan | null = null;
    let options: ServiceOptions | null = null;

    // Priority 1: Navigation state (fresh navigation from previous page)
    if (location.state?.selectedPlan && location.state?.selectedOptions) {
      plan = location.state.selectedPlan;
      options = location.state.selectedOptions;
      
      // Save to localStorage for future use
      saveToStorage(STORAGE_KEYS.SELECTED_PLAN, plan);
      saveToStorage(STORAGE_KEYS.SERVICE_OPTIONS, options);
    } 
    // Priority 2: localStorage (page refresh or direct navigation)
    else {
      plan = getFromStorage(STORAGE_KEYS.SELECTED_PLAN);
      options = getFromStorage(STORAGE_KEYS.SERVICE_OPTIONS);
    }

    if (plan && options) {
      setSelectedPlan(plan);
      setSelectedOptions(options);
      setIsLoading(false);
    } else {
      // No data available, redirect to start
      toast({
        title: 'No Plan Selected',
        description: 'Please select a subscription plan first.',
        variant: 'destructive',
      });
      navigate('/subscription');
    }
  }, [location.state, navigate, toast]);

  // Clear storage on successful payment
  const clearBookingData = () => {
    clearStorage(STORAGE_KEYS.SELECTED_PLAN);
    clearStorage(STORAGE_KEYS.SERVICE_OPTIONS);
  };

  if (isLoading || !selectedPlan || !selectedOptions) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-white"
        style={{
          background:
            `radial-gradient(circle at 12% -10%, ${BRAND.indigo}1f 0%, transparent 60%), radial-gradient(circle at 88% 14%, ${BRAND.indigo}1f 0%, transparent 55%), #ffffff`
        }}
      >
        <div className="text-center">
          {isLoading ? (
            <>
              <div
                className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                style={{ borderColor: BRAND.indigo }}
              ></div>
              <p className="text-gray-600">Loading your selections...</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-4 text-gray-900">No plan selected</h1>
              <Button onClick={() => navigate('/subscription')}>
                Back to Plans
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  const getPropertyTypeInfo = () => {
    return PROPERTY_TYPES.find(pt => pt.id === selectedOptions.propertyType);
  };

  const getBhkInfo = () => {
    return BHK_CONFIGS.find(bhk => bhk.id === selectedOptions.bhkType);
  };

  const getPlanDurationInfo = () => {
    return PLAN_DURATIONS.find(pd => pd.id === selectedOptions.selectedPlanDuration);
  };

  // Use the final total price from the configuration, not calculating here
  const finalTotal = selectedOptions.finalTotalPrice || 0;
  const gst = finalTotal * 0.18; // 18% GST
  const totalWithGst = finalTotal + gst;

  const handleMakePayment = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to continue with payment.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    // Validate amount before proceeding
    if (!totalWithGst || totalWithGst <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Unable to calculate payment amount. Please try selecting your plan again.',
        variant: 'destructive',
      });
      return;
    }

    // Razorpay minimum order amount is ₹1 (100 paise)
    if (totalWithGst < 1) {
      toast({
        title: 'Amount Too Low',
        description: 'Payment amount must be at least ₹1.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    
    console.log('🔵 Starting payment process...');
    console.log('User:', { id: (user as any).id, email: (user as any).email });
    console.log('Selected Plan:', selectedPlan?.name);
    console.log('Total with GST:', totalWithGst);

    try {
      // Step 1: Resolve the actual backend plan and create a subscription
      // Map the selected UI plan (Sweepro Touch / Sweepro Lux) to the real
      // ServicePlan in the backend so we pass a valid planId.
      const plansResponse = await SubscriptionService.getSubscriptionPlans();
      
      console.log('📋 Plans response:', plansResponse);
      
      const rawPlans: any = plansResponse.data;
      const backendPlans: any[] = Array.isArray(rawPlans)
        ? rawPlans
        : rawPlans?.plans || (plansResponse as any).plans || [];

      if (!backendPlans || backendPlans.length === 0) {
        throw new Error('No subscription plans are configured on the server.');
      }
      
      console.log('📋 Available backend plans:', backendPlans.map((p: any) => ({ id: p.id, name: p.name })));
      const normalizeName = (value: string | undefined | null) =>
        (value || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '');

      const selectedNameNorm = normalizeName(selectedPlan.name);

      // 1) Try exact normalized name match
      let backendPlan = backendPlans.find(
        (p: any) => normalizeName(p.name) === selectedNameNorm
      );

      // 2) Fallback by known plan ids / keywords if exact match fails
      if (!backendPlan) {
        backendPlan = backendPlans.find((p: any) => {
          const n = normalizeName(p.name);
          if (selectedPlan.id === 'standard') {
            // Map UI "Sweepro Touch" to backend "SweepPro Touch" (name contains "touch")
            return n.includes('touch');
          }
          if (selectedPlan.id === 'premium') {
            // Map UI "Sweepro Lux" to backend Lux plan (name contains "lux")
            return n.includes('lux');
          }
          return false;
        });
      }

      if (!backendPlan) {
        throw new Error(
          'Matching subscription plan not found on server. Please contact support or try another plan.'
        );
      }

      const subscriptionData = {
        planId: backendPlan.id,
        paymentMethod: 'RAZORPAY',
        autoRenewal: true,
        startDate: selectedOptions.startDate,
        planDuration: selectedOptions.selectedPlanDuration,
        finalAmount: totalWithGst, // Pass the final amount including GST
        serviceDetails: {
          timeSlot: selectedOptions.timeSlot,
          frequency: selectedOptions.frequency,
          propertyType: selectedOptions.propertyType,
          bhkType: selectedOptions.bhkType,
          squareFeet: selectedOptions.squareFeet,
          planDuration: selectedOptions.selectedPlanDuration,
          address: {
            full: selectedOptions.address,
            pincode: selectedOptions.pincode,
            locality: selectedOptions.locality,
            addressLine: selectedOptions.addressLine,
            city: selectedOptions.city,
            state: selectedOptions.state,
            landmark: selectedOptions.landmark,
            coordinates: {
              latitude: selectedOptions.latitude,
              longitude: selectedOptions.longitude
            }
          }
        }
      };

      console.log('🔵 Step 1: Creating subscription with data:', subscriptionData);
      
      const subscriptionResponse = await SubscriptionService.subscribeToPlan(subscriptionData);
      
      console.log('✅ Subscription response:', subscriptionResponse);
      
      const subscriptionPayload: any =
        (subscriptionResponse.data as any)?.subscription ||
        (subscriptionResponse.data as any) ||
        (subscriptionResponse as any).subscription;

      const createdSubscriptionId = subscriptionPayload?.id;
      if (!createdSubscriptionId) {
        console.error('❌ No subscription ID in response:', subscriptionResponse);
        throw new Error('Failed to create subscription - no subscription ID returned');
      }

      console.log('✅ Subscription created with ID:', createdSubscriptionId);
      console.log('🔵 Step 2: Creating Razorpay order with amount:', totalWithGst, '(₹', totalWithGst.toFixed(2), ')');

      // Step 2: Create Razorpay order for this subscription
      // Step 2: Create Razorpay order for this subscription using the exact
      // final amount shown in the payment summary (including GST). This keeps
      // the backend/Razorpay amount in sync with the UI.
      const orderResponse = await PaymentService.createRazorpaySubscriptionOrder(
        createdSubscriptionId,
        totalWithGst
      );
      
      console.log('✅ Razorpay order response:', orderResponse);
      
      if (!orderResponse.success || !orderResponse.data) {
        console.error('❌ Order response failed:', orderResponse);
        throw new Error('Failed to create payment order');
      }

      // Align response to Razorpay expected fields
      const orderId = (orderResponse.data as any).orderId;
      const amount = (orderResponse.data as any).amount; // amount is in paise as required by Razorpay
      const currency = (orderResponse.data as any).currency;
      const key = (orderResponse.data as any).key;

      const razorpayOptions = {
        key,
        amount,
        currency,
        name: 'Sweepro',
        description: `${selectedPlan.name} Subscription - ${getPlanDurationInfo()?.label}`,
        order_id: orderId,
        prefill: {
          name: (user as any).name || '',
          email: (user as any).email || '',
          contact: (user as any).phone || ''
        },
        notes: {
          planName: selectedPlan.name,
          customerId: (user as any).id,
          startDate: selectedOptions.startDate,
          timeSlot: selectedOptions.timeSlot,
          frequency: selectedOptions.frequency,
          propertyType: selectedOptions.propertyType,
          bhkType: selectedOptions.bhkType,
          squareFeet: selectedOptions.squareFeet.toString(),
          planDuration: selectedOptions.selectedPlanDuration,
          finalTotalPrice: selectedOptions.finalTotalPrice.toString(),
          address: selectedOptions.address,
          latitude: selectedOptions.latitude?.toString() || '',
          longitude: selectedOptions.longitude?.toString() || ''
        },
        theme: { color: BRAND.indigo },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast({ title: 'Payment Cancelled', description: 'You can retry the payment anytime.' });
          }
        }
      };

      // Open Razorpay and await result
      const razorpayResult = await PaymentService.initializeRazorpayPayment(razorpayOptions);
      await handlePaymentSuccess(razorpayResult, createdSubscriptionId);

    } catch (error: any) {
      console.error('Payment initialization error:', error);
      console.error('Error details:', {
        message: error?.message,
        statusCode: error?.statusCode,
        response: error?.response,
        stack: error?.stack
      });
      setIsProcessing(false);
      
      // Provide more specific error messages based on error type
      let errorMessage = 'Failed to initialize payment. Please try again.';
      if (error?.statusCode === 500) {
        errorMessage = 'Server error occurred. Please try again in a few minutes or contact support if the issue persists.';
      } else if (error?.statusCode === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({ 
        title: 'Payment Failed', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    }
  };

  const handlePaymentSuccess = async (razorpayResponse: any, subscriptionId: string) => {
    try {
      setIsProcessing(true);
      const verificationData = {
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
        subscriptionId: subscriptionId,
      };
      const verificationResponse = await PaymentService.verifyRazorpayPayment(verificationData);
      const verifiedPayment: any =
        (verificationResponse as any).payment ||
        (verificationResponse.data as any)?.payment;

      if (verificationResponse.success && verifiedPayment) {
        // Clear localStorage after successful payment
        clearBookingData();

        // Optionally refresh subscription data from server
        let subscriptionData: any = null;
        try {
          const subRes = await SubscriptionService.getUserSubscription();
          subscriptionData =
            (subRes.data as any)?.subscription ||
            (subRes as any).subscription ||
            subRes.data ||
            null;
        } catch (e) {
          console.warn('Failed to refresh subscription after payment:', e);
        }

        toast({
          title: 'Payment Successful!',
          description: `Your ${selectedPlan.name} subscription has been activated.`,
        });

        // Redirect user to their subscription page with relevant data
        navigate('/subscription', {
          state: {
            fromPayment: true,
            payment: verifiedPayment,
            subscription: subscriptionData,
            razorpayOrderId: razorpayResponse.razorpay_order_id,
            amount: totalWithGst,
            propertyConfig: selectedOptions,
          },
        });
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error: any) {
      console.error('Payment success handling error:', error);
      await handlePaymentFailure(razorpayResponse.razorpay_order_id, 'VERIFICATION_FAILED', error.message);
    }
  };

  const handlePaymentFailure = async (orderId: string, errorCode: string, errorDescription: string) => {
    try {
      await PaymentService.handleRazorpayFailure({
        error: { code: errorCode, description: errorDescription, source: 'payment_gateway', step: 'payment_processing', reason: errorDescription },
        razorpay_order_id: orderId
      });
    } catch (error) {
      console.error('Error recording payment failure:', error);
    }
    navigate('/payment-failure', { 
      state: { orderId, errorCode, errorDescription, amount: totalWithGst, selectedPlan, selectedOptions } 
    });
    setIsProcessing(false);
  };

  const handleBackToOptions = () => {
    // Ensure data is saved before navigating back
    saveToStorage(STORAGE_KEYS.SELECTED_PLAN, selectedPlan);
    saveToStorage(STORAGE_KEYS.SERVICE_OPTIONS, selectedOptions);
    
    navigate('/payment-options', { 
      state: { selectedPlan, selectedOptions } 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatAddress = () => {
    const parts = [
      selectedOptions.addressLine,
      selectedOptions.locality,
      selectedOptions.city,
      selectedOptions.state,
      selectedOptions.pincode
    ];

    const formatted = parts.filter(Boolean).join(', ');
    if (formatted) return formatted;

    return selectedOptions.address || '—';
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden text-slate-900"
      style={{
        background:
          `radial-gradient(circle at 10% -12%, ${BRAND.indigo}1f 0%, transparent 60%), radial-gradient(circle at 85% 10%, ${BRAND.indigo}24 0%, transparent 55%), #ffffff`
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle at top, ${BRAND.indigo}24, transparent 55%)` }} />
        <div className="absolute -top-64 right-0 h-[32rem] w-[32rem] rounded-full blur-3xl" style={{ background: `${BRAND.indigo}24` }} />
        <div className="absolute -bottom-72 left-20 h-[36rem] w-[36rem] rounded-full blur-3xl" style={{ background: `${BRAND.indigo}1f` }} />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col px-4 pb-24 pt-10 lg:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <Button
            variant="ghost"
            onClick={handleBackToOptions}
            className="group flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold shadow-sm transition hover:opacity-95"
            style={{ border: `1px solid ${BRAND.indigo}33`, color: BRAND.indigo }}
          >
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
            Back to options
          </Button>

           <div  className="rounded-full px-4 py-1 flex " 
                    style={{
                        border: `1px solid ${BRAND.indigo}33`,
                      
                        color: BRAND.indigo
                      }}>
                      <img src='/apple-touch-icon.png' alt='Sweepro Logo' className='h-6 w-6 inline-block mr-2' />
                    <Badge
                      className="rounded-full bg-transpernt text- px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em]"
                     style={{
                      color:BRAND.indigo
                     }}
                    >
                      {selectedPlan.name}
                    </Badge>
                    </div>
        </div>

        <section
          className="mt-10 grid gap-6 rounded-3xl border bg-white/80 px-6 py-10 backdrop-blur"
          style={{
            borderColor: INDIGO_STYLES.border,
            boxShadow: `0 20px 80px -50px ${BRAND.indigo}8c`
          }}
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em]"
              style={{ border: `1px solid ${BRAND.indigo}33`, background: `${BRAND.indigo}12`, color: BRAND.indigo }}
            >
              Review · Payment
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Finalise your Sweepro subscription
            </h1>
            <p className="max-w-3xl text-base text-slate-600 md:text-lg">
              Confirm the property, schedule and billing details for your {selectedPlan.name} plan. When you are ready,
              settle the secure Razorpay checkout and we will activate your daily concierge cleaning experience.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div
              className="rounded-2xl border px-4 py-3 text-left"
              style={{ borderColor: INDIGO_STYLES.border, background: `${BRAND.indigo}0d` }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.35em]" style={{ color: BRAND.indigo }}>Plan cadence</p>
              <p className="mt-1 text-lg font-semibold" style={{ color: BRAND.indigo }}>{getPlanDurationInfo()?.label}</p>
              <p className="text-sm" style={{ color: BRAND.indigo }}>{getPlanDurationInfo()?.description}</p>
            </div>
            <div
              className="rounded-2xl border px-4 py-3 text-left"
              style={{ borderColor: INDIGO_STYLES.border, background: `${BRAND.indigo}0d` }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.35em]" style={{ color: BRAND.indigo }}>Service window</p>
              <p className="mt-1 text-lg font-semibold" style={{ color: BRAND.indigo }}>{formatDate(selectedOptions.startDate)}</p>
              <p className="text-sm" style={{ color: BRAND.indigo }}>{selectedOptions.timeSlot} · {DAILY_FREQUENCY.name}</p>
            </div>

            <div
              className="rounded-2xl border px-4 py-3 text-left"
              style={{ borderColor: INDIGO_STYLES.border, background: `${BRAND.indigo}0d` }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.35em]" style={{ color: BRAND.indigo }}>Property</p>
              <p className="mt-1 text-lg font-semibold" style={{ color: BRAND.indigo }}>{getBhkInfo()?.label}</p>
              <p className="text-sm" style={{ color: BRAND.indigo }}>{getPropertyTypeInfo()?.name} • {selectedOptions.squareFeet} sq ft</p>
            </div>
          </div>
        </section>

        <div className="mt-12 flex flex-col gap-8 lg:flex-row">
          <div className="flex-1 space-y-8">
            <Card className="rounded-3xl border bg-white/90 shadow-xl" style={{ borderColor: INDIGO_STYLES.border }}>
              <CardHeader className="space-y-3">
                <CardTitle className="flex items-center gap-3 text-lg" style={{ color: BRAND.indigo }}>
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ border: `1px solid ${BRAND.indigo}33`, background: `${BRAND.indigo}12` }}
                  >
                    <Shield className="h-5 w-5" style={{ color: BRAND.indigo }} />
                  </span>
                  Selected plan & billing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div
                  className="flex flex-col gap-4 rounded-2xl border px-5 py-5 md:flex-row md:items-center md:justify-between"
                  style={{ borderColor: INDIGO_STYLES.border, background: `${BRAND.indigo}0d` }}
                >
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold" style={{ color: BRAND.indigo }}>{selectedPlan.name}</h3>
                    <p className="max-w-xl text-sm" style={{ color: `${BRAND.indigo}cc` }}>{selectedPlan.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlan.popular && (
                        <Badge
                          className="rounded-full text-xs font-semibold"
                          style={{ border: `1px solid ${BRAND.indigo}33`, background: `${BRAND.indigo}12`, color: BRAND.indigo }}
                        >
                          Most loved tier
                        </Badge>
                      )}
                      <Badge
                        className="rounded-full text-xs font-semibold"
                        style={{ border: `1px solid ${BRAND.indigo}33`, background: `${BRAND.indigo}12`, color: BRAND.indigo }}
                      >
                        {getPlanDurationInfo()?.label} plan
                      </Badge>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-3xl font-bold" style={{ color: BRAND.indigo }}>₹{finalTotal.toLocaleString()}</p>
                    <p className="text-sm" style={{ color: `${BRAND.indigo}b3` }}>{getPlanDurationInfo()?.description}</p>
                    <p className="text-xs" style={{ color: `${BRAND.indigo}8c` }}>Amount before GST</p>
                  </div>
                </div>

                <div className="rounded-2xl border px-5 py-4" style={{ borderColor: INDIGO_STYLES.border, background: `${BRAND.indigo}0d` }}>
                  <p className="text-sm font-semibold" style={{ color: BRAND.indigo }}>Inclusive concierge care</p>
                  <p className="text-sm" style={{ color: `${BRAND.indigo}cc` }}>
                    Daily staffing for your {getBhkInfo()?.label} footprint with premium supplies, rotation backups and proactive quality checks.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-slate-200 bg-white/90 shadow-xl">
              <CardHeader className="space-y-3">
                <CardTitle className="flex items-center gap-3 text-lg" style={{ color: BRAND.indigo }}>
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ border: `1px solid ${BRAND.indigo}33`, background: `${BRAND.indigo}12` }}
                  >
                    <Package className="h-5 w-5" style={{ color: BRAND.indigo }} />
                  </span>
                  Detailed service breakdown
                </CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Everything bundled with your {selectedPlan.name} experience.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-sm">
                <div className="grid gap-4 md:grid-cols-2">
                  {(() => {
                    const breakdownItems = [
                      { label: 'Utensil Cleaning', value: selectedPlan.serviceBreakdown.utensilCleaning, icon: Package },
                      { label: 'Floor Cleaning', value: selectedPlan.serviceBreakdown.floorCleaning, icon: Home },
                      { label: 'Bathroom Detailing', value: selectedPlan.serviceBreakdown.bathroomCleaning, icon: Shield },
                      { label: 'Dusting Coverage', value: selectedPlan.serviceBreakdown.homeDusting, icon: Sparkles },
                      { label: 'Kit & Supplies', value: selectedPlan.serviceBreakdown.kitProvided, icon: Package },
                      { label: 'Timing Flow', value: selectedPlan.serviceBreakdown.timings, icon: Clock },
                      { label: 'Backup Promise', value: selectedPlan.serviceBreakdown.backupGuarantee, icon: Shield },
                      { label: 'Customer Care', value: selectedPlan.serviceBreakdown.customerCare, icon: Users },
                      { label: 'Buffer Days', value: selectedPlan.serviceBreakdown.bufferDays, icon: Calendar, span: true }
                    ];

                    return breakdownItems.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className={`rounded-2xl border ${item.span ? 'md:col-span-2' : ''} px-4 py-4 shadow-sm`}
                          style={{
                            borderColor: INDIGO_STYLES.border,
                            background: INDIGO_STYLES.softGradient
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/70 text-slate-700">
                              <Icon className="h-4 w-4" style={{ color: BRAND.indigo }} />
                            </span>
                            <span className="text-sm font-semibold text-slate-900">{item.label}</span>
                          </div>
                          <p className="mt-2 text-sm text-slate-700">{item.value}</p>
                        </div>
                      );
                    });
                  })()}
                </div>

                <div className="rounded-2xl border px-5 py-4" style={{ borderColor: INDIGO_STYLES.border, background: `${BRAND.indigo}0d` }}>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5" style={{ color: BRAND.indigo }} />
                    <p className="font-semibold" style={{ color: BRAND.indigo }}>Service rhythm</p>
                  </div>
                  <p className="mt-2" style={{ color: `${BRAND.indigo}cc` }}>
                    {selectedPlan.sessionsPerWeek} sessions every week • {selectedPlan.sessionsPerMonth} expertly supervised visits each month.
                  </p>
                  <p className="text-xs" style={{ color: `${BRAND.indigo}99` }}>Flexible rescheduling and two-day cancellation window included.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-slate-200 bg-white/90 shadow-xl">
              <CardHeader className="space-y-3">
                <CardTitle className="flex items-center gap-3 text-lg" style={{ color: BRAND.indigo }}>
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ border: `1px solid ${BRAND.indigo}33`, background: `${BRAND.indigo}12` }}
                  >
                    <Clock className="h-5 w-5" style={{ color: BRAND.indigo }} />
                  </span>
                  Schedule & location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Preferred slot</p>
                    <p className="mt-1 text-base font-semibold">{selectedOptions.timeSlot}</p>
                    <p className="text-xs text-slate-500">Daily rhythm {DAILY_FREQUENCY.description.toLowerCase()}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Kick-off date</p>
                    <p className="mt-1 text-base font-semibold">{formatDate(selectedOptions.startDate)}</p>
                    <p className="text-xs text-slate-500">Auto-renews with confirmation</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Service address</p>
                  <p className="mt-2 text-sm text-slate-700">{formatAddress()}</p>
                  {selectedOptions.landmark && (
                    <p className="text-xs text-slate-500">Landmark — {selectedOptions.landmark}</p>
                  )}
                  {(selectedOptions.latitude && selectedOptions.longitude) && (
                    <p className="text-xs text-slate-400">
                      GPS · {selectedOptions.latitude.toFixed(4)}, {selectedOptions.longitude.toFixed(4)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-slate-200 bg-white/90 shadow-xl">
              <CardHeader className="space-y-3">
                <CardTitle className="flex items-center gap-3 text-lg" style={{ color: BRAND.indigo }}>
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ border: `1px solid ${BRAND.indigo}33`, background: `${BRAND.indigo}12` }}
                  >
                    <Home className="h-5 w-5" style={{ color: BRAND.indigo }} />
                  </span>
                  Property configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border px-5 py-4" style={{ borderColor: INDIGO_STYLES.border, background: `${BRAND.indigo}0d` }}>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: BRAND.indigo }}>Type</p>
                    <p className="mt-1 text-base font-semibold" style={{ color: BRAND.indigo }}>{getPropertyTypeInfo()?.name}</p>
                    <p className="text-xs" style={{ color: `${BRAND.indigo}b3` }}>{getPropertyTypeInfo()?.description}</p>
                  </div>

                  <div className="rounded-2xl border px-5 py-4" style={{ borderColor: INDIGO_STYLES.border, background: `${BRAND.indigo}0d` }}>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: BRAND.indigo }}>Configuration</p>
                    <p className="mt-1 text-base font-semibold" style={{ color: BRAND.indigo }}>{getBhkInfo()?.label}</p>
                    <p className="text-xs" style={{ color: `${BRAND.indigo}b3` }}>{selectedOptions.squareFeet} sq ft</p>
                  </div>

                  <div className="rounded-2xl border px-5 py-4" style={{ borderColor: INDIGO_STYLES.border, background: `${BRAND.indigo}0d` }}>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: BRAND.indigo }}>Plan duration</p>
                    <p className="mt-1 text-base font-semibold" style={{ color: BRAND.indigo }}>{getPlanDurationInfo()?.label}</p>
                    <p className="text-xs" style={{ color: `${BRAND.indigo}b3` }}>Savings auto-applied</p>
                  </div>
                </div>

                <div className="rounded-2xl border px-5 py-4" style={{ borderColor: INDIGO_STYLES.border, background: `${BRAND.indigo}0d` }}>
                  <p className="text-sm font-semibold" style={{ color: BRAND.indigo }}>Configuration locked in</p>
                  <p className="text-sm" style={{ color: `${BRAND.indigo}cc` }}>
                    Your Sweepro concierge is matched for a {getBhkInfo()?.label?.toLowerCase()} {getPropertyTypeInfo()?.name?.toLowerCase()} with {selectedOptions.squareFeet} sq ft. Adjustments can be made with a quick chat post payment.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="lg:w-[360px] lg:flex-shrink-0">
            <div className="space-y-6">
              <Card className="rounded-3xl border bg-white shadow-xl" style={{ borderColor: INDIGO_STYLES.border }}>
                <CardHeader className="space-y-2">
                  <CardTitle className="flex items-center gap-3 text-lg" style={{ color: BRAND.indigo }}>
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={{ border: `1px solid ${BRAND.indigo}33`, background: `${BRAND.indigo}12` }}
                    >
                      <CreditCard className="h-5 w-5" style={{ color: BRAND.indigo }} />
                    </span>
                    Payment summary
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600">
                    Transparent totals with taxes previewed up-front.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 text-sm">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Plan total ({getPlanDurationInfo()?.label})</span>
                      <span className="font-semibold text-slate-900">₹{finalTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Daily concierge staffing</span>
                      <span className="font-semibold" style={{ color: BRAND.indigo }}>Included</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Supplies & travel</span>
                      <span className="font-semibold" style={{ color: BRAND.indigo }}>Included</span>
                    </div>

                    <hr className="border-slate-200" />
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-semibold text-slate-900">₹{finalTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">GST 18%</span>
                      <span className="font-semibold text-slate-900">₹{gst.toFixed(0)}</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border px-4 py-3" style={{ borderColor: INDIGO_STYLES.border, background: `${BRAND.indigo}0d` }}>
                    <div className="flex items-center justify-between text-base font-semibold">
                      <span>Total payable</span>
                      <span style={{ color: BRAND.indigo }}>₹{totalWithGst.toFixed(0)}</span>
                    </div>

                    <p className="mt-1 text-xs text-center" style={{ color: `${BRAND.indigo}b3` }}>Charged once for the selected billing cycle</p>
                  </div>

                  <div className="pt-3">
                    <Button
                      className="w-full rounded-2xl py-4 text-lg font-semibold text-white shadow-lg transition hover:shadow-xl"
                      style={{ background: INDIGO_STYLES.gradient, boxShadow: `0 25px 65px -30px ${BRAND.indigo}8c` }}
                      onClick={handleMakePayment}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                          Processing…
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          Pay ₹{totalWithGst.toFixed(0)}
                        </span>
                      )}
                    </Button>
                    <p className="mt-3 text-center text-xs text-slate-500">🔒 Secured by Razorpay · Instant confirmation on success</p>
                  </div>
                </CardContent>
              </Card>

              {/* <Card className="rounded-3xl border border-slate-200 bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-base text-slate-900">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                      <Shield className="h-4 w-4 text-slate-600" />
                    </span>
                    SweePro assurance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-start gap-2">
                    <Check className="mt-1 h-4 w-4" style={{ color: BRAND.indigo }} />

                    <span>Dedicated relationship manager for rapid reschedules and concierge support.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="mt-1 h-4 w-4" style={{ color: BRAND.indigo }} />
                    <span>Backup crew commitment within six hours if your primary expert needs a break.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="mt-1 h-4 w-4" style={{ color: BRAND.indigo }} />
                    <span>Hospital-grade sanitation and eco-friendly essentials restocked proactively.</span>
                  </div>
                </CardContent>
              </Card> */}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}