import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { DashboardService, type DashboardBooking } from "@/services/dashboardService";

export const useDashboardRecentBookings = (limit: number = 8) => {
  const queryKey = useMemo(() => ["dashboard", "recent", "bookings", limit], [limit]);

  const fetchPage = async ({ pageParam }: { pageParam?: string | null }) => {
    return DashboardService.getRecentBookings({ cursor: pageParam ?? null, limit });
  };

  const query = useInfiniteQuery({
    queryKey,
    queryFn: fetchPage,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage as any)?.data?.pageInfo?.nextCursor ?? (lastPage as any)?.pageInfo?.nextCursor ?? null,
    staleTime: 30_000,
  });

  const items: DashboardBooking[] = useMemo(() => {
    const pages = (query.data?.pages || []) as any[];
    return pages.flatMap(p => p?.data?.data || p?.data || []);
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
