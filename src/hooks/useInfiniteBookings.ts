import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Booking, BookingService } from "@/services/bookingService";

export type BookingFilter = "all" | "scheduled" | "completed" | "cancelled";

interface UseInfiniteBookingsParams {
  userRole: "CUSTOMER" | "MAID";
  filter: BookingFilter;
  limit?: number;
}

export const useInfiniteBookings = ({ userRole, filter, limit = 10 }: UseInfiniteBookingsParams) => {
  const queryKey = useMemo(() => [
    "bookings",
    userRole,
    filter,
    limit
  ], [userRole, filter, limit]);

  const fetchPage = async ({ pageParam }: { pageParam?: string | null }) => {
    const status = filter !== "all" ? filter : undefined;
    if (userRole === "CUSTOMER") {
      return BookingService.getUserBookingsPage({ status, cursor: pageParam || null, limit });
    }
    return BookingService.getMaidBookingsPage({ status, cursor: pageParam || null, limit });
  };

  const query = useInfiniteQuery({
    queryKey,
    queryFn: fetchPage,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.pageInfo?.nextCursor ?? null,
    staleTime: 30_000,
  });

  const items: Booking[] = useMemo(() => {
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
