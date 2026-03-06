import { useQuery } from '@tanstack/react-query';
import { SubscriptionService, Subscription, SubscriptionPlan, MonthlySubscriptionStatus } from '@/services/subscriptionService';
import { subscriptionKeys } from '@/lib/queryKeys';

/** Returns the current user's subscription (or null if none). */
export function useUserSubscription(enabled = true) {
  return useQuery({
    queryKey: subscriptionKeys.mine,
    queryFn: async (): Promise<Subscription | null> => {
      const response = await SubscriptionService.getUserSubscription();
      if (!response.success) return null;
      // Normalize inconsistent response shape
      const sub =
        (response as any).subscription ??
        (response as any).data?.subscription ??
        null;
      return sub;
    },
    enabled,
    staleTime: 60_000, // subscription rarely changes mid-session
  });
}

/** Returns available subscription plans. */
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: subscriptionKeys.plans,
    queryFn: async (): Promise<SubscriptionPlan[]> => {
      const response = await SubscriptionService.getSubscriptionPlans();
      if (!response.success) return [];
      const raw = (response as any).data;
      return Array.isArray(raw) ? raw : raw?.plans ?? [];
    },
    staleTime: 300_000, // plans almost never change
  });
}

/** Returns monthly subscription status. */
export function useMonthlySubscriptionStatus(enabled = true) {
  return useQuery({
    queryKey: subscriptionKeys.monthlyStatus,
    queryFn: async (): Promise<MonthlySubscriptionStatus | null> => {
      const response = await SubscriptionService.getMonthlySubscriptionStatus();
      if (!response.success) return null;
      return (response as any).data ?? null;
    },
    enabled,
  });
}
