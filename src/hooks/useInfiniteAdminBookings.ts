import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { apiRequest, HttpMethod } from "@/services/api";

interface AdminBooking {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledAt: string;
  serviceAddress: string;
  totalAmount: number;
  finalAmount: number;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    latitude?: number;
    longitude?: number;
  };
  service: {
    id: string;
    name: string;
    category: string;
    basePrice: number;
  };
  maid?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

interface AdminBookingsResponse {
  success: boolean;
  data: AdminBooking[];
  pageInfo: {
    nextCursor: string | null;
    hasNextPage: boolean;
    pageSize: number;
  };
}

interface UseInfiniteAdminBookingsParams {
  status?: string;
  search?: string;
  limit?: number;
}

export const useInfiniteAdminBookings = (params: UseInfiniteAdminBookingsParams = {}) => {
  const { status = 'pending', search = '', limit = 15 } = params;

  const queryKey = useMemo(() => 
    ["admin", "bookings", "infinite", status, search, limit], 
    [status, search, limit]
  );

  const fetchPage = async ({ pageParam }: { pageParam?: string | null }) => {
    const queryParams = new URLSearchParams();
    if (pageParam) queryParams.set('cursor', pageParam);
    if (limit) queryParams.set('limit', String(limit));
    if (status && status !== 'all') queryParams.set('status', status);
    if (search) queryParams.set('search', search);

    const url = `/admin/pending-bookings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return apiRequest<AdminBookingsResponse>(url, {
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

  const items: AdminBooking[] = useMemo(() => {
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
