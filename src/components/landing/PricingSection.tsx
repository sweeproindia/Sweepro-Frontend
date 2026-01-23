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
      'A thoughtfully designed premium cleaning plan that offers reliable, efficient service for a smooth and hassle-free experience.',
    icon: Zap,
    gradient: 'from-[#bcdcff] to-[#a9cfff]',
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
      'A premium upgrade that delivers superior care, greater attention to detail, and a more personalized cleaning experience.',
    icon: Crown,
    gradient: 'from-[#1800ad] to-[#1800ad]',
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
      className="relative min-h-screen py-24 bg-gradient-to-t from-white via-[#eeebe3] to-white overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      {/* Header */}
      <div
        className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >
        <h2 className="text-6xl font-black bg-gradient-to-r from-[#1800ad] to-[#ca0013] bg-clip-text text-transparent mb-6">
          Home Care, Your Way
        </h2>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto">
          Experience professional home care with flexible plans, trusted staff, and a service standard
          you can rely on.        </p>
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
                  className={`relative overflow-hidden rounded-3xl border-0 bg-gradient-to-br ${plan.gradient
                    } shadow-2xl ring-2 ring-white/10 transition-all duration-700 will-change-transform ${hoveredCard === plan.id
                      ? `scale-[1.06] -translate-y-2 ring-white/40 ${plan.id === 'standard'
                        ? 'shadow-[0_35px_90px_-30px_rgba(80,140,255,0.65)]'
                        : 'shadow-[0_35px_90px_-30px_rgba(24,0,173,0.55)]'
                      }`
                      : `${plan.id === 'standard'
                        ? 'hover:shadow-[0_30px_80px_-35px_rgba(80,140,255,0.55)]'
                        : 'hover:shadow-[0_30px_80px_-35px_rgba(24,0,173,0.5)]'
                      } hover:scale-[1.03] hover:-translate-y-1`
                    }`}
                >
                  {/* SHINE */}
                  <div
                    className={`absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-500 ${hoveredCard === plan.id ? 'opacity-100' : ''
                      } bg-[radial-gradient(900px_circle_at_25%_0%,rgba(255,255,255,0.55),transparent_55%)]`}
                  />

                  <div
                    className={`absolute -inset-y-16 -left-1/2 w-[200%] pointer-events-none bg-gradient-to-r from-transparent via-white/55 to-transparent blur-md mix-blend-overlay opacity-0 ${hoveredCard === plan.id ? 'animate-card-shine' : ''
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
                                  ? 'linear-gradient(135deg,#ffffff,#eaf3ff)'
                                  : 'linear-gradient(135deg,#1800ad,#1800ad)'
                            }}
                          >
                            <Icon
                              className={`h-8 w-8 ${plan.id === 'standard'
                                  ? 'text-slate-700'
                                  : 'text-white'
                                } drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]`}
                            />
                          </div>
                        </div>
                        <CardTitle
                          className={`text-3xl font-bold ${plan.id === 'standard'
                              ? 'text-black'
                              : 'text-white'
                            }`}
                        >
                          {plan.tagline}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="px-8 pb-12 space-y-6">
                        <p
                          className={`text-lg text-center ${plan.id === 'standard'
                              ? 'text-black'
                              : 'text-white/90'
                            }`}
                        >
                          {plan.description}
                        </p>

                        <div className="flex justify-center gap-4">
                          <Button
                            className={`rounded-full px-6 !bg-white hover:!bg-[#eeebe3] ${plan.id === 'premium' ? 'text-[#1800ad]' : 'text-slate-900'
                              }`}
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
                        <h3
                          className={`text-3xl font-bold text-center mb-6 ${plan.id === 'standard' ? 'text-[#1800ad]' : 'text-white'
                            }`}
                        >
                          Features
                        </h3>

                        <ul className="space-y-4">
                          {plan.features.map((f, i) => (
                            <li
                              key={i}
                              className={`flex items-center gap-3 text-lg ${plan.id === 'standard' ? 'text-slate-700' : 'text-white'
                                }`}
                            >
                              <Check
                                className={`h-5 w-5 ${plan.id === 'standard' ? 'text-[#1800ad]' : 'text-green-400'
                                  }`}
                              />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <Button
                          className={`w-full rounded-full !bg-white hover:!bg-[#eeebe3] ${plan.id === 'premium' ? 'text-[#1800ad]' : 'text-slate-900'
                            }`}
                          onClick={() => onPlanSelect?.(plan.id)}
                        >
                          Buy Now
                        </Button>
                        <button
                          className={`w-full text-sm underline ${plan.id === 'standard' ? 'text-[#1800ad]' : 'text-white/80'
                            }`}
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
        @keyframes card-shine {
          0% {
            transform: translateX(-120%) skewX(-12deg);
            opacity: 0;
          }
          15% {
            opacity: 0.95;
          }
          55% {
            opacity: 0.95;
          }
          100% {
            transform: translateX(120%) skewX(-12deg);
            opacity: 0;
          }
        }
        .animate-card-shine {
          animation: card-shine 1.8s ease-in-out infinite;
        }
      `}</style>
    </motion.section>
  );
};
