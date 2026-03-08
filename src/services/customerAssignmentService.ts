import { apiRequest, API_ENDPOINTS, HttpMethod, ApiResponse } from './api';

export interface CustomerMaidAssignment {
  id: string;
  customerId: string;
  maidId: string;
  assignedAt: string;
  isActive: boolean;
  notes?: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  maid: {
    id: string;
    name: string;
    email: string;
    phone: string;
    rating: number;
    skills: string[];
    completedBookings: number;
    weeklyOffDay?: string;
    totalRatings?: number;
  };
  subscription?: {
    id: string;
    planName: string;
    status: string;
    isActive: boolean;
  };
}

export interface CustomerAssignmentStatus {
  customerId: string;
  hasAssignment: boolean;
  hasSubscription: boolean;
  assignment?: CustomerMaidAssignment;
  subscription?: {
    id: string;
    planName: string;
    status: string;
    startDate: string;
    endDate: string;
    sessionsPerWeek?: number;
    sessionsPerMonth?: number;
    isInBufferPeriod?: boolean;
    bufferStartDate?: string;
    bufferEndDate?: string;
  };
  isInBufferPeriod: boolean;
  bufferPeriod?: {
    id: string;
    startDate: string;
    endDate: string;
    status: string;
    reason: string;
  };
  nextBookingDate?: string;
  lastBookingDate?: string;
}

export interface AssignMaidData {
  customerId: string;
  maidId: string;
  notes?: string;
}

export interface UpdateAssignmentData {
  maidId?: string;
  notes?: string;
  isActive?: boolean;
}

export class CustomerAssignmentService {
  /**
   * Assign a maid to a customer (Admin only)
   */
  static async assignMaidToCustomer(data: AssignMaidData): Promise<ApiResponse<CustomerMaidAssignment>> {
    try {
      return await apiRequest<CustomerMaidAssignment>(API_ENDPOINTS.CUSTOMER_ASSIGNMENTS.ASSIGN_MAID, {
        method: HttpMethod.POST,
        body: data,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Assign maid to customer error:', error);
      throw error;
    }
  }

  /**
   * Get customer's current maid assignment
   */
  static async getCustomerAssignment(customerId: string): Promise<ApiResponse<CustomerMaidAssignment | null>> {
    try {
      const endpoint = API_ENDPOINTS.CUSTOMER_ASSIGNMENTS.GET_ASSIGNMENT.replace(':customerId', customerId);
      return await apiRequest<CustomerMaidAssignment | null>(endpoint, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get customer assignment error:', error);
      throw error;
    }
  }

  /**
   * Update customer's maid assignment (Admin only)
   */
  static async updateCustomerAssignment(
    customerId: string,
    data: UpdateAssignmentData
  ): Promise<ApiResponse<CustomerMaidAssignment>> {
    try {
      const endpoint = API_ENDPOINTS.CUSTOMER_ASSIGNMENTS.UPDATE_ASSIGNMENT.replace(':customerId', customerId);
      return await apiRequest<CustomerMaidAssignment>(endpoint, {
        method: HttpMethod.PATCH,
        body: data,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Update customer assignment error:', error);
      throw error;
    }
  }

  /**
   * Get all customer-maid assignments (Admin only)
   */
  static async getAllCustomerAssignments(
    page = 1,
    limit = 20,
    filters?: {
      customerId?: string;
      maidId?: string;
      isActive?: boolean;
    }
  ): Promise<ApiResponse<{ assignments: CustomerMaidAssignment[], pagination: any }>> {
    try {
      let url = `${API_ENDPOINTS.CUSTOMER_ASSIGNMENTS.GET_ALL}?page=${page}&limit=${limit}`;

      if (filters) {
        if (filters.customerId) url += `&customerId=${filters.customerId}`;
        if (filters.maidId) url += `&maidId=${filters.maidId}`;
        if (filters.isActive !== undefined) url += `&isActive=${filters.isActive}`;
      }

      return await apiRequest<{ assignments: CustomerMaidAssignment[], pagination: any }>(url, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get all customer assignments error:', error);
      throw error;
    }
  }

  /**
   * Get customer status including assignment and buffer period info
   */
  static async getCustomerStatus(customerId: string): Promise<ApiResponse<CustomerAssignmentStatus>> {
    try {
      const endpoint = API_ENDPOINTS.CUSTOMER_ASSIGNMENTS.GET_CUSTOMER_STATUS.replace(':customerId', customerId);
      return await apiRequest<CustomerAssignmentStatus>(endpoint, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get customer status error:', error);
      throw error;
    }
  }

  /**
   * Remove maid assignment from customer (Admin only)
   */
  static async removeCustomerAssignment(customerId: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await this.updateCustomerAssignment(customerId, { isActive: false });
      return {
        success: true,
        message: 'Assignment removed successfully',
        data: { success: true }
      };
    } catch (error) {
      console.error('Remove customer assignment error:', error);
      throw error;
    }
  }

  /**
   * Get customers without maid assignments (Admin only)
   */
  static async getUnassignedCustomers(): Promise<ApiResponse<any[]>> {
    try {
      return await apiRequest<any[]>(`${API_ENDPOINTS.CUSTOMER_ASSIGNMENTS.GET_ALL}?unassigned=true`, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get unassigned customers error:', error);
      throw error;
    }
  }

  /**
   * Get maid's assigned customers (Admin only)
   */
  static async getMaidAssignments(maidId: string): Promise<ApiResponse<CustomerMaidAssignment[]>> {
    try {
      return await apiRequest<CustomerMaidAssignment[]>(`${API_ENDPOINTS.CUSTOMER_ASSIGNMENTS.GET_ALL}?maidId=${maidId}`, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get maid assignments error:', error);
      throw error;
    }
  }

  static async getMaidAssignedCustomers(maidId: string, page = 1, limit = 10): Promise<ApiResponse<any>> {
    try {
      // Use the actual API endpoint structure mounted under /api/admin/customer-assignments
      const endpoint = `/admin/customer-assignments/maid/${maidId}/customers?page=${page}&limit=${limit}`;
      return await apiRequest<any>(endpoint, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get maid assigned customers error:', error);
      throw error;
    }
  }
}
