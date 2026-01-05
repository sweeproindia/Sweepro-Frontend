import { apiRequest, API_ENDPOINTS, HttpMethod, ApiResponse } from './api';

export interface CustomerAssignmentRequest {
  id: string;
  customerId: string;
  maidId: string;
  requestedBy: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
  requestedAt: string;
  respondedAt?: string;
  rejectionReason?: string;
  notes?: string;
  expiresAt?: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
    timeSlot?: string;
  };
  maid?: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
  };
  admin?: {
    id?: string;
    name?: string;
    email?: string;
  };
}

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
    status: string;
    startDate: string;
    endDate: string;
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

interface AssignmentRequestResponse {
  requests: CustomerAssignmentRequest[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class CustomerAssignmentService {
  /**
   * Assign a maid to a customer (Admin only)
   */
  static async assignMaidToCustomer(data: AssignMaidData): Promise<ApiResponse<CustomerAssignmentRequest>> {
    try {
      return await apiRequest<CustomerAssignmentRequest>(API_ENDPOINTS.CUSTOMER_ASSIGNMENTS.ASSIGN_MAID, {
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

  /**
   * Get customer assignment requests (Admin only)
   */
  static async getAssignmentRequests(params?: {
    status?: string | string[];
    customerId?: string;
    maidId?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<AssignmentRequestResponse>> {
    try {
      const searchParams = new URLSearchParams();

      if (params?.status) {
        const statusValue = Array.isArray(params.status) ? params.status.join(',') : params.status;
        searchParams.set('status', statusValue);
      }
      if (params?.customerId) {
        searchParams.set('customerId', params.customerId);
      }
      if (params?.maidId) {
        searchParams.set('maidId', params.maidId);
      }
      if (params?.page) {
        searchParams.set('page', params.page.toString());
      }
      if (params?.limit) {
        searchParams.set('limit', params.limit.toString());
      }

      const query = searchParams.toString();
      const endpoint = query
        ? `${API_ENDPOINTS.CUSTOMER_ASSIGNMENTS.GET_ALL_REQUESTS}?${query}`
        : API_ENDPOINTS.CUSTOMER_ASSIGNMENTS.GET_ALL_REQUESTS;

      return await apiRequest<AssignmentRequestResponse>(endpoint, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get assignment requests error:', error);
      throw error;
    }
  }
}
