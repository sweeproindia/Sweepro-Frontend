import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { SubscriptionService } from '@/services/subscriptionService';

interface BufferAccessState {
  hasBufferAccess: boolean;
  isLoading: boolean;
  error: string | null;
}

// Cache the buffer access check to avoid repeated API calls
let cachedBufferAccess: BufferAccessState | null = null;
let lastUserId: string | null = null;

export const useBufferAccess = () => {
  const { user } = useUser();
  const [bufferAccess, setBufferAccess] = useState<BufferAccessState>(() => {
    // Return cached result if available for the same user
    if (cachedBufferAccess && lastUserId === user?.id) {
      return cachedBufferAccess;
    }
    return { hasBufferAccess: false, isLoading: true, error: null };
  });

  useEffect(() => {
    // Skip if user is the same as last check and we have cached data
    if (cachedBufferAccess && lastUserId === user?.id) {
      return;
    }

    const checkBufferAccess = async () => {
      if (!user) {
        const state = { hasBufferAccess: false, isLoading: false, error: null };
        setBufferAccess(state);
        cachedBufferAccess = state;
        lastUserId = null;
        return;
      }

      // Subscription plans/buffer access are CUSTOMER-only concerns
      if (user.role !== 'CUSTOMER') {
        const state = { hasBufferAccess: false, isLoading: false, error: null };
        setBufferAccess(state);
        cachedBufferAccess = state;
        lastUserId = user.id;
        return;
      }

      setBufferAccess(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await SubscriptionService.getUserSubscription();
        if (response.success) {
          const subscription = response.data?.subscription || (response as any).subscription;
          const plan = subscription?.plan;
          const hasAccess = plan?.hasBufferSystem === true;
          
          const state = { hasBufferAccess: hasAccess, isLoading: false, error: null };
          setBufferAccess(state);
          cachedBufferAccess = state;
          lastUserId = user.id;
        } else {
          const state = { hasBufferAccess: false, isLoading: false, error: 'Failed to fetch subscription' };
          setBufferAccess(state);
          cachedBufferAccess = state;
          lastUserId = user.id;
        }
      } catch (error) {
        console.error('Error checking buffer access:', error);
        const state = { hasBufferAccess: false, isLoading: false, error: 'Error checking buffer access' };
        setBufferAccess(state);
        cachedBufferAccess = state;
        lastUserId = user.id;
      }
    };

    checkBufferAccess();
  }, [user]);

  // Function to manually clear cache (useful after subscription changes)
  const clearCache = () => {
    cachedBufferAccess = null;
    lastUserId = null;
  };

  return { ...bufferAccess, clearCache };
};
