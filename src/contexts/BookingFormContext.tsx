import React, { createContext, useContext, useState, useCallback } from 'react';
import { QuickBookingForm } from '@/components/forms/QuickBookingForm';
import { useUser } from '@/contexts/UserContext';
import { SubscriptionService } from '@/services/subscriptionService';
import { useToast } from '@/hooks/use-toast';

interface BookingFormContextType {
  isOpen: boolean;
  openBookingForm: (date?: Date) => void;
  closeBookingForm: () => void;
  prefilledDate?: Date;
}

const BookingFormContext = createContext<BookingFormContextType | undefined>(undefined);

interface BookingFormProviderProps {
  children: React.ReactNode;
  onBookingSuccess?: () => void;
}

export const BookingFormProvider: React.FC<BookingFormProviderProps> = ({ 
  children, 
  onBookingSuccess 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState<Date | undefined>(undefined);
  const { user, isAuthenticated } = useUser();
  const { toast } = useToast();

  const openBookingForm = useCallback((date?: Date) => {
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to book a service.',
        variant: 'destructive'
      });
      return;
    }

    // Check if user has active subscription (for subscription-based services)
    // This can be enhanced based on your business logic
    setPrefilledDate(date);
    setIsOpen(true);
  }, [isAuthenticated, user, toast]);

  const closeBookingForm = useCallback(() => {
    setIsOpen(false);
    setPrefilledDate(undefined);
  }, []);

  const handleBookingSuccess = useCallback(async () => {
    closeBookingForm();
    
    // Call the callback if provided (for refreshing dashboard data, etc.)
    if (onBookingSuccess) {
      onBookingSuccess();
    }

    toast({
      title: 'Booking Created!',
      description: 'Your booking has been successfully created.',
    });
  }, [closeBookingForm, onBookingSuccess, toast]);

  const handleBookingFormClose = useCallback(() => {
    closeBookingForm();
  }, [closeBookingForm]);

  const contextValue: BookingFormContextType = {
    isOpen,
    openBookingForm,
    closeBookingForm,
    prefilledDate
  };

  return (
    <BookingFormContext.Provider value={contextValue}>
      {children}
      
      {/* Global QuickBookingForm Modal */}
      <QuickBookingForm
        isOpen={isOpen}
        onClose={handleBookingFormClose}
        onSuccess={handleBookingSuccess}
        prefilledDate={prefilledDate}
      />
    </BookingFormContext.Provider>
  );
};

export const useBookingForm = (): BookingFormContextType => {
  const context = useContext(BookingFormContext);
  if (context === undefined) {
    throw new Error('useBookingForm must be used within a BookingFormProvider');
  }
  return context;
};

// HOC for components that need booking functionality
export const withBookingForm = <P extends object>(
  Component: React.ComponentType<P>,
  onBookingSuccess?: () => void
) => {
  const WithBookingFormComponent: React.FC<P> = (props) => (
    <BookingFormProvider onBookingSuccess={onBookingSuccess}>
      <Component {...props} />
    </BookingFormProvider>
  );

  WithBookingFormComponent.displayName = `withBookingForm(${Component.displayName || Component.name})`;
  return WithBookingFormComponent;
};
