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

    try {
      setBufferStatus(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Get user's subscription
      console.log('🔍 Fetching user subscription...');
      const subscriptionResponse = await SubscriptionService.getUserSubscription();
      
      console.log('🔍 Subscription response:', {
        success: subscriptionResponse.success,
        hasSubscription: !!subscriptionResponse.data?.subscription,
        subscriptionId: subscriptionResponse.data?.subscription?.id
      });
      
      if (subscriptionResponse.success && subscriptionResponse.data?.subscription) {
        const subscription = subscriptionResponse.data.subscription;
        
        // Check current buffer status
        console.log('🔍 Checking buffer status for subscription:', subscription.id);
        const bufferStatusResponse = await BufferService.checkCurrentBufferStatus(subscription.id);
        
        if (bufferStatusResponse.success) {
          const { isInBufferPeriod: inBuffer, activeBufferPeriod } = bufferStatusResponse.data;
          
          console.log('🔍 Buffer period status updated:', {
            isInBufferPeriod: inBuffer,
            activeBufferPeriod: activeBufferPeriod,
            endDate: activeBufferPeriod?.endDate,
            startDate: activeBufferPeriod?.startDate,
            fullResponse: bufferStatusResponse.data
          });
          
          setBufferStatus({
            isInBufferPeriod: inBuffer,
            bufferEndDate: activeBufferPeriod?.endDate || null,
            bufferStartDate: activeBufferPeriod?.startDate || null,
            activeBufferPeriod: activeBufferPeriod || null,
            isLoading: false,
            error: null
          });
        } else {
          console.log('🚫 Buffer status check failed:', bufferStatusResponse);
          setBufferStatus(prev => ({
            ...prev,
            isLoading: false,
            error: 'Failed to check buffer status'
          }));
        }
      } else {
        setBufferStatus(prev => ({
          ...prev,
          isLoading: false,
          error: 'No subscription found'
        }));
      }
    } catch (error) {
      console.error('🚫 Error checking buffer period status:', error);
      setBufferStatus(prev => ({
        ...prev,
        isInBufferPeriod: false,
        bufferEndDate: null,
        bufferStartDate: null,
        activeBufferPeriod: null,
        isLoading: false,
        error: 'Failed to load buffer status'
      }));
    }
  };

  // Alternative method to check buffer period using the same API call as the working fallback
  const checkBufferPeriodWithFallback = async () => {
    if (!user) return;

    try {
      console.log('🔍 Fallback buffer check...');
      const subscriptionResponse = await SubscriptionService.getUserSubscription();
      
      if (subscriptionResponse.success && subscriptionResponse.data?.subscription) {
        const subscription = subscriptionResponse.data.subscription;
        const bufferStatusResponse = await BufferService.checkCurrentBufferStatus(subscription.id);
        
        console.log('🔍 Fallback buffer check result:', {
          success: bufferStatusResponse.success,
          data: bufferStatusResponse.data
        });
        
        if (bufferStatusResponse.success && bufferStatusResponse.data.isInBufferPeriod) {
          console.log('🔍 Fallback detected active buffer period, updating state...');
          const { activeBufferPeriod } = bufferStatusResponse.data;
          
          setBufferStatus({
            isInBufferPeriod: true,
            bufferEndDate: activeBufferPeriod?.endDate || null,
            bufferStartDate: activeBufferPeriod?.startDate || null,
            activeBufferPeriod: activeBufferPeriod || null,
            isLoading: false,
            error: null
          });
        }
      }
    } catch (error) {
      console.error('🚫 Fallback buffer check failed:', error);
    }
  };

  // Check buffer status on mount and when user changes
  useEffect(() => {
    checkBufferPeriodStatus();
    
    // Also run fallback check after a short delay
    const fallbackTimer = setTimeout(() => {
      checkBufferPeriodWithFallback();
    }, 2000);
    
    return () => clearTimeout(fallbackTimer);
  }, [user]);

  // Periodic check every 30 seconds to ensure buffer status is up to date
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      console.log('🔍 Periodic buffer status check...');
      checkBufferPeriodStatus();
    }, 30000);
    
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
    const result = bufferStatus.isInBufferPeriod;
    console.log('🔍 shouldDisableBooking called:', {
      isInBufferPeriod: bufferStatus.isInBufferPeriod,
      bufferEndDate: bufferStatus.bufferEndDate,
      result
    });
    return result;
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
    checkBufferPeriodWithFallback,
    getBufferPeriodMessage,
    shouldDisableBooking,
    getFormattedEndDate,
    getFormattedStartDate,
    refresh: checkBufferPeriodStatus
  };
};
