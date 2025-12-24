import { Footer } from '@/components/Footer';
import { FAQSection } from '@/components/landing/FAQSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { PricingSection } from '@/components/landing/PricingSection';
import SweepProAboutUs from '@/components/landing/SweepProAboutUs';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import { Navbar } from '@/components/Navbar';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/authService';

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (AuthService.isAuthenticated()) {
        try {
          // Validate token with server
          const isValid = await AuthService.refreshAuth();
          if (isValid) {
            const userData = AuthService.getStoredUser();
            setIsAuthenticated(true);
            setUser(userData);
          } else {
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (error) {
          console.error('Auth validation failed:', error);
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    };

    checkAuthStatus();
  }, []);

  // Navigate to dashboard
  const handleDashboardClick = () => {
    const userData = AuthService.getStoredUser();
    if (userData?.role === 'CUSTOMER') {
      navigate('/dashboard');
    } else if (userData?.role === 'MAID') {
      navigate('/maid-dashboard');
    } else if (userData?.role === 'ADMIN') {
      navigate('/admin-dashboard');
    }
  };

  const handlePlanSelect = (planId: string) => {
    if (isAuthenticated) {
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
        isAuthenticated={isAuthenticated}
        user={user}
      />
      <HeroSection 
        isAuthenticated={isAuthenticated}
        user={user}
        onDashboardClick={handleDashboardClick}
      />
      <SweepProAboutUs/>
      <FeaturesSection />
      <HowItWorksSection />
      
      {!isAuthenticated && (
        <PricingSection 
          isAuthenticated={isAuthenticated}
          onPlanSelect={handlePlanSelect}
        />
      )}
      
      <TestimonialsSection />
      <FAQSection />
      <Footer />

    </div>
  );
}