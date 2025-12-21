import { apiRequest, API_ENDPOINTS, HttpMethod, ApiResponse } from './api';

// Types for booking - matches backend API exactly
export interface BookingData {
  scheduledDate: string; // YYYY-MM-DD format
  timeSlot?: string; // User's preferred timeslot (e.g., "09:00-12:00")
  serviceAddress?: string; // User's service address
}

// Service type matching backend schema
export interface Service {
  id: string;
  name: string;
  description: string;
  category: 'CLEANING' | 'DEEP_CLEANING' | 'MAINTENANCE' | 'SPECIAL_EVENT';
  baseDuration: number;
  basePrice: number;
  isActive: boolean;
  bufferTime?: number;
  maxDailyBookings?: number;
  isSubscriptionService: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  id: string;
  customerId: string;
  maidId?: string;
  serviceId: string;
  scheduledAt: string;
  timeSlot?: string; // Customer's preferred timeslot (e.g., "09:00-12:00")
  serviceAddress: string;
  specialInstructions?: string;
  status: 'PENDING' | 'CONFIRMED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  estimatedDuration?: number;
  totalAmount: number;
  finalAmount: number;
  discount?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  actualStartTime?: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  maid?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    rating?: number;
  };
  service?: {
    id: string;
    name: string;
    description: string;
    category: string;
    baseDuration: number;
    basePrice: number;
  };
}

export interface BookingStatusUpdate {
  bookingId: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

export interface PaymentData {
  bookingId: string;
  paymentMethod: string;
  amount: number;
}

export interface BookingStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
}

export interface BookingsResponse {
  bookings: Booking[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalBookings: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: {
    applied: string;
    available: string[];
  };
}

export class BookingService {
  /**
   * Create a new booking
   */
  static async createBooking(bookingData: BookingData): Promise<ApiResponse<{ booking: Booking }>> {
    try {
      const response = await apiRequest<{ booking: Booking }>(API_ENDPOINTS.BOOKINGS.CREATE, {
        method: HttpMethod.POST,
        body: bookingData,
        requiresAuth: true
      });
      
      return response;
    } catch (error) {
      console.error('Create booking error:', error);
      
      // Handle buffer period specific errors
      if (error.response?.data?.isInBufferPeriod) {
        const errorData = error.response.data;
        throw {
          ...error,
          isBufferPeriodError: true,
          bufferEndDate: errorData.bufferEndDate,
          bufferDaysRemaining: errorData.bufferDaysRemaining,
          bufferStartDate: errorData.bufferStartDate
        };
      }
      
      throw error;
    }
  }

  /**
   * Get user's bookings (for customers) with optional status filter
   */
  static async getUserBookings(status?: string): Promise<ApiResponse<Booking[]>> {
    try {
      const url = status ? `${API_ENDPOINTS.BOOKINGS.MY_BOOKINGS}?status=${status}` : API_ENDPOINTS.BOOKINGS.MY_BOOKINGS;
      const response = await apiRequest<BookingsResponse>(url, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
      if (response.success && response.data) {
        if ('bookings' in response.data) {
            return {
              ...response,
              data: response.data.bookings
            };
        }
        if (Array.isArray(response.data)) {
            return {
              ...response,
              data: response.data as Booking[]
            };
        }
      }
      return {
        ...response,
        data: []
      };
    } catch (error) {
      console.error('Get user bookings error:', error);
      throw error;
    }
  }

  /**
   * Get maid assignments (for service providers)
   */
  static async getMaidBookings(status?: string): Promise<ApiResponse<Booking[]>> {
    try {
      const url = status ? `${API_ENDPOINTS.BOOKINGS.MY_ASSIGNMENTS}?status=${status}` : API_ENDPOINTS.BOOKINGS.MY_ASSIGNMENTS;
      
      const response = await apiRequest<BookingsResponse>(url, {
        method: HttpMethod.GET,
        requiresAuth: true
      });

      // Handle both old and new response formats
      if (response.success && response.data) {
        if ('bookings' in response.data) {
            return {
              ...response,
              data: response.data.bookings
            };
        }
        if (Array.isArray(response.data)) {
            return {
              ...response,
              data: response.data as Booking[]
            };
        }
      }
        // If response format is unexpected, return empty array but preserve success and error info
        return {
          ...response,
          data: []
        };
    } catch (error) {
      console.error('Get maid bookings error:', error);
      throw error;
    }
  }

  /**
   * Get booking statistics
   */
  static async getBookingStats(): Promise<ApiResponse<BookingStats>> {
    try {
      return await apiRequest<BookingStats>('/bookings/stats', {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get booking stats error:', error);
      throw error;
    }
  }

  /**
   * Update booking status
   */
  static async updateBookingStatus(
    bookingId: string, 
    statusData: Omit<BookingStatusUpdate, 'bookingId'>
  ): Promise<ApiResponse<{ booking: Booking }>> {
    try {
      const endpoint = API_ENDPOINTS.BOOKINGS.UPDATE_STATUS.replace(':id', bookingId);
      return await apiRequest<{ booking: Booking }>(endpoint, {
        method: HttpMethod.PUT,
        body: statusData,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Update booking status error:', error);
      throw error;
    }
  }

  /**
   * Complete booking payment
   */
  static async completeBookingPayment(paymentData: PaymentData): Promise<ApiResponse<{ booking: Booking, payment: any }>> {
    try {
      return await apiRequest<{ booking: Booking, payment: any }>(API_ENDPOINTS.BOOKINGS.COMPLETE_PAYMENT, {
        method: HttpMethod.POST,
        body: paymentData,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Complete booking payment error:', error);
      throw error;
    }
  }

  /**
   * Get booking by ID
   */
  static async getBookingById(bookingId: string): Promise<ApiResponse<{ booking: Booking }>> {
    try {
      return await apiRequest<{ booking: Booking }>(`/bookings/${bookingId}`, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get booking by ID error:', error);
      throw error;
    }
  }

  /**
   * Cancel booking
   */
  static async cancelBooking(bookingId: string, reason?: string): Promise<ApiResponse<{ booking: Booking }>> {
    try {
      return await apiRequest<{ booking: Booking }>(`/bookings/${bookingId}/cancel`, {
        method: HttpMethod.PUT,
        body: { reason },
        requiresAuth: true
      });
    } catch (error) {
      console.error('Cancel booking error:', error);
      throw error;
    }
  }

  /**
   * Get available time slots for a date
   */
  static async getAvailableSlots(date: string): Promise<ApiResponse<{ 
    slots: string[]; 
    isBufferPeriod?: boolean; 
    message?: string;
    bufferPeriod?: {
      startDate: string;
      endDate: string;
    };
    date?: string;
    totalSlots?: number;
    bookedSlots?: number;
    availableSlots?: number;
  }>> {
    try {
      return await apiRequest<{ 
        slots: string[]; 
        isBufferPeriod?: boolean; 
        message?: string;
        bufferPeriod?: {
          startDate: string;
          endDate: string;
        };
        date?: string;
        totalSlots?: number;
        bookedSlots?: number;
        availableSlots?: number;
      }>(`/bookings/available-slots?date=${date}`, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get available slots error:', error);
      throw error;
    }
  }

  /**
   * Get service types and pricing
   */
  static async getServiceTypes(): Promise<ApiResponse<Service[]>> {
    try {
      return await apiRequest<Service[]>(API_ENDPOINTS.SERVICES.ALL, {
        method: HttpMethod.GET,
        requiresAuth: false
      });
    } catch (error) {
      console.error('Get service types error:', error);
      throw error;
    }
  }

  /**
   * Estimate booking cost
   */
  static async estimateCost(serviceType: string, duration?: number): Promise<ApiResponse<{ estimatedCost: number }>> {
    try {
      return await apiRequest<{ estimatedCost: number }>('/bookings/estimate-cost', {
        method: HttpMethod.POST,
        body: { serviceType, duration },
        requiresAuth: true
      });
    } catch (error) {
      console.error('Estimate cost error:', error);
      throw error;
    }
  }
}