import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Crown, AlertTriangle, CreditCard } from 'lucide-react';
import { Plan, UserStatus } from '@/types/user';
import { availablePlans } from '@/data/plans';
import { UserProfileForm } from './UserProfileForm';
import { PaymentForm } from './PaymentForm';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStatus: UserStatus;
  onSubscriptionComplete: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  userStatus,
  onSubscriptionComplete
}) => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [step, setStep] = useState<'plans' | 'profile' | 'payment'>('plans');
  const [userProfile, setUserProfile] = useState<any>(null);

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setStep('profile');
  };

  const handleProfileSubmit = (profile: any) => {
    setUserProfile(profile);
    setStep('payment');
  };

    const handlePaymentComplete = async () => {
      if (!selectedPlan) return;
      try {
        // Call backend to save subscription
        const subscribeData = {
          planId: selectedPlan.id,
          paymentMethod: 'CARD', // or get from payment form
          autoRenewal: true,
          startDate: new Date().toISOString(),
          // Optionally include userProfile fields if backend expects them
        };
        // You may want to merge userProfile data if needed
        await import('@/services/subscriptionService').then(({ SubscriptionService }) =>
          SubscriptionService.subscribeToPlan(subscribeData)
        );
        onSubscriptionComplete();
        onClose();
        setStep('plans');
        setSelectedPlan(null);
        setUserProfile(null);
      } catch (error) {
        // Handle error (show toast, etc.)
        console.error('Subscription save failed:', error);
      }
  };

  const getModalTitle = () => {
    switch (userStatus) {
      case 'inactive':
        return 'Choose Your Plan';
      case 'pending':
        return 'Renew Your Subscription';
      default:
        return 'Subscription';
    }
  };

  const getModalDescription = () => {
    switch (userStatus) {
      case 'inactive':
        return 'Select a plan to start enjoying our premium cleaning services';
      case 'pending':
        return 'Your subscription has expired. Choose a plan to continue services';
      default:
        return '';
    }
  };

  const renderPlansStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {availablePlans.map((plan) => (
          <Card
            key={plan.id}
            className={`cursor-pointer transition-all hover:shadow-medium ${
              selectedPlan?.id === plan.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handlePlanSelect(plan)}
          >
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-2">
                {plan.type === 'Premium' && <Crown className="h-5 w-5 text-yellow-500 mr-2" />}
                <CardTitle className="text-xl">{plan.name}</CardTitle>
              </div>
              <div className="flex items-baseline justify-center">
                <span className="text-3xl font-bold">₹{plan.price.toLocaleString()}</span>
                <span className="text-muted-foreground ml-1">/month</span>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-success mr-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-4" variant="outline">
                Select Plan
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderProfileStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Complete Your Profile</h3>
        <p className="text-muted-foreground">
          Please provide your details to set up your subscription
        </p>
      </div>
      <UserProfileForm onSubmit={handleProfileSubmit} />
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Payment Information</h3>
        <p className="text-muted-foreground">
          Complete your subscription with secure payment
        </p>
      </div>
      <PaymentForm 
        plan={selectedPlan!}
        onComplete={handlePaymentComplete}
      />
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {userStatus === 'pending' && <AlertTriangle className="h-5 w-5 text-warning" />}
            {userStatus === 'inactive' && <CreditCard className="h-5 w-5 text-primary" />}
            {getModalTitle()}
          </DialogTitle>
          <DialogDescription>{getModalDescription()}</DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {step === 'plans' && renderPlansStep()}
          {step === 'profile' && renderProfileStep()}
          {step === 'payment' && renderPaymentStep()}
        </div>

        {step !== 'plans' && (
          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                if (step === 'payment') {
                  setStep('profile');
                } else if (step === 'profile') {
                  setStep('plans');
                }
              }}
            >
              Back
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}; 