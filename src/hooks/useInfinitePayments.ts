import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Payment, PaymentService } from "@/services/paymentService";

export interface UseInfinitePaymentsParams {
  status?: string;
  search?: string;
  limit?: number;
}

export const useInfinitePayments = (params: UseInfinitePaymentsParams = {}) => {
  const { status = 'all', search = '', limit = 10 } = params;

  const queryKey = useMemo(() => ["payments", status, search, limit], [status, search, limit]);

  const fetchPage = async ({ pageParam }: { pageParam?: string | null }) => {
    return PaymentService.getUserPaymentsPage({ cursor: pageParam ?? null, limit });
  };

  const query = useInfiniteQuery({
    queryKey,
    queryFn: fetchPage,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.pageInfo?.nextCursor ?? null,
    staleTime: 30_000,
  });

  const items: Payment[] = useMemo(() => {
    return (query.data?.pages || []).flatMap(p => p.data || []);
  }, [query.data]);

  return {
    items,
    pages: query.data?.pages || [],
    fetchNextPage: query.fetchNextPage,
    hasNextPage: !!query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
