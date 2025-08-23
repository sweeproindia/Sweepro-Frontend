import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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

// Enhanced subscription plans with more realistic data
const subscriptionPlans: Record<string, SubscriptionPlan> = {
  basic: {
    id: 'basic',
    name: 'Basic Clean',
    price: 999,
    duration: 'month',
    description: 'Perfect for small apartments and regular maintenance',
    features: [
      'Weekly cleaning service',
      'Basic cleaning supplies included',
      'Standard 2-hour service',
      'Kitchen & bathroom focus',
      'Vacuum & mop floors',
      'Dust surfaces and furniture',
      'Empty trash bins',
      'Basic sanitization'
    ],
    serviceHours: '2 hours per session',
    coverage: 'Kitchen, Bathroom, Living Room, Bedroom',
    teamSize: '1 professional cleaner',
    cancellation: '24 hours notice required'
  },
  standard: {
    id: 'standard',
    name: 'Standard Plus',
    price: 1499,
    duration: 'month',
    description: 'Ideal for medium-sized homes with enhanced services',
    features: [
      'Bi-weekly deep cleaning',
      'Premium cleaning supplies',
      '3-hour comprehensive service',
      'All rooms included',
      'Appliance cleaning',
      'Window cleaning',
      'Priority scheduling',
      'Deep carpet cleaning',
      'Furniture polishing',
      'Cabinet organization'
    ],
    popular: true,
    serviceHours: '3 hours per session',
    coverage: 'All indoor areas + Balcony',
    teamSize: '2 professional cleaners',
    cancellation: '12 hours notice required'
  },
  premium: {
    id: 'premium',
    name: 'Premium Complete',
    price: 2499,
    duration: 'month',
    description: 'Ultimate cleaning experience for large homes and villas',
    features: [
      'Weekly premium cleaning',
      'Luxury cleaning supplies',
      '4-hour detailed service',
      'All rooms + outdoor areas',
      'Deep carpet cleaning',
      'Furniture polishing',
      '24/7 support',
      'Free cancellation',
      'Premium air fresheners',
      'Specialty surface treatment',
      'Outdoor area cleaning',
      'Express service available'
    ],
    discount: 20,
    originalPrice: 3125,
    serviceHours: '4 hours per session',
    coverage: 'Complete home + Outdoor areas',
    teamSize: '3 professional cleaners',
    cancellation: 'Free cancellation anytime'
  },
  // Add more plans for backend integration
  pro: {
    id: 'pro',
    name: 'Pro Plan',
    price: 1999,
    duration: 'month',
    description: 'Professional service for busy households',
    features: [
      'Utensils cleaning (daily service)',
      'Bathroom cleaning (weekly service)', 
      'Floor sweeping (thrice weekly)',
      'Floor mopping (thrice weekly)',
      'Washing clothes (on request)',
      'Premium cleaning supplies',
      'Flexible scheduling',
      'Quality assurance'
    ],
    serviceHours: '2-3 hours per session',
    coverage: 'Kitchen, Bathroom, All floor areas',
    teamSize: '1-2 professional cleaners',
    cancellation: '24 hours notice required'
  }
};

export default function SubscriptionDetailsPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(planId || 'basic');

  // Get plan from URL params or default to basic
  const plan = subscriptionPlans[planId || 'basic'] || subscriptionPlans.basic;

  useEffect(() => {
    // Update selected plan when URL changes
    if (planId && subscriptionPlans[planId]) {
      setSelectedPlan(planId);
    }
  }, [planId]);

  const handleProceedToPayment = () => {
    // Navigate to payment options with the selected plan
    navigate('/payment-options', { 
      state: { 
        selectedPlan: plan
      } 
    });
  };

  const handlePlanChange = (newPlanId: string) => {
    setSelectedPlan(newPlanId);
    // Update URL to reflect the new plan
    navigate(`/subscription/${newPlanId}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 text-blue-600 hover:text-blue-700"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Plan Selection Tabs - if multiple plans available */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {Object.entries(subscriptionPlans).map(([id, planData]) => (
              <button
                key={id}
                onClick={() => handlePlanChange(id)}
                className={`px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 ${
                  selectedPlan === id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {planData.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Features Card */}
        <Card className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-4xl mx-auto">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold text-blue-600 mb-2">
              {plan.name} Features
            </CardTitle>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {plan.description}
            </p>
            {plan.popular && (
              <div className="mt-4">
                <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                  Most Popular Plan
                </span>
              </div>
            )}
            
            {/* Price Display */}
            <div className="mt-6">
              <div className="flex items-baseline justify-center">
                {plan.originalPrice && plan.discount ? (
                  <>
                    <span className="text-2xl text-gray-500 line-through mr-2">₹{plan.originalPrice}</span>
                    <span className="text-4xl font-bold text-blue-600">₹{plan.price}</span>
                  </>
                ) : (
                  <span className="text-4xl font-bold text-blue-600">₹{plan.price}</span>
                )}
                <span className="text-gray-500 ml-2">/{plan.duration}</span>
              </div>
              {plan.discount && (
                <div className="mt-2">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    Save {plan.discount}%
                  </span>
                </div>
              )}
            </div>
            <hr className="border-gray-200 mt-6" />
          </CardHeader>

          <CardContent className="space-y-8 px-8 pb-8">
            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Features List */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">What's Included</h3>
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="bg-blue-100 p-1 rounded-full mt-0.5 flex-shrink-0">
                        <Check className="h-3 w-3 text-blue-600" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Service Details</h3>
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-900">Service Duration</p>
                    <p className="text-gray-600">{plan.serviceHours}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-900">Coverage Area</p>
                    <p className="text-gray-600">{plan.coverage}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-900">Team Size</p>
                    <p className="text-gray-600">{plan.teamSize}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-900">Cancellation Policy</p>
                    <p className="text-gray-600">{plan.cancellation}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center pt-4">
              <Button
                className="w-full py-4 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={handleProceedToPayment}
              >
                Schedule {plan.name}
              </Button>
              <p className="text-sm text-gray-500 mt-3">
                Secure booking • No hidden charges • Cancel anytime
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold text-blue-900 mb-3">Why Choose Our Service?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-semibold text-blue-800 mb-1">🛡 Insured & Bonded</div>
                  <p className="text-blue-700">All our cleaners are fully insured and background verified</p>
                </div>
                <div>
                  <div className="font-semibold text-blue-800 mb-1">⭐ Quality Guarantee</div>
                  <p className="text-blue-700">100% satisfaction guaranteed or we'll come back for free</p>
                </div>
                <div>
                  <div className="font-semibold text-blue-800 mb-1">📱 Easy Management</div>
                  <p className="text-blue-700">Manage bookings, schedule changes, and payments through our app</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}