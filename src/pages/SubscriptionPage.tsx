import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Calendar, CreditCard, CheckCircle, ArrowUpRight, Settings } from 'lucide-react';

const currentPlan = {
  name: 'Standard',
  price: '₹3,499',
  period: '/month',
  features: [
    '5 visits per week',
    '3-4 hours per visit',
    'Premium cleaning supplies',
    'Deep cleaning included',
    'Laundry and ironing',
    'Kitchen organization',
    'Priority support',
    'Rescheduling flexibility'
  ],
  nextBilling: '2024-12-15',
  autoRenewal: true
};

const availablePlans = [
  {
    name: 'Basic',
    price: '₹1,999',
    period: '/month',
    description: 'Perfect for small apartments',
    features: ['2 visits per week', '2-3 hours per visit', 'Basic cleaning supplies', 'Email support'],
    current: false
  },
  {
    name: 'Standard',
    price: '₹3,499',
    period: '/month',
    description: 'Most popular for families',
    features: ['5 visits per week', '3-4 hours per visit', 'Premium supplies', 'Priority support'],
    current: true
  },
  {
    name: 'Premium',
    price: '₹5,999',
    period: '/month',
    description: 'Complete home management',
    features: ['Daily visits', '4-5 hours per visit', 'Luxury products', '24/7 support'],
    current: false
  }
];

export default function SubscriptionPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="fade-in">
          <h1 className="text-3xl font-bold text-foreground">Subscription Details</h1>
          <p className="text-muted-foreground mt-2">
            Manage your cleaning service subscription and billing preferences
          </p>
        </div>

        {/* Current Plan Overview */}
        <Card className="dashboard-card slide-up bg-gradient-feature">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">Current Plan: {currentPlan.name}</CardTitle>
              </div>
              <Badge className="bg-success text-success-foreground">Active</Badge>
            </div>
            <CardDescription>Your subscription is active and running smoothly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{currentPlan.price}</div>
                <div className="text-muted-foreground">{currentPlan.period}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">Dec 15</div>
                <div className="text-muted-foreground">Next billing date</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success">47</div>
                <div className="text-muted-foreground">Completed visits</div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Update</Button>
                  <Button variant="outline" size="sm" onClick={() => window.print()}>
                    Download
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-foreground mb-3">Plan Features</h4>
                <ul className="space-y-2">
                  {currentPlan.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-3">Additional Benefits</h4>
                <ul className="space-y-2">
                  {currentPlan.features.slice(4).map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Time Slot Information */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Fixed Time Slot</h4>
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-lg font-medium text-foreground">10:00 AM - 1:00 PM</p>
                  <p className="text-sm text-muted-foreground">Duration: 3 hours</p>
                </div>
                <Badge variant="secondary">Set during subscription</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Contact support to change your preferred time slot
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Manage Billing
              </Button>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Pause Subscription
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Billing Information */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
            <CardDescription>Payment method and billing history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium text-foreground">•••• •••• •••• 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/27</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Update</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Auto-Renewal</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {currentPlan.autoRenewal ? 'Enabled' : 'Disabled'} - Your subscription will automatically renew on {new Date(currentPlan.nextBilling).toLocaleDateString()}
                </p>
                <Button variant="outline" size="sm">
                  {currentPlan.autoRenewal ? 'Disable' : 'Enable'} Auto-Renewal
                </Button>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Billing Address</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  123 Main Street<br />
                  Apartment 4B<br />
                  Mumbai, Maharashtra 400001
                </p>
                <Button variant="outline" size="sm">Update Address</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <CardTitle>Change Your Plan</CardTitle>
            <CardDescription>Upgrade or downgrade your subscription anytime</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {availablePlans.map((plan, index) => (
                <div
                  key={plan.name}
                  className={`relative p-6 rounded-xl border ${
                    plan.current ? 'border-primary bg-primary/5' : 'border-border bg-card'
                  } transition-all hover:shadow-medium`}
                >
                  {plan.current && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Current Plan</Badge>
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    <div className="flex items-baseline justify-center mt-2">
                      <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground ml-1">{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-success mr-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${plan.current ? 'opacity-50 cursor-not-allowed' : ''}`}
                    variant={plan.current ? 'outline' : 'default'}
                    disabled={plan.current}
                  >
                    {plan.current ? 'Current Plan' : 
                     plan.name === 'Premium' ? (
                       <>
                         Upgrade <ArrowUpRight className="h-4 w-4 ml-1" />
                       </>
                     ) : 'Downgrade'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
            <CardDescription>Your cleaning service usage this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">12</div>
                <div className="text-sm text-muted-foreground">Visits Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">36</div>
                <div className="text-sm text-muted-foreground">Hours of Service</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">4.9</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">₹291</div>
                <div className="text-sm text-muted-foreground">Cost per Visit</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}