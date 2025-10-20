//PricingSection.tsx

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Shield, Star, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SubscriptionPlan {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: any;
  gradient: string;
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
    description: 'A premium silver plan for medium-sized homes. Enjoy enhanced cleaning and priority service.',
    icon: Zap,
    gradient: 'from-[#C0C0C0] to-[#E0E0E0]'
  },
  {
    id: 'premium',
    name: 'Sweepro Lux',
    tagline: 'Sweepro Lux',
    description: 'Ultimate cleaning experience for large homes and villas with luxury service.',
    icon: Crown,
    gradient: 'from-yellow-400 to-yellow-700'
  }
];

export const PricingSection = ({ isAuthenticated = false, onPlanSelect }: PricingSectionProps) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animateCounters, setAnimateCounters] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => setAnimateCounters(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handlePlanSelect = (planId: string) => {
    if (onPlanSelect) {
      onPlanSelect(planId);
    }
  };

  const Counter = ({ end, duration = 2000, prefix = '', suffix = '' }: {
    end: string | number;
    duration?: number;
    prefix?: string;
    suffix?: string;
  }) => {
    const [count, setCount] = useState<string | number>(0);
    
    useEffect(() => {
      if (!animateCounters) return;
      
      let startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        
        if (typeof end === 'string') {
          if (progress === 1) {
            setCount(end);
          } else {
            const numericValue = parseFloat(end.replace(/[^0-9.]/g, ''));
            const currentValue = Math.floor(numericValue * easeOutQuart);
            setCount(end.includes('%') ? `${currentValue}%` : `${currentValue}K+`);
          }
        } else {
          setCount(Math.floor(end * easeOutQuart));
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }, [animateCounters, end, duration]);

    return <span>{prefix}{count}{suffix}</span>;
  };

  return (
    <section 
      id="subscription-plans"
      className="relative min-h-screen py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-400/30 to-yellow-500/30 rounded-full blur-3xl animate-bounce"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-gradient-to-r from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Enhanced Header */}
        <div className={`text-center mb-20 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-6xl font-black bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-6 tracking-tight">
            Choose Your Cleaning Plan
          </h2>
          <p className="text-xl text-blue-100/80 max-w-3xl mx-auto leading-relaxed">
            Experience the future of home cleaning with our AI-powered service plans. 
            From cozy spaces to luxury estates — we've got you covered.
          </p>
        </div>

        {/* Two Cards Grid - Centered */}
        <div className="flex justify-center mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
            {subscriptionPlans.map((plan, index) => {
              const IconComponent = plan.icon;
              return (
                <div
                  key={plan.id}
                  className={`transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                  onMouseEnter={() => setHoveredCard(plan.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <Card className={`relative group overflow-hidden border-0 rounded-3xl bg-gradient-to-br ${plan.gradient} backdrop-blur-2xl shadow-2xl transition-all duration-500 ring-2 ring-white/10 hover:ring-white/30 ${
                    hoveredCard === plan.id ? 'scale-105 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]' : 'hover:scale-[1.02]'
                  }`}>
                    <div className="relative">
                      {/* Shine effect on hover for card */}
                      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${hoveredCard === plan.id ? 'opacity-100' : 'opacity-0'} bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:-translate-x-1/2 transition-transform duration-1000 ease-out`}></div>
                      
                      <CardHeader className="text-center pb-6 relative z-10 pt-12">
                        <div className="flex justify-center mb-6">
                          <div className={`relative p-4 rounded-2xl shadow-xl ring-4 ring-white/20 group-hover:scale-110 transition-transform duration-300`}
                            style={{ 
                              background: plan.id === 'standard' ? 'linear-gradient(135deg, #e5e7eb 60%, #f3f4f6 100%)' : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                              boxShadow: hoveredCard === plan.id ? '0 0 32px 8px rgba(255,255,255,0.5), 0 0 64px 16px rgba(255,255,255,0.3)' : '0 4px 32px 0 rgba(0,0,0,0.2)' 
                            }}>
                            <IconComponent 
                              className={`h-8 w-8 ${plan.id === 'standard' ? 'text-slate-700' : 'text-white'} drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] ${hoveredCard === plan.id ? 'animate-shine' : 'animate-pulse'}`} 
                              style={{ filter: 'brightness(1.5) drop-shadow(0 0 8px rgba(255,255,255,0.8))' }} 
                            />
                            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${plan.id === 'standard' ? 'from-slate-300 to-slate-100' : 'from-yellow-300 to-yellow-500'} blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300`}></div>
                            {/* Sharp shine effect on hover for icon */}
                            {hoveredCard === plan.id && (
                              <div className="absolute inset-0 rounded-2xl pointer-events-none animate-shine-effect" style={{ background: 'linear-gradient(120deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.0) 60%)', opacity: 0.8 }}></div>
                            )}
                          </div>
                        </div>
                        <CardTitle className={`text-3xl font-bold mb-2 group-hover:scale-105 transition-transform duration-300 ${plan.id === 'standard' ? 'text-black' : 'text-white'}`}>
                          {plan.tagline}
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="space-y-6 relative z-10 pb-12 px-8">
                        <p className={`text-lg text-center leading-relaxed font-medium ${plan.id === 'standard' ? 'text-black' : 'text-white/90'}`}>
                          {plan.description}
                        </p>
                        <div className="flex justify-center">
                          <Button 
                            className={`px-8 py-3 rounded-full text-base font-semibold shadow-lg transition-all duration-300 ${
                              plan.id === 'standard' 
                                ? 'bg-white text-black hover:bg-white/90 hover:shadow-xl' 
                                : 'bg-white text-black hover:bg-white/90 hover:shadow-xl'
                            }`}
                            onClick={() => handlePlanSelect(plan.id)}
                          >
                            Learn More
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Stats Section */}
        <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`} style={{ transitionDelay: '600ms' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { value: '24/7', label: 'Customer Support', icon: Shield, gradient: 'from-green-400 to-emerald-500' },
              { value: '10K+', label: 'Happy Customers', icon: Star, gradient: 'from-yellow-400 to-orange-500' },
              { value: '99.9%', label: 'Satisfaction Rate', icon: Zap, gradient: 'from-blue-400 to-blue-600', iconColor:'#ffffff' }
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div 
                  key={index} 
                  className="group relative bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl py-10 px-8 ring-2 ring-white/10 hover:ring-white/30 transition-all duration-500 hover:scale-105 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]"
                >
                  {/* Background Glow */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-center mb-4">
                      <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-xl ring-4 ring-white/20 group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="h-6 w-6" style={{ color: stat.iconColor || '#fff' }} />
                      </div>
                    </div>
                    <div className="text-4xl font-black text-white mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Counter end={stat.value} duration={2000 + index * 200} />
                    </div>
                    <div className="text-blue-100/80 text-sm font-medium">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes shine-effect {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        .animate-shine-effect {
          animation: shine-effect 1.2s linear;
        }
      `}</style>
    </section>
  );
};