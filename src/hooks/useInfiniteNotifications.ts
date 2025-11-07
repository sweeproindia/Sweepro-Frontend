import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import notificationAPI, { type Notification } from "@/services/notificationService";

export type NotificationsFilter = {
  read?: boolean;
  type?: string;
  limit?: number;
};

export const useInfiniteNotifications = (params: NotificationsFilter = {}) => {
  const { read, type, limit = 12 } = params;

  const queryKey = useMemo(() => [
    "notifications",
    read ?? "all",
    type ?? "all",
    limit
  ], [read, type, limit]);

  const fetchPage = async ({ pageParam }: { pageParam?: string | null }) => {
    const cursor = pageParam ?? null;
    const res = await notificationAPI.getNotifications({ cursor: cursor || undefined, limit, read, type } as any);
    return res;
  };

  const query = useInfiniteQuery({
    queryKey,
    queryFn: fetchPage,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      const next = (lastPage as any)?.pageInfo?.nextCursor ?? null;
      if (next !== null) return next;
      // Fallback to offset pagination if backend returned pagination instead of pageInfo
      const page = (lastPage as any)?.pagination?.page ?? 1;
      const totalPages = (lastPage as any)?.pagination?.totalPages ?? 1;
      return page < totalPages ? String(page + 1) : undefined;
    },
    staleTime: 30_000,
  });

  const items: Notification[] = useMemo(() => {
    return (query.data?.pages || []).flatMap((p: any) => p?.data || []);
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
