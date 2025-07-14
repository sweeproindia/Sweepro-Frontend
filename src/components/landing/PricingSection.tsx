import { Check, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Basic',
    price: '₹1,999',
    period: '/month',
    description: 'Perfect for small apartments and minimal cleaning needs',
    features: [
      '2 visits per week',
      '2-3 hours per visit',
      'Basic cleaning supplies included',
      'Dusting and vacuuming',
      'Kitchen and bathroom cleaning',
      'Email support'
    ],
    popular: false,
    color: 'border-border'
  },
  {
    name: 'Standard',
    price: '₹3,499',
    period: '/month',
    description: 'Most popular choice for regular families',
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
    popular: true,
    color: 'border-primary'
  },
  {
    name: 'Premium',
    price: '₹5,999',
    period: '/month',
    description: 'Complete home management solution',
    features: [
      'Daily visits (7 days/week)',
      '4-5 hours per visit',
      'Luxury cleaning products',
      'Complete home organization',
      'Grocery shopping assistance',
      'Pet care assistance',
      'Dedicated cleaner assigned',
      '24/7 priority support',
      'Emergency cleaning',
      'Special event preparation'
    ],
    popular: false,
    color: 'border-warning'
  }
];

export const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your home. All plans include background-verified cleaners and satisfaction guarantee.
          </p>
          <div className="inline-flex items-center bg-success-light text-success px-4 py-2 rounded-full text-sm font-medium">
            <Crown className="h-4 w-4 mr-2" />
            30-day money-back guarantee on all plans
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={plan.name}
              className={`pricing-card ${plan.popular ? 'popular' : ''} slide-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center">
                    <Crown className="h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    {plan.period}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  {plan.description}
                </p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="h-5 w-5 text-success mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-auto">
                <Link to="/signup" state={{ selectedPlan: plan.name }}>
                  <Button 
                    className={`w-full py-3 ${plan.popular ? 'btn-hero' : 'border border-primary text-primary hover:bg-primary hover:text-primary-foreground'}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    Get Started
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Cancel anytime • No setup fees
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Additional Info */}
        <div className="mt-16 text-center fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <div className="text-2xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Customer Support</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary mb-2">10K+</div>
              <div className="text-sm text-muted-foreground">Happy Customers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};