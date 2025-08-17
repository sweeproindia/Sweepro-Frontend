import { useState, useEffect, useCallback } from 'react';
import { BookingService, Booking, BookingStats } from '../services/bookingService';
import { useToast } from '@/hooks/use-toast';

export type BookingFilter = 'all' | 'scheduled' | 'completed' | 'cancelled';

interface UseBookingsReturn {
  bookings: Booking[];
  stats: BookingStats | null;
  loading: boolean;
  error: string | null;
  filter: BookingFilter;
  setFilter: (filter: BookingFilter) => void;
  refreshBookings: () => Promise<void>;
  cancelBooking: (bookingId: string, reason?: string) => Promise<void>;
  updateBookingStatus: (bookingId: string, status: string, notes?: string) => Promise<void>;
}

export const useBookings = (userRole: 'CUSTOMER' | 'MAID' = 'CUSTOMER'): UseBookingsReturn => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<BookingFilter>('all');
  const { toast } = useToast();

  // Load bookings based on user role and filter
  const loadBookings = useCallback(async (statusFilter?: BookingFilter) => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      
      // Choose the right endpoint based on user role
      if (userRole === 'CUSTOMER') {
        response = await BookingService.getUserBookings(statusFilter !== 'all' ? statusFilter : undefined);
      } else {
        response = await BookingService.getMaidBookings(statusFilter !== 'all' ? statusFilter : undefined);
      }
      
      if (response.success && response.data) {
        // Handle array response or object with bookings property
        const bookingsData = Array.isArray(response.data) ? response.data : response.data;
        setBookings(bookingsData);
      } else {
        setError(response.message || 'Failed to load bookings');
        setBookings([]);
      }
    } catch (err: any) {
      console.error('Error loading bookings:', err);
      const errorMessage = err?.message || 'Failed to load bookings. Please try again.';
      setError(errorMessage);
      setBookings([]);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userRole, toast]);

  // Load booking statistics
  const loadStats = useCallback(async () => {
    try {
      const response = await BookingService.getBookingStats();
      if (response?.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
      // Don't show error for stats as it's not critical
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadBookings(filter);
    loadStats();
  }, [loadBookings, loadStats, filter]);

  // Handle filter change
  const handleFilterChange = useCallback((newFilter: BookingFilter) => {
    setFilter(newFilter);
    loadBookings(newFilter);
  }, [loadBookings]);

  // Refresh bookings
  const refreshBookings = useCallback(async () => {
    await loadBookings(filter);
    await loadStats();
  }, [loadBookings, loadStats, filter]);

  // Cancel booking
  const cancelBooking = useCallback(async (bookingId: string, reason?: string) => {
    try {
      const response = await BookingService.cancelBooking(bookingId, reason || 'Cancelled by user');
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Booking cancelled successfully",
        });
        
        // Refresh data
        await refreshBookings();
      } else {
        throw new Error(response.message || 'Failed to cancel booking');
      }
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      const errorMessage = err?.message || 'Failed to cancel booking. Please try again.';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [toast, refreshBookings]);

  // Update booking status
  const updateBookingStatus = useCallback(async (bookingId: string, status: string, notes?: string) => {
    try {
      const response = await BookingService.updateBookingStatus(bookingId, { status: status as any, notes });
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Booking status updated successfully",
        });
        
        // Refresh data
        await refreshBookings();
      } else {
        throw new Error(response.message || 'Failed to update booking status');
      }
    } catch (err: any) {
      console.error('Error updating booking status:', err);
      const errorMessage = err?.message || 'Failed to update booking status. Please try again.';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [toast, refreshBookings]);

  return {
    bookings,
    stats,
    loading,
    error,
    filter,
    setFilter: handleFilterChange,
    refreshBookings,
    cancelBooking,
    updateBookingStatus,
  };
};