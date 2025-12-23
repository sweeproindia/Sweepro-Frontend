import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { BufferService } from '@/services/bufferService';
import { SubscriptionService } from '@/services/subscriptionService';

interface BufferPeriodStatus {
  isInBufferPeriod: boolean;
  bufferEndDate: string | null;
  bufferStartDate: string | null;
  activeBufferPeriod: any | null;
  isLoading: boolean;
  error: string | null;
}

export const useBufferPeriod = () => {
  const { user } = useUser();
  const [bufferStatus, setBufferStatus] = useState<BufferPeriodStatus>({
    isInBufferPeriod: false,
    bufferEndDate: null,
    bufferStartDate: null,
    activeBufferPeriod: null,
    isLoading: true,
    error: null
  });

  const checkBufferPeriodStatus = async () => {
    if (!user) {
      setBufferStatus(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // Buffer period & subscription are CUSTOMER-only concerns
    if (user.role !== 'CUSTOMER') {
      setBufferStatus({
        isInBufferPeriod: false,
        bufferEndDate: null,
        bufferStartDate: null,
        activeBufferPeriod: null,
        isLoading: false,
        error: null
      });
      return;
    }

    // Temporarily suppress console errors for this specific call
    const originalConsoleError = console.error;
    let subscriptionResponse;
    
    try {
      setBufferStatus(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Suppress console.error only for subscription API calls
      console.error = (...args: any[]) => {
        const message = args[0]?.toString() || '';
        // Only suppress subscription-related 404 errors
        if (!message.includes('No subscription found') && 
            !message.includes('Get user subscription error') &&
            !message.includes('API Request Failed')) {
          originalConsoleError(...args);
        }
      };
      
      // Get user's subscription which includes buffer period info
      subscriptionResponse = await SubscriptionService.getUserSubscription();
      
      // Restore console.error
      console.error = originalConsoleError;
      
      if (subscriptionResponse.success && subscriptionResponse.data?.subscription) {
        const subscription = subscriptionResponse.data.subscription;
        
        // Check if subscription has buffer period flag
        const isInBuffer = subscription.isInBufferPeriod || false;
        
        setBufferStatus({
          isInBufferPeriod: isInBuffer,
          bufferEndDate: subscription.bufferEndDate || null,
          bufferStartDate: subscription.bufferStartDate || null,
          activeBufferPeriod: isInBuffer ? { 
            startDate: subscription.bufferStartDate,
            endDate: subscription.bufferEndDate 
          } : null,
          isLoading: false,
          error: null
        });
      } else {
        // No subscription found - this is normal for users without subscriptions
        setBufferStatus({
          isInBufferPeriod: false,
          bufferEndDate: null,
          bufferStartDate: null,
          activeBufferPeriod: null,
          isLoading: false,
          error: null
        });
      }
    } catch (error: any) {
      // Restore console.error in case of exception
      console.error = originalConsoleError;
      
      // Silently handle 404 errors (no subscription is normal)
      if (error?.statusCode === 404) {
        setBufferStatus({
          isInBufferPeriod: false,
          bufferEndDate: null,
          bufferStartDate: null,
          activeBufferPeriod: null,
          isLoading: false,
          error: null
        });
      } else {
        // Log other errors
        console.error('Error checking buffer period status:', error);
        setBufferStatus({
          isInBufferPeriod: false,
          bufferEndDate: null,
          bufferStartDate: null,
          activeBufferPeriod: null,
          isLoading: false,
          error: null
        });
      }
    }
  };


  // Check buffer status on mount and when user changes
  useEffect(() => {
    if (user && user.role === 'CUSTOMER') {
      checkBufferPeriodStatus();
    }
  }, [user]);

  // Periodic check every 5 minutes to ensure buffer status is up to date
  useEffect(() => {
    if (!user || user.role !== 'CUSTOMER') return;
    
    const interval = setInterval(() => {
      checkBufferPeriodStatus();
    }, 300000); // Check every 5 minutes instead of 30 seconds
    
    return () => clearInterval(interval);
  }, [user]);

  // Helper function to get buffer period message
  const getBufferPeriodMessage = (): string => {
    if (!bufferStatus.isInBufferPeriod || !bufferStatus.bufferEndDate) {
      return '';
    }
    
    const endDate = new Date(bufferStatus.bufferEndDate).toLocaleDateString();
    return `🚫 Your services are currently paused due to an active buffer period until ${endDate}. Please wait until your buffer period ends to book new services. You can view your buffer period details in your dashboard.`;
  };

  // Helper function to check if booking should be disabled
  const shouldDisableBooking = (): boolean => {
    return bufferStatus.isInBufferPeriod;
  };

  // Helper function to get buffer period end date formatted
  const getFormattedEndDate = (): string => {
    if (!bufferStatus.bufferEndDate) return '';
    return new Date(bufferStatus.bufferEndDate).toLocaleDateString();
  };

  // Helper function to get buffer period start date formatted
  const getFormattedStartDate = (): string => {
    if (!bufferStatus.bufferStartDate) return '';
    return new Date(bufferStatus.bufferStartDate).toLocaleDateString();
  };

  return {
    ...bufferStatus,
    checkBufferPeriodStatus,
    getBufferPeriodMessage,
    shouldDisableBooking,
    getFormattedEndDate,
    getFormattedStartDate,
    refresh: checkBufferPeriodStatus
  };
};
