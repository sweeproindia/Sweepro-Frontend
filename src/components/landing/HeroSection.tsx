
import { Button } from '@/components/ui/button';
import { CheckCircle, Play, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HeroSection = () => {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden bg-white">
      {/* Blue Glowing Cone Effect with animation */}
      <div className="pointer-events-none absolute left-1/2 top-0 z-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-500 opacity-30 blur-3xl glow-animated" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          {/* Content */}
          <div className="mb-12 lg:mb-0">
            <div className="mb-6 slide-in-left" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-3xl font-bold text-[#0011D9] mb-2">CleanEase</h2>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6 slide-in-left" style={{ animationDelay: '0.4s' }}>
              Bring back the{' '}
              <span className="bg-gradient-to-r from-[#0011D9] to-blue-600 bg-clip-text text-transparent">
                cleanliness
              </span>{' '}
              and shine of your home
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed slide-in-left" style={{ animationDelay: '0.6s' }}>
              We provide you various cleaning services from top to bottom using the best products,
              advanced technology, and affordable pricing with trusted, background-verified professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8 slide-in-left" style={{ animationDelay: '0.8s' }}>
              <Link to="/signup">
                <Button className="bg-[#0011D9] hover:bg-blue-700 text-white text-lg px-8 rounded-lg shadow-lg">
                  Book Now
                </Button>
              </Link>
              <Link to="/#how-it-works">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-2 border-[#0011D9] text-[#0011D9] hover:bg-[#0011D9] hover:text-white transition-all flex items-center">
                  <Play className="h-5 w-5 mr-2" />
                  Watch Video
                </Button>
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 text-sm text-gray-500 slide-in-left" style={{ animationDelay: '1.0s' }}>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-[#0011D9]" />
                <span>Background Verified</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-[#0011D9]" />
                <span>Flexible Scheduling</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-[#0011D9]" />
                <span>Satisfaction Guaranteed</span>
              </div>
            </div>
          </div>

          {/* Hero Image and Testimonials */}
          <div className="relative slide-in-right" style={{ animationDelay: '1.2s' }}>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl max-w-md mx-auto">
              <img
                src="src\assets\image.png"
                alt="Professional maid service in modern home"
                className="w-full h-auto object-cover shadow-2xl"
              />
            </div>
            {/* Floating Testimonial Cards */}
            <div className="absolute -top-8 -left-8 bg-white rounded-2xl p-4 border border-gray-100 max-w-xs shadow-lg float-continuous" style={{ animationDelay: '1.4s' }}>
              <div className="flex items-start space-x-3">
                <Quote className="h-5 w-5 text-[#0011D9] mt-1" />
                <div>
                  <p className="text-sm text-gray-700 mb-2">
                    Regular cleaning from CleanEase provides the best service to maintain cleanliness and health of my home.
                  </p>
                  <p className="text-xs font-semibold text-[#0011D9]">Sarah Princeton</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-8 -right-8 bg-white rounded-2xl p-4 border border-gray-100 max-w-xs shadow-lg float-continuous" style={{ animationDelay: '1.6s' }}>
              <div className="flex items-start space-x-3">
                <Quote className="h-5 w-5 text-[#0011D9] mt-1" />
                <div>
                  <p className="text-sm text-gray-700 mb-2">
                    Found the right place for cleaning services for my complicated home layout. Thankful for CleanEase!
                  </p>
                  <p className="text-xs font-semibold text-[#0011D9]">Tamara Jules</p>
                </div>
              </div>
            </div>
            {/* Floating Trust Badge */}
            <div className="absolute top-4 right-4 bg-[#0011D9] text-white rounded-full p-3 shadow-lg" style={{ animationDelay: '1.8s' }}>
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 slide-in-left" style={{ animationDelay: '1.4s' }}>
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-[#0011D9]">15+</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Special Services</h3>
            <p className="text-gray-500 text-sm">Deep cleaning, move-in/out, post-construction</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-[#0011D9]">25+</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional Cleaners</h3>
            <p className="text-gray-500 text-sm">Background-verified, trained professionals</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-[#0011D9]">100%</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Eco-Friendly Products</h3>
            <p className="text-gray-500 text-sm">Safe, non-toxic cleaning solutions</p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Add to your global CSS (e.g., index.css or App.css):
// .slide-in-right { animation: slideInRight 0.8s ease-out forwards; }
// @keyframes slideInRight { from { opacity: 0; transform: translateX(60px); } to { opacity: 1; transform: translateX(0); } }