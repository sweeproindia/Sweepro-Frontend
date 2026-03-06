import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookingService, Booking, BookingStats } from '@/services/bookingService';
import { bookingKeys } from '@/lib/queryKeys';
import { useToast } from '@/hooks/use-toast';

export type BookingFilter = 'all' | 'scheduled' | 'completed' | 'cancelled';

/** Fetches user or maid bookings with optional filter. */
export function useUserBookings(
  role: 'CUSTOMER' | 'MAID' = 'CUSTOMER',
  filter: BookingFilter = 'all'
) {
  return useQuery({
    queryKey: bookingKeys.list({ role, filter: filter !== 'all' ? filter : undefined }),
    queryFn: async (): Promise<Booking[]> => {
      const statusFilter = filter !== 'all' ? filter : undefined;
      const response =
        role === 'CUSTOMER'
          ? await BookingService.getUserBookings(statusFilter)
          : await BookingService.getMaidBookings(statusFilter);
      if (response.success && response.data) {
        return Array.isArray(response.data) ? response.data : [];
      }
      return [];
    },
  });
}

/** Fetches booking statistics. */
export function useBookingStats() {
  return useQuery({
    queryKey: bookingKeys.stats,
    queryFn: async (): Promise<BookingStats | null> => {
      const response = await BookingService.getBookingStats();
      return response?.success ? response.data ?? null : null;
    },
  });
}

/** Cancel booking mutation with cache invalidation. */
export function useCancelBookingMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason?: string }) =>
      BookingService.cancelBooking(bookingId, reason || 'Cancelled by user'),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Booking cancelled successfully' });
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to cancel booking',
        variant: 'destructive',
      });
    },
  });
}

/** Update booking status mutation with cache invalidation. */
export function useUpdateBookingStatusMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ bookingId, status, notes }: { bookingId: string; status: string; notes?: string }) =>
      BookingService.updateBookingStatus(bookingId, { status: status as any, notes }),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Booking status updated successfully' });
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to update booking status',
        variant: 'destructive',
      });
    },
  });
}
