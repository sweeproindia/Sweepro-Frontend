import { apiRequest, HttpMethod, ApiResponse, API_ENDPOINTS } from './api';

// Assignment interfaces
export interface AssignmentRequest {
  id: string;
  bookingId: string;
  maidId: string;
  customerId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  requestedAt: string;
  respondedAt?: string;
  rejectionReason?: string;
  expiresAt: string;
  booking: {
    id: string;
    scheduledAt: string;
    timeSlot?: string;
    serviceAddress: string;
    specialInstructions?: string;
    totalAmount: number;
    service: {
      id: string;
      name: string;
      description: string;
      category: string;
      baseDuration: number;
    };
    customer: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
  };
}

export interface AssignmentStats {
  totalAssignments: number;
  pendingAssignments: number;
  acceptedAssignments: number;
  rejectedAssignments: number;
  completedAssignments: number;
}

export interface CreateAssignmentData {
  bookingId: string;
  maidId: string;
  expiresIn?: number; // Hours until expiration (default: 24)
}

export interface BookingForAssignment {
  id: string;
  customerId: string;
  maidId?: string;
  serviceId: string;
  status: string;
  assignmentStatus?: string;
  scheduledAt: string;
  timeSlot?: string;
  serviceAddress: string;
  totalAmount: number;
  finalAmount: number;
  specialInstructions?: string;
  assignedAt?: string;
  maidResponseAt?: string;
  rejectionReason?: string;
  reassignmentCount: number;
  lastAttempt?: {
    maidProfileId?: string;
    maidUserId?: string;
    maidName?: string;
    status?: string;
    reason?: string;
    respondedAt?: string;
  };
  service: {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    category: string;
    baseDuration: number;
  };
  customer: {
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
}

export interface AvailableMaid {
  id: string;
  maidProfileId: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  completedBookings: number;
  skills: string[];
  isAvailable: boolean;
  currentAssignments: number;
  maxDailyBookings: number;
}

// Assignment Service
class AssignmentService {
  // Get pending assignments for a maid
  async getPendingAssignments(): Promise<ApiResponse<AssignmentRequest[]>> {
    try {
      return await apiRequest<AssignmentRequest[]>(API_ENDPOINTS.ASSIGNMENTS.PENDING, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Error fetching pending assignments:', error);
      throw error;
    }
  }

  // Get all assignments for a maid
  async getMyAssignments(): Promise<ApiResponse<AssignmentRequest[]>> {
    try {
      return await apiRequest<AssignmentRequest[]>(API_ENDPOINTS.ASSIGNMENTS.MY_ASSIGNMENTS, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Error fetching assignments:', error);
      throw error;
    }
  }

  // Accept an assignment
  async acceptAssignment(assignmentId: string): Promise<ApiResponse<AssignmentRequest>> {
    try {
      return await apiRequest<AssignmentRequest>(`/assignments/${assignmentId}/accept`, {
        method: HttpMethod.POST,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Error accepting assignment:', error);
      throw error;
    }
  }

  // Reject an assignment
  async rejectAssignment(
    assignmentId: string, 
    rejectionReason: string
  ): Promise<ApiResponse<AssignmentRequest>> {
    try {
      return await apiRequest<AssignmentRequest>(`/assignments/${assignmentId}/reject`, {
        method: HttpMethod.POST,
        body: { rejectionReason },
        requiresAuth: true
      });
    } catch (error) {
      console.error('Error rejecting assignment:', error);
      throw error;
    }
  }

  // Admin: Get all assignments
  async getAllAssignments(): Promise<ApiResponse<AssignmentRequest[]>> {
    try {
      return await apiRequest<AssignmentRequest[]>('/admin/assignments', {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Error fetching all assignments:', error);
      throw error;
    }
  }

  // Admin: Create assignment for a booking
  async createAssignment(data: CreateAssignmentData): Promise<ApiResponse<AssignmentRequest>> {
    try {
      return await apiRequest<AssignmentRequest>('/admin/assignments/create', {
        method: HttpMethod.POST,
        body: data,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  }

  // Admin: Get assignment statistics
  async getAssignmentStats(): Promise<ApiResponse<AssignmentStats>> {
    try {
      return await apiRequest<AssignmentStats>('/admin/assignments/stats', {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Error fetching assignment stats:', error);
      throw error;
    }
  }

  // Get assignment by ID
  async getAssignmentById(assignmentId: string): Promise<ApiResponse<AssignmentRequest>> {
    try {
      return await apiRequest<AssignmentRequest>(`/assignments/${assignmentId}`, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Error fetching assignment:', error);
      throw error;
    }
  }

  // Admin: Cancel assignment
  async cancelAssignment(assignmentId: string): Promise<ApiResponse<AssignmentRequest>> {
    try {
      return await apiRequest<AssignmentRequest>(`/admin/assignments/${assignmentId}/cancel`, {
        method: HttpMethod.POST,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Error cancelling assignment:', error);
      throw error;
    }
  }

  // Get available maids for assignment
  async getAvailableMaids(bookingId: string): Promise<ApiResponse<AvailableMaid[]>> {
    try {
      return await apiRequest(`/assignments/admin/available-maids/${bookingId}`, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Error fetching available maids:', error);
      throw error;
    }
  }

  // Send assignment request to maid (admin)
  async sendAssignmentRequest(data: {
    bookingId: string;
    maidId: string;
    expiresIn?: number;
  }): Promise<ApiResponse<AssignmentRequest>> {
    try {
      return await apiRequest(API_ENDPOINTS.ASSIGNMENTS.SEND_ASSIGNMENT_REQUEST, {
        method: HttpMethod.POST,
        body: data,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Error sending assignment request:', error);
      throw error;
    }
  }

  // Get pending assignment bookings (admin)
  async getPendingAssignmentBookings(): Promise<ApiResponse<BookingForAssignment[]>> {
    try {
      return await apiRequest(API_ENDPOINTS.ASSIGNMENTS.PENDING_ASSIGNMENTS, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Error fetching pending assignment bookings:', error);
      throw error;
    }
  }

  // Get assigned bookings (admin)
  async getAssignedBookings(): Promise<ApiResponse<BookingForAssignment[]>> {
    try {
      return await apiRequest(API_ENDPOINTS.ASSIGNMENTS.ASSIGNED_BOOKINGS, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Error fetching assigned bookings:', error);
      throw error;
    }
  }

  // Get reassignment bookings (admin)
  async getReassignmentBookings(): Promise<ApiResponse<BookingForAssignment[]>> {
    try {
      return await apiRequest(API_ENDPOINTS.ASSIGNMENTS.REASSIGNMENT_BOOKINGS, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Error fetching reassignment bookings:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const assignmentService = new AssignmentService();
