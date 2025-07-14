import { Shield, Clock, Users, CreditCard } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Trusted Professionals',
    description: 'All our maids are background-verified, insured, and trained to deliver exceptional service.',
    color: 'text-success'
  },
  {
    icon: Clock,
    title: 'Flexible Scheduling',
    description: 'Book daily, weekly, or monthly visits. Reschedule anytime through our easy-to-use platform.',
    color: 'text-primary'
  },
  {
    icon: Users,
    title: 'Background Verified',
    description: 'Every cleaner undergoes thorough background checks and identity verification for your peace of mind.',
    color: 'text-warning'
  },
  {
    icon: CreditCard,
    title: 'Affordable Subscription',
    description: 'Simple monthly subscriptions with transparent pricing. No hidden fees or surprise charges.',
    color: 'text-primary'
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
              className="feature-card group text-center slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
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
          ))}
        </div>
      </div>
    </section>
  );
};