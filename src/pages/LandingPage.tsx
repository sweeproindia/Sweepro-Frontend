import { Footer } from '@/components/Footer';
import { FAQSection } from '@/components/landing/FAQSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { PricingSection } from '@/components/landing/PricingSection';
import SweepProAboutUs from '@/components/landing/SweepProAboutUs';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import { Navbar } from '@/components/Navbar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import LoginForm from '@/components/ui/LoginForm';
import SignupForm from '@/components/ui/SignupForm';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // This would come from your auth context
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Pass these to Navbar so it can trigger the modals
  const handleOpenLogin = () => setLoginOpen(true);
  const handleOpenSignup = () => setSignupOpen(true);

  const handlePlanSelect = (planId: string) => {
    if (isAuthenticated) {
      // User is logged in, navigate directly to subscription details
      navigate(`/subscription-details/${planId}`);
    } else {
      // User is not logged in, show signup modal with plan context
      setSelectedPlanId(planId);
      setSignupOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setLoginOpen(false);
    setSignupOpen(false);
    
    // If user was selecting a plan, navigate to it now
    if (selectedPlanId) {
      navigate(`/subscription-details/${selectedPlanId}`);
      setSelectedPlanId(null);
    }
  };

  const handleCloseModals = () => {
    setLoginOpen(false);
    setSignupOpen(false);
    setSelectedPlanId(null);
  };

  return (
    <div className="min-h-screen">
      <Navbar onLoginClick={handleOpenLogin} onSignupClick={handleOpenSignup} />
      <HeroSection />
      <SweepProAboutUs/>
      <FeaturesSection />
      <HowItWorksSection />
      
      <PricingSection 
        isAuthenticated={isAuthenticated}
        onPlanSelect={handlePlanSelect}
      />
      
      <TestimonialsSection />
      <FAQSection />
      <Footer />

      {/* Login Modal */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent>
          <LoginForm onClose={() => {
            setLoginOpen(false);
            setSignupOpen(true);
          }} onSuccess={handleAuthSuccess} />
        </DialogContent>
      </Dialog>
      
      {/* Signup Modal */}
      <Dialog open={signupOpen} onOpenChange={setSignupOpen}>
        <DialogContent>
          <SignupForm onClose={() => {
            setSignupOpen(false);
            setLoginOpen(true);
          }} onSuccess={handleAuthSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}