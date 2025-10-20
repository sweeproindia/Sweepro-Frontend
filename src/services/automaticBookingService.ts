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
      let url = `/admin/automatic-bookings?page=${page}&limit=${limit}`;
      
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

  /**
   * Send booking assignment to maid (admin)
   */
  static async sendBookingToMaid(
    bookingId: string,
    maidId?: string
  ): Promise<ApiResponse<AutomaticBooking>> {
    try {
      return await apiRequest<AutomaticBooking>(`/admin/automatic-bookings/${bookingId}/send-to-maid`, {
        method: HttpMethod.POST,
        body: maidId ? { maidId } : {},
        requiresAuth: true
      });
    } catch (error) {
      console.error('Send booking to maid error:', error);
      throw error;
    }
  }

  /**
   * Reassign booking to different maid (admin)
   */
  static async reassignBooking(
    bookingId: string,
    newMaidId: string,
    reason?: string
  ): Promise<ApiResponse<AutomaticBooking>> {
    try {
      return await apiRequest<AutomaticBooking>(`/admin/automatic-bookings/${bookingId}/reassign`, {
        method: HttpMethod.POST,
        body: { maidId: newMaidId, reason },
        requiresAuth: true
      });
    } catch (error) {
      console.error('Reassign booking error:', error);
      throw error;
    }
  }

  /**
   * Get customer's automatic booking settings
   */
  static async getCustomerBookingSettings(customerId: string): Promise<ApiResponse<AutomaticBookingSettings>> {
    try {
      return await apiRequest<AutomaticBookingSettings>(`/automatic-bookings/settings/${customerId}`, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get customer booking settings error:', error);
      throw error;
    }
  }

  /**
   * Update customer's automatic booking settings (admin)
   */
  static async updateCustomerBookingSettings(
    customerId: string,
    settings: Partial<AutomaticBookingSettings>
  ): Promise<ApiResponse<AutomaticBookingSettings>> {
    try {
      return await apiRequest<AutomaticBookingSettings>(`/admin/automatic-bookings/settings/${customerId}`, {
        method: HttpMethod.PATCH,
        body: settings,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Update customer booking settings error:', error);
      throw error;
    }
  }

  /**
   * Get upcoming booking schedule overview (admin)
   */
  static async getBookingScheduleOverview(
    days = 7
  ): Promise<ApiResponse<{ schedules: BookingScheduleInfo[], summary: any }>> {
    try {
      return await apiRequest<{ schedules: BookingScheduleInfo[], summary: any }>(
        `/admin/automatic-bookings/schedule-overview?days=${days}`,
        {
          method: HttpMethod.GET,
          requiresAuth: true
        }
      );
    } catch (error) {
      console.error('Get booking schedule overview error:', error);
      throw error;
    }
  }

  /**
   * Pause automatic bookings for customer (buffer period)
   */
  static async pauseAutomaticBookings(
    customerId: string,
    pauseUntil: string,
    reason: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    try {
      return await apiRequest<{ success: boolean }>(`/admin/automatic-bookings/${customerId}/pause`, {
        method: HttpMethod.POST,
        body: { pauseUntil, reason },
        requiresAuth: true
      });
    } catch (error) {
      console.error('Pause automatic bookings error:', error);
      throw error;
    }
  }

  /**
   * Resume automatic bookings for customer
   */
  static async resumeAutomaticBookings(customerId: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      return await apiRequest<{ success: boolean }>(`/admin/automatic-bookings/${customerId}/resume`, {
        method: HttpMethod.POST,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Resume automatic bookings error:', error);
      throw error;
    }
  }

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
