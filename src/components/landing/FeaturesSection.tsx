import { Clock, CreditCard, Shield, Users } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Trusted Professionals',
    description: 'All our maids are background-verified, insured, and trained to deliver exceptional service.',
    color: 'text-success',
    hasBackground: true,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' fill='none'%3E%3Cpath d='M100 40L140 60V100C140 140 120 160 100 180C80 160 60 140 60 100V60L100 40Z' stroke='%2310b981' stroke-width='4' fill='none'/%3E%3Cpath d='M100 60L120 70V100C120 120 110 130 100 140C90 130 80 120 80 100V70L100 60Z' fill='%2310b981' fill-opacity='0.1'/%3E%3Cpath d='M90 100L95 105L110 90' stroke='%2310b981' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
  },
  {
    icon: Clock,
    title: 'Flexible Scheduling',
    description: 'Book daily, weekly, or monthly visits. Reschedule anytime through our easy-to-use platform.',
    color: 'text-primary',
    hasBackground: true,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' fill='none'%3E%3Ccircle cx='100' cy='100' r='80' stroke='%2306b6d4' stroke-width='8' fill='none'/%3E%3Cpath d='M100 40V100L140 120' stroke='%2306b6d4' stroke-width='8' stroke-linecap='round'/%3E%3Ccircle cx='100' cy='100' r='8' fill='%2306b6d4'/%3E%3C/svg%3E")`
  },
  {
    icon: Users,
    title: 'Background Verified',
    description: 'Every cleaner undergoes thorough background checks and identity verification for your peace of mind.',
    color: 'text-warning',
    hasBackground: true,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' fill='none'%3E%3Crect x='40' y='60' width='120' height='80' rx='8' fill='%23f59e0b'/%3E%3Crect x='50' y='70' width='100' height='15' rx='4' fill='white'/%3E%3Crect x='50' y='95' width='80' height='10' rx='4' fill='white'/%3E%3Crect x='50' y='115' width='60' height='10' rx='4' fill='white'/%3E%3Ccircle cx='160' cy='85' r='8' fill='%23f59e0b'/%3E%3Cpath d='M155 80L158 83L165 76' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
  },
  {
    icon: CreditCard,
    title: 'Affordable Subscription',
    description: 'Simple monthly subscriptions with transparent pricing. No hidden fees or surprise charges.',
    color: 'text-primary',
    hasBackground: true,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' fill='none'%3E%3Crect x='40' y='80' width='120' height='80' rx='8' fill='%2306b6d4'/%3E%3Crect x='50' y='90' width='100' height='20' rx='4' fill='white'/%3E%3Crect x='50' y='120' width='60' height='30' rx='4' fill='white'/%3E%3Ccircle cx='160' cy='135' r='8' fill='%2306b6d4'/%3E%3C/svg%3E")`
  }
];

export const FeaturesSection = () => {
  return (
    <section id="services" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Why Choose CleanEase?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We make home cleaning simple, reliable, and affordable with our subscription-based service model.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className={`feature-card group text-center slide-up relative overflow-hidden ${
                feature.hasBackground 
                  ? feature.color === 'text-success' 
                    ? 'bg-gradient-to-br from-success/5 to-success/10' 
                    : feature.color === 'text-primary' 
                      ? 'bg-gradient-to-br from-primary/5 to-primary/10' 
                      : feature.color === 'text-warning' 
                        ? 'bg-gradient-to-br from-warning/5 to-warning/10' 
                        : 'bg-gradient-to-br from-primary/5 to-primary/10'
                  : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background Image for all cards */}
              {feature.hasBackground && (
                <div className="absolute inset-0 opacity-10">
                  <div 
                    className="w-full h-full bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: feature.backgroundImage
                    }}
                  />
                </div>
              )}
              
              <div className="relative z-10">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card border-2 border-border mb-6 group-hover:border-primary/30 transition-colors ${feature.color}`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};