import { apiRequest, HttpMethod, ApiResponse, API_ENDPOINTS } from './api';

export interface AutomaticBooking {
  id: string;
  customerId: string;
  maidId?: string;
  subscriptionId?: string;
  serviceId: string;
  scheduledAt: string;
  status: 'SCHEDULED' | 'SENT_TO_MAID' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED' | 'PENDING' | 'ASSIGNED';
  assignmentStatus?: 'PENDING_ASSIGNMENT' | 'ASSIGNED_PENDING_RESPONSE' | 'ACCEPTED' | 'REJECTED' | 'REASSIGNED';
  isAutomatic?: boolean;
  rejectionReason?: string;
  reassignmentCount: number;
  createdAt: string;
  updatedAt: string;
  timeSlot?: string;
  serviceAddress?: string;
  totalAmount?: number;
  finalAmount?: number;
  specialInstructions?: string;
  assignedAt?: string;
  maidResponseAt?: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  service: {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    category: string;
    baseDuration: number;
  };
  maid?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    rating: number;
  };
  lastRejectedBy?: {
    maidId: string;
    maidName: string;
    rejectionReason: string;
    rejectedAt: string;
  };
  subscription?: {
    id: string;
    planName: string;
    status: string;
  };
}

export interface AutomaticBookingSettings {
  customerId: string;
  isEnabled: boolean;
  preferredTimeSlot: string;
  preferredDays: string[]; // ['monday', 'tuesday', etc.]
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  nextScheduledDate?: string;
  lastBookingDate?: string;
  pausedUntil?: string; // Buffer period end date
}

export interface BookingScheduleInfo {
  customerId: string;
  customerName: string;
  maidName: string;
  nextBookingDate: string;
  isInBufferPeriod: boolean;
  bufferEndDate?: string;
  totalScheduledBookings: number;
  lastBookingStatus: string;
}

export class AutomaticBookingService {
  /**
   * Get all automatic bookings for admin dashboard
   */
  static async getAutomaticBookings(
    page = 1,
    limit = 20,
    filters?: {
      status?: string;
      assignmentStatus?: string;
      customerId?: string;
      maidId?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<ApiResponse<{ bookings: AutomaticBooking[], pagination: any }>> {
    try {
      let url = `/automatic-bookings?page=${page}&limit=${limit}`;
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) url += `&${key}=${value}`;
        });
      }

      return await apiRequest<{ bookings: AutomaticBooking[], pagination: any }>(url, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get automatic bookings error:', error);
      throw error;
    }
  }

  /**
   * Create automatic booking for a specific customer (admin)
   */
  static async createAutomaticBooking(data: {
    customerId: string;
    serviceId: string;
    scheduledDate: string;
    notes?: string;
  }): Promise<ApiResponse<any>> {
    try {
      return await apiRequest<any>(API_ENDPOINTS.AUTOMATIC_BOOKINGS.CREATE, {
        method: HttpMethod.POST,
        body: data,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Create automatic booking error:', error);
      throw error;
    }
  }

  /**
   * Create daily automatic bookings (admin)
   */
  static async createDailyAutomaticBookings(data: {
    date?: string;
    serviceId?: string;
  }): Promise<ApiResponse<any>> {
    try {
      return await apiRequest<any>(API_ENDPOINTS.AUTOMATIC_BOOKINGS.CREATE_DAILY, {
        method: HttpMethod.POST,
        body: data,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Create daily automatic bookings error:', error);
      throw error;
    }
  }

  /**
   * Get eligible customers for automatic bookings (admin)
   */
  static async getEligibleCustomers(): Promise<ApiResponse<any>> {
    try {
      return await apiRequest<any>(API_ENDPOINTS.AUTOMATIC_BOOKINGS.ELIGIBLE_CUSTOMERS, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get eligible customers error:', error);
      throw error;
    }
  }

  /**
   * Get bookings that need maid assignment (admin)
   */
  static async getPendingAssignmentBookings(): Promise<ApiResponse<AutomaticBooking[]>> {
    try {
      return await apiRequest<AutomaticBooking[]>(API_ENDPOINTS.ASSIGNMENTS.PENDING_ASSIGNMENTS, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get pending assignment bookings error:', error);
      throw error;
    }
  }

  /**
   * Get bookings that need reassignment (admin)
   */
  static async getReassignmentBookings(): Promise<ApiResponse<AutomaticBooking[]>> {
    try {
      return await apiRequest<AutomaticBooking[]>(API_ENDPOINTS.ASSIGNMENTS.REASSIGNMENT_BOOKINGS, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get reassignment bookings error:', error);
      throw error;
    }
  }

  // NOTE: Admin send-to-maid / reassign / settings / pause / resume endpoints are not implemented in the backend.
  // Admin assignment/reassignment is handled via /assignments/admin/* endpoints.

  /**
   * Get maid's automatic booking assignments
   */
  static async getMaidAutomaticBookings(): Promise<ApiResponse<AutomaticBooking[]>> {
    try {
      return await apiRequest<AutomaticBooking[]>('/automatic-bookings/my-assignments', {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get maid automatic bookings error:', error);
      throw error;
    }
  }

  /**
   * Maid accepts automatic booking
   */
  static async acceptAutomaticBooking(bookingId: string): Promise<ApiResponse<AutomaticBooking>> {
    try {
      return await apiRequest<AutomaticBooking>(`/automatic-bookings/${bookingId}/accept`, {
        method: HttpMethod.POST,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Accept automatic booking error:', error);
      throw error;
    }
  }

  /**
   * Maid rejects automatic booking
   */
  static async rejectAutomaticBooking(
    bookingId: string,
    rejectionReason: string
  ): Promise<ApiResponse<AutomaticBooking>> {
    try {
      return await apiRequest<AutomaticBooking>(`/automatic-bookings/${bookingId}/reject`, {
        method: HttpMethod.POST,
        body: { rejectionReason },
        requiresAuth: true
      });
    } catch (error) {
      console.error('Reject automatic booking error:', error);
      throw error;
    }
  }

  /**
   * Get customer's upcoming automatic bookings
   */
  static async getCustomerUpcomingBookings(): Promise<ApiResponse<AutomaticBooking[]>> {
    try {
      return await apiRequest<AutomaticBooking[]>('/automatic-bookings/my-upcoming', {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get customer upcoming bookings error:', error);
      throw error;
    }
  }

  /**
   * Cancel automatic booking (customer or admin)
   */
  static async cancelAutomaticBooking(
    bookingId: string,
    reason?: string
  ): Promise<ApiResponse<AutomaticBooking>> {
    try {
      return await apiRequest<AutomaticBooking>(`/automatic-bookings/${bookingId}/cancel`, {
        method: HttpMethod.POST,
        body: { reason },
        requiresAuth: true
      });
    } catch (error) {
      console.error('Cancel automatic booking error:', error);
      throw error;
    }
  }
}
