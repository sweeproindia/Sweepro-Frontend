import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Check, Clock, CreditCard, Shield, Sparkles, Home, MapPin, CheckCircle, Users, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PaymentService } from '@/services/paymentService';
import { SubscriptionService } from '@/services/subscriptionService';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

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
  bhkType: '1bhk' | '2bhk' | '3bhk' | '4bhk' | null;
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
  { id: '1bhk' as const, label: '1 BHK' },
  { id: '2bhk' as const, label: '2 BHK' },
  { id: '3bhk' as const, label: '3 BHK' },
  { id: '4bhk' as const, label: '4+ BHK' },
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center">
          {isLoading ? (
            <>
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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

    setIsProcessing(true);

    try {
      // Step 1: Resolve the actual backend plan and create a subscription
      // Map the selected UI plan (Sweepro Touch / Sweepro Lux) to the real
      // ServicePlan in the backend so we pass a valid planId.
      const plansResponse = await SubscriptionService.getSubscriptionPlans();
      const rawPlans: any = plansResponse.data;
      const backendPlans: any[] = Array.isArray(rawPlans)
        ? rawPlans
        : rawPlans?.plans || (plansResponse as any).plans || [];

      if (!backendPlans || backendPlans.length === 0) {
        throw new Error('No subscription plans are configured on the server.');
      }

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

      const subscriptionResponse = await SubscriptionService.subscribeToPlan(subscriptionData);
      const subscriptionPayload: any =
        (subscriptionResponse.data as any)?.subscription ||
        (subscriptionResponse.data as any) ||
        (subscriptionResponse as any).subscription;

      const createdSubscriptionId = subscriptionPayload?.id;
      if (!createdSubscriptionId) {
        throw new Error('Failed to create subscription');
      }

      // Step 2: Create Razorpay order for this subscription
      // Step 2: Create Razorpay order for this subscription using the exact
      // final amount shown in the payment summary (including GST). This keeps
      // the backend/Razorpay amount in sync with the UI.
      const orderResponse = await PaymentService.createRazorpaySubscriptionOrder(
        createdSubscriptionId,
        totalWithGst
      );
      if (!orderResponse.success || !orderResponse.data) {
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
        name: 'Sweep Pro',
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
        theme: { color: '#3B82F6' },
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
      setIsProcessing(false);
      toast({ title: 'Payment Failed', description: error.message || 'Failed to initialize payment. Please try again.', variant: 'destructive' });
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
    ].filter(Boolean);
    
    return parts.join(', ') || selectedOptions.address || 'Address not provided';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50" 
          onClick={handleBackToOptions}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Options
        </Button>

        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-full shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Review & Payment</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Review your selections and complete the payment to start your cleaning service</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          <div className="lg:col-span-7 space-y-6">
            {/* Selected Plan with Duration */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="h-6 w-6 text-blue-600" />
                  Selected Plan & Duration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedPlan.name}</h3>
                    <p className="text-gray-600">{selectedPlan.description}</p>
                    {selectedPlan.popular && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                        Most Popular
                      </span>
                    )}
                    <div className="mt-2">
                      <span className="inline-block px-3 py-1 text-sm font-semibold bg-purple-100 text-purple-800 rounded-full">
                        {getPlanDurationInfo()?.label} Plan
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">₹{finalTotal.toLocaleString()}</p>
                    <p className="text-gray-500">{getPlanDurationInfo()?.description}</p>
                    <p className="text-sm text-gray-400">Before GST</p>
                  </div>
                </div>
                <div className="p-4 bg-green-100 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800 mb-1">✨ All-inclusive pricing</p>
                  <p className="text-sm text-green-700">
                    This plan covers your {getBhkInfo()?.label} property with daily cleaning service. No hidden charges!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Service Breakdown */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Package className="h-6 w-6 text-purple-600" />
                  Detailed Service Breakdown
                </CardTitle>
                <p className="text-gray-600 mt-1">Complete breakdown of what's included in your {selectedPlan.name} plan</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Package className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="font-bold text-blue-900">Utensil Cleaning</p>
                    </div>
                    <p className="text-blue-700">{selectedPlan.serviceBreakdown.utensilCleaning}</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Home className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="font-bold text-green-900">Floor Cleaning</p>
                    </div>
                    <p className="text-green-700">{selectedPlan.serviceBreakdown.floorCleaning}</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-orange-100 p-2 rounded-full">
                        <Shield className="h-4 w-4 text-orange-600" />
                      </div>
                      <p className="font-bold text-orange-900">Bathroom Cleaning</p>
                    </div>
                    <p className="text-orange-700">{selectedPlan.serviceBreakdown.bathroomCleaning}</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                      </div>
                      <p className="font-bold text-purple-900">Home Dusting</p>
                    </div>
                    <p className="text-purple-700">{selectedPlan.serviceBreakdown.homeDusting}</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-indigo-100 p-2 rounded-full">
                        <Package className="h-4 w-4 text-indigo-600" />
                      </div>
                      <p className="font-bold text-indigo-900">Cleaning Kit</p>
                    </div>
                    <p className="text-indigo-700">{selectedPlan.serviceBreakdown.kitProvided}</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl border border-teal-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-teal-100 p-2 rounded-full">
                        <Clock className="h-4 w-4 text-teal-600" />
                      </div>
                      <p className="font-bold text-teal-900">Timings</p>
                    </div>
                    <p className="text-teal-700">{selectedPlan.serviceBreakdown.timings}</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-red-100 p-2 rounded-full">
                        <Shield className="h-4 w-4 text-red-600" />
                      </div>
                      <p className="font-bold text-red-900">Backup Guarantee</p>
                    </div>
                    <p className="text-red-700">{selectedPlan.serviceBreakdown.backupGuarantee}</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-yellow-100 p-2 rounded-full">
                        <Users className="h-4 w-4 text-yellow-600" />
                      </div>
                      <p className="font-bold text-yellow-900">Customer Care</p>
                    </div>
                    <p className="text-yellow-700">{selectedPlan.serviceBreakdown.customerCare}</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl border border-pink-200 md:col-span-2">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-pink-100 p-2 rounded-full">
                        <Calendar className="h-4 w-4 text-pink-600" />
                      </div>
                      <p className="font-bold text-pink-900">Buffer Days</p>
                    </div>
                    <p className="text-pink-700">{selectedPlan.serviceBreakdown.bufferDays}</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <p className="font-bold text-emerald-900">Service Summary</p>
                  </div>
                  <p className="text-emerald-700">
                    {selectedPlan.sessionsPerWeek} sessions per week • {selectedPlan.sessionsPerMonth} sessions per month
                  </p>
                  <p className="text-emerald-600 text-sm mt-1">
                    Consistent daily service with {selectedPlan.cancellation}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Service Schedule & Location */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="h-6 w-6 text-orange-600" />
                  Service Schedule & Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Time Slot</p>
                      <p className="text-gray-600">{selectedOptions.timeSlot}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Start Date</p>
                      <p className="text-gray-600">{formatDate(selectedOptions.startDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Clock className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Frequency</p>
                      <p className="text-gray-600">{DAILY_FREQUENCY.name}</p>
                      <p className="text-xs text-gray-500">{DAILY_FREQUENCY.description}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-green-600 mt-1" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Service Address</p>
                      <p className="text-gray-600 text-sm break-words">{formatAddress()}</p>
                      {selectedOptions.landmark && (
                        <p className="text-xs text-gray-500 mt-1">Landmark: {selectedOptions.landmark}</p>
                      )}
                      {(selectedOptions.latitude && selectedOptions.longitude) && (
                        <p className="text-xs text-gray-500 mt-1">
                          GPS: {selectedOptions.latitude.toFixed(4)}, {selectedOptions.longitude.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Information */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Home className="h-6 w-6 text-orange-600" />
                  Property Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
                    <span className="text-2xl">{getPropertyTypeInfo()?.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900">Property Type</p>
                      <p className="text-gray-600">{getPropertyTypeInfo()?.name}</p>
                      <p className="text-xs text-gray-500">{getPropertyTypeInfo()?.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
                    <Home className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Property Configuration</p>
                      <p className="text-gray-600">{getBhkInfo()?.label}</p>
                      <p className="text-xs text-gray-500">{selectedOptions.squareFeet} sq ft</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
                    <Check className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Plan Duration</p>
                      <p className="text-gray-600">{getPlanDurationInfo()?.label}</p>
                      <p className="text-xs text-gray-500">With applicable discounts</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-green-100 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800 mb-1">✅ Configuration Complete</p>
                  <p className="text-sm text-green-700">
                    Our team will provide daily cleaning service customized for your {getBhkInfo()?.label} {getPropertyTypeInfo()?.name.toLowerCase()} 
                    of {selectedOptions.squareFeet} sq ft.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-3">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm sticky top-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan Total ({getPlanDurationInfo()?.label}):</span>
                    <span className="font-semibold">₹{finalTotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily Service:</span>
                    <span className="font-semibold text-green-600">Included</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Property Coverage:</span>
                    <span className="font-semibold text-green-600">Included</span>
                  </div>

                  <hr className="border-gray-200" />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">₹{finalTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GST (18%):</span>
                    <span className="font-semibold">₹{gst.toFixed(0)}</span>
                  </div>
                  <hr className="border-gray-300" />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Final Amount:</span>
                    <span className="text-blue-600">₹{totalWithGst.toFixed(0)}</span>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    One-time payment for {getPlanDurationInfo()?.label.toLowerCase()} of service
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Button 
                    className="w-full py-4 text-lg font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200" 
                    onClick={handleMakePayment} 
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Pay ₹{totalWithGst.toFixed(0)}
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    🔒 Secure payment powered by Razorpay
                  </p>
                  <p className="text-xs text-gray-400 text-center mt-1">
                    Your payment information is encrypted and secure
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}