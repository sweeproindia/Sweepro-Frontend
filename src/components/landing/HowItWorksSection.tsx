import { UserPlus, Calendar, CreditCard, Smile, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Select Subscription',
    description: 'Choose the perfect plan for your needs - Basic, Standard, or Premium.',
    step: '01'
  },
  {
    icon: Calendar,
    title: 'Schedule Visits',
    description: 'Pick your preferred days and times. We handle the rest automatically.',
    step: '02'
  },
  {
    icon: CreditCard,
    title: 'Secure Payment',
    description: 'Pay safely through Razorpay with multiple payment options.',
    step: '03'
  },
  {
    icon: CheckCircle,
    title: 'Professional Service',
    description: 'Our verified cleaners arrive on time and deliver excellent results.',
    step: '04'
  },
  {
    icon: Smile,
    title: 'Relax & Enjoy',
    description: 'Come home to a spotless house and enjoy your free time.',
    step: '05'
  }
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Getting started is simple. Follow these easy steps to transform your cleaning routine.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {steps.map((step, index) => (
            <div 
              key={step.title}
              className="relative text-center group slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Connection Line (hidden on mobile and last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary to-transparent transform translate-x-4 translate-y-2"></div>
              )}
              
              {/* Step Number */}
              <div className="relative mb-6">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-hero text-primary-foreground font-bold text-lg mb-4 group-hover:scale-110 transition-transform">
                  {step.step}
                </div>
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse"></div>
              </div>
              
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                <step.icon className="h-6 w-6" />
              </div>
              
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {step.title}
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* CTA Section */}
        <div className="text-center mt-16 fade-in">
          <div className="bg-gradient-feature rounded-3xl p-8 border border-primary/20">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of satisfied customers who have transformed their homes with CleanEase.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#pricing" className="btn-hero inline-flex items-center justify-center px-8 py-3 text-base">
                View Pricing Plans
              </a>
              <a href="/signup" className="inline-flex items-center justify-center px-8 py-3 text-base border border-primary text-primary rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors">
                Start Free Trial
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};