import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';

export const HeroSection = () => {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
          {/* Content */}
          <div className="mb-12 lg:mb-0">
            <div className="fade-in">
              <div className="flex items-center space-x-2 mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <span className="text-muted-foreground font-medium">Trusted by 10,000+ families</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Hassle-free{' '}
                <span className="bg-gradient-hero bg-clip-text text-transparent">
                  Maid Services
                </span>{' '}
                at Your Fingertips
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Subscribe once. Get daily, weekly, or monthly maid visits. 
                Professional, trusted, and background-verified cleaners for your home.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link to="/signup">
                  <Button className="btn-hero text-lg px-8 py-4">
                    Get Started Today
                  </Button>
                </Link>
                <Link to="/#how-it-works">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                    Learn More
                  </Button>
                </Link>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>Background Verified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>Flexible Scheduling</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>Satisfaction Guaranteed</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="relative slide-up">
            <div className="relative rounded-3xl overflow-hidden shadow-large">
              <img 
                src={heroImage} 
                alt="Professional maid service in modern home" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent"></div>
            </div>
            
            {/* Floating Stats Card */}
            <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl p-6 shadow-feature border border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">99.9%</div>
                <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
              </div>
            </div>
            
            {/* Floating Trust Badge */}
            <div className="absolute -top-6 -right-6 bg-success text-success-foreground rounded-full p-4 shadow-medium">
              <CheckCircle className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};