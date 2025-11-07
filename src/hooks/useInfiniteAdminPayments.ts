import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { apiRequest, HttpMethod } from "@/services/api";

interface AdminPayment {
  id: string;
  status: string;
  amount: number;
  description?: string;
  paymentMethod?: string;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  booking?: {
    id: string;
    scheduledAt: string;
    service: {
      name: string;
    };
  };
  subscription?: {
    id: string;
    plan: {
      name: string;
    };
  };
}

interface AdminPaymentsResponse {
  success: boolean;
  data: AdminPayment[];
  pageInfo: {
    nextCursor: string | null;
    hasNextPage: boolean;
    pageSize: number;
  };
}

interface UseInfiniteAdminPaymentsParams {
  status?: string;
  type?: string;
  search?: string;
  limit?: number;
}

export const useInfiniteAdminPayments = (params: UseInfiniteAdminPaymentsParams = {}) => {
  const { status = 'all', type = 'all', search = '', limit = 20 } = params;

  const queryKey = useMemo(() => 
    ["admin", "payments", "infinite", status, type, search, limit], 
    [status, type, search, limit]
  );

  const fetchPage = async ({ pageParam }: { pageParam?: string | null }) => {
    const queryParams = new URLSearchParams();
    if (pageParam) queryParams.set('cursor', pageParam);
    if (limit) queryParams.set('limit', String(limit));
    if (status && status !== 'all') queryParams.set('status', status);
    if (type && type !== 'all') queryParams.set('type', type);
    if (search) queryParams.set('search', search);

    const url = `/admin/payments/paginated${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return apiRequest<AdminPaymentsResponse>(url, {
      method: HttpMethod.GET,
      requiresAuth: true,
    });
  };

  const query = useInfiniteQuery({
    queryKey,
    queryFn: fetchPage,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      const response = lastPage as any;
      return response?.data?.pageInfo?.nextCursor || response?.pageInfo?.nextCursor || null;
    },
    staleTime: 30_000, // 30 seconds
  });

  const items: AdminPayment[] = useMemo(() => {
    const pages = (query.data?.pages || []) as any[];
    return pages.flatMap(page => page?.data?.data || page?.data || []);
  }, [query.data]);

  return {
    items,
    pages: query.data?.pages || [],
    fetchNextPage: query.fetchNextPage,
    hasNextPage: !!query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
