import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { apiRequest, HttpMethod } from "@/services/api";

interface AdminMaid {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'MAID';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BLACKLISTED';
  address?: string;
  createdAt: string;
  maidProfile?: {
    id: string;
    status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    rating: number;
    completedBookings: number;
    documents: Array<{
      id: string;
      type: string;
      verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    }>;
  };
  documentVerification: {
    totalRequired: number;
    uploaded: number;
    verified: number;
    pending: number;
    completionPercentage: number;
  };
}

interface AdminMaidsResponse {
  success: boolean;
  data: AdminMaid[];
  pageInfo: {
    nextCursor: string | null;
    hasNextPage: boolean;
    pageSize: number;
  };
}

interface UseInfiniteAdminMaidsParams {
  status?: string;
  search?: string;
  limit?: number;
}

export const useInfiniteAdminMaids = (params: UseInfiniteAdminMaidsParams = {}) => {
  const { status = 'all', search = '', limit = 20 } = params;

  const queryKey = useMemo(() => 
    ["admin", "maids", "infinite", status, search, limit], 
    [status, search, limit]
  );

  const fetchPage = async ({ pageParam }: { pageParam?: string | null }) => {
    const queryParams = new URLSearchParams();
    if (pageParam) queryParams.set('cursor', pageParam);
    if (limit) queryParams.set('limit', String(limit));
    if (status && status !== 'all') queryParams.set('status', status);
    if (search) queryParams.set('search', search);

    const url = `/admin/maids/paginated${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return apiRequest<AdminMaidsResponse>(url, {
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

  const items: AdminMaid[] = useMemo(() => {
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
