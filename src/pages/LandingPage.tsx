import { Footer } from '@/components/Footer';
import { FAQSection } from '@/components/landing/FAQSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { PricingSection } from '@/components/landing/PricingSection';
import SweepProAboutUs from '@/components/landing/SweepProAboutUs';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import { Navbar } from '@/components/Navbar';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { getAuthTokenType } from '@/services/api';

export default function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: contextUser, isAuthenticated: contextIsAuthenticated, authInitialized, isLoading } = useUser();

  // Handle smooth scroll when coming from other routes with target section
  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    const targetSection = state?.scrollTo;
    if (!targetSection) return;

    const scrollTimeout = window.requestAnimationFrame(() => {
      const element = document.getElementById(targetSection);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    // Clear the state so the effect doesn't run again unnecessarily
    const { scrollTo, ...rest } = state || {};
    navigate(location.pathname, { replace: true, state: Object.keys(rest).length ? rest : null });

    return () => window.cancelAnimationFrame(scrollTimeout);
  }, [location, navigate]);

  // Navigate to dashboard
  const handleDashboardClick = () => {
    if (!authInitialized || isLoading) return;
    if (!contextIsAuthenticated || !contextUser) {
      navigate('/login');
      return;
    }

    const tokenType = getAuthTokenType();
    const shouldEnforceProfileCompletion = tokenType === 'firebase' || Boolean((contextUser as any)?.firebase_uid);
    if (shouldEnforceProfileCompletion && !(contextUser as any).profile_completed) {
      navigate('/complete-profile');
      return;
    }

    if (contextUser?.role === 'CUSTOMER') {
      navigate('/dashboard');
    } else if (contextUser?.role === 'MAID') {
      navigate('/maid-dashboard');
    } else if (contextUser?.role === 'ADMIN') {
      navigate('/admin-dashboard');
    }
  };

  const handlePlanSelect = (planId: string) => {
    if (contextIsAuthenticated) {
      // User is logged in, navigate directly to subscription details
      navigate(`/subscription-details/${planId}`);
    } else {
      // User is not logged in, redirect to signup page
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar 
        isAuthenticated={contextIsAuthenticated}
        user={contextUser}
      />
      <HeroSection 
        isAuthenticated={contextIsAuthenticated}
        user={contextUser}
        onDashboardClick={handleDashboardClick}
      />
      <SweepProAboutUs/>
      <FeaturesSection />
      <HowItWorksSection />
      
      {!contextIsAuthenticated && (
        <PricingSection 
          isAuthenticated={contextIsAuthenticated}
          onPlanSelect={handlePlanSelect}
        />
      )}
      
      <TestimonialsSection />
      <FAQSection />
      <Footer />

    </div>
  );
}