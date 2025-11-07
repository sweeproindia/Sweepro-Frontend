import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { apiRequest, HttpMethod } from "@/services/api";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'MAID' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BLACKLISTED';
  address?: string;
  createdAt: string;
  updatedAt: string;
  customerProfile?: {
    id: string;
    subscription?: {
      id: string;
      status: string;
      plan: { name: string };
    };
  };
  maidProfile?: {
    id: string;
    status: string;
    rating: number;
    completedBookings: number;
  };
}

interface AdminUsersResponse {
  success: boolean;
  data: AdminUser[];
  pageInfo: {
    nextCursor: string | null;
    hasNextPage: boolean;
    pageSize: number;
  };
}

interface UseInfiniteAdminUsersParams {
  role?: string;
  status?: string;
  search?: string;
  limit?: number;
}

export const useInfiniteAdminUsers = (params: UseInfiniteAdminUsersParams = {}) => {
  const { role = 'all', status = 'all', search = '', limit = 20 } = params;

  const queryKey = useMemo(() => 
    ["admin", "users", "infinite", role, status, search, limit], 
    [role, status, search, limit]
  );

  const fetchPage = async ({ pageParam }: { pageParam?: string | null }) => {
    const queryParams = new URLSearchParams();
    if (pageParam) queryParams.set('cursor', pageParam);
    if (limit) queryParams.set('limit', String(limit));
    if (role && role !== 'all') queryParams.set('role', role);
    if (status && status !== 'all') queryParams.set('status', status);
    if (search) queryParams.set('search', search);

    const url = `/admin/users/paginated${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return apiRequest<AdminUsersResponse>(url, {
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

  const items: AdminUser[] = useMemo(() => {
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
