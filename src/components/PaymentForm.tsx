import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';
import { Plan } from '@/types/user';
import { useToast } from '@/hooks/use-toast';

interface PaymentFormProps {
  plan: Plan;
  onComplete: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ plan, onComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }

    // Format expiry date
    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
    }

    setPaymentData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate successful payment
    toast({
      title: "Payment Successful!",
      description: `Your ${plan.name} subscription has been activated.`,
    });

    setIsProcessing(false);
    onComplete();
  };

  const isFormValid = paymentData.cardNumber.replace(/\s/g, '').length === 16 &&
    paymentData.expiryDate.length === 5 &&
    paymentData.cvv.length === 3 &&
    paymentData.cardholderName.length > 0;

  return (
    <div className="space-y-6">
      {/* Plan Summary */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">{plan.name} Plan</h4>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">₹{plan.price.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">per month</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Label htmlFor="cardholderName">Cardholder Name</Label>
          <Input
            id="cardholderName"
            name="cardholderName"
            value={paymentData.cardholderName}
            onChange={handleInputChange}
            placeholder="Enter cardholder name"
            required
          />
        </div>

        <div className="space-y-4">
          <Label htmlFor="cardNumber">Card Number</Label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="cardNumber"
              name="cardNumber"
              value={paymentData.cardNumber}
              onChange={handleInputChange}
              placeholder="1234 5678 9012 3456"
              className="pl-10"
              maxLength={19}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              name="expiryDate"
              value={paymentData.expiryDate}
              onChange={handleInputChange}
              placeholder="MM/YY"
              maxLength={5}
              required
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              name="cvv"
              value={paymentData.cvv}
              onChange={handleInputChange}
              placeholder="123"
              maxLength={3}
              required
            />
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-center space-x-2 p-4 bg-muted/30 rounded-lg">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Your payment information is encrypted and secure
          </span>
        </div>

        {/* Payment Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={!isFormValid || isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Processing Payment...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Pay ₹{plan.price.toLocaleString()}
            </>
          )}
        </Button>
      </form>

      {/* Payment Methods */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">We accept</p>
        <div className="flex justify-center space-x-4">
          <Badge variant="outline">Visa</Badge>
          <Badge variant="outline">Mastercard</Badge>
          <Badge variant="outline">Rupay</Badge>
          <Badge variant="outline">UPI</Badge>
        </div>
      </div>
    </div>
  );
}; 