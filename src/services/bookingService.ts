import { apiRequest, API_ENDPOINTS, HttpMethod, ApiResponse } from './api';

// Types for booking
export interface BookingData {
  serviceType: string;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  specialInstructions?: string;
  estimatedDuration?: number;
  estimatedCost?: number;
}

export interface Booking {
  id: string;
  customerId: string;
  maidId?: string;
  serviceId: string;
  scheduledAt: string;
  serviceAddress: string;
  specialInstructions?: string;
  status: 'PENDING' | 'CONFIRMED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  estimatedDuration?: number;
  totalAmount: number;
  finalAmount: number;
  discount?: number;
  createdAt: string;
  updatedAt: string;
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

export class BookingService {
  /**
   * Create a new booking
   */
  static async createBooking(bookingData: BookingData): Promise<ApiResponse<{ booking: Booking }>> {
    try {
      return await apiRequest<{ booking: Booking }>(API_ENDPOINTS.BOOKINGS.CREATE, {
        method: HttpMethod.POST,
        body: bookingData,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Create booking error:', error);
      throw error;
    }
  }

  /**
   * Get user's bookings (for customers)
   */
  static async getUserBookings(): Promise<ApiResponse<{ bookings: Booking[] }>> {
    try {
      return await apiRequest<{ bookings: Booking[] }>(API_ENDPOINTS.BOOKINGS.MY_BOOKINGS, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get user bookings error:', error);
      throw error;
    }
  }

  /**
   * Get maid assignments (for service providers)
   */
  static async getMaidBookings(): Promise<ApiResponse<{ bookings: Booking[] }>> {
    try {
      return await apiRequest<{ bookings: Booking[] }>(API_ENDPOINTS.BOOKINGS.MY_ASSIGNMENTS, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get maid bookings error:', error);
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
      return await this.updateBookingStatus(bookingId, {
        status: 'CANCELLED',
        notes: reason
      });
    } catch (error) {
      console.error('Cancel booking error:', error);
      throw error;
    }
  }

  /**
   * Get available time slots for a date
   */
  static async getAvailableSlots(date: string): Promise<ApiResponse<{ slots: string[] }>> {
    try {
      return await apiRequest<{ slots: string[] }>(`/bookings/available-slots?date=${date}`, {
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
  static async getServiceTypes(): Promise<ApiResponse<{ services: any[] }>> {
    try {
      return await apiRequest<{ services: any[] }>('/services', {
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
