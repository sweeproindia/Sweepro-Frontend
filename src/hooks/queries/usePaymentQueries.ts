import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { PaymentService, Payment } from '@/services/paymentService';
import { paymentKeys } from '@/lib/queryKeys';

interface PaymentPage {
  payments: Payment[];
  total: number;
  hasMore: boolean;
}

/**
 * Paginated payment list.
 * Uses keepPreviousData so the UI doesn't flash when changing pages.
 */
export function useUserPayments(page = 1, limit = 15) {
  return useQuery({
    queryKey: paymentKeys.list({ page, limit }),
    queryFn: async (): Promise<PaymentPage> => {
      const response = await PaymentService.getUserPayments();
      if (!response.success) return { payments: [], total: 0, hasMore: false };
      const raw = (response as any).data;
      const arr: Payment[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
          ? raw.data
          : raw?.payments ?? [];
      // Client-side pagination (backend returns all)
      const start = (page - 1) * limit;
      const slice = arr.slice(start, start + limit);
      return {
        payments: slice,
        total: arr.length,
        hasMore: start + limit < arr.length,
      };
    },
    placeholderData: keepPreviousData,
  });
}

/** Returns ALL payments for stats computation. */
export function useAllUserPayments() {
  return useQuery({
    queryKey: paymentKeys.all,
    queryFn: async (): Promise<Payment[]> => {
      const response = await PaymentService.getUserPayments();
      if (!response.success) return [];
      const raw = (response as any).data;
      return Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
          ? raw.data
          : raw?.payments ?? [];
    },
  });
}
