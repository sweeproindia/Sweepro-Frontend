import { Footer } from '@/components/Footer';
import { FAQSection } from '@/components/landing/FAQSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { Navbar } from '@/components/Navbar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import LoginForm from '@/components/ui/LoginForm';
import SignupForm from '@/components/ui/SignupForm';
import { useState } from 'react';
import { BookingFormProvider } from '@/contexts/BookingFormContext';

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');

  // Pass these to Navbar so it can trigger the modal and set the correct tab
  const handleOpenLogin = () => {
    setAuthTab('login');
    setAuthOpen(true);
  };
  const handleOpenSignup = () => {
    setAuthTab('signup');
    setAuthOpen(true);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      {/* Wrap all booking-related sections in BookingFormProvider */}
      <BookingFormProvider>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
      </BookingFormProvider>
      <Footer />

      {/* Unified Auth Modal */}
      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="w-full max-w-sm sm:max-w-lg p-2 sm:p-6">
          <div className="flex justify-center mb-6">
            <button
              className={`px-4 py-2 rounded-l-lg font-bold text-base transition-all duration-200 ${authTab === 'login' ? 'bg-blue-500 text-white shadow' : 'bg-white text-blue-700 border border-blue-200'}`}
              onClick={() => setAuthTab('login')}
            >
              Login
            </button>
            <button
              className={`px-4 py-2 rounded-r-lg font-bold text-base transition-all duration-200 ${authTab === 'signup' ? 'bg-blue-500 text-white shadow' : 'bg-white text-blue-700 border border-blue-200'}`}
              onClick={() => setAuthTab('signup')}
            >
              Sign Up
            </button>
          </div>
          {authTab === 'login' ? (
            <LoginForm
              onClose={() => setAuthTab('signup')}
              onSuccess={() => setAuthOpen(false)}
            />
          ) : (
            <SignupForm
              onClose={() => setAuthTab('login')}
              onSuccess={() => setAuthOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}