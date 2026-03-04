import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Lock, Loader2, AlertCircle } from 'lucide-react';
import { Plan } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { PaymentService } from '@/services/paymentService';
import { SubscriptionService } from '@/services/subscriptionService';
import { useUser } from '@/contexts/UserContext';

interface PaymentFormProps {
  plan: Plan;
  onComplete: (paymentResult?: any) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ plan, onComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useUser();

  const handleRazorpayPayment = async () => {
    if (!user) {
      toast({ title: 'Authentication Required', description: 'Please log in to continue.', variant: 'destructive' });
      return;
    }
    if (!plan.price || plan.price <= 0) {
      toast({ title: 'Invalid Amount', description: 'Plan price is not set correctly.', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Create subscription on backend (status: PENDING_PAYMENT)
      const subscriptionResponse = await SubscriptionService.subscribeToPlan({
        planId: plan.id,
        paymentMethod: 'RAZORPAY',
        autoRenewal: true,
        startDate: new Date().toISOString(),
      });

      const subscriptionPayload: any =
        (subscriptionResponse.data as any)?.subscription ||
        (subscriptionResponse.data as any) ||
        (subscriptionResponse as any).subscription;

      const subscriptionId = subscriptionPayload?.id;
      if (!subscriptionId) throw new Error('Failed to initialize subscription. Please try again.');

      // Step 2: Create Razorpay order
      const orderResponse = await PaymentService.createRazorpaySubscriptionOrder(subscriptionId, plan.price);
      if (!orderResponse.success || !orderResponse.data) throw new Error('Failed to create payment order. Please try again.');

      const { orderId, amount, currency, key } = orderResponse.data as any;
      if (!orderId || !key) throw new Error('Invalid payment order received from server.');

      // Step 3: Open Razorpay checkout modal
      const razorpayResult = await PaymentService.initializeRazorpayPayment({
        key,
        amount,
        currency: currency || 'INR',
        name: 'Sweepro',
        description: `${plan.name} Subscription`,
        order_id: orderId,
        prefill: {
          name: (user as any).name || '',
          email: (user as any).email || '',
          contact: (user as any).phone || '',
        },
        notes: {
          planId: plan.id,
          planName: plan.name,
          subscriptionId,
          customerId: (user as any).id,
        },
        theme: { color: '#1800ad' },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast({ title: 'Payment Cancelled', description: 'You can retry the payment at any time.' });
          },
        },
      });

      // Step 4: Verify payment signature on backend
      const verificationResponse = await PaymentService.verifyRazorpayPayment({
        razorpay_order_id: razorpayResult.razorpay_order_id,
        razorpay_payment_id: razorpayResult.razorpay_payment_id,
        razorpay_signature: razorpayResult.razorpay_signature,
        subscriptionId,
      });

      if (!verificationResponse.success) throw new Error('Payment verification failed. Please contact support.');

      toast({ title: 'Payment Successful!', description: `Your ${plan.name} subscription has been activated.` });
      onComplete(verificationResponse.data);
    } catch (err: any) {
      const message = err?.message || 'An unexpected error occurred. Please try again.';
      setError(message);
      toast({ title: 'Payment Failed', description: message, variant: 'destructive' });
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Plan Summary */}
      <Card className="bg-muted/30">
        <CardHeader><CardTitle className="text-lg">Order Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">{plan.name}</h4>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">?{(plan.price || 0).toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">per month</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Banner */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Security notice */}
      <div className="flex items-center gap-2 rounded-lg bg-muted/30 p-4">
        <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Payments are processed securely by Razorpay. We never store your card details.
        </span>
      </div>

      {/* Pay Button */}
      <Button className="w-full" size="lg" disabled={isProcessing} onClick={handleRazorpayPayment}>
        {isProcessing ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing…</>
        ) : (
          <><CheckCircle className="mr-2 h-4 w-4" />Pay ?{(plan.price || 0).toLocaleString()} via Razorpay</>
        )}
      </Button>

      {/* Accepted methods */}
      <div className="text-center">
        <p className="mb-2 text-sm text-muted-foreground">We accept</p>
        <div className="flex justify-center gap-2 flex-wrap">
          {['Visa', 'Mastercard', 'Rupay', 'UPI', 'Net Banking'].map((m) => (
            <Badge key={m} variant="outline">{m}</Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
