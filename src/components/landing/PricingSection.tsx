// PricingSection.tsx

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Crown, Zap, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SubscriptionPlan {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: any;
  gradient: string;
  features: string[];
}

interface PricingSectionProps {
  isAuthenticated?: boolean;
  onPlanSelect?: (planId: string) => void;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'standard',
    name: 'Sweepro Touch',
    tagline: 'Sweepro Touch',
    description:
      'A premium silver plan for medium-sized homes. Enjoy enhanced cleaning and priority service.',
    icon: Zap,
    gradient: 'from-blue-200 to-blue-300',
    features: [
      'AI-assisted cleaning',
      'Weekly deep clean',
      'Verified professionals',
      'Priority support'
    ]
  },
  {
    id: 'premium',
    name: 'Sweepro Lux',
    tagline: 'Sweepro Lux',
    description:
      'Ultimate cleaning experience for large homes and villas with luxury service.',
    icon: Crown,
    gradient: 'from-blue-900 to-red-600',
    features: [
      'Dedicated luxury team',
      'Daily upkeep option',
      'Premium eco products',
      '24/7 concierge support'
    ]
  }
];

export const PricingSection = ({ onPlanSelect }: PricingSectionProps) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [flippedCard, setFlippedCard] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <motion.section
      id="subscription-plans"
      className="relative min-h-screen py-24 bg-gradient-to-t from-white via-blue-200 to-white overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      {/* Header */}
      <div
        className={`text-center mb-20 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <h2 className="text-6xl font-black bg-gradient-to-r from-blue-900 to-red-900 bg-clip-text text-transparent mb-6">
          Home Care, Your Way
        </h2>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto">
          Experience the future of home cleaning with our AI-powered plans.
        </p>
      </div>

      {/* Cards */}
      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl w-full">
          {subscriptionPlans.map((plan, index) => {
            const Icon = plan.icon;
            const isFlipped = flippedCard === plan.id;

            return (
              <div
                key={plan.id}
                className="relative perspective-[1400px]"
                onMouseEnter={() => setHoveredCard(plan.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <Card
                  className={`relative overflow-hidden rounded-3xl border-0 bg-gradient-to-br ${
                    plan.gradient
                  } shadow-2xl ring-2 ring-white/10 transition-all duration-500 ${
                    hoveredCard === plan.id
                      ? 'scale-105 ring-white/30'
                      : 'hover:scale-[1.02]'
                  }`}
                >
                  {/* SHINE */}
                  <div
                    className={`absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transition-all duration-1000 ${
                      hoveredCard === plan.id
                        ? 'translate-x-[-50%] opacity-100'
                        : 'translate-x-full opacity-0'
                    }`}
                  />

                  {/* FLIP WRAPPER */}
                  <motion.div
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.9, ease: 'easeInOut' }}
                    className="relative h-[420px] preserve-3d"
                  >
                    {/* FRONT */}
                    <div className="absolute inset-0 backface-hidden">
                      <CardHeader className="text-center pt-12">
                        <div className="flex justify-center mb-6">
                          <div
                            className="relative p-4 rounded-2xl ring-4 ring-white/20 shadow-xl transition-transform duration-300 group-hover:scale-110"
                            style={{
                              background:
                                plan.id === 'standard'
                                  ? 'linear-gradient(135deg,#e5e7eb,#f3f4f6)'
                                  : 'linear-gradient(135deg,#fbbf24,#f59e0b)'
                            }}
                          >
                            <Icon
                              className={`h-8 w-8 ${
                                plan.id === 'standard'
                                  ? 'text-slate-700'
                                  : 'text-white'
                              } drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]`}
                            />
                          </div>
                        </div>
                        <CardTitle
                          className={`text-3xl font-bold ${
                            plan.id === 'standard'
                              ? 'text-black'
                              : 'text-white'
                          }`}
                        >
                          {plan.tagline}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="px-8 pb-12 space-y-6">
                        <p
                          className={`text-lg text-center ${
                            plan.id === 'standard'
                              ? 'text-black'
                              : 'text-white/90'
                          }`}
                        >
                          {plan.description}
                        </p>

                        <div className="flex justify-center gap-4">
                          <Button
                            className="rounded-full px-6"
                            onClick={() => setFlippedCard(plan.id)}
                          >
                            See More
                          </Button>
                        </div>
                      </CardContent>
                    </div>

                    {/* BACK */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 px-10 py-12 flex flex-col justify-between">
                      <div>
                        <h3 className="text-3xl font-bold text-center mb-6 text-white">
                          Features
                        </h3>

                        <ul className="space-y-4">
                          {plan.features.map((f, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-3 text-white text-lg"
                            >
                              <Check className="h-5 w-5 text-green-400" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <Button
                          className="w-full rounded-full"
                          onClick={() => onPlanSelect?.(plan.id)}
                        >
                          Buy Now
                        </Button>
                        <button
                          className="w-full text-sm underline text-white/80"
                          onClick={() => setFlippedCard(null)}
                        >
                          Back
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </motion.section>
  );
};
