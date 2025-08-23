import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Check, Clock, CreditCard, Shield, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PaymentService } from '@/services/paymentService';
import { SubscriptionService } from '@/services/subscriptionService';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  features: string[];
  popular?: boolean;
  discount?: number;
  originalPrice?: number;
  serviceHours: string;
  coverage: string;
  teamSize: string;
  cancellation: string;
}

interface ServiceOptions {
  timeSlot: string; // e.g., "09:00 - 10:00"
  startDate: string; // yyyy-mm-dd
  frequency: string; // weekly | biweekly | monthly | daily
  address: string;
  latitude?: number;
  longitude?: number;
}

const frequencies = [
  { id: 'weekly', name: 'Weekly', description: 'Every 7 days', price: 0 },
  { id: 'biweekly', name: 'Bi-weekly', description: 'Every 14 days', price: -200 },
  { id: 'monthly', name: 'Monthly', description: 'Every 30 days', price: -500 },
  { id: 'daily', name: 'Daily', description: 'Every day', price: 0 },
];

export default function ReviewPaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPlan = location.state?.selectedPlan as SubscriptionPlan;
  const selectedOptions = location.state?.selectedOptions as ServiceOptions;
  const { user } = useUser();
  const { toast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!selectedPlan || !selectedOptions) {
      navigate('/subscription');
    }
  }, [selectedPlan, selectedOptions, navigate]);

  if (!selectedPlan || !selectedOptions) {
    return null;
  }

  const getFrequencyName = (id: string) => {
    return frequencies.find(freq => freq.id === id)?.name || id;
  };

  const getFrequencyPrice = () => {
    const frequency = frequencies.find(f => f.id === selectedOptions.frequency);
    return frequency?.price || 0;
  };

  const basePrice = selectedPlan.price;
  const frequencyAdjustment = getFrequencyPrice();
  const subtotal = basePrice + frequencyAdjustment;
  const gst = subtotal * 0.18; // 18% GST
  const total = subtotal + gst;

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
      // Step 1: Create subscription first (before payment)
      const subscriptionData = {
        planId: selectedPlan.id,
        paymentMethod: 'RAZORPAY',
        autoRenewal: true,
        startDate: selectedOptions.startDate,
      };

      const subscriptionResponse = await SubscriptionService.subscribeToPlan(subscriptionData);
      const createdSubscriptionId = subscriptionResponse.data?.subscription?.id;
      if (!createdSubscriptionId) {
        throw new Error('Failed to create subscription');
      }

      // Step 2: Create Razorpay order for this subscription
      const orderResponse = await PaymentService.createRazorpaySubscriptionOrder(createdSubscriptionId);
      if (!orderResponse.success || !orderResponse.data) {
        throw new Error('Failed to create payment order');
      }

      // Align response to Razorpay expected fields
      const orderId = (orderResponse.data as any).orderId;
      const amount = (orderResponse.data as any).amount;
      const currency = (orderResponse.data as any).currency;
      const key = (orderResponse.data as any).key;

      const razorpayOptions = {
        key,
        amount,
        currency,
        name: 'Sweep Pro',
        description: `${selectedPlan.name} Subscription`,
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
      if (verificationResponse.success) {
        toast({ title: 'Payment Successful!', description: `Your ${selectedPlan.name} subscription has been activated.` });
        navigate('/payment-success', {
          state: {
            paymentId: verificationResponse.data?.payment?.id,
            orderId: razorpayResponse.razorpay_order_id,
            amount: total,
            subscriptionId: subscriptionId,
            selectedPlan,
            selectedOptions
          }
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
    navigate('/payment-failure', { state: { orderId, errorCode, errorDescription, amount: total, selectedPlan, selectedOptions } });
    setIsProcessing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Button variant="ghost" className="mb-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => navigate('/payment-options', { state: { selectedPlan, selectedOptions } })}>
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
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="h-6 w-6 text-blue-600" />
                  Selected Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedPlan.name}</h3>
                    <p className="text-gray-600">{selectedPlan.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">₹{selectedPlan.price}</p>
                    <p className="text-gray-500">per {selectedPlan.duration}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="h-6 w-6 text-orange-600" />
                  Service Schedule & Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Time Slot</p>
                      <p className="text-gray-600">{selectedOptions.timeSlot}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Start Date</p>
                      <p className="text-gray-600">{formatDate(selectedOptions.startDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Frequency</p>
                      <p className="text-gray-600">{getFrequencyName(selectedOptions.frequency)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Address</p>
                      <p className="text-gray-600 break-words">{selectedOptions.address || 'Not provided'}</p>
                      {(selectedOptions.latitude && selectedOptions.longitude) && (
                        <p className="text-xs text-gray-500 mt-1">Location: {selectedOptions.latitude.toFixed(4)}, {selectedOptions.longitude.toFixed(4)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Check className="h-6 w-6 text-green-600" />
                  Service Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Service Duration</p>
                      <p className="text-gray-600">{selectedPlan.serviceHours}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Coverage</p>
                      <p className="text-gray-600">{selectedPlan.coverage}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Shield className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Cancellation</p>
                      <p className="text-gray-600">{selectedPlan.cancellation}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm sticky top-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  Bill Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Plan:</span>
                    <span className="font-semibold">₹{basePrice}</span>
                  </div>

                  {frequencyAdjustment !== 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frequency:</span>
                      <span className={`font-semibold ${frequencyAdjustment < 0 ? 'text-green-600' : 'text-red-600'}`}>{frequencyAdjustment > 0 ? '+' : ''}₹{frequencyAdjustment}</span>
                    </div>
                  )}

                  <hr className="border-gray-200" />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GST (18%):</span>
                    <span className="font-semibold">₹{gst.toFixed(0)}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600">₹{total.toFixed(0)}</span>
                  </div>
                </div>

                <Button className="w-full py-4 text-lg font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200" onClick={handleMakePayment} disabled={isProcessing}>
                  {isProcessing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Make Payment
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 text-center">Secure payment powered by industry-leading encryption</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
