import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUserSubscription } from './useSubscriptionQueries';
import { BufferService } from '@/services/bufferService';
import { bufferKeys } from '@/lib/queryKeys';

/**
 * Derives buffer status from the cached subscription query.
 * Replaces both useBufferPeriod and useBufferAccess hooks —
 * eliminates 2 redundant getUserSubscription() API calls.
 */
export function useBufferStatus() {
  const { data: subscription, isLoading } = useUserSubscription();

  return useMemo(() => {
    const isInBufferPeriod = subscription?.isInBufferPeriod ?? false;
    const hasBufferAccess = subscription?.plan?.hasBufferSystem ?? false;
    const bufferEndDate = subscription?.bufferEndDate ?? null;
    const bufferStartDate = subscription?.bufferStartDate ?? null;

    const getBufferPeriodMessage = (): string => {
      if (!isInBufferPeriod || !bufferEndDate) return '';
      const endDate = new Date(bufferEndDate).toLocaleDateString();
      return `Your services are currently paused due to an active buffer period until ${endDate}. Please wait until your buffer period ends to book new services.`;
    };

    const shouldDisableBooking = () => isInBufferPeriod;

    const getFormattedEndDate = () =>
      bufferEndDate ? new Date(bufferEndDate).toLocaleDateString() : '';

    const getFormattedStartDate = () =>
      bufferStartDate ? new Date(bufferStartDate).toLocaleDateString() : '';

    return {
      isInBufferPeriod,
      hasBufferAccess,
      bufferEndDate,
      bufferStartDate,
      isLoading,
      shouldDisableBooking,
      getBufferPeriodMessage,
      getFormattedEndDate,
      getFormattedStartDate,
    };
  }, [subscription, isLoading]);
}

/** Buffer remaining days for a specific subscription. */
export function useBufferInfo(subscriptionId: string | undefined) {
  return useQuery({
    queryKey: bufferKeys.info(subscriptionId ?? ''),
    queryFn: async () => {
      const response = await BufferService.getRemainingBufferDays(subscriptionId!);
      return response.success ? response.data : null;
    },
    enabled: !!subscriptionId,
  });
}

/** Buffer history for a specific subscription. */
export function useBufferHistory(subscriptionId: string | undefined, page = 1, limit = 5) {
  return useQuery({
    queryKey: bufferKeys.history(subscriptionId ?? '', page, limit),
    queryFn: async () => {
      const response = await BufferService.getBufferHistory(subscriptionId!, page, limit);
      return response.success ? response.data?.history ?? [] : [];
    },
    enabled: !!subscriptionId,
  });
}
